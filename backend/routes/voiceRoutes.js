// ---------------------------------------------------------------------------
// NOTE: this file did not exist in the source project handed over for this
// duplication — the frontend (Chatbot.jsx) already called POST /api/voice,
// but the matching backend route was never supplied. This is a fresh
// implementation written to match the documented behaviour:
//   - English -> Amazon Polly, voice "Kajal" (Indian-English, neural)
//   - Tamil   -> Google Translate's public TTS endpoint (no API key;
//                Polly has no Tamil voice at all)
// You'll need to add real AWS credentials to backend/.env for the English
// voice to work (see the .env comments). Tamil works with no setup at all.
// ---------------------------------------------------------------------------

const express = require("express");
const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");

const router = express.Router();

const pollyClient = new PollyClient({
  region: process.env.AWS_REGION || "ap-south-1",
  // Falls back to the default AWS credential chain if these are unset,
  // but for a simple deploy just set them directly in .env.
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

const MAX_TEXT_LENGTH = 1500;

// Streams an AWS SDK v3 Readable/Blob-like body into a single Buffer.
async function streamToBuffer(body) {
  if (Buffer.isBuffer(body)) return body;
  if (typeof body.transformToByteArray === "function") {
    // Works in both Node 18+ (undici streams) and older Node stream shims
    return Buffer.from(await body.transformToByteArray());
  }
  const chunks = [];
  for await (const chunk of body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function synthesizeEnglish(text) {
  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: "Kajal",
    Engine: "neural",
    LanguageCode: "en-IN",
  });
  const response = await pollyClient.send(command);
  return streamToBuffer(response.AudioStream);
}

// Google Translate's public "listen" endpoint. No API key required, but it
// is an undocumented, unofficial endpoint intended for translate.google.com
// itself — treat it as a free best-effort fallback, not a guaranteed SLA.
// Text is capped and chunked because this endpoint silently truncates long
// inputs (~200 characters per request).
async function synthesizeTamil(text) {
  const chunks = text.match(/.{1,180}(?:\s|$)/g) || [text];
  const buffers = [];

  for (const chunk of chunks) {
    const url =
      "https://translate.google.com/translate_tts" +
      `?ie=UTF-8&client=tw-ob&tl=ta&q=${encodeURIComponent(chunk.trim())}`;

    const response = await fetch(url, {
      headers: {
        // Some deployments of this endpoint reject requests with no UA.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
    });
    if (!response.ok) {
      throw new Error(`Google Translate TTS responded with ${response.status}`);
    }
    buffers.push(Buffer.from(await response.arrayBuffer()));
  }

  return Buffer.concat(buffers);
}

// POST /api/voice  { text, language: "english" | "tamil" } -> audio/mpeg
router.post("/", async (req, res) => {
  try {
    const { text, language } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ success: false, message: "text is required" });
    }

    const clean = text.slice(0, MAX_TEXT_LENGTH);

    const audioBuffer =
      language === "tamil" ? await synthesizeTamil(clean) : await synthesizeEnglish(clean);

    res.set("Content-Type", "audio/mpeg");
    res.set("Cache-Control", "no-store");
    return res.send(audioBuffer);
  } catch (err) {
    console.error("Error synthesizing voice:", err);
    return res.status(500).json({ success: false, message: "Voice synthesis failed" });
  }
});

module.exports = router;

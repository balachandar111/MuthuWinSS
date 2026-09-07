// ---------------------------------------------------------------------------
// REVERTED: back to Google Translate's free public TTS endpoint for Tamil
// (Sarvam AI has been removed). No API key is needed for this endpoint.
//   - English -> Amazon Polly, voice "Kajal" (Indian-English, neural).
//   - Tamil   -> Google Translate's public TTS endpoint (no API key;
//                Polly has no Tamil voice at all).
//
// VOLUME: the English voice is synthesized as SSML with a
// <prosody volume="..."> boost (see VOICE_VOLUME_DB / synthesizeEnglish
// below), so it comes back louder at the source. Google Translate's free
// TTS endpoint used for Tamil has no volume/SSML controls, so a matching
// boost for Tamil (and an extra boost on top of this one for English) is
// applied client-side instead, via a Web Audio GainNode in Chatbot.jsx.
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

// How much louder than Polly's default level the English voice is
// synthesized. Amazon Polly's neural engine supports the SSML <prosody
// volume="+XdB"> tag; keep this modest (a handful of dB) since pushing it
// too high risks audible clipping/distortion in the source audio itself.
const VOICE_VOLUME_DB = "+6dB";

// Escapes text for safe embedding inside an SSML <speak> document.
function escapeSsml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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
  // Wrapping in <prosody volume="+6dB"> raises the loudness of the
  // synthesized audio itself, on top of the client-side GainNode boost
  // applied during playback in Chatbot.jsx.
  const ssml = `<speak><prosody volume="${VOICE_VOLUME_DB}">${escapeSsml(text)}</prosody></speak>`;

  const command = new SynthesizeSpeechCommand({
    Text: ssml,
    TextType: "ssml",
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
// inputs (~200 characters per request). It has no volume/SSML controls, so
// this voice relies entirely on the client-side GainNode boost in
// Chatbot.jsx for extra loudness.
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
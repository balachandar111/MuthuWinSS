import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FLOW, STRINGS, START_NODE, PRODUCTS, STEPS } from "../data/chatFlow.js";
import "./Chatbot.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const BRAND_LOGO =
  "https://res.cloudinary.com/ds4i8pujs/image/upload/v1788588929/Chatbot/Muthu%20Win%20SS/winssLOGO_dycgke.png";

// Ambient background video played on loop behind the whole chat window.
// Muted + loop + no controls keeps it purely decorative; pointer-events are
// disabled on the <video> so it never intercepts taps/clicks.
const BACKGROUND_VIDEO_SRC =
  "https://res.cloudinary.com/ds4i8pujs/video/upload/v1788769155/Chatbot/Muthu%20Win%20SS/vidssave.com_Kangeyam_Muthu_Win_SS_Brand_Rice___TVC_-40_Sec_480P_frlel4.mp4";


const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

// ---------------------------------------------------------------------------
// VOICE VOLUME BOOST
// Both <audio>.volume and SpeechSynthesisUtterance.volume are hard-capped by
// browsers at 1.0 ("normal max") — there's no built-in way to go louder.
// To make the AI voice genuinely louder (not just "as loud as it can be
// without a boost"), backend-synthesized audio (Polly English / Google
// Translate Tamil) is routed through a Web Audio API GainNode set above 1.0
// — see getAudioGraph()/speak() below. Tweak this value to taste:
//   1.0 = no change, 1.5–2.0 = noticeably louder, higher risks clipping.
// ---------------------------------------------------------------------------
const VOICE_VOLUME_BOOST = 1.8;

// A field with a `showIf` condition is only shown (and only submitted) when
// the referenced field currently holds the expected value. Used to power
// the online/offline branch of the complaint form.
function isFieldVisible(field, values) {
  if (!field.showIf) return true;
  return values[field.showIf.key] === field.showIf.equals;
}

function getSessionId() {
  let id = sessionStorage.getItem("mws_chat_session_id");
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem("mws_chat_session_id", id);
  }
  return id;
}

function makeBotMessage(text) {
  return { id: `${Date.now()}_${Math.random()}`, sender: "bot", text };
}
function makeUserMessage(text, extra = {}) {
  return { id: `${Date.now()}_${Math.random()}`, sender: "user", text, ...extra };
}

// Kept the GrainIcon for the subtle background watermark field
function GrainIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 1.5c4.5 3 7 7.2 7 11.2 0 4.2-3.1 9.8-7 9.8s-7-5.6-7-9.8c0-4 2.5-8.2 7-11.2Z"
        fill="currentColor"
      />
      <path
        d="M12 2.5c0 6-.4 12-1.6 19"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Rice-bag illustration used when a platform doesn't allow us to source a
// real product photo (e.g. Blinkit / Amazon block scraping), and now also
// as the step-card fallback since no client cooking-step photography was
// supplied for Muthu WinSS. Drawn to match the brand palette so it still
// looks intentional, not like a broken image.
function RiceBagIllustration({ className }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mwsBagGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--mws-husk-soft)" />
          <stop offset="100%" stopColor="var(--mws-husk)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="120" height="120" rx="0" fill="url(#mwsBagGrad)" />
      <path
        d="M40 30h40l6 12c4 8 6 16 6 26 0 22-15 38-32 38s-32-16-32-38c0-10 2-18 6-26z"
        fill="#fff"
        opacity="0.92"
      />
      <path
        d="M46 30l-2-10a8 8 0 0 1 8-9h16a8 8 0 0 1 8 9l-2 10"
        fill="none"
        stroke="var(--mws-soil)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line x1="44" y1="44" x2="76" y2="44" stroke="rgba(20,20,20,0.2)" strokeWidth="2" />
      <ellipse cx="52" cy="66" rx="4.5" ry="7" fill="var(--mws-paddy)" opacity="0.85" transform="rotate(-18 52 66)" />
      <ellipse cx="64" cy="72" rx="4.5" ry="7" fill="var(--mws-paddy-deep)" opacity="0.85" transform="rotate(10 64 72)" />
      <ellipse cx="72" cy="58" rx="4.5" ry="7" fill="var(--mws-paddy)" opacity="0.85" transform="rotate(-32 72 58)" />
      <ellipse cx="58" cy="54" rx="4.5" ry="7" fill="var(--mws-husk)" opacity="0.9" transform="rotate(20 58 54)" />
    </svg>
  );
}

// Renders the cooking-step photo. No client step-by-step photography was
// supplied for Muthu WinSS (see chatFlow.js STEPS), so every step falls
// back to the rice-bag illustration below. Once real photos are added to a
// step's `image` field, this will show that photo automatically instead.
function StepVisual({ step }) {
  if (step.image) {
    return <img src={step.image} alt={step.title} className="mws-step-photo" />;
  }
  return <RiceBagIllustration className="mws-step-illustration" />;
}

function TypingBubble() {
  return (
    <div className="mws-bubble mws-bubble-bot mws-typing" aria-label="Typing">
      <span />
      <span />
      <span />
    </div>
  );
}

// Purely decorative, looping background video shown behind the whole chat
// window (header excluded, since the header paints its own opaque
// background over it). Muted + looped + no controls + pointer-events:none
// so it never grabs focus, sound, or taps.
function BackgroundVideo() {
  return (
    <div className="mws-bg-video-wrap" aria-hidden="true">
      <video
        className="mws-bg-video-iframe"
        src={BACKGROUND_VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        tabIndex={-1}
      />
      <div className="mws-bg-video-overlay" />
    </div>
  );
}


// ---------------------------------------------------------------------------
// MUTHU WINSS AI VOICE
// Reads each bot message aloud in the customer's chosen language.
//
// Primary path (both languages): our own backend, POST /api/voice, which
// synthesizes speech server-side (see backend/routes/voiceRoutes.js) and
// streams back an MP3. Nothing third-party ever loads in the browser (no
// sign-in popups) and no API keys reach the client.
//   - English -> Amazon Polly's "Kajal" voice (Indian-English, neural),
//     using your AWS account. Now synthesized with an SSML volume boost
//     server-side too (see voiceRoutes.js).
//   - Tamil -> Google's free public Translate TTS voice ("ta"). Amazon
//     Polly has no Tamil voice at all, and this endpoint needs no API key
//     or account, so it's a genuinely free AI voice for Tamil that keeps
//     the same "server does the talking, browser just plays audio"
//     architecture as English. Quality is more "Google Translate listen
//     button" than premium neural TTS, but it's real Tamil speech, not a
//     robotic browser fallback, and it costs nothing to run.
//
// VOLUME: playback of the backend-synthesized audio is routed through a Web
// Audio API GainNode (see getAudioGraph()/speak() below) set to
// VOICE_VOLUME_BOOST, so the assistant plays louder than a plain <audio>
// element's normal 0–1 volume ceiling would allow.
//
// Fallback path (only if the backend call itself fails — server down, no
// network, etc.): the browser's built-in SpeechSynthesis API, tuned to
// prefer an Indian/female voice for English, or an installed Tamil voice
// for Tamil (best-effort — most desktop browsers/OSes don't ship one,
// though Android/Chrome OS and many phones do). Lower quality, but the
// assistant never goes completely silent. Note: the Web Speech API has no
// gain/boost mechanism, so this fallback path stays at its normal max
// volume (1.0) even though the primary path is boosted.
//
// NOTE: backend/routes/voiceRoutes.js was written from scratch for this
// project (the original wasn't supplied) — see the TODOs there for the AWS
// credentials you'll need to add to backend/.env before this works.
// ---------------------------------------------------------------------------

function useMuthuWinssVoice(language) {
  const [enabled, setEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  // ---------------------------------------------------------------------
  // SEQUENTIAL SPEECH QUEUE
  // Bot messages can land back-to-back (e.g. clicking "Continue" shows a
  // reply AND immediately advances to the next question). Earlier this
  // component tried to "interrupt and play newest" on every speak() call,
  // which relied on async fetches/timers all resolving in the right order —
  // any race there let two messages talk over each other. Instead, every
  // speak() call now just pushes text onto `queueRef` and a single runner
  // (`advanceQueue`) plays one item fully to completion before starting the
  // next, so overlapping audio is impossible by construction, not by luck.
  // ---------------------------------------------------------------------
  const queueRef = useRef([]);
  const busyRef = useRef(false);

  // ---------------------------------------------------------------------
  // AUTOPLAY UNLOCK
  // Every modern browser blocks audio with sound from playing until the
  // *user* has interacted with the page at least once — there's no way
  // around this from JS, so the very first bot message (spoken the
  // instant the chat opens on page load) will usually be blocked. Instead
  // of failing silently, we detect that block, leave the message at the
  // front of the queue, and pause the queue (`needsUnlockRef`) until the
  // user's first tap/click/keypress anywhere on the page arrives — at
  // which point we simply resume the queue from where it left off.
  // `needsUnlock` (state) drives a small "tap to enable voice" hint in the
  // UI; `needsUnlockRef` is the synchronous source of truth used inside
  // the queue runner so it never acts on a stale value.
  // ---------------------------------------------------------------------
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const needsUnlockRef = useRef(false);
  const setUnlockState = (value) => {
    needsUnlockRef.current = value;
    setNeedsUnlock(value);
  };

  const voicesRef = useRef([]);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const requestIdRef = useRef(0);

  // Shared Web Audio API graph used to boost backend-synthesized playback
  // above the browser's normal 0–1 volume ceiling. Created lazily (first
  // speak() call) and reused across messages rather than rebuilt each time.
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);

  // Pending setTimeout id from the Chrome cancel()->speak() workaround
  // delay inside tryBrowserFallback (see below).
  const browserTimeoutRef = useRef(null);

  const browserSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Load browser voices for fallback
  useEffect(() => {
    if (!browserSupported) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
    };
  }, [browserSupported]);

  // Returns { voice, matchedLanguage } — matchedLanguage is false when we
  // had to fall back to a voice that doesn't actually speak the requested
  // language (most desktop browsers/OSes ship no Tamil voice at all).
  const pickBrowserVoice = (lang) => {
    const voices = voicesRef.current;
    if (!voices?.length) return { voice: null, matchedLanguage: false };

    const languageCode = lang === "tamil" ? "ta" : "en";

    // Loose matching: browsers report Tamil inconsistently — "ta-IN",
    // "ta_IN", plain "ta", or sometimes only via the voice's display name
    // ("Tamil (India)") with no usable lang tag at all.
    const langMatches = (voice) =>
      (voice.lang || "").toLowerCase().replace("_", "-").startsWith(languageCode);
    const nameMatches = (voice) =>
      languageCode === "ta" && /tamil/i.test(voice.name || "");

    const languageVoices = voices.filter((v) => langMatches(v) || nameMatches(v));

    if (languageVoices.length) {
      // Prefer an India-tagged match, then any female-sounding match.
      const indian = languageVoices.find((v) => (v.lang || "").toLowerCase().includes("in"));
      const female = languageVoices.find((v) => /female|woman/i.test(v.name || ""));
      return { voice: indian || female || languageVoices[0], matchedLanguage: true };
    }

    // No voice on this device/browser actually speaks the requested
    // language. Fall back to any female-sounding / default voice so the
    // assistant still says *something*, but flag that it's a mismatch.
    const femaleVoice = voices.find(
      (voice) => /female|woman|zira|susan|samantha|kajal|veena/i.test(voice.name)
    );
    const defaultVoice = voices.find((voice) => voice.default);
    return { voice: femaleVoice || defaultVoice || voices[0], matchedLanguage: false };
  };

  const cleanText = (text = "") =>
    text
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();

  // Chrome bug (still present in recent versions): any utterance running
  // longer than ~15s gets silently cut off unless the synth is periodically
  // paused/resumed. Longer cooking-step replies can exceed that, especially
  // when read via the slower Tamil fallback voice, so this watchdog keeps
  // long speech alive.
  useEffect(() => {
    if (!browserSupported) return;
    const keepAlive = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
    return () => clearInterval(keepAlive);
  }, [browserSupported]);

  // Lazily creates (once) and returns the shared AudioContext + GainNode
  // used to push backend-synthesized playback above the browser's normal
  // 0–1 volume ceiling. Returns null if Web Audio isn't available, in
  // which case callers should just fall back to normal <audio> volume.
  const getAudioGraph = () => {
    const AudioContextClass =
      typeof window !== "undefined" &&
      (window.AudioContext || window.webkitAudioContext);
    if (!AudioContextClass) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = VOICE_VOLUME_BOOST;
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    return { context: audioContextRef.current, gain: gainNodeRef.current };
  };

  // Cancels the Web Speech API fallback and any pending delayed speak()
  // call from tryBrowserFallback, so a stale utterance can never fire after
  // playback has already been stopped/superseded.
  const cancelBrowserSpeech = () => {
    if (browserTimeoutRef.current) {
      clearTimeout(browserTimeoutRef.current);
      browserTimeoutRef.current = null;
    }
    if (browserSupported) window.speechSynthesis.cancel();
  };

  const stopAudioElement = () => {
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // Ignore audio cleanup errors
      }
      audio.onended = null;
      audio.onerror = null;
      audio.onplay = null;
    }
    audioRef.current = null;

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // Ignore graph cleanup errors
      }
      sourceNodeRef.current = null;
    }

    if (audioUrlRef.current) {
      try {
        URL.revokeObjectURL(audioUrlRef.current);
      } catch {
        // Ignore URL cleanup errors
      }
      audioUrlRef.current = null;
    }
  };

  // Plays exactly one piece of text to completion (backend audio, falling
  // back to the browser's built-in voice), and resolves once it's fully
  // done — successfully, on error, or because playback got blocked and was
  // handed back to the queue. advanceQueue() never starts a second item
  // until this promise resolves, which is what guarantees no overlap.
  const playOne = (text) =>
    new Promise((resolve) => {
      const currentRequestId = ++requestIdRef.current;
      setSpeaking(true);

      const finish = () => {
        setSpeaking(false);
        resolve();
      };

      // Marks this text as blocked by the browser's autoplay policy: put
      // it back at the front of the queue (so it's the next thing spoken,
      // not lost) and pause the queue until the user interacts.
      const blockedByAutoplay = () => {
        queueRef.current.unshift(text);
        setUnlockState(true);
        finish();
      };

      const tryBrowserFallback = () => {
        if (currentRequestId !== requestIdRef.current) {
          finish();
          return;
        }
        if (!browserSupported) {
          finish();
          return;
        }
        try {
          window.speechSynthesis.cancel();
          if (browserTimeoutRef.current) {
            clearTimeout(browserTimeoutRef.current);
            browserTimeoutRef.current = null;
          }

          const utterance = new SpeechSynthesisUtterance(text);
          const { voice, matchedLanguage } = pickBrowserVoice(language);

          if (voice) {
            utterance.voice = voice;
            // Only force the requested lang tag when the voice actually
            // speaks it. Forcing "ta-IN" onto a mismatched (usually
            // English) voice makes Chrome silently drop the utterance.
            utterance.lang = matchedLanguage
              ? voice.lang || (language === "tamil" ? "ta-IN" : "en-IN")
              : voice.lang || "en-IN";

            if (language === "tamil" && !matchedLanguage) {
              console.warn(
                "Muthu WinSS voice: no Tamil voice is installed on this browser/device — " +
                  "falling back to the default voice so the assistant still speaks. " +
                  "Install a Tamil text-to-speech voice in your OS/browser settings for Tamil audio."
              );
            }
          } else {
            utterance.lang = language === "tamil" ? "ta-IN" : "en-IN";
          }

          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          // Web Speech API caps volume at 1.0 (its max) — no way to boost
          // this fallback path louder than "normal max" client-side.
          utterance.volume = 1;

          utterance.onstart = () => {
            setSpeaking(true);
            // We actually got sound out, so the browser allowed it.
            setUnlockState(false);
          };
          utterance.onend = () => finish();
          utterance.onerror = (e) => {
            console.error("Browser TTS error:", e?.error || e);
            // Chrome/Edge/Safari report this reason when speech was
            // blocked for lack of a user gesture (notably iOS Safari).
            if (e?.error === "not-allowed") {
              blockedByAutoplay();
              return;
            }
            finish();
          };

          // Chrome has a known bug where calling speak() in the same tick
          // as a preceding cancel() silently drops the utterance. A tiny
          // delay avoids it.
          browserTimeoutRef.current = setTimeout(() => {
            browserTimeoutRef.current = null;
            if (currentRequestId !== requestIdRef.current) {
              finish();
              return;
            }
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
          }, 40);
        } catch (error) {
          console.error("Browser TTS error:", error);
          finish();
        }
      };

      (async () => {
        try {
          // language is "english" or "tamil" — the backend picks the
          // right free AI voice for each (Polly Kajal / Google Translate
          // TTS ta).
          const response = await fetch(`${API_BASE_URL}/voice`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, language }),
          });

          if (currentRequestId !== requestIdRef.current) {
            finish();
            return;
          }
          if (!response.ok) {
            throw new Error(`Voice backend responded with ${response.status}`);
          }

          const blob = await response.blob();
          if (currentRequestId !== requestIdRef.current) {
            finish();
            return;
          }

          const url = URL.createObjectURL(blob);
          audioUrlRef.current = url;

          const audio = new Audio(url);
          audioRef.current = audio;
          audio.volume = 1; // source stays at normal max; the GainNode below does the boosting

          // Route playback through a GainNode so it can be louder than a
          // plain <audio> element's 0–1 ceiling allows — the free Google
          // Translate Tamil voice in particular tends to come back
          // quieter than Polly's English voice.
          const graph = getAudioGraph();
          if (graph) {
            try {
              if (graph.context.state === "suspended") {
                await graph.context.resume();
              }
              const source = graph.context.createMediaElementSource(audio);
              source.connect(graph.gain);
              sourceNodeRef.current = source;
            } catch (graphError) {
              console.error(
                "Muthu WinSS voice: volume boost unavailable, playing at normal volume.",
                graphError
              );
            }
          }

          audio.onplay = () => setSpeaking(true);
          audio.onended = () => {
            stopAudioElement();
            finish();
          };
          audio.onerror = (error) => {
            console.error("Muthu WinSS voice audio playback error:", error);
            stopAudioElement();
            tryBrowserFallback();
          };

          await audio.play();
          // Playback actually started, so the browser allowed it.
          setUnlockState(false);
        } catch (error) {
          console.error("Muthu WinSS backend TTS error:", error);
          if (currentRequestId !== requestIdRef.current) {
            finish();
            return;
          }

          // "NotAllowedError" means the browser blocked this
          // <audio>.play() call because it happened without a user
          // gesture (e.g. the very first message spoken automatically on
          // page load). Requeue and pause rather than trying the browser
          // fallback, since browsers that gate <audio> this way usually
          // gate speechSynthesis identically (notably iOS Safari).
          if (error?.name === "NotAllowedError") {
            blockedByAutoplay();
            return;
          }

          // Any other failure (server down, no network, etc.) — try the
          // browser's own voice instead of going silent.
          tryBrowserFallback();
        }
      })();
    });

  // Pulls the next queued message and plays it, one at a time. Never
  // starts a new item while one is already in flight (`busyRef`) or while
  // paused waiting for an autoplay unlock (`needsUnlockRef`) — this is the
  // whole mechanism that prevents two messages from ever sounding at once.
  const advanceQueue = () => {
    if (busyRef.current) return;
    if (needsUnlockRef.current) return;

    const next = queueRef.current.shift();
    if (next === undefined) return;

    busyRef.current = true;
    playOne(next).then(() => {
      busyRef.current = false;
      advanceQueue();
    });
  };

  const speak = (text) => {
    if (!enabled || !text) return;
    const clean = cleanText(text);
    if (!clean) return;
    queueRef.current.push(clean);
    advanceQueue();
  };

  const stop = () => {
    requestIdRef.current += 1; // invalidate anything currently in flight
    queueRef.current = [];
    busyRef.current = false;
    setUnlockState(false);
    stopAudioElement();
    cancelBrowserSpeech();
    setSpeaking(false);
  };

  const toggleEnabled = () => {
    setEnabled((previous) => {
      if (previous) stop();
      return !previous;
    });
  };

  // As soon as the user interacts with the page in ANY way (tap, click, or
  // keypress — doesn't have to be on the voice button), resume the queue
  // from wherever it paused. This is what makes the assistant feel like it
  // "just starts talking" on page load even though browsers require a
  // gesture first: the delay is usually imperceptible because the chat
  // window opens front-and-center and the user's first tap almost always
  // lands within it.
  useEffect(() => {
    if (!needsUnlock || !enabled) return;

    const handleFirstInteraction = () => {
      // Nudge the shared AudioContext awake — required by some browsers
      // before any MediaElementSource-routed audio (our volume boost
      // graph) will produce sound, even after the gesture happens.
      const graph = getAudioGraph();
      if (graph?.context.state === "suspended") {
        graph.context.resume().catch(() => {});
      }

      setUnlockState(false);
      advanceQueue();
    };

    const events = ["pointerdown", "touchstart", "keydown"];
    events.forEach((evt) =>
      document.addEventListener(evt, handleFirstInteraction, { once: true })
    );
    return () => {
      events.forEach((evt) =>
        document.removeEventListener(evt, handleFirstInteraction)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsUnlock, enabled]);

  return {
    supported: true,
    enabled,
    speaking,
    needsUnlock,
    speak,
    stop,
    toggleEnabled,
  };
}

export default function Chatbot() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState(START_NODE);
  const [language, setLanguage] = useState("english");
  const [formValues, setFormValues] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [typing, setTyping] = useState(false);
  const sessionId = useRef(getSessionId());
  const bottomRef = useRef(null);
  const spokenIds = useRef(new Set());

  const t = STRINGS[language];
  const voice = useMuthuWinssVoice(language);

  useEffect(() => {
    if (!open) return;
    const node = FLOW[currentNodeId];
    if (!node) return;

    setTyping(true);
    const delay = messages.length === 0 ? 250 : 500;
    const timer = setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, makeBotMessage(node.text(t))]);
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNodeId, open, language]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Speak the newest bot message aloud, once, as soon as it lands.
  // Skipped for the very first "welcome" screen ("Thank you for visiting
  // Muthu WinSS Rice 🌾") — the AI voice should only start from the next
  // message onward ("Please choose your language"). Also skipped for
  // "steps" nodes — their content is narrated step-by-step by the effect
  // below instead of reading the generic intro line.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.sender !== "bot") return;
    if (spokenIds.current.has(last.id)) return;
    spokenIds.current.add(last.id);
    if (currentNodeId === START_NODE) return;
    const node = FLOW[currentNodeId];
    if (node?.type === "steps") return;
    voice.speak(last.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Read the current cooking step (title + description) aloud whenever it
  // changes — handy when the customer's hands are busy with the rice.
  useEffect(() => {
    const node = FLOW[currentNodeId];
    if (!node || node.type !== "steps") return;
    const stepList = STEPS[node.stepsKey]?.[language] || [];
    const isClosing = stepIndex >= stepList.length;
    const step = isClosing
      ? { title: t.closingTitle, desc: t.closingMessage }
      : stepList[stepIndex];
    if (!step) return;
    voice.speak(`${step.title}. ${step.desc}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, currentNodeId, language]);

  // Reset the interactive step card back to step 1 whenever we land on a
  // new "steps" node (e.g. picking a different rice/method, or restarting).
  useEffect(() => {
    setStepIndex(0);
  }, [currentNodeId]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    } else {
      voice.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      setCurrentNodeId(START_NODE);
    }
  };

  const handleOptionClick = (option) => {
    // Get label text - handle both string and function labels
    const labelText = typeof option.label === "function" ? option.label(t) : option.label;
    setMessages((prev) => [...prev, makeUserMessage(labelText)]);

    if (option.value) {
      setLanguage(option.value);
    }

    if (option.link) {
      window.open(option.link, "_blank", "noopener,noreferrer");
      return;
    }

    if (option.next) {
      setCurrentNodeId(option.next);
    }
  };

  const handleFormChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setAttachmentError("");
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      setAttachmentError(t.attachmentBadType);
      return;
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      setAttachmentError(t.attachmentTooLarge);
      return;
    }

    setAttachmentError("");
    setAttachmentPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    });
    setAttachment(file);
  };

  // Revoke any object URL on unmount to avoid leaking memory.
  useEffect(() => {
    return () => {
      if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (attachmentError) return;
    setSubmitting(true);
    setError("");
    try {
      const currentFields = FLOW[currentNodeId]?.fields || [];
      // Only send values for fields that are actually visible right now, so
      // a stale answer from a branch the customer switched away from (e.g.
      // typing an Order ID, then changing to "Offline") never gets submitted.
      const visibleKeys = new Set(
        currentFields
          .filter((f) => isFieldVisible(f, formValues))
          .map((f) => f.key)
      );

      const payload = new FormData();
      payload.append("sessionId", sessionId.current);
      payload.append("language", language);
      Object.entries(formValues).forEach(([key, value]) => {
        if (value && visibleKeys.has(key)) payload.append(key, value);
      });
      if (attachment) {
        payload.append("attachment", attachment);
      }

      const response = await axios.post(`${API_BASE_URL}/complaints`, payload);
      const savedAttachmentUrl = response?.data?.data?.attachmentUrl || null;

      const summaryParts = Object.entries(formValues)
        .filter(([key, v]) => v && visibleKeys.has(key))
        .map(([, v]) => v);

      setMessages((prev) => [
        ...prev,
        makeUserMessage(summaryParts.join(" | ") || "(details submitted)", {
          attachmentUrl: savedAttachmentUrl,
          attachmentName: attachment?.name,
          attachmentIsImage: attachment
            ? attachment.type.startsWith("image/")
            : /\.(jpe?g|png|webp|gif)$/i.test(savedAttachmentUrl || ""),
        }),
      ]);
      setFormValues({});
      clearAttachment();
      const nextId = FLOW[currentNodeId]?.next || "thank_you";
      setCurrentNodeId(nextId);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Something went wrong while saving your details. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    voice.stop();
    setMessages([]);
    setFormValues({});
    clearAttachment();
    setLanguage("english");
    setCurrentNodeId(START_NODE);
    spokenIds.current = new Set();
  };

  if (!open) {
    return (
      <button className="mws-chat-fab" onClick={handleOpen}>
        <img src={BRAND_LOGO} alt="Muthu WinSS Logo" className="mws-fab-logo" />
        <span>Chat with us</span>
      </button>
    );
  }

  const node = FLOW[currentNodeId];

  return (
    <div className="mws-chat-fullscreen" role="dialog" aria-modal="true">
      <BackgroundVideo />

      <div className="mws-grain-field" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <GrainIcon key={i} className={`mws-grain-deco mws-grain-deco-${i}`} />
        ))}
      </div>

      <div className="mws-chat-header">
        <div className="mws-header-brand">
          <span
            className={`mws-header-badge ${
              voice.speaking ? "mws-header-badge-speaking" : ""
            }`}
          >
            <img src={BRAND_LOGO} alt="Brand Logo" className="mws-brand-img" />
          </span>
          <div className="mws-header-copy">
            <span className="mws-header-title">Muthu WinSS Rice Support</span>
            <span className="mws-header-subtitle">
              {voice.speaking ? "Speaking…" : "Field to kitchen, we're here to help"}
            </span>
          </div>
        </div>
        <div className="mws-header-actions">
          {voice.supported && (
            <button
              className="mws-header-btn"
              onClick={voice.toggleEnabled}
              title={voice.enabled ? "Mute voice" : "Unmute voice"}
              aria-label={voice.enabled ? "Mute voice" : "Unmute voice"}
            >
              {voice.enabled ? "🔊" : "🔇"}
            </button>
          )}
          <button
            className="mws-header-btn"
            onClick={handleRestart}
            title="Start over"
            aria-label="Start over"
          >
            ↺
          </button>
          <button
            className="mws-header-btn mws-header-btn-close"
            onClick={() => setOpen(false)}
            title="Close"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      {voice.needsUnlock && voice.enabled && (
        <div className="mws-voice-unlock-hint" role="status">
          🔊 Tap anywhere to turn on the AI voice assistant
        </div>
      )}

      <div className="mws-chat-body">
        <div className="mws-chat-scroll">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`mws-msg-row mws-msg-row-${m.sender}`}
            >
              {m.sender === "bot" && (
                <span className="mws-avatar">
                  <img src={BRAND_LOGO} alt="Bot" className="mws-brand-img" />
                </span>
              )}
              <div className={`mws-bubble mws-bubble-${m.sender}`}>
                {m.text}
                {m.attachmentUrl && (
                  <div className="mws-bubble-attachment">
                    {m.attachmentIsImage ? (
                      <a
                        href={m.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={m.attachmentUrl}
                          alt={m.attachmentName || "Attachment"}
                          className="mws-bubble-attachment-img"
                        />
                      </a>
                    ) : (
                      <a
                        href={m.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mws-bubble-attachment-file"
                      >
                        📄 {m.attachmentName || "View attachment"}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="mws-msg-row mws-msg-row-bot">
              <span className="mws-avatar">
                <img src={BRAND_LOGO} alt="Bot" className="mws-brand-img" />
              </span>
              <TypingBubble />
            </div>
          )}

          {!typing && node?.type === "options" && (
            <div className="mws-options">
              {node.options.map((opt) => {
                // Get label text - handle both string and function labels
                const labelText = typeof opt.label === "function" ? opt.label(t) : opt.label;
                return (
                  <button
                    key={labelText}
                    className="mws-option-chip"
                    onClick={() => handleOptionClick(opt)}
                  >
                    {labelText}
                  </button>
                );
              })}
            </div>
          )}

          {!typing && node?.type === "originality" && (
            <div className="mws-originality-card">
              <div className="mws-originality-media">
                <img
                  src={node.image}
                  alt={t[node.titleKey]}
                  className="mws-originality-photo"
                />
                <span className="mws-originality-badge">{t[node.badgeKey]}</span>
              </div>
              <div className="mws-originality-title">{t[node.titleKey]}</div>
              <div className="mws-originality-desc">{t[node.descriptionKey]}</div>
              <div className="mws-options">
                <button
                  className="mws-option-chip"
                  onClick={() => setCurrentNodeId(node.next || "language")}
                >
                  {t[node.continueKey]}
                </button>
              </div>
            </div>
          )}

          {!typing && node?.type === "products" && (
            <>
              <div className={`mws-product-grid mws-accent-${node.accent || ""}`}>
                {PRODUCTS[node.platform]?.items.map((p) => (
                  <div className="mws-product-card" key={p.url}>
                    <div className="mws-product-media">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="mws-product-photo"
                          loading="lazy"
                        />
                      ) : (
                        <RiceBagIllustration className="mws-product-illustration" />
                      )}
                      <span className="mws-product-platform-badge">
                        {PRODUCTS[node.platform]?.label}
                      </span>
                    </div>
                    <div className="mws-product-info">
                      <div className="mws-product-name">{p.name}</div>
                      <button
                        className="mws-product-btn"
                        onClick={() =>
                          window.open(p.url, "_blank", "noopener,noreferrer")
                        }
                      >
                        {t.viewProduct} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {PRODUCTS[node.platform]?.moreLink && (
                <a
                  className="mws-more-link"
                  href={PRODUCTS[node.platform].moreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.moreProducts} →
                </a>
              )}

              <div className="mws-options">
                <button
                  className="mws-option-chip"
                  onClick={() => setCurrentNodeId("main_menu")}
                >
                  {t.goBack}
                </button>
              </div>
            </>
          )}

          {!typing && node?.type === "steps" && (() => {
            const stepList = STEPS[node.stepsKey]?.[language] || [];
            const total = stepList.length;
            const isClosing = stepIndex >= total; // one virtual "done" screen past the last step
            // Closing screen uses the brand logo as its visual instead of a
            // drawn "celebrate" icon — keeps things photo-only, no icons.
            const step = isClosing
              ? { image: BRAND_LOGO, title: t.closingTitle, desc: t.closingMessage }
              : stepList[stepIndex];
            const progressCount = Math.min(stepIndex + 1, total);

            return (
              <div className="mws-step-card">
                {!isClosing && (
                  <div className="mws-step-progress" role="progressbar" aria-valuenow={progressCount} aria-valuemax={total}>
                    {stepList.map((_, i) => (
                      <span
                        key={i}
                        className={`mws-step-dot ${i <= stepIndex ? "mws-step-dot-done" : ""} ${i === stepIndex ? "mws-step-dot-active" : ""}`}
                      />
                    ))}
                  </div>
                )}

                <div className={`mws-step-visual-wrap ${isClosing ? "mws-step-visual-wrap-celebrate" : ""}`}>
                  <StepVisual step={step} />
                </div>

                {!isClosing && (
                  <div className="mws-step-counter">
                    {t.stepCounter
                      .replace("{current}", stepIndex + 1)
                      .replace("{total}", total)}
                  </div>
                )}

                <div className="mws-step-title">{step.title}</div>
                <div className="mws-step-desc">{step.desc}</div>

                <div className="mws-step-nav">
                  {!isClosing && stepIndex > 0 && (
                    <button
                      type="button"
                      className="mws-step-btn mws-step-btn-ghost"
                      onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                    >
                      ← {t.stepBack}
                    </button>
                  )}
                  {!isClosing && (
                    <button
                      type="button"
                      className="mws-step-btn mws-step-btn-primary"
                      onClick={() => setStepIndex((i) => i + 1)}
                    >
                      {stepIndex === total - 1 ? t.stepFinish : t.stepNext} →
                    </button>
                  )}
                  {isClosing && (
                    <button
                      type="button"
                      className="mws-step-btn mws-step-btn-primary"
                      onClick={() => setCurrentNodeId(node.goBack || "main_menu")}
                    >
                      {t.goBack}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {!typing && node?.type === "form" && (
            <form className="mws-form" onSubmit={handleFormSubmit}>
              <div className="mws-form-title">
                {node.title ? node.title(t) : t.formTitle}
              </div>
              {node.fields
                .filter((field) => isFieldVisible(field, formValues))
                .map((field) =>
                field.type === "file" ? (
                  <div key={field.key} className="mws-form-field">
                    <span>{t[field.labelKey]}</span>

                    {!attachment ? (
                      <label className="mws-file-dropzone">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                          onChange={handleAttachmentChange}
                        />
                        <span className="mws-file-dropzone-icon">📎</span>
                        <span className="mws-file-dropzone-text">
                          {t.attachmentChoose}
                        </span>
                        <span className="mws-file-dropzone-hint">
                          {t.attachmentHint}
                        </span>
                      </label>
                    ) : (
                      <div className="mws-file-preview">
                        {attachmentPreview ? (
                          <img
                            src={attachmentPreview}
                            alt={attachment.name}
                            className="mws-file-preview-thumb"
                          />
                        ) : (
                          <span className="mws-file-preview-icon">📄</span>
                        )}
                        <div className="mws-file-preview-info">
                          <span className="mws-file-preview-name">
                            {attachment.name}
                          </span>
                          <span className="mws-file-preview-size">
                            {(attachment.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                        <label className="mws-file-change-btn">
                          {t.attachmentChange}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                            onChange={handleAttachmentChange}
                          />
                        </label>
                        <button
                          type="button"
                          className="mws-file-remove-btn"
                          onClick={clearAttachment}
                          aria-label={t.attachmentRemove}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {attachmentError && (
                      <div className="mws-error">{attachmentError}</div>
                    )}
                  </div>
                ) : field.type === "select" ? (
                  <label key={field.key} className="mws-form-field">
                    <span>{t[field.labelKey]}</span>
                    <select
                      value={formValues[field.key] || ""}
                      required={field.required}
                      onChange={(e) =>
                        handleFormChange(field.key, e.target.value)
                      }
                    >
                      <option value="" disabled>
                        {t.selectPlaceholder}
                      </option>
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.labelKey ? t[opt.labelKey] : opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label key={field.key} className="mws-form-field">
                    <span>{t[field.labelKey]}</span>
                    {field.multiline ? (
                      <textarea
                        value={formValues[field.key] || ""}
                        required={field.required}
                        onChange={(e) =>
                          handleFormChange(field.key, e.target.value)
                        }
                        rows={3}
                      />
                    ) : (
                      <input
                        type={field.inputType || "text"}
                        value={formValues[field.key] || ""}
                        required={field.required}
                        onChange={(e) =>
                          handleFormChange(field.key, e.target.value)
                        }
                      />
                    )}
                  </label>
                )
              )}
              {error && <div className="mws-error">{error}</div>}
              <button
                type="submit"
                className="mws-submit-btn"
                disabled={submitting}
              >
                {submitting ? "Sending..." : t.submit}
              </button>
            </form>
          )}

          {!typing && node?.type === "end" && (
            <div className="mws-options">
              <button className="mws-option-chip" onClick={handleRestart}>
                {t.restart}
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
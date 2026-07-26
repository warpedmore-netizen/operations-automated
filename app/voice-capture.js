(function attachVoiceCapture(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.WorkbenchVoice = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function voiceCaptureFactory() {
  "use strict";

  const RECORDER_MIME_TYPES = Object.freeze([
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg"
  ]);

  const AUDIO_FORMATS = Object.freeze({
    "audio/flac": { mimeType: "audio/flac", extension: "flac" },
    "audio/m4a": { mimeType: "audio/mp4", extension: "m4a" },
    "audio/mp3": { mimeType: "audio/mpeg", extension: "mp3" },
    "audio/mp4": { mimeType: "audio/mp4", extension: "m4a" },
    "audio/mpeg": { mimeType: "audio/mpeg", extension: "mp3" },
    "audio/mpga": { mimeType: "audio/mpeg", extension: "mpga" },
    "audio/ogg": { mimeType: "audio/ogg", extension: "ogg" },
    "audio/wav": { mimeType: "audio/wav", extension: "wav" },
    "audio/wave": { mimeType: "audio/wav", extension: "wav" },
    "audio/webm": { mimeType: "audio/webm", extension: "webm" },
    "audio/x-m4a": { mimeType: "audio/mp4", extension: "m4a" },
    "audio/x-wav": { mimeType: "audio/wav", extension: "wav" },
    "application/ogg": { mimeType: "audio/ogg", extension: "ogg" },
    "video/mp4": { mimeType: "video/mp4", extension: "mp4" },
    "video/webm": { mimeType: "video/webm", extension: "webm" }
  });

  function normaliseMimeType(value) {
    return String(value || "").split(";", 1)[0].trim().toLowerCase();
  }

  function selectRecorderMimeType(MediaRecorderClass) {
    if (!MediaRecorderClass || typeof MediaRecorderClass.isTypeSupported !== "function") return "";
    for (const mimeType of RECORDER_MIME_TYPES) {
      try {
        if (MediaRecorderClass.isTypeSupported(mimeType)) return mimeType;
      } catch {
        // Some mobile implementations throw for a format they do not recognise.
      }
    }
    return "";
  }

  function bytesStartWith(bytes, expected) {
    if (!bytes || bytes.length < expected.length) return false;
    return expected.every((value, index) => bytes[index] === value);
  }

  function ascii(bytes, start, end) {
    if (!bytes || bytes.length < end) return "";
    return Array.from(bytes.slice(start, end), (value) => String.fromCharCode(value)).join("");
  }

  function sniffAudioFormat(bytes) {
    const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    if (ascii(view, 0, 4) === "RIFF" && ascii(view, 8, 12) === "WAVE") return AUDIO_FORMATS["audio/wav"];
    if (ascii(view, 0, 4) === "fLaC") return AUDIO_FORMATS["audio/flac"];
    if (ascii(view, 0, 4) === "OggS") return AUDIO_FORMATS["audio/ogg"];
    if (ascii(view, 0, 3) === "ID3" || (view[0] === 0xff && (view[1] & 0xe0) === 0xe0)) return AUDIO_FORMATS["audio/mpeg"];
    if (bytesStartWith(view, [0x1a, 0x45, 0xdf, 0xa3])) return AUDIO_FORMATS["audio/webm"];
    if (ascii(view, 4, 8) === "ftyp") return AUDIO_FORMATS["audio/mp4"];
    return null;
  }

  function resolveAudioFormat(contentType, bytes) {
    const normalised = normaliseMimeType(contentType);
    const declared = AUDIO_FORMATS[normalised];
    if (declared) return { ...declared, source: "content-type" };
    const detected = sniffAudioFormat(bytes);
    return detected ? { ...detected, source: "file-signature" } : null;
  }

  function formatRecordingSize(bytes) {
    const size = Math.max(0, Number(bytes) || 0);
    if (size < 1024) return `${size} bytes`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return {
    AUDIO_FORMATS,
    RECORDER_MIME_TYPES,
    formatRecordingSize,
    normaliseMimeType,
    resolveAudioFormat,
    selectRecorderMimeType,
    sniffAudioFormat
  };
});

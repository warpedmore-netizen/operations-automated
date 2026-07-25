const test = require("node:test");
const assert = require("node:assert/strict");
const voice = require("../voice-capture.js");

test("mobile recording chooses an explicitly supported transcription format", () => {
  const checked = [];
  const MediaRecorderClass = {
    isTypeSupported(value) {
      checked.push(value);
      return value === "audio/mp4";
    }
  };
  assert.equal(voice.selectRecorderMimeType(MediaRecorderClass), "audio/mp4");
  assert.ok(checked.includes("audio/webm;codecs=opus"));
  assert.ok(checked.includes("audio/mp4"));
});

test("mobile recording falls back safely when format discovery is unavailable", () => {
  assert.equal(voice.selectRecorderMimeType(undefined), "");
  assert.equal(voice.selectRecorderMimeType({}), "");
});

test("transcription upload names match Android, Safari and Samsung browser containers", () => {
  assert.deepEqual(
    voice.resolveAudioFormat("audio/webm;codecs=opus", new Uint8Array()),
    { mimeType: "audio/webm", extension: "webm", source: "content-type" }
  );
  assert.deepEqual(
    voice.resolveAudioFormat("audio/mp4;codecs=mp4a.40.2", new Uint8Array()),
    { mimeType: "audio/mp4", extension: "m4a", source: "content-type" }
  );
  assert.deepEqual(
    voice.resolveAudioFormat("audio/ogg;codecs=opus", new Uint8Array()),
    { mimeType: "audio/ogg", extension: "ogg", source: "content-type" }
  );
});

test("missing mobile MIME metadata is recovered from the recording signature", () => {
  assert.deepEqual(
    voice.resolveAudioFormat("", Uint8Array.from([0x1a, 0x45, 0xdf, 0xa3, 0x01])),
    { mimeType: "audio/webm", extension: "webm", source: "file-signature" }
  );
  assert.deepEqual(
    voice.resolveAudioFormat("application/octet-stream", Uint8Array.from([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70])),
    { mimeType: "audio/mp4", extension: "m4a", source: "file-signature" }
  );
  assert.equal(voice.resolveAudioFormat("application/octet-stream", Uint8Array.from([1, 2, 3, 4])), null);
});

test("recording diagnostics use readable sizes", () => {
  assert.equal(voice.formatRecordingSize(0), "0 bytes");
  assert.equal(voice.formatRecordingSize(2048), "2 KB");
  assert.equal(voice.formatRecordingSize(2.5 * 1024 * 1024), "2.5 MB");
});

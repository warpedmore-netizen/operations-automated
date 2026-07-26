---
id: OA-FEEDBACK-2026-07-25-007
title: Make mobile transcription observable and recoverable
status: proposed
owner: Jamie Peppard
date: 2026-07-25
feedback_type: product-change-candidate
affected_workspace: Operations Automated Workbench
submitting_user: Jamie Peppard
---

# Make mobile transcription observable and recoverable

## Source and boundary

- **Source:** Direct founder feedback after the first real phone voice attempt through the private Workbench route.
- **Conversation and message reference:** Current Codex task, 2026-07-25, request beginning “When doing the transcription”.
- **Permission:** Jamie asked Codex to review, fix and continue the next bounded improvements while he was unavailable.
- **Information boundary:** Non-confidential product behaviour and local technical metadata only. No recording or transcript is copied into this repository.
- **Authority at intake:** Product-change preparation is authorised. The feedback does not approve merge, methodology meaning, external publication or a broader connection.

## Original wording

> When doing the transcription, so I got the website to work everything on my phone. It started recording, but on stopping the recording, the transcription failed. Could you review what happened there and ensure it doesn't happen again? It could have been for one or two reasons that I think. One, because I'm doing it from my phone, the relevant application or way of translating it isn't applicable on my phone. Or number two, my device was not picked up by the application, and therefore no voice was recorded, therefore error. Again, I haven't seen the error. I'm about to head out now. So I'm going to let you run and fix that. And whilst you're at it, feel free to deliver the next set of improvements.

## Recorded evidence

- The phone and Windows computer were online in the same Tailscale network.
- Tailscale Serve reported the Workbench address as **tailnet only** and Funnel was not enabled.
- The phone reached the Workbench and the browser entered and exited its recording state.
- No successful `audio.transcribed` event or transcription usage record exists for the failed attempt.
- The pre-change server recorded only successful transcription calls, so the provider response, received byte count, browser MIME type and failure stage were lost.
- The pre-change browser discarded its only reference to the audio blob immediately after the failed transcription request.

## Jamie’s judgement

The failure may have been caused by a phone-incompatible capture/transcription route or by the microphone not delivering sound. A user should be able to see whether the microphone is active and should not lose a recording merely because transcription failed.

## AI inference

The exact first-attempt cause cannot be reconstructed because failure telemetry was absent. Both suggested causes remain plausible, together with an interrupted network or provider response. Independently of the initiating cause, loss of the recording and loss of the error evidence are confirmed product defects.

## Affected content and behaviour

- `app/app.js` mobile recording and recovery state
- `app/voice-capture.js` supported browser format selection and file-signature recovery
- `app/server.mjs` transcription validation, provider error handling and audit metadata
- composer interface, mobile styling and first-use guidance
- Workbench tests, build marker, product proposal, assurance pack and changelog

## Disposition

**Product change candidate; prepare now.**

Repair the smallest complete voice lifecycle:

1. show the selected microphone and a live sound-level signal;
2. request a browser-supported transcription container and emit recording chunks regularly;
3. recognise supported phone containers even when MIME metadata is missing;
4. keep failed audio temporarily in the originating tab and offer retry or deliberate discard;
5. return a specific user-readable failure category;
6. retain metadata-only requested, failed and completed audit events; and
7. test Android/Samsung-style WebM, Safari-style MP4/M4A, Ogg, missing MIME, empty audio and unsupported audio.

The recording itself must not be retained by the server, written to the repository or included in an audit record.

## Validation still required

- Real Samsung-phone recording with visible sound level and successful transcript.
- A forced failed request followed by successful retry without re-recording.
- Permission denied, muted or unavailable microphone recovery.
- Page refresh clears the temporary recording as stated.
- No audio bytes or transcript text appear in the SQLite audit record.

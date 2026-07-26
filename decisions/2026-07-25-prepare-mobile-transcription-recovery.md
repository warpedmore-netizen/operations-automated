---
id: OA-DECISION-2026-07-25-007
title: Prepare Mobile Transcription Recovery
status: recorded
decision: approved-for-preparation
decision_maker: Jamie Peppard
date: 2026-07-25
release_status: awaiting-review
---

# Prepare mobile transcription recovery

## Decision

Jamie Peppard reported that the first real phone recording reached Stop but transcription failed. He asked Codex to review the failure, fix it and deliver the next bounded improvements while he was unavailable.

This authorises preparation of the mobile transcription reliability and recovery change on the existing Mobile Knowledge Workbench proposal branch.

## Authority granted

- inspect metadata already retained by the local Workbench;
- harden phone-browser recording-format selection;
- add visible microphone and sound-level feedback;
- retain a failed recording temporarily in the originating browser tab for retry;
- add specific transcription error categories and metadata-only failure auditing;
- improve the in-product voice and phone recovery guide;
- add tests, feedback and assurance evidence;
- commit and push the bounded change to the existing draft pull request.

## Authority not granted

- retain audio or transcript content in server logs, audit records or the repository;
- infer methodology approval from the feedback;
- merge the draft pull request;
- approve the Mobile Knowledge Workbench release;
- publish externally;
- broaden Tailscale access, enable Funnel or change tailnet permissions;
- connect another provider or service; or
- spend money beyond ordinary use of the already configured private transcription route.

## Separate decisions still required

1. Product release and merge after Jamie reviews the plain-English outcome and real-phone evidence.
2. The still-unrecorded governance decision for the operationally active private Tailscale route.
3. Any later hosted, multi-user or external mobile access model.

Successful tests or a working phone transcript do not make any of those decisions.

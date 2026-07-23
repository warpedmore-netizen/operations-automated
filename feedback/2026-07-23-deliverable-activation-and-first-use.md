---
id: OA-FEEDBACK-2026-07-23-001
title: A deliverable is incomplete until the user can activate and use it
status: proposed
owner: Jamie Peppard
date: 2026-07-23
---

# Methodology feedback

## Source and boundary

- **Source or reference:** Direct feedback from Jamie Peppard after delivery of the local Operations Automated Workbench
- **Date received or observed:** 2026-07-23
- **User or operating context:** A locally runnable application was built and tested, but it was not left running. The handover referred to startup instructions that depended on a command unavailable in the user's shell.
- **Permission to use:** Jamie explicitly instructed that the learning be built into the methodology.
- **Confidentiality or data boundary:** Non-confidential Operations Automated project learning

## Signal

- **What was reported or observed:** The delivered application did not appear to be on. The user was told how to start it, but the stated command did not work in the actual environment. Once running, long-running actions also lacked sufficient progress feedback: recording changed a button but did not visibly show elapsed activity, while a sent request remained in the input during an unexplained wait.
- **What the person was trying to achieve:** Use the delivered application immediately.
- **Why the current method or delivery was insufficient:** Technical construction and automated tests were treated as completion without proving the user's activation path or the clarity of the first live interaction. The handover transferred an unresolved environment dependency to the user, and the interface did not continuously acknowledge work already accepted.
- **Evidence supplied:** The service was not listening when the user attempted to use it; `node` and therefore the documented `npm start` route were not available on the user's shell path. Starting with the runtime actually available to the workspace produced a verified HTTP 200 response.
- **Evidence limitations and assumptions:** This is one local delivery event. The principle should be validated across other artefact types and environments.

## Triage

- **Affected principle, lens, stage, readiness position, output or product:** Methodology output contract; delivery system; Test and Evolve stages; retained output; implementation readiness
- **People or users potentially affected:** Anyone receiving an application, automation, document workflow, integration or other executable artefact
- **Frequency or related signals:** Likely recurrent wherever builder and user environments differ
- **Consequence or urgency:** High for usability and trust; a technically correct deliverable may create no value if the user cannot activate it
- **Related feedback records:** [Methodology scope and delivery-output gap](2026-07-20-methodology-scope-and-delivery-gap.md) and [Human-AI collaboration method](2026-07-23-human-ai-collaboration-method.md)
- **Recommended next action:** Add an activation-and-first-use requirement to the output contract and delivery validation
- **Owner and review date:** Jamie Peppard; next methodology proposal review

## Disposition

- **State:** Proposed
- **Resulting proposal or decision:** [Delivery activation and first-use requirement](../proposals/delivery-activation-and-first-use-v0.1.md)
- **Reasoning:** User value occurs only when the intended user can reach and operate the result. Instructions are evidence only after they have been tested in the user's actual environment or a faithfully equivalent one.
- **Release or retained location:** Feedback and proposal retained in the controlled repository; no approved baseline changed
- **Outcome review trigger:** The next executable deliverable and the next workflow-dependent non-executable artefact should record whether activation and first useful action succeeded without unplanned user troubleshooting

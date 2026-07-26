---
id: OA-FEEDBACK-2026-07-26-AI-OWNER-WORKER
title: AI-owned Work Needs a Reliable Worker
status: recorded
version: 0.1
owner: Jamie Peppard
date: 2026-07-26
source: founder Codex conversation and live Workbench inspection
---

# AI-owned work needs a reliable worker

## Jamie's direction

Jamie clarified that assigning a Workbench action to the AI owner should cause the AI to review and carry out that action, then update the Workbench with the result. An AI-owner label that leaves the item waiting indefinitely is not the intended system.

Jamie asked whether this can operate consistently from a schedule or trigger. This is product and operating-model feedback. It contains no confidential employer, client or third-party information.

## Recorded evidence

The live Workbench exposed two open items as AI-owned on 2026-07-26:

- a Task to inventory feature-documentation coverage; and
- an approved-preparation Build Job waiting on Codex.

Both appeared under work being handled, but neither had an active worker or automatic dispatch event. The existing product model acknowledged that automatic assignment and a direct Codex connection were incomplete.

## AI interpretation

The strongest reasonable interpretation is that **ownership must be executable**:

1. an AI-owned item enters one machine-readable queue;
2. one worker claims it before acting so repeated checks do not duplicate work;
3. the worker receives the intended outcome, context, success evidence and authority boundary;
4. the worker returns structured evidence to the same Workbench item; and
5. completion, clarification or a later human decision becomes visible without Jamie moving information between tools.

The phrase "every time" is interpreted as reliable eventual pickup, not a guarantee of instant execution while Jamie's computer, Codex app or local Workbench is unavailable.

## Assumptions and boundary tests

- A scheduled local poll is the smallest currently supported mechanism. A true event-driven connection would require a separately designed and authorised integration.
- Ordinary bounded Tasks may complete after their returned evidence passes the recorded success criteria.
- A Build Job may be prepared only after its existing approval-for-preparation gate.
- Assignment does not authorise release, merge, publication, risk acceptance, spending, access changes or wider delegated authority.
- Missing outcome information must return to Jamie for clarification rather than being guessed.
- A manual copy-and-return route remains necessary for recovery when local scheduling is unavailable.

## Disposition

**Propose product correction now.**

Add a local claimable AI-owner queue, structured return checks and a recurring Codex task. Retain existing human control points and validate one ordinary Task plus one Build Job through the complete route.

## Authority and next governed action

AI may implement and test this correction on the current proposal branch and configure the requested local scheduled task. The resulting product behaviour remains proposed. Merge, product release, external connection, publication and customer use still require their existing decisions.

## Review trigger

Review after the first real AI-owned Task and approved-preparation Build Job have each been claimed, returned and correctly routed to completion or human review.

## Verification outcome

The first check found no configured recurring worker, so the manual copy-ready Codex hand-off remained the truthful route at that point. A recurring local Codex worker named **Workbench AI owner** was then configured for the existing Workbench task. Its bounded prompt was manually exercised against the live queue on 2026-07-26:

1. `OA-TASK-1E8E3FDD` appeared in `/api/ai-work`;
2. the worker claimed it through the queue-provided claim route;
3. the Workbench changed it to `in-codex` and retained the scheduled-worker claim;
4. the worker created `product/feature-documentation-inventory.md` and returned structured criterion evidence; and
5. the Workbench validated the return and changed the Task to `done`.

The recurring schedule is now configured, but availability still depends on the computer, Codex app and local Workbench. The manual hand-off remains the recovery path. Queue availability alone never counts as a claim or justifies showing work as actively handled.

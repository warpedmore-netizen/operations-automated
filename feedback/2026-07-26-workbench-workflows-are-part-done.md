---
id: OA-FEEDBACK-2026-07-26-007
title: Make Workbench workflows complete and understandable
status: proposed
owner: Jamie Peppard
date: 2026-07-26
feedback_type: product-change-candidate
affected_workspace: Operations Automated Workbench
submitting_user: Jamie Peppard
---

# Make Workbench workflows complete and understandable

## Source and boundary

- **Source:** Direct founder feedback from Jamie Peppard while using the current private Workbench.
- **Conversation reference:** Current Codex task, 2026-07-26.
- **Permission:** Jamie asked for the product workflow and daily challenge route to be corrected.
- **Information boundary:** Non-confidential Operations Automated product and methodology material.
- **Authority at intake:** Analysis, bounded product preparation, testing, branch, commit, push and draft pull request are permitted. No methodology meaning, merge, product release, publication or delegated authority is inferred.

## Jamie's judgement

The Workbench feels part-done throughout rather than complete in any one place. In particular:

- My Work names transitions but does not explain the case, its linked work, the current owner, the route to completion or the success criteria;
- work assigned to Operations Automated AI still asks Jamie to mark it done;
- saving retained feedback does not visibly complete the action;
- reviewing or preparing a methodology change exposes technical fields that should be completed automatically or by Codex;
- a prepared Build Job appears to become another blocker for Jamie;
- a previous pull request can be mistaken for the current build;
- Oppa Mate gives generic help without enough work context;
- work discussions accumulate in one long conversation; and
- the daily methodology challenge is delivered through Codex rather than through the Workbench being built for that purpose.

Jamie's product rule is to treat each area as a workflow: show where the work came from, what is happening now, who owns it, what Jamie must do, what happens next, how it completes and where the evidence is retained.

## Recorded evidence

Live review of the retained local Workbench showed:

- a Case action offered resolution while open contained work still existed;
- an AI-owned documentation Task offered **Mark task done** to Jamie;
- ordinary answer corrections remained presented as review work after they had been saved;
- a Change could show both a preparation route and a separate Build Job;
- the Decision Inbox asked Jamie for branch, pull-request, commit and test fields while a Codex Build Job already existed;
- the waiting-on-Codex Build Job was counted as blocking work;
- the source panel could show an earlier proposal pull request before the current build had returned one; and
- work help reused the current conversation rather than creating a clearly named work discussion.

## AI inference

The primary defect is not missing navigation or wording alone. The product lacks a consistent ownership-and-completion contract across its workflows. A technically valid next transition is not a useful next action if it belongs to somebody else, depends on unfinished child work or omits the evidence needed for closure.

This is a product and delivery-system correction. It does not yet justify changing approved methodology meaning: the approved principles already require useful outputs, explicit authority, activation, human-readable actions and retained learning. The product has not implemented those principles coherently enough.

## Assumptions

- **My Work** is intended primarily as Jamie's action surface, with the full inbox retaining broader system status.
- Oppa Mate and Operations Automated AI are treated as AI owners for attention routing.
- Codex remains an external builder: the Workbench can prepare and track one job but cannot honestly claim a direct autonomous Codex connection.
- A saved ordinary correction is complete when it is retained and available to later reasoning; it need not remain in Jamie's action queue.
- The daily challenge should be due after 08:00 UK time and should use one dated conversation.

## Challenge tests

### Reverse test

Hiding all AI-owned work would make the queue calm but destroy visibility. The correction therefore separates **Your actions** from **Being handled** and keeps all work searchable.

### Boundary test

Automation is appropriate for reversible routing: retain an ordinary correction, create one review for a declared change candidate and create one Build Job after an explicit preparation decision. It is not appropriate for methodology approval, release, merge, publication or risk acceptance.

### Transfer test

The same current-owner/current-step/completion-evidence contract must work for Cases, Tasks, feedback, Changes, Build Jobs, work discussions and the daily challenge. Fixing only the reported screens would repeat the partial-product failure.

### Failure test

- If a Case has open children, it must route to them and reject resolution or closure.
- If Codex owns the build, Jamie must not be shown implementation receipt fields.
- If the current build has not returned a pull request, an old pull request must not appear as the current source.
- If a challenge is being prepared, it must leave Jamie's immediate action list until it is ready.
- If feedback leaves My Work, it must remain traceable in Saved Feedback and audit history.

### Authority test

Automatic routing must never be described as approval. Jamie still decides whether a material change may be prepared, whether an exact release may proceed, whether risk is accepted and whether anything is merged or published.

## What changed the AI assessment

The previous assessment treated the 1.4 operating surface as a connected whole because records, decisions, feedback and Build Jobs were technically linked. Jamie's real use shows that connected storage is not a completed workflow. The assessment changes from “suitable for bounded founder use subject to calibration” to “requires a complete-workflow correction before that judgement can be made”.

## Remaining disagreement or uncertainty

- A direct authenticated Codex connection is still absent. The corrected product can assign and track the job honestly, but Codex must return its receipt through the local interface or API.
- The in-tool daily challenge is structurally present, but its usefulness still depends on the quality of the connected model and evidence available to it.
- One founder journey and automated checks cannot establish that the workflow will remain calm at larger data volume or for another user.
- Existing long conversations remain as history; the correction prevents new work discussions from adding to the same undifferentiated thread.

## Disposition

**Propose a bounded product change now; no methodology change.**

Prepare the smallest coherent Workbench correction that:

1. makes **Do Next** a human-action queue and separately counts AI-owned work;
2. shows current step, owner, Jamie's part, workflow stages and completion evidence;
3. routes Cases to open contained work and blocks premature resolution or closure;
4. completes ordinary retained feedback and automatically opens a review for a real change candidate;
5. creates one Codex Build Job automatically after preparation approval and removes Codex receipt fields from Jamie's screens;
6. prevents stale source links from appearing as the current build;
7. isolates work discussions and daily challenges into named conversations; and
8. moves the 08:00 daily methodology challenge into My Work before retiring the duplicate Codex automation.

The change should return for founder review as a draft pull request. Passing tests or technical readiness must not approve merge or product release.

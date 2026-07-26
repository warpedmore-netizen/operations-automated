---
id: OA-IDEA-002
title: Workbench-native AI Action Poll
status: idea
idea_status: approved for scoping
owner: Jamie Peppard
date_added: 2026-07-26
last_reviewed: 2026-07-26
next_review: During Workbench automation-engine scoping or when a supported local Codex trigger becomes available
relates_to:
  - type: product
    reference: product/operate-internal-workbench.md
  - type: feature
    reference: AI-owner queue and structured return
  - type: project
    reference: Future Workbench workflow and automation engine
resurfacing_triggers:
  - Workbench automation-engine scoping
  - AI-owner queue reliability review
  - supported local Codex trigger or callback becomes available
  - hosted or continuously running Workbench design
---

# Workbench-native AI action poll

## Original idea or problem

Jamie asked to:

> Add a poll directly in the system to prompt if there is a required action.

The immediate context is the AI-owner queue. A recurring Codex schedule proved that queued work can be claimed, completed and returned, but it is outside the Workbench and depends on a separately configured task. Jamie then paused that schedule and asked for the polling responsibility to be scoped inside the system.

## Area and relationships

- **Primary area, product, methodology or feature:** [Operate Internal Workbench](../product/operate-internal-workbench.md); AI-owner queue; proposed workflow and automation engine.
- **Customer problem:** Work assigned to an AI owner should reliably prompt action without Jamie maintaining a separate Codex schedule or manually moving prompts between systems.
- **Related products:** [Private OPERATE Workspace MVP](../product/MVP.md); [Operations Automated Delivery System](../product/delivery-system.md).
- **Related methodologies:** [Human-AI Collaboration Method](../methodology/human-ai-collaboration.md); [Readiness Path](../methodology/readiness-path.md); [Methodology Output Contract](../methodology/output-contract.md).
- **Related features or projects:** `/api/ai-work`, conflict-safe claim routes, structured evidence return, manual Codex recovery, My Work ownership states and the future configurable workflow/automation layer described in the Operate product model.
- **Related ideas:** No duplicate Ideas Space record was found. The Incident Management Simulation Game matched generic terms only and is not materially related.
- **User feedback:** [AI-owned work needs a reliable worker](../feedback/2026-07-26-ai-owned-work-needs-a-worker.md).
- **Research or evidence:** One live AI-owned Task and one authorised Build Job were successfully claimed and returned through the existing queue contract. This proves the queue and return path, not an in-system wake-up mechanism.
- **Dependencies:** A supported way for the Workbench to prompt or wake Codex; local authentication; worker availability; a durable polling lifecycle; claim expiry and recovery; observable failure states; continued manual recovery.
- **Possible duplication or conflict:** It overlaps the proposed future workflow/automation engine and should become its smallest useful vertical slice rather than a parallel scheduler. It may conflict with the local-only Workbench lifecycle if the server is expected to poll while the computer or app is stopped.

## Why it may be valuable

The idea may make AI ownership operationally complete within the product boundary. Jamie would assign work in the Workbench and see whether the system is waiting, has prompted a worker, has a valid claim, has received evidence or needs human input. A separate schedule would no longer be another component Jamie has to discover, configure or reconcile.

These are assumptions. Moving a timer into the Workbench does not by itself make Codex available, provide a supported wake-up interface or guarantee offline execution.

## Scoped concept

### Intended outcome

When the Workbench has at least one genuinely ready AI-owned item, the Workbench detects it and issues one bounded prompt to an authorised AI worker. The existing queue remains the source of ready work, the existing claim remains the start of execution and the existing structured return remains the only completion evidence.

### Smallest useful scope

1. Run a lightweight poll inside the local Workbench service while that service is available.
2. Inspect the existing AI-owner queue; do not create a second readiness rule or queue.
3. If no item is ready, take no action and create no user notification noise.
4. If an item is ready, request one worker wake-up through a supported local Codex interface.
5. Require the worker to claim the item before acting; detection or prompting never counts as a claim.
6. Suppress duplicate prompts while a valid claim or wake-up attempt is outstanding.
7. Record last poll, prompt attempt, claim, result, failure and next retry in plain language.
8. Use bounded back-off and a stale-attempt recovery rule rather than continuous rapid polling.
9. Return missing information and consequential decisions to Jamie through My Work.
10. Retain the manual copy-and-return route as degraded operation.

### Explicitly outside this scope

- a general-purpose workflow designer;
- autonomous approval, release, merge, publication, risk acceptance, spending or access changes;
- silently treating queue visibility or a prompt attempt as active work;
- hosted, multi-user or always-on infrastructure;
- external notifications, email, Slack or Teams;
- execution while the Workbench, computer or required AI surface is unavailable;
- replacing the existing claim and evidence-return contracts; and
- using task titles, summaries or prompts as authority.

## Candidate approaches for scoping

| Approach | What it does | Main advantage | Main limitation |
|---|---|---|---|
| Workbench reminder only | Polls the queue and prompts Jamie to start ready work | Smallest technical change | Does not complete AI ownership automatically |
| Workbench-to-Codex local wake-up | Polls the queue and invokes a supported local Codex trigger | Best fit with Jamie's intended experience | Depends on a supported, authenticated trigger that may not currently exist |
| Event-driven worker | Emits an event when a ready item appears | Faster and avoids periodic polling | Larger connection, lifecycle and reliability design; not needed for the first test |

The preferred hypothesis for exploration is **Workbench-to-Codex local wake-up**, with the reminder-only route as a degraded fallback. That preference is not an implementation decision.

## Evidence required before build approval

- Confirm a supported local Codex trigger or callback exists and document its authentication and failure behaviour.
- Demonstrate that one ready item produces one prompt and one claim, including after restart.
- Demonstrate no prompt when the queue is empty, blocked, awaiting Jamie or already claimed.
- Define claim expiry, stale wake-up recovery, retry limits and operator visibility.
- Verify the complete Task and Build Job paths without weakening their different authority gates.
- Test clean and existing local databases, Workbench restart, Codex unavailability and manual recovery.
- Confirm the polling cadence and resource use are proportionate.

## Risks and controls to carry into scope

| Risk | Required control |
|---|---|
| Duplicate execution | One conflict-safe claim plus an outstanding-wake marker and bounded expiry |
| False appearance of activity | Distinct states for queued, prompt attempted, claimed, returned and failed |
| Prompt or queue content treated as authority | Repository and record authority boundary applied before execution |
| Endless retries or notification noise | Back-off, retry ceiling, quiet empty polls and visible failure state |
| Work lost while offline | Durable ready state, restart recovery and manual fallback; no claim of guaranteed catch-up until proven |
| Consequential action performed automatically | Existing preparation, release, publication, risk, spending and access gates remain outside the poll |
| Hidden dependency on Codex availability | Health/status indicator and explicit degraded-mode explanation |

## Current position

- **Governance status:** Idea.
- **Idea status:** Approved for scoping.
- **Owner:** Jamie Peppard.
- **Date added:** 2026-07-26.
- **Last reviewed:** 2026-07-26.
- **Next review trigger or date:** During Workbench automation-engine scoping or when a supported local Codex trigger becomes available.

Jamie's instruction authorises this scope record. It does not authorise build, a new connection, reinstating the paused schedule, spending, release or publication.

## Resurfacing

Review this idea during:

- Workbench workflow or automation-engine discovery and scoping;
- AI-owner queue reliability review;
- assessment of a supported local Codex trigger or callback;
- design of hosted or continuously running Workbench infrastructure; or
- any proposal to remove the manual Codex recovery path.

Terms likely to identify related work include: AI owner, queue, poll, polling, worker, wake-up, prompt, trigger, callback, scheduler, heartbeat, claim, lease, retry, stale claim, Workbench automation and required action.

## Supporting notes, examples and evidence

### Recorded evidence

- The external recurring Codex worker successfully completed `OA-TASK-1E8E3FDD` and returned `OA-BUILD-BF7ACA69` for human review through the existing queue contract.
- Jamie paused that recurring schedule and asked for the poll to be scoped directly in the system.
- The Workbench already distinguishes ready work, retained claims, returned evidence and human control points.

### Jamie's judgement

- Detection and prompting should belong directly to the system rather than depend on a separate recurring schedule.
- The idea should be scoped in the Ideas Space now.

### AI inference

- The most important unknown is not the polling timer; it is the supported and authenticated mechanism by which a local Workbench can wake Codex.
- Reusing `/api/ai-work`, claim and return endpoints should reduce scope and prevent a second workflow truth.
- This is a useful first vertical slice for the future workflow/automation engine if it remains bounded to ready-work detection and dispatch.

### Assumptions and limitations

- The Workbench service remains the appropriate local coordinator.
- A supported local Codex wake-up interface can be found or created within an approved connection boundary.
- Polling is acceptable for an initial local increment; event-driven dispatch may later be better.
- Availability while the computer or Workbench is stopped is not solved by this idea.

No confidential employer, client or third-party information is included.

## Review history

### 2026-07-26 — Initial capture and bounded scoping

- **Context:** The separate recurring Codex schedule was paused after proving the AI-owner queue and return contract. Jamie asked for polling to be located directly in the system.
- **Viability:** The queue-side poll is straightforward; a supported authenticated Workbench-to-Codex wake-up mechanism remains unproven.
- **Impact:** Potentially high for product coherence and reliable AI ownership because it removes a separately maintained scheduler.
- **Speed and effort:** A reminder-only poll is small. Direct worker wake-up is moderate and depends on the available integration. An event-driven or always-on design is materially larger.
- **Relevance:** Directly relevant to the current AI-owner queue and future workflow/automation engine.
- **Relationships:** Extends rather than replaces the claim, return, My Work and manual-recovery contracts.
- **Timing:** Appropriate to scope now because the external schedule is paused and the queue contract has live evidence.
- **Evidence:** Two live queue phases completed; no in-system wake-up mechanism has been proven.
- **Next action:** Explore the supported local Codex trigger, lifecycle and failure model; return an assurance-backed build proposal only if viable.
- **Status after review:** Approved for scoping.
- **Authority:** Jamie authorised scoping in the Ideas Space only. No build, connection, spending, release, publication or schedule reactivation is authorised.

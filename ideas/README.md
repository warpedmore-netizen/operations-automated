---
id: OA-IDEAS-001
title: Operations Automated Ideas Space
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-25
last_reviewed: 2026-07-25
---

# Operations Automated Ideas Space

> Capture ideas when they appear. Judge them when the context is right.

## Purpose

The Ideas Space is the living memory for product, methodology, feature and operational ideas that may be useful later but do not require an immediate decision, commitment or build.

It preserves the original thought, connects it to relevant work and brings it back into view when the context becomes useful. Capturing an idea does not approve it, place it on the roadmap or commit Operations Automated to delivery.

This capability is **proposed**. Individual records may be captured under the existing governance authority while Jamie decides whether to approve the wider review and resurfacing process.

## Ideas register

| Idea | Idea status | Relates to | Added | Last reviewed | Next review |
|---|---|---|---|---|---|
| [Incident Management Simulation Game](incident-management-simulation-game.md) | Raw idea | Commercial product; incident management methodology; operational resilience tooling | 2026-07-25 | 2026-07-25 | When a named resurfacing trigger occurs |
| [Workbench-native AI Action Poll](workbench-native-ai-action-poll.md) | Approved for scoping | Operate Workbench; AI-owner queue; workflow and automation engine | 2026-07-26 | 2026-07-26 | During Workbench automation-engine scoping or when a supported local Codex trigger becomes available |

## Two different statuses

Every record has two deliberately separate states:

- **`status`** is the authoritative governance state of the record: `idea`, `draft`, `proposed`, `approved`, `published`, `superseded` or `rejected`.
- **`idea_status`** describes where the idea is in its working lifecycle.

An idea moving to `Planned`, `In progress` or `Implemented` does not approve methodology meaning, publication, spending, a connection or risk acceptance. Those decisions continue through the normal governed route.

Use one current idea status:

| Idea status | Meaning |
|---|---|
| Raw idea | Captured faithfully; not yet assessed |
| Needs exploration | Worth a bounded investigation before a decision |
| Deferred | Considered but intentionally parked until a trigger or date |
| Under review | Being reassessed in the current context |
| Approved for scoping | Jamie has explicitly authorised scope development, not delivery |
| Planned | Included in an explicitly governed plan |
| In progress | Authorised work has begun |
| Implemented | Delivered within the recorded approval boundary |
| Rejected | Considered and deliberately not pursued; reasoning retained |
| Superseded | Replaced by another idea or approach; relationship retained |

## Capture

Create one Markdown record per idea using the [idea record template](../templates/idea-record.md). Give it a stable `OA-IDEA-###` identifier and add it to the register above.

Capture enough structure to make later retrieval useful:

- a clear title and the original idea or problem;
- the product, methodology, customer problem, feature or project it relates to;
- possible value without presenting it as proven;
- related ideas, projects and dependencies;
- governance state and idea status;
- date added, date last reviewed and the next review trigger;
- supporting notes, examples and evidence, with source and limitations.

Preserve Jamie's original meaning separately from later AI inference. Do not add confidential employer, client or third-party information.

## Resurfacing during related work

Review this space before finalising work at:

- discovery;
- research;
- prioritisation;
- scoping;
- design;
- build;
- review; and
- roadmap planning.

Run:

```powershell
.\ideas\Find-RelatedIdeas.ps1 -Query "plain-language description of the work"
```

Search is an aid, not the only route. Also inspect explicit product, methodology, customer-problem, feature, project, idea, feedback and evidence links. If one or more active ideas are relevant, display:

> There are existing ideas related to this area. Review them before finalising the scope.

A match requires review, not adoption. A search miss does not prove that no related idea exists.

## Contextual review

When an idea is resurfaced, assess it in the current context rather than copying the original judgement.

| Lens | Review question |
|---|---|
| Viability | Is it technically, operationally and commercially realistic now? |
| Impact | What value could it create for users, teams or the wider proposition? |
| Speed and effort | How quickly could it be tested or delivered, and how much work would it require? |
| Relevance | Is it directly related to the work now being scoped or built? |
| Relationships | Does it support, duplicate, conflict with or depend on other work? |
| Timing | What has changed since capture that raises or lowers its value? |
| Evidence | What new feedback, research, usage data or experience supports or challenges it? |
| Next action | Explore, test, scope, combine, defer, reject or take no action? |

Record the review date, context, evidence, changed assessment and next action in the idea's review history. Update the idea status only when the recorded judgement supports it. Consequential progression still requires Jamie's explicit authority.

## Keeping the space useful

- Prefer one connected record to duplicate versions of the same idea.
- Link similarities and conflicts; do not erase meaningful differences.
- Retain deferral, rejection and supersession reasoning.
- Use review triggers for context-sensitive ideas and dates only where periodic review adds value.
- Do not rank an idea merely because it is new, detailed or easy to build.
- Keep untested value statements labelled as assumptions.
- Move implementation detail to governed product, methodology, project or decision artefacts once scoping begins; link back to the originating idea.

## Current boundary

This repository is the initial system of record. The finder performs a local text search only. No database, external connection, notification, automatic status change, automatic roadmap change or autonomous approval is included or authorised.

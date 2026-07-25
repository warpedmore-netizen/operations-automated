---
id: OA-DECISION-2026-07-25-002
title: Prepare the Lifecycle-First Confluence Library
status: recorded
decision: approved-for-private-internal-validation
decision_maker: Jamie Peppard
date: 2026-07-25
release_status: merged-for-private-internal-validation
release_pull_request: 15
release_commit: 5d6ac1af47708cabdd011782162b6c35ff819ab9
---

# Prepare the lifecycle-first Confluence library

## Decision

Jamie Peppard directed that the controlled Confluence documents should be created in a lifecycle-first library rather than the subject-first structure proposed in Workbench 0.8.0.

The required top-level lifecycle folders are:

- Live;
- Draft; and
- Archived.

The normal Methodology and Internal subject folders then sit beneath each lifecycle folder.

This initially authorised preparation, testing, a separate branch and a draft pull request for the structural correction. Jamie then approved the lifecycle-first structure and explicitly authorised merge of PR #15 on 2026-07-25. It was merged for private internal validation as commit `5d6ac1af47708cabdd011782162b6c35ff819ab9`.

The approval does not authorise a particular live page plan, automatic publication, deletion, external release or customer use.

## Placement rule

| Repository status | Confluence lifecycle |
|---|---|
| Approved, Published, Recorded | Live |
| Idea, Draft, Proposed, unknown or compound state | Draft |
| Superseded, Rejected | Archived |

The repository artefact status is the only placement authority. Merge state and Confluence visibility do not change it.

## Subject structure

Under each Methodology lifecycle folder:

- Core methodology
- Principles
- Evolution and governance
- Practical tools
- Proposals and assurance

Under each Internal lifecycle folder:

- Governance and direction
- Decisions
- Product and delivery
- Change history and assurance
- Feedback and validation evidence

## Controls retained

- Git remains authoritative.
- The Workbench performs a read-only comparison before any write.
- Jamie reviews the exact create, update, unchanged and conflict outcomes.
- A live run requires the exact publication confirmation.
- Independently edited and unmanaged same-title pages remain protected.
- Page identifiers and returned versions remain recorded.
- Automatic publication and deletion remain disabled.

## Publication decision still required

The lifecycle-first implementation is approved and merged for private internal validation. Jamie must still review and separately confirm each exact live publication plan using the Workbench's required confirmation.

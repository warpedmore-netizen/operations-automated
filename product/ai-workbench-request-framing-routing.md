---
id: OA-PRODUCT-012
title: AI Workbench Request Framing, Project Routing and Codex Handoff
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-29
approval_required: true
depends_on:
  - OA-PRODUCT-011@0.1 proposed
  - OA-STEERING-001@0.1 proposed
  - OA-PURPOSE-WORKBENCH-001@0.2 proposed
---

# AI Workbench request framing, project routing and Codex handoff

## Outcome

A user describes a need in ordinary language and receives a complete, understandable and governed route without choosing a record type, product, prompt, Methodology component, AI tool or technical acceptance format.

The Workbench preserves human control over Product Purpose, scope, consequence, authority, implementation, release and learning.

## Bounded product change

This increment extends the existing **Purpose & steering** intake. It does not create a new canonical work model.

The framing engine:

1. retains the exact source and available conversation, work, evidence, outcome, constraint, exclusion, urgency and authority context;
2. retrieves Product Purpose, Steering, approved Methodology, prompt, Decision, correction, feedback, work, Idea, implementation, recorded pull-request, Work Profile and security context before framing;
3. separates explicit wording, apparent outcome, inference, uncertainty, safe assumptions and prohibited assumptions;
4. classifies the request and checks its project boundary;
5. asks at most the material unresolved questions;
6. returns readiness A–G, the correct work hierarchy, a complete A–J work package, minimum linked-record plan, selected route and next governed action;
7. creates only the selected draft Operations Bible record after the user chooses **Create the draft route**; and
8. selects Codex only at stage D with exact control provenance and preparation authority.

## Existing controls reused

- `steering_intakes` remains the retained framing and route record.
- The project and prompt registries remain the source of product and prompt control.
- The governed repository index provides controlled pre-flight retrieval and a knowledge snapshot.
- Operations Bible records remain the canonical work records.
- Work Profiles continue to guide the route and evidence.
- Existing Implementation Jobs remain the only source-code build record.
- Existing structured receipts and acceptance-evidence checks keep an inadequate Codex return open.

## Readiness and minimum records

| Route | Readiness | Smallest retained result |
|---|---|---|
| Answer only or no action | A — Capture | Framing and answer route; no Task or Build Job |
| Idea or new-project exploration | B — Explore | Ideas or Decision route; no hidden implementation |
| Vague feature, purpose change or unresolved authority | C — Define | Improvement or Decision route; no Codex handoff |
| Complete authorised repository change | D — Implementation Ready | Controlled Change and complete Codex handoff |
| Implementation and later release | E–G | Existing Implementation Job, receipt, assurance and separate human Decisions |

The draft-route action creates no approval. A stage-D Change still requires the existing explicit approved-for-preparation transition before an Implementation Job is created.

## Codex handoff

The generated handoff contains the required title, target, authority, Purpose alignment, exact source, intended outcome, current and required behaviour, scope, preserved components, data and security boundary, AI boundary, requirements, user experience, data model, migration, rollback, acceptance, tests, documentation, structured return, definition of done and prohibited actions.

Its provenance retains the framing prompt, Product Purpose, Steering, Work Profile, implementation prompt, generation time, source work, human changes, final approved handoff version and later branch, pull request and release.

The live proposal does not yet select Codex because `STEERING.md@0.1` and the Workbench implementation prompt remain proposed or Draft. Tests use a controlled approved-state fixture to prove the stage-D mechanism without changing live authority.

## Information, security and authority

The private non-confidential Workbench boundary remains unchanged. No new provider, GitHub, Confluence or other connection is added. Recorded pull-request references come from existing local Workbench memory and are labelled as not live-verified.

AI may retrieve, frame, recommend and create a draft record. It may not change Product Purpose, approve, merge, release, publish, spend, connect a system, accept risk or delegate authority.

## Migration and recovery

SQLite migration 10 adds source context, complete framing, readiness, knowledge snapshot and linked-record fields to `steering_intakes`. It is additive and idempotent. Legacy intakes remain readable and visibly labelled as predating complete framing.

Operational rollback uses the existing paired application-and-SQLite recovery route. The implementation must pass both clean-database and existing-database tests before release review.

## Validation boundary

Automated and browser tests prove mechanics and the private founder journey. They do not approve the proposed control meaning, prove general-user accuracy or authorise merge or release.

## Decision required

Jamie Peppard may approve the implementation for merge, request revision, defer or reject it. Product Purpose, Steering, reusable prompts and private product release remain separate decisions.

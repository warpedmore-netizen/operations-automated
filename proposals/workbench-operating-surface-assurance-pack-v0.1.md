---
id: OA-ASSURANCE-WORKBENCH-OPERATING-SURFACE-001
title: Workbench Operating Surface Assurance Pack
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-26
---

# Workbench operating surface assurance pack

## Decision in one sentence

- **Decision required:** decide whether Workbench 1.4 is suitable for a bounded private founder pilot and may later merge into the proposed Operate branch.
- **AI recommendation:** suitable for bounded founder review, subject to real-use calibration; do not yet approve broader release, direct Codex connectivity or team/customer use.
- **Current authority:** implementation, verification and draft-PR review only.

## Current and proposed meaning

| Area | Before this increment | Proposed 1.4 behaviour |
|---|---|---|
| Authority | Git status remained authoritative, but retrieval coverage was shallow | Governed source manifest and source-level authority retained in every indexed chunk and snapshot |
| Conversation | Messages persisted but later requests could be isolated | Recent messages, rolling summary, active Case/work, controls and corrections enter later requests |
| Operations Bible | Product dictionary and lifecycle logic were JavaScript-led | Versioned JSON definition drives record metadata and valid transitions |
| Categories | Record type carried most routing meaning | Separate configurable Work Profile guides questions, outputs and evidence |
| Attention | Operate and specialist queues were partially joined | Searchable My Work with Blocked, Waiting on Jamie and Waiting on Codex views |
| Approval | Specialist controls used different storage and presentation | Universal bounded Decision/Approval object while specialist source history remains |
| Build | Proposal instruction existed but no common operating job | First-class approved-for-preparation Build Job, Codex brief, receipt and separate release control |
| Learning | Some recommendations and rejected links were retained | Type/Profile corrections, relationship rejection, cited snapshots and outcomes are structured for evaluation |

No approved methodology wording changes in this proposal.

## Authority architecture

- **Authoritative governed meaning:** the controlled repository and each artefact's recorded status.
- **Operational memory:** the local SQLite database.
- **Processor:** Oppa Mate applies the methodology, retrieves context, recommends, questions and prepares.
- **Builder:** Codex works outside the Workbench from a complete copyable brief.
- **Accountable authority:** Jamie makes consequential decisions and remains responsible for their consequences.

Approved or published methodology may be normative within its stated scope. Proposed, draft, retained and external material is visible evidence only. Source text cannot grant approval or instruct the Workbench to bypass controls.

## Implementation evidence

### Governed knowledge

- manifest covers approved methodology, project/governance context, decisions, feedback, proposals, product material, brand, templates and connected evidence;
- heading chunks retain path, artefact ID, title, status, version, full SHA-256 hash, source kind, authority, effective state, normative state and indexed commit;
- SQLite FTS5 is the reliable baseline;
- OpenAI embeddings are optional when both provider key and embedding model are configured;
- no vector-database service or model fine-tuning is introduced; and
- material responses, classifications, proposals and Build Jobs retain exact source snapshots.

### Operating continuity

- older conversation content is summarised deterministically while recent messages remain verbatim;
- current input is separated from retained conversation, active work, controls, corrections and evidence boundaries;
- “yes, do that” is linked to the previous Oppa Mate response and active work context;
- source-backed records preserve specialist history and route to the original workflow; and
- My Work combines operational, decision, approval, brand, publication and Codex attention without claiming they have identical evidence requirements.

### Build and release

- Build Job creation is rejected until the source Change has an approved-for-preparation decision;
- the handoff includes requirement, context, constraints, components, acceptance criteria, tests and authority boundary;
- the receipt requires branch, draft PR, commit, changed files, tests, validation, risks and version impact;
- release approval requires Jamie's exact `Approve release` confirmation;
- approval authorises only the reviewed commit and pull request;
- the Workbench does not perform the merge;
- a later external merge receipt triggers repository reindexing and queues an applicable Confluence update; and
- Confluence publication remains a separate exact decision.

## Alternatives considered

1. **Replace the database with a new unified schema.** Rejected because it would create unnecessary migration and audit-history risk.
2. **Duplicate every specialist workflow inside Operate.** Rejected because it would create conflicting authority and decisions.
3. **Keep only file-level keyword retrieval.** Rejected because it cannot reliably locate bounded approved meaning or cite the actual section used.
4. **Require an external vector database.** Deferred as disproportionate for a private local pilot.
5. **Fine-tune a model from corrections.** Deferred until structured outcomes and an evaluation set show a justified need.
6. **Connect the Workbench directly to Codex.** Deferred because the capability is not currently authorised or honestly available.
7. **Allow technical readiness to authorise release.** Rejected because it conflicts with approved human authority.

## Dependencies

- approved v0.6 methodology and evolution controls;
- proposed Operate branch and action loop;
- local Node.js and experimental Node SQLite support;
- Git for authoritative source and source hashes;
- optional OpenAI provider for model reasoning, voice and embeddings;
- the existing controlled Brand Review, Decision Inbox and Confluence publication routes; and
- Jamie's retained authority.

## Risks and mitigations

- **Retrieval false confidence:** authority and normative state are stored per chunk; source lists are inspectable.
- **Conversation summary loss:** recent messages remain verbatim and older summary is bounded, retained and refreshable.
- **Profile overreach:** Work Profile and record type are separate recommendations and neither creates approval.
- **Duplicate decisions:** specialist items are source-backed and route to original history.
- **Approval fatigue:** exact confirmation is limited to consequential controls; routine reversible actions stay direct.
- **False autonomous-build claim:** the handoff and receipt are explicitly copy/paste/structured data.
- **Local founder bias:** real-use and independent-user evidence remain outstanding.
- **Migration failure:** schema changes are additive and tested against clean, legacy and restarted databases.

## Verification

- full automated Workbench suite: **75 passed, 0 failed**;
- dedicated operating-surface suite covers the ten required governed journeys;
- clean-database creation and pre-migration database upgrade preserve retained records;
- restart preserves conversation context, records, Build Job, decisions, approvals and receipt;
- incorrect release and risk-acceptance confirmations are rejected;
- proposed material conflicting with approved methodology remains non-normative;
- source-backed feedback, brand and proposal work appears in My Work without deleting source history;
- repository reindexing is retained on the authorised merge receipt;
- the current real local database loaded after additive migration with its retained source-backed work and no browser console errors;
- a separate clean browser database captured an ordinary-language Product/Application Request, retained the selected Work Profile and automatically linked a draft Change without approving it;
- the live Waiting on Codex filter reduced the common inbox to the applicable records and restored the complete view correctly;
- **Discuss with Oppa Mate** opened a conversation with the selected work and Case context explicitly linked; and
- live desktop and 390 × 844 phone checks showed usable navigation, stacked filters and actions with no horizontal page overflow.

## Tested but still requiring real-use evidence

- whether the seven Work Profiles ask the right material questions;
- whether 80:20 ordering remains useful across a week of real founder work;
- whether rolling summaries preserve the right nuance in long discussions;
- whether Incident, Problem, Change and risk link suggestions feel natural outside test scenarios;
- whether the copyable Codex brief reduces re-explanation in a real build; and
- whether My Work remains calm as the data volume grows.

## Deferred

- direct authenticated Codex connection;
- hosted or multi-user deployment;
- role administration and delegated-authority policy;
- notifications and scheduled operational actions;
- external vector database;
- model fine-tuning;
- autonomous merge or publication;
- customer integrations and customer use; and
- external publication.

## Exact decision required

Jamie is asked to decide:

> Is the proposed Workbench 1.4 operating surface suitable for bounded private founder use and ready to merge into the proposed Operate branch?

A positive decision would not approve the combined Workbench for external release, change approved methodology meaning, publish Confluence content, activate a direct Codex connection, accept unrecorded risk, approve customer use or delegate Jamie's retained authority.

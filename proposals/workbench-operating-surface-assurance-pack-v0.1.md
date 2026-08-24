---
id: OA-ASSURANCE-WORKBENCH-OPERATING-SURFACE-001
title: Workbench Operating Surface Assurance Pack
status: proposed
version: 0.5
owner: Jamie Peppard
date: 2026-07-26
---

# Workbench operating surface assurance pack

## Decision in one sentence

- **Decision required:** decide whether Workbench 1.5.1 is suitable for a bounded private founder pilot and may later merge into the proposed Operate branch.
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
| Source-backed action | Work could name a PR without a direct link or usable source brief | My Work carries the safe PR link, review summary, exact decision and authority boundary |
| Help continuity | Active record ID was technically attached after leaving My Work | Help starts inline; the optional full conversation visibly retains its origin and route back |
| Main answer | Source extracts, repository labels and control mechanics could dominate the response | Plain-language meaning and next action lead; source, status and control trace stays in one optional panel |
| Feedback action | Labels were visible before action but their retained result was not consistently explained | Every answer-feedback choice and saved-feedback treatment explains what will happen before selection or save |
| First-use guide | Described the available controls and separation of authority | Describes the result of sending, saving, creating a review, preparing and releasing before asking the user to act |
| Work ownership | Jamie's decisions and AI-owned work appeared in the same action list | **Do Next** contains only Jamie's real actions; **Being handled** keeps AI-owned work visible without asking Jamie to complete it |
| Workflow | A record showed its next transition but not the route, owner or success evidence | Details show the current step, owner, Jamie's part, workflow stages and **Done when** evidence |
| Feedback completion | Ordinary retained feedback could remain presented as an open review | Corrections and context complete on save; a real change candidate opens one review automatically |
| Build hand-off | Preparation and receipt capture appeared as separate technical work for Jamie | Preparation creates one linked Codex-owned Build Job automatically and the implementation fields stay with Codex |
| Conversation isolation | Work help could reuse the current long conversation | Each work item and each daily challenge uses a distinct, named conversation |
| Record identity | Operational records exposed titles and internal UUIDs only | Stable type-specific references such as `OA-CASE-EA27C086` are derived from the retained record identity and shown on working surfaces |
| Terminal actions | A completed Approval could still be described as Jamie's next step | Records with no next action are not human-action items and show the recorded outcome plus where to verify retained activity |

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

### Plain-language delivery

- connected-model instructions require the direct answer or one material question in plain language and prohibit repository paths, hashes, routing and proposal mechanics from the response;
- a defensive display layer removes raw internal paths, status lines and legacy delivery labels if an older or provider-generated answer contains them;
- the local operational-test answer now gives a small reversible test, comparison, exceptions, credible failure, recovery and a single immediate next step rather than assembling source excerpts;
- exact sources, status, hashes, answer method and remaining authority remain retained and inspectable in the optional panel;
- answer-feedback choices state what they save and whether a note will be requested before the click;
- Saved Feedback describes the result of each treatment as the selector changes, before **Save this use**; and
- a methodology or product classification opens one governed change review automatically, while preparation, release and publication remain separate explicit decisions.

### Build and release

- Build Job creation is rejected until the source Change has an approved-for-preparation decision;
- the approved preparation decision creates or reuses exactly one linked Build Job;
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
8. **Correct only the originating answer.** Rejected because later local/provider answers, answer feedback and the guide would retain the same delivery failure.

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
- **Progressive disclosure hides a material consequence:** the human decision remains in the main answer in ordinary language; only its implementation trace is secondary, and real-use review remains required.
- **Automation obscures ownership:** every automatic bounded transition names its owner, completion condition and return point; it cannot create preparation or release approval.
- **Completed feedback becomes invisible:** it leaves My Work but remains in Saved Feedback and the source audit trail.
- **Daily-challenge duplication:** the Workbench uses one dated conversation and the previous Codex schedule is removed only after this route is verified.
- **Reference identity:** the UUID remains the relational key; the visible `OA-<TYPE>-<ID>` reference is derived deterministically and does not introduce a competing sequence, rewrite links or change activity history.

## Verification

- full automated Workbench suite: **79 passed, 0 failed**;
- the earlier isolated browser evidence showed type-specific references on My Work and Cases & Work, and the completed Approval stated that no further confirmation or data entry was required; the reconciled proposal verifies the current `OA-<TYPE>-<ID>` format through the automated suite;
- explicit regression coverage confirms the daily challenge enters My Work, AI-owned build work stays out of **Do Next**, and the one automatic Build Job remains linked to its Change;
- the retained founder database showed two genuine Jamie actions, two AI-owned items being handled, no blocker and no duplicate Change card alongside its Build Job;
- the live Case routed to its one open Task; the Task named Operations Automated AI as owner and exposed no Jamie completion control;
- retained ordinary corrections were marked handled and absent from My Work while the material change retained its one Decision Inbox and Build Job route;
- a work discussion created a new `Work · Inventory feature documentation coverage` conversation without sending a provider request;
- the dated 10-minute daily challenge appeared in My Work, after which the duplicate Codex daily automation was removed;
- desktop and 390 × 844 phone-width checks showed no horizontal overflow, and the browser reported no errors;
- clean database creation and an existing pre-migration database both pass; the latter retained its conversation and upgraded without data loss;
- the current correction introduces no SQLite schema change and stores its added source/control trace in the existing message metadata JSON;
- an isolated live desktop journey returned a direct six-step operational test with no visible raw path or internal status language;
- the same answer kept eight source/status records and the answer-control boundary behind a closed optional panel until opened;
- all six answer-feedback choices showed their retained result before selection, and the successful **Helpful** action returned the same consequence in its receipt;
- Saved Feedback changed the on-screen consequence before save when the treatment moved to methodology review;
- the live guide explained the result of sending, feedback, change review, preparation and release before action;
- a 390 × 844 phone-width check showed no horizontal overflow, a single-column feedback layout and 54-pixel feedback buttons;
- the isolated live browser reported no errors or warnings;
- a PR #22 API fixture returned its safe GitHub link, source summary and exact decision in both record detail and My Work;
- an isolated browser journey showed the PR link on the work card and detail, kept Oppa Mate help inside My Work and returned a work-specific decision answer;
- the optional full conversation displayed the originating record and source link, then returned to the same work item;
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

> Is the proposed Workbench 1.5.1 operating surface, including clear ownership, complete feedback/change/build workflows, separate work conversations and the in-tool daily challenge, suitable for bounded private founder use and ready to merge into the proposed Operate branch?

A positive decision would not approve the combined Workbench for external release, change approved methodology meaning, publish Confluence content, activate a direct Codex connection, accept unrecorded risk, approve customer use or delegate Jamie's retained authority.

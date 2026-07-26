---
id: OA-PRODUCT-011
title: Operate Internal Workbench Operating Model
status: proposed
version: 0.8
owner: Jamie Peppard
date: 2026-07-26
---

# Operate internal workbench operating model

## Purpose

Operate is proposed as the internal workbench where operational work is captured, connected, prioritised, governed and learned from. It should help a person answer:

> What is mine, what matters now, what is connected to it and what governed action should happen next?

It is not proposed as a universal linear workflow or a replacement for the approved Operations Automated methodology.

## Authority and status

The approved v0.6 repository baseline remains authoritative. The connected-work method provides the approved conceptual foundation. This document, the initial Operations Bible dictionary, priority weights and interface are proposed product behaviour for private internal review.

Classification, recommendation, a passing scenario test and technical readiness do not create approval.

The AI-owner queue responds to the recorded founder finding that [AI-owned work needs a reliable worker](../feedback/2026-07-26-ai-owned-work-needs-a-worker.md). The queue is a machine-readable integration contract. A recurring local Codex worker has now been configured and its bounded prompt has been exercised through one live Task. The manual hand-off remains the recovery route. Queue availability alone still does not prove a claim, active work or completion.

## Current and proposed position

| | Current Workbench | Proposed Operate MVP |
|---|---|---|
| Primary entry point | Conversations and specialist governance areas | Conversation-first capture with one **My Work** home and short **Do Next** list |
| Operational records | Feedback, decisions and specialist local records | Cases, Requests and Tasks, with the wider dictionary available |
| Relationships | Present in methodology and specialist workflows | Visible, queryable links between operational records |
| Progression | Specialist workflows and one Task completion action | Every open item exposes a working governed action and retained outcome |
| Priority | Area-specific order | Explainable impact-first recommendation |
| Service-account user | Conversation and bounded governance support | Oppa Mate is the recognisable company service account and may recommend type, route and next action within assigned permissions |
| Authority | Named human controls | Unchanged and made explicit in record transitions |
| Knowledge | File-level repository extracts | Governed source manifest, heading chunks, authority labels and exact cited snapshots |
| Build delivery | Specialist proposal handoff | First-class external-Codex Build Job, receipt and separate release approval |
| AI-owned execution | Ownership label with no reliable wake-up | Recurring local worker, conflict-safe claim, structured evidence return, manual recovery and human-control routing |

## Workbench operating surface

The 1.4 proposal makes the existing Workbench parts operate as one system:

- Git remains authoritative for methodology and governed meaning.
- SQLite retains work, conversations, corrections, links, decisions, approvals, Build Jobs and outcomes.
- Oppa Mate applies the approved method, retains context, recommends type and Work Profile separately, asks only material questions and prepares work.
- Codex remains outside the Workbench as the source-code builder; the first handoff is deliberately copyable rather than presented as a direct autonomous connection.
- Jamie carries out ordinary capture, review, correction and approval inside the Workbench.

Approved methodology is normative within its scope. Proposed, draft, retained and external material may provide evidence but is labelled and cannot silently replace approved meaning. Each material response, classification, proposal and Build Job can retain the exact source snapshot used.

Conversation requests include recent messages, a rolling summary of older history, the active Case or work record, linked controls and retained corrections. A short reply is therefore interpreted in its current work context rather than as a new isolated instruction.

### Source-backed work and help in place

A source reference is part of the working action, not optional navigation metadata. When a record names a valid GitHub pull request, My Work presents the direct link on the item and a review package containing why the work exists, what changes, the exact decision and what remains unauthorised. Change proposals additionally project retained evidence, alternatives, risks and validation without changing their source authority.

**Ask Oppa Mate about this work** opens inside the selected item with visible originating context and one-click prompts for summary, decision, risk and evidence. Opening the full conversation is optional. The conversation then displays the originating item, linked source and a route back; the source context also enters both connected-model and local-response reasoning. Opening or discussing a source does not approve, merge, release or publish it.

### Plain-language answers and informed feedback actions

The main Oppa Mate answer is written for the user and leads with meaning, recommendation and the next decision or action. Repository paths, artefact status, source hashes, processing route and control mechanics remain inspectable in one optional details panel rather than interrupting the answer.

This presentation rule does not discard evidence or hide consequence. Exact source snapshots, status and authority remain in retained response metadata and the optional trace. A material human decision still appears in plain language in the main answer; the implementation mechanics that enforce it stay secondary.

Each feedback choice explains what will be saved, what later action becomes available and what will not happen before the user selects it. The Saved Feedback route uses outcome language such as **Fix this answer only**, **Keep with this conversation** and **Consider a methodology change**. Saving an ordinary correction, context note or evidence completes that feedback step and removes it from Jamie's action queue while retaining its trace. Saving a methodology or product change candidate creates or opens one separate governed review automatically. Classification still does not approve preparation, release or publication.

### Complete workflow and ownership view

Each work detail leads with five questions in ordinary language:

1. what is happening now;
2. who owns it now;
3. what, if anything, Jamie must do;
4. what steps lead to completion; and
5. what evidence means it is done.

**Do Next** contains only non-blocked work that genuinely requires Jamie. An AI-owned item that is ready for the configured worker is labelled **Queued for the AI owner**, not described as active work. The successful claim changes it to **AI owner is working on this task** and retains the worker reference. If the worker is unavailable, Jamie can expand the manual fallback, copy the same complete prompt and record the hand-off. Missing information or a consequential decision routes back to Jamie. A Case with open contained work routes to that work and cannot be resolved or closed first.

Work-item help creates or reuses a conversation for that work item rather than appending every question to the most recently open conversation. The daily methodology challenge appears after 08:00 UK time as one 10-minute My Work item and starts its own dated conversation. Once Jamie answers, that item leaves My Work and any useful correction can follow the ordinary retained-feedback and change route.

### Outcome ticket and manual Codex bridge

Every ticket must answer four questions before exposing technical trace: what outcome is required, what has already happened, who acts next and the exact next action.

An AI-owned ticket receives a readable reference, outcome, success criteria, material questions and one ready-to-copy Codex task. **I've started this in Codex** records the hand-off; it does not mark the work complete. Codex is instructed to return a structured result to the local Workbench. If that automatic return is unavailable, Jamie can paste the final response and choose **I've done this — review the outcome**.

The Workbench checks the ticket reference, specific evidence, every success criterion and reported remaining work. A routine Task closes only when those checks pass. An inadequate return stays open and produces a corrected prompt. A non-routine or consequential record returns to Jamie's governed action rather than letting AI approve its own work.

## Configurable definitions and Work Profiles

The Operations Bible is loaded from a versioned JSON definition rather than a JavaScript-only dictionary. It carries statuses, transitions, required and optional information, methodology questions, relationships, approval gates, automation boundaries, completion evidence and review triggers for all twelve core record types.

Work Profiles are a separate configurable layer. The seeded profiles cover methodology feedback/change, product or application build, branding review, daily challenge, research/evidence review, documentation/publication and general administration. A profile guides questions, expected outputs and evidence; it does not change record type or create approval.

## Universal decisions, approvals and specialist history

The shared Decision and Approval records retain scope, exact decision, decision maker or approver, evidence, recommendation, alternatives, trade-offs, conditions, explicit confirmation, decision time, result, authorised transition and remaining limits.

Existing feedback, Decision Inbox, Brand Review and Confluence publication records are projected into the common Operate graph and My Work. Their original tables, routes and audit history remain intact; the shared layer links to the source workflow rather than duplicating its authority.

## External-Codex Build Job

A Build Job is available only after the linked Change is explicitly approved for preparation. That preparation decision creates the one linked job automatically. It contains the approved requirement, context, methodology and governance constraints, affected components, acceptance criteria, test expectations and authority boundary.

The job moves through **Ready to start in Codex**, **In Codex**, **PR ready for review** and, only after Jamie types the exact release confirmation, **Release authorised**. The returned receipt retains the branch, draft pull request, commit, changed files, tests, validation, unresolved risks and version impact. Those receipt fields belong to Codex, not Jamie.

The Workbench exposes authorised build and merge steps through the same hand-off contract and local AI-owner queue. The configured worker may claim only the phase already authorised; the complete copy-ready Codex command remains available as recovery. When the build returns, the Workbench provides the direct PR link, exact commit, intended outcome, test evidence, unresolved risks and a short review checklist. Approval creates the next bounded Codex merge command; it does not silently mean publication. The queue never creates preparation or release authority: it can expose a merge step only after Jamie's exact release decision has already been retained.

After Codex records a successful authorised external merge, the Workbench reindexes the repository, retains the merged receipt and queues an applicable Confluence update. Publication remains a later, separate controlled decision.

## Defining difference: a governed operational graph

Operate may eventually become multi-tiered like a mature work or service-management platform, but tiers and records are not its defining value. Its proposed difference is a shared operational graph that people and AI build, challenge and learn from together.

The intended loop is:

1. capture a real need, event, action, decision or observation;
2. connect it to the outcomes, causes, dependencies, risks, controls and changes that make it meaningful;
3. retain whether a person or Oppa Mate proposed each material relationship and who confirmed it;
4. derive inspectable signals from the network;
5. challenge weak or missing relationships rather than treating structure as truth; and
6. use the resulting information to prioritise, decide, act and learn.

The system should therefore optimise for information returned, not records collected. A field, tier or link is useful only when it improves understanding, routing, a decision or a governed next action.

Oppa Mate is the primary Operations Automated service-account identity across this model. The identity makes his activity recognisable and traceable; it does not itself grant access, approval authority or permission to execute consequential work.

Changes and Continual Improvements have dedicated registers alongside the complete operational register. The Operations Bible remains a separate visible dictionary. The longer-term direction is a configurable workflow and automation engine beneath these records, comparable in role to a service-management workflow layer. The present product supplies explicit state, action, hand-off and return contracts; it does not claim that the general workflow engine exists.

AI-suggested links remain inference. They join the active graph only after human confirmation in this MVP, and an incorrect confirmed relationship is rejected rather than silently deleted so its correction remains traceable.

## Governed action loop

The operational graph is supporting infrastructure until it helps the user make progress. Operate must enact the approved methodology output contract:

> Every open item in My Work has a real current action, an accountable route and a retained outcome.

A material decision, review, approval or follow-up still owed by Jamie is work and should enter the attention system as a durable item. Proportionality remains essential: a routine reversible choice may stay in the work activity history, while a judgement affecting value, risk, control, release, spending, authority or meaningful progress should have a Decision, Approval or other suitable record.

Each actionable item exposes:

- its source, owner and current status;
- one recommended next action and any credible alternative action;
- what the action changes and what remains unchanged;
- the evidence, outcome or rationale required;
- the authority and proportionate confirmation required where consequence matters; and
- the retained actor, previous state, resulting state, note and timestamp.

Existing specialist items do not need to duplicate their source workflow. A methodology release decision routes from My Work into the Decision Inbox. A Brand Review item routes into Brand Review. Native Operate records progress through a type-and-status action contract.

Direct status changes cannot bypass that contract. The initial action vocabulary remains proposed product behaviour, but automated tests require every open Operations Bible state to expose at least one valid action. Consequential founder-controlled actions use the smallest explicit control that preserves judgement:

- **Approve**, **Reject** and **Expire** are clearly labelled choices; the selected button is the explicit action rather than asking Jamie to retype its label;
- safe, neutral notes may be suggested and remain editable, while rejection, exception and evidence-specific reasons remain mandatory where they cannot be inferred;
- a material Decision requires Jamie to select **Proceed**, **Revise first** or **Do not proceed** before **Record decision** becomes available;
- accepting a Risk retains the stronger exact **Accept risk** confirmation and requires the residual exposure, conditions and review trigger; and
- approving a Change remains bounded to the scope and evidence shown in the record.

Oppa Mate may recommend, name and prepare an action, but the click or choice that records Jamie's judgement remains Jamie's. A Case cannot close while contained work remains open.

## Initial Operations Bible

The dictionary provides a single in-product vocabulary:

- **Case:** flexible container for related work and evidence;
- **Request:** demand from a person or system for an outcome or service;
- **Task:** a bounded action with an owner and completion state;
- **Incident:** an unplanned interruption, degradation or harmful event requiring restoration;
- **Problem:** an understood or suspected underlying cause requiring investigation or treatment;
- **Change:** a controlled alteration to a service, process, product, control or method;
- **Risk:** uncertainty that could affect outcomes, considered across all work;
- **Finding:** evidence from review, assurance or testing that requires a disposition;
- **Continual Improvement:** a learning-led opportunity to improve outcomes or capability;
- **Scenario Test:** a structured way to explore behaviour, controls and outcomes before or after change;
- **Decision:** a retained choice, rationale, authority and consequence; and
- **Approval:** a named human authority gate, never inferred from classification.

Each entry includes when to use it, when not to use it, available statuses and the human/automation boundary.

## Connected model

Case is a container, not a forced lifecycle. Work may also have an optional parent, allowing several useful levels without making one universal hierarchy mandatory. A Request may sit within a Case. An Incident or repeated Request may evidence a Problem. A Problem, Risk, Finding or Improvement may generate a Change. A Finding may result in no action or any relevant work record. A Scenario Test may create Findings, Risks, Problems, Tasks, Requests, Changes and Improvements.

Risk remains cross-cutting. Customer Journey, journey stage, product and service are optional overlays rather than new mandatory workflows.

## My Work and the 80:20 rule

The recommended order weighs:

| Factor | Weight |
|---|---:|
| Outcome impact | 22 |
| Urgency and deadline | 18 |
| Risk exposure | 20 |
| Control implication | 10 |
| Work blocked for others | 12 |
| Strategic value | 8 |
| Age | 5 |
| Confidence in the evidence | 5 |

The product exposes the contributing factors and a short explanation. A person can change the source values. A score does not alter record status, approve a Change or accept a Risk.

The first screen shows:

- a summary of Jamie's actions, work being handled, blocked work and decisions;
- up to five non-blocked **Do Next** items where possible;
- one unified inbox containing operational records, open change decisions and Brand Review work;
- recommended, newest, oldest and deadline ordering; and
- a detail panel with context, relationship and authority information.

## Ordinary-language capture

Capture requires only a description. Oppa Mate suggests an editable name, record type, Work Profile and starting priority before saving. The generated name uses the work type as a plain-language verb where useful, such as **Approve...** or **Decide...**. The user opens progressive detail only to correct a suggestion or add context. Impact, urgency, deadline, owner, Case, parent, risk, control and improvement fields remain populated defaults or optional detail rather than capture blockers.

The activity record retains the recommended type, selected type and whether the recommendation was accepted. It does not retain a claim that classification approved the work.

## MVP boundary

Implemented in this proposal:

- unified **My Work** and **Do Next**;
- search plus Blocked, Waiting on Jamie, Waiting on Codex, Work Profile and record-type filters;
- governed source manifest, heading-level FTS5 retrieval, optional embeddings and exact source snapshots;
- conversation continuity using recent messages, rolling summary and active work context;
- versioned executable Operations Bible and seven configurable Work Profiles;
- one shared Decision and Approval representation across specialist scopes;
- source-backed migration of feedback, change, brand and publication queues;
- first-class external-Codex Build Jobs, structured receipts and separate release controls;
- governed actions across every open state in the initial twelve-record dictionary;
- durable initial dictionary for all twelve record types;
- record details and related-work display;
- optional parent work for a bounded multi-tier structure;
- explicit typed record links created by a person;
- type-safe Oppa Mate relationship suggestions inside shared operational context;
- retained relationship proposer, route, confidence, rationale and human confirmer;
- non-destructive rejection of incorrect relationships;
- derived network signals covering connection gaps, blocked flow, unlinked risk treatment and case attention hotspots;
- explainable priority;
- optional Case, journey and product classification;
- existing Decision Inbox and Brand Review items in the unified inbox;
- action labels on every My Work item, specialist workflow routing and visible retained activity;
- direct-status bypass protection;
- proportionate Task completion and type-specific lifecycle progression;
- explicit labelled Approval and Change choices, mandatory Decision outcomes, stronger typed Risk acceptance, and retained rationale proportional to consequence;
- safe pull-request links and plain-English source work packages in My Work;
- inline Oppa Mate help with retained source, decision and authority context;
- visible originating-work context and a route back from the full conversation;
- plain-language main answers with source, status and control detail behind optional disclosure;
- consequence-first answer feedback, saved-feedback actions and first-use guidance;
- current owner, Jamie's part, workflow progress and completion evidence on each work detail;
- AI-owned work excluded from **Do Next** without disappearing from the full inbox;
- readable ticket references, copy-ready Codex tasks, recorded hand-offs and structured completion review for AI-owned work;
- direct PR review links, plain-English review checks and a post-approval Codex merge prompt;
- dedicated Improvement, Change and Operations Bible registers;
- one local AI-owner queue contract covering bounded operational Tasks and authorised Build Job phases, with claim, retry and structured return evidence; the recurring worker is configured separately and no claim is inferred from queue availability;
- automatic ordinary-feedback completion and automatic change-review creation where applicable;
- automatic one-job Codex handoff following an explicit preparation decision;
- separate work-item and dated daily-challenge conversations;
- Case-closure protection while contained work remains open; and
- local audit/activity evidence with no delete route.

Represented but not claimed as complete:

- independently validated Incident, Problem and Change workflows beyond the bounded scenarios;
- automatic creation of every action or decision identified during AI analysis;
- an event-driven or directly authenticated Codex connection that does not depend on scheduled local polling;
- automatic parent progress, service-level timing, assignment and escalation;
- scenario-test execution and comparison;
- customer-journey analytics;
- guaranteed pickup while the computer, Codex app or Workbench is unavailable;
- external business-system connections;
- multi-user access, role administration or customer deployment; and
- productised continual-improvement reporting.

## Operational lenses and readiness

- **Value and outcomes:** Do Next should direct attention to meaningful outcomes, not record volume.
- **Demand and work types:** ordinary-language capture preserves incoming demand before classification.
- **Flow and dependencies:** Cases and links show connected work without one mandatory sequence.
- **People and authority:** ownership, next action and consequential confirmation remain explicit and separate.
- **Risk and controls:** risk and control implications affect attention across every work type.
- **Information and knowledge:** the Operations Bible makes the vocabulary visible and correctable.
- **Technology:** local SQLite and existing Workbench controls are sufficient for a reversible pilot.
- **Performance and learning:** Findings, Improvements and scenario tests preserve the route to later learning.

The proposal is ready for private technical review. It is not yet ready for broader internal deployment because real-work calibration, independent-user validation and a release decision are outstanding.

## Trade-offs

### Expected benefits

- less fragmented attention;
- clearer relationships between demand, action, risk, decisions and learning;
- lower capture effort;
- visible reasons for prioritisation;
- retention of the existing governance controls; and
- a coherent foundation for later automation.

### Possible disadvantages

- a numerical score can create false confidence;
- a dense or weakly governed graph can create confident noise;
- scheduled polling introduces a bounded delay and depends on Jamie's computer, Codex app and local Workbench being available;
- the full dictionary may feel larger than the immediate MVP;
- Case can become a catch-all if boundaries are not learned through use;
- a unified inbox can become noisy without ownership and status discipline; and
- too many formal Decision or Approval records can turn proportionate control into administrative noise;
- founder-specific tuning may not transfer to another user.

The mitigation is progressive disclosure, explainability, optional links, visible provenance, human confirmation of AI suggestions, retained correction and a bounded private pilot using real non-confidential work.

## Validation plan

1. Run the complete automated Workbench test suite.
2. Test creation and linking of a Case, Request and Task through the API.
3. Confirm a child record inherits its Case context and circular parent relationships are rejected.
4. Confirm an AI-suggested link cannot enter the active graph without exact human confirmation and retains both parties' provenance.
5. Confirm a rejected relationship leaves activity evidence but no longer affects active network signals.
6. Confirm completed work leaves the open inbox.
7. Confirm every open Operations Bible state exposes at least one valid action.
8. Confirm direct status changes are rejected in favour of the governed action route.
9. Confirm an Approval, accepted Risk, authorised Change and material Decision reject missing or incorrect founder confirmation and rationale.
10. Confirm Case closure is blocked while contained work remains open.
11. Confirm specialist inbox items route into working source decisions rather than duplicating them.
12. Review the interface and action controls at desktop and phone widths.
13. Confirm a PR-backed item exposes its safe direct link, review summary, exact decision and remaining authority boundary without requiring a manual search.
14. Ask Oppa Mate from that item, confirm My Work remains visible, then open the full conversation and return to the originating item.
15. Confirm the main answer contains no raw source path, status label or control mechanic while the optional panel retains exact trace and authority.
16. Confirm every answer-feedback choice and Saved Feedback treatment explains its result before selection or save.
17. Complete the first-use guide at desktop and phone widths and confirm sending, feedback, preparation and release consequences are understandable before action.
18. Have Jamie complete or reject at least one Task, Approval, Decision and non-terminal transition through My Work.
19. Use at least ten real items for one week and compare recommended order and network signals with Jamie's judgement.
20. Record misclassification, false urgency, missing relationships, false links, missed links, unsuitable actions and inappropriate derived signals.
21. Run one independent-user capture, linking, action and prioritisation test before any broader use.
22. Assign a bounded Task to Operations Automated AI, confirm the scheduled worker claims it only once, returns evidence against every success criterion and removes it from open work only after that evidence passes.
23. Approve one Build Job for preparation, confirm the worker can claim the build but cannot release it, then confirm an authorised merge appears only after Jamie's separate exact release decision.
24. Stop the Workbench during a scheduled check, confirm no item is lost or falsely completed, then restart it and verify safe later pickup or manual recovery.

## Decision required

Jamie should review whether this is the right bounded private-pilot model, especially:

- the twelve definitions;
- Case as a flexible container;
- the priority factors and their relative weight;
- the separation of classification, prioritisation, approval and risk acceptance; and
- the proposition that the governed operational graph, rather than the ticket register, is the distinctive product value; and
- the rule that every open item must provide a working governed action and retained outcome;
- the decision to defer external connections and advanced automation.

Release, merge and any broader use remain separate decisions.

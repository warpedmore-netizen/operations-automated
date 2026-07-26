---
id: OA-PRODUCT-011
title: Operate Internal Workbench Operating Model
status: proposed
version: 0.3
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

## Current and proposed position

| | Current Workbench | Proposed Operate MVP |
|---|---|---|
| Primary entry point | Conversations and specialist governance areas | One **My Work** inbox and short **Do Next** list |
| Operational records | Feedback, decisions and specialist local records | Cases, Requests and Tasks, with the wider dictionary available |
| Relationships | Present in methodology and specialist workflows | Visible, queryable links between operational records |
| Progression | Specialist workflows and one Task completion action | Every open item exposes a working governed action and retained outcome |
| Priority | Area-specific order | Explainable impact-first recommendation |
| Service-account user | Conversation and bounded governance support | Oppa Mate is the recognisable company service account and may recommend type, route and next action within assigned permissions |
| Authority | Named human controls | Unchanged and made explicit in record transitions |

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
- the authority and inline exact confirmation required where consequence matters; and
- the retained actor, previous state, resulting state, note and timestamp.

Existing specialist items do not need to duplicate their source workflow. A methodology release decision routes from My Work into the Decision Inbox. A Brand Review item routes into Brand Review. Native Operate records progress through a type-and-status action contract.

Direct status changes cannot bypass that contract. The initial action vocabulary remains proposed product behaviour, but automated tests require every open Operations Bible state to expose at least one valid action. Consequential founder-controlled actions currently include:

- approving an Approval with exact **Approve** confirmation;
- accepting a Risk with exact **Accept risk** confirmation;
- approving and scheduling a Change with exact **Approve change** confirmation; and
- recording a material Decision with exact **Record decision** confirmation.

Each also requires a retained evidence, outcome or reason. Oppa Mate may recommend or prepare an action, but does not provide Jamie's confirmation. A Case cannot close while contained work remains open.

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

- a summary of total, overdue, blocked and decision work;
- up to five non-blocked **Do Next** items where possible;
- one unified inbox containing operational records, open change decisions and Brand Review work;
- recommended, newest, oldest and deadline ordering; and
- a detail panel with context, relationship and authority information.

## Ordinary-language capture

Capture requires only a description or title. Oppa Mate recommends a record type from the language supplied. The user may accept or correct it before saving. Optional impact, urgency, deadline, owner, Case, risk, control, strategy, journey and product fields improve routing and priority without blocking capture.

The activity record retains the recommended type, selected type and whether the recommendation was accepted. It does not retain a claim that classification approved the work.

## MVP boundary

Implemented in this proposal:

- unified **My Work** and **Do Next**;
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
- exact founder confirmation and retained rationale for Approval, Risk acceptance, Change authorisation and material Decision actions;
- Case-closure protection while contained work remains open; and
- local audit/activity evidence with no delete route.

Represented but not claimed as complete:

- mature Incident, Problem and Change workflows;
- automatic creation of every action or decision identified during AI analysis;
- automatic parent progress, service-level timing, assignment and escalation;
- scenario-test execution and comparison;
- customer-journey analytics;
- automatic assignment, notifications or operational execution;
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
13. Have Jamie complete or reject at least one Task, Approval, Decision and non-terminal transition through My Work.
14. Use at least ten real items for one week and compare recommended order and network signals with Jamie's judgement.
15. Record misclassification, false urgency, missing relationships, false links, missed links, unsuitable actions and inappropriate derived signals.
16. Run one independent-user capture, linking, action and prioritisation test before any broader use.

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

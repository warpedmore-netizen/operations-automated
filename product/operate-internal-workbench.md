---
id: OA-PRODUCT-011
title: Operate Internal Workbench Operating Model
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-25
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
| Priority | Area-specific order | Explainable impact-first recommendation |
| Assistant | Conversation and bounded governance support | Oppa Mate also recommends type, route and next action |
| Authority | Named human controls | Unchanged and made explicit in record transitions |

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

Case is a container, not a forced lifecycle. A Request may sit within a Case. An Incident or repeated Request may evidence a Problem. A Problem, Risk, Finding or Improvement may generate a Change. A Finding may result in no action or any relevant work record. A Scenario Test may create Findings, Risks, Problems, Tasks, Requests, Changes and Improvements.

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
- Cases, Requests and Tasks end to end;
- durable initial dictionary for all twelve record types;
- record details and related-work display;
- explicit record links;
- explainable priority;
- optional Case, journey and product classification;
- existing Decision Inbox and Brand Review items in the unified inbox;
- task completion;
- exact founder confirmation for an Approval to become approved or a Risk to become accepted; and
- local audit/activity evidence with no delete route.

Represented but not claimed as complete:

- mature Incident, Problem and Change workflows;
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
- **People and authority:** ownership and approval remain explicit and separate.
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
- the full dictionary may feel larger than the immediate MVP;
- Case can become a catch-all if boundaries are not learned through use;
- a unified inbox can become noisy without ownership and status discipline; and
- founder-specific tuning may not transfer to another user.

The mitigation is progressive disclosure, explainability, optional links and a bounded private pilot using real non-confidential work.

## Validation plan

1. Run the complete automated Workbench test suite.
2. Test creation and linking of a Case, Request and Task through the API.
3. Confirm completed work leaves the open inbox.
4. Confirm an Approval and accepted Risk reject missing or incorrect founder confirmation.
5. Review the interface at desktop and phone widths.
6. Use at least ten real items for one week and compare recommended order with Jamie's judgement.
7. Record misclassification, false urgency, missing relationships and inappropriate recommendations.
8. Run one independent-user capture and prioritisation test before any broader use.

## Decision required

Jamie should review whether this is the right bounded private-pilot model, especially:

- the twelve definitions;
- Case as a flexible container;
- the priority factors and their relative weight;
- the separation of classification, prioritisation, approval and risk acceptance; and
- the decision to defer external connections and advanced automation.

Release, merge and any broader use remain separate decisions.

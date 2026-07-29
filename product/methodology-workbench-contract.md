---
id: OA-PRODUCT-010
title: Methodology and AI Workbench Contract
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-29
approval_required: true
---

# Methodology and AI Workbench contract

## Status and role

This proposal defines the minimum exchange between the approved Operations Automated Methodology and the private AI Workbench. It does not approve the proposed Workbench, change Methodology meaning, release software or authorise a new connection.

The Methodology owns approved operational meaning through its human-readable repository artefacts. The Workbench applies that meaning, retains exact evidence and operational records, prepares governed changes and proves what version later work used. A machine record is a trace of application, not a second authority.

## Contract when applying the Methodology

For every material answer, assessment or implementation result, the Workbench retains and can return:

| Required information | Minimum meaning |
|---|---|
| Methodology version | Exact approved baseline version used, not the latest proposal |
| Relevant components | Stable component identifiers and links to human-readable authority |
| Exact knowledge snapshot | Snapshot identifier, repository source ref, indexed baseline, source status, version, hash and normative flag |
| User context | Authorised question, scope, operating context, intended outcome and target product where material |
| Evidence | Supplied and retrieved evidence with provenance and status |
| Assumptions | Conditions used without verification |
| Uncertainty | Missing, contradictory or weak evidence and why it matters |
| Result | Useful answer, assessment, artefact or implementation evidence |
| Options | Credible alternatives, including no change where appropriate |
| Recommendation | Proportionate position and reason |
| Authority required | Decision, judgement, permission or risk acceptance AI cannot infer |
| What the case tests | Methodology component, boundary, gap or transfer question exercised |
| Feedback route | A clear route linked to the exact answer and snapshot |

The result must conform to the approved useful-output contract. A response envelope that contains all fields but gives the user no practical value fails this contract.

## Contract when returning a Methodology change candidate

The Workbench returns:

| Required information | Minimum meaning |
|---|---|
| Source feedback | Original wording, source, date, permission and confidentiality boundary |
| Related feedback | Linked signals and the reason they are related |
| Current approved meaning | Exact approved sources, versions and relevant passages |
| Proposed meaning | Exact candidate wording, visibly not approved |
| Rationale | Why a Methodology change is preferable to answer, guidance or product correction |
| Evidence strength | Source types, corroboration, limitations and transfer evidence |
| Counter-tests | Relevant reverse, boundary, transfer, stakeholder, contrary-evidence, time, failure or authority tests |
| Disagreements | Human and AI disagreement, unresolved ambiguity and missing evidence |
| Alternatives | No change and credible smaller or different routes |
| Affected components | Principles, lenses, readiness, OPERATE, outputs, guides and evolution controls |
| Affected products and prompts | Delivery behaviour, registered prompts, publications and connected products |
| Migration | Existing records, users, versions, prompts, distribution and recovery implications |
| Tests | Automated controls, scenarios, user validation and later-use proof |
| Risks | Intended and unintended consequences, including added bureaucracy or lost authority |
| Recommendation | Approve preparation, revise, defer or reject—with reasons |
| Exact decision required | The precise bounded human decision and what it cannot authorise |

The Workbench may prepare this packet. It cannot approve, merge or release it.

## Learning-signal record

The Workbench retains each material signal's source, date, permission, confidentiality boundary, original wording, context, evidence, limitations, AI interpretation, affected components, related signals, controlled disposition, resulting record and outcome-review trigger.

The controlled dispositions are: already covered, answer-only correction, clarification, example or guidance need, more evidence, Methodology change candidate, product change candidate, separate-project candidate, urgent review and no action.

Feedback classification and related-signal detection are aids. The Workbench must show that they create no approval. An explicit relationship may be corrected, and a similarity match must not be treated as proof.

## Release and later-use proof

After Jamie's explicit release decision and implementation, the Workbench records:

- approver, scope, version, date and conditions;
- effective and superseded content;
- exact source commit and release Decision;
- affected prompts and products;
- migration and distribution destinations;
- reindex time and resulting baseline; and
- outcome-review trigger.

A later material conversation must produce a new knowledge snapshot whose baseline version and source ref prove which release it used. If the expected version is missing, the Workbench treats that as a distribution or retrieval failure rather than pretending continuity.

## Product and data boundaries

- Git remains authoritative for controlled Methodology meaning and release content.
- SQLite remains authoritative for local Workbench operational memory, including snapshots, signals, synthesis, proposals, releases and outcome reviews.
- Connected evidence remains evidence with its own permission and status.
- Dynamic Governance findings enter as controlled signals, not approval or automatic evidence.
- Incident Management RPG and Player Lab information is rejected unless an approved route establishes purpose, permission, data, retention and authority.
- The Workbench must not request or retain confidential employer, client or third-party information for Methodology learning.

## Failure and recovery

Stop or flag the route when:

- the approved Methodology version cannot be identified;
- human and machine representations conflict;
- a snapshot omits source version, status or hash;
- proposed material is treated as normative;
- related feedback loses its source or minority context;
- AI appears to authorise its own proposal;
- release content, prompt impact or distribution cannot be reconstructed; or
- a later conversation cannot prove which version it used.

Preserve the current approved baseline, mark the affected work incomplete, identify the owner and recovery action and retain the failure as a learning signal.

## Testable machine form

The [contract schema](../knowledge/methodology-contract.schema.json) defines application, signal, synthesis, change, release and outcome-review records. The [component registry](../knowledge/methodology-components.v0.7.json) defines stable component identifiers and human-readable authority links.

Workbench tests must prove:

- application records contain the minimum fields and cannot create approval;
- approved and proposed sources remain distinguishable;
- signals retain boundary and interpretation fields;
- related signals can be retrieved and synthesized without treating repetition as truth;
- proposals show current and proposed meaning and cannot self-approve;
- rejected change retains its source feedback;
- a simulated authorised release creates a complete release trace;
- a new conversation reports the reindexed version; and
- an outcome review links back to feedback, proposal and release.

These tests verify mechanics. They do not approve Methodology meaning, prove real-user value or authorise external use.

## Decision required

Jamie Peppard may approve, revise, defer or reject this contract separately from the Methodology Product Purpose, learning-system extension, Workbench software merge and private release.

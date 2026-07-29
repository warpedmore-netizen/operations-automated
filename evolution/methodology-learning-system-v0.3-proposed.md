---
id: OA-EVOLUTION-003-DRAFT
title: Methodology Learning System v0.3 Extension
status: proposed
version: 0.3-draft
owner: Jamie Peppard
date: 2026-07-29
approval_required: true
based_on: OA-EVOLUTION-001@0.2 approved for internal validation
---

# Methodology learning system v0.3 extension

## Status and purpose

This proposal extends the approved [Methodology Evolution System](methodology-evolution-system.md). It does not replace or amend the approved v0.2 meaning unless Jamie Peppard explicitly approves the exact successor and scope.

The learning system makes Operations Automated continually improvable while remaining human-led. It improves how evidence is captured, connected, tested, proposed, released and observed. It is not self-authorising.

## Learning inputs

The system may receive authorised signals from:

- direct questions, ordinary conversations, structured challenges and corrections;
- user, practitioner and specialist feedback;
- completed assessments and real operational work;
- successful, failed or confusing changes;
- incidents, near misses, scenario tests, audits, assurance findings and control failures;
- research, standards, authoritative guidance and changes in accepted practice;
- changes in regulation, automation, AI or agent capability;
- Workbench use and outcomes;
- Dynamic Governance findings;
- learning from separately controlled products through an approved contract; and
- contradictions, duplication or gaps inside the Methodology.

Access does not equal permission. Confidential employer, client or third-party information must not enter the repository or another product without an explicitly approved boundary.

## Minimum retained signal

Every material signal retains proportionately:

- stable identifier, source reference, source type and date;
- permission and confidentiality boundary;
- original wording where appropriate;
- user, operating and time context;
- evidence supplied, provenance, strength and limitations;
- AI interpretation and assumptions, visibly separate from the source;
- affected Methodology component or unknown scope;
- related signals and the reason for each relationship;
- triage classification and disposition;
- resulting proposal, decision, release or reason for no change; and
- outcome-review trigger.

A signal may be corrected or withdrawn where applicable without erasing the audit trail. Repetition increases the need to review; it does not prove correctness or importance.

## Controlled learning route

1. **Capture the signal.** Retain source, wording, context, permission, evidence and boundary.
2. **Triage type, scope and relevance.** Separate methodology, product, operational, project and urgent review implications.
3. **Retrieve related authority and learning.** Retrieve approved content, corrections, Decisions, releases, rejections and related signals.
4. **Reconstruct the strongest contextual meaning.** Do not turn conversational shorthand into an exaggerated universal claim.
5. **Separate information layers.** Show recorded evidence, human judgement, AI inference, assumptions and recommendation.
6. **Apply a proportionate counter-test.** Use a reverse, boundary, transfer, stakeholder, contrary-evidence, time-horizon, failure or authority test where it could change the conclusion.
7. **Set a disposition.** Use one of the controlled dispositions below.
8. **Link related signals.** Retain both the link and why it is material.
9. **Synthesize patterns where justified.** Preserve minority, contradictory and context-specific signals; a synthesis is proposed analysis, not truth.
10. **Draft only where justified.** Prefer an answer correction, explanation, example, product fix or further evidence when Methodology meaning need not change.
11. **Prepare an assurance pack.** Show current and proposed meaning, evidence, alternatives, risk, impact and exact decision.
12. **Obtain the appropriate human decision.** AI cannot supply, infer or simulate this decision.
13. **Implement through a separate controlled change.** Use a branch and draft pull request; do not edit the approved baseline in place.
14. **Release and version only after authority is recorded.** A merge or publication cannot create the authority.
15. **Reindex and distribute to approved delivery surfaces.** Record version, exact content, affected prompts and products, migration and destinations.
16. **Observe subsequent use and outcome.** Prove which version and snapshot a later interaction used and whether the intended result occurred.
17. **Retain learning, rejection or reversal.** Record the outcome, no-change reason, supersession or recovery route so the issue is not reopened without new evidence.

## Controlled dispositions

| Disposition | Meaning | Normal next action |
|---|---|---|
| Already covered | Approved meaning covers the point | Correct application or explanation; retain the reason |
| Answer-only correction | The immediate response was wrong or misleading | Correct the response; do not change Methodology automatically |
| Clarification | Meaning is sound but wording or navigation is unclear | Prepare a small clarification or accumulate evidence |
| Example or guidance need | Users need practical depth without changed meaning | Add or test a proportionate example, aid or practice guide |
| More evidence | The signal is plausible but weak, isolated or context-dependent | Link and revisit after a useful test |
| Methodology change candidate | Approved meaning may need to change | Prepare a bounded proposal and assurance pack |
| Product change candidate | Delivery behaviour, interface or implementation may need to change | Route to the product's controlled lifecycle |
| Separate-project candidate | Purpose, data, authority or lifecycle belongs elsewhere | Apply the project-boundary gate; do not create or migrate automatically |
| Urgent review | Possible legal, safety, security, ethical or authority failure | Escalate promptly without granting AI consequential authority |
| No action | Evidence does not justify further work | Retain the reason and review trigger, if any |

Classification and disposition organise work. They do not approve, prioritise or release it.

## Related-signal synthesis

Relatedness may come from an explicit link, shared Methodology component, connected outcome, common failure mode, dependency or sufficiently similar context. Text similarity is an aid, not the authority for the relationship.

A synthesis must show:

- every source signal and its boundary;
- the relationship between them;
- consistent, conflicting and minority positions;
- evidence strength and limitations;
- alternative interpretations and a counter-test;
- the affected approved meaning; and
- a recommended disposition that remains unapproved.

Do not suppress a material outlier because a cluster is larger. Do not reopen a rejected or deferred issue without new evidence or a named review trigger.

## Mutual challenge and disagreement

AI explains its interpretation and assumptions, states what changed after feedback, identifies where it still disagrees and selects a counter-test for decision value. It challenges its own preferred conclusion as readily as the authorised human's position.

The authorised human may challenge the Methodology. The Methodology may challenge the human's reasoning. Neither party's confidence is evidence. Performative disagreement is a delivery failure, and conversation must not continue merely until the user agrees through fatigue. Record convergence, contextual agreement, unresolved disagreement or need for more evidence honestly.

## Proposal and assurance contract

Every material proposal identifies:

- source and related feedback;
- current approved meaning and exact proposed meaning;
- rationale and evidence strength;
- counter-tests and unresolved disagreement;
- credible alternatives, including no change;
- affected components, products, prompts, users and records;
- migration, tests, risks, recovery and review trigger;
- AI recommendation; and
- the exact human decision required.

Proposed wording must remain visibly proposed. It cannot become an instruction used as approved Methodology merely because the Workbench retrieved it.

## Release, distribution and outcome trace

An approved release retains:

- approver, scope, version, date and conditions;
- effective and superseded content;
- source commit and approval Decision;
- affected prompts, products and existing records;
- migration requirements and recovery route;
- approved distribution destinations; and
- outcome-review owner and trigger.

The trace is:

> signal → related-signal synthesis → proposal → preparation Decision → implementation evidence → release Decision → versioned release → reindex and distribution → later-use proof → outcome review → retained learning

Release is reversible through a separately authorised correction, rollback, supersession or retirement. History remains traceable.

## Product boundaries

- **AI Workbench:** applies approved Methodology and manages operational learning records; it does not own meaning.
- **Dynamic Governance Tool:** may send a governed finding and receive an approved relevant release; its finding is not automatic Methodology authority.
- **Incident Management RPG and Player Lab:** may send permissioned signals only through an approved product contract; no application data, prompts, source code or release authority is shared by default.

## Machine-usable contract

The proposed [Methodology contract schema](../knowledge/methodology-contract.schema.json) defines application, signal, synthesis, change, release and outcome-review records. The proposed [component registry](../knowledge/methodology-components.v0.7.json) links machine identifiers to human-readable authority.

Machine records may preserve exact text and structured references. They must not silently paraphrase approved meaning. Where a registry summary and its source differ, the human-readable approved source controls and the conflict is retained for review.

## Validation before approval

Demonstrate, with non-confidential fixtures or controlled internal use:

1. application of v0.7 with exact version and knowledge snapshot;
2. an answer-only correction retained without Methodology change;
3. retrieval and synthesis of related signals;
4. a proposed change showing current and proposed meaning;
5. rejection of an unsupported change without losing the feedback;
6. a bounded simulated release route that AI cannot approve;
7. reindexing and a new conversation proving the changed version was used;
8. an outcome review linked from signal to release;
9. a Dynamic Governance finding retained only as a signal; and
10. exclusion of RPG or Player Lab data without an approved route.

Automated fixtures may prove control mechanics. They do not approve this proposal, validate the Methodology externally or substitute for real-user outcome evidence.

## Decision required

Jamie Peppard may approve, revise, defer or reject this proposed successor. Approval would require an exact scope and release record. Until then, `OA-EVOLUTION-001@0.2` remains the approved Methodology Evolution System.

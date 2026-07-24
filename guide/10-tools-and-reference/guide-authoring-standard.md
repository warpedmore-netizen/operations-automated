---
id: OA-GUIDE-111
title: Practice Guide Authoring Standard
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-23
last_updated: 2026-07-24
approval_required: true
---

# Practice guide authoring standard

## Purpose

This proposed standard makes future Operations Automated practice guides consistent, useful and honest about their completeness. It prevents a short outline from being mistaken for an implementation guide and prevents comprehensive paperwork from replacing practical value.

Use it for a detailed operational practice guide. Apply it proportionately: a section may be concise or explicitly not applicable, but it should not disappear when its omission could hide value, people, risk, authority, dependency or failure.

## Twenty-section practice-guide anatomy

| # | Section | What it must establish |
|---:|---|---|
| 1 | Status and applicability | Artefact ID, governance status, version, owner, approval scope, completeness level and contexts where the guide applies |
| 2 | Purpose and intended outcomes | Why the practice exists, whose journey and outcome give it purpose, and the problem it prevents |
| 3 | Intended reader, participants and roles | Who uses the guide, who performs the work and who is affected |
| 4 | When to use it | Entry triggers, recurring cadence, events and conditions that make the practice material |
| 5 | Scope, boundaries and non-goals | Included and excluded work, relationship to specialist obligations and what the guide must not claim |
| 6 | Concepts and terminology | Plain definitions, local-language alternatives and distinctions that materially affect action |
| 7 | Value, beneficiaries and minimum outcomes | The primary customer, service user or stakeholder journey, user-defined value, other people affected, minimum acceptable operation and authority over trade-offs |
| 8 | Inputs, evidence and entry criteria | Required information, sources, provenance, quality, uncertainty and prerequisites |
| 9 | Demand, work types and variation | Relevant triggers, clicks or interactions, demand categories, normal work, exceptions, urgency, volume, seasonality and consequence |
| 10 | Activities and workflow | Movement from the visible journey into the end-to-end operational value system, beginning with the first operational event and including normal, exceptional, escalation and review routes |
| 11 | Decision rights, rules and escalation | Rules, judgement points, decision authority, risk acceptance, escalation and unresolved ambiguity |
| 12 | Outputs, records and completion | Useful outcomes, retained artefacts, system-of-record boundary and evidence that the work is complete |
| 13 | Interfaces and dependencies | Upstream, downstream and cross-functional exchanges required by the journey, including ownership, timing, failure and recovery |
| 14 | People, capability and accessibility | Skills, capacity, workload, role design, training, consultation, accessibility and meaningful human involvement |
| 15 | Information, data and knowledge | Definitions, ownership, access, quality, privacy, retention, deletion, knowledge maintenance and audit history |
| 16 | Risks, controls and obligations | Potential harm, applicable duties, preventive, detective and corrective controls, and control-effectiveness evidence |
| 17 | Technology, automation, AI and agents | Existing technology, credible alternatives, justified delegation, permissions, evaluation, monitoring and human control |
| 18 | Measures, performance, feedback and learning | Outcome, flow, quality, risk and experience measures; receiver-centred feedback routes; baselines, targets, review triggers and retained learning |
| 19 | Failure, resilience and recovery | Failure signals, stop conditions, minimum outcomes, degraded operation, fallback, rollback, recovery and incident ownership |
| 20 | Tailoring, implementation, examples and known gaps | Scale and context tailoring, adoption route, worked example, limitations, missing evidence, related guidance and next review |

Each guide should begin with a short “use this guide when” summary and end with a governed next action. The twenty sections describe completeness; they are not a requirement to present every user with twenty pages.

## Interface contract

Every material interface should identify:

- provider, partner or affected party;
- information, demand, authority, capability or service received;
- outcome, decision, record, control or evidence provided;
- owner and decision authority;
- entry, completion, escalation and review trigger;
- failure signal and recovery route; and
- evidence that the interface works in practice.

Non-operational functions should not be placed in a generic stakeholder list when their authority, dependency or capability changes the operation.

## Completeness scale

Completeness describes content depth and evidence. It does not approve the guide.

| Level | Name | Minimum evidence |
|---:|---|---|
| C1 | Identified | The practice is named, its need is understood, existing coverage is linked and the absence of detailed guidance is visible |
| C2 | Outlined | Purpose, main topics, expected inputs and outputs, interfaces, existing guidance and known gaps are identified |
| C3 | Usable | All twenty sections have substantive content or a reasoned not-applicable statement; a non-author can follow the guide on at least one authorised case and complete the first useful action |
| C4 | Validated | The guide has been used across materially different cases or contexts, including exception or failure testing, cross-functional review and retained corrections |
| C5 | Publishable | Evidence supports the intended external audience and the guide has defined versioning, support, review cadence, withdrawal and change communication; external publication still requires explicit approval |

An artefact can be `proposed` at C4 or `approved` for a limited internal scope at C3. A C5 guide is publishable, not automatically Published. Always state governance status and completeness separately.

## Minimum quality controls

Before proposing a practice guide:

1. Confirm that it adds depth rather than duplicating an existing canonical source.
2. Separate recorded evidence, practitioner judgement, AI inference, assumption and recommendation.
3. Check all relevant operational lenses and explain any material exclusion.
4. Start from the primary customer, service user or stakeholder journey and show the operational injection points.
5. Move from the journey into the operational value system and state the required outcomes, priorities and minimum-outcome gates.
6. Select and combine methods deliberately for the context; explain why each material tool is suitable.
7. Show cross-functional interfaces and decision authority without claiming governance over whole specialist functions.
8. Include normal, exceptional, degraded and recovery conditions where relevant.
9. Explain what the user receives and how to use it.
10. Make feedback easy for the receiver in a suitable form or channel and show who responds.
11. Use the shortest presentation and minimum structure that preserve material reasoning.
12. Test terminology outside the author's immediate context.
13. Use UK English and plain language.
14. Exclude confidential employer, client or third-party information and proprietary artefacts.
15. Record sources, status, version, limitations and review trigger.
16. Validate links, identifiers, terminology, duplication and consistency before review.

## Naming and structure

- Use lowercase ASCII kebab-case filenames.
- Use one stable `OA-PRACTICE-XXX` identifier per practice guide.
- Keep filename order separate from version numbers.
- Use one canonical location for a rule and link to it elsewhere.
- Prefer generic capability or outcome names to one organisation's team title.
- Identify specialist frameworks as interfaces or constraints rather than claiming to replace them.
- Keep examples hypothetical or explicitly authorised and non-confidential.

## Authoring and approval boundary

AI may research, draft, map dependencies, generate examples and run checks. Practitioners and affected people provide operational context and challenge. The authorised human decides methodology meaning, approval scope and publication.

A complete guide is not necessarily a correct guide. A passed check, high completeness level or merged file does not constitute approval or external validation.

## Related guidance

- [Operational practice catalogue](../05-operational-practice-guides/README.md)
- [Methodology output contract](../../methodology/output-contract.md)
- [Actionable and self-guided decision aids](../../methodology/actionable-decision-aids.md)
- [Methodology Governance](../../GOVERNANCE.md)
- [Methodology evolution system](../../evolution/methodology-evolution-system.md)

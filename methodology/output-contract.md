---
id: OA-METHOD-005
title: Methodology Output Contract
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-20
---

# Methodology output contract

Operations Automated must give the user useful analysis and a governed next action as the work develops. Asking questions, collecting fields and displaying completed stages are supporting activities; they are not sufficient outputs by themselves.

## Minimum response contract

After every meaningful user contribution, a facilitated service or product should return a proportionate combination of:

1. **Current understanding:** a plain-English account of the operation, problem or decision.
2. **Evidence-based findings:** what the supplied evidence supports, with sources or user statements linked where practical.
3. **Interpretation:** what those findings may mean for value, people, flow, risk, readiness or delivery.
4. **Uncertainty:** assumptions, contradictions, missing evidence and confidence with reasons.
5. **Options and trade-offs:** credible choices, including retaining the current position where appropriate.
6. **Recommendation:** the next action and why it is proportionate.
7. **Human control point:** the decision, authority or acceptance that cannot be inferred by AI.
8. **Retained output:** the decision, model, plan, evidence or lesson added to the working record.

The system should ask only questions that materially improve one of these outputs. When information is incomplete, it should return the useful partial assessment already available and explain what each outstanding question will enable.

## Evidence discipline

The system must distinguish:

- **Recorded fact:** supplied evidence or an observed outcome
- **User judgement:** an assessment made by an identified person
- **AI inference:** a reasoned interpretation that requires validation
- **Assumption:** an unverified condition currently used in the analysis
- **Recommendation:** a proposed action, not an approval or fact

AI must not invent evidence, imply that an inference was observed or hide material uncertainty behind polished language.

## Outputs through the methodology

| Point in the work | Minimum useful output |
|---|---|
| Initial direction | Scope, intended value, affected people, authority and immediate evidence gaps |
| Operational review | Connected current-state picture across relevant operational lenses |
| Readiness review | Evidence-based profile covering the justified level of operational, automation, AI and agentic readiness |
| Observe | Current-state findings, exceptions, evidence quality and questions that matter |
| Prioritise | Ranked opportunities with value, impact, effort, risk, dependencies and trade-offs |
| Examine | Cause and dependency assessment separating observed conditions from hypotheses |
| Redesign | Target operational design, options, impacts, controls and transition implications |
| Automate | Technology, automation, AI or agentic decision with authority and human-control boundaries |
| Test | Test evidence, failures, residual risk, recovery result and accept/reject recommendation |
| Evolve | Retained lesson, decision or improvement, outcome measures and next review trigger |

## Operational assessment output

A complete assessment should be able to produce:

- Operational system and boundary map
- Value matrix
- Demand and work-type profile
- Flow and dependency view
- Ownership, decision and knowledge model
- Risk, control and resilience view
- Information, evidence and measurement requirements
- Readiness profile
- Prioritised opportunity portfolio
- Recommended target state and implementation roadmap
- Human, automation, AI and agent responsibility model
- Tests, measures, recovery and review triggers

Use the [operational assessment template](../templates/operational-assessment.md) as a working record, not as a requirement to complete every section at maximum depth.

## Product behaviour

A future delivery product should:

- Lead the user to the current decision rather than leaving them at an arbitrary page position
- Make current outputs more prominent than input forms
- Let the user inspect how an output was derived
- Show facts, interpretations, uncertainty and recommendations separately
- Retain progress without hiding earlier reasoning
- Explain what happens after an approval or transition
- Keep methodology version, authority and feedback routes visible
- Avoid presenting deterministic text assembly as independent AI analysis

## Human-controlled consequence

The system may analyse, challenge, rank and recommend. It must identify when an authorised person needs to choose, accept risk or permit action. A user clicking through a workflow, remaining silent or supplying information is not evidence of approval.

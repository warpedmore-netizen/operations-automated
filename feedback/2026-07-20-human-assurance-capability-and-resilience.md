---
id: OA-FEEDBACK-005
title: Human assurance, capability and resilience after automation
status: proposed
owner: Jamie Peppard
date: 2026-07-20
---

# Human assurance, capability and resilience after automation

## Source and boundary

- **Source:** Jamie Peppard's answer to the reverse test following the first founder check-in.
- **Scenario:** A hypothetical, highly automated invoice-matching work type with routine human review that may have become ceremonial.
- **Permission to use:** Jamie explicitly asked for continuing mutual challenge and answered the counter-case.
- **Confidentiality boundary:** General operational judgement and a hypothetical scenario. A personal software-building example has been generalised rather than retaining a named tool or implementation detail.

## Bounded work type

For this challenge, a **bounded work type** means a deliberately limited class of work with:

- A defined purpose, beneficiary and outcome
- Clear entry and exit criteria
- Known inputs, outputs and permitted actions
- A distinction between normal work, exceptions and prohibited cases
- Visible dependencies, consequences and obligations
- Measures, failure signals and evidence requirements
- A named human owner, escalation route and recovery design

It is narrower than claiming that an entire service, function or job is automated.

## Contextual convergence

Jamie accepted that a bounded work type may operate without routine human intervention. The stronger boundary is not a human click on every item but continuing human ownership, assurance, capability and resilience.

Jamie's judgement adds that:

- Repetitive approval work can be boring, ineffective and more error-prone than it appears.
- Human roles should shift from routine execution towards subject-matter expertise, quality assurance, training, improvement, troubleshooting and control design.
- QA should be performed by capable people with time, training and authority, not by nominal reviewers completing a tick-box.
- Oversight intensity should reflect organisational risk appetite, consequence and reversibility rather than a universal percentage or threshold prescribed by the methodology.
- Human spot checks, automated checks, reverse checks and service feedback can contribute to assurance.
- End-to-end measurement is needed before routine review is removed.
- Human capability remains valuable for unexpected questions, novel conditions and recovery.
- Workforce changes remain an explicit business decision, while the methodology should make their consequences and alternatives visible.

This changes the earlier statement from “never completely replace” to a contextual position: fully automated normal execution can be justified, but ownership and operational responsibility cannot be abandoned.

## What the AI still challenges

1. **AI checking AI may not be independent.** Models, data, prompts, evaluation criteria or infrastructure may share a blind spot or failure mode.
2. **No complaints do not prove success.** People may lack a usable feedback route, failures may be delayed, or measures may observe the system rather than the beneficiary's outcome.
3. **“Always correct” is not a realistic proof standard for probabilistic systems.** Assurance should increase confidence and reduce risk continuously against pre-defined tolerances rather than claim universal correctness.
4. **Manual capability may not equal usable recovery.** A small group may understand the task but be unable to process automated volumes during a long outage.
5. **Expert roles can create concentration risk.** A few subject-matter experts may become new bottlenecks or single points of failure unless knowledge, succession and decision authority are designed.
6. **QA and training can also become ceremonial.** They require relevant scenarios, demonstrated competence, feedback into system change and evidence that controls work in practice.

Current NIST guidance supports post-deployment monitoring, risk-based tailoring, independent assessors and feedback routes, while acknowledging that monitoring methods remain immature. This strengthens the need for layered assurance rather than one automated or human check.

## Methodology implication

The candidate [demand, residual-work and capability plan](2026-07-20-demand-led-automation-and-workforce-transition.md) should be tested with an assurance and resilience section covering:

- The boundary between automated execution and human ownership
- Independent, diverse and risk-based assurance layers
- Outcome, harm, drift and service-feedback measures
- Human competence, training, practice and succession
- Minimum critical service during failure
- Fallback capacity, degraded operation, alternative systems and recovery exercises
- Authority to change thresholds, suspend automation and accept residual risk

## Disposition

**Contextual convergence, with more evidence required.**

Do not propose a universal human-review percentage or an absolute ban on fully automated execution. Continue testing whether the methodology should require the assurance and resilience section whenever automation materially removes routine human execution.

The next counter-test should examine an automated operation whose scale makes complete manual fallback impossible.

## Retained lesson

Remove ceremonial human clicks, not human ownership. Build trained assurance, improvement and recovery capability around the automated work, with controls proportionate to consequence and reversibility.

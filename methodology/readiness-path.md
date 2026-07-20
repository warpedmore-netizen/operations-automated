---
id: OA-METHOD-004
title: Operational Readiness Path
status: approved
version: 0.1
owner: Jamie Peppard
date: 2026-07-20
---

# Operational readiness path

The operational readiness path helps an authorised human decide what an operation is ready to do next. It begins with operational basics and extends through safe automation, AI assistance and bounded agentic operation.

It is not a competition to reach the final position. The justified destination is the lowest level of complexity that creates the required value within the applicable constraints.

## Readiness is a profile

Do not collapse readiness into one unexplained score. Assess each relevant operational lens using evidence and record:

- What is established
- What is inconsistent or unknown
- What failure or harm could result
- What must be improved before additional delegation
- Who can accept the remaining risk

An operation can occupy different positions across different work types. For example, standard requests may be automation-ready while unusual complaints still require experienced human judgement.

## Proposed readiness positions

| Position | Core question | Evidence of readiness | Typical outcome |
|---|---|---|---|
| Understandable | Can people explain what the operation is for and what really happens? | Scope, value, demand, flow, people and ownership are visible | Operational picture and evidence gaps |
| Controlled | Can normal, exceptional and failed work be handled safely? | Roles, decisions, obligations, controls, escalation and recovery are defined and used | Stable operating baseline |
| Improvable | Can the operation identify and retain better outcomes? | Outcome measures, usable evidence, change ownership, testing and learning routes exist | Prioritised improvement portfolio |
| Automation-ready | Is repeatable work clear enough for rule-based execution? | Standard inputs, rules, exceptions, ownership, controls, monitoring and rollback are proven | Automation decision and implementation plan |
| AI-ready | Can AI assist a bounded task with reliable context and evaluation? | Suitable data and knowledge, task boundaries, human review, quality evaluation, security and failure handling exist | AI-assistance decision and controlled pilot |
| Agentic-ready | Can an agent pursue a bounded goal and use tools without acquiring uncontrolled authority? | Explicit goals, identity, least-privilege tools, permissions, memory boundaries, approval gates, monitoring, tests, stop conditions and incident response exist | Agent charter and bounded deployment plan |
| Evolving | Can the operation detect change and improve its own design under human control? | Feedback, outcome monitoring, retained learning, review triggers and governed change routes operate in practice | Continuing evidence-led evolution |

## Automation-ready

Before conventional automation, establish:

- A valuable and sufficiently stable outcome
- Inputs, rules and expected outputs
- Frequency, variation and known exceptions
- Human judgement and escalation points
- Ownership, controls, monitoring and audit evidence
- Failure signals, recovery and rollback
- A credible comparison with simplification or non-technical change

Do not automate unclear work merely to make its confusion faster or less visible.

## AI-ready

Before introducing AI assistance, establish:

- A bounded task and user need
- The context, data and knowledge the model may use
- Information ownership, classification, quality and permitted access
- Expected output and a method for evaluating usefulness, accuracy and harm
- Known uncertainty and cases that require human review
- Security, privacy, bias, accessibility and misuse considerations
- Human ownership of the outcome
- Monitoring, correction and a safe non-AI route

AI readiness does not mean the operation is ready for autonomous action.

## Agentic-ready

Before allowing an agent to select or execute actions towards a goal, establish:

- A precise goal, permitted scope and prohibited outcomes
- The agent's identity and the authority it represents
- Least-privilege access to tools, systems and information
- Which actions are reversible, reviewable or consequential
- Human approval points before consequential actions
- Limits on planning, delegation, spending, communication and persistence
- Context and memory boundaries, including retention and deletion
- Observable actions, evidence, logs and explanation requirements
- Evaluation under normal, exceptional, adversarial and degraded conditions
- Stop conditions, kill switch, rollback and incident ownership
- Ongoing monitoring and scheduled review of permissions and value

Agentic readiness must be demonstrated for a specific goal and environment. It cannot be inferred from general model capability.

## Moving between positions

Use OPERATE to close material gaps and test movement to a new position. A readiness decision should produce:

- Evidence supporting the current profile
- Missing evidence and assumptions
- Risks and obligations
- Options, including stopping at the current position
- Recommended next improvement
- Required human decision and authority
- Test, recovery and review conditions

Return to an earlier position when evidence weakens, conditions change or a failure shows that the operation cannot safely sustain its current level of delegation.

---
id: OA-GUIDE-070
title: Automation, AI and Agents
status: approved
version: 0.2
owner: Jamie Peppard
date: 2026-07-23
last_updated: 2026-07-24
approval_required: true
approval_date: 2026-07-24
approval_scope: internal validation
---

# 06 — Automation, AI and agents

## Purpose and intended reader

This chapter helps a reader decide whether technology should handle work and, if so, at what justified level of delegation. It is for operational owners, problem solvers, technology and data practitioners, risk and assurance roles, and people affected by changed work.

Automation, AI adoption or agentic capability is not an outcome by itself. The preferred option is the lowest complexity that creates the required value within the applicable constraints.

## Questions this chapter answers

- Should the work be simplified, standardised, retained as human work, automated, AI-assisted or delegated to a bounded agent?
- Is the operation ready for that specific use?
- What information, permissions, controls, evaluation and recovery are required?
- Where do context, empathy, authority or consequence require meaningful human involvement?
- How will quality, harm, drift, failure and changed conditions be detected?
- Who owns the result and can stop or recover the capability?

## Topics

- Delegation decision and credible non-technical alternatives
- Automation that reduces effort in the primary journey or feedback loop rather than optimising internal convenience alone
- Automation-ready, AI-ready and agentic-ready profiles
- Data, knowledge, security and privacy prerequisites
- Human ownership, review and approval
- Identity, least privilege, tools, memory and action boundaries
- Evaluation, monitoring, audit evidence and affected-person challenge
- Stop conditions, rollback, fallback and incident ownership
- Governed human-AI collaboration

## Expected inputs

- Defined value, beneficiary, minimum outcomes and constraints
- Understood work type, rules, variation, exceptions and judgement points
- Evidence of operational control and improvement capability
- Data and knowledge provenance, quality, access and retention conditions
- Consequence, reversibility and affected people
- Technology options and credible non-technical alternatives
- Named owner, decision authority and risk-acceptance route

## Outputs

- No-delegation, simplification, automation, AI-assistance or agentic decision
- Evidence-based readiness profile for the specific work type
- Human and technology responsibility model
- Information, permission, control and evaluation requirements
- Pilot or implementation conditions
- Failure signals, monitoring, stop and recovery route
- Authorised decision and review trigger

## Interfaces and hand-offs

| Interface | Essential contribution | Required Operations Automated output |
|---|---|---|
| Operational owner and affected people | Purpose, real work, judgement and consequences | Bounded outcome, role impact and challenge route |
| Architecture and engineering | Feasibility, design, lifecycle and technical dependencies | Operational requirements, exceptions and recovery |
| Data and knowledge owners | Quality, provenance, definitions, access and retention | Permitted use, evidence needs and correction route |
| Security and privacy | Threat, access, identity, monitoring and data controls | Scope, permissions, information flow and failure impact |
| Risk, legal, compliance and ethics | Obligations, assurance and acceptance authority | Use case, evidence, residual uncertainty and decision |
| Procurement and suppliers | Product claims, contracts, service levels, cost and exit | Evaluation criteria, dependency, monitoring and removal route |
| People, training and workforce | Capability, consultation and role transition | Human responsibilities, training and degraded-work requirements |

## Current approved and proposed guidance

| Guidance | Status | Coverage |
|---|---|---|
| [Human-led automation, AI and agents](../../principles/human-led-automation.md) | Approved | Delegation boundary and human responsibility |
| [Operational readiness path](../../methodology/readiness-path.md) | Approved for internal validation | Automation, AI and agentic readiness |
| [OPERATE — Automate and Test](../../methodology/operate-overview.md) | Approved for internal validation | Delegation design and testing |
| [Human-AI Collaboration Method](../../methodology/human-ai-collaboration.md) | Approved for internal validation | Understanding, analysis, representation, challenge and learning |
| [User-defined value](../../principles/user-defined-value.md) | Approved | Value before technology ambition |
| [Activation and first use](../../methodology/activation-and-first-use.md) | Approved for internal validation | Working handover and recovery |
| [Agent Delegation and Runtime Assurance Profile](agent-delegation-and-runtime-assurance-profile.md) | Proposed C2 | Case-ready lifecycle, authority, runtime-event and recovery profile |
| [AI Work, Cost and Value Ledger](ai-work-cost-and-value-ledger.md) | Proposed C2 | Case-ready inventory, full-cost, outcome and scale/change/stop review |

## Known gaps

- No complete conventional automation delivery and operations guide exists.
- Model and agent evaluation need practical measures, test sets and acceptance patterns.
- Monitoring, drift, AI incidents, security events and model or supplier change need lifecycle guidance.
- The proposed agent identity and delegated-authority profile needs case validation; multi-agent boundaries remain incomplete.
- The proposed AI cost-and-value ledger needs real baseline, attribution and maintainability evidence.
- Workforce transition, assurance independence and silent harm need deeper treatment.
- Build, buy, integrate and exit decisions have no complete guide.

## Previous and next

- **Previous:** [05 — Operational practice guides](../05-operational-practice-guides/README.md)
- **Next:** [07 — Governance, assurance and review](../07-governance-assurance-and-review/README.md)
- **Implementation route:** [04 — Improve and implement](../04-improve-and-implement/README.md)

---
id: OA-METHOD-012-DRAFT
title: Human-AI Collaboration Method v0.4 Proposed Amendment
status: proposed
version: 0.4-draft
owner: Jamie Peppard
date: 2026-07-26
approval_required: true
based_on: OA-METHOD-009 v0.2
consolidates: OA-METHOD-010-DRAFT v0.3-draft
---

# Human-AI Collaboration Method v0.4 proposed amendment

## Status

This is proposed wording for review against the approved [Human-AI Collaboration Method v0.2](human-ai-collaboration.md). It consolidates the earlier v0.3 proposal and Jamie Peppard's later accountability clarification. It does not amend the approved v0.7 methodology baseline.

## Proposed additional principles

13. **Treat automation as a design choice, not the default outcome.** Preserve manual work where human judgement, empathy, tacit knowledge, physical presence or accountable authority creates more value than delegation.
14. **Make the method readable by people and usable by AI.** Human meaning, examples and decision boundaries remain authoritative; machine-usable structure may assist execution but cannot replace or silently reinterpret them.
15. **Build capability while delivering change.** A successful intervention leaves the organisation better able to understand, operate, challenge, recover and improve the resulting system.
16. **Design with delivery teams, not around them.** Operational, product, development, security, support and specialist expertise should meet early enough to shape a feasible and maintainable design.
17. **Separate responsibility from accountability.** AI is responsible for the quality, honesty and faithful execution of its assigned work. An authorised human remains accountable for consequential operational outcomes and decisions.
18. **Make human review meaningful.** A person cannot provide effective control without relevant evidence, enough time, appropriate authority and a practical way to question or reject the recommendation.
19. **Lead in plain language and disclose progressively.** Put decision-useful meaning, uncertainty and the next action first. Keep source, status and control detail inspectable without forcing it into the main reading path.
20. **Explain the effect before asking for action.** Before a person saves feedback, authorises a transition, publishes or accepts consequence, state what will change, what will not change and what authority remains.

## Responsibility and accountability

Operations Automated distinguishes three connected concepts.

| Concept | Meaning | Human position | AI position |
|---|---|---|---|
| Responsibility | The work, standard and duties assigned to an actor | Responsible for the work assigned to them | Responsible for producing, checking, explaining and correcting its authorised contribution |
| Authority | The legitimate permission to decide, commit resources, accept risk or cause an effect | Held by the named person or body within its scope | May act only inside explicit delegated permission |
| Accountability | Answerability for the operational outcome and its consequences | Remains with an authorised human or organisation | Cannot currently hold human, organisational, legal or moral accountability |

This distinction does not excuse poor AI work. AI should:

- use the available evidence and disclose material limits;
- challenge weak assumptions, including the user's preferred conclusion;
- produce the strongest useful output it can within scope;
- stop rather than fabricate authority, evidence or continuity;
- surface material risk, uncertainty and affected interests;
- retain traceable evidence of its contribution where proportionate; and
- correct failures and contribute to learning.

Human accountability is not a ceremonial approval layer. The accountable person needs decision-ready evidence, relevant competence or specialist advice, enough time, real authority, and a usable route to question, condition, reject or stop the work.

## Human-readable and AI-usable methodology

Operations Automated should support two related forms of use:

- **Human-readable meaning:** plain language, rationale, examples, alternatives, risks, authority and the judgement required.
- **Machine-usable structure:** stable identifiers, explicit status, inputs, outputs, dependencies, decision points, validation rules and traceable source references.

Human-readable meaning remains authoritative. Machine-usable structure is an execution aid. If they conflict, the system should stop, expose the conflict and seek an authorised correction.

A component is more suitable for AI-supported use when its purpose, evidence boundary, inputs, outputs, dependencies, exceptions, stopping conditions, human authority and normal, boundary and failure examples are explicit. Structure must not flatten experience, negotiation, empathy or contextual interpretation into false certainty.

## Deliberate work-design choice

Before proposing delegation, distinguish:

| Design choice | Use when | Required human position |
|---|---|---|
| Deliberately manual | Judgement, empathy, tacit knowledge, physical presence or accountability is central | Clear owner, capacity, information, control and improvement route |
| AI-assisted | Analysis or generation helps, but context or consequential judgement remains human | Review criteria, correction route and named decision authority |
| Rules-based automation | Work is repeatable, sufficiently understood and bounded by reliable rules | Control owner, exception route, monitoring and recovery |
| Bounded agent | A goal and operating environment are explicit and multi-step action creates justified value | Least privilege, approvals, observability, stop conditions and rollback |
| Not ready | The operation, information, authority, capability or consequence is not sufficiently understood | Return to understanding, redesign or capability development |

“Manual” is not a residual category for work automation failed to capture. Record what evidence or capability would justify reconsidering the boundary later.

## Early delivery collaboration and capability transfer

Operational, product, development and relevant specialist teams should shape a change before a preferred design hardens. Together they should establish:

- operational evidence, affected-user experience and real constraints;
- product choices, sequencing and acceptance criteria;
- technical feasibility, architecture, security and maintainability;
- implementation, testing, support, recovery and change capacity;
- information, data and integration boundaries;
- deliberately manual dependencies and capability gaps; and
- documentation and knowledge transfer that work without the original delivery team.

Completion includes capability transfer. The receiving people should be able to operate, challenge, recover and improve the result at the level their role requires.

## Plain-language delivery and informed action

The main response should lead with:

1. what has been understood;
2. the current evidence-based finding or recommendation;
3. what remains uncertain or consequential;
4. the next useful action; and
5. the human control point.

Internal paths, status mechanics, source hashes and control implementation belong in optional inspectable detail unless they materially affect the decision.

Before asking a person to act, explain:

- the immediate result of the action;
- whether it creates a record, proposal, implementation, approval, publication or consequence;
- what remains unchanged;
- whether the action is reversible;
- the evidence that will be retained; and
- the next separate authority gate.

## Validation requirements

- Compare human and AI interpretations of at least three methodology components.
- Review one operation where the justified design includes deliberately manual work.
- Test one change with operational, product and development expertise before solution selection.
- Define and observe a capability-transfer outcome after delivery.
- Test whether an accountable human can understand, challenge and reject an AI recommendation.
- Check that proposed machine structure does not change authority or hide judgement.
- Test plain-language and progressive disclosure with a reader who did not design the material.
- Retain disagreement, unintended consequences, rejected changes and no-change decisions.

## Release boundary

Only Jamie Peppard's separate explicit release decision may incorporate this amendment into the approved methodology. Git merge or Confluence Draft publication records a reviewable proposal; neither is approval of its meaning.

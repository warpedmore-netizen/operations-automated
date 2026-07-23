---
id: OA-METHOD-011
title: Current Methodology Synthesis and Visual Map
status: approved
version: 0.2
owner: Jamie Peppard
date: 2026-07-23
approval_required: true
approval_date: 2026-07-23
approval_scope: internal validation
---

# Current methodology synthesis and visual map

## Status

This is the simplest current view of Operations Automated v0.6. Jamie Peppard approved the combined baseline on 2026-07-23 for internal validation. It is not externally validated or approved for external publication.

## The method at a glance

```mermaid
flowchart LR
    A["Purpose, people, value and authority"] --> B["Understand the connected operation"]
    B --> C["Assess operational and technology readiness"]
    C --> D["Use OPERATE to improve and implement"]
    D --> E["Return the smallest useful output"]
    E --> F["Activate it and prove first use"]
    F --> G["Observe outcomes and retain learning"]
    G --> B

    H["Human authority and consequence"] -. governs .-> A
    H -. governs .-> C
    H -. governs .-> D
    H -. governs .-> F

    I["Evidence, uncertainty and obligations"] -. constrain .-> B
    I -. constrain .-> C
    I -. constrain .-> D
    I -. constrain .-> E

    J["Human-AI collaboration"] -. adapts and challenges .-> B
    J -. adapts and challenges .-> E
    J -. learns with .-> G
```

## Seven working rules

1. Start with the intended outcome, beneficiary and user-defined value.
2. Understand the operation as a connected system rather than an isolated process.
3. Use evidence to decide the justified level of operational, automation, AI or agentic readiness.
4. Improve and simplify before delegating work to technology.
5. Return useful analysis and the smallest usable aid, not forms or questions alone.
6. Keep authority, consequence, obligations, uncertainty and recovery visible.
7. Prove that the user can use the result, then retain learning and improve the method.

## How the components fit

| Layer | Component | Current status |
|---|---|---|
| Direction | [Founder Charter](../CHARTER.md), user-defined value and human-led automation | Approved for internal validation |
| Understanding | [Operational lenses](operational-lenses.md) and [connected work, risk and control](connected-work-risk-and-control.md) | Approved for internal validation |
| Readiness | [Operational readiness path](readiness-path.md) | Approved for internal validation |
| Improvement | [OPERATE](operate-overview.md) | Approved for internal validation |
| Delivery | [Output contract](output-contract.md) and [proportionate delivery modes](proportionate-application-and-delivery-modes.md) | Approved for internal validation |
| Practical use | [Actionable decision aids](actionable-decision-aids.md) using simplicity and progressive disclosure | Approved for internal validation |
| Collaboration | [Human-AI Collaboration Method](human-ai-collaboration.md) | Approved for internal validation |
| Completion | [Activation and first use](activation-and-first-use.md) | Approved for internal validation |
| Evolution | [Methodology evolution system](../evolution/methodology-evolution-system.md) and founder challenge loop | Approved for internal validation |

## Feedback coverage

| Founder feedback theme | Where it is now represented | Position |
|---|---|---|
| Operations Automated is wider than OPERATE and must return real value | Architecture, lenses, readiness path and output contract | Approved v0.4/v0.5 baseline |
| Start from demand and value; segment work before automation | Founder synthesis, value principle, lenses and readiness path | Approved v0.5 guidance |
| Replace ceremonial review with capable assurance, training and recovery | Founder synthesis and human-led automation principle | Approved v0.5 guidance; detailed assurance remains to validate |
| Define minimum outcomes and proportionate degraded operation | Founder synthesis, risk-and-control module and readiness path | Approved v0.5 guidance |
| Define criticality through material harm and route authority by consequence | Founder synthesis and connected work, risk and control | Approved v0.5 guidance |
| Link cases, requests, incidents, problems, risks, controls and decisions | Connected work, risk and control | Approved v0.5 module |
| Use one method through Ask and assessment/project modes | Proportionate application and delivery modes | Approved v0.5 module |
| Do not force an answer when evidence is insufficient | Ask-mode answerability gate | Approved v0.5 module |
| Make founder and AI challenge mutual rather than one-in, one-out | Founder challenge and feedback loop | Approved v0.5 mechanism |
| Give users a practical way to work out the answer | Actionable decision aids | Approved v0.6 guidance |
| Keep the first output simple rather than oppressive | Progressive disclosure and shortest-usable-output rule | Approved v0.6 guidance |
| A deliverable is incomplete until the user can activate and use it | Activation and first use | Approved v0.6 guidance |
| Govern how AI understands, represents, challenges, remembers and learns | Human-AI Collaboration Method | Approved v0.6 guidance |

## What remains open

The methodology meaning has been captured; the main gaps are now evidence and depth:

- simplify and independently test the first decision aid;
- run a materially different second facilitated case;
- validate activation and first use across two different delivery types;
- pilot the Human-AI Collaboration Method across seven materially different interactions;
- develop deeper guidance for assurance independence, silent harm and human capability;
- decide which proof-of-concept product features support the validated method; and
- complete security, commercial and external-publication decisions separately.

## Control boundary

Jamie Peppard retains final approval over methodology meaning, release, external publication and consequential authority. The v0.6 components are approved only for internal validation and must not be described as externally validated.

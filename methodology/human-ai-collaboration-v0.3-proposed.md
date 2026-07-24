---
id: OA-METHOD-010-DRAFT
title: Human-AI Collaboration Method v0.3 proposed amendment
status: proposed
version: 0.3-draft
owner: Jamie Peppard
date: 2026-07-24
approval_required: true
based_on: OA-METHOD-009 v0.2
---

# Human-AI Collaboration Method v0.3 proposed amendment

## Status and scope

This is proposed wording for review against the approved [Human-AI Collaboration Method v0.2](human-ai-collaboration.md). It does not amend the approved v0.6 methodology baseline.

The amendment addresses four connected questions:

1. Can the complete methodology be understood by people and used reliably by AI?
2. How should Operations Automated design work that should remain manual?
3. When should product, operational and development teams shape a change together?
4. How should delivery leave stronger internal capability rather than dependency?

## Proposed additional principles

13. **Treat automation as a design choice, not the default outcome.** Preserve manual work where human judgement, empathy, tacit knowledge, physical presence or accountability creates more value than automation.
14. **Make the method readable by people and usable by AI.** Human meaning, examples and decision boundaries remain authoritative; machine-usable structure may assist execution but cannot replace or silently reinterpret them.
15. **Build capability while delivering change.** A successful intervention leaves the organisation better able to understand, operate, challenge and improve the resulting system.
16. **Design with delivery teams, not around them.** Product, operational and development expertise should meet early enough to test feasibility, reveal dependencies and shape a maintainable implementation.

## Human-readable and AI-usable methodology

Operations Automated should support two related forms of use:

- **Human-readable meaning:** plain language, rationale, examples, alternatives, risks, authority and the judgement required.
- **Machine-usable structure:** stable identifiers, explicit status, inputs, outputs, dependencies, decision points, validation rules and traceable source references.

Human-readable meaning remains authoritative. Machine-usable structure is an execution aid. If they conflict, the system should stop, expose the conflict and seek an authorised correction.

A methodology component is more suitable for AI-supported use when:

- its purpose and intended outcome are explicit;
- evidence, inference, assumption, recommendation and approval are distinguishable;
- required context, inputs and outputs are identifiable;
- dependencies, exceptions and stopping conditions are visible;
- human authority and residual judgement are named;
- examples include normal, boundary and failure cases;
- uncertainty can be represented without fabricating precision; and
- the AI can explain its proposed action in language an affected person can review.

Structure must not flatten experience, negotiation, empathy or contextual interpretation into a false binary. AI should identify and support the human contribution rather than pretending the work is deterministic.

## Manual work and automation suitability

Before proposing automation, distinguish:

- work that is repeatable and sufficiently understood;
- work that could be supported while authority remains human;
- work that should remain manual for now;
- work that is not yet understood well enough to redesign; and
- capability or technical dependencies that must be developed first.

“Manual” is not a residual category for work automation failed to capture. Manual work should have a defined purpose, owner, information need, capacity implication, control and improvement route. Record what evidence or capability would justify reconsidering the boundary later.

## Product, operational and development collaboration

Product, operational and development teams should contribute:

- operational evidence, constraints and affected-user experience;
- product choices, sequencing and acceptance criteria;
- technical feasibility, architecture, security and maintainability;
- implementation, test, support and recovery capability;
- knowledge transfer and documentation usable without the original delivery team; and
- candid evidence about capability gaps, manual dependencies and technical debt.

These teams should be involved before a preferred design hardens into a specification. Their contribution is part of understanding the operation, not a late feasibility check.

## Challenge portfolio

Continuing methodology challenges should deliberately test:

- the coherence and usefulness of Operations Automated principles;
- whether people and AI can use the methodology without losing meaning;
- where work should remain manual and what human thinking it requires;
- how operational change should be shaped with product and development teams;
- whether delivery creates dependency or develops internal capability; and
- which components remain too implicit, abstract or difficult to validate.

Each challenge should normally ask one primary question. AI should provide a concrete situation, its provisional response and the uncertainty that makes the question worth answering.

## Validation requirements

- Compare human and AI interpretations of at least three methodology components.
- Review one operation where the justified design includes deliberately manual work.
- Test one change with product, operational and development representatives before solution selection.
- Define and observe a capability-transfer outcome after delivery.
- Check that proposed machine structure does not change authority or hide judgement.
- Retain disagreement, unintended consequences and no-change decisions.

## Release boundary

This draft is reversible by rejecting or deferring the proposal while retaining the evidence. Only Jamie Peppard's separate explicit release decision may authorise incorporation into the approved methodology.

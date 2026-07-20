---
id: OA-CHANGE-005
title: Establish the daily founder methodology evolution loop
status: proposed
owner: Jamie Peppard
date: 2026-07-20
approval_required: true
---

# Daily founder methodology evolution loop v0.5 proposal

## Proposed change

Make regular founder challenge and feedback the next Operations Automated internal-validation mechanism.

Support both founder-initiated operational questions and an AI-initiated daily check-in. Require a provisional methodology response, structured feedback disposition and a plain-English assurance pack before any material change is approved.

## Reason

Version 0.4 established the methodology architecture and evolution principles. It did not yet make founder participation a repeatable daily practice or define how Jamie can quickly assure changes without reviewing raw files and diffs.

Jamie requested a daily 08:00 check-in based on the approved documentation and current public operational discussion, with questions that can be answered in 5–20 minutes. Jamie also wants to challenge the methodology by asking questions and evaluating its answer.

The triggering feedback is retained in the [daily founder evolution-loop record](../feedback/2026-07-20-daily-founder-evolution-loop.md).

## Implemented pilot mechanism

An active local Codex automation named `Daily methodology challenge` now runs daily at 08:00 UK time.

It is read-only and instructed to:

- Read the approved repository
- Rotate across operational and methodology topics
- Research accessible public discussion from a balanced source mix
- Provide a provisional Operations Automated response and possible blind spot
- Ask one primary and no more than two optional questions
- State a 5-, 10- or 20-minute response time
- Avoid confidential information and restricted services
- Make no repository or methodology change during the scheduled run

## Controlled response workflow

After Jamie responds, AI:

1. Answers or acknowledges the operational substance.
2. Separates founder judgement from methodology feedback and AI inference.
3. Records material feedback and links related signals.
4. Recommends no change, clarification, more evidence, material proposal or urgent review.
5. Drafts only the smallest coherent change supported by the evidence.
6. Produces an assurance pack and draft pull request for material change.
7. Implements approval only after Jamie explicitly authorises it.
8. Reviews the outcome and retains rejection or no-change reasoning.

## Assurance design

The assurance pack gives Jamie:

- The decision in one sentence
- The current and proposed meaning
- What Jamie said and what AI inferred
- Evidence strength, disagreement and alternatives
- Affected methodology and product elements
- Dependency, contradiction, authority and boundary checks
- Trade-offs, residual risk and review trigger
- The exact approval boundary and what remains unapproved

This is intended to make assurance possible without developer knowledge while preserving access to the underlying pull request and evidence.

## Alternatives considered

### Continue only with ad hoc conversations

Low administrative effort, but topic coverage, source evidence, feedback retention and cadence would remain inconsistent.

### Automatically update the methodology from every answer

Fast but unsafe. It would confuse feedback with approval, create excessive change and weaken coherent governance.

### Daily challenge with controlled, evidence-led batching

Recommended. It creates regular learning while allowing no-change decisions, clarification and evidence accumulation before material proposals.

## Risks and controls

- **Question fatigue:** one focused question, visible response time, optional skipping and review after seven completed responses.
- **Trend chasing:** source diversity, evidence-strength labels and no assumption that popularity equals truth.
- **Repetition:** review retained topics and rotate across methodology facets.
- **AI confirmation bias:** show possible blind spots, contrary evidence and strongest alternatives.
- **Change volume:** not every answer creates a proposal; retain no-change and more-evidence dispositions.
- **Authority drift:** scheduled task is read-only; Jamie explicitly approves material meaning and merge.
- **Confidentiality:** public sources only and no request for confidential operational examples.

## Success measures

- Jamie can respond without developer or methodology preparation.
- Most check-ins fit their stated 5-, 10- or 20-minute response time.
- Topics cover different operational lenses and readiness positions.
- The provisional methodology answer gives Jamie something concrete to critique.
- Material feedback is traceable to a disposition and, where justified, an assurance pack and decision.
- Assurance packs let Jamie explain what will change and what remains controlled.
- The cadence can be changed when evidence shows daily is not useful.

## Decisions requested from Jamie

1. Adopt the founder challenge and feedback loop as the v0.5 internal-validation mechanism?
2. Confirm that the active 08:00 UK daily schedule should continue while the first seven completed responses are evaluated?
3. Approve the read-only public-source boundary and no-contact rule for daily research?
4. Require the proposed assurance pack before material methodology approval?
5. Keep external feedback forms, private social-media access, analytics and messaging connections as separate future decisions?

## Jamie's decision

- **Decision:** Pending
- **Approver:** Jamie Peppard
- **Date:**
- **Conditions or requested changes:**

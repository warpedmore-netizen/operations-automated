---
id: OA-EVOLUTION-002
title: Founder Challenge and Feedback Loop
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-20
---

# Founder challenge and feedback loop

The founder challenge and feedback loop makes methodology development a regular working practice rather than an occasional documentation exercise.

It gives Jamie two simple ways to challenge Operations Automated:

1. Jamie asks an operational question or describes a situation, and AI applies the approved methodology for Jamie to critique.
2. AI sends a daily evidence-backed challenge with a provisional Operations Automated response for Jamie to correct, extend or reject.

Both routes feed the same controlled evolution process. Jamie should not need to design a change, edit a file or understand GitHub to participate.

## Route 1: Jamie-initiated challenge

Jamie may describe any non-confidential operational problem, decision, disagreement or hypothetical scenario in ordinary language.

AI should return:

- A plain-English operational assessment or answer
- The value, people and system boundary it assumed
- Relevant operational lenses and readiness considerations
- Evidence, inference, uncertainty and missing information
- Options, trade-offs and a recommendation
- Human authority or decision required
- A short statement of what this case tests in the methodology

Jamie then explains what is correct, wrong, incomplete or impractical. Jamie's reply is operational judgement and methodology feedback, not approval of a change.

## Route 2: AI-initiated daily challenge

An active local Codex automation named `Daily methodology challenge` runs each day at 08:00 UK local time for the Operations Automated project.

The scheduled task is read-only. It may:

- Read the current approved repository
- Review retained feedback and recent topics
- Research accessible current public sources
- Select one useful scenario or tension
- Apply the methodology provisionally
- Ask Jamie one primary and up to two optional questions

It may not edit files, create a branch, contact people, log into a restricted service, collect confidential information or approve a methodology change.

## Source mix and evidence

Daily challenges should rotate between relevant sources such as:

- Public practitioner forums and discussions
- Accessible public LinkedIn material
- Professional and standards bodies
- Current research and official publications
- Credible operational, technology, risk and AI sources
- Documented gaps or contradictions inside Operations Automated

Where practical, use at least two independent sources from different categories. If only one source supports a signal, label it as weak or anecdotal. Public discussion is an input to examination, not proof that the methodology should follow popular opinion.

Do not log in, scrape restricted pages or reproduce personal or confidential material. Link to sources and paraphrase only what is necessary to explain the challenge.

## Daily check-in contract

The check-in should contain:

1. **Today's challenge:** a realistic scenario or decision.
2. **Why it matters:** the methodology element and user outcome being tested.
3. **Public signal:** what current evidence or discussion suggests and how reliable it is.
4. **Provisional Operations Automated response:** how the approved method currently handles the case.
5. **Possible blind spot:** what the response may have missed or oversimplified.
6. **One primary question:** the judgement Jamie is best placed to provide.
7. **Optional follow-ups:** no more than two.
8. **Response time:** 5, 10 or 20 minutes.
9. **Next step:** how Jamie's answer will enter the controlled feedback process.
10. **Sources:** direct links.

Jamie may skip a check-in, answer briefly, disagree with the premise or ask for a different topic. A missing response is not an approval, rejection or negative signal.

## From response to retained feedback

After Jamie replies, AI should separate three things:

- The operational judgement about the scenario
- What the reply reveals about the methodology
- Any inferred change idea that still requires analysis

AI then records a proportionate feedback item and assigns one disposition:

| Disposition | Meaning | Next action |
|---|---|---|
| No methodology change | The approved method already covers the point or the evidence does not justify change | Retain the reasoning; no proposal |
| Clarification | Meaning is sound but guidance, examples or language are unclear | Accumulate or prepare a small proposal |
| More evidence | The signal is plausible but uncertain, isolated or dependent on context | Link related signals and revisit after further challenge |
| Material proposal | Principles, scope, readiness, authority, outputs or method behaviour may need to change | Prepare a branch, assurance pack and draft pull request |
| Urgent review | The signal concerns possible legal, safety, security, ethical or authority failure | Escalate promptly; do not wait for batching |

Not every daily answer should create a pull request. The objective is retained learning and coherent improvement, not change volume.

## Methodology assurance pack

Before Jamie decides a material proposal, AI must prepare an [assurance pack](../templates/methodology-assurance-pack.md) that allows a non-developer to verify the change.

At minimum it should explain:

- What Jamie said and what AI inferred
- The current approved position
- The exact proposed change in meaning
- Evidence strength and important disagreement
- Affected principles, lenses, readiness positions, stages, outputs and products
- Dependencies, contradictions and unintended consequences checked
- Strongest alternative, including no change
- Tests and validation performed
- What becomes approved if Jamie says yes
- What remains unapproved
- A recommendation: approve, approve with conditions, revise, defer or reject

The assurance pack should link to the draft pull request but must not require Jamie to read the code or raw diff to understand the decision.

## Cadence and review

The automation runs daily, but methodology changes follow evidence rather than a daily release schedule.

Review the loop after seven completed founder responses. Assess:

- Whether the questions are useful and varied
- Whether the response time is realistic
- Signal quality and source balance
- Repeated gaps or contradictions
- How often feedback produces no change, clarification or material proposals
- Whether assurance packs make decisions easier
- Whether daily remains the right cadence

Changing the schedule, adding external feedback channels or connecting a notification service is a separate governed decision.

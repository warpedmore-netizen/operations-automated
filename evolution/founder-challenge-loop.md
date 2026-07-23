---
id: OA-EVOLUTION-002
title: Founder Challenge and Feedback Loop
status: approved
version: 0.2
owner: Jamie Peppard
date: 2026-07-20
approval_date: 2026-07-20
approval_scope: internal validation
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

## Mutual challenge sequence

The loop is not limited to one question and one answer. Where a conclusion could materially affect methodology meaning, AI should:

1. Present its understanding of Jamie's answer.
2. State what changed in its own assessment.
3. Identify assumptions, uncertainty and any point it does not yet accept.
4. Run one proportionate counter-test using a reversed assumption, boundary case, different setting or stakeholder, contrary evidence, longer time horizon, failure scenario or authority question.
5. Ask Jamie one focused follow-up.
6. Record whether the result is convergence, contextual agreement, unresolved disagreement or a need for more evidence.

AI should challenge its own earlier answer as readily as Jamie's answer. It should not create debate for performance or continue until Jamie agrees through exhaustion. Jamie may pause or stop without that becoming evidence.

Before selecting a counter-test, AI should reconstruct the strongest reasonable contextual meaning of Jamie's answer. It should not convert conversational shorthand or a general example into an extreme universal claim merely because that version is easier to challenge.

## Route 2: AI-initiated daily challenge

An active local Codex automation named `Daily methodology challenge` runs each day at 08:00 UK local time for the Operations Automated project.

Because the pilot reads a repository stored on Jamie's computer, the computer must be powered on, the ChatGPT desktop app must be running and the project must remain available on disk at the scheduled time. Completed runs appear in the app's **Scheduled** inbox and may be answered later.

If the computer or app is unavailable, the local run is not guaranteed to take place or catch up. Jamie may request a manual check-in at any later time. A missed run or response has no approval, rejection or performance meaning.

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
6. **Challenge mode:** initial proposition, reverse, boundary, transfer, stakeholder, contrary evidence, time horizon, failure or authority.
7. **One primary question:** the judgement Jamie is best placed to provide.
8. **Optional follow-ups:** no more than two.
9. **Response time:** 5, 10 or 20 minutes.
10. **Next step:** how Jamie's answer will enter the controlled feedback process.
11. **Sources:** direct links.

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

Where a material assumption remains untested, the initial disposition may be provisional. Complete one useful challenge pass before treating agreement as convergence or preparing a consequential change.

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

The recurrence is indefinite unless Jamie explicitly pauses, changes or stops it. Seven completed founder responses are the first review and baseline-synthesis checkpoint, not a termination condition. Further review checkpoints should be set from observed quality, burden, coverage and change yield.

Challenges may examine the entire Operations Automated system, including principles, methodology content, specialist modules, governance, evolution, delivery, product design, publication and commercial hypotheses. Select the most decision-relevant unresolved conceptual question at the time; topic rotation is a breadth control rather than the primary selection rule.

Review the loop after seven completed founder responses. Assess:

- Whether the questions are useful and varied
- Whether the response time is realistic
- Signal quality and source balance
- Repeated gaps or contradictions
- How often feedback produces no change, clarification or material proposals
- Whether assurance packs make decisions easier
- Whether daily remains the right cadence
- Whether local delivery is reliable and accessible enough
- Whether challenges improve conclusions without creating fatigue or performative disagreement

After each review, continue, change or stop the cadence through an explicit decision. Adding external feedback channels or connecting a notification service remains a separate governed decision.

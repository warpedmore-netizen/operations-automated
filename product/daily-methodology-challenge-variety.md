---
id: OA-PRODUCT-013
title: Daily Methodology Challenge Variety and Learning Correction
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-31
approval_required: true
depends_on:
  - OA-EVOLUTION-001@0.2 approved
  - OA-EVOLUTION-002@0.2 approved
  - OA-PRODUCT-010@0.1 proposed
  - OA-PURPOSE-WORKBENCH-001@0.2 proposed
---

# Daily methodology challenge variety and learning correction

## Outcome

Each 10-minute challenge should test a useful, under-examined part of the complete Operations Automated system through a form suited to the question, while carrying forward Jamie's earlier judgements and keeping the strongest unresolved issue more important than novelty for its own sake.

The correction keeps the existing daily Workbench route. It does not replace it with a second schedule or stop the current challenge practice.

## Triggering evidence

### Recorded Workbench evidence

- Five methodology-challenge conversations were retained between 26 and 31 July 2026.
- The daily challenges repeatedly returned to prior human review, delegated authority, risk appetite, customer harm and automation controls.
- On 29 July Jamie explicitly said the refund challenge had already been covered and should have been in memory.
- On 31 July the next challenge again approached the same settled area through batch approval.
- The dated conversations were separate, and each new challenge received only its own conversation continuity.
- No retained daily challenge had a structured record in the Workbench `feedback` store. The Methodology-learning view therefore could not use or disposition those answers.

### Jamie's current judgement

Jamie considers the challenges useful and does not want to stop them. The problem is repetition in subject, reasoning route and presentation. Challenges should remain topical to Operations Automated but may arrive as different artefacts, such as a document, workflow or visual representation, and should test as much of the methodology as practical.

### AI interpretation

The weakness is not simply insufficient randomness. It is the combination of:

1. one fixed daily prompt;
2. no cross-conversation challenge memory;
3. no structured learning signal when Jamie responds; and
4. a scenario-first output pattern that does not require a different artefact or interaction.

Changing only the wording would create cosmetic variety while leaving the memory and learning failures intact.

## Proposed product behaviour

### Controlled variety

The Workbench assigns each date a starting combination of:

- one of 12 methodology territories;
- one of nine challenge modes; and
- one of 12 response artefacts.

The date provides repeatable controlled entropy. It does not select authority or determine the final subject. The model first reviews recent challenge memory and rejects a candidate that merely changes names, numbers or setting around a settled conclusion.

Decision value remains the gate. The model may override the scheduled territory where retained evidence shows that it would be low-value or repetitive, but it should keep the selected challenge mode and artefact where practical and state why it changed course.

### Varied artefacts

The proposed formats include:

- an operational case file;
- a short document or guidance extract for critique;
- a workflow or decision path;
- a red-team finding;
- an after-action review;
- a stakeholder exchange;
- a decision memo;
- an audit observation;
- a scorecard;
- a journey or product artefact critique;
- a transfer comparison; and
- an assumption map.

The current Workbench can render prose, Markdown tables and simple text workflows. It does not yet generate or attach an image or a separate downloadable document. That capability remains a possible later increment rather than a false promise in this correction.

### Retained challenge memory

When a methodology challenge begins, the server supplies a compact view of up to 12 earlier challenge conversations:

- the opening test;
- Jamie's responses;
- the latest AI interpretation; and
- any structured learning state.

Unrelated conversations are not added. Approved Methodology remains the normative source; the memory is retained evidence and judgement.

### Structured learning

After Jamie replies and the Workbench produces its interpretation, the response enters the existing Methodology-learning store automatically as one unapproved signal for that challenge conversation. Later replies update the same signal instead of creating a new proposal per message.

The initial learning state is **more evidence required**. The Workbench does not infer whether the answer requires no change, clarification, a methodology change or a product change. That disposition still requires governed review.

On first start, eligible earlier methodology-challenge conversations are backfilled additively from their retained founder response and following AI interpretation. The original messages remain unchanged. A conversation produces one learning signal regardless of how many follow-up replies it contains.

## Topicality and public evidence

The Workbench may use:

- current approved methodology gaps and coverage;
- retained founder feedback and unresolved contradictions;
- live product, delivery, publication or commercial tensions in the controlled project; and
- connected evidence already supplied through an authorised route.

The Workbench has no general public-web research connection. This proposal adds none. Where current public evidence is unavailable, the challenge must state that limitation rather than invent what people are discussing. A later public-evidence route would require a separate decision covering information, provider, permissions, cost, failure and removal.

## Current meaning and authority

This is a product workflow correction implementing the approved founder challenge and evolution loop more faithfully. It does not change:

- Jamie's authority over methodology meaning and consequential decisions;
- the rule that responses are feedback rather than approval;
- the priority of decision relevance over topic rotation;
- the approved v0.7 Methodology baseline; or
- the boundary between private internal validation and wider release.

## Alternatives considered

| Alternative | Why it was not selected |
|---|---|
| Add more randomness to the existing prompt | Creates surface novelty but still forgets earlier answers and loses structured learning |
| Fixed topic carousel | Improves breadth but may force a weak subject when current evidence exposes a more important unresolved issue |
| Let the model choose everything | Preserves relevance but has already converged on familiar AI, authority and risk patterns |
| Require a different external source every day | Not possible without a separately approved research connection and may confuse public discussion with proof |
| Stop the challenge cycle | Conflicts with Jamie's judgement that the existing practice is useful |

## Validation and review

The implementation should prove:

- consecutive dates rotate all three controlled axes;
- the generated prompt requires novelty, decision value and evidence boundaries;
- earlier challenge content appears in the new challenge context;
- Jamie's reply creates or updates one unapproved learning signal;
- no proposal or approval is created automatically;
- existing conversations and feedback survive unchanged; and
- the complete Workbench regression suite passes.

Real-use review should examine the next seven completed challenges for topic spread, artefact spread, repeated conclusions, source quality, response burden and useful change yield.

## Decision required

Jamie Peppard may request revision, defer or reject the proposal, or separately approve the Draft prompt and prepared implementation through the applicable prompt, merge and private-release controls.

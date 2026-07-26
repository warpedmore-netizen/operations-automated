---
id: OA-FEEDBACK-2026-07-26-011
title: Let Oppa Mate populate safe defaults and keep governed actions simple
status: proposed
owner: Jamie Peppard
date: 2026-07-26
feedback_type: product-usability-correction
affected_workspace: Operations Automated Workbench
submitting_user: Jamie Peppard
---

# Let Oppa Mate populate safe defaults and keep governed actions simple

## Source and boundary

Jamie asked the proposed Operate action loop to populate or suggest anything the system can responsibly derive, including the name of an Approval. He wants ordinary progress to be a click, optional fields to remain optional and a choice to become mandatory only when the outcome genuinely depends on it.

This authorises a bounded usability correction. It does not approve methodology meaning, the product, merge, release, publication, Risk acceptance, a specific Approval or autonomous execution.

## Operational insight

A technically governed action can still fail as a delivery experience if the user repeatedly types information already known to the system. The system should do clerical and analytical preparation first, make its suggestions visible and correctable, and request only judgement or missing evidence that it cannot responsibly infer.

## Methodology comparison

The approved Human-AI Collaboration Method says AI should do analytical work before asking for judgement and prefer decision usefulness to ceremonial completeness. The approved output contract requires explicit human control but does not require retyping an action label. The signal is therefore a product-delivery correction, not a change to approved methodology.

## Strongest practical rule

> Auto-populate safe clerical defaults, visibly suggest inferential values, require the user to choose when outcomes differ, and retain stronger controls only where consequence justifies the friction.

## Implemented proposal

- Work capture now requires one ordinary-language description.
- Oppa Mate suggests an editable name, record type and Work Profile before capture.
- Optional classification, relationship and priority fields are collapsed but remain available.
- Neutral action notes are pre-populated only where they restate the bounded transition rather than invent evidence.
- Ordinary Approval uses explicit **Approve**, **Reject** or **Expire** actions without retyping the button label.
- A material Decision requires **Proceed**, **Revise first** or **Do not proceed** before recording.
- Risk acceptance still requires exact typed confirmation and a substantive note because it accepts consequence rather than merely progressing work.

## Challenge and counter-risk

Too much auto-population can turn a human action into ceremonial agreement or retain invented evidence. Suggested values are therefore labelled, editable and separated from the final choice. Rejection, exception, risk and evidence-specific reasons remain mandatory when a safe default would obscure judgement.

## Evidence and review trigger

The complete local suite passed 75 tests. An isolated browser journey generated the name **Approve a bounded private pilot of the governed action loop**, displayed the Approval and Product or application build suggestions, kept optional detail collapsed, prepared the Approval with one click and approved it with a second labelled click. A separate Decision remained disabled until **Revise first** was selected.

Review after Jamie uses the revised capture and at least one real Approval or Decision. Check whether the suggestion was useful, whether the visible boundary was sufficient and whether any remaining mandatory field changed the outcome.

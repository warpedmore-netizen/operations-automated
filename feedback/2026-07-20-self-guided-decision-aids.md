---
id: OA-FEEDBACK-012
title: Self-guided Decision Aids as Useful Output
status: proposed
owner: Jamie Peppard
date: 2026-07-20
---

# Self-guided decision aids as useful output

## Source and boundary

- **Source:** Jamie Peppard's review of the first facilitated v0.5 validation case.
- **Case:** A hypothetical online retailer considering autonomous approval and payment of refunds below £75.
- **Permission to use:** Jamie directed Operations Automated to continue the validation and asked how the response could provide a formula, template, Google Sheet or another way for the user to work out the answer.
- **Confidentiality boundary:** Hypothetical, non-confidential operational information only.

## Signal

The Ask response correctly withheld a verdict, separated refund categories, identified material evidence and proposed a controlled validation route. Jamie considered the response useful but incomplete as a value exchange.

The missing output was a practical way for the user to apply the guidance independently. A list of good questions still risks feeling like AI conversation unless it is accompanied, where useful, by something the user can use to organise evidence, compare options and retain a decision.

## Strongest interpretation

Operations Automated should not create user dependency merely to create a later interaction. When a repeatable structure can help the user progress safely, the response should offer or produce a proportionate decision aid such as:

- A checklist or guided worksheet
- A transparent formula or scoring model
- A value matrix or category comparison
- A worked example and editable template
- An evidence, decision or action record
- A bounded test or implementation plan

The user may complete the aid themselves and return only if they want the evidence analysed, challenged or developed into a deeper assessment.

## Challenge and limitation

A spreadsheet is not automatically more valuable than prose. It can:

- Create false precision from weak or subjective inputs
- Hide user-defined value inside default weights
- Encourage a score to override authority, obligation or consequence
- Compare categories that contain materially different work
- Add effort where a short checklist would be sufficient
- Appear professional without being operationally valid

The artefact must therefore expose its assumptions, weights, evidence gaps, gates and interpretation. Categorisation should precede scoring where mixed work would make the comparison misleading.

## Prototype produced

A Google Sheets-ready workbook was created for the refund case. It contains:

1. A value matrix and editable value priorities.
2. A category-first demand and evidence table.
3. Transparent user-value, demand, readiness, safety and exploration calculations.
4. Separate authority, minimum-outcome and recovery gates.
5. Suggested routes rather than automatic approval.
6. A retained decision and controlled validation-plan template.

The formula and thresholds are pilot hypotheses, not universal methodology rules.

## Simplicity correction after review

Jamie reviewed the workbook and found it too comprehensive and complicated for the original Ask-mode need. Although it contained instructions, its size and density made the output feel oppressive rather than simple and immediately useful.

The stronger interpretation is progressive disclosure:

1. Return the shortest useful answer and a simple first-use aid.
2. Include a plain explanation of how to use it.
3. Offer the comprehensive workbook only when the user needs deeper comparison, retained evidence or a controlled project.

A user guide does not compensate for disproportionate complexity. The artefact itself must match the question and the user's available time.

## Disposition

**Material clarification proposed for v0.6.**

Extend useful guidance with the smallest self-guided decision aid that materially increases the user's ability to progress. Use progressive disclosure, keep deeper tools optional and prevent calculation from replacing evidence or authorised judgement.

## Review trigger

First produce a substantially simpler aid. Then test whether another person can use it without facilitation, whether its language is understandable and whether it improves a decision rather than merely making it look more formal.

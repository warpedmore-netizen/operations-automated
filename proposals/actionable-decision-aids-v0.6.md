---
id: OA-CHANGE-007
title: Add Actionable and Self-guided Decision Aids
status: approved
owner: Jamie Peppard
date: 2026-07-20
approval_required: true
approval_date: 2026-07-23
approval_scope: internal validation
---

# Actionable and self-guided decision aids v0.6 proposal

## Proposed change

Clarify that a useful Operations Automated response should provide a proportionate way for the user to apply its guidance when a repeatable structure can help them progress independently.

Add proposed guidance for selecting and producing the shortest useful checklist, worksheet, transparent formula, worked example, decision record or controlled action plan. Require progressive disclosure so comprehensive tools are optional depth rather than the default. Retain categorisation before scoring, visible user-defined value, evidence discipline and separate authority or obligation gates.

## Reason

The first facilitated v0.5 case showed that a correct Ask response can still feel like AI conversation if it returns only analysis and questions. Jamie's review was that value includes giving the user something they can use to work out the answer without having to return until they want further analysis or challenge.

The evidence, comprehensive prototype and founder simplicity correction are retained in [Self-guided decision aids as useful output](../feedback/2026-07-20-self-guided-decision-aids.md) and [Refund automation decision-aid validation](../pilots/refund-automation-decision-aid-validation.md).

## Affected material

- Methodology output contract and Ask-mode interpretation
- Delivery and product behaviour
- User-defined value and evidence discipline
- Category and work-type analysis
- Templates, exports and retained decision records
- Future application requirements

The approved v0.5 artefacts remain unchanged by this proposal. The new module and template remain proposed or draft until Jamie decides them.

## Challenge

- **Assumption:** A reusable artefact creates more value than a strong conversational answer for a material subset of questions.
- **Evidence strength:** Strong founder intent and one working prototype; no independent user evidence.
- **Strongest alternative:** Improve the prose response and provide a short checklist without creating a separate module or calculation.
- **Potential downside:** Formulae and polished templates may create false confidence, extra effort, an oppressive user experience or a misleading appearance of objectivity.
- **Control:** Start with the shortest usable aid, offer deeper tools progressively, expose assumptions and weights, categorise before calculating, retain gates outside the score and test with an independent user.

## Human and automation responsibilities

AI may select, draft, populate and explain an aid using authorised information. The user defines value, supplies or validates evidence and retains the operational decision. A score does not create authority, accept risk or remove applicable obligations.

## Delivery and release impact

- Future prompts should identify when a decision aid would materially increase independent progress.
- Delivery products should generate, retain and export the appropriate artefact.
- Completed aids should be reusable in deeper assessment without re-entering information.
- Template and formula versions should remain traceable to the methodology version.
- No application rebuild or external Google Drive connection is approved by this proposal.

## Recommended validation

1. Replace the comprehensive first-use workbook with a short guide or lightweight worksheet and retain the workbook only as optional depth.
2. Apply the same principle to a materially different case where a checklist or document may be better than a spreadsheet.
3. Test a simplified aid with a person who did not help design it.
4. Compare completion effort, understanding, decision quality and the need for facilitation.
5. Review the approved working module after the validation evidence and revise, retain or withdraw it as justified.

## Recommendation

Approve for internal validation with conditions. Simplify first, then use the second facilitated case and one independent-user test to determine whether the module creates value without unnecessary burden.

## Jamie's decision

- **Decision:** Approved for internal validation and authorised for merge through PR #9
- **Approver:** Jamie Peppard
- **Date:** 2026-07-23
- **Conditions or requested changes:** Retain simplicity and progressive disclosure; run the second facilitated case; independently test a simplified aid; preserve human authority, evidence gates and the external-publication boundary.

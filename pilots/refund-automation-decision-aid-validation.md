---
id: OA-PILOT-003
title: Refund Automation Decision-aid Validation
status: draft
version: 0.1
owner: Jamie Peppard
date: 2026-07-20
methodology_version: v0.5
---

# Refund automation decision-aid validation

## Purpose

Test whether the approved v0.5 Ask mode gives useful value when it cannot yet justify the requested automation decision, and whether a self-guided artefact improves that value.

## Hypothetical case

An online retailer receives 4,000 refund requests each month, has a six-day backlog and reports that about 80% of requests are below £75. The operational question is whether AI should autonomously approve and issue all refunds below £75.

No real organisation, customer, payment or confidential operational information was used.

## Initial Ask output

Operations Automated:

- Determined that the amount threshold alone was insufficient for a verdict
- Reframed the work into refund categories and decision components
- Identified the minimum material evidence, authority, recovery and monitoring questions
- Proposed category comparison followed by shadow and human-confirmed testing where justified
- Preserved the boundary that insufficient information is not proof that automation is unsuitable

## Founder validation

Jamie considered the response and questions useful. The material criticism was that the user still needed a way to apply the guidance and work out the answer without having to return for another conversation.

The proposed improvement was to provide a formula, template, Google Sheet or other appropriate working aid. Categorisation should occur before improvement and scoring so materially different work is not combined.

## Prototype

A Google Sheets-ready workbook named `Operations-Automated-Refund-Decision-Aid.xlsx` was produced with:

- User-defined value and scoring weights
- Seven worked refund categories and space for additional categories
- Evidence, readiness, consequence and uncertainty inputs
- Transparent calculations and separate decision gates
- Suggested routes and next actions
- A retained decision and controlled validation-plan record

Illustrative outputs included:

| Category | Exploration score | Gate | Suggested route |
|---|---:|---|---|
| Cancelled before dispatch | 83 | Recovery untested | Resolve the gate before autonomy |
| Undelivered item | 75 | Recovery untested | Resolve the gate before autonomy |
| Duplicate payment | 72 | Gates passed | Candidate for a bounded pilot beginning in shadow mode |
| Goodwill payment | 31 | Authority missing | Resolve the gate before autonomy |
| Suspected fraud or dispute | 32 | Authority missing | Resolve the gate and use structured assessment |

The example demonstrates that a high exploration score does not override a failed gate.

## What this validates

- Ask mode can return useful guidance without manufacturing a verdict.
- A user can be given a structure for independent progress rather than only questions.
- Category-first analysis can reveal different automation routes inside one broad demand type.
- User-defined value, evidence quality, readiness and consequence can be made visible without hiding authority and recovery inside one score.

## What remains unvalidated

- Whether another person can complete the workbook without facilitation
- Whether the rating definitions produce consistent judgements
- Whether relative volume is the right demand measure in other contexts
- Whether the default weights and thresholds improve real decisions
- Whether a spreadsheet is proportionate for other Ask-mode questions
- Whether users prefer a workbook, interactive tool, document or another artefact

## Next test

Give the workbook to a person who did not help create it. Observe where they hesitate, what they misunderstand, whether the results alter their reasoning and whether the decision record is usable. Do not treat completion or a high score as approval.

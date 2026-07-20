---
id: OA-TOOL-001
title: Category-first Decision Aid
status: draft
version: 0.1
owner: Jamie Peppard
date: 2026-07-20
---

# Category-first decision aid

Use this template when a user needs to compare materially different work categories and determine what to investigate, improve or test next. It is a working tool, not an approval formula.

## 1. Define value and boundaries

| Field | User definition |
|---|---|
| Desired outcome | |
| Beneficiary | |
| Forms of value and priority | |
| Minimum acceptable outcomes | |
| Constraints and obligations | |
| Decision authority | |
| Review trigger | |

## 2. Test the categories

Split a category when its trigger, rules, evidence, consequence, reversibility, exceptions or authority differ materially.

| Category | Included work or trigger | Volume | Current outcome or failure | Evidence source | Notes or assumptions |
|---|---|---:|---|---|---|
| | | | | | |

## 3. Rate value and readiness

Use a defined 1–5 scale. Record the reason and source for each material rating.

| Category | User-value ratings | Rule stability | Evidence quality | Repeatability | Exception clarity | Reversibility | Consequence if wrong | Uncertainty |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| | | | | | | | | |

## 4. Prototype calculation

The following calculation is a pilot hypothesis. Weights and thresholds must remain visible and should be changed only for a reason, not to obtain a preferred answer.

- **User-value score:** `100 × ((weighted mean of 1–5 value ratings − 1) ÷ 4)`
- **Demand score:** `100 × (category demand ÷ highest entered category demand)`
- **Readiness score:** `100 × ((mean of readiness ratings − 1) ÷ 4)`
- **Safety score:** `100 × ((5 − mean of consequence and uncertainty) ÷ 4)`
- **Exploration score:** `(user value × 35%) + (demand × 20%) + (readiness × 30%) + (safety × 15%)`

Default suggested routes:

| Condition | Suggested route |
|---|---|
| Authority, minimum outcomes or recovery is not confirmed | Resolve the gate before autonomous execution; evidence and improvement work may continue |
| Safety score below 25 | Structured assessment with consequential decisions kept human-controlled |
| Exploration score at least 70 and readiness at least 60 | Candidate for shadow testing and then a human-confirmed bounded pilot |
| Exploration score from 50 to 69 | Improve rules, evidence or exceptions and reassess |
| Exploration score below 50 | Retain the current approach or investigate another category |

These thresholds compare candidates; they do not prove suitability, compliance, safety or value.

## 5. Retain the decision

| Field | Decision record |
|---|---|
| Selected category | |
| Formula output and limitations | |
| Decision | |
| Reasoning and evidence | |
| Authorised person | |
| Conditions | |
| Included and excluded scope | |
| Starting mode | Categorise and improve / Shadow / Human-confirmed pilot / Bounded autonomy |
| Measures and minimum outcomes | |
| Stop trigger | |
| Recovery method | |
| Review date or trigger | |

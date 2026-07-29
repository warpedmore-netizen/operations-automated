---
id: OA-PROPOSAL-REQUEST-FRAMING-001
title: AI Workbench Request-Framing and Project-Routing Assurance Pack
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-29
---

# AI Workbench request-framing and project-routing assurance pack

## Decision in plain English

Decide whether the prepared Workbench implementation may merge after its dependency is resolved.

This is not a decision to approve Product Purpose, Steering, the reusable framing prompt, the implementation prompt, Methodology meaning, private product release, Confluence publication or external use.

## Current and proposed meaning

**Current:** the Purpose & steering surface classifies a request, identifies a target project and records a boundary recommendation. The user must still infer readiness, work hierarchy, record creation and handoff content.

**Proposed:** the same surface retrieves controlled context and turns the request into one complete route: interpretation, classification, project boundary, material question, assumptions, A–G readiness, work hierarchy, full work package, minimum record plan, proportionate AI route, Codex gate, provenance and exact next action.

Approved v0.7 Methodology meaning is unchanged.

## Evidence

- Jamie's exact build brief and explicit no-merge boundary.
- Current repository code and registries.
- Existing Workbench base and structured implementation receipt checks from draft PR #30.
- Focused unit tests for all 16 required routing scenarios.
- Isolated API test for retained framing, knowledge snapshot, minimum record creation and answer-only no-Task behaviour.
- Full Workbench regression suite and live browser evidence recorded below after final verification.

## Alternatives considered

| Alternative | Assessment |
|---|---|
| Keep only the classifier | Lower effort but does not remove the user's need to design the route |
| Use a model for every intake | More variable and costly than necessary for controlled classification and framing |
| Create every possible record automatically | Produces bureaucracy and risks implying approval |
| Add a new canonical request record system | Duplicates steering intakes, Operations Bible and specialist stores |
| Send any feature directly to Codex | Violates readiness, Purpose, authority and prompt gates |

## Dependencies and boundaries

- Layered on draft PR #30.
- The proposed Workbench Product Purpose and Steering contract are not approved.
- The reusable framing prompt and Workbench implementation prompt remain Draft.
- Existing recovery evidence must remain successful.
- Dynamic Governance, the Incident Management RPG and Player Lab remain separate product boundaries.
- No new external connection or data category is introduced.

## Risks and controls

| Risk | Control |
|---|---|
| Text classification is wrong | Show reasoning, assumptions and route correction; create no approval |
| A prior rejection is reopened | Retrieve materially related rejected routes and require new evidence |
| Questions become a long form | Ask at most two and only when they change a material route |
| Draft detail is mistaken for authority | Stage and authority are visible; Implementation Job remains behind preparation approval |
| Related Ideas enter scope | Surface them as evidence only |
| Codex receives incomplete work | Select it only at stage D; retain exact structured return and criterion evidence |
| Migration damages memory | Additive migration, legacy display, clean/existing database tests and recovery route |

## Checks

- Focused request-framing and steering tests: 30 passed.
- Full Workbench tests: 118 passed.
- Node syntax and prompt-registry JSON checks: passed.
- Clean database, existing-database migration and retained-history regressions: passed.
- Isolated API journey: framing, one material answer on the same record, minimum draft-record creation and answer-only no-Task behaviour passed.
- Live desktop and 390-pixel browser journey: framing and draft-route creation passed with no horizontal overflow or application console errors; the inline material-answer path is additionally covered by the isolated API and interface tests.
- `git diff --check`: passed before final packaging and will be repeated on the staged change.
- Brand review: the local queue was unavailable during preparation. Retained brand guidance was followed; this does not claim no founder feedback exists.

## Exact decision required

After dependency resolution, Jamie may:

- approve the prepared implementation for merge;
- request a bounded revision;
- defer it; or
- reject it with the reason retained.

Any later merge and private release remain separate explicit actions. No merge is performed by this proposal.

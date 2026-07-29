---
id: OA-STEERING-INTAKE-001
title: Request Intake and Project-Boundary Contract
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-29
---

# Request intake and project-boundary contract

## Outcome

Turn an authorised natural-language request into one or more traceable candidates before material implementation. Classification organises and routes work; it does not approve work or change Product Purpose.

## Candidate record

Each candidate retains:

- the exact source request and source type;
- source authority and date;
- classification and target project;
- relevant purpose and steering versions;
- evidence, assumptions and AI inference;
- boundary-gate assessment and recommendation;
- status and linked candidates;
- exact human decision required; and
- any accepted, deferred or rejected routing decision with actor, reason and time.

## Classification contract

The canonical machine values are:

| Meaning | Value |
|---|---|
| Ordinary answer or explanation | `ordinary-answer` |
| Apply approved methodology | `methodology-application` |
| Methodology challenge | `methodology-challenge` |
| Methodology clarification | `methodology-clarification` |
| Methodology change candidate | `methodology-change-candidate` |
| Workbench product change | `workbench-product-change` |
| Governance Tool product change | `governance-tool-product-change` |
| Defect or corrective change | `defect-corrective-change` |
| Research or evidence request | `research-evidence-request` |
| Operational work item | `operational-work-item` |
| Idea for later consideration | `idea-later-consideration` |
| Cross-product dependency | `cross-product-dependency` |
| Purpose or boundary change | `purpose-boundary-change` |
| New-project candidate | `new-project-candidate` |
| Urgent security, safety, legal or authority review | `urgent-security-safety-legal-authority-review` |
| No action required | `no-action-required` |

One request may produce several candidates. A methodology implication and a Workbench defect, for example, remain two linked candidates with separate decisions.

## Boundary gate

Assess and record:

1. primary user;
2. primary outcome;
3. data and confidentiality boundary;
4. authority and approval model;
5. release and operating lifecycle;
6. commercial proposition;
7. interaction model;
8. technology and dependency profile;
9. effect on current Product Purpose;
10. reuse across multiple products; and
11. evidence that the capability is ready for committed work.

Return one canonical recommendation: `remain-current-product`, `bounded-module`, `shared-capability`, `create-separate-project`, `retain-ideas-space`, `defer-pending-evidence` or `reject-purpose-inconsistent`.

## Purpose protection

`purposeChangeAllowed` is false unless the exact source contains an explicit purpose-review or purpose-change instruction from an authorised human. Even then it only starts a proposal; it does not approve new wording.

## Implementation gate

Material implementation may begin only when:

- the target project and boundary recommendation are identifiable;
- a current purpose identifier and version are recorded;
- an approved Steering contract identifier, version and Decision are recorded;
- the exact approved implementation prompt identifier and version are recorded;
- conflicts affecting the outcome or authority are resolved or explicitly accepted by Jamie; and
- the recovery gate is successful for behaviour or database changes.

## Decision handling

Accepting a route authorises only the recorded routing outcome. Rejecting or deferring a new-project recommendation is retained so it is not repeatedly reopened without new evidence. Repository creation, migration, build, release and publication remain separate decisions.

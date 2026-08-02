---
id: OA-PROPOSAL-WORKBENCH-DELIVERY-CORRECTIONS-001
title: Workbench Delivery Corrections Assurance Pack
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-08-02
---

# Workbench delivery corrections assurance pack

## Decision in plain English

Review whether this correction proposal is a suitable replacement for PR #27 and may remain stacked after draft PR #34 for later consideration.

Prepared implementation: draft [PR #36](https://github.com/warpedmore-netizen/operations-automated/pull/36), targeting PR #34's branch.

No merge or release decision is requested now. This proposal does not approve PR #34's Draft prompt, Methodology v0.8, a broader record-numbering convention or any external use.

## Current and proposed behaviour

| Area | Current dependency behaviour | Proposed correction |
|---|---|---|
| Record identity | Stable `OA-<TYPE>-<ID>` references are returned by the Workbench but are not consistently visible | Show the existing reference in My Work, details, Cases & Work, relationships and Case or parent context |
| Completed work | A terminal record can still look like another founder action | Show the recorded outcome, mark its workflow complete and direct verification to Recent activity |
| Case closure | Closure needs a note but provides no useful starting evidence | Suggest a review statement that Jamie may edit before closing the Case |
| Repository authority | A linked or redirected app path can cause the launched server to infer a different repository root | Pass the repository Jamie opened explicitly to the server |
| Launcher | A successful local launch leaves a persistent terminal window | Start the server in a hidden non-interactive PowerShell process while retaining launcher error handling |
| Primary links | A broad anchor rule can override the readable primary-action colour | Scope primary link styling to the Workbench base and retain readable contrast |

## PR #27 reconciliation

PR #27 proposed sequential references such as `CASE-001`. The newer Workbench dependency already supplies deterministic references such as `OA-CASE-EA27C086` from the retained UUID identity. Both approaches meet the founder need for short, stable, visible identifiers, but implementing both would create competing identities and an unnecessary migration.

The replacement therefore preserves PR #27's unique display, relationship-selector, completed-state, retained-evidence and regression coverage while using the dependency's current identity model. PR #27's original branch and discussion remain available after closure.

## Evidence and checks

- Full explicit Workbench suite: **123 passed, 0 failed**.
- Stable Case, Request and Task reference formats and uniqueness are covered through the local API regression.
- A terminal Approval with no next action is covered as `humanActionRequired: false`.
- Interface checks cover visible references, launcher repository authority and primary-link readability.
- A live isolated desktop journey confirmed the reference in My Work, Cases & Work and record detail, and confirmed the completed workflow and retained-evidence route. It also identified and removed a redundant card badge that overlapped a title before publication.
- Existing database upgrade and clean-database journeys pass without a reference-schema migration.
- The local Brand Review queue could not be reached during final preparation. Retained brand guidance was followed; this does not claim that no pending founder feedback exists.
- Ideas Space review produced only a text-search match to the Incident Management Simulation Game. Its actions-and-delivery wording is not relevant to this bounded private Workbench correction, so its Raw idea status and scope are unchanged.

## Risks and controls

| Risk | Control |
|---|---|
| A visible reference is mistaken for approval or priority | The reference identifies only the retained record; status, priority and authority remain separate |
| The current display format becomes an unexamined public convention | Keep it proposed and validate through bounded private use before any wider decision |
| Hidden server startup obscures a launch failure | The launcher retains its bounded error path and the server health/version check |
| A completed-state treatment hides retained evidence | Direct the user to Recent activity and retain the record, relationships and audit history |
| Stacked work is reviewed without its dependency | Target the replacement draft at PR #34's branch and keep merge and release decisions separate |

## Exact decision required later

After PR #34's prompt and implementation are separately decided, Jamie may review this correction and choose to revise, defer, reject or authorise its applicable merge route. No release follows automatically from that decision.

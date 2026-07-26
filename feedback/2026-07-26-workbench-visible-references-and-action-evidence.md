---
id: OA-FEEDBACK-2026-07-26-008
title: Make Workbench records identifiable and completed actions unambiguous
status: proposed
owner: Jamie Peppard
date: 2026-07-26
feedback_type: product-change-candidate
affected_workspace: Operations Automated Workbench
submitting_user: Jamie Peppard
---

# Make Workbench records identifiable and completed actions unambiguous

## Source and boundary

- **Source:** Direct founder feedback while using My Work.
- **Jamie's wording:** records have no visible identifiers such as `CASE...` or `INC...`; the item **Confirm the Internal Confluence destination** does not explain how to confirm the information or move the work forward.
- **Information boundary:** Non-confidential Operations Automated product information.
- **Authority:** A bounded product correction, tests, branch, commit, push and draft pull request are permitted. No methodology change, merge, release or publication is authorised.

## Operational insight

A work title is not a sufficient identifier. People need a short, stable reference they can use in conversation, search, evidence, relationships and hand-offs. A workflow view must also distinguish an action that still needs input from a completed record retained for history.

## Recorded evidence

The selected Confluence record is an Approval with internal UUID `9c2de325-5043-40e4-8db0-c5debe3b2409`, status `approved` and approval state `human-confirmed`. It has no available next action. The interface nevertheless labelled the panel **Your next step**, said **Review this work**, and told Jamie to complete an action. The record was terminal, but the server also returned `humanActionRequired: true` because absence of a next action was not handled explicitly.

## AI inference and challenge

- **Inference:** the immediate failure combines missing human-facing identity with an incorrect terminal-state presentation.
- **Reverse test:** exposing UUIDs would technically identify records but would remain difficult to read, say and retain. Use type-specific sequential references instead.
- **Boundary test:** a reference identifies a record; it does not imply priority, approval or authority.
- **Failure test:** references must survive restart and existing records must be backfilled without changing their UUID relationships or history.
- **Authority test:** an approved record must show the retained outcome; it must not invite another confirmation or silently reopen the approval.

## Disposition

**Propose a bounded product change now; no methodology change.**

Add stable references such as `CASE-001`, `TASK-001`, `INC-001` and `APP-001` to operational records. Show them in My Work, record details, Cases & Work and relationship selectors. Treat a record with no next action as not requiring human action, and replace the misleading next-step panel with a completed-state explanation and a route to Recent activity for verification.

## Remaining uncertainty

The prefixes and three-digit starting width are suitable for the current private pilot but need real-use confirmation before becoming an external or multi-organisation numbering convention.

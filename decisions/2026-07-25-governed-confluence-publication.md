---
id: OA-DECISION-2026-07-25-001
title: Prepare Governed Confluence Documentation Publication
status: recorded
decision: approved-for-private-internal-validation
decision_maker: Jamie Peppard
date: 2026-07-25
release_status: merged-for-private-internal-validation
release_pull_request: 14
release_commit: 4a308a9add1fc3189cdd8122f67287ee947a2e4d
---

# Prepare governed Confluence documentation publication

## Decision

Jamie Peppard instructed Codex to build a Workbench capability that converts the controlled Operations Automated project memory into readable Confluence documentation. It should cover methodology, decisions, policies and related records, and methodology approvals should create a traceable need for a Confluence update.

This initially authorised design, implementation, testing, a separate branch and a draft pull request. Jamie later explicitly approved and merged PR #14 for private internal validation on 2026-07-25 as commit `4a308a9add1fc3189cdd8122f67287ee947a2e4d`.

The merge approved the controlled publication capability for private internal validation. It did not authorise a particular live page plan, automatic publication, deletion, external release or general customer use.

## Intended outcome

- Git remains the authoritative controlled source.
- The Methodology space presents the method, principles, evolution guidance, tools and working proposals in a normal reading order.
- The Internal space presents governance, decisions, product records, change history, feedback and validation evidence.
- Every controlled page shows repository status, source version, source commit and the applicable approval boundary.
- The Workbench previews create, update, unchanged and conflict outcomes before writing.
- Jamie provides a separate exact confirmation for each publication run.
- Confluence returns page and version identifiers that are retained as implementation evidence.
- Implemented methodology releases create a pending publication record rather than publishing automatically.

## Authority boundary

The Workbench may prepare and compare documentation without another decision.

The Workbench may create or update only the pages in a reviewed publication plan after:

1. the capability itself has been reviewed and merged;
2. the Workbench is running from `main`;
3. no unresolved page conflict remains;
4. Jamie confirms that the exact plan has been reviewed; and
5. Jamie enters the required publication phrase.

The following remain disabled:

- automatic or scheduled Confluence writes;
- deletion, archiving or purging;
- adoption of an existing same-title page without review;
- overwriting a page that changed since the last tracked Workbench version;
- changing repository status or methodology meaning from Confluence; and
- customer-facing token collection.

## Failure and recovery

- Each successful page response is retained immediately so a partial failure does not lose completed work.
- Retrying requires a fresh preview.
- A Confluence version difference becomes a conflict rather than an overwrite.
- A failed publication records a bounded error, not a page body or credential.
- No compensating deletion is attempted.

## Release decision

Approved and merged for private internal validation only.

After merge, Jamie clarified that the first live publication must use a lifecycle-first hierarchy: Live, Draft and Archived, followed by the normal subject structure. That revision is governed separately. The first real publication remains a plan-specific confirmation inside the Workbench after the corrected structure is reviewed and merged.

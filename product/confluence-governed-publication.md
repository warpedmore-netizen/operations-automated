---
id: OA-PRODUCT-005
title: Governed Confluence Documentation Publication
status: approved
version: 0.3
owner: Jamie Peppard
date: 2026-07-25
approval_date: 2026-07-25
approval_scope: private internal validation including AI-managed Draft publication
---

# Governed Confluence documentation publication

## Purpose

This Workbench capability makes Operations Automated readable as a structured Confluence library without moving methodology authority away from Git.

It converts controlled Markdown into Confluence storage-format pages, organises those pages for human reading, compares the intended result with previously managed pages and retains the Confluence version returned for every write. AI may publish committed proposed material into Draft for review. Founder confirmation is required to promote or publish material to Live.

## Information architecture

Both spaces use lifecycle as the first navigation decision:

1. **Live** — approved, published and recorded material active for its stated scope;
2. **Draft** — ideas, drafts, proposals and unrecognised working states; and
3. **Archived** — superseded and rejected material retained for history.

The document's repository `status` determines its location. A merge does not move a proposed document into Live. Unknown or compound states default to Draft because that is the safer interpretation.

The normal subject structure appears beneath each lifecycle folder.

### Methodology space

- Core methodology
- Principles
- Evolution and governance
- Practical tools
- Proposals and assurance

### Internal space

- Governance and direction
- Decisions
- Product and delivery
- Change history and assurance
- Feedback and validation evidence

Generated navigation pages explain the lifecycle and subject, then list their controlled children. Subject titles include their lifecycle in brackets so they remain unambiguous and unique within a Confluence space. Source pages carry their repository title and are rendered as readable headings, paragraphs, lists, tables, links and code blocks.

## Status and authority

Every controlled source page begins with:

- repository status;
- the Live, Draft or Archived reading location derived from that status;
- a plain-language explanation of that status;
- approval or decision scope where recorded; and
- a reminder that Git remains authoritative.

Every page ends with:

- repository source path;
- source version;
- source commit;
- source hash; and
- the boundary that a Confluence reading copy cannot create approval.

A Confluence page with `current` API status may still represent a proposed or draft repository artefact. The visible repository-status panel prevents Confluence visibility from being mistaken for methodology approval or external publication.

## Preview and publication authority

The Workbench first performs a read-only comparison and reports:

- pages to create;
- managed pages to update;
- unchanged pages; and
- conflicts requiring attention.

The complete page list is available through progressive disclosure. Every publication is blocked while controlled source changes are uncommitted or a conflict remains.

The Workbench preview groups each space into Live, Draft and Archived and shows the subject hierarchy beneath each lifecycle. This gives Jamie the same structure that will be created in Confluence.

For a Draft-only plan, AI may publish without another Jamie confirmation when:

- every source artefact remains proposed or draft;
- the Git source is committed;
- the destination is an existing controlled private Draft parent;
- no conflict exists; and
- the write remains traceable and non-destructive.

For a Live or mixed-lifecycle plan, the Workbench must run from clean `main`. Jamie must review the plan, confirm its destinations, statuses and conflicts, and type **Publish reviewed pages to Confluence** exactly. This confirmation authorises that plan only.

## Page ownership and conflict handling

The local Workbench retains, for each managed page:

- controlled item key and source path;
- target role and Confluence space;
- Confluence page and parent identifiers;
- source hash and status;
- last returned Confluence version;
- source commit;
- publication run; and
- publication time.

Before an update, the Workbench compares the current Confluence version with the last returned version. A difference indicates an independent Confluence edit and blocks the update.

An existing same-title page without a Workbench mapping is also a conflict. The Workbench will not assume that it owns the page.

For a tracked page-version conflict, Jamie can open the changed Confluence page, compare it with the controlled Git source and explicitly choose **Use reviewed Git copy**. The recovery step requires the exact phrase **Use the reviewed Git copy for this page**. It records the current Confluence version as the comparison baseline but performs no write. A fresh preview then shows the Git copy as an update. Draft standing authority does not allow AI to resolve an independent edit.

Missing, moved and unmanaged same-title pages cannot use that shortcut. They require a separate decision about recovery, ownership, destination or title.

## Approval-to-publication continuity

When the Workbench records an implemented methodology release, it creates a pending Live-publication record. A Draft-only publication does not clear that record. It is cleared only by a later completed, founder-confirmed controlled-mirror publication run.

The publication run records:

- actor;
- source commit;
- start and completion time;
- created, updated and unchanged counts;
- page identifiers and returned versions; and
- a bounded failure reason where applicable.

Credentials and page bodies are excluded from audit details.

## Failure and recovery

- Successful page receipts are retained as each write completes.
- Partial failure stops the run and requires a fresh preview.
- A retry sees already completed pages as managed rather than creating duplicates.
- Version conflicts stop rather than overwrite.
- No page is automatically deleted, archived, moved to trash or purged.
- Removing the local connection does not erase publication history.

## Atlassian API basis

The implementation uses the current Confluence Cloud REST API v2 page operations. Atlassian documents that page creation requires create permission and page updates require update permission. Updates include the next version number, which supports the Workbench's optimistic conflict control. [Confluence Cloud REST API v2: Page](https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-page/)

The private token route remains a local founder-testing mechanism. Atlassian recommends OAuth 2.0 or Forge for distributed apps and states that cloud apps should not collect customer API tokens. [Atlassian basic authentication guidance](https://developer.atlassian.com/cloud/confluence/basic-auth-for-rest-apis/)

## Not included

- scheduled publication or AI promotion to Live;
- Confluence deletion or archiving;
- arbitrary editing of non-managed pages;
- treating Confluence as authoritative methodology memory;
- importing Confluence edits back into approved methodology;
- external publication;
- customer authentication; or
- bypassing merge for approved or Live meaning.

## Validation

Before release review, confirm:

- the page tree covers the agreed source categories in a normal reading order;
- lifecycle is the first level below each space hub;
- approved, published and recorded map to Live;
- idea, draft, proposed and unrecognised states map to Draft;
- superseded and rejected map to Archived;
- proposed, draft, idea and recorded material cannot appear as approved;
- Markdown and embedded HTML are safely converted;
- preview performs no write;
- Draft-only authority cannot target Live, clear a pending release or bypass a conflict;
- Live branch, actor, reviewed-plan and confirmation checks cannot be bypassed;
- a version change or unmanaged same-title page blocks publication;
- a managed version conflict can be prepared for a reviewed Git reapplication only through Jamie's separate conflict decision;
- parents are created before children;
- page updates use the expected next version;
- partial success is retained;
- audit records exclude credentials and bodies;
- no delete request exists; and
- existing evidence synchronisation and Workbench governance tests still pass.

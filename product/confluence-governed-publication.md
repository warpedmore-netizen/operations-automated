---
id: OA-PRODUCT-005
title: Governed Confluence Documentation Publication
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-25
---

# Governed Confluence documentation publication

## Purpose

This proposed Workbench increment makes Operations Automated readable as a structured Confluence library without moving methodology authority away from Git.

It converts controlled Markdown into Confluence storage-format pages, organises those pages for human reading, compares the intended result with previously managed pages, requires founder confirmation and retains the Confluence version returned for every write.

## Information architecture

### Methodology space

1. Start here
2. Core methodology
3. Principles
4. Evolution and governance
5. Practical tools
6. Working proposals and assurance

### Internal space

1. Governance and direction
2. Decisions
3. Product and delivery
4. Change history and assurance
5. Feedback and validation evidence

Generated navigation pages explain the section and list its controlled children. Source pages carry their repository title and are rendered as readable headings, paragraphs, lists, tables, links and code blocks.

## Status and authority

Every controlled source page begins with:

- repository status;
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

## Preview and confirmation

The Workbench first performs a read-only comparison and reports:

- pages to create;
- managed pages to update;
- unchanged pages; and
- conflicts requiring attention.

The complete page list is available through progressive disclosure. A publication is blocked unless the Workbench is running from `main` and no conflict remains.

Jamie must then:

1. review the plan;
2. confirm that the destinations, statuses and conflicts were checked; and
3. type **Publish reviewed pages to Confluence** exactly.

This confirmation authorises that plan only. It does not grant standing publication authority.

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

For a tracked page-version conflict, Jamie can open the changed Confluence page, compare it with the controlled Git source and explicitly choose **Use reviewed Git copy**. The recovery step requires the exact phrase **Use the reviewed Git copy for this page**. It records the current Confluence version as the comparison baseline but performs no write. A fresh preview then shows the Git copy as an update, which still requires the separate publication confirmation.

Missing, moved and unmanaged same-title pages cannot use that shortcut. They require a separate decision about recovery, ownership, destination or title.

## Approval-to-publication continuity

When the Workbench records an implemented methodology release, it creates a pending Confluence-publication record. This does not write to Confluence. The pending record is cleared only by a later completed, founder-confirmed publication run.

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

- automatic or scheduled publication;
- Confluence deletion or archiving;
- arbitrary editing of non-managed pages;
- treating Confluence as authoritative methodology memory;
- importing Confluence edits back into approved methodology;
- external publication;
- customer authentication; or
- bypassing repository review and merge.

## Validation

Before release review, confirm:

- the page tree covers the agreed source categories in a normal reading order;
- proposed, draft, idea and recorded material cannot appear as approved;
- Markdown and embedded HTML are safely converted;
- preview performs no write;
- branch, actor, reviewed-plan and confirmation checks cannot be bypassed;
- a version change or unmanaged same-title page blocks publication;
- a managed version conflict can be prepared for a reviewed Git reapplication without writing or bypassing the later publication confirmation;
- parents are created before children;
- page updates use the expected next version;
- partial success is retained;
- audit records exclude credentials and bodies;
- no delete request exists; and
- existing evidence synchronisation and Workbench governance tests still pass.

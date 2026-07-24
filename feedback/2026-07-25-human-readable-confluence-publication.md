---
id: OA-FEEDBACK-2026-07-25-001
title: Publish the controlled methodology as readable Confluence documentation
status: proposed
owner: Jamie Peppard
date: 2026-07-25
---

# Publish the controlled methodology as readable Confluence documentation

## Source and boundary

- **Source:** Direct instruction from Jamie Peppard after privately connecting the local Workbench to separate Internal and Methodology Confluence spaces.
- **Permission:** Jamie asked for the functionality to be built and for methodology approvals to have traceable Confluence updates.
- **Information boundary:** Non-confidential Operations Automated project material already held in the controlled repository.
- **Current authority:** Preparation is authorised. A live Confluence publication still requires review of the exact page plan and a separate explicit founder confirmation.

## Operational insight

The Git repository is effective authoritative project memory but is not the best reading experience for a non-developer. Decisions, methodology, policies, tools, product records and evidence need an ordered human delivery surface.

Confluence should therefore provide:

- a normal reading order and page tree;
- separate Methodology and Internal libraries;
- visible repository status and approval boundaries;
- readable versions of controlled Markdown documents;
- traceability to source path, version, hash and commit;
- page-version tracking after a controlled update; and
- a clear indication when an approved repository change still needs a Confluence update.

## Methodology and product feedback

The methodology evolution loop is incomplete if an authorised repository release does not reach the human reading surface. Distribution must be part of completion, but distribution must not silently change authority.

The strongest contextual interpretation is not “automatically mirror every file”. It is:

> Git remains authoritative; the Workbench prepares a readable Confluence delivery plan, exposes the consequences and requires the authorised human to approve the write.

## Challenge tests

- **Authority test:** A Confluence page cannot approve its repository source or turn proposed material into approved guidance.
- **Conflict test:** A human Confluence edit must stop the Workbench from overwriting that page until the difference is reviewed.
- **Failure test:** A partial publication must retain completed page receipts and support a safe re-preview; it must not roll forward blindly.
- **Transfer test:** The page tree should work for a person reading the methodology, while the repository remains suitable for controlled drafting and technical traceability.
- **Deletion test:** Removing or renaming a repository document must not automatically delete a Confluence page.
- **External-use test:** Private service-account token entry remains unsuitable for customer distribution; a later external product needs an Atlassian-supported app authentication route.

## Disposition

**Propose a product change now.**

The proposal should add a preview, explicit confirmation, conflict detection, optimistic version checks, managed-page tracking, audit receipts and an approval-to-publication queue. It should not add automatic or scheduled writing, deletion, external publication, general Confluence editing or two-way methodology authority.

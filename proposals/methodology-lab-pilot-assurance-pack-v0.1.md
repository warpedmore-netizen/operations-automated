---
id: OA-ASSURANCE-METHODOLOGY-LAB-001
title: Methodology Lab Pilot Assurance Pack
status: proposed
owner: Jamie Peppard
date: 2026-07-25
---

# Methodology Lab pilot assurance pack

## Decision in one sentence

- **Decision Jamie will be asked to make:** Merge, revise or reject the bounded Workbench implementation that creates an isolated proposed Methodology Lab in the private Methodology space.
- **AI recommendation:** Merge after review, then prepare a fresh live preview.
- **Assurance position:** Ready for private implementation review; not yet authorised for a live Confluence write.

## Trigger and intent

- **Trigger:** Jamie asked to use the Workbench and connection to create the methodology in another location, assess how well it performs and use the result as the first process-and-product feedback loop.
- **Intended value:** Produce a genuinely human reading experience while testing the Workbench against the methodology it is intended to deliver.
- **AI inference:** A separate managed root tree in the current private Methodology space provides enough isolation without adding a space, connection or migration.
- **Uncertainty:** The pilot content has not yet been rendered or reviewed in Confluence, and no independent reader has tested it.

## Current and proposed meaning

| | Current approved position | Proposed implementation |
|---|---|---|
| Confluence delivery | A controlled lifecycle-first mirror and an approved human-publication model | A separate ten-page Methodology Lab implements the first book-style reader pilot |
| Existing pages | 108 managed pages remain current and conflict-protected | The Lab plan contains no existing controlled-mirror item and cannot delete a page |
| Content authority | Repository artefact status is authoritative | Lab prose remains proposed even when it synthesises approved sources |
| Feedback | Manual feedback can enter the governed loop | A dedicated review page separates method, explanation, structure, product, evidence and no-change signals |

## Evidence and challenge

- **Supporting evidence:** The first 108-page publication was technically successful but not human-readable enough; Jamie approved the human-first model and three pilots in PR #17.
- **Strength:** Direct founder usability evidence and an approved target model.
- **Limitation:** No live Lab render, first-use observation or independent reader evidence exists.
- **Strongest alternative:** Create a dedicated Confluence space.
- **Reason not selected first:** A new space adds permission, ownership and clean-up decisions without being necessary to isolate a ten-page pilot.
- **Consequence of no change:** The Workbench remains a safe repository publisher but does not test its ability to deliver the methodology as a human product.

## Checks

| Check | Result |
|---|---|
| Founder intent preserved | Pass – dogfooding, isolation and a feedback loop are explicit |
| Source authority | Pass – only approved, published or recorded controlled sources are accepted |
| Proposed status retained | Pass – every Lab manuscript page must remain proposed |
| Existing-page isolation | Pass – the plan uses unique Lab keys and reports `existingControlledPagesChanged: false` |
| Human authority | Pass – preview and exact founder confirmation remain separate |
| Deletion and automatic publication | Pass – both remain disabled |
| Connection scope | Pass – the existing private Methodology role is reused |
| Confidentiality | Pass – only controlled Operations Automated sources are included |
| Recovery | Pass with limitation – publication conflicts stop the write; no automatic deletion or purge exists |
| Technical validation | Pass – 53 automated tests, including Lab isolation and source mapping |
| Outcome validation | Missing – requires the rendered Lab and Jamie's review |

## Exact implementation boundary

Merging the implementation would authorise:

- the controlled Lab manuscript and manifest;
- a separate Lab preview option in the Workbench;
- source and hierarchy validation;
- use of the existing conflict and version controls; and
- preparation of a fresh live plan from clean `main`.

Merging would not authorise:

- the live Confluence write;
- changing or replacing the current 108 pages;
- approving the proposed synthesis as methodology meaning;
- a new space, connection, permission or data source;
- automatic retrieval of comments or edits;
- external publication or customer use; or
- automatic publication.

## Later live decision

After merge, Jamie should review the fresh plan and confirm:

> Publish reviewed methodology lab to Confluence

That phrase authorises only the exact current Lab plan. Any repository change, Confluence conflict or expired preview requires a new plan and confirmation.

## Review trigger

Review immediately after:

1. the Lab is rendered;
2. Jamie completes the five review questions; or
3. any authority, source-mapping, navigation, conflict or activation failure occurs.

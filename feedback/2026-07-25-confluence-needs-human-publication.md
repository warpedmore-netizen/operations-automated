---
id: OA-FEEDBACK-2026-07-25-003
title: Confluence needs a human publication model, not a repository mirror
status: proposed
owner: Jamie Peppard
date: 2026-07-25
---

# Confluence needs a human publication model, not a repository mirror

## Source and boundary

- **Source:** Jamie Peppard's review after the first governed publication created 108 tracked Confluence pages.
- **Date observed:** 2026-07-25.
- **Context:** Founder review of the private Methodology and Internal Confluence spaces.
- **Permission to use:** Retain and use within Operations Automated product and methodology development.
- **Information boundary:** Non-confidential Operations Automated material already held in the controlled repository and private Confluence spaces.
- **Authority boundary:** This feedback authorises analysis and proposal preparation. It does not approve a changed page structure, migration, deletion, external publication or methodology meaning.

## Signal

The first publication proved that Git-controlled documents can be created, versioned and reconciled safely in Confluence. It did not prove that the result is a good human publication.

Jamie reported that:

- the Methodology space should read like a book, with an intentional sequence, useful headings and concepts explained for a person;
- the Internal space should read like organisational documentation, including policies, frameworks, product and functionality descriptions, and user guides;
- Git can remain the computer-facing, developer and traceability source;
- Confluence should be the human-facing documentation and delivery surface; and
- the present page ordering and direct file-to-page conversion still exposes the repository's construction rather than the reader's need; and
- edits, comments and feedback on human-facing documents should become challenges to the methodology.

The current system answers **what controlled files exist and what state are they in?** It does not yet answer **what should this person read or do next?**

It also detects an independently edited managed page as a publication conflict but does not yet convert that interaction into a structured methodology challenge.

## Operational insight

Repository structure, publication structure and reading structure are different concerns:

| Concern | Primary user | Necessary outcome |
|---|---|---|
| Controlled source | AI, developer, maintainer and reviewer | Complete, diffable and traceable project memory |
| Publication governance | Owner, approver and assurance reviewer | Visible status, version, authority and recovery |
| Human reading | Practitioner, colleague, user or buyer | Understandable sequence, explanation and action |

One structure should not be forced to serve all three equally.

## Interpretation and challenge

### Strongest contextual interpretation

Jamie is not asking for the approved controls to be removed. The request is to stop making those controls the dominant reading experience.

### Reverse test

An auditor, maintainer or AI still needs the complete Live, Draft and Archived record. Removing it would weaken traceability. The human publication should therefore sit alongside the controlled-record view rather than replace or hide it.

### Failure test

If AI silently synthesises repository files into polished chapters, it could omit a boundary, overstate approval or change methodology meaning. Curated pages must therefore retain a source map, repository status and reviewable publication diff even when those details are visually secondary.

If every edit or comment becomes an immediate founder challenge, the system may amplify noise, duplicate the same point or treat an unauthorised assertion as evidence. A document interaction should enter a challenge queue with its source and context, then be classified, deduplicated and tested before it is promoted.

### Transfer test

A person who has never seen Git should be able to:

1. identify where to start;
2. understand the intended reading order;
3. distinguish a policy from a framework, guide, proposal or decision record; and
4. complete an ordinary task without understanding repository folders.

### Remaining uncertainty

The feedback does not yet decide:

- whether the methodology book should use a few long chapters or more short pages;
- which internal policies should be created first;
- whether the existing lifecycle pages should later move beneath a controlled-record parent or remain where they are; or
- which audience should test the structure after Jamie's review;
- which Confluence edits, comments and feedback signals the connection is authorised to retrieve; or
- what notification cadence should apply to document-derived challenges.

These questions affect implementation detail but do not prevent a bounded model proposal.

## Disposition

**Material product proposal.**

Prepare a human-first publication model and assurance pack. Recommend a two-layer structure:

1. a curated reader layer organised by human purpose; and
2. a secondary controlled-record layer preserving Live, Draft and Archived traceability.

Add a governed document-to-challenge route:

1. retain the interaction as attributed external evidence;
2. connect it to the page, controlled source and affected methodology;
3. distinguish correction, clarity, contradiction, new context, operational failure, product feedback and no action;
4. deduplicate and apply a proportionate challenge test;
5. give the item a controlled disposition; and
6. prepare a methodology proposal only where the evidence justifies one.

Do not change or delete the current 108 pages until Jamie approves the model and reviews a separate migration and publication plan.

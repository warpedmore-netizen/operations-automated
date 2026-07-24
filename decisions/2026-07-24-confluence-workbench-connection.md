---
id: OA-DECISION-2026-07-24-001
title: Prepare the Private Confluence Workbench Connection
status: recorded
decision: approved-for-private-internal-validation
decision_maker: Jamie Peppard
date: 2026-07-24
release_status: merged-for-private-internal-validation
release_date: 2026-07-25
release_pull_request: 13
release_commit: 30aa37468f0cd488db7ddb7185d9ed81287d6797
---

# Prepare the private Confluence Workbench connection

## Decision

Jamie Peppard instructed Codex to make the AI Workbench own the Confluence connection experience. Jamie should be able to paste the already-created credential into the Workbench once, rather than create or maintain an environment file or provide the credential through chat.

This initially authorised preparation of a read-only Confluence connection. On 2026-07-25 Jamie Peppard explicitly approved PR #13 for private internal validation and authorised its merge. PR #13 was merged into `main` as commit `30aa37468f0cd488db7ddb7185d9ed81287d6797`.

That later decision approved the read-only connection for private internal validation. It did not approve external release, general customer use, automatic publication or any Confluence write.

## Intended outcome

- Jamie can connect the Workbench without developer tooling.
- The credential is protected for the current Windows user outside the repository.
- Jamie can assign one accessible space as Internal and one as Methodology.
- A deliberate read-only synchronisation makes pages from those spaces available to the running Workbench as connected evidence.
- Connected evidence can influence analysis and proposal preparation without becoming instruction, authority or approval.

## Information boundary

- The browser temporarily handles the credential only while Jamie enters and submits it.
- The local server tests the credential against Atlassian and stores it using Windows Data Protection API encryption.
- The token is not returned to the browser, written to Git, stored in SQLite, added to exports or placed in conversation memory.
- Synchronised page text remains in server memory only for this proposed increment and is cleared when the server stops.
- Audit records retain connection events and counts, not credentials or page content.

## Permission and authority boundary

- Initial connection test: read-only.
- Accessible-space discovery: read-only.
- Selected-space page synchronisation: read-only.
- Create, update, move, archive and delete operations: disabled.
- Methodology preparation and release authority: unchanged.
- Jamie retains any later decision to allow a write operation or merge this product change.

## Failure and recovery

- An invalid, expired or under-scoped token returns a plain-language error without logging the token.
- A failed synchronisation leaves the previous in-memory evidence available until a later successful sync or server restart.
- Restarting the server clears connected page content but retains the encrypted connection.
- The Atlassian credential can be revoked from Atlassian independently of the Workbench.

## Repository method

- Preparation branch: `codex/workbench-confluence-connection`
- Target branch: `codex/governed-feedback-review`
- Pull request state: draft
- Direct edits to either target branch or `main`: prohibited

## Release decision

Approved and merged for private internal validation only.

The connected-evidence product specification remains `proposed` because the technical connection is still being validated and has not been approved as an externally available product. Artefact status, internal validation and external publication remain separate decisions.

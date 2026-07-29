---
id: OA-RECOVERY-2026-07-29-001
title: Steering-Control Baseline and Restoration Record
status: recorded
version: 1.0
owner: Jamie Peppard
date: 2026-07-29
recovery_status: succeeded
---

# Steering-control baseline and restoration record

## Source baseline

- Repository: `warpedmore-netizen/operations-automated`
- Starting branch: `codex/scope-workbench-action-poll`
- Starting commit: `72c1b8cb76e50f96e8226258a8aecf147c341de8`
- Starting worktree: clean
- Remote main after fetch: `61b1bd48f451907f7325f96bedc80286f93f89cc`
- Safety branch: `codex/safety-pre-steering-control-20260729`
- Baseline tag: `steering-control-baseline-20260729`
- Proposal branch: `codex/install-steering-control-recovery`, created from current `origin/main`
- Workbench build: `1.5.3-ai-owner-queue-draft`

The starting branch contained one separate approved-for-scoping Ideas Space commit. It was preserved but deliberately excluded from this proposal branch.

## Local data and configuration

- Database: `app/local-data/workbench.sqlite` (excluded from Git)
- SQLite mode: WAL with foreign keys enabled
- Schema migrations present: 1–6
- Local configuration names observed: `OPENAI_API_KEY`, `OPENAI_TIER_1_MODEL`, `OPENAI_TIER_2_MODEL`, `OPENAI_TIER_3_MODEL`, `OPENAI_TRANSCRIBE_MODEL`, `PORT`
- Secret values were not read into the record or copied to Git.
- Confluence credentials remain Windows-user encrypted outside Git and SQLite.

## Recorded baseline counts

| Record | Count |
|---|---:|
| Conversations | 12 |
| Messages | 84 |
| Feedback | 4 |
| Operational records | 21 |
| Operational links | 1 |
| Operational activity entries | 35 |
| Governed Decisions | 2 |
| Governed Approvals | 15 |
| Implementation Jobs | 1 |
| Confluence managed page mappings | 128 |
| Confluence publication runs / receipts | 6 |
| Audit events | 423 |

The Confluence mappings comprise 128 managed pages, including 20 Methodology Lab items. Receipts comprise one controlled-mirror run and five methodology-lab runs. Page bodies, tokens and credentials are not included in this record.

## Backup

- Method: Node SQLite online backup API against the active database, incorporating the live WAL consistently.
- Location: `%LOCALAPPDATA%\OperationsAutomated\Workbench\backups\steering-control-20260729\workbench-baseline-20260729.sqlite`
- Location boundary: Jamie's user-local application data, outside the tracked repository.
- File size: 9,826,304 bytes
- SHA-256: `9C1C48D3D168602B9525638175F51EB6DFBB4C5550036CA0271C82A37CCF2974`
- File owner observed: Jamie's Windows account; inherited user-local ACLs remain in place.

## Restoration test

The backup was copied into a new temporary user-local data root. An isolated Workbench started on port 42873 with local provider mode and the restored copy.

The restored Workbench API returned:

- build `1.5.3-ai-owner-queue-draft`;
- 12 conversations and 84 messages;
- 21 operational records;
- 2 Decisions and 15 Approvals;
- 1 Implementation Job;
- 6 publication receipts; and
- 128 Confluence mappings.

Result: **recovery succeeded**. The exact temporary server process was stopped and its verified temporary restore directory was removed. The external baseline backup was retained.

## Restoration route

1. Stop or isolate the Workbench instance that must not receive writes.
2. Copy the retained backup to a new `WORKBENCH_DATA_ROOT` as `workbench.sqlite`.
3. Start the same or a migration-compatible Workbench build with `WORKBENCH_FORCE_LOCAL=1` on an unused local port.
4. Verify conversations, work, Decisions, Approvals, Implementation Jobs and publication records through the APIs.
5. Only replace a live data root after Jamie authorises the exact recovery and the current database has also been preserved.

This record proves a test restore. It does not authorise overwriting the live database or deleting later data.

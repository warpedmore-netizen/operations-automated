---
id: OA-ASSURANCE-STEERING-001
title: Steering, Project-Boundary, Prompt-Control and Recovery Assurance Pack
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-29
---

# Steering, project-boundary, prompt-control and recovery assurance pack

## What is being reviewed

This pack covers the proposed Steering and Collaboration Contract, Product Purpose reconciliations, project and prompt registries, recovery gate and Workbench 1.6.0 control surface prepared on `codex/install-steering-control-recovery`.

The supplied implementation instruction is recorded as approved for this bounded preparation. It does not approve the meaning drafted in response, merge the branch, release the Workbench, migrate Dynamic Governance or publish anything.

## Current authoritative meaning

- Operations Automated methodology v0.7 remains the approved baseline for internal validation.
- `CHARTER.md@0.3` remains the approved purpose source for the core methodology project.
- `product/MVP.md@0.1` remains the approved purpose source for the private Workbench experiment.
- Git retains methodology and controlled-document authority. SQLite retains private Workbench operational memory.
- Jamie Peppard retains methodology meaning, Product Purpose, consequential connections, merge, release, publication, spending, risk acceptance and delegated authority.
- The existing Governance implementations are retained in this repository as product evidence. No separate target repository or migration has been approved.
- The Incident Management RPG and Football Manager Player Lab are not part of the Operations Automated core project.

## Proposed meaning

- Product Purpose explains why each product exists and what it must not become. Steering separately controls interpretation, request classification, project routing, prompt selection, build provenance, conflicts and recovery.
- The Operations Automated Methodology and private AI Workbench remain one core project with different purpose sources and data responsibilities.
- Dynamic Governance becomes an explicitly separate product boundary. A later human decision must approve its Product Purpose, final name, target repository and non-destructive migration plan before anything moves.
- The Incident Management RPG and Football Manager Player Lab remain separate projects with no build authority granted by this repository.
- Every new material Workbench Build Job must record the exact target project, current Product Purpose identifier and version, current steering identifier and version, approved prompt identifier and version, and exact prompt SHA-256 after a successful recovery gate.
- Historical Build Jobs are not reconstructed from memory. Missing provenance remains visible as legacy evidence.
- The Workbench may classify a request and recommend a route. Accepting, deferring or rejecting that route is retained, but does not approve Product Purpose, repository creation, migration, implementation, release or publication.

All new Product Purpose documents and `STEERING.md` remain `proposed` until Jamie records a separate explicit decision.

## Recorded evidence

### Source and recovery baseline

- Starting clean branch and commit: `codex/scope-workbench-action-poll` at `72c1b8cb76e50f96e8226258a8aecf147c341de8`.
- Preserved safety references: local branch `codex/safety-pre-steering-control-20260729` and tag `steering-control-baseline-20260729`.
- Proposal branch created from `origin/main` at `61b1bd48f451907f7325f96bedc80286f93f89cc`.
- A consistent online SQLite backup was created outside Git at `%LOCALAPPDATA%\OperationsAutomated\Workbench\backups\steering-control-20260729\workbench-baseline-20260729.sqlite`.
- Backup size: 9,826,304 bytes. SHA-256: `9C1C48D3D168602B9525638175F51EB6DFBB4C5550036CA0271C82A37CCF2974`.
- The backup restored into an isolated Workbench and retained 12 conversations, 84 messages, 21 operational records, 2 Decisions, 15 Approvals, 1 Implementation Job, 6 publication receipts and 128 managed Confluence page mappings.
- The detailed route is recorded in `docs/recovery/2026-07-29-steering-control-baseline.md`. The test does not authorise overwriting the live database.

### Exact prompt and decision evidence

- `OA-PROMPT-STEERING-INSTALL-001@1.0` matches the supplied instruction exactly after normalising line endings. Its normalised SHA-256 is `F91EDF16A2CCD767525B615211F6C324C1CFCD5975E05340C711E42A1D500E27`.
- `OA-PROMPT-WORKBENCH-BUILD-001@1.0` registers the proposed exact Workbench implementation handoff as `draft`. Future Workbench Build Jobs remain blocked until the Steering contract and this prompt are separately approved.
- The earlier Workbench handoff is retained as `OA-PROMPT-WORKBENCH-BUILD-001@0.9` with status `superseded`; current selection and prompt collation exclude it.
- The repository's established `decisions/` directory is used as the existing equivalent of a new `docs/decisions/` tree, avoiding duplicate decision authorities.

### Implementation and validation evidence

- Additive SQLite schema migration 7 retains project-boundary intakes and adds provenance fields to new Implementation Jobs. Existing records are not rewritten.
- The **Purpose & steering** Workbench surface was exercised through an isolated local server at desktop and 390-pixel phone width.
- A Dynamic Governance request produced `create-separate-project`; a Workbench recovery-panel request produced `remain-current-product`.
- The form interaction completed after correcting a stale event-reference defect found only by the live browser check. No browser warnings or errors remained.
- Complete Workbench suite: 91 tests passed.
- Retained Governance proof-of-concept suite: 27 tests passed.
- Retained Dynamic Governance site: production build passed and 10 rendered-interface tests passed.
- `git diff --check` passed.

## Alternatives considered

### Keep the current informal controls

This avoids new control files but leaves project routing, exact prompt selection, build provenance and recovery state dependent on conversation memory. It does not meet the supplied requirement.

### Make Dynamic Governance a Workbench module

This would reuse infrastructure, but it would mix organisational-governance authority and data ownership with methodology-development authority and private Workbench memory. The proposal rejects this boundary collapse.

### Move Governance now

A new repository could make the separation physical immediately, but no target repository, Product Purpose, migration acceptance criteria or deletion authority is approved. Moving now would create avoidable data and recovery risk.

### Create a second decision directory

Adding `docs/decisions/` would match the requested example literally but duplicate the repository's existing authoritative `decisions/` structure. The proposal keeps one decision source.

## Dependencies

- Jamie's separate decisions on the proposed Steering contract and each proposed Product Purpose reconciliation.
- The approved v0.7 methodology and current Workbench purpose sources remaining authoritative until those decisions change them.
- The user-local baseline backup remaining readable and protected.
- A later Dynamic Governance repository and migration decision before physical separation.
- Existing human approval gates for change preparation, merge, release and publication.

## Risks and controls

| Risk | Control in this proposal | Residual decision |
|---|---|---|
| Implemented UI is mistaken for approved meaning | Proposed status and authority boundary shown in files, API and interface | Jamie decides steering and purpose meaning separately |
| A request enters the wrong product | Registry-backed classification and boundary recommendation | Jamie accepts, defers or rejects the route |
| An old prompt controls a build | Exact current approved prompt and hash required; superseded prompts excluded | Jamie approves later prompt changes |
| A schema change damages retained memory | Online baseline backup, isolated restore test and additive migration | Jamie authorises any live recovery |
| Governance separation causes loss or split authority | Current implementation retained; conflict remains visible | Jamie approves target repository and non-destructive migration |
| Historical provenance is invented | Legacy jobs remain visibly incomplete | No reconstruction without recorded evidence |
| Specialist Workbench routes regress | Full Workbench and retained Governance suites run | Further private validation remains required |

## Known conflicts and open points

1. Dynamic Governance is defined as a separate product while `governance-poc/` and `governance-site/` remain in the core repository. This is intentionally recorded as `controlled-pending-migration`, not silently resolved.
2. The existing historical Implementation Job has no exact steering and prompt provenance because those fields did not exist. It remains legacy evidence.
3. `STEERING.md` and all three reconciliation documents are proposed. Their implementation does not change their status.
4. The exact future Workbench build prompt is Draft. The current installation instruction does not approve it for later builds.
5. Separate open proposal branches may describe later Workbench or methodology increments. They must be reconciled through their own review and cannot silently override this branch or the approved v0.7 baseline.

## Exact decisions required

Jamie should make these as separate decisions:

1. **Implementation review:** approve, revise, defer or reject merging the Workbench 1.6.0 control implementation. Approval here would still not release or publish it externally.
2. **Steering meaning:** approve, revise, defer or reject `STEERING.md@0.1`.
3. **Product Purpose reconciliations:** decide each of the Operations Automated Methodology, AI Workbench and Dynamic Governance proposals separately.
4. **Future Workbench prompt:** approve, revise, defer or reject `OA-PROMPT-WORKBENCH-BUILD-001@1.0` after the Steering decision. Until then, new material Build Jobs are deliberately blocked.
5. **Dynamic Governance separation:** approve a final product name, target repository, migration acceptance criteria, recovery route and non-destructive migration plan before any copy, cutover or later deletion.
6. **Release:** after any approved merge, make the separate private Workbench release decision. Live publication, external release and customer use remain outside this package.

Until those decisions are recorded, the safe disposition is: retain the proposal branch and draft pull request, retain the tested backup, keep current approved meaning authoritative, and move no Governance implementation or data.

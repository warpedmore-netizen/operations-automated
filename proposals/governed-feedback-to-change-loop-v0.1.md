---
id: OA-PRODUCT-CHANGE-006
title: Governed Feedback-to-Change Loop
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-23
approval_required: true
---

# Governed Feedback-to-Change Loop

## Problem or learning

The Workbench can retain feedback, but retention alone does not explain whether the feedback corrects one answer, should inform future work, supplies evidence, or justifies a methodology or product change. The previous proposal-packet route also lacked explicit preparation and release decisions, repository references, reindexing and an implementation receipt.

## Proposed product change

Add a controlled workflow that:

1. retains the source, wording, type, date, status, workspace and submitting user for every feedback record;
2. classifies feedback without treating classification as approval;
3. creates structured methodology or product change proposals only for eligible candidates;
4. separates preparation decisions from final release decisions;
5. creates a bounded implementation instruction that requires a new branch and draft pull request;
6. records the decision record, changelog, version impact, validation results, branch, pull request and commits;
7. allows only Jamie Peppard's explicit `Approve and merge` release action to authorise a methodology merge during the founder-controlled stage; and
8. reindexes the approved repository after a confirmed merge and issues an implementation receipt.

The founder review surface should lead with a plain-English account of:

- why the change exists;
- what would change;
- what remains controlled;
- the decision required now; and
- one prominent link to the exact draft pull request when it exists.

Add a Challenge Studio and a persistent **Send me a challenge** action. The action should prepare one focused, contextual methodology question rather than an abstract questionnaire, with routes for principles, AI suitability, manual work and delivery capability. The user's response is evidence, not approval.

## Current and proposed wording

- **Current product position:** Saved feedback can be listed and converted into a generic proposal packet.
- **Proposed product position:** Saved feedback is reviewed and classified first. Eligible change candidates enter a Decision Inbox with independently recorded preparation and release decisions.

No approved methodology wording is changed by this product proposal.

## Relevant approved sources

- `GOVERNANCE.md` — explicit human approval, AI-managed branch and draft pull request preparation, separate publication authority.
- `evolution/methodology-evolution-system.md` — feedback capture, impact analysis, proposal preparation, approval, versioning and retained learning.
- `methodology/output-contract.md` — useful output, evidence, uncertainty, human control and retained artefacts.

## Affected product files and components

- Workbench feedback persistence and migration
- Feedback classification API and interface
- Change proposal structure
- Decision Inbox and status workflow
- Bounded implementation handoff
- Repository and pull-request references
- Founder-only release confirmation
- Repository indexing and approved-context retrieval
- Audit events and implementation receipts
- Workbench tests and documentation
- Plain-language review brief and direct GitHub review access
- Challenge Studio and focused challenge prompts

## Rationale

The change makes feedback operational without allowing AI, classification or preparation to acquire approval authority. It also provides the traceability needed to connect a user correction to a prepared implementation, human decisions, repository evidence and the approved baseline used by future answers.

## Evidence

- Jamie Peppard explicitly requested the workflow and specified the required classifications, decisions, repository method, release boundary and tests on 2026-07-23.
- Existing Workbench feedback records demonstrated that saved wording and generic packets were insufficient to explain what should happen next.
- Founder review on 2026-07-24 established that technically complete proposal data is still insufficient when the decision-maker cannot quickly understand the choice or open the exact change.
- Approved governance already permits AI to prepare a branch and draft pull request while reserving authoritative meaning and merge approval for Jamie.

## Credible alternatives

1. Keep feedback as a passive inbox and handle repository changes entirely in Codex conversations.
2. Add classification only, without repository preparation or release tracking.
3. Integrate directly with GitHub and merge on preparation approval.

The third alternative is rejected because it collapses preparation and release authority. The first two remain credible lower-complexity options but do not satisfy the required traceability and lifecycle.

## Risks and unintended consequences

- A detailed workflow may create overhead for simple answer corrections.
- A simplified review could omit a material risk if the full proposal is not easily inspectable.
- Challenge prompts could become repetitive, overly abstract or shift analytical work back to the user.
- Classification may be mistaken for prioritisation or approval.
- Repository references could become stale or point to a different branch than the reviewed change.
- A release action could be spoofed without an authenticated user boundary.
- Reindexing the wrong ref could expose proposed or rejected content as approved.
- An implementation receipt could be recorded before the actual merge.

Controls include candidate-only proposals, append-only decisions, explicit phase separation, non-main branch validation, draft-PR requirements, founder-name and confirmation checks, merge-receipt validation, approved-only retrieval filters and audit records.

Readable summaries do not replace the full proposal: evidence, alternatives, risk and trace remain available in a collapsed section. Challenges require a concrete scenario, a provisional response, an explicit uncertainty and one primary question.

## Validation requirements

- Prove classification cannot create approval.
- Prove preparation does not edit main.
- Prove release cannot occur without preparation approval.
- Prove preparation and release decisions are separate records.
- Prove rejected feedback is excluded from approved retrieval.
- Prove merged approved content is reindexed and retrievable.
- Prove every transition, decision and repository reference remains auditable.
- Run the complete repository test suite.

## Expected cost and route

Proposal generation is deterministic and local by default. AI model use remains optional for later drafting or analysis and is subject to the existing route and cost preview. Repository operations use local Git and GitHub CLI only after the relevant human action.

## Version impact

- Workbench application build: `0.6.0`
- Product change: minor capability increment
- Approved methodology baseline: unchanged by this proposal
- External publication: not authorised

## Required decisions

1. **Preparation decision:** Prepare change, request revision, reject or defer.
2. **Release decision after implementation:** Approve and merge, request changes, reject or defer.

These decisions must remain separate and auditable.

---
id: OA-GOV-001
title: Methodology Governance
status: approved
version: 0.2
owner: Jamie Peppard
---

# Methodology Governance

## States

| State | Meaning |
|---|---|
| Idea | Unassessed thought or feedback |
| Draft | Work being developed |
| Proposed | Complete enough for formal review |
| Approved | Authorised for internal use |
| Published | Approved for external use |
| Superseded | Retained for history but no longer current |
| Rejected | Considered and deliberately not adopted |

## Change process

1. Capture the idea, evidence or feedback.
2. Identify affected principles, modules, users and outputs.
3. Apply relevant OPERATE and TIGIPI questions.
4. Draft the proposed change and alternatives.
5. Check consistency, duplication, security and unintended consequences.
6. Record unresolved questions and the recommended decision.
7. Obtain the required human approval.
8. Version the change and update the changelog.
9. Monitor the outcome and trigger further review where needed.

## AI-led, human-controlled workflow

Jamie defines the problem, desired outcome, constraints and authority boundaries. AI may then manage the routine repository work needed to develop a proposal, including creating a branch, drafting content, checking consistency, committing changes, pushing the branch and opening a draft pull request.

For each material proposal, AI should give Jamie a plain-language summary of:

- What outcome the change is intended to create
- What changed and why
- Which checks were performed
- What choices, risks or inconsistencies require a human decision

Jamie may approve, request revision or reject the proposal without needing to edit repository files or operate developer tooling. An approval must be explicit and recorded in the conversation, pull request or a decision record. Silence, continued discussion and technical readiness do not constitute approval.

AI may carry out an approved merge when Jamie explicitly authorises it. External publication remains a separate decision and must not be inferred from approval for internal use.

Merging a change records it in the controlled project memory. It does not by itself change an artefact's governance state; any change to `approved` or `published` must be explicitly authorised and recorded.

## Initial authority matrix

| Action | AI or automation | Jamie approval |
|---|---:|---:|
| Capture and organise thoughts | Allowed | No |
| Retrieve approved material | Allowed | No |
| Ask questions and summarise | Allowed | No |
| Draft a methodology change | Allowed | No |
| Run consistency checks | Allowed | No |
| Manage branches, commits and draft pull requests | Allowed | No |
| Change authoritative meaning | Propose only | Yes |
| Change an artefact to Approved or Published | Execute only after explicit authorisation | Yes |
| Merge a reviewed proposal | Execute only after explicit authorisation | Yes |
| Publish externally | Not autonomous | Yes |
| Contact users or customers | Not autonomous | Yes |
| Spend money | Not autonomous | Yes |
| Change access or security | Not autonomous | Yes |
| Permanently delete authoritative content | Not autonomous | Yes |

## Review triggers

A review may be triggered by:

- Material user feedback
- A failed or misleading outcome
- A change in technology, regulation or accepted practice
- A contradiction within the methodology
- New evidence invalidating an assumption
- A security or privacy concern
- A scheduled periodic review

## Intellectual-property boundary

Personal experience and generic operational reasoning may inform this work. Confidential employer information, internal documents, customer or employee data, proprietary configurations and identifiable incident details must not be copied into the repository.

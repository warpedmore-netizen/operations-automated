---
id: OA-GOV-001
title: Methodology Governance
status: approved
version: 0.3
owner: Jamie Peppard
---

# Methodology Governance

## States

| State | Meaning |
|---|---|
| Idea | Unassessed thought, signal or feedback |
| Draft | Work being developed |
| Proposed | Complete enough for formal review |
| Approved | Authorised for internal use |
| Published | Approved for external use |
| Superseded | Retained for history but no longer current |
| Rejected | Considered and deliberately not adopted |

The state belongs to the artefact, not merely to the branch or repository. Technical completion, a merge or continued discussion does not change the state automatically.

## Change process

1. Capture the idea, evidence, feedback or review trigger with its source and information boundary.
2. Identify affected principles, lenses, readiness positions, stages, modules, users, products and outputs.
3. Compare the signal with approved material and related feedback.
4. Apply relevant Operations Automated, OPERATE and TIGIPI questions.
5. Draft the proposed change, credible alternatives and likely consequences.
6. Check consistency, duplication, links, terminology, security, governance and unintended effects.
7. Record unresolved questions and the recommended decision.
8. Notify the authorised human with a proportionate decision packet.
9. Obtain explicit human approval, revision or rejection.
10. Version and merge an approved change and update the changelog.
11. Distribute only to authorised delivery surfaces and audiences.
12. Monitor the outcome and trigger further review where needed.

The [methodology evolution system](evolution/methodology-evolution-system.md) defines how these steps can become progressively more automated without weakening human authority.

## AI-led, human-controlled workflow

Jamie defines or confirms the problem, desired outcome, values, constraints and authority boundaries. AI may then manage routine work needed to develop a proposal, including:

- Recording and organising authorised feedback
- Inspecting the controlled project memory
- Connecting related signals and identifying contradictions
- Drafting analysis, alternatives and methodology changes
- Creating a branch and editing affected artefacts
- Running consistency and technical checks
- Committing and pushing the proposal
- Opening a draft pull request
- Preparing a decision packet and notification
- Implementing revisions requested by Jamie

For each material proposal, AI should give Jamie a plain-language summary of:

- What evidence or outcome triggered the proposal
- What change is intended and why
- Who and what may be affected
- What could improve or become worse
- What alternatives, assumptions and uncertainties remain
- Which checks were performed
- What precise decision or direction is required

Jamie may approve, request revision or reject the proposal without needing to edit repository files or operate developer tooling. An approval must be explicit and recorded in the conversation, pull request or a decision record. Silence, continued discussion, technical readiness and a successful automated check do not constitute approval.

AI may carry out an approved merge when Jamie explicitly authorises it. External publication remains a separate decision and must not be inferred from approval for internal use.

## Initial authority matrix

| Action | AI or automation | Jamie approval |
|---|---:|---:|
| Capture and organise thoughts from authorised sources | Allowed | No |
| Retrieve approved material | Allowed | No |
| Ask questions, analyse and summarise | Allowed | No |
| Cluster feedback and recommend priority | Allowed | No |
| Draft a methodology or product change | Allowed | No |
| Run consistency, governance and technical checks | Allowed | No |
| Manage branches, commits and draft pull requests | Allowed | No |
| Notify Jamie that a decision is required through an approved channel | Allowed | Channel approval required first |
| Connect a new feedback, communication, data or business service | Not autonomous | Yes |
| Collect identifiable analytics or confidential information | Not autonomous | Yes, with an approved data basis |
| Change authoritative meaning | Propose only | Yes |
| Change an artefact to Approved or Published | Execute only after explicit authorisation | Yes |
| Merge a reviewed proposal | Execute only after explicit authorisation | Yes |
| Publish or communicate externally | Not autonomous | Yes |
| Contact users or customers | Not autonomous | Yes |
| Spend money | Not autonomous | Yes |
| Change access, security or agent permissions | Not autonomous | Yes |
| Accept operational risk or consequence | Not autonomous | Yes |
| Permanently delete authoritative content | Not autonomous | Yes |

## Feedback and evidence controls

- Record the source, permission, date and relevant context for material feedback.
- Minimise personal and confidential information.
- Separate reported evidence, user judgement, AI inference and recommendation.
- Do not infer importance solely from volume; consider value, consequence, risk and affected people.
- Link duplicates and related signals while retaining meaningful differences.
- Record rejection and no-change decisions with their reasoning.
- Do not use feedback from an unauthorised source merely because it is technically accessible.

## Method and delivery synchronisation

- Delivery products must identify the methodology version they use.
- Proposed content must not be presented as approved guidance.
- An approved methodology release should identify affected prompts, templates, checks, products and migration needs.
- Delivery behaviour must not change silently when authoritative meaning changes.
- Product feedback should return to the evolution system without automatically editing the method.

## Review triggers

A review may be triggered by:

- Material user feedback or repeated confusion
- A failed, harmful or misleading outcome
- A change in technology, regulation or accepted practice
- A contradiction, duplication or gap within the methodology
- New evidence invalidating an assumption
- A security, privacy, safety or ethical concern
- A change in a delivery product or AI capability
- A scheduled periodic review

## Intellectual-property boundary

Personal experience and generic operational reasoning may inform this work. Confidential employer information, internal documents, customer or employee data, proprietary configurations and identifiable incident details must not be copied into the repository.

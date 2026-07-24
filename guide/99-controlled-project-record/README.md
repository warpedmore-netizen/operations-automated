---
id: OA-GUIDE-120
title: Controlled Project Record
status: approved
version: 0.2
owner: Jamie Peppard
date: 2026-07-23
last_updated: 2026-07-24
approval_required: true
approval_date: 2026-07-24
approval_scope: internal validation
---

# 99 — Controlled project record

## Purpose and intended reader

This chapter separates reader guidance from the evidence, proposals, decisions, priorities, product experiments and release history used to develop Operations Automated. It is for Jamie, methodology maintainers, reviewers and people who need traceability.

Material in this section may explain why guidance changed, but it is not current methodology merely because it exists in the repository.

## Questions this chapter answers

- What is the current approved internal baseline?
- Which work is proposed, draft, superseded or otherwise unresolved?
- What evidence or founder feedback triggered a change?
- What decision and approval boundary applied?
- Which product or application experiments are learning evidence rather than methodology?
- What remains outstanding and where is release history retained?

## Topics

- Roadmap, priorities and outstanding work
- Feedback and evidence records
- Change proposals and assurance packs
- Pilot cases and retained learning
- Product, application and commercial hypotheses
- Changelog, releases and approval history
- Rejection, deferral, supersession and no-change reasoning
- Branch and pull-request traceability where relevant

## Expected inputs

- Artefact ID, source, owner, date, status and version where applicable
- Permission and confidentiality boundary
- Trigger, evidence and limitations
- Affected methodology, product and delivery components
- Decision, approver, scope, conditions and review trigger
- Release or retained location
- Outcome evidence after use

## Outputs

- Traceable evidence-to-decision chain
- Clear current, proposed and historical separation
- Visible unresolved work and control point
- Release and approval record
- Retained product or pilot learning
- Review trigger and outcome disposition

## Interfaces and hand-offs

| Interface | Record exchanged |
|---|---|
| Methodology guide | Current authoritative link, status and validation boundary |
| Feedback and research | Source, permission, signal, evidence and limitation |
| Governance and assurance | Proposal, alternatives, checks, decision and conditions |
| Product and delivery | Methodology version, observed friction, migration and release needs |
| Roadmap and priorities | Outstanding work, dependency and human control point |
| External publication | Explicitly approved content, audience, version and withdrawal route |

## Current approved and proposed guidance and records

| Record area | Status | Purpose |
|---|---|---|
| [Roadmap](../../ROADMAP.md) | Proposed | Workstreams, milestones and control points |
| [Current MoSCoW priorities](../../PROJECT-PRIORITIES.md) | Proposed | Must, should, could, will-not and outstanding work |
| [Changelog](../../CHANGELOG.md) | No artefact status declared | Retained release history |
| [`feedback/`](../../feedback/) | Mixed; status belongs to each record | Founder and methodology signals |
| [`proposals/`](../../proposals/) | Mixed; status belongs to each proposal | Changes, assurance and decisions |
| [`pilots/`](../../pilots/) | Draft at present | Case and validation evidence |
| [Methodology evolution system](../../evolution/methodology-evolution-system.md) | Approved for internal validation | Controlled evidence-to-release loop |
| [Methodology Governance](../../GOVERNANCE.md) | Proposed | States, authority and change rules |
| [Delivery system](../../product/delivery-system.md) | Approved for internal validation | Current facilitated-delivery direction |
| [Private OPERATE workspace MVP](../../product/MVP.md) | Approved for private testing | Parked product experiment and learning |
| [Commercial validation strategy](../../product/commercial-validation-strategy.md) | Proposed | Buyer, offer and revenue hypotheses |
| [`app/`](../../app/) | Product experiment; status recorded in related product documents | Parked private workspace code |

Repository folders and a Git merge do not assign governance status. Always inspect the artefact frontmatter and recorded approval scope.

## Known gaps

- No generated register currently lists every artefact, status, version and supersession relationship.
- Some records have no status frontmatter and need an explicit record classification.
- Outcome observation after an approved release is not yet consistently linked back to the proposal.
- Product prototypes on separate branches need a deliberate keep, supersede or close decision.
- External-publication, withdrawal and archive structures are not approved.

## Previous and next

- **Previous:** [10 — Tools and reference](../10-tools-and-reference/README.md)
- **Next:** Return to the [reader guide](../README.md) or [00 — Start here](../00-start-here/README.md)
- **Governance route:** [07 — Governance, assurance and review](../07-governance-assurance-and-review/README.md)

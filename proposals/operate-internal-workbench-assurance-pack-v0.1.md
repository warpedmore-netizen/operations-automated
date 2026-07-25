---
id: OA-ASSURANCE-OPERATE-INTERNAL-WORKBENCH-001
title: Operate Internal Workbench Assurance Pack
status: proposed
owner: Jamie Peppard
date: 2026-07-25
---

# Operate internal workbench assurance pack

## Decision in one sentence

- **Decision required now:** decide whether the proposed Operate model is suitable for a bounded private internal pilot and release review.
- **AI recommendation:** approve the model for private pilot after reviewing the definitions and weights; keep advanced automation, external connections and broader use outside this decision.
- **Current authority:** preparation only.

## What Jamie said and what AI inferred

- **Jamie said:** Operate should be one coherent internal workbench for capturing, connecting, prioritising and learning from operational work, with **My Work**, Cases, Requests, Tasks, approvals and Brand Review proved end to end first.
- **AI inferred:** the safest MVP is a work-control layer over the current Workbench, not a separate application or a complete implementation of all future record types.
- **AI did not infer:** approval of methodology meaning, the initial dictionary, the priority weights, autonomous execution, external connections, release, merge or publication.

## Current meaning and proposed product meaning

| | Current approved position | Proposed product position |
|---|---|---|
| Connected work | Operational records should form a connected network | Provide durable product records and visible links |
| Work entry | Specialist Workbench areas and conversations | **My Work** becomes the ordinary first screen |
| Priority | Proportionate judgement | Explainable, correctable 80:20 recommendation |
| Approval | Named human authority | Unchanged; exact confirmation for consequential states |
| Risk | Cross-cutting | Retained across every record type |
| Wider dictionary | Approved concepts exist across methodology | One proposed in-product Operations Bible |

The approved methodology baseline is not changed.

## Evidence, judgement, inference and assumptions

- **Recorded evidence:** approved connected-work guidance; existing local Decision Inbox and Brand Review data; no previous unified operational inbox or Case/Request/Task record model.
- **Jamie's judgement:** the operating model and MVP sequence in the attached brief.
- **AI inference:** progressive disclosure and a single local record/link model are the smallest coherent implementation.
- **Assumption:** a local private pilot with non-confidential work is sufficient to calibrate the first weights and definitions.
- **Evidence gap:** no real-work priority comparison, independent-user test or wider adoption evidence yet exists.

## Alternatives considered

1. **Build every record type and automation now.** More complete, but high complexity and weak evidence.
2. **Add only a task list.** Simpler, but loses connected cases, requests, decisions, risk and learning.
3. **Use separate specialist registers.** Familiar, but recreates fragmented attention and duplicated context.
4. **Keep the current Workbench unchanged.** Lowest implementation risk, but does not meet the supplied operating model.

The bounded connected MVP is recommended because it proves the key loop while keeping later capability reversible.

## Dependencies and controls

- approved v0.6 methodology and connected-work guidance;
- existing Workbench governance and local persistence;
- existing Decision Inbox and Brand Review routes;
- draft PR #21 as the parent Mobile Knowledge Workbench proposal; this Operate change is deliberately stacked on that branch so its review diff remains bounded;
- artefact status as the authority signal;
- Jamie's retained approval, risk-acceptance, release and merge authority; and
- later real-work and independent-user validation.

No new external connection, account, hosted deployment or spending is required.

## What could improve and what could become worse

- **Could improve:** attention, flow, relationship visibility, capture quality, decision readiness and retained learning.
- **Could become worse:** inbox noise, over-classification, score anchoring, false precision and a Case becoming an unhelpful catch-all.

The interface therefore shows source factors, allows correction, keeps fields optional and makes the authority boundary visible.

## Checks

- source syntax checks: required;
- complete automated Workbench suite: required;
- create/link/complete API journey: covered by automated tests;
- explicit Approval confirmation: covered by automated tests;
- invalid Case-link protection: covered in the server;
- mobile and desktop structural interface checks: covered by automated tests;
- live in-app browser review: attempted, but the preview tab was blocked after an initial connection-refused page and was not bypassed;
- real founder work-order calibration: not run;
- independent-user test: not run; and
- Brand Review queue: the usual local Workbench endpoint was unavailable when checked, so retained repository feedback was applied without claiming the queue was empty.

## Exact decision required

Jamie is asked to decide:

> Approve the proposed Operate record model and interface for bounded private internal pilot and release review, subject to the recorded validation gaps.

That decision would not:

- approve methodology meaning;
- accept a Risk or approve a Change;
- merge the branch;
- publish or deploy the product;
- connect another system;
- authorise autonomous execution;
- approve customer use; or
- delegate Jamie's retained authority.

Those remain separate decisions.

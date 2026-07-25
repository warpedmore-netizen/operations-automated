---
id: OA-ASSURANCE-OPERATE-INTERNAL-WORKBENCH-001
title: Operate Internal Workbench Assurance Pack
status: proposed
owner: Jamie Peppard
date: 2026-07-26
---

# Operate internal workbench assurance pack

## Decision in one sentence

- **Decision required now:** decide whether the proposed Operate model is suitable for a bounded private internal pilot and release review.
- **AI recommendation:** approve the model for private pilot after reviewing the definitions and weights; keep advanced automation, external connections and broader use outside this decision.
- **Current authority:** preparation only.

## What Jamie said and what AI inferred

- **Jamie said:** Operate should be one coherent internal workbench for capturing, connecting, prioritising and learning from operational work, with **My Work**, Cases, Requests, Tasks, approvals and Brand Review proved end to end first. He then clarified that it may become multi-tiered like ServiceNow or Jira, but its difference is work linked by people and AI so the structure gives information back.
- **AI inferred:** the safest MVP is a governed operational graph over the current Workbench. It should support optional parent levels, visible human/AI link provenance, correction and a small set of derived signals without attempting the breadth of a mature service-management suite.
- **AI did not infer:** approval of methodology meaning, the initial dictionary, the priority weights, the relationship rules, derived signals, autonomous execution, external connections, release, merge or publication.

## Current meaning and proposed product meaning

| | Current approved position | Proposed product position |
|---|---|---|
| Connected work | Operational records should form a connected network | Provide durable product records and visible links |
| Relationship provenance | Evidence, inference and authority should remain distinguishable | Retain who or what proposed a link and who confirmed it |
| Information returned | Outputs should provide useful analysis, not merely collect inputs | Derive bounded, inspectable signals from the active graph |
| Work entry | Specialist Workbench areas and conversations | **My Work** becomes the ordinary first screen |
| Priority | Proportionate judgement | Explainable, correctable 80:20 recommendation |
| Approval | Named human authority | Unchanged; exact confirmation for consequential states |
| Risk | Cross-cutting | Retained across every record type |
| Wider dictionary | Approved concepts exist across methodology | One proposed in-product Operations Bible |

The approved methodology baseline is not changed.

## Evidence, judgement, inference and assumptions

- **Recorded evidence:** approved connected-work guidance; existing local Decision Inbox and Brand Review data; no previous unified operational inbox or Case/Request/Task record model.
- **Jamie's judgement:** the operating model and MVP sequence in the attached brief, followed by the operational-graph clarification on 26 July 2026.
- **AI inference:** progressive disclosure, optional tiers, a single local record/link model and inspectable derived signals are the smallest coherent implementation.
- **Assumption:** a local private pilot with non-confidential work is sufficient to calibrate the first weights and definitions.
- **Evidence gap:** no real-work priority or network-signal comparison, semantic AI-link evaluation, independent-user test or wider adoption evidence yet exists.

## Alternatives considered

1. **Build every record type and automation now.** More complete, but high complexity and weak evidence.
2. **Add only a task list.** Simpler, but loses connected cases, requests, decisions, risk and learning.
3. **Use separate specialist registers.** Familiar, but recreates fragmented attention and duplicated context.
4. **Keep the current Workbench unchanged.** Lowest implementation risk, but does not meet the supplied operating model.
5. **Build a comprehensive multi-tier service-management suite now.** Closer to mature platforms, but would front-load configuration before the distinctive information value is validated.

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

- **Could improve:** attention, flow, relationship visibility, capture quality, dependency understanding, decision readiness and retained learning.
- **Could become worse:** inbox noise, over-classification, graph noise, score anchoring, false precision and a Case becoming an unhelpful catch-all.

The interface therefore shows source factors, allows correction, keeps fields optional, requires confirmation before an AI-suggested link becomes active and makes the authority boundary visible.

## Checks

- source syntax checks: required;
- complete automated Workbench suite: required;
- create/link/complete API journey: covered by automated tests;
- optional parent inheritance and circular-hierarchy protection: covered by automated tests;
- human and AI-assisted relationship provenance: covered by automated tests;
- AI link confirmation and non-destructive rejection: covered by automated tests;
- derived network signal boundaries: covered by automated tests;
- explicit Approval confirmation: covered by automated tests;
- invalid Case-link protection: covered in the server;
- mobile and desktop structural interface checks: covered by automated tests;
- live in-app browser review: completed at 1440 × 900 and 390 × 844 using a clean temporary data store; capture, Case creation, record display, Oppa Mate link suggestion, exact human confirmation, provenance display and derived network refresh all worked, with no browser-console errors;
- real founder work-order calibration: not run;
- independent-user test: not run; and
- Brand Review queue: checked on 26 July 2026; no `revise` or `reject` item remained pending. The earlier typography revision has a recorded response and later internal approval. That does not approve this Operate proposal.

## Exact decision required

Jamie is asked to decide:

> Approve the proposed Operate record model, governed operational-graph principle and interface for bounded private internal pilot and release review, subject to the recorded validation gaps.

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

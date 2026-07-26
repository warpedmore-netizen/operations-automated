---
id: OA-ASSURANCE-OPERATE-ACTION-LOOP-001
title: Operate Governed Action Loop Assurance Pack
status: proposed
owner: Jamie Peppard
date: 2026-07-26
---

# Operate governed action loop assurance pack

## Decision in one sentence

- **Decision required:** decide whether the proposed action contract is suitable for bounded private founder use and may later merge into the proposed Operate branch.
- **AI recommendation:** suitable for a short private pilot on the evidence below; do not approve broader product release or treat the first transition vocabulary as settled.
- **Current authority:** preparation and draft review only.

## Trigger and founder intent

Jamie used My Work and found that the inbox showed options and statuses but did not appear to make anything progress. He clarified that every material decision, approval, review or follow-up still owed by him should enter the system as a work item with a working action, including decisions created while Operations Automated is being built.

The strongest reasonable meaning is not that every casual choice needs bureaucracy. It is that unresolved material judgement and meaningful work must not remain passive text.

## Current approved meaning

The approved methodology already requires:

- useful analysis and a governed next action as work develops;
- a product that leads the user to the current decision;
- explanation of what happens after approval or transition;
- retained evidence for material decisions; and
- proportionate activity history rather than a separate document for every routine choice.

No approved methodology wording changes in this proposal.

## Current product behaviour and proposed correction

| | Current draft | Proposed correction |
|---|---|---|
| My Work item | Status, priority and context | Visible working next action and expected outcome |
| Native Operate progression | Task completion only | Tested type-and-status actions for every open Operations Bible state |
| Specialist decisions | Some items route to source workflow | Source route becomes their explicit working action |
| Consequential authority | Server confirmation existed for two raw statuses | Action-specific confirmation and rationale for Approval, Risk, Change and Decision |
| Status update | Generic direct update possible | Direct status change rejected; governed action endpoint required |
| Evidence | General update activity | Actor, action, previous state, resulting state, outcome, note, authority and confirmation retained |
| Parent control | Case structure visible | Case closure blocked while contained work remains open |

## Evidence and interpretation

- **Recorded evidence:** live local review showed a ready Approval with no action except **Link related work**; a Task could be marked done; a repository release item could open the Decision Inbox.
- **Jamie's judgement:** this felt disconnected from the methodological basis and did not provide real progress.
- **AI inference:** a versioned action contract and one governed transition endpoint are the smallest coherent correction.
- **Assumption:** the first transition vocabulary is adequate for founder testing but will change with observed use.
- **Evidence gap:** no independent user, multi-user authority model or week-long real-work action history exists.

## Alternatives considered

1. **Add generic status dropdowns.** Fast, but it would hide meaning, permit invalid jumps and retain weak evidence.
2. **Build separate full workflows for all twelve types.** More specialised, but too large before real use calibrates the language and prerequisites.
3. **Keep specialist decisions outside My Work.** Preserves source workflows but fragments attention and violates Jamie's unified-work intent.
4. **Automatically execute every recommendation.** Reduces clicks but would confuse recommendation with authority and exceed the approved automation boundary.
5. **Do nothing until the complete product is designed.** Avoids rework but leaves the live founder experience knowingly inert.

The bounded action contract is recommended because it creates real progress while retaining existing specialist controls and keeping later refinement reversible.

## Challenge and boundary checks

- **Reverse:** formalising every micro-choice would create noise; routine reversible actions may remain in activity history.
- **Authority:** exact founder confirmation and a retained note are required for consequential actions; a rendered button is not authority.
- **Failure:** automated tests fail if any open Operations Bible state lacks an action.
- **Transfer:** source-backed items route to their controlled workflow instead of duplicating its decision logic.
- **Dependency:** Case closure checks contained work; the first increment does not infer parent completion or automatically close anything.
- **Recovery:** rejected or failed actions leave the current record state unchanged; completed actions remain in activity history.

## What could improve and what could become worse

### Expected improvement

- Jamie can act from the item that asks for his attention.
- the inbox becomes a progress system rather than a status register;
- authority and evidence become part of the action, not explanatory footnotes;
- transitions create data that the operational graph can later analyse; and
- AI and human work share a visible, correctable operating loop.

### Possible harm or friction

- first-pass action wording may feel mechanical;
- excessive rationale requirements could slow routine work;
- lifecycle rules may imply more certainty than the real operation supports;
- founder-only confirmations do not yet transfer to teams; and
- source and Operate records could duplicate decisions if future adapters are not governed.

The pilot therefore keeps notes optional for routine progress, required for decisions and exceptions, and preserves specialist source workflows.

## Technical verification completed

- JavaScript syntax checks passed for the action model, server and interface.
- The full Workbench suite passed: **72 tests passed; 0 failed**.
- Contract tests prove that every open Operations Bible state has an action and that invalid, stale and direct-status bypass attempts are rejected.
- Server tests prove Task completion, the complete Approval and Risk journeys, exact confirmation and rationale enforcement, creation-state protection and Case closure protection.
- Live desktop checks proved that a Task leaves My Work while its activity remains, an Approval cannot proceed without `Approve`, and a Decision cannot proceed without `Record decision`.
- Consequential confirmation is an inline field rather than a browser pop-up, so the required wording and boundary remain visible beside the action.
- Live Case review showed **Close case** disabled with the reason `1 contained record remains open`.
- A Brand Review inbox item routed to its existing controlled review surface without recording a decision.
- At a 390 x 844 viewport the action panel remained readable and the primary action measured 44 pixels high.
- A fresh desktop load showed working next actions and no browser-console warnings or errors.

Real founder-use evidence remains required during the bounded pilot: at least one genuine Task, Approval, Decision and non-terminal operational transition should be completed, rejected or deferred through My Work. The QA records above used isolated temporary data and were removed afterwards.

## Dependencies and unchanged boundaries

- approved v0.6 methodology, especially the output contract, connected-work method and Human-AI Collaboration Method;
- proposed Operate branch and local SQLite Workbench;
- existing Decision Inbox and Brand Review workflows;
- Jamie's retained authority over meaning, risk, release, spending and consequence; and
- later independent-user and real-work validation.

No new external connection, account, spending, hosted deployment, notification or customer data is introduced.

## Exact decision required

Jamie is asked to decide:

> Is the proposed governed action contract suitable for a bounded private pilot, subject to revision from real use?

A positive decision would not approve methodology changes, merge either branch, release the Workbench, accept a Risk, approve a specific operational Change, connect a system, authorise autonomous execution or approve customer use.

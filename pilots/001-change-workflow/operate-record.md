---
id: OA-PILOT-001
title: Plain-language Change Workflow Pilot
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-20
---

# Plain-language change workflow pilot

## Pilot question

Can OPERATE support an AI-led, human-controlled workflow in which Jamie leads through problems and outcomes while AI manages repository execution?

## Observe

The repository workflow successfully produced, reviewed and merged Foundation v0.2. It also prepared Foundation v0.3 with governance, templates and a roadmap.

However, completing technical steps did not consistently give Jamie a clear view of the programme. Jamie had to ask repeatedly what was happening, what the plan was, whether AI should build or ask questions, and whether any connections were required. The roadmap was created only after this lack of clarity was made explicit.

Observed friction included:

- Updates described repository events without always locating them in the wider outcome.
- The methodology foundation and the future product were not clearly distinguished.
- Approval, merge and governance status initially appeared to overlap.
- Jamie was offered tactical next steps without a stable view of the phases that followed.
- Technology and connections could have been discussed before the product need was validated.

## Prioritise

The [value matrix](value-matrix.md) makes clarity, accessible execution and human control mandatory outcomes. Traceability and avoiding premature product development are high priorities.

The first improvement priority is therefore not more methodology content or software. It is a reliable interaction and handoff model that lets Jamie understand and control the work without managing its mechanics.

## Examine

The main causes were:

- **No durable programme view:** Early repository versions contained principles and governance but no roadmap.
- **Activity-centred reporting:** Completion was often reported as files, commits and pull requests rather than movement towards a usable product.
- **Unclear handoff contract:** There was no standard statement of current position, next outcome, AI action and required human decision.
- **Unvalidated product assumptions:** “Live solution” had not yet been translated into a testable product hypothesis.
- **Tool-shaped choices:** Repository mechanics risked becoming part of Jamie's experience even though they should remain implementation detail.

## Redesign

Use the following milestone handoff for material work:

1. **Current position:** the approved baseline, active phase and material work in progress.
2. **Outcome delivered:** what is now possible or better, supported by evidence.
3. **Next outcome:** the next result being pursued, not merely the next repository action.
4. **AI execution:** what AI will do without requiring Jamie to operate tools.
5. **Human control point:** the single decision or input Jamie needs to provide now, with later decisions clearly deferred.

Maintain the roadmap in the repository and update it when an approved decision changes the plan. Ask for connections, spending or deployment decisions only when a defined product need justifies them.

## Automate

AI may manage:

- Repository inspection and consistency checks
- Branches, drafts, commits and pull requests
- Plain-language progress summaries
- Proposed status changes and approval records
- Authorised merges and branch cleanup
- Pilot artefacts and retained learning

Jamie retains control of:

- The problem and desired outcome
- Value priorities and constraints
- Acceptance, revision or rejection of authoritative meaning
- External publication
- Connections, data access, material spending and consequential automation

No new software automation or external connection is justified by this pilot alone.

## Test

| Scenario | Expected behaviour | Evidence | Result |
|---|---|---|---|
| A defined methodology change | AI prepares a controlled proposal and reports the decision required | Foundation v0.2 and v0.3 pull requests | Passed |
| Explicit approval and merge | AI records approval, promotes relevant statuses, merges the reviewed commit and cleans up | Foundation v0.3 approval workflow | Passed |
| Ambiguous completion language | AI verifies external state and reports it without inventing approval | Verification after “done” | Passed, but the wider next step remained unclear |
| User cannot see the project plan | AI owns the planning gap, creates durable project memory and reduces the immediate request to one decision | Foundation v0.3 roadmap revision | Passed after a revealed failure |
| External connection appears potentially useful | AI explains purpose, permissions, information, risk, cost and alternatives before requesting authority | Governance and roadmap rule | Not yet exercised |
| No available option satisfies value and constraints | Return to Examine or Redesign rather than forcing a choice | User-defined value principle | Not yet exercised |

## Evolve

### Retained lessons

- Repository progress is not the same as user-visible progress.
- A roadmap is necessary but insufficient unless each milestone explains the user's present control point.
- Progress communication is part of the working product, not administrative decoration.
- Product technology and connections should follow pilot evidence rather than lead it.

### Retained decisions

- Continue with a second method pilot before defining or building the minimum viable product.
- Use the five-part milestone handoff for subsequent material work.
- Keep the roadmap as controlled project memory.

### Proposed improvements

- Add a concise current-status record that is updated at each milestone.
- Add a reusable milestone-handoff template.
- Test the method on a second, materially different and non-confidential operational problem.
- Use both pilots to define Foundation v0.4 and the minimum viable product decision.

## Recommendation

The workflow is suitable for continued internal piloting. It successfully separates AI execution from human authority, but it needs a more consistent user-facing status and handoff mechanism before product development.

---
id: OA-PROPOSAL-2026-07-23-001
title: Delivery activation and first-use requirement
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-23
---

# Delivery activation and first-use requirement

## Proposed principle

A deliverable is not complete merely because it has been created, tested in isolation or accompanied by instructions. Completion requires evidence that the intended user can reach, activate and begin using it in the environment in which value is expected.

## Proposed methodology changes

Add the following requirement to the methodology output contract:

> **Activation and first use:** Where the retained output must be opened, run, installed, connected or operated, verify the complete user-side path to the first useful action. Instructions must use capabilities actually available in the target environment. If activation cannot be completed, retain the exact blocker, ownership and recovery action rather than presenting the deliverable as ready.

Add the following delivery behaviours:

- Leave a local executable deliverable running when that is safe, requested or necessary for immediate use.
- Verify the address, command, file or control the user will actually use.
- Test handover instructions in the target environment, including required runtimes, permissions, paths and credentials.
- Prefer a direct working entry point over asking the user to reconstruct setup.
- When instructions fail, diagnose the environmental assumption before repeating them.
- Separate construction tests from user-journey evidence; both may be required.
- Record activation failure as methodology feedback and retained learning.

## Strongest credible alternative

Keep activation outside the methodology and treat it as implementation support. This keeps the core method smaller, but risks declaring outputs complete before they create user value and repeatedly externalises integration work to users.

## Risks and trade-offs

- Target-environment verification can add delivery time.
- Some environments cannot be accessed or safely changed by the delivery team.
- Leaving services running may be inappropriate where cost, security or persistence boundaries apply.
- The requirement must therefore be proportionate: verify directly where authorised, otherwise disclose the unverified boundary and provide a tested recovery route.

## Required human decision

Jamie Peppard must approve, amend, defer or reject incorporation into the next controlled methodology version. This proposal does not alter the approved baseline by itself.

## Recommended validation

Apply the proposed requirement to:

1. the next local application or automation deliverable; and
2. a non-executable artefact whose value depends on an import, publication or workflow step.

Record whether the user reached the first useful action without unplanned troubleshooting.

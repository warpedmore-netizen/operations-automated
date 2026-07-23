---
id: OA-METHOD-010
title: Activation and First Use
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-23
approval_required: true
---

# Activation and first use

## Purpose and status

This proposed module closes the gap between producing a deliverable and the user receiving value from it. It remains proposed pending validation and Jamie Peppard's explicit decision.

A deliverable is not complete merely because it has been built, tested in isolation or accompanied by instructions. Completion requires proportionate evidence that the intended user can reach it, activate it and complete the first useful action in the environment where value is expected.

## Completion test

Where an output must be opened, run, installed, imported, connected or operated, verify:

1. **Reach:** the user can access the correct file, address, control or service.
2. **Activate:** the required runtime, permissions, path, credentials and dependencies are available.
3. **Understand:** the user can identify what the output is for and how to begin.
4. **Act:** the user can complete the first useful action.
5. **Observe:** accepted, active, completed and failed states are visible where work takes time.
6. **Recover:** a failed step provides a clear blocker, owner and next recovery action.
7. **Retain:** the result, decision or evidence is available for later use where required.

The depth of evidence should reflect value, consequence, reversibility and the user's environment.

## Delivery behaviour

The delivery should:

- prefer a direct working entry point over asking the user to reconstruct setup;
- test the actual handover route in the target environment or a faithfully equivalent one;
- use commands and capabilities that are genuinely available to the intended user;
- move accepted input into visible retained history rather than leaving its status ambiguous;
- show continuing progress for long-running actions;
- provide an in-product or adjacent first-use guide where labels and controls are not safely self-explanatory;
- leave a local executable output running when that is safe, authorised and necessary for immediate use; and
- separate construction tests from evidence that the user journey works.

Instructions are not proof of usability until the intended route has been tested.

## When direct verification is unavailable

Do not claim that the deliverable is ready. State:

- the part of the activation path that was not verified;
- why it could not be verified;
- the exact capability, permission or decision required;
- who owns the next action;
- a tested recovery or alternative route where possible; and
- what evidence will demonstrate successful first use.

## Failure and learning

Treat activation failure, unclear progress, unusable instructions and first-use confusion as operational feedback. Preserve useful work, diagnose the environmental or design assumption and update the relevant delivery, product or methodology proposal.

Do not repeat the same instruction without first testing why it failed.

## Boundaries

Activation does not authorise:

- installing software or changing a user's environment without permission;
- leaving services running where security, cost or persistence makes that inappropriate;
- storing credentials or confidential information in the repository;
- connecting an external system without its own purpose, information, permission, security and recovery decision; or
- describing a technically reachable output as operationally approved.

## Validation

Apply this proposed module to:

1. the next executable local deliverable; and
2. one non-executable artefact whose value depends on import, publication or a workflow step.

Record time to first useful action, unplanned troubleshooting, points of confusion, failed assumptions and whether the user could recover without developer knowledge.

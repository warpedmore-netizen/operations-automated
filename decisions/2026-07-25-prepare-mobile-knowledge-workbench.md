---
id: OA-DECISION-2026-07-25-006
title: Prepare the Mobile Knowledge Workbench
status: recorded
decision: approved-for-preparation
decision_maker: Jamie Peppard
date: 2026-07-25
release_status: awaiting-review
connection_status: not-approved
---

# Prepare the mobile knowledge workbench

## Decision

Jamie Peppard clarified that the Workbench should primarily govern Operations Automated knowledge: challenge, defence, feedback, proposal review, methodology decision and readable publication. Codex remains the product-development environment.

Jamie's direction to proceed authorises controlled preparation and correction of the current local usability failure.

## Authority granted

- retain and classify the feedback;
- inspect the live desktop and phone-sized experiences;
- repair broken brand fallbacks, contrast and responsive navigation;
- make the knowledge-development journey clearer;
- prepare a private phone-access proposal;
- prepare a readable Confluence Review Draft proposal;
- create a separate branch, tests, changelog entry and draft pull request.

## Authority not granted

- install or sign in to Tailscale;
- change network, identity, security or device permissions;
- expose the Workbench beyond localhost;
- use Tailscale Funnel, a public tunnel or router port-forward;
- broaden or bypass the bounded AI-managed Draft authority already recorded in PR #18;
- change approved methodology meaning;
- merge the product proposal;
- publish externally;
- spend money; or
- delegate Jamie's preparation, release or publication authority.

## Separate decisions still required

1. Jamie-only private phone connection.
2. Integration and release of the existing PR #18 Confluence Draft capability.
3. Product release and merge after review.
4. Each live Confluence publication under the existing plan-specific confirmation.

Continued discussion, use of the local fixes or a successful test does not make any of those decisions.

## Later operational evidence

Jamie installed Tailscale on the Windows computer and Samsung phone and enabled a tailnet-only Serve route. Read-only inspection confirmed both devices online, the Workbench proxy restricted to the tailnet and Funnel disabled. The phone reached the Workbench, but its first recording failed during transcription and triggered decision `OA-DECISION-2026-07-25-007`.

This evidence updates the technical readiness assessment. It does not change `connection_status: not-approved`, authorise broader access or approve release.

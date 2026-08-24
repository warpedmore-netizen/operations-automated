---
id: OA-FEEDBACK-2026-08-24-001
title: Historical learning clusters must not reopen completed decisions
status: recorded
date: 2026-08-24
source: Facilitated Operations Automated assurance case and copied Workbench operational state
confidentiality: non-confidential project evidence
affected_product: AI Workbench
disposition: product-change-candidate
---

# Historical learning clusters must not reopen completed decisions

## Recorded evidence

The first facilitated AI-agent assurance case applied the proposed assurance method to the Operations Automated methodology-development loop. A read-only inspection of a copied Workbench database showed:

- the Methodology-learning summary correctly reported that every retained signal had an explained disposition or completed route;
- the only related cluster contained 11 retained signals;
- the cluster included one earlier Methodology-change candidate whose signal and linked proposal were already implemented;
- all other signals had context, answer-only or no-change routes; and
- the cluster review nevertheless displayed **Methodology change proposed** and asked Jamie to prepare, revise, defer or reject another bounded proposal.

The copied state also exposed a **Retain this synthesis** action even though no signal in the cluster had an unresolved route.

## Jamie's judgement

Jamie instructed the AI to continue building the next authorised steps without pausing for routine implementation. No new judgement on Methodology meaning, merge or release was inferred.

## AI interpretation

The summary and cluster views were applying different completion rules. The summary excluded terminal signals and proposals, while the cluster review reconsidered every historical signal and selected the strongest earlier change disposition regardless of its completed status.

This is a product-state defect, not evidence that the approved Methodology is missing a new rule. Historical evidence should remain inspectable, but a completed route must not create a fresh decision obligation unless material new evidence or a named review trigger reopens it.

## Boundary and counter-tests

- **Hide historical clusters:** rejected because it would erase useful provenance and make earlier learning harder to audit.
- **Treat every cluster as active:** rejected because repetition and historical grouping are not evidence of a current unresolved decision.
- **Use the latest signal only:** rejected because it could hide a genuinely unresolved earlier signal.
- **Product correction selected:** determine active status per signal using its signal and proposal state, review only active signals, and render an all-terminal cluster as historical context with no synthesis action or new decision.

The change does not approve Methodology meaning, alter retained source records, delete evidence, merge a branch or release the Workbench.

## Disposition

Prepare the smallest Workbench correction on the existing daily-challenge variety branch because that proposal already changes challenge learning retention and review behaviour. Retain the case evidence, add focused terminal-state tests and validate against a copied operational database before founder review.

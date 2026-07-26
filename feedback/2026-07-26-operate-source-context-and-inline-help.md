---
id: OA-FEEDBACK-2026-07-26-OPERATE-SOURCE-CONTEXT
title: Operate source context and inline Oppa Mate help
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-26
source: founder product use
---

# Operate source context and inline Oppa Mate help

## Jamie's observations

1. The first work item told Jamie to look at PR #22 but did not provide a link or a useful summary, so he had to leave the system and find the pull request manually.
2. **Get help from Oppa Mate** opened another conversation without visibly carrying the originating work, why help was requested or where Jamie came from.

## Operational insight

A work item is not actionable merely because it names an external source or can technically attach an internal record ID to another screen. My Work must carry enough source, decision and authority context for Jamie to understand and act without reconstructing the task himself. Help must start from the work item and preserve that origin visibly.

## Methodology comparison

The approved output, activation and Human-AI Collaboration guidance already requires a usable next action, visible context and continuity. The failure was in product delivery and validation, not a missing methodology rule.

Disposition: **no methodology change; correct the proposed Workbench product now and accumulate real-use evidence.**

## Strongest bounded rule

When a work item depends on a pull request or other source, the item should carry a safe direct link, a plain-English account of why it exists and what changes, the exact decision or review required, and the remaining authority boundary. Asking Oppa Mate should happen inside the item. If Jamie opens the full conversation, the originating work and a route back must remain visible.

## Product response prepared

- safely infer the Operations Automated GitHub pull-request link from `PR #n`, `pull request #n` or a retained valid GitHub pull-request URL;
- project retained proposal, decision, evidence, alternative, risk and authority fields into one source work package;
- show a direct PR link on the My Work card and in the detail view;
- replace the contextless navigation action with inline Oppa Mate help and one-click starter questions;
- retain the active record, source package and authority boundary in both provider and local-response context;
- show **Conversation opened from this work item** with the source link and **Back to work item** in the full conversation; and
- keep opening, discussing or summarising a source separate from approval, merge, release or publication.

## Evidence and checks

- GitHub PR #22 metadata was inspected: draft, open, titled **Build the Operate internal workbench**, 18 changed files, and a decision request covering the graph thesis, record/link meanings, derived signals, correction path and authority boundary.
- Automated API coverage verifies that a PR #22 work item returns its safe link and retained review summary in My Work.
- The complete automated Workbench suite passes.
- An isolated browser journey showed the PR link on the inbox item and detail, opened inline help without leaving My Work, returned a work-specific decision answer, carried the source into the full conversation and returned to the same work item.

## Boundaries and review trigger

This response does not approve PR #22, PR #24, the Workbench product, methodology meaning, merge, release, publication, a new connection or wider delegated authority. Review again after Jamie uses the source package and inline help on real work; record any missing context, weak summary, misleading inference or unnecessary navigation.

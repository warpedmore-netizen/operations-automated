---
id: OA-FEEDBACK-2026-07-25-008
title: Carry Workbench brand feedback through revision and re-review
status: proposed
owner: Jamie Peppard
date: 2026-07-25
---

# Brand review feedback loop

## Source and boundary

- **Source:** Jamie Peppard's item-level Brand Review decision in the local Operations Automated Workbench, followed by a direct request for Codex to pick up and routinely review future suggestions.
- **Recorded founder wording:** `"Clear.....language." is hard to read slightly amend.`
- **Affected review item:** Typography (`typography`).
- **Permission:** Jamie explicitly asked for the specific visual revision and for Workbench brand feedback to become part of the continuing feedback loop.
- **Confidentiality boundary:** Non-confidential Operations Automated project and brand feedback.
- **Approval boundary:** The `revise` decision is feedback evidence. It does not approve the brand, merge a pull request or authorise publication.

## Interpretation and evidence

- **Recorded evidence:** The latest local decision for the typography item is `revise`. The supporting sentence was rendered at `0.72rem` in muted blue-grey on a dark field.
- **Jamie's judgement:** The supporting line is difficult to read and should be amended.
- **AI interpretation:** The problem is legibility and hierarchy, not the wording or the overall typography direction. The smallest coherent response is to increase size, weight and contrast and give the sentence clearer visual separation.
- **Assumption:** The wording remains unchanged because Jamie identified readability rather than meaning as the fault.

## Response and disposition

**Disposition: product clarification; revise now and return for founder re-review.**

The typography preview is amended so the supporting sentence is larger, brighter and carried in a lightly lifted panel with a cyan rule. The sentence is split into two intentional lines to improve scanning without changing its meaning. Live visual inspection also found that the display word could clip at the Workbench card width, so its responsive scale is bounded without changing the type direction.

The Workbench feedback loop is extended so that:

1. each latest `revise` or `reject` decision automatically appears in a visible pending-feedback queue;
2. Codex can retain a separate response against the exact founder decision;
3. a prepared revision is shown as requiring founder re-review; and
4. feedback, response, repository activity and approval remain separate facts.

Repository instructions now require Codex to inspect the local Brand Review queue before material brand work when the Workbench is available. If it is unavailable, Codex must not claim that no feedback is pending.

## Counter-test and remaining uncertainty

- **Overcorrection test:** Making the supporting line as prominent as `AUTOMATED` would weaken the intended hierarchy. The revision therefore improves legibility while retaining a clear display/body distinction.
- **Transfer test:** The queue is useful for future logo, colour, template and wording revisions because it is derived from the controlled review items rather than hard-coded to typography.
- **Remaining uncertainty:** Jamie still needs to visually confirm that the revised size, contrast and line break feel right. No item-level approval or overall brand approval is inferred.

## Affected content

- `app/app.js`
- `app/styles.css`
- `app/index.html`
- `app/server.mjs`
- `app/tests/server.test.mjs`
- `app/tests/interface.test.js`
- `app/README.md`
- `brand/README.md`
- `AGENTS.md`

## Review trigger

Jamie re-opens **Brand review**, checks the Typography item and either approves it for internal validation, requests a further revision or rejects the direction. Future Brand Review revision and rejection decisions should be visibly traceable through the same loop.

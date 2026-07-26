---
id: OA-PRODUCT-007
title: Methodology Lab and End-to-End Reader
status: proposed
version: 0.2
owner: Jamie Peppard
date: 2026-07-25
last_updated: 2026-07-26
---

# Methodology Lab and end-to-end reader

## Purpose

The Methodology Lab lets Operations Automated use its own Workbench to create and evaluate a human-first methodology reading path. It is a private dogfooding environment, not a replacement for the authoritative repository or the controlled Confluence lifecycle mirror.

The first pilot proved bounded Draft publication. The second revision uses the same managed page identities to test whether a substantially fuller end-to-end methodology can be read, applied, reviewed and revised without losing status, source or conflict control.

## Location and authority

The reader uses a separate managed tree beneath the existing **Draft** page in the private Methodology space.

Git remains authoritative. AI may publish committed proposed content beneath the controlled Draft parent without another approval touchpoint. It may not approve methodology meaning, promote pages to Live, delete pages, infer approval, schedule publication or authorise external use.

## Publication history

### Pilot 1 — delivery mechanism

On 2026-07-25 the Workbench published an isolated ten-page, 3,946-word reading set. It created ten pages beneath Draft, altered none of the separate 108-page lifecycle mirror, deleted nothing and immediately reconciled every Lab page as unchanged.

This proved:

- controlled source mapping;
- stable managed identities;
- private Draft-only targeting;
- page-version receipts and conflict protection;
- no-deletion behaviour; and
- an explicit review route.

It did not prove methodology depth or reader value.

### Consolidated v0.8 — coherent outline

On 2026-07-26 the managed ten-page tree was updated to a consolidated proposed v0.8 Draft. Reusing its stable page keys preserved version-aware updates instead of creating another disconnected methodology area.

Founder review then identified that the pages were too light to act as the intended methodology. Eight of ten pages contained fewer than 400 words. The result functioned as a reading outline rather than an end-to-end working method.

### Depth revision — end-to-end reader

The current proposal expands the same managed tree to 20 chapters and approximately 14,050 reader words. The original ten keys remain stable and ten new managed keys add the missing operating depth. No existing managed page is deleted.

The reader covers:

1. start and authority;
2. complete method map;
3. purpose, value, principles and accountability;
4. business context, strategy and outcomes;
5. journeys, demand and the operational value system;
6. connected operating model and capability coverage;
7. people, organisation, capability and culture;
8. work, process, flow and capacity;
9. governance, authority, risk, control and resilience;
10. information, data, knowledge and measurement;
11. technology, assets, architecture and suppliers;
12. cross-functional interfaces;
13. readiness and deliberate work-design choices;
14. the full OPERATE cycle;
15. target design, prioritisation, business case and roadmap;
16. implementation, change, release, activation and capability transfer;
17. run, govern, measure and improve;
18. Human–AI collaboration;
19. proportionate routes, toolkit and output contract; and
20. review and decision.

The concise start and method map provide orientation. Substantive chapters carry practical questions, activities, outputs, gates, boundaries and tailoring. This is progressive disclosure, not a requirement to read every chapter for every question.

## Source and status controls

Every reader page:

- remains `proposed`;
- identifies itself as a proposed Draft reading synthesis;
- maps only to approved, published or recorded repository sources;
- includes source status, version, hash and commit in the generated Confluence body;
- states that Git remains authoritative; and
- preserves specialist and approval boundaries.

The Workbench refuses to build the plan when:

- a page has no controlled source;
- a source is not approved, published or recorded;
- a page is not proposed;
- a key, title or parent is missing or duplicated;
- a source path escapes the repository; or
- the hierarchy contains a cycle.

## Governed workflow

1. Retain substantive feedback with evidence, interpretation, counter-tests and disposition.
2. Draft the change on a separate branch and update the assurance pack.
3. Commit the complete proposed source in Git.
4. Build and inspect the private Draft-only plan.
5. Confirm that all pages remain proposed, use controlled sources and target the managed Methodology Draft parent.
6. Stop if a managed identity, title, page version or Draft-parent conflict exists.
7. Publish the conflict-free plan under the standing AI Draft-publication authority.
8. Record source branch, commit, actor, returned page identifiers and versions.
9. Compare again and require all 20 pages to be unchanged.
10. Review the reader and route feedback through the methodology evolution system.

Preview and publication use current repository and Confluence state. A stale preview cannot authorise later action. Publishing to Draft does not approve v0.8.

An interrupted run may leave Confluence with an accepted page before the local receipt is stored. A later preview may reconcile that receipt without rewriting the page only after one version increment and when the remote title, source commit retained from the failed run, combined source hash and normalised visible content match the current committed Draft. Any other version difference remains a conflict for governed human resolution.

## Review signals

| Signal | Example | Likely route |
|---|---|---|
| Methodology meaning | A principle, sequence, boundary or required decision is wrong | Governed methodology change |
| Application depth | A reader still has to invent an activity, output or decision gate | Chapter or tool expansion |
| Explanation | Meaning is sound but difficult to understand | Reader-layer revision |
| Reading structure | Navigation or mobile use makes depth inaccessible | Publication-model revision |
| Specialist boundary | The method overclaims authority or omits a material interface | Specialist review and boundary correction |
| Product behaviour | Preview, publication, link or conflict handling fails | Workbench product change |
| Evidence gap | A claim needs a real case or independent reader | Accumulate evidence or run another pilot |
| No change | The point is already adequately covered | Retain reasoning and close |

AI should reconstruct Jamie's strongest reasonable meaning, apply proportionate counter-tests and recommend a disposition. Feedback does not automatically change the methodology or reader.

## Success measures

The depth revision succeeds as a publication and review mechanism when:

- Jamie can find the starting point in under 30 seconds;
- the complete method can be explained without Git knowledge;
- a reader can choose a proportionate route;
- substantive chapters enable practical outputs rather than only explaining labels;
- approved source meaning and proposed synthesis remain distinguishable;
- the Workbench creates ten new pages and updates the ten managed pages only;
- the separate lifecycle mirror remains unchanged;
- every page returns a tracked identifier and version;
- the immediate comparison reports 20 unchanged pages and no conflict; and
- review produces an explicit disposition.

Methodology validity requires additional evidence: independent use, different business contexts, specialist review and sustained operational outcomes after delivery.

## Retained boundaries

- Git remains authoritative.
- The reader remains private and proposed.
- No page is deleted, archived, moved or silently overwritten.
- AI publication remains limited to committed proposed content beneath the controlled Draft parent.
- A successful technical publication does not approve the synthesis.
- Founder review does not by itself establish external validity.
- Live promotion, external publication, customer use, scheduled publication and automatic interaction retrieval remain unapproved.

## End-to-end Draft publication evidence

On 2026-07-26 the 20-chapter reader was published from commit `d60d014d91c4b8d1ede19dd96047ac305e174ae8` under the standing AI-managed Draft authority.

The first attempt updated the reading root and then stopped after Confluence accepted **The Complete Method Map** but before its local receipt was stored. Two Workbench processes had been using the same local SQLite store. The older verified server was replaced, the exact-match recovery control was implemented and tested, and the clean committed Workbench produced a new conflict-free plan.

Publication run `6f6c27f1-7a09-4899-8365-37adc7ab6cb3`:

- created ten new managed Draft pages;
- updated eight existing managed Draft pages;
- reconciled the one exact interrupted receipt without rewriting the Confluence page;
- retained one already unchanged page;
- deleted no page; and
- returned identifiers and versions for all 20 pages.

The immediate second comparison returned all 20 pages unchanged and no conflict. The stable [end-to-end Draft reading root](https://operations-automated.atlassian.net/wiki/spaces/OAM/pages/754271/Operations+Automated+Methodology+End-to-End+Draft+v0.8) remains beneath the private Methodology Draft parent.

This receipt proves the controlled delivery and recovery path for this publication. It does not approve v0.8 meaning, establish external validity or promote any page to Live.

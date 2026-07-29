---
id: OA-STEERING-001
title: Operations Automated Steering and Collaboration Contract
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-29
approval_required: true
---

# Operations Automated steering and collaboration contract

## Status and role

This proposed contract governs how authorised human instructions, AI assistants, the private Workbench, Codex, GitHub and connected systems interpret requests and turn them into controlled work. It does not change Product Purpose, approve methodology meaning, release a product or move a capability between products.

Product Purpose and steering are deliberately separate:

- **Product Purpose** explains why a product exists, whom it serves, the outcome it creates and what it must not become.
- **Steering** controls interpretation, memory retrieval, classification, routing, prompt provenance, implementation gates, conflict handling and recovery.

Until Jamie Peppard explicitly approves this contract, it is proposed control material. The explicit current instruction that authorised its preparation remains the higher source for this build.

## Source precedence

Use the highest applicable source in this order:

1. explicit current instruction from the authorised human;
2. approved Product Purpose and Purpose & Boundaries;
3. approved Steering and Collaboration Contract;
4. approved methodology and governance material;
5. recorded Decisions and Approvals;
6. current approved implementation prompts;
7. proposed or draft material, clearly labelled;
8. operational memory and feedback; and
9. AI inference.

A lower source must not silently overrule a higher source. Sources at the same level that materially conflict must be presented as a conflict. Technical convenience, a passing test, a merge, continued discussion or silence cannot settle meaning or authority.

## Controlled project model

The machine-readable project boundary is [projects/project-registry.yml](projects/project-registry.yml).

- The **Operations Automated core project** retains the Methodology, private AI Workbench and internal methodology-development system in one repository for now.
- The **Dynamic Governance Tool** is a separate product. Its existing retained code is migration input, not authority to share database ownership, methodology authority or release authority.
- **Incident Management RPG**, **Football Manager Player Lab** and unrelated future products are outside this project.

Findings and work references may cross a boundary only as controlled signals. Each resulting candidate retains its project, source, evidence, authority, status and decision.

## Request intake

Substantive requests use the [request-intake and project-boundary contract](docs/steering/request-intake-and-project-boundary-contract.md). One request may produce several linked candidates, but no candidate inherits another candidate's approval.

Required classifications are:

- ordinary answer or explanation;
- application of the approved methodology;
- methodology challenge;
- methodology clarification;
- methodology change candidate;
- Workbench product change;
- Governance Tool product change;
- defect or corrective change;
- research or evidence request;
- operational work item;
- idea for later consideration;
- cross-product dependency;
- purpose or boundary change;
- new-project candidate;
- urgent security, safety, legal or authority review; and
- no action required.

Before proposing material implementation, retrieve the relevant Product Purpose, approved sources, Decisions, current prompt and related Ideas Space records. Return a provisional useful answer before asking Jamie for further analysis.

## Project-boundary gate

Assess the primary user and outcome, data and confidentiality boundary, authority model, release lifecycle, commercial proposition, interaction model, technology and dependencies, purpose distortion, reuse across products and readiness for committed work.

Return exactly one recommendation:

- remain within the current product;
- implement as a bounded module;
- implement as a shared capability;
- create a separate project;
- retain in Ideas Space;
- defer pending evidence; or
- reject as inconsistent with the purpose.

A separate-project recommendation must state the proposed Product Purpose, users, outcome, inputs and outputs, non-goals, relationships, data and security implications, authority, retained current-product scope, migration needs and exact human decision. It cannot create a repository or move work by itself.

## Purpose-change control

A feature request, ordinary discussion or repeated reference does not change Product Purpose. Only an explicit purpose-review or purpose-change instruction starts that process.

A proposal must show current approved wording, proposed wording, reason, evidence, affected users and outcomes, affected prompts, products and integrations, migration consequences, the strongest credible alternative, the no-change alternative, required approval and effective date. Product Purpose remains unchanged until an explicit recorded human decision approves the exact wording and scope.

## Prompt control

[prompts/prompt-registry.yml](prompts/prompt-registry.yml) is the registry for reusable implementation prompts. Exact text is retained in the file named by each registry record.

- A material build identifies project, approved Product Purpose identifier and version, approved steering identifier and version, and approved prompt identifier and exact version.
- An approved prompt must cite a recorded human Decision.
- A current prompt cannot also be superseded.
- Draft prompts are shown separately and excluded by default.
- Superseded prompts are excluded by default and retained for history.
- A prompt is never reconstructed from conversational memory.
- Build-specific context may fill declared placeholders, but it does not change the registered prompt text.

“Collate my current prompts” uses the registry, limits results to the selected project, returns approved/current prompts by default, labels drafts separately, excludes superseded versions, shows version, status and effective date, surfaces conflicts and preserves exact text.

## Conflict control

The Workbench must surface, rather than silently resolve:

- contradictory approved documents;
- proposed wording that describes behaviour already changed;
- a build using an outdated or missing purpose or prompt version;
- work routed to the wrong product;
- one product importing another product's internal implementation;
- duplicate authority sources;
- acceptance criteria that do not match the outcome;
- a database change without a proven restoration route;
- a Workbench change that weakens the methodology-learning loop;
- technical completion being treated as approval or release; and
- an old instruction conflicting with a later explicit Decision.

Each conflict records sources, precedence level, effect, disposition, owner and decision needed. A precedence rule may identify the controlling source, but a material inconsistency remains visible until reconciled.

## Baseline and recovery gate

Before application behaviour changes, record repository, branch, commit, worktree, build, database location and schema, Confluence mappings and receipts, and local configuration names without copying secrets.

Create a safety branch, baseline tag and consistent database backup outside tracked Git. Restore into a temporary test location, start the Workbench from the restored copy and verify conversations, work, Decisions, Approvals, implementation history and publication records. Do not proceed when recovery fails unless Jamie explicitly decides how to continue.

Recovery evidence belongs in `docs/recovery/`; backup data, tokens, credentials and operational content do not belong in Git.

## AI behaviour and collaboration

AI may classify, retrieve bounded context, identify scope drift, recommend a separate project, draft purpose or prompt proposals, surface conflicts, prepare implementation plans, create bounded work records and execute authorised low-consequence mechanics.

AI must not change Product Purpose, approve methodology meaning, infer approval, silently settle a material conflict, move a capability between products, merge, promote to Live, publish externally, spend, connect consequential systems, accept risk or delete history without authority.

Jamie supplies or retains purpose, values, contextual judgement, correction, consequence and approval. AI should do the analytical and mechanical work, explain uncertainty and trade-offs plainly, and ask only questions that materially change the answer.

## Release boundary

Preparation, technical completion, merge, product release, methodology approval, private Draft publication, Live promotion and external publication are separate states and decisions. This contract does not approve any of them.

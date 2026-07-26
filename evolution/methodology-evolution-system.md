---
id: OA-EVOLUTION-001
title: Methodology Evolution System
status: approved
version: 0.2
owner: Jamie Peppard
date: 2026-07-20
approval_date: 2026-07-20
approval_scope: internal validation
---

# Methodology evolution system

The methodology evolution system enables Operations Automated to learn continuously while remaining human-controlled.

Its purpose is to turn questions, feedback, operational outcomes, failures, research and contradictions into traceable proposals, decisions and releases. It is self-improving in its evidence flow, not self-authorising in its meaning or authority.

## Sources of learning

The system may receive signals from:

- Direct user or practitioner feedback
- Questions and requests for clarification
- Confusing, abandoned or repeatedly revisited journeys
- Completed operational assessments and improvement cycles
- Unexpected outcomes, failed tests and incidents
- Audits, assurance reviews and control failures
- Support and enablement conversations
- Research and changes in technology or accepted practice
- Changes in legal, regulatory, safety, security or ethical expectations
- Contradictions, duplication or gaps found inside the methodology

The source, permission to use it and any sensitivity boundary must be retained. Confidential employer, client or third-party information must not be copied into this repository.

## Evolution loop

| Step | AI or automation may | Human control |
|---|---|---|
| Capture | Record the signal, source, scope and evidence boundary | A person may correct or withdraw their feedback where applicable |
| Triage | Classify, deduplicate, cluster and identify possible urgency or impact | Consequential priority criteria remain governed |
| Examine | Compare signals with approved content, outcomes and known assumptions | Domain judgement and disputed meaning are surfaced, not invented |
| Propose | Draft changes, alternatives, impacts, migration needs and a recommendation | Material meaning remains proposed |
| Check | Test links, structure, terminology, duplication, contradictions, security and governance state | A passing check does not constitute approval |
| Decide | Present a concise decision packet and notify the authorised human | Jamie approves, requests revision or rejects during the founder-controlled phase |
| Release | Version and merge an explicitly approved change; prepare release notes | External publication and communications require separate approval |
| Observe | Monitor use, outcomes and new feedback against the intended value | The authorised human may stop, revert or redirect the change |

The loop applies OPERATE to Operations Automated itself: observe the evidence, prioritise useful change, examine the cause, redesign the method, automate safe mechanics, test the result and retain learning.

## Initial MVP: Jamie, Codex and GitHub

The first working version requires no additional product or connection:

1. Jamie describes a problem, idea, correction or desired outcome in ordinary language.
2. AI records the intent and distinguishes direction from inferred detail.
3. AI inspects the controlled repository and identifies affected material.
4. AI drafts a proposed change on a separate branch.
5. AI runs proportionate consistency and technical checks.
6. AI opens a draft pull request containing the evidence, changes, questions and recommendation.
7. Jamie approves, requests revision or rejects without needing to edit files.
8. AI merges only after explicit authorisation and records the release.

This is the current methodology-evolution MVP. It should be used while the methodology is being developed so that the project learns about its own update process in practice.

## Founder challenge and feedback

The proposed [founder challenge and feedback loop](founder-challenge-loop.md) adds two regular entry routes:

- Jamie asks an operational question and critiques the answer produced by the approved methodology.
- A read-only daily automation researches one current scenario, provides a provisional methodology response and asks Jamie for a short judgement.

Both routes use the same capture, triage, proposal, assurance, approval and outcome-review controls. A response is feedback rather than approval, and not every response should create a methodology change.

## Feedback record

Every material signal should retain, proportionately:

- Source and date
- Permission and confidentiality boundary
- User, role or operating context without unnecessary personal data
- The reported question, friction, outcome or failure
- Evidence supplied and limitations
- Affected methodology component or unknown scope
- Frequency, consequence and urgency where known
- Related or duplicate signals
- Triage decision, owner and next review
- Resulting proposal, decision, release or reason for no change

Use the [methodology feedback template](../templates/methodology-feedback.md) until an approved system of record replaces it.

## Decision packet

Jamie should receive a short notification or review containing:

- What users or evidence are indicating
- Why it matters and who may be affected
- The proposed change and strongest credible alternative
- What would improve and what could become worse
- Confidence, uncertainty and evidence still missing
- Files, modules, products and users affected
- Automated checks completed
- The precise decision or direction required

The notification channel may later be mobile, email, Teams or an in-product approval inbox. No external connection is authorised by the v0.4 internal-validation decision.

## Future controlled capabilities

After the manual loop proves useful, the system may add separately approved components:

- Feedback forms and in-product feedback capture
- Consent-aware product usage and outcome signals
- Connectors for approved communication and support channels
- A structured feedback and evidence store
- Automatic clustering, duplication detection and trend alerts
- Methodology dependency and consistency checks
- An approval inbox with mobile notifications
- Versioned releases distributed to delivery products
- Monitoring that compares intended and observed outcomes

Each connection requires an explicit decision covering purpose, information exchanged, permissions, retention, security, cost, failure and removal.

## Controls

- Approved versions remain traceable and recoverable.
- No source may silently change authoritative content.
- Feedback volume alone does not determine truth or priority.
- AI-generated proposals must identify their evidence and assumptions.
- AI may publish committed proposed material beneath a controlled private Confluence Draft parent for human review. This is not approval, release or promotion to Live.
- A release must record its approver, scope, date and conditions.
- Rejection and no-change decisions are retained to prevent repeated reconsideration without new evidence.
- Urgent safety, security or legal signals may be escalated immediately but still require authorised action.
- External publication is separate from internal approval.

## Success measures

- Jamie can understand and decide a proposal without developer tooling.
- Material feedback is traceable to a decision or recorded disposition.
- Similar signals are connected rather than repeatedly treated as new.
- Approved changes reach the controlled method and its delivery surfaces consistently.
- Failed or confusing changes can be identified and corrected.
- Automation reduces administration without weakening human authority.

## Decisions not made by v0.4 approval

The v0.4 internal-validation decision does not approve:

- An external feedback or notification connection
- Collection of identifiable product analytics
- Automatic merging, scheduled publication or AI promotion to Live
- Delegation of Jamie's founder authority
- A particular database, AI provider, hosting platform or commercial product

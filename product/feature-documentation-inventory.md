---
id: OA-PRODUCT-012
title: Feature Documentation Inventory
status: draft
version: 0.1
owner: Jamie Peppard
date: 2026-07-26
approval_required: true
---

# Feature documentation inventory

## Purpose and boundary

This inventory maps the meaningful product and service feature families currently represented in the repository. It is a documentation-control aid, not approval to draft missing material, change a feature, connect a service, publish anything or treat implemented code as approved product meaning.

The inventory uses the `status` on the controlling artefact as authoritative. **Implemented** describes observable code or retained artefacts only; it does not promote a `draft` or `proposed` feature to `approved`. A feature is grouped at the level at which one outcome, audience and approval gate can be reviewed coherently. Individual buttons, fields and technical helpers inherit the row for their feature family.

## Documentation types

- **Definition**: outcome, audience, boundaries and authoritative product meaning.
- **User**: ordinary-language use, decisions, recovery and limitations.
- **Functional**: states, rules, data and interaction behaviour.
- **Technical**: architecture, interfaces, configuration, security and operations.
- **Evidence**: tests, pilot observations, receipts and acceptance findings.

## Coverage register

| Ref | Feature family | Primary source and audience | Current state | Existing documentation | Material gap before further drafting | Required approval gate |
|---|---|---|---|---|---|---|
| F01 | Private OPERATE workspace MVP | `product/MVP.md`; first user Jamie, later operational problem solvers | **Approved** definition; implemented legacy browser workspace | Definition, governance boundary, tests and changelog | Current-versus-legacy migration note and retained-use evidence | Jamie approves any change to the approved MVP meaning or audience |
| F02 | Delivery and governed implementation system | `product/delivery-system.md`; Jamie and AI collaborators | **Approved** operating model; implemented through repository controls | Definition, governance, roadmap, decision and PR conventions | One concise operator runbook connecting proposal, Build Job, PR, release and recovery | Jamie approves changes to authority, release or merge meaning |
| F03 | Local Workbench foundation: private server, SQLite, restart recovery and audit | `app/README.md`, `product/operate-internal-workbench.md`; Jamie | Implemented within a **proposed** Workbench increment | Functional overview, privacy boundary, tests, changelog | Backup/recovery runbook, schema migration policy and failure rehearsal record | Jamie approves the proposed Workbench increment after private validation |
| F04 | Unified My Work, explainable priority and Do Next | `product/operate-internal-workbench.md`, `app/README.md`; Jamie | Implemented, **proposed** | Operating model, UI copy and tests | Acceptance evidence for prioritisation quality, overload and ageing behaviour | Jamie approves product meaning and any change to priority policy |
| F05 | Cases, Requests, Tasks and governed state actions | `operations-bible/manifest.json`, `app/README.md`; Jamie and later operators | Implemented, **proposed** | Machine-readable definitions, action rules, UI help and tests | Human-readable lifecycle/reference guide and cross-record scenario evidence | Jamie approves Operations Bible meaning and lifecycle changes |
| F06 | Operations Bible extended records: Incident, Problem, Change, Risk, Finding, Improvement, Scenario Test, Decision and Approval | `operations-bible/manifest.json`, `app/README.md`; Jamie and later operators | Implemented, **proposed** | Machine-readable definitions, UI help and tests | Per-type examples, ownership guide, reporting expectations and failure cases | Jamie approves record meaning and consequential action rules |
| F07 | Work Profiles, separate recommendation and correction memory | `work-profiles/manifest.json`, `app/README.md`; Jamie and later operators | Implemented, **proposed** | Configurable definitions, functional explanation and tests | Selection guide, correction-retention boundary and pilot evidence | Jamie approves profile meaning and use beyond private testing |
| F08 | One-description assisted capture and follow-up questions | `product/operate-internal-workbench.md`, `app/README.md`; Jamie | Implemented, **proposed** | Journey description, progressive-disclosure behaviour and tests | Accuracy/usability findings across varied examples and a degraded-mode guide | Jamie approves the interaction after founder testing |
| F09 | Conversations, context preview and continuity | `product/operate-internal-workbench.md`, `app/README.md`; Jamie | Implemented, **proposed** | Functional description, context boundary and tests | Retention/deletion guidance, context-quality measures and adversarial-input evidence | Jamie approves retained-context behaviour and any broader audience |
| F10 | Repository knowledge retrieval, citations and snapshots | `app/README.md`; Jamie | Implemented, **proposed** | Retrieval design, privacy notes and tests | Index freshness/recovery runbook, coverage metrics and known retrieval failure modes | Jamie approves reliance on it for governed decisions |
| F11 | Optional OpenAI response route, capability tiers and cost gates | `app/README.md`; Jamie | Implemented optional route, **proposed** | Configuration, cost boundary and privacy notes | Provider operations guide, model-change controls and failure/cost evidence | Jamie approves provider use, spending threshold and scope |
| F12 | Voice capture, translation and attachment extraction | `product/mobile-knowledge-workbench.md`, `app/README.md`; Jamie on mobile and desktop | Implemented locally, **proposed** | Product proposal, supported behaviours, privacy notes and tests | Device/browser matrix, accessibility evidence, retention guide and recovery rehearsal | Jamie approves the mobile increment and any data sent to a provider |
| F13 | Feedback classification, Improvement register and Change register | `product/operate-internal-workbench.md`, `app/README.md`; Jamie | Implemented, **proposed** | Seven-way classification, governed route, UI and tests | End-to-end operator guide and evidence that classification does not imply approval | Jamie approves product semantics and each consequential change separately |
| F14 | Decision Inbox plus universal Decision and Approval records | `product/operate-internal-workbench.md`, `app/README.md`; Jamie | Implemented, **proposed** | Preparation/release separation, action rules and tests | Decision-quality checklist, expiry/revisit rules and reporting guide | Jamie retains every consequential decision and approval |
| F15 | Implementation Jobs, Codex brief, structured receipt, release and merge | `product/delivery-system.md`, `product/operate-internal-workbench.md`; Jamie and Codex | Implemented workflow; Workbench surface **proposed** | Definition, prompts, review checklist, receipt contract and tests | Operator recovery/runbook for branch collisions, failed PRs and partial release | Jamie approves release and merge; AI cannot self-authorise either |
| F16 | AI-owner queue, prompting and evidence return | `product/operate-internal-workbench.md`, `feedback/2026-07-26-ai-owned-work-needs-a-worker.md`, `ideas/workbench-native-ai-action-poll.md`; Jamie and the Codex worker | Queue implemented; external recurring worker validated then paused; in-system poll approved for scoping; **proposed** | Queue/claim/return contract, UI fallback, worker validation and tests | Workbench-native wake-up mechanism, availability/catch-up monitoring, stale-claim recovery, service authentication and multi-worker policy | Jamie approves product meaning and any build/connection; task-specific human gates remain unchanged |
| F17 | Methodology Challenge Studio and controlled feedback loop | `evolution/founder-challenge-loop.md`, `product/methodology-lab-pilot.md`; Jamie | Founder loop **approved**; Lab product **proposed** | Approved evolution process, challenge journey, publication draft and tests | Continuing response evidence, checkpoint findings and clearer Lab operator guide | Jamie approves methodology changes; replies never approve by implication |
| F18 | Reader guide and consolidated methodology reading path | `guide/README.md`, `publication/methodology-lab-001/`; practitioners and evaluators | Reader guide **approved** for internal validation; consolidated v0.8 **draft/proposed** | Full reading map and bounded publication set | Validation evidence from independent readers and disposition of feedback | Jamie approves methodology meaning and any public release |
| F19 | Confluence connected evidence | `product/confluence-connected-evidence.md`; Jamie | Implemented private connector; controlling product artefact **proposed** | Connection journey, read-only boundary, configuration and tests | Credential rotation/revocation runbook, outage recovery and current validation receipt | Jamie approves connection scope, credentials and product status |
| F20 | Governed Confluence Draft publication and lifecycle controls | `product/confluence-governed-publication.md`; Jamie | **Approved** for private internal validation; implemented | Publication model, lifecycle/conflict controls, tests and changelog | Operational support runbook and further live validation evidence | Standing AI authority covers bounded Draft management only; Jamie controls Live |
| F21 | Human publication model | `product/confluence-human-publication-model.md`; Jamie and AI drafter | **Approved** for private internal implementation; implemented | Authority model, product journey, UI and tests | Pilot learning and exception/recovery examples | Jamie alone approves Live publication, archive or consequential replacement |
| F22 | Operations Automated brand system and Oppa Mate identity | `brand/README.md`, `app/README.md`; internal users and later external audiences | Brand **draft**; identity pilot implemented for review | Foundations, identity, voice, adoption register and review items | Founder dispositions, accessibility checks and approved surface-by-surface adoption plan | Jamie explicitly approves each adoption and any external publication |
| F23 | Connected system architecture | `product/operations-automated-system-architecture.md`; Jamie and implementers | **Proposed** | Target components, boundaries and dependencies | Sequenced architecture decisions, security model, ownership and transition plan | Jamie approves consequential connections, scope and implementation stages |
| F24 | Connected Governance dogfood service | `product/connected-governance-dogfood-pilot.md`, `governance-site/README.md`; Jamie and invited private testers | Implemented testing surface, **proposed** product increment | Product proposal, assurance packs, guided journey and technical project | Test results, import/broker design, operational/security runbook and validated audience need | Jamie approves pilot activation, connections and any publication |
| F25 | Operational Governance as Code proof of concept | `governance-poc/README.md`; internal evaluators using fictional data | **Proposed experimental** standalone POC | Architecture, domain, integrations, safeguards, demo and tests | Clear disposition against current product direction and retained experiment findings | Jamie decides whether to stop, park, learn from or promote any capability |
| F26 | Commercial validation and future paid offer | `product/commercial-validation-strategy.md`; Jamie and future buyers | **Proposed** | Commercial objective, stages and governance | Current market evidence, offer definition, price/cost evidence and test results | Jamie approves spending, external contact, offer and commercial commitment |
| F27 | Ideas Space | `ideas/README.md`; Jamie and AI collaborators | **Proposed**, implemented as a repository register | Capture rules, register and relationship search helper | Review cadence and evidence from use | Jamie approves prioritisation or movement into delivery; capture alone does not authorise work |
| F28 | Method pilots and self-assessment aids | `pilots/README.md`; Jamie and future practitioners | **Proposed/experimental** evidence work | Pilot rules, initial records and decision-aid validation | Repeat applications, audience feedback and disposition into method/product changes | Jamie approves any methodology or product change inferred from pilot evidence |

## Coverage assessment

### Recorded evidence

- The repository has authoritative definitions and strong automated functional evidence for the local Workbench, publication flows and governance proof of concept.
- The implemented Workbench surface is materially broader than its approved product baseline. Many later increments are deliberately marked `proposed` even though working code exists.
- User-facing guidance is concentrated in the Workbench and repository reader guide; operational support, failure recovery and lifecycle ownership are less consistently documented.

### AI inference

The most material documentation risk is not a missing feature list. It is status ambiguity: implemented behaviour can look settled while its controlling product artefact remains proposed. The second risk is operational resilience. Connected, scheduled and provider-backed features have useful boundary statements but thinner recovery, monitoring and credential-lifecycle guidance.

### Recommended drafting order

This order is a recommendation only and does not authorise drafting:

1. Add one Workbench operator and recovery runbook covering local data, queue claims, Build Jobs, provider failures and backups.
2. Add a concise human-readable Operations Bible and Work Profile reference with examples.
3. Record founder-validation evidence for My Work, capture, feedback/change and AI-owner pickup before proposing approval.
4. Add connector credential, outage and revocation procedures before broadening connected use.
5. Reassess the experimental Governance POC and Connected Governance surface against the current architecture before documenting either as a target product.

## Maintenance rule

Update this inventory whenever a feature family is introduced, materially changed, approved, parked or removed. A row may be closed only when the controlling artefact, audience, implementation state, documentation gap and next approval gate are all explicit. The inventory must not be used to infer approval from code, test success, silence or continued use.

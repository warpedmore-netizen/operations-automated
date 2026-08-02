---
id: OA-PRACTICE-071
title: Agent Delegation and Runtime Assurance Profile
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-08-02
methodology_baseline: Operations Automated v0.7, approved for internal validation
completeness: C2 outlined; prepared for bounded case validation
source: RP-01 in OA-RESEARCH-001
---

# Agent delegation and runtime assurance profile

> **Use this guide when** an AI system may select or execute actions towards a goal, use tools, call other agents or services, or continue work without a person directing every step.

This proposed guide turns the approved Agentic-ready requirements into one case-ready profile. It does not approve an agent, replace technical security controls or establish a new methodology stage.

## 1. Status and applicability

Use the profile for a named capability in a named environment. Start with the lowest-complexity option and stop if ordinary human work, conventional automation or bounded AI assistance creates the required value.

The guide is C2 because it has not yet been used by an independent practitioner. Case validation must show whether it can reach C3 without ceremonial record keeping.

## 2. Purpose and intended outcomes

The profile should let a competent outsider answer:

- what outcome the agent is meant to support;
- who owns that outcome and remains accountable;
- what the agent may and may not do;
- which identity, tools, data and permissions it uses;
- what requires human approval;
- what happened at runtime;
- how the capability is stopped, recovered and retired; and
- what evidence would justify continuation, change or withdrawal.

## 3. Intended reader, participants and roles

The operational owner leads the outcome and value decision. Engineering or architecture supplies the real design and runtime evidence. Identity, security, data, privacy, risk, legal, procurement and affected people contribute where consequence makes their interface material. An independent reviewer challenges whether the controls work rather than merely exist.

## 4. When to use it

Use the profile before a new agent pilot, a material permission or tool change, production use, owner or supplier change, significant incident, periodic value review, offboarding or retirement. Also use it when an AI workflow is described as an agent but the actual level of delegation is unclear.

## 5. Scope, boundaries and non-goals

The profile covers operational delegation and assurance. It does not:

- grant authority or accept risk;
- certify compliance, safety or security;
- replace identity, change, incident, privacy or supplier controls;
- require retention of prompts, personal data or sensitive outputs where that would be disproportionate; or
- treat a completed template as technical enforcement.

## 6. Concepts and terminology

- **Agent:** a capability that can select or execute actions towards a bounded goal using tools or services.
- **Delegated authority:** the permitted actions the agent performs on behalf of an identified owner or role.
- **Action boundary:** what may be observed, prepared, executed, escalated or never attempted.
- **Consequential action:** an action that can materially affect people, money, rights, access, data, service, external communication or accepted risk.
- **Runtime event:** evidence of what the agent received, decided, attempted, executed, returned or escalated.
- **Stop mechanism:** a control outside the agent that prevents further action.

Local language may differ, but the distinctions between advice, preparation, reversible execution, consequential execution and prohibited action must remain visible.

## 7. Value, beneficiaries and minimum outcomes

| Field | Case evidence |
|---|---|
| Primary person and journey |  |
| Outcome the agent supports |  |
| User-defined value and priority |  |
| Minimum acceptable outcome |  |
| People who may benefit or be harmed |  |
| Credible non-agent alternative |  |
| Authority over trade-offs |  |

The minimum outcome must include a safe route when the agent is unavailable, stopped or not trusted.

## 8. Inputs, evidence and entry criteria

Entry requires a named outcome owner, an understood work type, a bounded environment, available design and runtime evidence, a credible non-agent comparison, and an authorised test route. Missing evidence is recorded as a gap; it must not be replaced by supplier claims or AI inference.

## 9. Demand, work types and variation

Separate the events the agent may encounter: normal work, known exceptions, urgent work, incomplete or conflicting input, adversarial input, degraded dependencies, attempted prohibited action and requests outside scope. Record which types must be rejected or routed to a person.

## 10. Activities and workflow

1. Follow the primary person's journey and identify the first point where the proposed agent changes an outcome.
2. Map the operational value system, dependencies and existing human route.
3. Define the goal, environment, action boundary and prohibited outcomes.
4. Identify the represented owner, technical identity, tools, data and permissions.
5. Classify actions and place approval gates before consequential execution.
6. Define runtime evidence, monitoring, intervention and incident routes.
7. Test normal, exceptional, adversarial, degraded and unauthorised-action cases.
8. Exercise the external stop and recovery route.
9. Decide pilot, change, stop or no-agent with named authority.
10. Review observed value, permissions and incidents; remove authority on retirement.

## 11. Decision rights, rules and escalation

Use locally meaningful action categories rather than an unexplained score:

| Action category | Default position | Required authority and evidence |
|---|---|---|
| Observe or retrieve | Permit only within authorised information boundaries | Named data/access owner and auditable identity |
| Prepare or recommend | A person remains responsible for use | Output evaluation and clear non-execution boundary |
| Execute a readily reversible action | Permit only after tested rollback and monitoring | Operational owner and applicable technical authority |
| Execute a consequential action | Human approval before execution unless separately and explicitly authorised | Named decision-maker, evidence, limits and retained approval |
| Prohibited action | Prevent and alert | Technical enforcement plus incident route |

Ambiguity moves the action into a more controlled category until an authorised person resolves it.

## 12. Outputs, records and completion

### Minimum agent profile

| Profile element | Required record |
|---|---|
| Capability and environment | Stable name, version, purpose, environment and lifecycle state |
| Outcome and ownership | Intended outcome, beneficiary, operational owner and technical owner |
| Identity and authority | Agent identity, represented role, credential owner and delegated permissions |
| Tools and information | Permitted tools, systems, data, knowledge, memory and retention boundary |
| Action boundary | Permitted, approval-gated and prohibited actions; financial, communication and persistence limits |
| Human control | Approval points, escalation, meaningful review and affected-person challenge route |
| Runtime evidence | Minimum events, correlation identifier, timestamps, action/result and approval reference |
| Failure and recovery | Failure signals, fallback, external stop, rollback, recovery owner and incident route |
| Change and retirement | Change triggers, permission review, offboarding, credential revocation and record disposition |
| Value review | Baseline, intended benefit, observed outcome, harms and continue/change/stop decision |

Completion means the evidence supports a governed decision. It does not mean the agent is approved.

## 13. Interfaces and dependencies

For each material interface record the provider, what is received, what is returned, owner, entry and completion condition, failure signal and recovery. At minimum consider operational ownership, engineering, identity/security, data/privacy, risk/legal, finance, procurement/supplier and affected users.

## 14. People, capability and accessibility

Identify the skill needed to operate, review, challenge, stop and recover the capability. Review must be meaningful: the person needs time, evidence, competence and authority. Record workload transferred to reviewers, support teams and people handling degraded operation. Provide an accessible route to question or correct an outcome.

## 15. Information, data and knowledge

Record provenance, classification, access, quality, permitted use, memory, retention, deletion and correction. Keep runtime evidence sufficient to reconstruct material action without retaining unnecessary sensitive content. State what cannot be observed and how that uncertainty changes the decision.

### Minimum runtime event

| Field | Purpose |
|---|---|
| Event and correlation ID | Connect related steps without relying on free text |
| Capability/version and identity | Show what acted and under which authority |
| Time and environment | Locate the event operationally |
| Trigger and action category | Explain why control was required |
| Tool/action attempted and outcome | Distinguish plan, attempt, execution, failure and rejection |
| Approval or rule reference | Show the authority used |
| Exception, intervention or stop | Make control and recovery observable |

## 16. Risks, controls and obligations

Consider excessive or orphaned permission, shared identity, prompt or data injection, unsafe tool use, hidden delegation, incorrect output, silent harm, unauthorised communication, uncontrolled spend, sensitive logging, provider failure and inability to reconstruct action. Record applicable specialist obligations separately; this guide must not claim to satisfy them.

## 17. Technology, automation, AI and agents

Test whether the capability is genuinely agentic. If it only drafts content or follows deterministic rules, apply the simpler AI-ready or automation-ready controls. Technical controls should enforce least privilege, separation of environments, approval gates, limits, monitoring and an external stop; policy text alone is not enough.

## 18. Measures, performance, feedback and learning

Measure the primary outcome, quality, exceptions, human effort, review overrides, prohibited attempts, incidents, recovery performance and full cost where material. Adoption or task count is not value. Give affected people a receiver-centred feedback route and name who responds.

## 19. Failure, resilience and recovery

The bounded case must test:

| Scenario | Evidence required |
|---|---|
| Normal | Intended action and outcome are correctly recorded |
| Known exception | Agent rejects, routes or handles it within authority |
| Adversarial or prompt-injection | Prohibited instruction cannot acquire authority |
| Degraded dependency | Minimum outcome and safe fallback remain available |
| Unauthorised action | Attempt is prevented, visible and escalated |
| Owner absence/offboarding | Authority is reviewed or revoked without relying on the absent owner |
| External stop and recovery | Further action stops and a controlled service route is restored |

## 20. Tailoring, implementation, example and known gaps

For low-consequence preparation, use only the fields that establish ownership, boundaries, evaluation and safe non-use. For consequential execution, complete every material section and seek specialist review. The first case should use one non-confidential capability and record actual evidence rather than an ideal design.

Known gaps include multi-agent hand-offs, independent assurance patterns, provider-specific telemetry and legal/sector mappings. These remain validation or specialist-interface work.

## Governed next action

Apply this proposed profile through [the first facilitated assurance and value case](../../pilots/ai-agent-assurance-and-value-case-001.md). Accept, revise or reject RP-01 only after the case shows whether another practitioner can identify authority, reconstruct material action and intervene or recover without the designer's tacit knowledge.

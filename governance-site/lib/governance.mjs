export const GOVERNANCE_PACK_ID = "OA-GOV-PACK-001";
export const APPROVAL_CONFIRMATION = "Approve selected governance documents for internal use";

export const operationsAutomatedProfile = Object.freeze({
  name: "Operations Automated",
  sector: "Operational methodology, governance and AI-enabled services",
  size: "Founder-led business",
  services: "Operational assessment, governance design, methodology-led improvement, controlled documentation and AI-assisted delivery",
  dependencies: "Jamie Peppard, the controlled Git repository, approved AI services, Confluence, hosting and identity providers",
  regulation: "UK law, contractual duties, privacy, intellectual property, security and any obligations applicable to a specific service or customer",
  immediateGoal: "Operate Operations Automated through the same connected, human-led governance model it provides to others",
});

const definitions = Object.freeze([
  {
    id: "OA-BIZ-001",
    type: "Charter",
    title: "Business Charter",
    owner: "Jamie Peppard",
    dependsOn: [],
    summary: "Purpose, value, beneficiaries, principles and business boundaries.",
    body: (o) => `# Business Charter

## Purpose

${o.name} exists to help individuals, teams and organisations understand, govern and improve operations as connected systems and become ready for justified automation, AI assistance and bounded agentic operation.

## Intended value

- Return useful analysis and a practical next action, not forms alone.
- Connect purpose, people, demand, work, decisions, dependencies, risk, information, technology and learning.
- Make governance usable in day-to-day work rather than a periodic documentation exercise.
- Help each user define what value means before recommending improvement or automation.

## Current operating context

${o.name} is currently a ${o.size.toLowerCase()} in ${o.sector.toLowerCase()}. Its current services are ${o.services.toLowerCase()}.

## Principles

1. Human authority and accountability remain visible.
2. Evidence, judgement, inference and recommendation are separated.
3. The smallest useful output comes first; complexity must earn its place.
4. AI may analyse, challenge, draft and execute bounded mechanics but cannot infer approval.
5. Failures are made observable, recoverable and useful for learning.
6. Draft, approved, live, superseded and rejected material remain distinguishable.

## Boundaries

- Confidential employer, client or third-party information is not used without an authorised and suitable information basis.
- Technical completion does not create approval, publication authority, spending authority or risk acceptance.
- Legal, regulatory, safety, security and specialist obligations are not replaced by this governance model.

## Authority

Jamie Peppard retains final authority over methodology meaning, policy, consequential connections, delegated authority, risk acceptance, spending, merge and external publication during the founder-controlled stage.
`,
  },
  {
    id: "OA-BIZ-002",
    type: "Operating model",
    title: "Business Operating Model",
    owner: "Jamie Peppard",
    dependsOn: ["OA-BIZ-001"],
    summary: "How value, work, capabilities, systems and decisions fit together.",
    body: (o) => `# Business Operating Model

## Operating outcome

${o.immediateGoal}.

## Core value flow

1. A person describes an operational need in ordinary language.
2. Operations Automated frames value, scope, people, authority and evidence boundaries.
3. The operation is examined through the relevant connected operational lenses.
4. Findings, uncertainty, readiness, options and trade-offs are returned.
5. The authorised human makes consequential decisions.
6. The smallest useful artefact, change or implementation route is developed.
7. First use and outcomes are observed; learning enters the governed evolution loop.

## Core capabilities

- Methodology stewardship and controlled evolution.
- Operational assessment and connected-system analysis.
- Governance, risk, control and documentation design.
- Human-AI collaboration and bounded automation design.
- Product, service and customer validation.
- Knowledge publication, release and retained learning.

## Key dependencies

${o.dependencies}.

## Operating records

The governed knowledge model retains services, requirements, policies, controls, procedures, evidence, risks, decisions, approvals, publications, findings and changes as connected records. Documents are readable released views of that model.

## Review trigger

Review this operating model when the service offer, legal form, team, material supplier, AI provider, information boundary or customer delivery model changes.
`,
  },
  {
    id: "OA-SVC-001",
    type: "Catalogue",
    title: "Initial Service Catalogue",
    owner: "Jamie Peppard",
    dependsOn: ["OA-BIZ-001", "OA-BIZ-002"],
    summary: "The initial services, outcomes, entry criteria and retained outputs.",
    body: () => `# Initial Service Catalogue

## 1. Operational question and decision support

**Outcome:** a proportionate answer, uncertainty, trade-offs and governed next action.

**Typical outputs:** concise analysis, checklist, decision record or validation plan.

## 2. Connected operational assessment

**Outcome:** a connected view of value, demand, people, work, flow, authority, risk, information, technology and learning.

**Typical outputs:** operating picture, findings, readiness profile, priorities and improvement route.

## 3. Governance and documentation foundation

**Outcome:** a proportionate, maintainable set of connected policies, controls, procedures, responsibilities and evidence requirements.

**Typical outputs:** governance model, document pack, control catalogue, approval routes and publication plan.

## 4. Automation and AI readiness

**Outcome:** an evidence-led decision on what should remain human, be improved, automated, AI-assisted or bounded for agentic operation.

**Typical outputs:** readiness findings, gates, control design, implementation route and recovery plan.

## 5. Methodology and operating-model enablement

**Outcome:** a user can understand, apply and maintain the agreed operating approach.

**Typical outputs:** handbook, guides, templates, training aids, governed knowledge base and review cycle.

## Entry boundary

No service begins with confidential or personal information unless the purpose, permissions, storage, access, retention, deletion and contractual basis have been agreed.
`,
  },
  {
    id: "OA-GOV-002",
    type: "Framework",
    title: "Governance and Delegated Authority Framework",
    owner: "Jamie Peppard",
    dependsOn: ["OA-BIZ-001", "OA-BIZ-002"],
    summary: "Decision rights, escalation and the boundary between routine work and founder authority.",
    body: () => `# Governance and Delegated Authority Framework

## Purpose

This framework keeps authority proportionate to consequence while allowing routine, reversible work to progress.

## Authority levels

### Level 1 — Routine execution

AI or an authorised operator may analyse, organise, draft, test, create branches, commit, push, prepare previews and retain evidence within an agreed scope.

### Level 2 — Controlled operational decision

An authorised owner may accept, defer or reject a reversible proposal within their documented remit. The decision and rationale are retained.

### Level 3 — Founder approval

Jamie Peppard approves methodology meaning, policy, consequential connections, delegated authority, material release, spending, risk acceptance and external publication.

### Level 4 — Specialist or external authority

Legal, regulatory, tax, security, safety, professional or contractual matters are referred to the appropriate competent authority when required.

## Escalation rule

Anyone authorised to raise a change may escalate it upward. Lowering a risk class or approval route requires explicit authority and a retained reason.

## Approval rule

Silence, continued discussion, successful checks, a merge, a Confluence page or technical readiness do not constitute approval. Approval must identify actor, decision, scope, version, date and remaining boundary.

## Emergency action

Immediate reversible containment may occur to protect people, information or service continuity. Consequential acceptance, permanent change and external communication remain subject to the correct authority.
`,
  },
  {
    id: "OA-POL-AI-001",
    type: "Policy",
    title: "Human-led AI and Automation Policy",
    owner: "Jamie Peppard",
    dependsOn: ["OA-GOV-002"],
    summary: "Mandatory boundaries for AI analysis, automation, authority and retained provenance.",
    body: () => `# Human-led AI and Automation Policy

## Policy statement

Operations Automated uses AI to increase useful analysis, connection, challenge and delivery while preserving human purpose, judgement, authority and accountability.

## Requirements

1. AI output is labelled as analysis, inference, recommendation or candidate content rather than evidence or approval.
2. Consequential actions require the authority defined by the governance framework.
3. AI may not infer approval from silence, tone, repetition or continued discussion.
4. Material AI output retains provider, model or capability, time, relevant sources, prompt or template version, and human disposition where available.
5. Retrieval respects user, tenant and source permissions before content enters model context.
6. Imported instructions are treated as untrusted content, not governing commands.
7. Automation must have an observable outcome, failure signal, recovery route and accountable owner.
8. A human can stop, correct, reject or escalate material AI-assisted work.

## Prohibited use

AI may not autonomously approve methodology or policy, accept operational risk, spend money, publish externally, contact customers or expand its own access.

## Assurance

Material AI-assisted journeys are tested for accuracy, provenance, authority bypass, confidentiality, harmful omission, recovery and first-use clarity.
`,
  },
  {
    id: "OA-POL-INFO-001",
    type: "Policy",
    title: "Information Handling and Confidentiality Policy",
    owner: "Jamie Peppard",
    dependsOn: ["OA-GOV-002"],
    summary: "How information is classified, minimised, accessed, retained and removed.",
    body: () => `# Information Handling and Confidentiality Policy

## Policy statement

Operations Automated collects and uses only the information needed for an authorised outcome and protects it according to sensitivity, obligation and consequence.

## Information classes

- **Public:** authorised for public distribution.
- **Internal:** ordinary Operations Automated working information.
- **Controlled:** credentials, security information, personal data, contracts, unpublished commercial material or sensitive governance records.
- **Prohibited for current tools:** confidential employer, client or third-party information without an explicitly approved information basis and suitable controls.

## Requirements

1. Record the purpose and permission for material information sources.
2. Minimise personal and confidential information.
3. Keep credentials outside source code, browser storage, logs and ordinary documents.
4. Grant access by role and current need.
5. Define retention, export and deletion before collecting controlled information.
6. Remove access and derived indexes when a connection or user is removed.
7. Treat AI providers and document platforms as separate data processors or services requiring explicit review.
8. Report suspected loss, exposure or unauthorised access immediately.

## Repository boundary

The controlled repository may contain generic operational reasoning and authorised business records. It must not contain confidential employer, customer, employee or third-party material.
`,
  },
  {
    id: "OA-POL-CONN-001",
    type: "Policy",
    title: "Connection and Credential Policy",
    owner: "Jamie Peppard",
    dependsOn: ["OA-POL-INFO-001", "OA-GOV-002"],
    summary: "Approval and security requirements for business-system and AI connections.",
    body: () => `# Connection and Credential Policy

## Policy statement

Every external connection has a defined purpose, bounded information flow, minimum permission set, accountable owner, failure route and removal method.

## Connection decision

Before enabling a consequential connection, record:

- outcome enabled and credible alternative;
- information sent, received, stored and deleted;
- permissions and authority represented;
- security, privacy, legal and ethical considerations;
- cost, usage limits and commercial dependency;
- failure, recovery, rotation and removal routes; and
- the explicit approving authority.

## Credential requirements

Credentials remain server-side in an approved secret store, are never returned to the browser, are masked in status views, and can be rotated, disabled and removed. Production and test credentials are separated.

## Connector behaviour

Read and write permissions are separate. Publication requires a fresh plan, conflict check and plan-specific confirmation. No connector may delete or overwrite unmanaged content by default.
`,
  },
  {
    id: "OA-POL-DOC-001",
    type: "Policy",
    title: "Documentation Publication and Change Control Policy",
    owner: "Jamie Peppard",
    dependsOn: ["OA-GOV-002", "OA-POL-CONN-001"],
    summary: "Document status, approval, Draft-to-Live publication and conflict handling.",
    body: () => `# Documentation Publication and Change Control Policy

## Policy statement

Operational governance remains traceable from source and candidate through approval, publication, use, review and supersession.

## Lifecycle

- **Candidate:** generated or drafted content awaiting review.
- **Draft:** a readable Confluence copy published for review; not approved.
- **Approved:** the identified version has received explicit internal-use approval.
- **Live:** the approved version has been promoted to the Live reading tree.
- **Superseded or rejected:** retained for history and no longer current.

## Requirements

1. Every document declares type, identifier, owner, version, status and relationships.
2. Draft publication does not constitute approval.
3. Approval records actor, time, scope and the exact content fingerprint.
4. Live promotion is blocked if the approved fingerprint no longer matches the document.
5. A changed Confluence version creates a conflict and is not silently overwritten.
6. Confluence page IDs, versions and publication receipts are retained.
7. No automatic deletion, external publication or unmanaged-page takeover is permitted.
8. A changed approved document returns to candidate or draft review as appropriate.
`,
  },
  {
    id: "OA-FRM-RISK-001",
    type: "Framework",
    title: "Risk, Control and Assurance Framework",
    owner: "Jamie Peppard",
    dependsOn: ["OA-GOV-002"],
    summary: "How risks, controls, evidence, findings and acceptance remain connected.",
    body: () => `# Risk, Control and Assurance Framework

## Purpose

Connect what could affect value or obligation with ownership, treatment, controls, evidence, findings and decisions.

## Risk statement

Each material risk states cause, uncertain event or condition, affected outcome, people or obligation, and plausible consequence. A score supports comparison but does not replace this reasoning.

## Control design

Each control identifies:

- the risk or requirement it addresses;
- control owner and operator;
- trigger or frequency;
- preventative, detective, corrective or recovery purpose;
- expected evidence;
- failure or exception route; and
- review trigger.

## Assurance

Control design and control operation are assessed separately. Evidence source, period, completeness, limitation and independence remain visible.

## Acceptance

Residual risk acceptance requires the authorised person, defined scope, expiry or review trigger, rationale, assumptions and actions. AI and control scores cannot accept risk.
`,
  },
  {
    id: "OA-FRM-DEL-001",
    type: "Framework",
    title: "Delivery and Validation Framework",
    owner: "Jamie Peppard",
    dependsOn: ["OA-SVC-001", "OA-FRM-RISK-001", "OA-POL-AI-001"],
    summary: "How services move from need to useful output, first use and retained learning.",
    body: () => `# Delivery and Validation Framework

## Delivery route

1. Understand the ordinary-language need and return useful provisional value.
2. Define beneficiary, intended outcome, user-defined value, scope and information boundary.
3. Examine the connected operation through the relevant lenses.
4. Distinguish evidence, user judgement, AI inference, assumptions and recommendation.
5. Assess operational, automation, AI and agentic readiness proportionately.
6. Use OPERATE to prioritise, examine, redesign, automate where justified, test and evolve.
7. Produce the smallest useful output with optional progressive depth.
8. Prove the intended user can reach, activate and begin using it.
9. Record outcomes, failures, feedback and the governed next action.

## Validation measures

- time to first useful outcome;
- clarity of the recommendation and next action;
- whether the output is usable without unnecessary facilitation;
- decision and authority visibility;
- activation, completion and recovery evidence;
- observed outcome improvement and unintended effects; and
- support effort and repeated value.

## Release boundary

One successful case or attractive artefact does not establish repeatable product value, compliance, commercial viability or publication authority.
`,
  },
  {
    id: "OA-PROC-CHG-001",
    type: "Procedure",
    title: "Governance Change, Approval and Publication Procedure",
    owner: "Jamie Peppard",
    dependsOn: ["OA-POL-DOC-001", "OA-GOV-002"],
    summary: "The repeatable route from signal to candidate, approval, Live publication and review.",
    body: () => `# Governance Change, Approval and Publication Procedure

## Trigger

A new requirement, scheduled review, operational finding, document conflict, user feedback, legal or technology change, or approved business decision.

## Steps

1. Record the trigger, source, permission, evidence boundary and affected outcomes.
2. Identify connected documents, policies, controls, procedures, roles and users.
3. Draft the smallest coherent candidate and retain assumptions and alternatives.
4. Run consistency, terminology, duplication, relationship, security and authority checks.
5. Preview the candidate documents and publish the reviewed copies into Confluence Draft using the exact plan-specific confirmation.
6. Review the Draft pages and resolve any content or independent-edit conflict.
7. Record explicit approval against the exact document fingerprints and internal-use scope.
8. Prepare a fresh Live promotion plan and recheck the current Confluence versions.
9. Promote only approved, unchanged documents into Live using the exact promotion confirmation.
10. Retain page IDs, versions, actor, time, counts and failure details.
11. Observe first use and outcomes; route material learning through the evolution system.

## Stop conditions

Stop on missing authority, changed approved content, inaccessible destination, independent Confluence edit, unmanaged title collision, incomplete write receipt or unclear information boundary.

## Recovery

No automatic deletion or overwrite occurs. Resolve the source, ownership or version difference, then prepare a fresh plan.
`,
  },
  {
    id: "OA-REG-RISK-001",
    type: "Register",
    title: "Initial Risk and Control Register",
    owner: "Jamie Peppard",
    dependsOn: ["OA-FRM-RISK-001", "OA-POL-AI-001", "OA-POL-INFO-001", "OA-POL-DOC-001"],
    summary: "The first connected business risks, controls and evidence expectations.",
    body: () => `# Initial Risk and Control Register

| Risk | Initial control | Evidence | Owner |
| --- | --- | --- | --- |
| Methodology or policy meaning changes without authority | Status-aware change process and explicit founder approval | Decision and release record | Jamie Peppard |
| Draft content is represented as approved | Candidate, Draft, Approved and Live lifecycle panels | Publication receipt and page status | Jamie Peppard |
| Confidential information enters an unsuitable tool | Information boundary, minimisation and prohibited-content rule | Intake record and review | Jamie Peppard |
| AI output is treated as evidence or authority | Provenance labels and human decision gates | AI run and disposition record | Jamie Peppard |
| An independent Confluence edit is overwritten | Optimistic page-version comparison | Conflict record | Jamie Peppard |
| External service access is broader than necessary | Minimum scopes, server-side secrets and rotation | Connection decision and access review | Jamie Peppard |
| A generated artefact cannot be used | Activation and first-use validation | First-use result and recovery record | Jamie Peppard |
| Founder dependency interrupts delivery or governance | Retained procedures, decision records and recoverable knowledge | Continuity review | Jamie Peppard |
| Service claims exceed demonstrated capability | Status, evidence and publication boundaries | Offer review and validation evidence | Jamie Peppard |
| Authoritative knowledge is lost or diverges | Versioned canonical record and verified publication receipts | Backup, export and reconciliation result | Jamie Peppard |

## Review

Review this register after a material failure, new service, new connection, customer-data decision, delegated role, external publication or quarterly during active operation.
`,
  },
]);

export function governanceCatalogue() {
  return definitions.map((definition) => ({ id: definition.id, type: definition.type, title: definition.title, owner: definition.owner, dependsOn: [...definition.dependsOn], summary: definition.summary }));
}

export function fingerprint(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function generateGovernancePack(organisation = {}, actor = "Jamie Peppard", now = new Date().toISOString()) {
  const context = { ...operationsAutomatedProfile, ...organisation };
  return {
    id: GOVERNANCE_PACK_ID,
    title: "Operations Automated Core Governance",
    status: "candidate",
    version: 1,
    generatedAt: now,
    generatedBy: actor,
    organisation: context.name,
    documents: definitions.map((definition) => {
      const content = definition.body(context).trim();
      return {
        id: definition.id,
        type: definition.type,
        title: definition.title,
        owner: definition.owner,
        dependsOn: [...definition.dependsOn],
        summary: definition.summary,
        status: "candidate",
        version: 1,
        content,
        contentHash: fingerprint(content),
        updatedAt: now,
        updatedBy: actor,
        approval: null,
        draftReceipt: null,
        liveReceipt: null,
      };
    }),
  };
}

export function updateGovernanceDocument(pack, documentId, content, actor, now = new Date().toISOString()) {
  const document = pack?.documents?.find((item) => item.id === documentId);
  if (!document) throw Object.assign(new Error("Governance document not found"), { status: 404 });
  const next = String(content || "").trim();
  if (next.length < 80 || next.length > 120_000) throw Object.assign(new Error("Document content must contain between 80 and 120,000 characters"), { status: 400 });
  document.content = next;
  document.contentHash = fingerprint(next);
  document.version = Number(document.version || 1) + 1;
  document.updatedAt = now;
  document.updatedBy = actor;
  document.status = "candidate";
  document.approval = null;
  document.liveReceipt = null;
  return document;
}

export function approveGovernanceDocuments(pack, ids, actor, confirmation, now = new Date().toISOString()) {
  if (confirmation !== APPROVAL_CONFIRMATION) throw Object.assign(new Error(`Type “${APPROVAL_CONFIRMATION}” exactly`), { status: 400 });
  const selected = pack?.documents?.filter((document) => ids.includes(document.id)) || [];
  if (!selected.length) throw Object.assign(new Error("Select at least one document"), { status: 400 });
  for (const document of selected) {
    if (!document.draftReceipt) throw Object.assign(new Error(`${document.title} has not been published to Confluence Draft`), { status: 409 });
    if (document.draftReceipt.contentHash !== document.contentHash) throw Object.assign(new Error(`${document.title} changed after its Confluence Draft was published`), { status: 409 });
  }
  for (const document of selected) {
    document.status = "approved";
    document.approval = { actor, approvedAt: now, scope: "private internal use", contentHash: document.contentHash, version: document.version };
  }
  pack.status = pack.documents.every((document) => document.status === "approved" || document.status === "live") ? "approved" : "partially-approved";
  return selected;
}

export function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function inline(value) {
  return escapeHtml(value).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function markdownToStorage(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const output = [];
  let list = [];
  const flush = () => { if (list.length) output.push(`<ul>${list.splice(0).map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`); };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) { flush(); continue; }
    if (line.includes("|") && index + 1 < lines.length && /^\|?\s*:?-{3,}/.test(lines[index + 1].trim())) {
      flush();
      const rows = [line]; index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) { rows.push(lines[index].trim()); index += 1; }
      index -= 1;
      const cells = rows.map((row) => row.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
      output.push(`<table><tbody>${cells.map((row, rowIndex) => `<tr>${row.map((cell) => rowIndex === 0 ? `<th>${inline(cell)}</th>` : `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) { flush(); output.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`); continue; }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) { list.push(bullet[1]); continue; }
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) { flush(); output.push(`<p>${inline(line)}</p>`); continue; }
    flush(); output.push(`<p>${inline(line)}</p>`);
  }
  flush();
  return output.join("");
}

export function documentStorage(document, lifecycle) {
  const status = lifecycle === "live" ? "Approved — live for private internal use" : "Draft — not approved";
  const approval = lifecycle === "live" && document.approval
    ? `<p><strong>Approved by:</strong> ${escapeHtml(document.approval.actor)} · ${escapeHtml(document.approval.approvedAt)} · ${escapeHtml(document.approval.scope)}</p>`
    : "<p>This readable Draft does not constitute approval.</p>";
  return `<div class="oa-governance-status"><p><strong>${escapeHtml(status)}</strong></p><p><strong>Document:</strong> ${escapeHtml(document.id)} · version ${escapeHtml(document.version)}</p><p><strong>Owner:</strong> ${escapeHtml(document.owner)}</p>${approval}</div>${markdownToStorage(document.content)}<hr/><p><strong>Connected to:</strong> ${document.dependsOn.length ? document.dependsOn.map(escapeHtml).join(", ") : "Business purpose"}</p><p><strong>Content fingerprint:</strong> ${escapeHtml(document.contentHash)}</p><p>Operations Automated retains the governed source, approval and publication receipt. Confluence is the human reading copy.</p>`;
}

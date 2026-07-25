export type OrganisationProfile = {
  name: string;
  sector: string;
  size: string;
  services: string;
  dependencies: string;
  regulation: string;
  immediateGoal: string;
};

export type AuthorityProfile = {
  governanceAuthority: string;
  methodologyAuthority: string;
  documentOwner: string;
  controlOwner: string;
  draftingAgent: string;
  publicationOperator: string;
};

export type GovernanceComponent = {
  id: string;
  title: string;
  documentType: "Framework" | "Policy" | "Standard" | "Procedure" | "Register";
  summary: string;
  status: "candidate" | "accepted";
  content: string;
  sources: string[];
  destination: string;
};

export const defaultAuthority: AuthorityProfile = {
  governanceAuthority: "Operations Automated Governance Authority",
  methodologyAuthority: "Operations Automated Methodology Authority",
  documentOwner: "Document Owner",
  controlOwner: "Control Owner",
  draftingAgent: "AI Governance Agent",
  publicationOperator: "Publication Operator",
};

export const operationsAutomatedProfile: OrganisationProfile = {
  name: "Operations Automated",
  sector: "Operations management methodology and governance technology",
  size: "Founder-led organisation in private internal validation",
  services: "Operations Automated methodology, AI Workbench, Connected Governance and governed human-readable publication",
  dependencies: "Governance Authority, Methodology Authority, GitHub repository, private Workbench, Confluence Cloud, OpenAI and Atlassian services",
  regulation: "Applicable UK law and contractual obligations; confidentiality; human approval of policy and methodology meaning; controlled AI authority; recoverable publication",
  immediateGoal: "Create and maintain the minimum internal business governance needed to develop Operations Automated safely, while keeping company governance separate from methodology meaning",
};

export const operationsAutomatedInventory = [
  ["Framework", "Methodology governance and evolution system", "current"],
  ["Standard", "Human-first Confluence publication model", "current"],
  ["Standard", "AI-managed Draft publication authority", "current"],
  ["Policy", "Complete company policy set", "missing"],
  ["Control catalogue", "Operations Automated control catalogue", "missing"],
  ["Procedure", "Business governance review and release procedure", "missing"],
  ["Scenario library", "Business governance scenario library", "missing"],
] as const;

export const businessFoundationOutputs = [
  "Business Governance Framework",
  "Roles and Delegated Authority Standard",
  "Human-led AI and Automation Policy",
  "Information Handling and Confidentiality Policy",
  "Risk, Control and Assurance Framework",
  "Connections and Credential Policy",
  "Documentation, Change and Publication Policy",
  "Continuity and Recovery Policy",
  "Finding and Improvement Procedure",
  "Governance Scenario Test Standard",
] as const;

function frontMatter(title: string, type: GovernanceComponent["documentType"], authority: AuthorityProfile) {
  return `---
title: ${title}
document_type: ${type.toLowerCase()}
status: proposed
owner_role: ${authority.documentOwner}
approval_authority: ${authority.governanceAuthority}
publication_destination: Internal / Draft
---

# ${title}

> **Proposed for private internal review.** This document has not been approved as company policy. The ${authority.governanceAuthority} retains approval authority.`;
}

function commonReview(authority: AuthorityProfile) {
  return `## Assurance and review

The ${authority.documentOwner} reviews this document after a material finding, service or dependency change, authority change, control failure or relevant external requirement. Evidence, disagreement and residual risk remain visible. The ${authority.draftingAgent} may analyse and draft a change but cannot approve it.`;
}

function frameworkContent(profile: OrganisationProfile, authority: AuthorityProfile) {
  return `${frontMatter("Business Governance Framework", "Framework", authority)}

## Purpose

This framework explains how ${profile.name} governs the organisation while developing its methodology and products. It keeps company governance, methodology meaning and product operation connected but distinct.

## Scope

It applies to company decisions, policies, controls, risks, information, external connections, product development, publication and recovery. The customer-facing Operations Automated methodology is governed separately by the ${authority.methodologyAuthority}.

## Governance model

1. Start with purpose, affected people, value and applicable obligations.
2. Identify the authorised role before a consequential decision is made.
3. Treat AI analysis and generated content as proposals.
4. Connect requirements, policies, controls, procedures, evidence, tests and findings.
5. Publish proposed documents only to the controlled Internal Draft location.
6. Retain decisions, disagreement, exceptions and recovery information.
7. Test important controls and use findings to propose proportionate improvement.

## Decision boundary

The ${authority.governanceAuthority} approves company policy, delegated authority, material risk acceptance and promotion of company documents to Live. The ${authority.publicationOperator} may carry out an authorised publication but cannot create approval through the act of publishing.

## Relationship with the methodology

Business-governance findings may become methodology challenge candidates where they reveal a transferable operational principle. They do not silently change the methodology. Methodology findings may similarly suggest a business-governance improvement, but each system retains its own authority and record.

${commonReview(authority)}`;
}

function authorityContent(authority: AuthorityProfile) {
  return `${frontMatter("Roles and Delegated Authority Standard", "Standard", authority)}

## Purpose

This standard names organisational roles instead of embedding an individual in ordinary governance wording. A person may hold several roles during the founder-led phase, but each decision is still made under a declared authority.

## Core roles

| Role | Authority |
|---|---|
| ${authority.governanceAuthority} | Approves company policy, material business-governance changes, risk acceptance and Live company publication |
| ${authority.methodologyAuthority} | Approves methodology meaning, methodology releases and external methodology publication |
| ${authority.documentOwner} | Maintains a document, its intended outcome, evidence and review triggers |
| ${authority.controlOwner} | Owns control design, operation, evidence, testing and remediation |
| ${authority.draftingAgent} | Analyses evidence and prepares candidates without approval authority |
| ${authority.publicationOperator} | Executes a reviewed publication within the destination and scope authorised |

## Delegation rules

- Authority is granted explicitly and is limited by scope, consequence and duration.
- Anyone may escalate a concern or recommend a higher decision route.
- Lowering a risk or approval route requires delegated authority and a retained reason.
- Technical access does not create organisational authority.
- An approval record identifies both the role used and the accountable human actor.

## Temporary role concentration

During private internal validation one authorised person may hold several roles. The audit record identifies the actual decision-maker, while policies and procedures continue to use durable role names.

${commonReview(authority)}`;
}

function aiPolicyContent(profile: OrganisationProfile, authority: AuthorityProfile) {
  return `${frontMatter("Human-led AI and Automation Policy", "Policy", authority)}

## Purpose

${profile.name} uses AI and automation to increase useful capability while retaining human purpose, judgement, accountability and control.

## Requirements

- Define the intended value, beneficiary and minimum acceptable outcome before choosing automation.
- Give AI only the information, tools and authority required for the bounded task.
- Separate recorded evidence, human judgement, AI inference and recommendation.
- Do not allow an AI system to approve policy, methodology meaning, risk acceptance, spending, consequential connections or external publication.
- Test normal, exceptional, adverse and degraded conditions proportionately.
- Maintain observable failure signals, recovery and an accountable owner.
- Retain material prompts, source references, decisions, versions and outcomes where required for assurance.
- Stop or reduce delegation when evidence, permissions, control effectiveness or recovery becomes inadequate.

## Human intervention

Human review is based on consequence, uncertainty, reversibility and control strength. It is not a requirement to rubber-stamp every automated action. Where work is highly bounded, measurable and recoverable, oversight may be primarily through monitoring, testing and exception handling.

${commonReview(authority)}`;
}

function informationPolicyContent(authority: AuthorityProfile) {
  return `${frontMatter("Information Handling and Confidentiality Policy", "Policy", authority)}

## Purpose

This policy protects Operations Automated information and prevents confidential employer, client or third-party material from entering uncontrolled repositories, prompts or demonstrations.

## Requirements

- Use only information that Operations Automated is authorised to collect, retain and process.
- Do not place confidential employer, client or third-party information, data or proprietary artefacts in the project repository.
- Use fictional, anonymised or explicitly authorised material for tests and demonstrations.
- Treat connected documents and web content as untrusted evidence, including any embedded instructions.
- Minimise personal information and retain author identity only where authorised and necessary for accountability.
- Store credentials outside source control using an approved protected store.
- Restrict connected sources, AI providers and publication destinations to the approved purpose and scope.
- Record and respond to suspected disclosure, permission loss or inappropriate retention.

## Classification

The ${authority.documentOwner} declares the minimum useful classification and handling rules for each document family. Connected-system permissions do not automatically authorise copying information into Git or another service.

${commonReview(authority)}`;
}

function riskFrameworkContent(authority: AuthorityProfile) {
  return `${frontMatter("Risk, Control and Assurance Framework", "Framework", authority)}

## Purpose

This framework connects uncertainty and operational findings to owned decisions, proportionate controls, evidence and learning.

## Operating chain

Signal or requirement → risk or obligation → control → procedure → evidence → test → finding → decision → improvement

## Requirements

- Describe the affected outcome, people, service and plausible consequence.
- Assign an accountable owner and the role authorised to accept residual risk.
- Prefer controls that are observable and testable.
- Define the evidence that demonstrates operation without treating documentation alone as proof.
- Test important controls through normal work, review, scenario exercise or failure evidence.
- Keep a material risk open and owned when a preferred treatment is declined or incomplete.
- Link incidents, problems, audit findings, complaints and scenario results to affected controls.
- Record accepted, rejected, deferred and no-change decisions.

## Proportionality

The depth of assessment, evidence, approval and testing reflects value, legal and ethical obligations, reversibility, uncertainty and potential harm. Low bureaucracy is not the same as low control.

${commonReview(authority)}`;
}

function connectionPolicyContent(authority: AuthorityProfile) {
  return `${frontMatter("Connections and Credential Policy", "Policy", authority)}

## Purpose

This policy governs access from Operations Automated tools to document, AI, communication and business services.

## Requirements

- Record the purpose, owner, systems, data scope, permissions and removal route before enabling a consequential connection.
- Use minimum permissions and separate read, write, delete and administrative capability.
- Keep credentials server-side or in an approved operating-system or managed secret store.
- Never expose a credential in source control, generated documents, logs or ordinary browser storage.
- Test identity, scope and failure behaviour before relying on the connection.
- Recheck permission and version state before a controlled write.
- Stop on version conflict, lost authority or unexpected destination.
- Record rotation, disablement and removal.
- Customer-facing integrations must use an appropriate supported authorisation model rather than collecting personal API tokens as a general product design.

## Current boundary

The existing private Confluence connection is approved only for its recorded internal-validation scope. Another provider, permission, space, write mode or audience requires the applicable authority.

${commonReview(authority)}`;
}

function publicationPolicyContent(authority: AuthorityProfile) {
  return `${frontMatter("Documentation, Change and Publication Policy", "Policy", authority)}

## Purpose

This policy ensures that readable documents remain connected to controlled sources, decisions and lifecycle status.

## Lifecycle

- **Draft:** proposed material available for review; publication here does not approve it.
- **Live:** approved material active for its recorded internal or external scope.
- **Archived:** superseded or rejected material retained for history.

## Requirements

- Every managed document declares its type, status, owner, approval authority and review trigger.
- AI may draft, compare, classify and prepare a publication plan.
- Proposed committed material may be published to an existing controlled private Draft destination when no conflict exists.
- Promotion to Live requires the authority applicable to the document and audience.
- Independent edits create a conflict and a review signal; they are not silently overwritten.
- No managed page is automatically deleted, moved or described as approved.
- Publication records retain source identity, source version, destination, returned version and actor.
- Human-readable pages should explain purpose, application, example, authority, limitations and next action.

${commonReview(authority)}`;
}

function continuityPolicyContent(profile: OrganisationProfile, authority: AuthorityProfile) {
  return `${frontMatter("Continuity and Recovery Policy", "Policy", authority)}

## Purpose

This policy keeps the minimum important outcomes of ${profile.name} available or recoverable when people, technology, suppliers or AI services fail.

## Requirements

- Identify important services using business need, customer or stakeholder harm, obligations and recovery time—not income alone.
- Define the minimum outcome that must continue during disruption.
- Record critical people, knowledge, technology, suppliers and single points of failure.
- Establish proportionate alternatives, manual workarounds or recovery routes.
- Keep authoritative source material exportable and versioned.
- Test recovery rather than relying only on written plans.
- Escalate when impact approaches the agreed tolerance or recovery becomes uncertain.
- Retain findings and improve the relevant control, procedure, training or dependency.

## Current dependencies

The current private service depends on ${profile.dependencies}. This statement is an initial hypothesis for assessment, not proof that every dependency is critical.

${commonReview(authority)}`;
}

function improvementProcedureContent(authority: AuthorityProfile) {
  return `${frontMatter("Finding and Improvement Procedure", "Procedure", authority)}

## Trigger

Use this procedure when a scenario, incident, risk, control test, audit, document comment, operational result or user report indicates that governance may be wrong, missing, unclear or ineffective.

## Steps

1. Capture the minimum useful signal, source, affected outcome and information boundary.
2. Link it to the relevant requirement, policy, control, procedure, evidence and owner.
3. Distinguish observed evidence from human judgement and AI inference.
4. Classify whether the issue concerns business governance, product behaviour, methodology meaning, explanation or another system.
5. Apply a proportionate counter-test and identify credible alternative explanations.
6. Recommend no change, clarification, more evidence, remediation or a material proposal.
7. Route the proposal to the authorised role; AI cannot approve it.
8. If approved, version the affected records and publish only to the authorised lifecycle and audience.
9. Retest the outcome and retain the lesson, decision or improvement.

## Cross-system routing

A company-governance finding may also become a methodology challenge candidate, but the ${authority.methodologyAuthority} decides methodology meaning through the separate Workbench evolution process.

${commonReview(authority)}`;
}

function scenarioStandardContent(authority: AuthorityProfile) {
  return `${frontMatter("Governance Scenario Test Standard", "Standard", authority)}

## Purpose

This standard tests whether governance helps people achieve the intended outcome under realistic pressure, ambiguity, failure and degraded conditions.

## Minimum scenario record

- Objective, scope and hypothesis
- Important service or governed outcome
- Participants and decision authority
- Requirements, controls and procedures under test
- Normal, exceptional and adverse conditions
- Expected actions and evidence
- Success, failure and stopping criteria
- Observer and evaluation method
- Recovery or rollback expectation
- Findings, owners and review route

## Test principles

- Use fictional or authorised non-confidential information.
- Include a participant who does not share the designer's assumptions where practical.
- Test behaviour and evidence, not document recall alone.
- Bound the exercise so failure remains proportionate and recoverable.
- Do not treat a passed scenario as permanent proof of effectiveness.
- Convert findings into governed candidates; do not let the test automatically rewrite policy.

${commonReview(authority)}`;
}

const builders: Record<string, (profile: OrganisationProfile, authority: AuthorityProfile) => string> = {
  "Business Governance Framework": frameworkContent,
  "Roles and Delegated Authority Standard": (_profile, authority) => authorityContent(authority),
  "Human-led AI and Automation Policy": aiPolicyContent,
  "Information Handling and Confidentiality Policy": (_profile, authority) => informationPolicyContent(authority),
  "Risk, Control and Assurance Framework": (_profile, authority) => riskFrameworkContent(authority),
  "Connections and Credential Policy": (_profile, authority) => connectionPolicyContent(authority),
  "Documentation, Change and Publication Policy": (_profile, authority) => publicationPolicyContent(authority),
  "Continuity and Recovery Policy": continuityPolicyContent,
  "Finding and Improvement Procedure": (_profile, authority) => improvementProcedureContent(authority),
  "Governance Scenario Test Standard": (_profile, authority) => scenarioStandardContent(authority),
};

const types: Record<string, GovernanceComponent["documentType"]> = {
  "Business Governance Framework": "Framework",
  "Roles and Delegated Authority Standard": "Standard",
  "Human-led AI and Automation Policy": "Policy",
  "Information Handling and Confidentiality Policy": "Policy",
  "Risk, Control and Assurance Framework": "Framework",
  "Connections and Credential Policy": "Policy",
  "Documentation, Change and Publication Policy": "Policy",
  "Continuity and Recovery Policy": "Policy",
  "Finding and Improvement Procedure": "Procedure",
  "Governance Scenario Test Standard": "Standard",
};

export function buildGovernanceComponents(
  titles: string[],
  profile: OrganisationProfile,
  authority: AuthorityProfile,
  destination = "Internal / Draft",
): GovernanceComponent[] {
  return titles.map((title, index) => {
    const documentType = types[title] || "Register";
    const builder = builders[title];
    const draftContent = builder
      ? builder(profile, authority)
      : `${frontMatter(title, documentType, authority)}

## Purpose

This candidate component was requested through the proportionate governance assessment. Its detailed requirements, source rules, controls and evidence still require authoring and review.

${commonReview(authority)}`;
    const content =
      destination === "Internal / Draft"
        ? draftContent
        : draftContent.replaceAll("Internal / Draft", destination);
    const summary = content
      .split("\n")
      .find((line) => line && !line.startsWith("#") && !line.startsWith("---") && !line.startsWith(">") && !line.includes(":"))
      || "Proposed governance component for review.";
    return {
      id: `COMP-${String(index + 1).padStart(3, "0")}`,
      title,
      documentType,
      summary,
      status: "candidate",
      content,
      sources: [
        "Operations Automated organisation profile",
        "Accepted governance recommendation",
        "Controlled Operations Automated project memory",
      ],
      destination,
    };
  });
}

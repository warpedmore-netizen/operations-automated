const clone = value => structuredClone(value);
const now = () => new Date().toISOString();

export function audit(state, actor, action, objectType, objectId, reason, previousValue = null, newValue = null) {
  state.auditEvents.push({ id: `AUD-IM-${String(state.auditEvents.length + 1).padStart(3, "0")}`, actor, action, objectType, objectId, timestamp: now(), previousValue, newValue, reason });
}

export function acceptCandidateFinding(input, actor) {
  if (!actor?.trim()) throw new Error("A named human reviewer is required");
  const state = clone(input);
  const finding = state.findings.find(item => item.id === "FIND-IM-008");
  if (!finding) throw new Error("Finding not found");
  finding.status = "accepted";
  finding.reviewDecision = { actor, decision: "accepted", decidedAt: now() };
  const suggestion = state.aiSuggestions.find(item => item.id === finding.aiSuggestionId);
  if (suggestion) suggestion.reviewDecision = "accepted";
  audit(state, actor, "candidate-finding-accepted", "Finding", finding.id, "Human accepted AI-labelled candidate");
  return state;
}

export function createProposal(input, actor) {
  if (!actor?.trim()) throw new Error("A named human requester is required");
  const state = clone(input);
  const finding = state.findings.find(item => item.id === "FIND-IM-008");
  if (finding?.status !== "accepted") throw new Error("A human must accept the finding first");
  if (!state.changeProposals.some(item => item.id === "CHG-IM-024")) {
    state.changeProposals.push({ id: "CHG-IM-024", title: "Make regulatory-impact escalation mandatory", rationale: "Scenario evidence showed permissive wording delayed notification.", originatingFindingIds: [finding.id], affectedObjectIds: ["POL-IM-003", "PROC-IM-007"], proposedChanges: [{ objectId: "POL-IM-003", field: "text", before: "The Incident Lead should notify Risk and Compliance where regulatory impact may be material.", after: "The Incident Lead must notify Risk and Compliance within 15 minutes of identifying potential regulatory impact." }, { objectId: "PROC-IM-007", field: "steps", before: "Consider notifying Risk and Compliance.", after: "Notify Risk and Compliance within 15 minutes and record acknowledgement in the incident log." }], riskAssessment: "Stronger clarity; risk of unnecessary escalation is accepted for the fictional high-impact scenario.", requestedBy: actor, reviewers: ["Incident Management Owner", "Risk and Compliance Owner"], downstreamImpacts: ["TEST-IM-015", "Incident Management Policy", "Incident Management Procedure"], approvalStatus: "pending", createdAt: now(), approvedAt: null });
    finding.changeProposalIds = ["CHG-IM-024"];
    audit(state, actor, "change-proposal-created", "ChangeProposal", "CHG-IM-024", "Accepted finding converted into governed proposal");
  }
  return state;
}

export function decideProposal(input, actor, decision, comments = "", role = "Human reviewer") {
  if (!actor?.trim() || actor.toLowerCase().includes("ai")) throw new Error("A named human approver is required; AI cannot approve");
  if (!["approved", "rejected", "changes-requested"].includes(decision)) throw new Error("Invalid decision");
  const state = clone(input);
  const proposal = state.changeProposals.find(item => item.id === "CHG-IM-024");
  if (!proposal) throw new Error("Proposal not found");
  proposal.approvalStatus = decision;
  proposal.approvedAt = decision === "approved" ? now() : null;
  if (!role?.trim()) throw new Error("The human reviewer's role is required");
  state.approvals.push({ id: `APR-IM-${String(state.approvals.length + 1).padStart(3, "0")}`, objectType: "ChangeProposal", objectId: proposal.id, approver: actor, role, decision, comments, decidedAt: now() });
  audit(state, actor, `proposal-${decision}`, "ChangeProposal", proposal.id, comments || "Human governance decision");
  return state;
}

export function createRelease(input, actor) {
  if (!actor?.trim() || actor.toLowerCase().includes("ai")) throw new Error("A named human release operator is required; AI cannot release");
  const state = clone(input);
  const proposal = state.changeProposals.find(item => item.id === "CHG-IM-024");
  if (proposal?.approvalStatus !== "approved") throw new Error("A release cannot include an unapproved proposal");
  if (state.releases.some(item => item.id === "REL-IM-002")) return state;
  for (const change of proposal.proposedChanges) {
    const collection = change.objectId.startsWith("POL") ? state.policyStatements : state.procedures;
    const current = collection.find(item => item.id === change.objectId && item.status === "approved");
    if (!current) throw new Error(`Approved object ${change.objectId} not found`);
    current.status = "superseded";
    const next = clone(current);
    next.version = String(Number(current.version) + 1);
    next.status = "approved";
    next.effectiveFrom = "2026-08-01";
    next.supersedesVersion = current.version;
    next[change.field] = change.after;
    collection.push(next);
  }
  state.scenarioTests.push({ ...clone(state.scenarioTests[0]), id: "TEST-IM-015", title: "Regulatory escalation retest", status: "planned", controlsUnderTest: ["CTRL-IM-012"], expectedActions: ["Notify Risk and Compliance within 15 minutes and record acknowledgement"] });
  state.releases.push({ id: "REL-IM-002", version: "1.1", title: "Mandatory regulatory-impact escalation", includedChangeProposalIds: [proposal.id], effectiveDate: "2026-08-01", releaseNotes: "Clarifies mandatory Risk and Compliance notification and adds a validation scenario.", approvedBy: actor, publishedAt: now(), previousReleaseId: "REL-IM-001", additionalTestingRequired: true });
  audit(state, actor, "release-created", "Release", "REL-IM-002", "Approved proposal released as new immutable object versions");
  return state;
}

export function impactAnalysis(state, objectId) {
  const linked = state.links.filter(link => link.from === objectId || link.to === objectId);
  const upstream = linked.filter(link => link.to === objectId).map(link => link.from);
  const downstream = linked.filter(link => link.from === objectId).map(link => link.to);
  const relatedFindings = state.findings.filter(item => item.affectedObjects.includes(objectId)).map(item => item.id);
  return { objectId, upstream, downstream, documents: ["Incident Management Policy", "Incident Management Procedure", "Regulatory traceability report"], testsToRepeat: state.scenarioTests.filter(test => test.policyIds?.includes(objectId) || test.procedureIds?.includes(objectId)).map(test => test.id), owners: ["Incident Management Owner", "Risk and Compliance Owner"], relatedFindings };
}

export function traceToObligation(state, findingId) {
  const finding = state.findings.find(item => item.id === findingId);
  if (!finding) return [];
  const visited = new Set(finding.affectedObjects);
  let changed = true;
  while (changed) {
    changed = false;
    for (const link of state.links) if (visited.has(link.to) && !visited.has(link.from)) { visited.add(link.from); changed = true; }
  }
  return [...visited].filter(id => id.startsWith("OBL-"));
}

export function generateDocuments(state) {
  const approvedPolicies = state.policyStatements.filter(item => item.status === "approved");
  const approvedProcedures = state.procedures.filter(item => item.status === "approved");
  const released = state.releases.at(-1);
  const header = (title, version, status, owner, related) => `# ${title}\n\n- Document owner: ${owner}\n- Version: ${version}\n- Approval status: ${status}\n- Effective date: ${released.effectiveDate}\n- Review date: 2027-02-01\n- Related objects: ${related.join(", ")}\n- Generated: ${released.publishedAt}\n\n> Generated view. Structured approved records are canonical. Fictional demonstration content; not regulatory advice.\n`;
  return {
    policy: header("Incident Management Policy", released.version, "approved", "Incident Management Owner", approvedPolicies.map(x => x.id)) + approvedPolicies.map(x => `\n## ${x.section} ${x.heading}\n\n${x.text}\n`).join("") + `\n## Change history\n\n- ${released.version}: ${released.releaseNotes}\n`,
    procedure: header("Incident Management Procedure", released.version, "approved", "Incident Management Owner", approvedProcedures.map(x => x.id)) + approvedProcedures.map(x => `\n## ${x.title}\n\n${Array.isArray(x.steps) ? x.steps.join("\n") : x.steps}\n`).join(""),
    releaseNotes: header("Release notes", released.version, "approved", "Incident Management Owner", released.includedChangeProposalIds) + `\n${released.releaseNotes}\n\nAdditional testing required: ${released.additionalTestingRequired ? "Yes" : "No"}.\n`
  };
}

export class MockAIProvider {
  analyseScenario(state) {
    return clone(state.aiSuggestions[0]);
  }
  applySuggestion() { throw new Error("AI suggestions cannot directly update controlled records"); }
}

export class MockConfluenceAdapter { publish(document) { return { logged: true, operation: "publish", blocked: !document.includes("Approval status: approved") }; } }
export class MockJiraAdapter { createFinding(finding) { return { logged: true, operation: "create-finding", objectId: finding.id }; } }

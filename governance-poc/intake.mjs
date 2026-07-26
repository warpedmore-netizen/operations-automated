import { audit } from "./domain.mjs";

const clone = value => structuredClone(value);
const now = () => new Date().toISOString();
const levels = { administrative: 1, minor: 2, material: 3, fundamental: 4 };

export const intakeProfiles = {
  word: { input: "file", reference: "filename", structure: "headings-paragraphs-tables", status: "mock-extractor", futureRequirement: "DOCX parser" },
  googleDocs: { input: "remote-reference", reference: "document-id", structure: "tabs-headings-paragraphs-tables", status: "mock-connector", futureRequirement: "authorised Google Docs connection" },
  confluence: { input: "remote-reference", reference: "page-id", structure: "space-ancestors-page-body", status: "mock-connector", futureRequirement: "authorised Confluence connection" },
  notion: { input: "remote-reference", reference: "page-id", structure: "workspace-parent-page-properties-blocks", status: "mock-connector", futureRequirement: "authorised Notion connection" },
  text: { input: "direct", reference: "optional", structure: "plain-text-lines", status: "available", futureRequirement: null },
  guided: { input: "answers", reference: "none", structure: "question-set", status: "available", futureRequirement: null }
};

const universalQuestions = [
  ["owner", "Who owns this document and its operational meaning?"],
  ["purpose", "What outcome is this document intended to govern?"],
  ["approvalAuthority", "Which role or forum approves material changes?"],
  ["reviewCycle", "What review cycle or evidence-based trigger applies?"],
  ["effectiveDate", "When does the controlled content take effect?"],
  ["classification", "What information classification applies?" ]
];

function candidateRecords(content) {
  const lines = content.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
  const records = [];
  for (const line of lines.slice(0, 30)) {
    if (/^(\d+[.)]|step\s+\d+)/i.test(line)) records.push({ objectType: "ProcedureStep", text: line, confidence: "medium" });
    else if (/\b(must|shall|should|required)\b/i.test(line)) records.push({ objectType: "PolicyStatement", text: line, confidence: /\b(must|shall|required)\b/i.test(line) ? "high" : "medium" });
  }
  if (!records.length && content.trim()) records.push({ objectType: "DocumentSection", text: lines.slice(0, 3).join(" "), confidence: "low" });
  return records;
}

export function createIntake(input, { intakeRoute = "existing", documentType = "other", sourceType, title, reference = "", content = "", actor }) {
  const state = clone(input);
  if (!actor?.trim() || !title?.trim()) throw new Error("A named owner and document title are required");
  if (!['new', 'existing'].includes(intakeRoute)) throw new Error("Choose whether to create or import a document");
  const effectiveSourceType = intakeRoute === "new" ? "guided" : sourceType;
  const profile = intakeProfiles[effectiveSourceType];
  if (!profile) throw new Error("Unsupported intake source");
  if (profile.input === "remote-reference" && !reference.trim()) throw new Error(`${effectiveSourceType} requires a document reference`);
  if (profile.input === "file" && !reference.trim()) throw new Error("Word intake requires the source filename");
  state.intakes ??= []; state.intakeQuestions ??= []; state.intakeCandidates ??= [];
  const id = `INTAKE-${String(state.intakes.length + 1).padStart(3, "0")}`;
  state.intakes.push({ id, intakeRoute, documentType, sourceType: effectiveSourceType, title, reference, sourceProfile: clone(profile), contentBoundary: content ? "fictional demonstration text supplied" : intakeRoute === "new" ? "content will be created through guided answers" : "no content retrieved in mock mode", createdBy: actor, createdAt: now(), status: "questions-required" });
  for (const [key, question] of universalQuestions) state.intakeQuestions.push({ id: `Q-${String(state.intakeQuestions.length + 1).padStart(3, "0")}`, intakeId: id, key, question, reason: "required-governance-baseline", status: "open", answer: null });
  if (!content.trim() && intakeRoute === "existing") state.intakeQuestions.push({ id: `Q-${String(state.intakeQuestions.length + 1).padStart(3, "0")}`, intakeId: id, key: "sourceContent", question: `Provide or authorise retrieval of the ${effectiveSourceType} content.`, reason: "source-content-unavailable", status: "open", answer: null });
  if (/\bshould\b/i.test(content)) state.intakeQuestions.push({ id: `Q-${String(state.intakeQuestions.length + 1).padStart(3, "0")}`, intakeId: id, key: "mandatoryMeaning", question: "Does ‘should’ express discretion or a mandatory expectation?", reason: "ambiguous-mandatory-language", status: "open", answer: null });
  if (!/evidence|record|log/i.test(content) && content.trim()) state.intakeQuestions.push({ id: `Q-${String(state.intakeQuestions.length + 1).padStart(3, "0")}`, intakeId: id, key: "evidence", question: "What evidence demonstrates that these requirements were followed?", reason: "evidence-not-visible", status: "open", answer: null });
  for (const candidate of candidateRecords(content)) state.intakeCandidates.push({ id: `CAND-${String(state.intakeCandidates.length + 1).padStart(3, "0")}`, intakeId: id, ...candidate, status: "suggested", provenance: { intakeRoute, documentType, sourceType: effectiveSourceType, reference, title }, generatedBy: "mock-smart-extractor-v1", reviewDecision: null });
  audit(state, actor, "document-intake-created", "DocumentIntake", id, `${documentType} via ${effectiveSourceType}; suggestions require human review`);
  return state;
}

export function answerIntakeQuestion(input, questionId, answer, actor) {
  const state = clone(input); const question = state.intakeQuestions?.find(item => item.id === questionId);
  if (!question || !answer?.trim() || !actor?.trim()) throw new Error("Question, answer and named respondent are required");
  question.answer = answer; question.status = "answered"; question.answeredBy = actor; question.answeredAt = now();
  audit(state, actor, "intake-question-answered", "IntakeQuestion", questionId, question.reason);
  return state;
}

export function reviewCandidate(input, candidateId, decision, actor, amendedText = "") {
  const state = clone(input); const candidate = state.intakeCandidates?.find(item => item.id === candidateId);
  if (!candidate || !["accepted", "rejected", "amended"].includes(decision) || !actor?.trim()) throw new Error("Valid candidate review and named reviewer are required");
  if (decision === "amended" && !amendedText.trim()) throw new Error("Amended text is required");
  candidate.status = decision === "amended" ? "accepted" : decision; candidate.reviewDecision = { decision, actor, decidedAt: now(), originalText: candidate.text };
  if (decision === "amended") candidate.text = amendedText;
  audit(state, actor, `intake-candidate-${decision}`, candidate.objectType, candidate.id, "Human review of extracted suggestion");
  return state;
}

function answersFor(state, intakeId) { return Object.fromEntries(state.intakeQuestions.filter(item => item.intakeId === intakeId && item.status === "answered").map(item => [item.key, item.answer])); }

export function generateGuidedCandidates(input, intakeId, actor) {
  const state = clone(input); const intake = state.intakes?.find(item => item.id === intakeId);
  if (!intake || intake.intakeRoute !== "new" || !actor?.trim()) throw new Error("A guided intake and named human operator are required");
  const questions = state.intakeQuestions.filter(item => item.intakeId === intakeId);
  const unansweredBaseline = questions.filter(item => item.reason === "required-governance-baseline" && item.status !== "answered");
  if (unansweredBaseline.length) throw new Error("Answer every required governance question before generating candidates");
  if (state.intakeCandidates.some(item => item.intakeId === intakeId)) return state;
  const answers = answersFor(state, intakeId); const sourceQuestionIds = questions.filter(item => item.status === "answered").map(item => item.id);
  const suggestions = [
    { objectType: "RoleAssignment", text: `${answers.owner} owns the ${intake.title} and its operational meaning.`, fields: { owner: answers.owner, responsibility: `Own ${intake.title}` } },
    { objectType: "PolicyStatement", text: `${answers.owner} must ensure that ${answers.purpose}`, fields: { mandatoryLevel: "mandatory", owner: answers.owner, rationale: answers.purpose } },
    { objectType: "Control", text: `The document and its supporting evidence must be reviewed ${answers.reviewCycle}.`, fields: { owner: answers.owner, frequency: answers.reviewCycle, objective: answers.purpose } },
    { objectType: "ProcedureStep", text: `Record evidence of the governed activity and route material changes to ${answers.approvalAuthority}.`, fields: { sequence: 1, owner: answers.owner } },
    { objectType: "EvidenceRequirement", text: `Retain the approval decision, effective date ${answers.effectiveDate}, and evidence under classification ${answers.classification}.`, fields: { classification: answers.classification, effectiveDate: answers.effectiveDate } }
  ];
  for (const suggestion of suggestions) state.intakeCandidates.push({ id: `CAND-${String(state.intakeCandidates.length + 1).padStart(3, "0")}`, intakeId, ...suggestion, confidence: "medium", status: "suggested", provenance: { organisation: "Northstar Digital Services", questionIds: sourceQuestionIds, documentType: intake.documentType }, generatedBy: "mock-guided-author-v1", reviewDecision: null });
  intake.status = "candidate-review"; audit(state, actor, "guided-candidates-generated", "DocumentIntake", intakeId, "Suggestions generated from answered questions; human review required");
  return state;
}

const prefixes = { RoleAssignment: "ROLE", PolicyStatement: "POL", Control: "CTRL", ProcedureStep: "STEP", EvidenceRequirement: "EVIDREQ", DocumentSection: "SECTION" };

export function buildDraftGraph(input, intakeId, actor) {
  const state = clone(input); const intake = state.intakes?.find(item => item.id === intakeId); const candidates = state.intakeCandidates?.filter(item => item.intakeId === intakeId) ?? [];
  if (!intake || !actor?.trim()) throw new Error("A document intake and named human builder are required");
  if (!candidates.length || candidates.some(item => item.status === "suggested")) throw new Error("Review every candidate before building the draft graph");
  const accepted = candidates.filter(item => item.status === "accepted");
  if (!accepted.length) throw new Error("At least one candidate must be accepted");
  state.draftObjects ??= []; state.draftLinks ??= []; state.draftDocuments ??= [];
  const created = accepted.map(candidate => {
    const prefix = prefixes[candidate.objectType] ?? "OBJ"; const id = `${prefix}-DRAFT-${String(state.draftObjects.length + 1).padStart(3, "0")}`;
    const object = { id, intakeId, objectType: candidate.objectType, title: candidate.objectType, text: candidate.text, fields: candidate.fields ?? {}, status: "draft", sourceCandidateId: candidate.id, provenance: clone(candidate.provenance), createdBy: actor, createdAt: now() };
    state.draftObjects.push(object); return object;
  });
  const policy = created.find(item => item.objectType === "PolicyStatement"), control = created.find(item => item.objectType === "Control"), role = created.find(item => item.objectType === "RoleAssignment"), step = created.find(item => item.objectType === "ProcedureStep"), evidence = created.find(item => item.objectType === "EvidenceRequirement");
  const connect = (from, to, type) => { if (from && to) state.draftLinks.push({ from: from.id, to: to.id, type, status: "draft", intakeId }); };
  connect(role, policy, "owns"); connect(control, policy, "expressed-through"); connect(control, step, "implemented-by"); connect(step, evidence, "produces");
  const preview = `# ${intake.title}\n\n- Organisation: Northstar Digital Services\n- Document type: ${intake.documentType}\n- Status: draft — not approved\n- Owner: ${answersFor(state, intakeId).owner}\n\n${created.map(item => `## ${item.objectType}\n\n${item.text}`).join("\n\n")}\n`;
  state.draftDocuments.push({ id: `DOC-DRAFT-${String(state.draftDocuments.length + 1).padStart(3, "0")}`, intakeId, title: intake.title, documentType: intake.documentType, status: "draft", objectIds: created.map(item => item.id), preview, generatedAt: now() });
  intake.status = "draft-assembled"; audit(state, actor, "connected-draft-assembled", "DocumentIntake", intakeId, `${created.length} accepted candidates assembled; remains unapproved`);
  return state;
}

export function recommendChangeClass({ changedFields = [], description = "" }) {
  const signal = `${changedFields.join(" ")} ${description}`.toLowerCase();
  if (/purpose|risk appetite|regulatory interpretation|operating model/.test(signal)) return "fundamental";
  if (/responsibility|owner|mandatory|control design|risk treatment/.test(signal)) return "material";
  if (/criteria|evidence|clarification|procedure step/.test(signal)) return "minor";
  return "administrative";
}

export function classifyChange(input, { title, changedFields = [], description = "", actor, role, requestedClass, justification = "" }) {
  const state = clone(input); state.changeAssessments ??= [];
  if (!actor?.trim() || !role?.trim() || !title?.trim()) throw new Error("Title, actor and role are required");
  const recommendedClass = recommendChangeClass({ changedFields, description }); const selectedClass = requestedClass || recommendedClass;
  if (!levels[selectedClass]) throw new Error("Invalid change class");
  const direction = levels[selectedClass] > levels[recommendedClass] ? "escalated" : levels[selectedClass] < levels[recommendedClass] ? "downgraded" : "accepted";
  if (direction === "downgraded") {
    const authority = state.authorityRoles?.find(item => item.role === role);
    const permitted = authority?.downgradeTransitions?.includes(`${recommendedClass}:${selectedClass}`);
    if (!permitted) throw new Error(`${role} is not authorised to downgrade ${recommendedClass} to ${selectedClass}`);
    if (!justification.trim()) throw new Error("A downgrade requires recorded justification");
  }
  const ring = state.approvalRings.find(item => item.level === levels[selectedClass]);
  const notificationRules = [{ audience: "Document owner", action: "approve", acknowledgementRequired: true }];
  if (levels[selectedClass] >= 2) notificationRules.push({ audience: "Governance forum", action: levels[selectedClass] === 2 ? "notify" : "approve", acknowledgementRequired: levels[selectedClass] >= 3 });
  if (levels[selectedClass] >= 3) notificationRules.push({ audience: "Executive forum", action: levels[selectedClass] === 3 ? "notify" : "approve", acknowledgementRequired: levels[selectedClass] === 4 });
  const assessment = { id: `ASSESS-${String(state.changeAssessments.length + 1).padStart(3, "0")}`, title, changedFields, description, recommendedClass, selectedClass, direction, actor, role, justification, approvalRing: ring.name, notificationRules, createdAt: now() };
  state.changeAssessments.push(assessment); audit(state, actor, `change-class-${direction}`, "ChangeAssessment", assessment.id, justification || `${recommendedClass} recommendation retained`);
  return state;
}

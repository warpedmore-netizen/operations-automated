import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

export const REQUEST_CLASSIFICATIONS = Object.freeze([
  "ordinary-answer",
  "methodology-application",
  "methodology-challenge",
  "methodology-clarification",
  "methodology-change-candidate",
  "workbench-product-change",
  "governance-tool-product-change",
  "defect-corrective-change",
  "research-evidence-request",
  "operational-work-item",
  "idea-later-consideration",
  "cross-product-dependency",
  "purpose-boundary-change",
  "new-project-candidate",
  "urgent-security-safety-legal-authority-review",
  "no-action-required"
]);

export const BOUNDARY_RECOMMENDATIONS = Object.freeze([
  "remain-current-product",
  "bounded-module",
  "shared-capability",
  "create-separate-project",
  "retain-ideas-space",
  "defer-pending-evidence",
  "reject-purpose-inconsistent"
]);

const CURRENT_PROMPT_STATUSES = new Set(["approved", "current"]);

function readText(repositoryRoot, path) {
  const fullPath = resolve(repositoryRoot, path);
  return existsSync(fullPath) ? readFileSync(fullPath, "utf8") : null;
}

function readJsonDocument(repositoryRoot, path) {
  const text = readText(repositoryRoot, path);
  if (text === null) throw new Error(`Required control registry is missing: ${path}`);
  return JSON.parse(text);
}

function frontMatter(text = "") {
  if (!String(text).startsWith("---")) return {};
  const end = String(text).indexOf("\n---", 3);
  if (end < 0) return {};
  const value = {};
  for (const line of String(text).slice(3, end).split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 1 || /^\s/.test(line)) continue;
    const key = line.slice(0, separator).trim();
    let item = line.slice(separator + 1).trim();
    item = item.replace(/^(['"])(.*)\1$/, "$2");
    value[key] = item;
  }
  return value;
}

function decisionIds(repositoryRoot) {
  const root = resolve(repositoryRoot, "decisions");
  if (!existsSync(root)) return new Set();
  return new Set(readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => frontMatter(readFileSync(resolve(root, entry.name), "utf8")).id)
    .filter(Boolean));
}

function promptKey(prompt) {
  return `${prompt.prompt_id}@${prompt.exact_version}`;
}

function exactPrompt(repositoryRoot, prompt) {
  const text = readText(repositoryRoot, prompt.exact_text_path);
  return {
    ...prompt,
    exact_text: text,
    exact_text_sha256: text === null ? null : createHash("sha256").update(text).digest("hex")
  };
}

function controlConflict(id, type, severity, summary, sources, decisionRequired, status = "unresolved") {
  return {
    id,
    type,
    severity,
    summary,
    sources,
    precedenceLevel: "Evaluate through the source order in STEERING.md; do not let technical state settle meaning.",
    effect: severity === "blocking" ? "Blocks the affected material action." : "Must remain visible through the affected decision.",
    disposition: status,
    owner: "Jamie Peppard",
    decisionRequired,
    status
  };
}

function validateControls(controls) {
  const conflicts = [];
  const projectIds = new Set();
  for (const project of controls.projects) {
    if (projectIds.has(project.project_id)) conflicts.push(controlConflict(
      `duplicate-project-${project.project_id}`,
      "duplicate-authority-source",
      "blocking",
      `Project identifier ${project.project_id} appears more than once.`,
      ["projects/project-registry.yml"],
      "Select one controlling project record and retain the other only as history."
    ));
    projectIds.add(project.project_id);
  }

  const promptKeys = new Set();
  const currentTargets = new Map();
  for (const prompt of controls.prompts) {
    const key = promptKey(prompt);
    if (promptKeys.has(key)) conflicts.push(controlConflict(
      `duplicate-prompt-${key}`,
      "duplicate-authority-source",
      "blocking",
      `Prompt version ${key} appears more than once.`,
      ["prompts/prompt-registry.yml"],
      "Choose one exact prompt record."
    ));
    promptKeys.add(key);
    if (prompt.exact_text === null) conflicts.push(controlConflict(
      `missing-prompt-text-${key}`,
      "prompt-provenance",
      CURRENT_PROMPT_STATUSES.has(prompt.status) ? "blocking" : "warning",
      `The exact text for ${key} is missing.`,
      [prompt.exact_text_path],
      "Restore or deliberately supersede the exact prompt text."
    ));
    if (CURRENT_PROMPT_STATUSES.has(prompt.status)) {
      const target = `${prompt.target_project}:${prompt.target_capability}`;
      if (currentTargets.has(target)) conflicts.push(controlConflict(
        `multiple-current-prompts-${target}`,
        "prompt-conflict",
        "blocking",
        `More than one current prompt controls ${target}.`,
        [currentTargets.get(target), key],
        "Jamie must select or approve one current version."
      ));
      else currentTargets.set(target, key);
      if (!prompt.approving_decision || !controls.decisionIds.has(prompt.approving_decision)) {
        conflicts.push(controlConflict(
          `unapproved-current-prompt-${key}`,
          "authority-gap",
          "blocking",
          `Current prompt ${key} has no available recorded human Decision.`,
          [prompt.exact_text_path, prompt.approving_decision || "no decision recorded"],
          "Record Jamie's exact prompt decision or return the prompt to Draft."
        ));
      }
    }
  }

  for (const purpose of controls.purposes) {
    if (String(purpose.metadata.status).toLowerCase() === "approved" && !purpose.metadata.approving_decision) {
      conflicts.push(controlConflict(
        `purpose-approved-without-decision-${purpose.metadata.id || purpose.path}`,
        "authority-gap",
        "blocking",
        `Product Purpose ${purpose.metadata.id || purpose.path} is marked Approved without a recorded approving Decision.`,
        [purpose.path],
        "Return it to Proposed or record Jamie's exact approval."
      ));
    }
  }

  if (String(controls.steering.status).toLowerCase() === "approved"
    && (!controls.steering.approving_decision || !controls.decisionIds.has(controls.steering.approving_decision))) {
    conflicts.push(controlConflict(
      "steering-approved-without-decision",
      "authority-gap",
      "blocking",
      "The Steering contract is marked Approved without an available recorded human Decision.",
      ["STEERING.md", controls.steering.approving_decision || "no decision recorded"],
      "Return it to Proposed or record Jamie's exact approval."
    ));
  }

  for (const source of controls.approvedPurposeSources || []) {
    if (source.metadata.id !== source.project.purpose_id || source.metadata.version !== source.project.purpose_version) {
      conflicts.push(controlConflict(
        `approved-purpose-registry-conflict-${source.project.project_id}`,
        "approved-source-conflict",
        "blocking",
        `The project registry purpose for ${source.project.project_id} does not match its approved source.`,
        ["projects/project-registry.yml", source.project.approved_purpose_source],
        "Correct the registry or explicitly review the approved Product Purpose; do not choose between them silently."
      ));
    }
  }

  if (controls.recovery?.latest?.restore_status !== "succeeded") conflicts.push(controlConflict(
    "recovery-not-demonstrated",
    "recovery-gate",
    "blocking",
    "The latest controlled recovery test has not succeeded.",
    ["docs/recovery/recovery-registry.yml"],
    "Demonstrate recovery or obtain Jamie's explicit decision before behaviour or database changes."
  ));

  if (existsSync(resolve(controls.repositoryRoot, "governance-poc")) || existsSync(resolve(controls.repositoryRoot, "governance-site"))) {
    conflicts.push(controlConflict(
      "governance-implementation-awaits-migration",
      "project-boundary",
      "warning",
      "Dynamic Governance is defined as a separate product while retained Governance implementations remain in the core repository.",
      ["docs/purpose/dynamic-governance-tool.md", "governance-poc/", "governance-site/"],
      "Jamie must approve the target repository and non-destructive migration plan before anything moves.",
      "controlled-pending-migration"
    ));
  }
  return conflicts;
}

export function loadSteeringControls(repositoryRoot) {
  const controls = {
    repositoryRoot,
    registryStatus: "loaded",
    projects: [],
    prompts: [],
    purposes: [],
    steering: {},
    recovery: null,
    decisionIds: decisionIds(repositoryRoot),
    conflicts: []
  };
  try {
    const projectRegistry = readJsonDocument(repositoryRoot, "projects/project-registry.yml");
    const promptRegistry = readJsonDocument(repositoryRoot, "prompts/prompt-registry.yml");
    controls.projectRegistry = projectRegistry;
    controls.promptRegistry = promptRegistry;
    controls.projects = projectRegistry.projects || [];
    controls.prompts = (promptRegistry.prompts || []).map((prompt) => exactPrompt(repositoryRoot, prompt));
    controls.steering = frontMatter(readText(repositoryRoot, "STEERING.md") || "");
    controls.recovery = readJsonDocument(repositoryRoot, "docs/recovery/recovery-registry.yml");
    controls.purposes = controls.projects
      .filter((project) => String(project.purpose_document || "").endsWith(".md"))
      .map((project) => ({
        projectId: project.project_id,
        path: project.purpose_document,
        metadata: frontMatter(readText(repositoryRoot, project.purpose_document) || "")
      }));
    controls.approvedPurposeSources = controls.projects
      .filter((project) => project.approved_purpose_source)
      .map((project) => ({
        project,
        path: project.approved_purpose_source,
        metadata: frontMatter(readText(repositoryRoot, project.approved_purpose_source) || "")
      }));
    controls.conflicts = validateControls(controls);
  } catch (error) {
    controls.registryStatus = "unavailable";
    controls.conflicts = [controlConflict(
      "control-registry-unavailable",
      "control-source",
      "blocking",
      String(error.message || error),
      ["projects/project-registry.yml", "prompts/prompt-registry.yml"],
      "Restore the registries before material implementation."
    )];
  }
  return controls;
}

function targetProjectIds(text) {
  const value = String(text || "");
  const targets = [];
  if (/\b(?:dynamic governance|connected governance|governance tool|governance-poc|governance site)\b/i.test(value)) targets.push("dynamic-governance-tool");
  if (/\b(?:incident management (?:rpg|simulation|game)|incident manager rpg)\b/i.test(value)) targets.push("incident-management-rpg");
  if (/\b(?:football manager player lab|player lab)\b/i.test(value)) targets.push("football-manager-player-lab");
  if (/\b(?:workbench|oppa mate|my work|implementation job|codex handoff)\b/i.test(value)) targets.push("ai-workbench");
  if (/\b(?:operations automated methodology|methodology)\b/i.test(value)) targets.push("operations-automated-core");
  return [...new Set(targets)];
}

function addClassification(values, classification, targetProject, rationale) {
  if (!values.some((candidate) => candidate.classification === classification && candidate.targetProject === targetProject)) {
    values.push({ classification, targetProject, rationale, status: "classified", decision: null });
  }
}

function explicitPurposeReview(text) {
  return /\b(?:purpose review|review (?:the )?product purpose|change (?:the )?product purpose|purpose change|change (?:the )?(?:product )?boundar(?:y|ies))\b/i.test(String(text || ""));
}

function projectFor(controls, projectId) {
  return controls.projects.find((project) => project.project_id === projectId) || null;
}

export function assessProjectBoundary({ text, targetProject, classifications = [], controls }) {
  const project = projectFor(controls, targetProject);
  const lower = String(text || "").toLowerCase();
  const separate = new Set(["dynamic-governance-tool", "incident-management-rpg", "football-manager-player-lab"]);
  let recommendation = "remain-current-product";
  let rationale = "The request serves the current product's user, outcome, data boundary and authority model.";
  if (/\b(?:merge|fold|move)\b.{0,50}\b(?:governance)\b.{0,50}\b(?:workbench|core)\b/i.test(text)
    || /\bshared database\b/i.test(text)) {
    recommendation = "reject-purpose-inconsistent";
    rationale = "The request would collapse a separate product's data or authority boundary into the core project.";
  } else if (separate.has(targetProject)) {
    recommendation = "create-separate-project";
    rationale = targetProject === "dynamic-governance-tool"
      ? "The Governance capability belongs to its already-defined separate product and requires a separately controlled repository through non-destructive migration."
      : "The named product is outside Operations Automated and must remain a separately controlled project.";
  } else if (classifications.includes("idea-later-consideration")) {
    recommendation = "retain-ideas-space";
    rationale = "The request is an idea without sufficient authority or evidence for committed implementation.";
  } else if (classifications.includes("cross-product-dependency") && /\b(?:shared|common|reusable|across)\b/i.test(lower)) {
    recommendation = "shared-capability";
    rationale = "Several products may consume the outcome, so the shared contract must remain separate from each product's internal implementation and authority.";
  } else if (/\b(?:explore|maybe|investigate feasibility|not sure)\b/i.test(lower)) {
    recommendation = "defer-pending-evidence";
    rationale = "The proposition is not sufficiently developed to become committed work.";
  } else if (/\b(?:module|bounded component|contained capability)\b/i.test(lower)) {
    recommendation = "bounded-module";
    rationale = "The capability fits the current outcome but benefits from an explicit internal boundary.";
  }

  const newProject = recommendation === "create-separate-project" ? {
    proposedProductName: project?.product_name || "New product candidate",
    proposedProductPurpose: project?.core_outcome || "Purpose requires a separate proposal.",
    intendedUsers: project?.intended_users || [],
    primaryOutcome: project?.core_outcome || "Outcome requires definition.",
    inputsAndOutputs: targetProject === "dynamic-governance-tool"
      ? "Controlled governing sources and findings in; linked governance drafts, evidence and releases out."
      : "Inputs and outputs require separate product discovery.",
    boundariesAndNonGoals: project?.authority_boundary || "Separate purpose, data, authority and release controls are required.",
    relationshipToExistingProducts: project?.connected_products || [],
    dataAndSecurityImplications: project?.information_boundary || "A separate data and security decision is required.",
    authorityModel: project?.authority_boundary || "Jamie retains approval until explicitly delegated.",
    remainsInCurrentProduct: "Only controlled findings, references and learning signals; no imported internal database or approval authority.",
    migrationOrIntegration: targetProject === "dynamic-governance-tool"
      ? "Prepare a non-destructive repository migration and controlled signal-exchange contract; do not remove retained code yet."
      : "Create no repository or integration until purpose and project scope are approved.",
    exactHumanDecisionRequired: "Approve, revise, defer or reject the separate Product Purpose, repository boundary and any migration or integration plan."
  } : null;

  return {
    targetProject,
    recommendation,
    rationale,
    gate: {
      primaryUser: project?.intended_users || ["Not yet established"],
      primaryOutcome: project?.core_outcome || "Not yet established",
      dataAndConfidentialityBoundary: project?.information_boundary || "Separate assessment required",
      authorityAndApprovalModel: project?.authority_boundary || "Jamie retains authority",
      releaseAndOperatingLifecycle: project?.release_lifecycle || "Not defined",
      commercialProposition: /\b(?:sell|price|commercial|customer|subscription)\b/i.test(text) ? "Commercial proposition implicated; separate validation required." : "No new commercial proposition identified.",
      interactionModel: targetProject === "ai-workbench" ? "Private local Workbench" : "Separate product interaction model",
      technologyAndDependencies: recommendation === "create-separate-project" ? "Separate repository, storage and controlled integration dependencies." : "Use current product dependencies unless a later gate changes them.",
      purposeDistortion: recommendation === "reject-purpose-inconsistent" ? "Material distortion detected." : "No silent purpose change permitted.",
      reusableAcrossProducts: classifications.includes("cross-product-dependency"),
      sufficientlyDevelopedForCommittedWork: !new Set(["retain-ideas-space", "defer-pending-evidence"]).has(recommendation)
    },
    newProject
  };
}

export function classifyRequest(text, controls = loadSteeringControls(process.cwd())) {
  const sourceText = String(text || "").trim();
  const targets = targetProjectIds(sourceText);
  const primaryTarget = targets[0] || "operations-automated-core";
  const candidates = [];
  if (/\b(?:no action required|for information only|do nothing)\b/i.test(sourceText)) addClassification(candidates, "no-action-required", primaryTarget, "The source explicitly requests no action.");
  if (/\b(?:security|safety|legal|privacy|data breach|vulnerability|authority failure)\b/i.test(sourceText)) addClassification(candidates, "urgent-security-safety-legal-authority-review", primaryTarget, "The request may affect a high-consequence control boundary.");
  if (explicitPurposeReview(sourceText)) addClassification(candidates, "purpose-boundary-change", primaryTarget, "The source explicitly starts a purpose or boundary review; it does not approve new wording.");
  if (targets.includes("dynamic-governance-tool")) addClassification(candidates, "governance-tool-product-change", "dynamic-governance-tool", "The request names the separate Governance product or one of its retained aliases.");
  for (const target of targets.filter((item) => new Set(["incident-management-rpg", "football-manager-player-lab"]).has(item))) {
    addClassification(candidates, "new-project-candidate", target, "The named product is outside the Operations Automated core project.");
  }
  if (targets.includes("ai-workbench") && /\b(?:add|build|change|update|feature|screen|surface|workflow|implement|fix|defect|bug)\b/i.test(sourceText)) addClassification(candidates, "workbench-product-change", "ai-workbench", "The requested behaviour changes the private Workbench product.");
  if (/\b(?:bug|defect|broken|failure|fails?|fix|corrective|correction)\b/i.test(sourceText)) addClassification(candidates, "defect-corrective-change", primaryTarget, "The request describes faulty or corrective behaviour.");
  if (/\b(?:research|evidence|investigate|compare|look up|verify)\b/i.test(sourceText)) addClassification(candidates, "research-evidence-request", primaryTarget, "The requested outcome is evidence or investigation.");
  if (/\b(?:idea|later consideration|someday|park this|consider later)\b/i.test(sourceText)) addClassification(candidates, "idea-later-consideration", primaryTarget, "The source frames the request as possible later work.");
  if (/\b(?:apply|use)\b.{0,30}\bmethodology\b/i.test(sourceText)) addClassification(candidates, "methodology-application", "operations-automated-core", "The request asks to apply the approved methodology.");
  if (/\b(?:challenge|stress-test|test)\b.{0,40}\bmethodology\b|\bmethodology challenge\b/i.test(sourceText)) addClassification(candidates, "methodology-challenge", "operations-automated-core", "The request challenges current methodology reasoning.");
  if (/\b(?:clarify|clarification|what does)\b.{0,40}\bmethodology\b/i.test(sourceText)) addClassification(candidates, "methodology-clarification", "operations-automated-core", "The request asks for current methodology meaning to be clarified.");
  if (/\b(?:change|update|amend|revise)\b.{0,50}\bmethodology\b|\bmethodology\b.{0,50}\b(?:change|update|amend|revise)\b/i.test(sourceText)) addClassification(candidates, "methodology-change-candidate", "operations-automated-core", "The request may change methodology meaning and therefore remains a candidate.");
  if (targets.length > 1 || /\b(?:cross-product|across products|shared capability)\b/i.test(sourceText)) addClassification(candidates, "cross-product-dependency", primaryTarget, "The request affects or may be reused by more than one product.");
  if (/\b(?:task|work item|implement|build|carry out|operational work)\b/i.test(sourceText) && !candidates.some((candidate) => candidate.classification === "no-action-required")) addClassification(candidates, "operational-work-item", primaryTarget, "The source asks for bounded work to be performed.");
  if (!candidates.length || /\b(?:explain|answer|what|why|how)\b/i.test(sourceText)) addClassification(candidates, "ordinary-answer", primaryTarget, "A useful answer or explanation can be returned without creating implementation authority.");

  const classifications = candidates.map((candidate) => candidate.classification);
  const boundary = assessProjectBoundary({ text: sourceText, targetProject: primaryTarget, classifications, controls });
  const instructionConflicts = [];
  if (boundary.recommendation === "reject-purpose-inconsistent") instructionConflicts.push(controlConflict(
    "request-collapses-product-boundary",
    "project-boundary",
    "blocking",
    boundary.rationale,
    ["Current request", "projects/project-registry.yml", "docs/purpose/dynamic-governance-tool.md"],
    "Jamie must revise the scope or explicitly start a purpose and boundary review."
  ));
  if (targets.includes("ai-workbench") && /\b(?:remove|disable|bypass|skip)\b.{0,50}\b(?:feedback|challenge|learning|history|audit)\b/i.test(sourceText)) instructionConflicts.push(controlConflict(
    "request-weakens-methodology-learning-loop",
    "learning-loop",
    "blocking",
    "The request may weaken the Workbench's retained methodology-learning or audit loop.",
    ["Current request", "evolution/methodology-evolution-system.md", "product/operate-internal-workbench.md"],
    "Retain the loop or start an explicit controlled review with recovery and evidence."
  ));
  if (/\b(?:tests? pass(?:ed)?|technically complete|build (?:is )?(?:green|successful|complete))\b.{0,80}\b(?:approve|merge|release|publish)\b/i.test(sourceText)) instructionConflicts.push(controlConflict(
    "technical-completion-mistaken-for-approval",
    "authority-gap",
    "blocking",
    "Technical completion is being treated as meaning, merge, release or publication approval.",
    ["Current request", "GOVERNANCE.md", "STEERING.md"],
    "Keep technical evidence and the named human decision as separate records."
  ));
  const candidateRecords = candidates.map((candidate, index) => ({
    ...candidate,
    candidateId: `candidate-${index + 1}`,
    purposeVersion: (() => {
      const project = projectFor(controls, candidate.targetProject);
      return project?.purpose_id && project?.purpose_version ? `${project.purpose_id}@${project.purpose_version}` : "not-approved";
    })(),
    steeringVersion: controls.steering.id && controls.steering.version ? `${controls.steering.id}@${controls.steering.version}` : "unavailable",
    evidence: [],
    assumptions: ["Text-pattern classification is an AI inference and may be corrected by the authorised human."],
    aiInference: candidate.rationale,
    linkedCandidateIds: candidates.map((_, linkedIndex) => `candidate-${linkedIndex + 1}`).filter((id) => id !== `candidate-${index + 1}`),
    exactHumanDecisionRequired: boundary.recommendation === "remain-current-product"
      ? "Correct the classification if it is wrong; implementation authority remains separate."
      : boundary.newProject?.exactHumanDecisionRequired || "Accept, defer, reject or correct the recorded route without inferring implementation approval."
  }));
  return {
    sourceText,
    targetProjects: targets.length ? targets : [primaryTarget],
    primaryTarget,
    candidates: candidateRecords,
    purposeChangeAllowed: explicitPurposeReview(sourceText),
    boundary,
    conflicts: instructionConflicts,
    approvalState: "not-approved-by-classification"
  };
}

const OUTCOME_STOP_WORDS = new Set(["about", "after", "again", "before", "being", "build", "change", "complete", "could", "deliver", "from", "have", "implementation", "into", "material", "should", "their", "there", "these", "through", "using", "where", "which", "with", "would"]);

function outcomeTerms(value) {
  return new Set(String(value || "").toLowerCase().match(/[a-z0-9]+/g)?.filter((word) => word.length >= 5 && !OUTCOME_STOP_WORDS.has(word)) || []);
}

export function acceptanceCriteriaAlign(approvedRequirement, acceptanceCriteria) {
  if (!String(approvedRequirement || "").trim() || !Array.isArray(acceptanceCriteria) || !acceptanceCriteria.length) return { valid: true, sharedTerms: [] };
  const requirementTerms = outcomeTerms(approvedRequirement);
  if (!requirementTerms.size) return { valid: true, sharedTerms: [] };
  const criteriaTerms = outcomeTerms(acceptanceCriteria.join(" "));
  const sharedTerms = [...requirementTerms].filter((word) => criteriaTerms.has(word));
  return { valid: sharedTerms.length > 0, sharedTerms };
}

export function selectCurrentPrompt(controls, { targetProject, targetCapability }) {
  const values = controls.prompts.filter((prompt) =>
    prompt.target_project === targetProject
    && prompt.target_capability === targetCapability
    && CURRENT_PROMPT_STATUSES.has(prompt.status));
  if (values.length !== 1) throw new Error(`Expected one current approved prompt for ${targetProject}:${targetCapability}; found ${values.length}.`);
  return values[0];
}

export function collateCurrentPrompts(controls, targetProject, { includeDrafts = false } = {}) {
  const current = controls.prompts.filter((prompt) => prompt.target_project === targetProject && CURRENT_PROMPT_STATUSES.has(prompt.status));
  const drafts = controls.prompts.filter((prompt) => prompt.target_project === targetProject && prompt.status === "draft");
  const conflicts = controls.conflicts.filter((conflict) => conflict.type.includes("prompt") || conflict.type === "authority-gap");
  return {
    targetProject,
    current: current.map((prompt) => ({ ...prompt })),
    drafts: includeDrafts ? drafts.map((prompt) => ({ ...prompt })) : drafts.map(({ exact_text, ...prompt }) => prompt),
    supersededExcluded: controls.prompts.filter((prompt) => prompt.target_project === targetProject && prompt.status === "superseded").map(promptKey),
    conflicts,
    registryVersion: controls.promptRegistry?.version || "unavailable"
  };
}

export function formatPromptCollation(collation) {
  const lines = [
    `# Current prompts — ${collation.targetProject}`,
    "",
    ...collation.current.flatMap((prompt) => [
      `## ${prompt.title}`,
      "",
      `- Prompt: ${prompt.prompt_id}@${prompt.exact_version}`,
      `- Status: ${prompt.status}`,
      `- Effective date: ${prompt.effective_date}`,
      `- Purpose: ${prompt.purpose_version}`,
      `- Steering: ${prompt.steering_version}`,
      "",
      prompt.exact_text || "[Exact text unavailable — blocking conflict]",
      ""
    ])
  ];
  lines.push("## Drafts", "", ...(collation.drafts.length ? collation.drafts.map((prompt) => `- ${prompt.prompt_id}@${prompt.exact_version} — ${prompt.status}`) : ["- None registered for this project."]));
  lines.push("", "## Superseded versions excluded", "", ...(collation.supersededExcluded.length ? collation.supersededExcluded.map((item) => `- ${item}`) : ["- None."]));
  if (collation.conflicts.length) lines.push("", "## Unresolved conflicts", "", ...collation.conflicts.map((item) => `- ${item.summary}`));
  return lines.join("\n");
}

export function buildProvenanceFor(controls, { targetProject, targetCapability }) {
  if (String(controls.steering.status).toLowerCase() !== "approved") throw new Error("The Steering and Collaboration Contract is not approved.");
  if (!controls.steering.approving_decision || !controls.decisionIds.has(controls.steering.approving_decision)) throw new Error("The approved Steering and Collaboration Contract has no available recorded human Decision.");
  const project = projectFor(controls, targetProject);
  const prompt = selectCurrentPrompt(controls, { targetProject, targetCapability });
  return {
    targetProject,
    purposeId: project?.purpose_id || "",
    purposeVersion: project?.purpose_version || "",
    steeringId: controls.steering.id || "",
    steeringVersion: controls.steering.version || "",
    steeringStatus: controls.steering.status || "unavailable",
    promptId: prompt.prompt_id,
    promptVersion: prompt.exact_version,
    promptStatus: prompt.status,
    promptPath: prompt.exact_text_path,
    promptSha256: prompt.exact_text_sha256,
    approvingDecision: prompt.approving_decision
  };
}

export function validateBuildProvenance(controls, provenance) {
  const missing = [
    ["target project", provenance?.targetProject],
    ["Product Purpose identifier", provenance?.purposeId],
    ["Product Purpose version", provenance?.purposeVersion],
    ["steering identifier", provenance?.steeringId],
    ["steering version", provenance?.steeringVersion],
    ["prompt identifier", provenance?.promptId],
    ["prompt version", provenance?.promptVersion],
    ["prompt SHA-256", provenance?.promptSha256]
  ].filter(([, value]) => !String(value || "").trim()).map(([label]) => label);
  const project = projectFor(controls, provenance?.targetProject);
  if (!project) missing.push("registered target project");
  if (project && (project.purpose_id !== provenance.purposeId || project.purpose_version !== provenance.purposeVersion)) missing.push("current registered Product Purpose version");
  const prompt = controls.prompts.find((item) => item.prompt_id === provenance?.promptId && item.exact_version === provenance?.promptVersion);
  if (!prompt || !CURRENT_PROMPT_STATUSES.has(prompt.status)) missing.push("current approved prompt");
  if (prompt && prompt.target_project !== provenance.targetProject) missing.push("prompt aligned to the target project");
  if (prompt && prompt.purpose_version !== `${provenance.purposeId}@${provenance.purposeVersion}`) missing.push("prompt aligned to the current Product Purpose version");
  if (prompt && prompt.steering_version !== `${provenance.steeringId}@${provenance.steeringVersion}`) missing.push("prompt aligned to the current steering version");
  if (prompt && prompt.exact_text_sha256 !== provenance.promptSha256) missing.push("exact registered prompt hash");
  if (prompt && (!prompt.approving_decision || !controls.decisionIds.has(prompt.approving_decision))) missing.push("recorded human prompt decision");
  if (String(controls.steering.status).toLowerCase() !== "approved") missing.push("approved Steering and Collaboration Contract");
  if (String(controls.steering.status).toLowerCase() === "approved"
    && (!controls.steering.approving_decision || !controls.decisionIds.has(controls.steering.approving_decision))) missing.push("recorded human steering decision");
  if (controls.recovery?.latest?.restore_status !== "succeeded") missing.push("successful recovery gate");
  return { valid: missing.length === 0, missing: [...new Set(missing)] };
}

export function steeringOverview(controls, { buildVersion = "unknown", implementationJobs = [], intakes = [] } = {}) {
  const conflicts = [...controls.conflicts];
  if (/steering-control/i.test(buildVersion) && String(controls.steering.status).toLowerCase() !== "approved") conflicts.push(controlConflict(
    "implemented-steering-remains-proposed",
    "technical-readiness-authority",
    "warning",
    "The steering-control implementation is technically present while the Steering contract remains Proposed.",
    [buildVersion, "STEERING.md"],
    "Jamie must separately approve, revise, defer or reject the Steering meaning; technical completion cannot decide it.",
    "awaiting-human-decision"
  ));
  const builds = implementationJobs.map((job) => {
    const provenance = {
      targetProject: job.target_project,
      purposeId: job.purpose_id,
      purposeVersion: job.purpose_version,
      steeringId: job.steering_id,
      steeringVersion: job.steering_version,
      promptId: job.prompt_id,
      promptVersion: job.prompt_version,
      promptSha256: job.prompt_sha256
    };
    const check = validateBuildProvenance(controls, provenance);
    if (!check.valid) conflicts.push(controlConflict(
      `build-provenance-${job.id}`,
      "build-provenance",
      "warning",
      `Historical or current Build Job ${job.id} lacks: ${check.missing.join(", ")}.`,
      [`Implementation Job ${job.id}`],
      "Do not reconstruct history. Record it as legacy and require complete provenance for the next material build.",
      "legacy-visible"
    ));
    return { id: job.id, title: job.title, status: job.status, provenance, provenanceValid: check.valid, missing: check.missing };
  });
  return {
    status: controls.registryStatus,
    buildVersion,
    steering: controls.steering,
    projects: controls.projects,
    purposes: controls.purposes,
    prompts: controls.prompts.map(({ exact_text, ...prompt }) => ({ ...prompt, exactTextAvailable: exact_text !== null })),
    proposals: {
      purposes: controls.purposes.filter((purpose) => String(purpose.metadata.status).toLowerCase() !== "approved"),
      prompts: controls.prompts.filter((prompt) => prompt.status === "draft")
    },
    recovery: controls.recovery?.latest || null,
    intakes,
    boundaryRecommendations: intakes.map((intake) => intake.boundary).filter(Boolean),
    builds,
    conflicts,
    authorityBoundary: "This surface displays control state. Classification, technical completion and display do not approve purpose, steering, build, merge, release or publication."
  };
}

export const DEFAULT_SETTINGS = Object.freeze({
  monthlySoftBudget: 10,
  monthlyHardBudget: 20,
  perRequestWarningThreshold: 0.15,
  perRequestHardCeiling: 0.75,
  defaultCapabilityTier: 2,
  advancedReasoningEnabled: true,
  imageGenerationEnabled: false,
  maximumImagesPerRequest: 1,
  maximumAudioDuration: 180,
  maximumFileSize: 10_000_000,
  maximumRetrievedContext: 12_000,
  inputCostPerMillion: 1.25,
  outputCostPerMillion: 10,
  responseLimits: { answer: 900, summary: 350, analysis: 1800, checklist: 700, template: 1200, proposal: 1800 }
});

export function safeJson(value, fallback = null) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

export function extractFrontMatter(content) {
  const block = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!block) return {};
  return Object.fromEntries(block[1].split(/\r?\n/).map((line) => {
    const index = line.indexOf(":");
    return index < 0 ? null : [line.slice(0, index).trim(), line.slice(index + 1).trim()];
  }).filter(Boolean));
}

export function chooseRoute(request, settings = DEFAULT_SETTINGS) {
  const text = String(request.text || "");
  const lower = text.toLowerCase();
  let tier = Number(settings.defaultCapabilityTier || 2);
  const reasons = [];
  if (/format|hash|diff|export|store only/.test(lower)) { tier = 0; reasons.push("deterministic local processing"); }
  else if (/classif|translate|short summary|title/.test(lower) || request.outputType === "summary") { tier = 1; reasons.push("bounded language transformation"); }
  else reasons.push("ordinary methodology or document analysis");
  if (/methodology change|conflict|legal|regulat|security|safety|contradict|deep analysis/.test(lower)) {
    if (settings.advancedReasoningEnabled) { tier = 3; reasons.push("material consequence or cross-document reasoning"); }
    else reasons.push("advanced reasoning disabled; capped at standard analysis");
  }
  const outputLimit = settings.responseLimits?.[request.outputType] || settings.responseLimits?.answer || 900;
  const inputEstimate = Math.ceil(text.length / 4) + 1500;
  const estimatedCost = estimateCost(inputEstimate, outputLimit, settings);
  return {
    tier, reason: reasons.join("; "), inputEstimate, outputLimit,
    confirmationRequired: tier === 3 || estimatedCost > settings.perRequestWarningThreshold
  };
}

export function estimateCost(inputTokens, outputTokens, settings = DEFAULT_SETTINGS) {
  return Number(((inputTokens / 1_000_000) * settings.inputCostPerMillion + (outputTokens / 1_000_000) * settings.outputCostPerMillion).toFixed(6));
}

export function buildContextPreview(request, route, sources, settings = DEFAULT_SETTINGS) {
  return {
    workspace: request.workspace || "living-methodology",
    classification: route.tier === 3 ? "material/consequential analysis" : route.tier === 0 ? "local deterministic task" : "methodology assistance",
    route,
    sources,
    estimatedContextTokens: route.inputEstimate + Math.ceil(sources.reduce((sum, item) => sum + item.excerpt.length, 0) / 4),
    estimatedCost: estimateCost(route.inputEstimate, route.outputLimit, settings),
    approvalState: "not-approved",
    contextPolicy: "Current request, compact local memory, and selected repository sections only."
  };
}

function cleanSourceLines(source) {
  return source.excerpt
    .replace(/^---[\s\S]*?---\s*/m, "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^#{1,6}\s+/, "").replace(/^[-*]\s+/, "").trim())
    .filter((line) => line.length > 35 && !line.startsWith("|"))
    .slice(0, 4);
}

function evidenceItems(sources) {
  const seen = new Set();
  const items = [];
  for (const source of sources) {
    for (const line of cleanSourceLines(source)) {
      const key = line.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ text: line, source });
      if (items.length === 7) return items;
    }
  }
  return items;
}

function citations(sources) {
  return sources.map((source) => `- \`${source.path}\` - ${source.status}, version ${source.version}, hash ${source.hash}`).join("\n");
}

export function buildLocalSynthesis({ input, sources, outputType = "answer", attachmentText = "" }) {
  const evidence = evidenceItems(sources);
  const approved = sources.filter((source) => source.status === "approved");
  const nonApproved = sources.filter((source) => source.status !== "approved");
  const attachmentNote = attachmentText
    ? `\n\n### Supplied material\n\nThe attached text was included in retrieval (${attachmentText.length.toLocaleString()} characters).`
    : "";
  const evidenceList = evidence.length
    ? evidence.map((item) => `- ${item.text} _[${item.source.path}]_`).join("\n")
    : "- No repository passage matched strongly enough. Treat the next step as discovery rather than a methodology conclusion.";
  const statusNote = nonApproved.length
    ? ` ${nonApproved.length} selected source(s) are not approved and are labelled accordingly.`
    : "";
  const common = `### Current understanding\n\nYou are asking: **${input.trim()}**\n\n### What the controlled material supports\n\n${evidenceList}\n\n### Interpretation\n\nThe strongest grounded direction comes from ${approved.length} approved source${approved.length === 1 ? "" : "s"}.${statusNote} The practical implication is to define intended value and decision authority, use evidence rather than assumed readiness, and keep any consequential decision with an authorised human.${attachmentNote}`;
  const boundary = `### Uncertainty and control\n\nThis is a deterministic local synthesis, not an independent AI judgement. It can retrieve and organise controlled guidance, but it cannot infer missing operational facts or approve a change.\n\n### Sources used\n\n${citations(sources) || "- No repository source selected."}`;

  if (outputType === "summary") {
    return `## Concise grounded summary\n\n${evidence.slice(0, 3).map((item) => `- ${item.text}`).join("\n") || "- No strong repository match was found."}\n\n**Next action:** Confirm the operational context, evidence and decision authority before acting.\n\n${boundary}`;
  }
  if (outputType === "checklist") {
    return `## Grounded implementation checklist\n\n- [ ] State the intended outcome and who receives the value.\n- [ ] Record the current evidence, exceptions and material uncertainty.\n- [ ] Identify the accountable owner and authorised decision-maker.\n- [ ] Check the relevant operational dependencies, risks and controls.\n- [ ] Choose the smallest proportionate next action.\n- [ ] Define how the result, failure and recovery will be observed.\n- [ ] Record the human decision separately from this recommendation.\n- [ ] Retain learning and a review trigger.\n\n${common}\n\n${boundary}`;
  }
  if (outputType === "template") {
    return `## Controlled working template\n\n**Purpose and intended outcome:**\n\n**People affected and beneficiary:**\n\n**Evidence and source:**\n\n**Current operation or problem:**\n\n**Value priorities and constraints:**\n\n**Options and trade-offs:**\n\n**Recommended next action:**\n\n**Named decision authority:**\n\n**Tests, measures and recovery:**\n\n**Uncertainty and evidence gaps:**\n\n**Review trigger:**\n\n${common}\n\n${boundary}`;
  }
  if (outputType === "proposal") {
    return `## Proposal preparation brief\n\nStatus: **draft input - human decision required**\n\n${common}\n\n### Proposed next step\n\nUse the retrieved evidence to define the exact affected component and proposed wording. Include the strongest credible alternative, risks, trade-offs and validation checks before creating a governed proposal packet.\n\n${boundary}`;
  }
  if (outputType === "analysis") {
    return `## Detailed grounded analysis\n\n${common}\n\n### Options and trade-offs\n\n1. **Clarify before changing anything.** Lowest governance risk, but delays action.\n2. **Run a bounded, recoverable test.** Produces evidence quickly, but requires clear controls and a named owner.\n3. **Prepare a governed proposal.** Appropriate when the controlled methodology itself may need to change; it does not alter the approved baseline.\n\n### Recommended next action\n\nTurn the request into a specific operational decision: define intended value, current evidence, affected people, owner, constraints and the first reversible test. If the issue concerns methodology authority, record feedback and create a proposal packet rather than editing approved content directly.\n\n${boundary}`;
  }
  return `## Repository-grounded answer\n\n${common}\n\n### Recommended next action\n\nWrite down the intended value, the evidence currently available and who has authority to decide. Then choose the smallest reversible action that can produce useful evidence. If your request changes controlled methodology, use **Record methodology feedback** and **Create proposal packet**; neither action creates approval.\n\n${boundary}`;
}

export function validateSettings(value) {
  const numeric = ["monthlySoftBudget", "monthlyHardBudget", "perRequestWarningThreshold", "perRequestHardCeiling", "maximumAudioDuration", "maximumFileSize", "maximumRetrievedContext"];
  for (const key of numeric) if (!Number.isFinite(Number(value[key])) || Number(value[key]) < 0) throw Object.assign(new Error(`${key} must be a non-negative number.`), { status: 400 });
  if (Number(value.monthlyHardBudget) < Number(value.monthlySoftBudget)) throw Object.assign(new Error("Monthly hard budget cannot be lower than the soft budget."), { status: 400 });
  if (Number(value.perRequestHardCeiling) < Number(value.perRequestWarningThreshold)) throw Object.assign(new Error("Per-request hard ceiling cannot be lower than the warning threshold."), { status: 400 });
  return value;
}

export function buildProposalPacket(feedback, conversation) {
  const user = conversation.messages.filter((message) => message.role === "user").at(-1);
  const assistant = conversation.messages.find((message) => message.id === feedback.message_id);
  return `# Governed proposal packet\n\nStatus: proposed — human decision required\n\n## Original user input\n\n${user?.working_text || "Not recorded"}\n\n## System interpretation\n\n${feedback.interpretation || assistant?.working_text || "Not recorded"}\n\n## Feedback disposition\n\n${feedback.disposition}: ${feedback.wording || "No additional wording"}\n\n## Relevant evidence\n\n${assistant?.metadata?.sources?.map((source) => `- ${source.path} (${source.status}, ${source.hash})`).join("\n") || "- No repository evidence recorded"}\n\n## Affected components\n\n${safeJson(feedback.affected_components, []).map((item) => `- ${item}`).join("\n") || "- To be assessed"}\n\n## Proposed change\n\nRequires human drafting and confirmation.\n\n## Strongest credible alternative\n\nRetain the current approved methodology and record this as learning evidence only.\n\n## Risks, trade-offs and uncertainty\n\nThe evidence may be incomplete or context-specific. Presence in this packet is not approval.\n\n## Required human decision\n\nJamie Peppard, or another explicitly authorised human, must accept, reject, amend or defer this proposal.\n\n## Recommended checks\n\n- Confirm source status and currency.\n- Test against a non-confidential case.\n- Check cross-document impact.\n- Record the human decision separately.\n\n_This packet did not edit, approve, publish or merge repository content._`;
}

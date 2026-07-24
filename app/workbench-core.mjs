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
  if (/\b(format|hash|diff|export)\b|store only/.test(lower)) { tier = 0; reasons.push("deterministic local processing"); }
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
    contextPolicy: "Current request, compact local memory, controlled repository sections, and any read-only connected evidence synchronised for this server session."
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
  const nonApproved = sources.filter((source) => source.status !== "approved");
  const evidenceList = evidence.length
    ? evidence.slice(0, 5).map((item) => `- ${item.text}`).join("\n")
    : "- There is not enough relevant information yet to give a confident answer.";
  const proposedNote = nonApproved.length
    ? "\n\nSome supporting material is proposed or comes from connected external evidence. Treat it as evidence to examine, not an agreed methodology change."
    : "";
  const attachmentNote = attachmentText ? "\n\nI also took the attached material into account." : "";
  const accountabilityRequest = /accountab|responsib|human intervention|human approval|human decision/i.test(input);

  if (accountabilityRequest && outputType === "answer") {
    return `## Straight answer

You are right: AI can be responsible for carrying out a task, producing analysis or making a recommendation, but it cannot be the accountable owner. A named human must remain accountable for decisions and their consequences.

## The question for you

**Which decisions in the Operations Automated method must always have a named human who accepts the outcome?**

## A simple working rule

- AI can do the work it has been authorised to do.
- AI should challenge weak evidence or a risky instruction when that matters.
- A human reviews and accepts any decision that requires accountability.
- The record should show who made that decision and what they accepted.

## What to do next

Define the points where human acceptance is mandatory, then make the system show the accountable person before the work can move on.${proposedNote}${attachmentNote}`;
  }

  if (outputType === "summary") {
    return `## In brief

${evidence.slice(0, 3).map((item) => `- ${item.text}`).join("\n") || "- There is not enough relevant information yet to give a confident summary."}

**What to do next:** Confirm the real situation, the evidence available and who will make the decision.${proposedNote}${attachmentNote}`;
  }
  if (outputType === "checklist") {
    return `## Practical checklist

- [ ] State the outcome and who should benefit.
- [ ] Record what you know and what remains uncertain.
- [ ] Name the person accountable for the decision.
- [ ] Check the people, dependencies and risks affected.
- [ ] Choose the smallest useful next action.
- [ ] Decide how success, failure and recovery will be seen.
- [ ] Record the human decision.
- [ ] Set a point to review what was learned.${proposedNote}${attachmentNote}`;
  }
  if (outputType === "template") {
    return `## Working template

**What are we trying to achieve?**

**Who should benefit and who may be affected?**

**What do we know?**

**What do we still need to learn?**

**What choices do we have?**

**What is the recommended next action?**

**Who is accountable for the decision?**

**How will we test it and recover if it fails?**

**When will we review the result?**${proposedNote}${attachmentNote}`;
  }
  if (outputType === "proposal") {
    return `## Change proposal draft

### What may need to change

${evidenceList}

### What to decide

Describe the exact change, the problem it solves, the strongest alternative and the risks. A named human then decides whether to accept, amend, defer or reject it.${proposedNote}${attachmentNote}`;
  }
  if (outputType === "analysis") {
    return `## What the information suggests

${evidenceList}

## Your choices

1. **Clarify before changing anything.** Lowest risk, but slower.
2. **Run a small, reversible test.** Produces evidence quickly, but needs a named owner.
3. **Prepare a change proposal.** Use this when the methodology itself may need to change.

## Recommended next step

Turn the issue into one clear decision: state the intended benefit, current evidence, people affected, accountable owner and the first reversible test.${proposedNote}${attachmentNote}`;
  }
  return `## Straight answer

${evidenceList}

## What to do next

State the outcome you want, what evidence you already have and who is accountable for the decision. Then choose the smallest reversible action that will teach you something useful.${proposedNote}${attachmentNote}`;
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

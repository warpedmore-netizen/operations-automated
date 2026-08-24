const DAY_MS = 24 * 60 * 60 * 1000;

export const DAILY_CHALLENGE_TERRITORIES = Object.freeze([
  {
    id: "purpose-value",
    label: "Purpose, value and the primary user journey",
    prompt: "Test whether the method starts from the right beneficiary, outcome and minimum value without hiding harm elsewhere."
  },
  {
    id: "people-capability",
    label: "People, capability, workload and culture",
    prompt: "Test whether the method produces workable roles, capability and behaviour rather than assuming that process or technology will compensate."
  },
  {
    id: "demand-flow",
    label: "Demand, work types, flow and handovers",
    prompt: "Test how the method handles materially different demand, queues, dependencies, exceptions and transfers of responsibility."
  },
  {
    id: "decisions-authority",
    label: "Decisions, authority and accountability",
    prompt: "Test whether the right person or system can decide at the right time, with consequence and escalation kept visible."
  },
  {
    id: "risk-resilience",
    label: "Risk, control, resilience and recovery",
    prompt: "Test whether controls and recovery protect the required outcome without becoming ceremonial or disproportionate."
  },
  {
    id: "information-measurement",
    label: "Information, evidence, measures and learning",
    prompt: "Test whether the method can tell what is true, what is changing and whether the intended outcome was actually achieved."
  },
  {
    id: "technology-automation",
    label: "Technology, manual work and conventional automation",
    prompt: "Test whether the method chooses the lowest justified intervention and preserves the human or physical work that still creates value."
  },
  {
    id: "ai-agents",
    label: "AI suitability, readiness and bounded agents",
    prompt: "Test whether AI can interpret and apply the method without confusing capability, evidence, judgement or authority."
  },
  {
    id: "implementation-adoption",
    label: "Implementation, adoption and operational readiness",
    prompt: "Test whether a sound design can be activated, operated, supported and corrected in real use."
  },
  {
    id: "evolution",
    label: "Feedback, methodology evolution and outcome review",
    prompt: "Test whether feedback becomes traceable learning, a justified change or an explicit no-change reason."
  },
  {
    id: "delivery-product",
    label: "Delivery, product experience and practical usefulness",
    prompt: "Test whether a person receives a useful answer or artefact and can take the next action without becoming a methodology specialist."
  },
  {
    id: "commercial-publication",
    label: "Commercial, publication and wider-use hypotheses",
    prompt: "Test what would have to be true before the method or a delivery product could responsibly move beyond private internal validation."
  }
]);

export const DAILY_CHALLENGE_MODES = Object.freeze([
  {
    id: "reverse",
    label: "Reverse",
    prompt: "Start from the opposite of a familiar Operations Automated conclusion and identify the evidence that would make it preferable."
  },
  {
    id: "boundary",
    label: "Boundary",
    prompt: "Find the point at which an otherwise useful rule stops helping or begins to cause harm."
  },
  {
    id: "transfer",
    label: "Transfer",
    prompt: "Move an established conclusion into a materially different organisation, work type or affected group and test whether it still holds."
  },
  {
    id: "stakeholder",
    label: "Stakeholder",
    prompt: "Let a less-visible affected person challenge the current definition of value, success or acceptable consequence."
  },
  {
    id: "contrary-evidence",
    label: "Contrary evidence",
    prompt: "Present credible evidence or a result that weakens the method's likely preferred answer."
  },
  {
    id: "time-horizon",
    label: "Time horizon",
    prompt: "Compare what looks effective immediately with the capability, cost, dependency or harm it may create later."
  },
  {
    id: "failure",
    label: "Failure",
    prompt: "Begin after a plausible failure and test what the method should have exposed, prevented, detected, recovered or learned."
  },
  {
    id: "authority",
    label: "Authority",
    prompt: "Test who may decide, act, accept consequence or stop the work when formal and practical authority diverge."
  },
  {
    id: "omission",
    label: "Omission",
    prompt: "Test an under-developed or absent part of the method rather than refining a conclusion that has already survived challenge."
  }
]);

export const DAILY_CHALLENGE_FORMATS = Object.freeze([
  {
    id: "case-file",
    label: "Operational case file",
    prompt: "Open with a compact case file containing the situation, available evidence, missing evidence and the decision now due."
  },
  {
    id: "document-critique",
    label: "Document or guidance critique",
    prompt: "Open with a short realistic draft memo, policy, procedure or methodology extract for Jamie to mark as sound, weak or misleading."
  },
  {
    id: "workflow",
    label: "Workflow or decision-path walk-through",
    prompt: "Open with a small Markdown workflow or decision path, then ask Jamie where it fails or needs to branch."
  },
  {
    id: "red-team",
    label: "Red-team finding",
    prompt: "Open as a red-team finding that states the claim, exploit or failure route, likely consequence and current control."
  },
  {
    id: "after-action",
    label: "After-action review",
    prompt: "Open after an outcome has occurred and separate what was expected, what happened, why and what should be retained or changed."
  },
  {
    id: "stakeholder-exchange",
    label: "Stakeholder exchange",
    prompt: "Open with a short exchange between two reasonable stakeholders who experience the same operation differently."
  },
  {
    id: "decision-memo",
    label: "Decision memo",
    prompt: "Open with a one-page-style decision memo containing the choice, strongest options, evidence, trade-off and recommendation."
  },
  {
    id: "audit-observation",
    label: "Audit or assurance observation",
    prompt: "Open with a concise observation, evidence, consequence and management response that the methodology must assess."
  },
  {
    id: "scorecard",
    label: "Measure or scorecard challenge",
    prompt: "Open with a small table of measures or outcomes and ask whether it demonstrates value, control or only activity."
  },
  {
    id: "journey-critique",
    label: "User journey or product artefact critique",
    prompt: "Open with a compact journey, screen description or service artefact and ask what the current method would miss in real use."
  },
  {
    id: "transfer-comparison",
    label: "Side-by-side transfer test",
    prompt: "Open with two materially different settings and compare where the same methodology response transfers or breaks."
  },
  {
    id: "assumption-map",
    label: "Assumption map",
    prompt: "Open with a small table that separates recorded evidence, Jamie's prior judgement, AI inference and assumptions, then attack the weakest dependency."
  }
]);

function dateOrdinal(date) {
  const parsed = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed)) return 0;
  return Math.floor(parsed / DAY_MS);
}

export function dailyChallengePlan(date) {
  const ordinal = dateOrdinal(date);
  return {
    date,
    territory: DAILY_CHALLENGE_TERRITORIES[((ordinal % DAILY_CHALLENGE_TERRITORIES.length) + DAILY_CHALLENGE_TERRITORIES.length) % DAILY_CHALLENGE_TERRITORIES.length],
    mode: DAILY_CHALLENGE_MODES[((ordinal * 5 + 3) % DAILY_CHALLENGE_MODES.length + DAILY_CHALLENGE_MODES.length) % DAILY_CHALLENGE_MODES.length],
    format: DAILY_CHALLENGE_FORMATS[((ordinal * 7 + 2) % DAILY_CHALLENGE_FORMATS.length + DAILY_CHALLENGE_FORMATS.length) % DAILY_CHALLENGE_FORMATS.length]
  };
}

export function buildDailyChallengePrompt(date) {
  const plan = dailyChallengePlan(date);
  return `Prepare today's 10-minute Operations Automated methodology challenge inside this Workbench.

First use the RETAINED DAILY CHALLENGE MEMORY supplied with the request to perform a silent novelty and coverage check. Reject any candidate that merely changes the organisation, names or numbers around a conclusion Jamie has already given. Do not reopen a settled or deferred point without materially new evidence, a different affected stakeholder, a genuine transfer failure or a named review trigger.

Today's controlled-variety starting point is:
- Methodology territory: ${plan.territory.label}. ${plan.territory.prompt}
- Challenge mode: ${plan.mode.label}. ${plan.mode.prompt}
- Response artefact: ${plan.format.label}. ${plan.format.prompt}

Use those three choices unless the retained evidence shows that the territory would be low-value or repetitive today. You may override the territory for a materially more decision-relevant unresolved issue, but state the reason in one sentence and keep the challenge mode and artefact format where practicable. Variety is a breadth control, not a substitute for decision value.

Use the artefact itself as the challenge rather than always returning the same scenario template. Keep it readable in this conversation using short prose, Markdown tables or a simple text workflow. Do not claim to attach an image or downloadable document. Make the subject specific to current approved gaps, retained founder feedback, live project or product tensions, or connected evidence actually supplied to the Workbench. If current public evidence is not connected, state that limitation briefly and do not invent a public signal.

Give the strongest provisional Operations Automated response, the weakness most likely to change it and one primary plain-language question Jamie can answer in 10 minutes. Separate recorded evidence, Jamie's prior judgement, AI inference and assumptions where they are material. Explain that the answer becomes retained feedback rather than approval, and invite Jamie to identify what is wrong, missing, impractical or inconsistent. Do not give a questionnaire.`;
}

function compact(value, maximum) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > maximum ? `${text.slice(0, maximum - 1)}…` : text;
}

export function summariseDailyChallengeHistory(conversations, maximumCharacters = 12000) {
  const summaries = conversations
    .filter((conversation) => /methodology challenge/i.test(String(conversation.title || "")))
    .map((conversation) => {
      const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
      const firstAssistantIndex = messages.findIndex((message) => message.role === "assistant");
      if (firstAssistantIndex < 0) return "";
      const challenge = messages[firstAssistantIndex];
      const founderResponses = messages
        .slice(firstAssistantIndex + 1)
        .filter((message) => message.role === "user")
        .map((message) => compact(message.working_text ?? message.text, 900));
      const latestAssistant = [...messages].reverse().find((message, index) =>
        message.role === "assistant" && messages.length - 1 - index > firstAssistantIndex
      );
      const dispositions = (conversation.feedback || [])
        .map((item) => item.learning_disposition || item.learningDisposition || item.classification)
        .filter(Boolean);
      return [
        `Challenge: ${conversation.title}`,
        `Opening test: ${compact(challenge.working_text ?? challenge.text, 1000)}`,
        `Jamie's response: ${founderResponses.length ? founderResponses.join(" | ") : "No founder response retained."}`,
        `Latest interpretation: ${latestAssistant ? compact(latestAssistant.working_text ?? latestAssistant.text, 700) : "No later interpretation retained."}`,
        `Structured learning state: ${dispositions.length ? [...new Set(dispositions)].join(", ") : "No structured feedback disposition was retained."}`
      ].join("\n");
    })
    .filter(Boolean);
  const text = summaries.join("\n\n");
  return text.length > maximumCharacters ? text.slice(0, maximumCharacters) : text;
}

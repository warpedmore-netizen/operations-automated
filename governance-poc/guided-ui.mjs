const escapeHtml = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

async function state() { const response = await fetch("/api/state"); return response.json(); }
async function act(action, input) { const response = await fetch(`/api/actions/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); return result; }

async function panel() {
  if (document.querySelector("#title")?.textContent !== "Document intake" || document.querySelector("#guided-draft-panel")) return;
  const currentState = await state(); const intake = currentState.intakes?.at(-1);
  if (!intake || intake.intakeRoute !== "new") return;
  const questions = currentState.intakeQuestions.filter(item => item.intakeId === intake.id);
  const candidates = currentState.intakeCandidates.filter(item => item.intakeId === intake.id);
  const draft = currentState.draftDocuments?.find(item => item.intakeId === intake.id);
  const section = document.createElement("section"); section.id = "guided-draft-panel";
  const allQuestionsAnswered = questions.filter(item => item.reason === "required-governance-baseline").every(item => item.status === "answered");
  const allCandidatesReviewed = candidates.length && candidates.every(item => item.status !== "suggested");
  section.innerHTML = `<h2>Connected draft assembly</h2>${!allQuestionsAnswered?'<p>Answer the six required governance questions to generate candidate operational objects.</p>':!candidates.length?`<form class="decision" id="generate-guided"><input type="hidden" name="intakeId" value="${intake.id}"><label>Named operator (audit record)<input name="actor" required placeholder="Person acting under an authorised role"></label><div class="wide"><button class="action">Generate candidate objects</button></div></form>`:!allCandidatesReviewed?'<p>Accept, amend or reject every candidate above before assembling the draft.</p>':!draft?`<form class="decision" id="assemble-draft"><input type="hidden" name="intakeId" value="${intake.id}"><label>Named draft builder (audit record)<input name="actor" required placeholder="Person acting under an authorised role"></label><div class="wide"><button class="action">Build connected draft</button></div></form>`:`<div class="success">Connected draft assembled from accepted candidates. It remains unapproved.</div><pre>${escapeHtml(draft.preview)}</pre>`}`;
  document.querySelector("#content")?.append(section);
  for (const [id, action] of [["generate-guided", "generate-guided-candidates"], ["assemble-draft", "build-draft-graph"]]) document.querySelector(`#${id}`)?.addEventListener("submit", async event => { event.preventDefault(); try { await act(action, Object.fromEntries(new FormData(event.currentTarget).entries())); location.reload(); } catch (error) { alert(error.message); } });
}

export function installGuidedDraftUI() {
  new MutationObserver(() => panel().catch(() => undefined)).observe(document.querySelector("#content"), { childList: true });
  panel().catch(() => undefined);
}

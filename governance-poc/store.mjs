import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createSeed } from "./seed.mjs";
import { acceptCandidateFinding, createProposal, createRelease, decideProposal } from "./domain.mjs";
import { checkDrift, publishDocument, registerMapping, simulateRemoteEdit } from "./publication.mjs";
import { answerIntakeQuestion, buildDraftGraph, classifyChange, createIntake, generateGuidedCandidates, reviewCandidate } from "./intake.mjs";

export class GovernanceStore {
  constructor(path) { this.path = path; this.pending = Promise.resolve(); }
  normalise(state) { const baseline = createSeed(); for (const key of ["publicationTargets", "publicationMappings", "remoteDocuments", "publicationChecks", "approvalRings", "authorityRoles", "intakes", "intakeQuestions", "intakeCandidates", "changeAssessments", "draftObjects", "draftLinks", "draftDocuments"]) if (state[key] === undefined) state[key] = structuredClone(baseline[key]); return state; }
  async read() { try { return this.normalise(JSON.parse(await readFile(this.path, "utf8"))); } catch (error) { if (error.code !== "ENOENT") throw error; const state = createSeed(); await this.write(state); return state; } }
  async write(state) { await mkdir(dirname(this.path), { recursive: true }); const temporary = `${this.path}.tmp`; await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, "utf8"); await rename(temporary, this.path); return state; }
  update(operation) { const run = this.pending.then(async () => this.write(await operation(await this.read()))); this.pending = run.catch(() => undefined); return run; }
  reset() { return this.update(() => createSeed()); }
  act(action, input = {}) { return this.update(state => { if (action === "accept-finding") return acceptCandidateFinding(state, input.actor); if (action === "create-proposal") return createProposal(state, input.actor); if (action === "decide-proposal") return decideProposal(state, input.actor, input.decision, input.comments, input.role); if (action === "create-release") return createRelease(state, input.actor); if (action === "register-publication") return registerMapping(state, input); if (action === "check-drift") return checkDrift(state, input.mappingId, input.actor); if (action === "publish-document") return publishDocument(state, input.mappingId, input.actor); if (action === "simulate-remote-edit") return simulateRemoteEdit(state, input.mappingId, input.actor); if (action === "create-intake") return createIntake(state, input); if (action === "answer-intake-question") return answerIntakeQuestion(state, input.questionId, input.answer, input.actor); if (action === "generate-guided-candidates") return generateGuidedCandidates(state, input.intakeId, input.actor); if (action === "review-candidate") return reviewCandidate(state, input.candidateId, input.decision, input.actor, input.amendedText); if (action === "build-draft-graph") return buildDraftGraph(state, input.intakeId, input.actor); if (action === "classify-change") return classifyChange(state, input); throw new Error(`Unsupported action: ${action}`); }); }
}

import test from "node:test";
import assert from "node:assert/strict";
import { createSeed } from "../seed.mjs";
import { acceptCandidateFinding, createProposal, decideProposal, createRelease, generateDocuments, impactAnalysis, MockAIProvider, traceToObligation } from "../domain.mjs";

test("an obligation links to multiple controls and a control to multiple procedures", () => {
  const state=createSeed(); state.links.push({from:"OBL-IM-004",to:"CTRL-IM-013",type:"supported-by"},{from:"CTRL-IM-012",to:"PROC-IM-008",type:"implemented-by"});
  assert.equal(state.links.filter(x=>x.from==="OBL-IM-004"&&x.to.startsWith("CTRL")).length,2);
  assert.equal(state.links.filter(x=>x.from==="CTRL-IM-012"&&x.to.startsWith("PROC")).length,2);
});

test("approved content is not overwritten and release creates new versions", () => {
  let state=acceptCandidateFinding(createSeed(),"Human"); state=createProposal(state,"Human"); state=decideProposal(state,"Human","approved"); const before=state.policyStatements[0].text; state=createRelease(state,"Human");
  const versions=state.policyStatements.filter(x=>x.id==="POL-IM-003"); assert.equal(versions.length,2); assert.equal(versions[0].text,before); assert.equal(versions[0].status,"superseded"); assert.equal(versions[1].version,"2");
});

test("a release rejects an unapproved proposal",()=>{let state=acceptCandidateFinding(createSeed(),"Human");state=createProposal(state,"Human");assert.throws(()=>createRelease(state,"Human"),/unapproved/)});
test("AI cannot approve or directly update records",()=>{const provider=new MockAIProvider();assert.throws(()=>provider.applySuggestion(),/cannot directly/);let state=acceptCandidateFinding(createSeed(),"Human");state=createProposal(state,"Human");assert.throws(()=>decideProposal(state,"AI assistant","approved"),/AI cannot approve/)});
test("approval and release create audit events",()=>{let state=acceptCandidateFinding(createSeed(),"Human");state=createProposal(state,"Human");state=decideProposal(state,"Human","approved");state=createRelease(state,"Human");assert.ok(state.auditEvents.some(x=>x.action==="proposal-approved"));assert.ok(state.auditEvents.some(x=>x.action==="release-created"))});
test("impact analysis returns linked dependencies",()=>{const result=impactAnalysis(createSeed(),"POL-IM-003");assert.ok(result.upstream.includes("CTRL-IM-012"));assert.ok(result.downstream.includes("PROC-IM-007"));assert.ok(result.testsToRepeat.includes("TEST-IM-014"))});
test("generated documents contain released version information",()=>{let state=acceptCandidateFinding(createSeed(),"Human");state=createProposal(state,"Human");state=decideProposal(state,"Human","approved");state=createRelease(state,"Human");assert.match(generateDocuments(state).policy,/Version: 1.1/);assert.match(generateDocuments(state).policy,/must notify Risk and Compliance/)});
test("a scenario finding traces to an obligation",()=>assert.deepEqual(traceToObligation(createSeed(),"FIND-IM-008"),["OBL-IM-004"]));
test("candidate finding must be accepted before proposal",()=>assert.throws(()=>createProposal(createSeed(),"Human"),/must accept/));

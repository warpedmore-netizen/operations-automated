import test from "node:test";
import assert from "node:assert/strict";
import {
  isClosedStatus, OPERATIONS_BIBLE, priorityFor, recommendRecordType,
  sortWorkItems, suggestOperateLinks, summariseOperateNetwork, validateOperateRecord
} from "../operate-model.mjs";
import { actionsForOperateRecord } from "../operate-actions.mjs";

test("the initial Operations Bible covers the requested operational records in plain language", () => {
  const types = new Set(OPERATIONS_BIBLE.map((entry) => entry.type));
  for (const type of [
    "case", "request", "task", "incident", "problem", "change", "risk",
    "finding", "improvement", "scenario-test", "decision", "approval"
  ]) assert.equal(types.has(type), true, `${type} should be defined`);
  for (const entry of OPERATIONS_BIBLE) {
    assert.ok(entry.definition.length > 20);
    assert.ok(entry.useWhen);
    assert.ok(entry.avoidWhen);
    assert.ok(entry.approval.length > 20);
  }
});

test("Oppa Mate recommends a correctable record type from ordinary language", () => {
  assert.equal(recommendRecordType("Customers cannot log in after today's failed release").type, "incident");
  assert.equal(recommendRecordType("Why does this manual request keep happening?").type, "problem");
  const selected = validateOperateRecord({
    title: "Review the proposed visual identity",
    summary: "A bounded review is needed.",
    recordType: "request"
  });
  assert.equal(selected.recordType, "request");
  assert.equal(selected.recommendation.accepted, true);
});

test("priority remains impact-led while surfacing deadlines, risk and blocked work", () => {
  const reference = "2026-07-25T12:00:00.000Z";
  const routine = priorityFor({
    impact: 2, urgency: 2, risk_exposure: 1, control_implication: 1,
    blocking: false, strategic_value: 2, confidence: 4,
    created_at: "2026-07-24T12:00:00.000Z"
  }, reference);
  const material = priorityFor({
    impact: 5, urgency: 4, risk_exposure: 5, control_implication: 4,
    blocking: true, status: "blocked", strategic_value: 4, confidence: 4,
    due_at: "2026-07-24T12:00:00.000Z",
    created_at: "2026-07-10T12:00:00.000Z"
  }, reference);
  assert.ok(material.score > routine.score);
  assert.equal(material.overdue, true);
  assert.equal(material.blocked, true);
  assert.ok(material.reasons.includes("blocking other work"));
});

test("recommended and date orders remain deliberately separate", () => {
  const items = [
    { id: "older-high", createdAt: "2026-07-01", dueAt: null, priority: { score: 90 } },
    { id: "newer-low", createdAt: "2026-07-24", dueAt: "2026-07-26", priority: { score: 30 } }
  ];
  assert.equal(sortWorkItems(items, "recommended")[0].id, "older-high");
  assert.equal(sortWorkItems(items, "newest")[0].id, "newer-low");
  assert.equal(sortWorkItems(items, "deadline")[0].id, "newer-low");
});

test("resolved, fulfilled and accepted work remains visible until its explicit terminal state", () => {
  assert.equal(isClosedStatus("resolved"), false);
  assert.equal(isClosedStatus("fulfilled"), false);
  assert.equal(isClosedStatus("accepted"), false);
  assert.equal(isClosedStatus("closed"), true);
  assert.equal(isClosedStatus("done"), true);
});

test("invalid due dates are rejected before they can break ordering or display", () => {
  assert.throws(() => validateOperateRecord({
    title: "Check the release deadline",
    recordType: "task",
    dueAt: "not-a-date"
  }), /valid due date/i);
});

test("every open Operations Bible state has a working governed action", () => {
  for (const entry of OPERATIONS_BIBLE) {
    for (const status of entry.statuses.filter((value) => !isClosedStatus(value))) {
      const actions = actionsForOperateRecord({ recordType: entry.type, status });
      assert.ok(actions.length > 0, `${entry.type}:${status} should expose an action`);
      for (const item of actions) assert.ok(entry.statuses.includes(item.targetStatus));
    }
  }
  const approval = actionsForOperateRecord({ recordType: "approval", status: "ready" })
    .find((item) => item.id === "approve");
  assert.equal(approval.confirmation, "Approve");
  assert.equal(approval.noteRequired, true);
  assert.equal(approval.decision, true);
});

test("a Case cannot close while contained work remains open", () => {
  const actions = actionsForOperateRecord({ recordType: "case", status: "resolved" }, { openChildren: 2 });
  const close = actions.find((item) => item.id === "close-case");
  assert.equal(close.disabled, true);
  assert.match(close.unavailableReason, /2 contained records remain open/i);
  assert.equal(actions.find((item) => item.id === "reopen-case").disabled, false);
});

test("Oppa Mate suggests typed links only inside shared operational context", () => {
  const records = [
    { id: "case-1", recordType: "case", title: "Restore verification", status: "open" },
    { id: "incident-1", recordType: "incident", title: "Verification failed", caseId: "case-1", status: "reported" },
    { id: "problem-1", recordType: "problem", title: "Recurring provider timeout", caseId: "case-1", status: "investigating" },
    { id: "problem-2", recordType: "problem", title: "Unrelated cause", caseId: "case-2", status: "investigating" }
  ];
  const suggestions = suggestOperateLinks(records[1], records, []);
  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].fromRecordId, "incident-1");
  assert.equal(suggestions[0].toRecordId, "problem-1");
  assert.equal(suggestions[0].relationship, "evidences");
  assert.equal(suggestions[0].proposedBy, "Oppa Mate");
  assert.equal(suggestions.some((item) => item.toRecordId === "problem-2"), false);
});

test("the network turns structure into bounded operational signals", () => {
  const records = [
    { id: "case-1", record_type: "case", title: "Restore verification", status: "open", impact: 4 },
    { id: "incident-1", record_type: "incident", title: "Verification failed", case_id: "case-1", status: "reported", impact: 5 },
    { id: "task-1", record_type: "task", title: "Unlinked check", status: "to-do", blocking: true },
    { id: "risk-1", record_type: "risk", title: "Evidence loss", case_id: "case-1", parent_id: "incident-1", status: "open" }
  ];
  const links = [{
    id: "link-1", from_record_id: "incident-1", to_record_id: "risk-1",
    relationship: "evidences", proposed_via: "ai", state: "confirmed"
  }];
  const network = summariseOperateNetwork(records, links);
  assert.equal(network.totals.explicitLinks, 1);
  assert.equal(network.totals.aiConfirmedLinks, 1);
  assert.equal(network.totals.connectedOpen, 3);
  assert.equal(network.totals.unlinkedOpen, 1);
  assert.equal(network.totals.maxDepth, 3);
  assert.ok(network.signals.some((item) => item.kind === "connection-gap"));
  assert.ok(network.signals.some((item) => item.kind === "risk-gap"));
  assert.match(network.boundary, /not facts, approvals or risk acceptance/i);
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  isClosedStatus, OPERATIONS_BIBLE, priorityFor, recommendRecordType,
  sortWorkItems, validateOperateRecord
} from "../operate-model.mjs";

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

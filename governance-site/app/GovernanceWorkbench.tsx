/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";

type Organisation = { name: string; sector: string; size: string; services: string; dependencies: string; regulation: string; immediateGoal: string };
type Receipt = { pageId: string; version: number; webUrl: string; contentHash: string; publishedAt: string; actor: string };
type GovernanceDocument = {
  id: string; type: string; title: string; owner: string; summary: string; dependsOn: string[]; status: "candidate" | "draft" | "approved" | "live";
  version: number; content: string; contentHash: string; updatedAt: string; approval: null | { actor: string; approvedAt: string; scope: string; contentHash: string };
  draftReceipt: Receipt | null; liveReceipt: Receipt | null;
};
type GovernancePack = { id: string; title: string; status: string; version: number; generatedAt: string; documents: GovernanceDocument[] };
type AuditEvent = { at: string; action: string; detail: string; actor?: string };
type Workspace = { organisation: Organisation; governancePack: GovernancePack | null; publication: Record<string, any>; audit: AuditEvent[] };
type CatalogueItem = { id: string; type: string; title: string; owner: string; summary: string; dependsOn: string[] };
type Space = { id: string; key: string; name: string };
type PlanItem = { key: string; documentId?: string; title: string; action: string; reason: string; conflictType: string; webUrl?: string };
type Plan = { id: string; target: "draft" | "live"; spaceName: string; summary: Record<string, number>; publishable: boolean; confirmationPhrase: string; items: PlanItem[] };

const emptyOrganisation: Organisation = { name: "", sector: "", size: "", services: "", dependencies: "", regulation: "", immediateGoal: "" };
const blank: Workspace = { organisation: emptyOrganisation, governancePack: null, publication: {}, audit: [] };
const nav = ["Overview", "Organisation", "Governance pack", "Confluence", "Audit"];
const fieldLabels: Record<keyof Organisation, string> = {
  name: "Organisation name", sector: "Sector or purpose", size: "Current size", services: "Services and intended outcomes",
  dependencies: "Important people, systems and suppliers", regulation: "Legal, contractual and other obligations", immediateGoal: "Immediate governance outcome",
};

async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "The action could not be completed");
  return payload;
}

function statusLabel(status: GovernanceDocument["status"]) {
  return status === "candidate" ? "Candidate" : status === "draft" ? "In Confluence Draft" : status === "approved" ? "Approved" : "Live";
}

export function GovernanceWorkbench({ testerName }: { testerName: string }) {
  const [workspace, setWorkspace] = useState<Workspace>(blank);
  const [catalogue, setCatalogue] = useState<CatalogueItem[]>([]);
  const [active, setActive] = useState("Overview");
  const [saveState, setSaveState] = useState<"loading" | "saved" | "working" | "error">("loading");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [approvalPhrase, setApprovalPhrase] = useState("");
  const [publishPhrase, setPublishPhrase] = useState("");
  const [confluence, setConfluence] = useState<{ configured: boolean; siteUrl?: string; spaces: Space[]; draftConfirmation: string; liveConfirmation: string }>({ configured: false, spaces: [], draftConfirmation: "", liveConfirmation: "" });
  const [spaceId, setSpaceId] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);

  const pack = workspace.governancePack;
  const counts = useMemo(() => Object.fromEntries(["candidate", "draft", "approved", "live"].map((status) => [status, pack?.documents.filter((document) => document.status === status).length || 0])), [pack]);

  useEffect(() => {
    Promise.all([request("/api/workspace"), request("/api/governance"), request("/api/confluence")]).then(([workspaceResult, governanceResult, confluenceResult]) => {
      const loaded = { ...blank, ...(workspaceResult.state || {}), organisation: { ...emptyOrganisation, ...(workspaceResult.state?.organisation || {}) }, governancePack: governanceResult.pack || workspaceResult.state?.governancePack || null, publication: workspaceResult.state?.publication || {} };
      setWorkspace(loaded);
      setCatalogue(governanceResult.catalogue || []);
      setConfluence(confluenceResult);
      setSpaceId(loaded.publication?.spaceId || "");
      setSelected((loaded.governancePack?.documents || []).map((document: GovernanceDocument) => document.id));
      setEditing(Object.fromEntries((loaded.governancePack?.documents || []).map((document: GovernanceDocument) => [document.id, document.content])));
      setSaveState("saved");
    }).catch((error) => { setSaveState("error"); setMessage(error.message); });
  }, []);

  function applyState(state: Workspace) {
    setWorkspace({ ...blank, ...state, organisation: { ...emptyOrganisation, ...(state.organisation || {}) } });
    if (state.governancePack) setEditing(Object.fromEntries(state.governancePack.documents.map((document) => [document.id, document.content])));
    setPlan(null); setPublishPhrase("");
  }

  async function action(url: string, body: Record<string, unknown>, success: string) {
    setSaveState("working"); setMessage("");
    try {
      const result = await request(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (result.state) applyState(result.state);
      if (result.plan) { setPlan(result.plan); setPublishPhrase(""); }
      setSaveState("saved"); setMessage(success);
      return result;
    } catch (error) {
      setSaveState("error"); setMessage(error instanceof Error ? error.message : "The action failed"); throw error;
    }
  }

  async function saveOrganisation(next = workspace.organisation) {
    setSaveState("working");
    try {
      await request("/api/workspace", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: { ...workspace, organisation: next } }) });
      setWorkspace({ ...workspace, organisation: next }); setSaveState("saved"); setMessage("Organisation context saved.");
    } catch (error) { setSaveState("error"); setMessage(error instanceof Error ? error.message : "Save failed"); }
  }

  async function loadStarter() {
    const result = await request("/api/governance");
    const next = result.starterOrganisation as Organisation;
    setWorkspace({ ...workspace, organisation: next });
    await saveOrganisation(next);
  }

  async function generatePack() {
    const result = await action("/api/governance", { action: "generate" }, "Twelve connected governance candidates are ready for review.");
    const ids = result.state.governancePack.documents.map((document: GovernanceDocument) => document.id);
    setSelected(ids); setActive("Governance pack");
  }

  async function saveDocument(document: GovernanceDocument) {
    await action("/api/governance", { action: "update-document", documentId: document.id, content: editing[document.id] }, `${document.title} saved as a new candidate version.`);
  }

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  async function selectSpace() {
    await action("/api/confluence", { action: "select-space", spaceId }, "Confluence governance destination saved.");
  }

  async function preview(target: "draft" | "live") {
    await action("/api/confluence", { action: "preview", target, documentIds: selected }, `${target === "draft" ? "Draft" : "Live"} publication plan prepared.`);
  }

  async function publishPlan() {
    if (!plan) return;
    await action("/api/confluence", { action: "publish", planId: plan.id, confirmation: publishPhrase }, plan.target === "draft" ? "Reviewed candidates are now in Confluence Draft." : "Approved governance is now Live in Confluence.");
  }

  async function approveSelected() {
    await action("/api/governance", { action: "approve", documentIds: selected, confirmation: approvalPhrase }, "The selected Draft versions are approved for private internal use.");
    setApprovalPhrase("");
  }

  const views: Record<string, React.ReactNode> = {
    Overview: <>
      <section className="hero governance-hero"><div><span className="kicker">USE OUR GOVERNANCE TO GOVERN OUR BUSINESS</span><h1>From connected candidate to governed Live document.</h1><p>Generate the Operations Automated core governance set, review each document, publish a controlled Draft to Confluence, approve the exact version and promote it into Live.</p><div className="actions">{pack ? <button onClick={() => setActive("Governance pack")}>Continue governance pack</button> : <button onClick={generatePack}>Generate all 12 documents</button>}<button className="quiet" onClick={() => setActive("Confluence")}>Open publication flow</button></div></div><div className="signal"><span>Current governance state</span><strong>{pack ? `${pack.documents.length} connected documents` : "Not generated"}</strong><p>{pack ? `${counts.candidate} candidate · ${counts.draft} Draft · ${counts.approved} approved · ${counts.live} Live` : "The starter is ready to generate from the Operations Automated context."}</p></div></section>
      <section><span className="kicker">ONE GOVERNED LOOP</span><h2>What the app now does</h2><div className="journey-grid">{[["01","Generate","Creates the connected business, policy, framework, procedure and register set."],["02","Review","Lets you inspect and amend every candidate before it leaves the app."],["03","Draft","Writes only the reviewed plan into the Confluence Draft tree."],["04","Approve","Records you, the exact content fingerprint, scope, version and time."],["05","Live","Rechecks remote versions and promotes only unchanged approved documents."]].map(([number,title,copy]) => <article key={number}><span>{number}</span><strong>{title}</strong><p>{copy}</p></article>)}</div></section>
      <div className="boundary"><strong>Authority remains explicit.</strong><p>Draft publication is not approval. Approval applies to the selected content versions only. Live promotion stops if a document or Confluence page changed after review.</p></div>
    </>,
    Organisation: <><section className="intro"><span className="kicker">BUSINESS CONTEXT</span><h1>Define what this governance governs.</h1><p>The supplied starter describes Operations Automated today. Amend it whenever the business model or operating boundary changes.</p></section><div className="actions organisation-actions"><button onClick={loadStarter}>Use Operations Automated starter</button><button className="quiet" onClick={() => saveOrganisation()}>Save current context</button></div><section className="form-grid">{(Object.keys(fieldLabels) as Array<keyof Organisation>).map((key) => <label className={["services","dependencies","regulation","immediateGoal"].includes(key) ? "wide" : ""} key={key}><span>{fieldLabels[key]}</span><textarea rows={key === "name" ? 1 : 3} value={workspace.organisation[key]} onChange={(event) => setWorkspace({ ...workspace, organisation: { ...workspace.organisation, [key]: event.target.value } })}/></label>)}</section></>,
    "Governance pack": <><section className="intro"><span className="kicker">CONNECTED GOVERNANCE PACK</span><h1>Review the documents that will govern Operations Automated.</h1><p>All twelve are selected by default. Edit a candidate before Draft publication; any later edit invalidates its previous approval and requires a new Draft.</p></section>{!pack ? <section className="catalogue"><div className="catalogue-head"><div><h2>Initial core structure</h2><p>{catalogue.length} connected documents are ready to generate.</p></div><button onClick={generatePack}>Generate all documents</button></div>{catalogue.map((item) => <article key={item.id}><span>{item.type}</span><div><strong>{item.title}</strong><p>{item.summary}</p></div><small>{item.id}</small></article>)}</section> : <><div className="pack-toolbar"><div><strong>{selected.length} selected</strong><span>{counts.candidate} candidate · {counts.draft} Draft · {counts.approved} approved · {counts.live} Live</span></div><div><button className="quiet" onClick={() => setSelected(pack.documents.map((document) => document.id))}>Select all</button><button className="quiet" onClick={() => setSelected([])}>Clear</button><button onClick={() => setActive("Confluence")}>Continue to Confluence</button></div></div><section className="governance-documents">{pack.documents.map((document) => <details className={`governance-document status-${document.status}`} key={document.id}><summary><input type="checkbox" aria-label={`Select ${document.title}`} checked={selected.includes(document.id)} onClick={(event) => event.stopPropagation()} onChange={() => toggle(document.id)}/><div><span>{document.type} · {document.id} · v{document.version}</span><strong>{document.title}</strong><p>{document.summary}</p></div><em>{statusLabel(document.status)}</em></summary><div className="document-body"><div className="document-links"><span>Owner: {document.owner}</span><span>Connected to: {document.dependsOn.join(", ") || "Business purpose"}</span><span>Fingerprint: {document.contentHash}</span>{document.draftReceipt?.webUrl ? <a href={document.draftReceipt.webUrl} target="_blank" rel="noreferrer">Open Confluence page ↗</a> : null}</div><textarea value={editing[document.id] ?? document.content} onChange={(event) => setEditing({ ...editing, [document.id]: event.target.value })}/><button disabled={(editing[document.id] ?? document.content) === document.content} onClick={() => saveDocument(document)}>Save revised candidate</button>{document.approval ? <p className="approval-note">Approved by {document.approval.actor} on {new Date(document.approval.approvedAt).toLocaleString("en-GB")} for {document.approval.scope}.</p> : null}</div></details>)}</section></>}</>,
    Confluence: <><section className="intro"><span className="kicker">DRAFT → APPROVAL → LIVE</span><h1>Publish governance without bypassing governance.</h1><p>The app owns the connected document versions and decisions. Confluence is the human reading layer. Every write is previewed, confirmed, version-checked and retained.</p></section>{!confluence.configured ? <div className="connection-blocked"><span>CONNECTION NOT ENABLED</span><h2>The application is ready; the server-side Confluence credential is not configured.</h2><p>Enable the private connection using the existing Operations Automated Atlassian site, scoped token and minimum write permission. The credential never appears in the browser or workspace record.</p></div> : <><section className="connection-panel"><div><span>CONNECTED CONFLUENCE SITE</span><strong>{confluence.siteUrl}</strong></div><label><span>Governance space</span><select value={spaceId} onChange={(event) => setSpaceId(event.target.value)}><option value="">Choose a space</option>{confluence.spaces.map((space) => <option key={space.id} value={space.id}>{space.name}{space.key ? ` (${space.key})` : ""}</option>)}</select></label><button disabled={!spaceId || spaceId === workspace.publication?.spaceId} onClick={selectSpace}>Use this space</button></section><section className="publication-flow"><article><span>01 · DRAFT</span><h2>Send reviewed candidates to Draft</h2><p>Creates the managed Governance and Draft tree, or updates pages only when the retained Confluence version still matches.</p><button disabled={!pack || !spaceId || !selected.length} onClick={() => preview("draft")}>Preview Draft plan</button></article><article><span>02 · APPROVE</span><h2>Approve the exact Draft versions</h2><p>Select documents already published to Draft, review their Confluence pages, then type the approval phrase.</p><input value={approvalPhrase} onChange={(event) => setApprovalPhrase(event.target.value)} placeholder="Approve selected governance documents for internal use"/><button disabled={!pack || !selected.some((id) => pack.documents.find((document) => document.id === id)?.status === "draft")} onClick={approveSelected}>Approve selected Drafts</button></article><article><span>03 · LIVE</span><h2>Promote approved governance</h2><p>Rechecks the approved fingerprint and current Confluence page version before moving the managed page into Live.</p><button disabled={!pack || !selected.some((id) => ["approved","live"].includes(pack.documents.find((document) => document.id === id)?.status || ""))} onClick={() => preview("live")}>Preview Live promotion</button></article></section></>}{plan ? <section className={`publication-plan ${plan.publishable ? "plan-ready" : "plan-blocked"}`}><div className="plan-head"><div><span>{plan.target.toUpperCase()} PUBLICATION PLAN</span><h2>{plan.spaceName}</h2><p>{plan.summary.create} create · {plan.summary.update} update · {plan.summary.unchanged} unchanged · {plan.summary.conflict} conflict</p></div><strong>{plan.publishable ? "Ready for confirmation" : "Blocked"}</strong></div><div className="plan-items">{plan.items.map((item) => <article key={item.key}><span className={`plan-action action-${item.action}`}>{item.action}</span><div><strong>{item.title}</strong><p>{item.reason}</p></div>{item.webUrl ? <a href={item.webUrl} target="_blank" rel="noreferrer">Open ↗</a> : null}</article>)}</div>{plan.publishable ? <div className="publish-confirmation"><label><span>Type this exact phrase: <strong>{plan.confirmationPhrase}</strong></span><input value={publishPhrase} onChange={(event) => setPublishPhrase(event.target.value)}/></label><button disabled={publishPhrase !== plan.confirmationPhrase} onClick={publishPlan}>{plan.target === "draft" ? "Send reviewed Drafts" : "Promote approved documents to Live"}</button></div> : <p>Resolve the listed conflict, then prepare a fresh plan.</p>}</section> : null}</>,
    Audit: <><section className="intro"><span className="kicker">DECISIONS AND PUBLICATION RECEIPTS</span><h1>Governance audit trail</h1><p>Every generation, revision, plan, Draft write, approval and Live promotion is attributed and retained.</p></section>{workspace.audit.length ? <div className="audit">{[...workspace.audit].reverse().map((event, index) => <article key={`${event.at}-${index}`}><time>{new Date(event.at).toLocaleString("en-GB")}</time><strong>{event.action}</strong><span>{event.detail}{event.actor ? ` · ${event.actor}` : ""}</span></article>)}</div> : <div className="empty"><strong>No governed actions recorded yet.</strong></div>}</>,
  };

  return <div className="shell"><aside><div className="brand"><b>OA</b><div><strong>Operations Automated</strong><span>Connected Governance</span></div></div><nav>{nav.map((item, index) => <button className={active === item ? "active" : ""} onClick={() => { setActive(item); window.scrollTo({ top: 0, behavior: "smooth" }); }} key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</button>)}</nav><div className="save"><i className={saveState}/>{saveState === "loading" ? "Loading" : saveState === "working" ? "Working" : saveState === "error" ? "Action needs attention" : "Governance saved"}</div></aside><main><header><div><span>PRIVATE INTERNAL GOVERNANCE · {testerName}</span><strong>{workspace.organisation.name || "Operations Automated"}</strong></div><div className="header-actions"><a href="/signout-with-chatgpt?return_to=%2F">Sign out</a></div></header>{message ? <div className={`app-message ${saveState === "error" ? "error" : "success"}`}>{message}<button aria-label="Dismiss message" onClick={() => setMessage("")}>×</button></div> : null}<div className="content">{views[active]}</div><footer>Private internal use · Draft is not approval · Live promotion requires an exact approved version</footer></main></div>;
}

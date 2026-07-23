"use client";

import { useEffect, useMemo, useState } from "react";

type Item = { id: string; type: string; title: string; status: "current" | "outdated" | "draft" | "missing" };
type Connector = { mode: "not-configured" | "mock" | "ready"; reference: string };
type Workspace = {
  organisation: { name: string; sector: string; size: string; services: string; dependencies: string; regulation: string; immediateGoal: string };
  inventory: Item[];
  decisions: Record<string, "accepted" | "deferred" | "rejected">;
  package: Array<{ id: string; title: string; status: "candidate" | "accepted" }>;
  connectors: Record<string, Connector>;
  audit: Array<{ at: string; action: string; detail: string }>;
};
type Recommendation = { id: string; title: string; rationale: string; priority: "Now" | "Next" | "Later"; outputs: string[] };

const blank: Workspace = {
  organisation: { name: "", sector: "", size: "", services: "", dependencies: "", regulation: "", immediateGoal: "" },
  inventory: [], decisions: {}, package: [],
  connectors: {
    confluence: { mode: "not-configured", reference: "" },
    notion: { mode: "not-configured", reference: "" },
    googleDocs: { mode: "not-configured", reference: "" },
    word: { mode: "ready", reference: "" },
  },
  audit: [],
};

const presets = [
  ["Digital service", { name: "Northstar Digital Services", sector: "Digital services", size: "25 people", services: "Hosted workflow and customer-support software", dependencies: "Cloud hosting, identity provider and payment processor", regulation: "Contracts, privacy and general business obligations", immediateGoal: "Create a proportionate incident-management foundation" }, []],
  ["Digital bank", { name: "Harbourline Bank", sector: "Financial services", size: "900 people", services: "Current accounts, cards and mobile banking", dependencies: "Core banking, card processor, cloud and contact centre", regulation: "Fictional operational-resilience and consumer obligations", immediateGoal: "Connect fragmented controls, policies and evidence" }, [["Policy", "Incident Management Policy", "current"], ["Control catalogue", "Operational Control Catalogue", "current"], ["Procedure", "Major Incident Procedure", "outdated"]]],
  ["Manufacturer", { name: "Redwood Components", sector: "Manufacturing", size: "420 people", services: "Precision components for industrial customers", dependencies: "Production line, specialist suppliers, logistics and safety systems", regulation: "Safety, product quality and contractual obligations", immediateGoal: "Improve supplier failure and continuity governance" }, [["Procedure", "Site Emergency Procedure", "current"], ["Runbook", "Production Recovery Runbook", "draft"]]],
  ["Charity", { name: "Kindred Reach", sector: "Charity", size: "60 staff and 180 volunteers", services: "Community support and safeguarding", dependencies: "Volunteers, local partners, case system and donations", regulation: "Safeguarding, charity governance and privacy", immediateGoal: "Create usable safeguarding and continuity documentation" }, [["Policy", "Safeguarding Policy", "current"]]],
  ["Professional services", { name: "Meridian Advisory", sector: "Professional services", size: "140 people", services: "Advisory projects and managed services", dependencies: "Specialist people, client knowledge, collaboration tools and subcontractors", regulation: "Professional duties, confidentiality and client contracts", immediateGoal: "Reduce key-person risk and standardise handovers" }, [["Standard", "Client Delivery Standard", "current"], ["Procedure", "Project Handover Procedure", "outdated"]]],
] as const;

const documentTypes = ["Policy", "Procedure", "Runbook", "Standard", "Control catalogue", "Evidence standard", "Scenario library"];
const nav = ["Overview", "Organisation", "Inventory", "Recommendations", "Governance package", "Connectors", "Audit"];

function routeFor(workspace: Workspace): Recommendation[] {
  const types = new Set(workspace.inventory.filter((item) => item.status !== "missing").map((item) => item.type));
  const result: Recommendation[] = [];
  if (!workspace.organisation.name || !workspace.organisation.services) result.push({ id: "context", title: "Complete operating context", rationale: "Useful governance and scenarios depend on services, dependencies and authority.", priority: "Now", outputs: ["Organisation profile", "Service and dependency map"] });
  if (!types.has("Policy")) result.push({ id: "policy", title: "Create minimum policy authority", rationale: "No current policy is recorded. Start with purpose, ownership and mandatory expectations.", priority: "Now", outputs: ["Policy", "Responsibility matrix"] });
  if (!types.has("Procedure")) result.push({ id: "procedure", title: "Create an executable procedure", rationale: "No current procedure translates expectations into actions and evidence.", priority: types.has("Policy") ? "Now" : "Next", outputs: ["Procedure", "Escalation path", "Evidence requirements"] });
  if (!types.has("Control catalogue")) result.push({ id: "controls", title: "Connect controls and evidence", rationale: "Control intent, operation and evidence are not visible as connected records.", priority: "Next", outputs: ["Control catalogue", "Evidence map"] });
  if (!types.has("Scenario library") && workspace.organisation.services) result.push({ id: "scenarios", title: "Design context-specific validation", rationale: `Test ${workspace.organisation.services}, its dependencies and decision authority—not a generic scenario.`, priority: "Later", outputs: ["Scenario hypotheses", "Participant and evidence plan"] });
  const outdated = workspace.inventory.filter((item) => item.status === "outdated");
  if (outdated.length) result.push({ id: "refresh", title: "Review outdated material", rationale: `${outdated.length} recorded artefact${outdated.length === 1 ? " is" : "s are"} outdated.`, priority: "Now", outputs: outdated.map((item) => item.title) });
  return result;
}

function readiness(workspace: Workspace) {
  const types = new Set(workspace.inventory.filter((item) => item.status === "current").map((item) => item.type));
  const level = (n: number) => ["Foundational", "Developing", "Established", "Assured"][Math.min(n, 3)];
  return [
    ["Ownership", level(workspace.organisation.name && workspace.organisation.immediateGoal ? 1 : 0), workspace.organisation.name ? "Context and objective recorded" : "Context incomplete"],
    ["Documentation", level(Math.min(types.size, 3)), `${types.size} current document type${types.size === 1 ? "" : "s"}`],
    ["Controls", level(types.has("Control catalogue") ? 2 : 0), types.has("Control catalogue") ? "Catalogue recorded" : "No connected catalogue"],
    ["Evidence", level(types.has("Evidence standard") ? 2 : 0), types.has("Evidence standard") ? "Standard recorded" : "Evidence expectations incomplete"],
    ["Testing", level(types.has("Scenario library") ? 2 : 0), types.has("Scenario library") ? "Scenario library recorded" : "Context required before testing"],
    ["Connectivity", level(Object.values(workspace.connectors).some((item) => item.mode === "ready") ? 1 : 0), "Readiness tracked separately from governance quality"],
  ];
}

export function GovernanceLab({ testerName }: { testerName: string }) {
  const [workspace, setWorkspace] = useState<Workspace>(blank);
  const [active, setActive] = useState("Overview");
  const [saveState, setSaveState] = useState<"loading" | "saved" | "saving" | "error">("loading");
  const [newItem, setNewItem] = useState({ type: "Policy", title: "", status: "current" as Item["status"] });
  const [connectorChecks, setConnectorChecks] = useState<Record<string, string>>({});
  const recommendations = useMemo(() => routeFor(workspace), [workspace]);
  const dimensions = useMemo(() => readiness(workspace), [workspace]);

  useEffect(() => {
    Promise.all([
      fetch("/api/workspace").then((response) => response.json()),
      fetch("/api/connectors").then((response) => response.json()),
    ]).then(([workspaceData, connectorData]) => {
      const stored = workspaceData.state ? { ...blank, ...workspaceData.state } : blank;
      const storedConnectors = { ...blank.connectors, ...(stored.connectors || {}) };
      const connectors = Object.fromEntries(Object.entries(storedConnectors).map(([key, value]) => {
        const status = Array.isArray(connectorData.connectors)
          ? connectorData.connectors.find((item: { id: string }) => item.id === key)
          : null;
        return [key, { ...value, mode: status?.configured ? "ready" : value.mode === "ready" ? "not-configured" : value.mode }];
      }));
      setWorkspace({ ...stored, connectors });
      setSaveState("saved");
    }).catch(() => setSaveState("error"));
  }, []);

  async function testConnector(key: string) {
    const connector = workspace.connectors[key];
    setConnectorChecks((current) => ({ ...current, [key]: "Checking read access…" }));
    try {
      const response = await fetch("/api/connectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connector: key, reference: connector.reference }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Connector check failed");
      const label = payload.result.title || payload.result.object || payload.result.reference;
      setConnectorChecks((current) => ({ ...current, [key]: `Read access confirmed: ${label}` }));
    } catch (error) {
      setConnectorChecks((current) => ({ ...current, [key]: error instanceof Error ? error.message : "Connector check failed" }));
    }
  }

  async function save(next: Workspace, action?: string, detail = "") {
    const updated = action ? { ...next, audit: [...next.audit, { at: new Date().toISOString(), action, detail }] } : next;
    setWorkspace(updated); setSaveState("saving");
    try {
      const response = await fetch("/api/workspace", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: updated }) });
      if (!response.ok) throw new Error();
      setSaveState("saved");
    } catch { setSaveState("error"); }
  }

  function loadPreset(index: number) {
    const [label, organisation, items] = presets[index];
    const inventory = items.map((item, i) => ({ id: `preset-${index}-${i}`, type: item[0], title: item[1], status: item[2] as Item["status"] }));
    void save({ ...workspace, organisation: { ...organisation }, inventory, decisions: {}, package: [] }, "Fictional context loaded", label);
  }

  function assemble() {
    const outputs = recommendations.filter((r) => workspace.decisions[r.id] === "accepted").flatMap((r) => r.outputs);
    const unique = outputs.filter((value, index) => outputs.indexOf(value) === index);
    const components = unique.map((title, index) => ({ id: `COMP-${String(index + 1).padStart(3, "0")}`, title, status: "candidate" as const }));
    void save({ ...workspace, package: components }, "Governance package assembled", `${components.length} components`);
    setActive("Governance package");
  }

  const views: Record<string, React.ReactNode> = {
    Overview: <><section className="hero"><div><span className="kicker">EXTERNAL TEST LAB · FICTIONAL DATA ONLY</span><h1>Build governance that stays connected to the work.</h1><p>Start with what an organisation has. Identify what is missing, create only what is proportionate, test it against operating context, and retain every decision.</p><div className="actions"><button onClick={() => setActive("Organisation")}>Start assessment</button><button className="quiet" onClick={() => setActive("Recommendations")}>View current route</button></div></div><div className="signal"><span>Current organisation</span><strong>{workspace.organisation.name || "Not yet defined"}</strong><p>{workspace.organisation.immediateGoal || "Complete the organisation profile to receive a tailored route."}</p></div></section><section><span className="kicker">CAPABILITY, NOT A SINGLE SCORE</span><h2>Readiness by dimension</h2><div className="dimension-grid">{dimensions.map(([name, level, evidence]) => <article key={name}><span>{name}</span><strong>{level}</strong><p>{evidence}</p></article>)}</div></section><section className="principle"><b>01</b><div><h2>Documents are released views—not the system.</h2><p>Ownership, requirements, controls, procedures, evidence, tests and approvals remain structured underneath.</p></div></section></>,
    Organisation: <><section className="intro"><span className="kicker">CONTEXT BEFORE CONTENT</span><h1>Describe the organisation proportionately.</h1><p>Use fictional or non-confidential information during external testing.</p></section><section><h2>Try a fictional context</h2><div className="presets">{presets.map((preset, index) => <button onClick={() => loadPreset(index)} key={preset[0]}>{preset[0]}</button>)}</div></section><section className="form-grid">{Object.entries({ name: "Organisation name", sector: "Sector", size: "Approximate size", services: "Important products or services", dependencies: "Critical people, technology and suppliers", regulation: "Regulatory, contractual or safety context", immediateGoal: "Immediate problem or desired outcome" }).map(([key, label]) => <label className={["services", "dependencies", "regulation", "immediateGoal"].includes(key) ? "wide" : ""} key={key}><span>{label}</span><textarea rows={key === "name" ? 1 : 3} value={workspace.organisation[key as keyof Workspace["organisation"]]} onChange={(e) => setWorkspace({ ...workspace, organisation: { ...workspace.organisation, [key]: e.target.value } })} /></label>)}<button onClick={() => void save(workspace, "Organisation profile updated", workspace.organisation.name)}>Save profile</button></section></>,
    Inventory: <><section className="intro"><span className="kicker">START WITH WHAT EXISTS</span><h1>Documentation inventory</h1><p>Record useful material without assuming its existence proves operational effectiveness.</p></section><section className="add-row"><select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}>{documentTypes.map((type) => <option key={type}>{type}</option>)}</select><input placeholder="Title" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} /><select value={newItem.status} onChange={(e) => setNewItem({ ...newItem, status: e.target.value as Item["status"] })}><option value="current">Current</option><option value="outdated">Outdated</option><option value="draft">Draft</option><option value="missing">Known gap</option></select><button disabled={!newItem.title.trim()} onClick={() => { const item = { ...newItem, id: crypto.randomUUID() }; void save({ ...workspace, inventory: [...workspace.inventory, item] }, "Inventory item added", item.title); setNewItem({ type: "Policy", title: "", status: "current" }); }}>Add</button></section><section>{workspace.inventory.length ? <div className="table">{workspace.inventory.map((item) => <div className="row" key={item.id}><div><strong>{item.title}</strong><span>{item.type}</span></div><span className={`status ${item.status}`}>{item.status}</span><button className="remove" onClick={() => void save({ ...workspace, inventory: workspace.inventory.filter((x) => x.id !== item.id) }, "Inventory item removed", item.title)}>Remove</button></div>)}</div> : <div className="empty"><strong>No documentation recorded.</strong><p>That is a valid starting point. We will recommend the smallest useful foundation.</p></div>}</section></>,
    Recommendations: <><section className="intro"><span className="kicker">TAILORED ROUTE</span><h1>Recommended next governance work</h1><p>Recommendations are hypotheses. Accept, defer or reject each one.</p></section><section className="recommendations">{recommendations.map((item) => <article key={item.id}><span className="priority">{item.priority}</span><div><h2>{item.title}</h2><p>{item.rationale}</p><div className="chips">{item.outputs.map((output) => <span key={output}>{output}</span>)}</div></div><div className="decisions">{(["accepted", "deferred", "rejected"] as const).map((decision) => <button className={workspace.decisions[item.id] === decision ? "selected" : ""} onClick={() => void save({ ...workspace, decisions: { ...workspace.decisions, [item.id]: decision } }, "Recommendation disposition", `${item.id}: ${decision}`)} key={decision}>{decision}</button>)}</div></article>)}</section><button className="primary" disabled={!recommendations.some((r) => workspace.decisions[r.id] === "accepted")} onClick={assemble}>Assemble accepted work</button></>,
    "Governance package": <><section className="intro"><span className="kicker">HUMAN REVIEW REQUIRED</span><h1>Candidate governance package</h1><p>Components are reviewed individually. Technical generation never grants approval.</p></section><section>{workspace.package.length ? <div className="package-grid">{workspace.package.map((component) => <article key={component.id}><span>{component.id}</span><h2>{component.title}</h2><p>Generated from an accepted recommendation. Detailed authoring and provenance follow.</p><button className={component.status === "accepted" ? "selected" : ""} onClick={() => void save({ ...workspace, package: workspace.package.map((item) => item.id === component.id ? { ...item, status: item.status === "accepted" ? "candidate" : "accepted" } : item) }, "Package component reviewed", component.title)}>{component.status === "accepted" ? "Accepted for drafting" : "Accept for drafting"}</button></article>)}</div> : <div className="empty"><strong>No package yet.</strong><button onClick={() => setActive("Recommendations")}>Review recommendations</button></div>}</section></>,
    Connectors: <><section className="intro"><span className="kicker">CONNECTORS WITHOUT LOCK-IN</span><h1>Knowledge and document surfaces</h1><p>The governance service remains canonical. Each connector adapts structure, permissions and conflicts.</p></section><section className="connector-grid">{[["confluence", "Confluence", "Space, parent-page and version-aware publication"], ["notion", "Notion", "Page ancestry, properties, blocks and last-edited checks"], ["googleDocs", "Google Docs", "Document IDs, structural reading and revision-aware writing"], ["word", "Word documents", "Microsoft Graph metadata, structure extraction and controlled DOCX publication"]].map(([key, title, description]) => { const connector = workspace.connectors[key]; return <article key={key}><div className="connector-head"><b>{title[0]}</b><span className={`status ${connector.mode === "ready" ? "current" : "draft"}`}>{connector.mode.replace("-", " ")}</span></div><h2>{title}</h2><p>{description}</p><label><span>Test document or page ID</span><input value={connector.reference} placeholder="Use fictional or non-confidential test content" onChange={(e) => setWorkspace({ ...workspace, connectors: { ...workspace.connectors, [key]: { ...connector, reference: e.target.value } } })} /></label>{connector.mode === "ready" ? <button disabled={!connector.reference.trim()} onClick={() => void testConnector(key)}>Test read access</button> : <button onClick={() => void save({ ...workspace, connectors: { ...workspace.connectors, [key]: { ...connector, mode: connector.mode === "mock" ? "not-configured" : "mock" } } }, "Connector mode changed", `${title}: mock`)}>{connector.mode === "mock" ? "Disable mock" : "Enable mock"}</button>} {connectorChecks[key] ? <p className="connector-check">{connectorChecks[key]}</p> : null}</article>; })}</section><div className="boundary"><strong>Live publication remains release-gated.</strong><p>Read probes activate only when the service owner supplies minimum-permission test credentials. Writes will use the same adapters only after a candidate has passed human approval and conflict checks.</p></div></>,
    Audit: <><section className="intro"><span className="kicker">RETAINED DECISIONS</span><h1>Workspace audit trail</h1></section><section>{workspace.audit.length ? <div className="audit">{[...workspace.audit].reverse().map((event, index) => <article key={`${event.at}-${index}`}><time>{new Date(event.at).toLocaleString("en-GB")}</time><strong>{event.action}</strong><span>{event.detail}</span></article>)}</div> : <div className="empty"><strong>No actions recorded yet.</strong></div>}</section></>,
  };

  return <div className="shell"><aside><div className="brand"><b>N</b><div><strong>Northstar</strong><span>Governance Lab</span></div></div><nav>{nav.map((item, index) => <button className={active === item ? "active" : ""} onClick={() => setActive(item)} key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</button>)}</nav><div className="save"><i className={saveState} />{saveState === "loading" ? "Loading" : saveState === "saving" ? "Saving" : saveState === "error" ? "Save unavailable" : "Progress saved"}</div></aside><main><header><div><span>PROPOSED EXTERNAL TEST · {testerName}</span><strong>{workspace.organisation.name || "New governance workspace"}</strong></div><div className="header-actions"><a href="/signout-with-chatgpt?return_to=%2F">Sign out</a><button onClick={() => { if (confirm("Reset this workspace?")) void save(blank, "Workspace reset"); }}>Reset</button></div></header><div className="content">{views[active]}</div><footer>Fictional demonstration only · No compliance determination · AI may propose but cannot approve</footer></main></div>;
}

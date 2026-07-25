"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildGovernanceComponents,
  businessFoundationOutputs,
  defaultAuthority,
  operationsAutomatedInventory,
  operationsAutomatedProfile,
  type AuthorityProfile,
  type GovernanceComponent,
  type OrganisationProfile,
} from "../lib/business-governance";

type Item = { id: string; type: string; title: string; status: "current" | "outdated" | "proposed" | "draft" | "missing" };
type Connector = { mode: "not-configured" | "mock" | "ready"; reference: string };
type Workspace = {
  organisation: OrganisationProfile;
  authority: AuthorityProfile;
  inventory: Item[];
  decisions: Record<string, "accepted" | "deferred" | "rejected">;
  package: GovernanceComponent[];
  connectors: Record<string, Connector>;
  audit: Array<{ at: string; action: string; detail: string }>;
};
type Recommendation = { id: string; title: string; rationale: string; priority: "Now" | "Next" | "Later"; outputs: string[] };

const blank: Workspace = {
  organisation: { name: "", sector: "", size: "", services: "", dependencies: "", regulation: "", immediateGoal: "" },
  authority: defaultAuthority,
  inventory: [], decisions: {}, package: [],
  connectors: {
    confluence: { mode: "not-configured", reference: "" },
    notion: { mode: "not-configured", reference: "" },
    googleDocs: { mode: "not-configured", reference: "" },
    word: { mode: "not-configured", reference: "" },
  },
  audit: [],
};

const presets = [
  ["Operations Automated", operationsAutomatedProfile, operationsAutomatedInventory],
  ["Digital service", { name: "Beacon Digital Services", sector: "Digital services", size: "25 people", services: "Hosted workflow and customer-support software", dependencies: "Cloud hosting, identity provider and payment processor", regulation: "Contracts, privacy and general business obligations", immediateGoal: "Create a proportionate incident-management foundation" }, []],
  ["Digital bank", { name: "Harbourline Bank", sector: "Financial services", size: "900 people", services: "Current accounts, cards and mobile banking", dependencies: "Core banking, card processor, cloud and contact centre", regulation: "Fictional operational-resilience and consumer obligations", immediateGoal: "Connect fragmented controls, policies and evidence" }, [["Policy", "Incident Management Policy", "current"], ["Control catalogue", "Operational Control Catalogue", "current"], ["Procedure", "Major Incident Procedure", "outdated"]]],
  ["Manufacturer", { name: "Redwood Components", sector: "Manufacturing", size: "420 people", services: "Precision components for industrial customers", dependencies: "Production line, specialist suppliers, logistics and safety systems", regulation: "Safety, product quality and contractual obligations", immediateGoal: "Improve supplier failure and continuity governance" }, [["Procedure", "Site Emergency Procedure", "current"], ["Runbook", "Production Recovery Runbook", "draft"]]],
  ["Charity", { name: "Kindred Reach", sector: "Charity", size: "60 staff and 180 volunteers", services: "Community support and safeguarding", dependencies: "Volunteers, local partners, case system and donations", regulation: "Safeguarding, charity governance and privacy", immediateGoal: "Create usable safeguarding and continuity documentation" }, [["Policy", "Safeguarding Policy", "current"]]],
  ["Professional services", { name: "Meridian Advisory", sector: "Professional services", size: "140 people", services: "Advisory projects and managed services", dependencies: "Specialist people, client knowledge, collaboration tools and subcontractors", regulation: "Professional duties, confidentiality and client contracts", immediateGoal: "Reduce key-person risk and standardise handovers" }, [["Standard", "Client Delivery Standard", "current"], ["Procedure", "Project Handover Procedure", "outdated"]]],
] as const;

const documentTypes = ["Framework", "Policy", "Procedure", "Runbook", "Standard", "Control catalogue", "Evidence standard", "Scenario library"];
const nav = ["Overview", "Organisation", "Authority", "Sources", "Inventory", "Recommendations", "Governance package", "Audit"];

function routeFor(workspace: Workspace): Recommendation[] {
  const types = new Set(workspace.inventory.filter((item) => item.status !== "missing").map((item) => item.type));
  const result: Recommendation[] = [];
  if (!workspace.organisation.name || !workspace.organisation.services) result.push({ id: "context", title: "Complete operating context", rationale: "Useful governance and scenarios depend on services, dependencies and authority.", priority: "Now", outputs: ["Organisation profile", "Service and dependency map"] });
  if (workspace.organisation.name.trim().toLowerCase() === "operations automated") {
    result.push({
      id: "oa-business-foundation",
      title: "Create the Operations Automated business-governance foundation",
      rationale: "The existing project records govern methodology development and publication, but they do not yet form a complete role-based company policy and control system. Create the smallest connected foundation without changing methodology meaning.",
      priority: "Now",
      outputs: [...businessFoundationOutputs],
    });
    return result;
  }
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

export function GovernanceLab() {
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
      const authority = { ...defaultAuthority, ...(stored.authority || {}) };
      const storedConnectors = { ...blank.connectors, ...(stored.connectors || {}) };
      const connectors = Object.fromEntries(Object.entries(storedConnectors).map(([key, value]) => {
        const status = Array.isArray(connectorData.connectors)
          ? connectorData.connectors.find((item: { id: string }) => item.id === key)
          : null;
        return [key, { ...value, mode: status?.configured ? "ready" : value.mode === "ready" ? "not-configured" : value.mode }];
      }));
      setWorkspace({ ...stored, authority, connectors });
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
    const isDogfood = label === "Operations Automated";
    void save(
      { ...workspace, organisation: { ...organisation }, authority: defaultAuthority, inventory, decisions: {}, package: [] },
      isDogfood ? "Private dogfooding context loaded" : "Fictional context loaded",
      label,
    );
  }

  function assemble() {
    const outputs = recommendations.filter((r) => workspace.decisions[r.id] === "accepted").flatMap((r) => r.outputs);
    const unique = outputs.filter((value, index) => outputs.indexOf(value) === index);
    const components = buildGovernanceComponents(unique, workspace.organisation, workspace.authority);
    void save({ ...workspace, package: components }, "Governance package assembled", `${components.length} components`);
    setActive("Governance package");
  }

  const views: Record<string, React.ReactNode> = {
    Overview: <><section className="hero"><div><span className="kicker">PRIVATE DOGFOODING · FICTIONAL EXTERNAL TESTS</span><h1>Build governance that stays connected to the work.</h1><p>Start with what an organisation has. Identify what is missing, create only what is proportionate, test it against operating context, and retain every decision.</p><div className="actions"><button onClick={() => setActive("Organisation")}>Start assessment</button><button className="quiet" onClick={() => setActive("Recommendations")}>View current route</button></div></div><div className="signal"><span>Current organisation</span><strong>{workspace.organisation.name || "Not yet defined"}</strong><p>{workspace.organisation.immediateGoal || "Complete the organisation profile to receive a tailored route."}</p></div></section><section><span className="kicker">CAPABILITY, NOT A SINGLE SCORE</span><h2>Readiness by dimension</h2><div className="dimension-grid">{dimensions.map(([name, level, evidence]) => <article key={name}><span>{name}</span><strong>{level}</strong><p>{evidence}</p></article>)}</div></section><section className="principle"><b>01</b><div><h2>Documents are released views—not the system.</h2><p>Ownership, requirements, controls, procedures, evidence, tests and approvals remain structured underneath.</p></div></section></>,
    Organisation: <><section className="intro"><span className="kicker">CONTEXT BEFORE CONTENT</span><h1>Describe the organisation proportionately.</h1><p>Use the Operations Automated profile for the private dogfooding cycle. External tests must use fictional or authorised non-confidential information.</p></section><section><h2>Choose a starting context</h2><div className="presets">{presets.map((preset, index) => <button className={preset[0] === "Operations Automated" ? "dogfood" : ""} onClick={() => loadPreset(index)} key={preset[0]}>{preset[0]}</button>)}</div></section><section className="form-grid">{Object.entries({ name: "Organisation name", sector: "Sector", size: "Approximate size", services: "Important products or services", dependencies: "Critical people, technology and suppliers", regulation: "Regulatory, contractual or safety context", immediateGoal: "Immediate problem or desired outcome" }).map(([key, label]) => <label className={["services", "dependencies", "regulation", "immediateGoal"].includes(key) ? "wide" : ""} key={key}><span>{label}</span><textarea rows={key === "name" ? 1 : 3} value={workspace.organisation[key as keyof Workspace["organisation"]]} onChange={(e) => setWorkspace({ ...workspace, organisation: { ...workspace.organisation, [key]: e.target.value } })} /></label>)}<button onClick={() => void save(workspace, "Organisation profile updated", workspace.organisation.name)}>Save profile</button></section></>,
    Authority: <><section className="intro"><span className="kicker">ROLES, NOT PERSONALITY</span><h1>Define durable decision authority.</h1><p>Documents name organisational roles. The audit record identifies the actual human when a decision is made.</p></section><section className="form-grid">{Object.entries({ governanceAuthority: "Company governance authority", methodologyAuthority: "Methodology authority", documentOwner: "Document owner", controlOwner: "Control owner", draftingAgent: "AI drafting role", publicationOperator: "Publication operator" }).map(([key, label]) => <label key={key}><span>{label}</span><input value={workspace.authority[key as keyof AuthorityProfile]} onChange={(e) => setWorkspace({ ...workspace, authority: { ...workspace.authority, [key]: e.target.value } })} /></label>)}<div className="wide boundary"><strong>Authority separation</strong><p>The company Governance Authority approves company policy and risk. The Methodology Authority approves methodology meaning. AI may draft both but cannot approve either.</p></div><button onClick={() => void save(workspace, "Authority profile updated", workspace.authority.governanceAuthority)}>Save authority</button></section></>,
    Inventory: <><section className="intro"><span className="kicker">START WITH WHAT EXISTS</span><h1>Documentation inventory</h1><p>Record useful material without assuming its existence proves operational effectiveness.</p></section><section className="add-row"><select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}>{documentTypes.map((type) => <option key={type}>{type}</option>)}</select><input placeholder="Title" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} /><select value={newItem.status} onChange={(e) => setNewItem({ ...newItem, status: e.target.value as Item["status"] })}><option value="current">Current</option><option value="proposed">Proposed</option><option value="draft">Draft</option><option value="outdated">Outdated</option><option value="missing">Known gap</option></select><button disabled={!newItem.title.trim()} onClick={() => { const item = { ...newItem, id: crypto.randomUUID() }; void save({ ...workspace, inventory: [...workspace.inventory, item] }, "Inventory item added", item.title); setNewItem({ type: "Policy", title: "", status: "current" }); }}>Add</button></section><section>{workspace.inventory.length ? <div className="table">{workspace.inventory.map((item) => <div className="row" key={item.id}><div><strong>{item.title}</strong><span>{item.type}</span></div><span className={`status ${item.status}`}>{item.status}</span><button className="remove" onClick={() => void save({ ...workspace, inventory: workspace.inventory.filter((x) => x.id !== item.id) }, "Inventory item removed", item.title)}>Remove</button></div>)}</div> : <div className="empty"><strong>No documentation recorded.</strong><p>That is a valid starting point. We will recommend the smallest useful foundation.</p></div>}</section></>,
    Recommendations: <><section className="intro"><span className="kicker">TAILORED ROUTE</span><h1>Recommended next governance work</h1><p>Recommendations are hypotheses. Accept, defer or reject each one.</p></section><section className="recommendations">{recommendations.map((item) => <article key={item.id}><span className="priority">{item.priority}</span><div><h2>{item.title}</h2><p>{item.rationale}</p><div className="chips">{item.outputs.map((output) => <span key={output}>{output}</span>)}</div></div><div className="decisions">{(["accepted", "deferred", "rejected"] as const).map((decision) => <button className={workspace.decisions[item.id] === decision ? "selected" : ""} onClick={() => void save({ ...workspace, decisions: { ...workspace.decisions, [item.id]: decision } }, "Recommendation disposition", `${item.id}: ${decision}`)} key={decision}>{decision}</button>)}</div></article>)}</section><button className="primary" disabled={!recommendations.some((r) => workspace.decisions[r.id] === "accepted")} onClick={assemble}>Assemble accepted work</button></>,
    "Governance package": <><section className="intro"><span className="kicker">HUMAN REVIEW REQUIRED</span><h1>Candidate governance package</h1><p>These are substantive proposed documents, not approved policy. Review each document before it enters the controlled Draft hand-off.</p></section><section>{workspace.package.length ? <><div className="package-grid">{workspace.package.map((component) => <article key={component.id}><div className="component-meta"><span>{component.id}</span><span>{component.documentType}</span><span>{component.destination}</span></div><h2>{component.title}</h2><p>{component.summary}</p><details><summary>Read proposed document</summary><pre className="document-preview">{component.content}</pre></details><p className="source-note">Sources: {component.sources.join(" · ")}</p><button className={component.status === "accepted" ? "selected" : ""} onClick={() => void save({ ...workspace, package: workspace.package.map((item) => item.id === component.id ? { ...item, status: item.status === "accepted" ? "candidate" : "accepted" } : item) }, "Package component reviewed", component.title)}>{component.status === "accepted" ? "Included in Draft hand-off" : "Include in Draft hand-off"}</button></article>)}</div><div className="handoff"><strong>{workspace.package.filter((item) => item.status === "accepted").length} of {workspace.package.length} documents reviewed</strong><p>The first pilot passes a credential-free package to the existing private Workbench, where proposed documents must be committed and compared before publication to Internal / Draft. No document is approved or promoted to Live by this hand-off.</p>{workspace.package.some((item) => item.status === "accepted") ? <a className="download" href="/api/governance-package">Download reviewed Draft hand-off</a> : <button disabled>Review a document to prepare the hand-off</button>}</div></> : <div className="empty"><strong>No package yet.</strong><button onClick={() => setActive("Recommendations")}>Review recommendations</button></div>}</section></>,
    Sources: <><section className="intro"><span className="kicker">CONNECT ONCE · CHOOSE THE SCOPE</span><h1>Bring the right knowledge into view.</h1><p>Connect a document service, choose spaces, folders, parent pages or individual files, and decide whether new descendants join the scope automatically. Operations Automated retains the selection rules, source identity, permissions and versions.</p></section><section className="source-steps">{["Authorise a source", "Choose a container", "Select the tree", "Preview access", "Run initial sync"].map((step, index) => <article key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></article>)}</section><section className="connector-grid">{[["confluence", "Confluence", "Choose a site and space, then include a whole page tree or selected parent and child pages.", "Site → space → page tree"], ["googleDocs", "Google Drive & Docs", "Choose My Drive or a Shared Drive, then include folders, Google Docs or uploaded files.", "Drive → folder → files"], ["notion", "Notion", "Choose explicitly shared pages or data sources, then include their nested pages and blocks.", "Shared root → page tree"], ["word", "Microsoft 365", "Choose SharePoint or OneDrive, a document library, then folders and Word documents.", "Site → library → folder"]].map(([key, title, description, path]) => { const connector = workspace.connectors[key]; return <article key={key}><div className="connector-head"><b>{title[0]}</b><span className={`status ${connector.mode === "ready" ? "current" : "draft"}`}>{connector.mode === "ready" ? "read probe ready" : connector.mode.replace("-", " ")}</span></div><h2>{title}</h2><p>{description}</p><div className="picker-preview"><span>Planned picker</span><strong>{path}</strong><small>Tri-state selection · include descendants · exclusions · sync frequency</small></div><label><span>Current proof of concept: test one page or document ID</span><input value={connector.reference} placeholder="Use fictional or non-confidential test content" onChange={(e) => setWorkspace({ ...workspace, connectors: { ...workspace.connectors, [key]: { ...connector, reference: e.target.value } } })} /></label>{connector.mode === "ready" ? <button disabled={!connector.reference.trim()} onClick={() => void testConnector(key)}>Test read access</button> : <button onClick={() => void save({ ...workspace, connectors: { ...workspace.connectors, [key]: { ...connector, mode: connector.mode === "mock" ? "not-configured" : "mock" } } }, "Connector mode changed", `${title}: mock`)}>{connector.mode === "mock" ? "Disable demonstration" : "Preview connection"}</button>} {connectorChecks[key] ? <p className="connector-check">{connectorChecks[key]}</p> : null}</article>; })}</section><div className="boundary"><strong>What exists today versus what comes next</strong><p>This release has provider-neutral status and single-document read-probe contracts. OAuth installation, browsable hierarchy selection, recurring synchronisation and controlled publishing are the next implementation layers; the interface does not pretend they are already live.</p></div></>,
    Audit: <><section className="intro"><span className="kicker">RETAINED DECISIONS</span><h1>Workspace audit trail</h1></section><section>{workspace.audit.length ? <div className="audit">{[...workspace.audit].reverse().map((event, index) => <article key={`${event.at}-${index}`}><time>{new Date(event.at).toLocaleString("en-GB")}</time><strong>{event.action}</strong><span>{event.detail}</span></article>)}</div> : <div className="empty"><strong>No actions recorded yet.</strong></div>}</section></>,
  };

  return <div className="shell"><aside><div className="brand"><b>OA</b><div><strong>Operations Automated</strong><span>Connected Governance</span></div></div><nav>{nav.map((item, index) => <button className={active === item ? "active" : ""} onClick={() => setActive(item)} key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</button>)}</nav><div className="save"><i className={saveState} />{saveState === "loading" ? "Loading" : saveState === "saving" ? "Saving" : saveState === "error" ? "Save unavailable" : "Progress saved"}</div></aside><main><header><div><span>PRIVATE PRODUCT PROTOTYPE</span><strong>{workspace.organisation.name || "New governance workspace"}</strong></div><div className="header-actions"><a href="/signout-with-chatgpt?return_to=%2F">Sign out</a><button onClick={() => { if (confirm("Reset this workspace?")) void save(blank, "Workspace reset"); }}>Reset</button></div></header><div className="content">{views[active]}</div><footer>Private internal dogfooding or fictional demonstration only · No compliance determination · AI may propose but cannot approve</footer></main></div>;
}

"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
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

type Page =
  | "Overview"
  | "Organisation"
  | "Authority"
  | "Sources & destination"
  | "Inventory"
  | "Recommendations"
  | "Draft documents"
  | "Audit";

type Item = {
  id: string;
  type: string;
  title: string;
  status: "current" | "outdated" | "proposed" | "draft" | "missing";
  source?: string;
};

type Connector = {
  mode: "not-configured" | "mock" | "ready";
  reference: string;
};

type KnowledgePlan = {
  sourceMode: "project-memory" | "confluence" | "manual";
  sourceSpace: string;
  sourceRoot: string;
  includeDescendants: boolean;
  destinationPlatform: "Confluence through private Workbench";
  destinationSpace: string;
  destinationLifecycle: "Draft";
  destinationParent: string;
  confirmed: boolean;
};

type Workspace = {
  organisation: OrganisationProfile;
  authority: AuthorityProfile;
  knowledge: KnowledgePlan;
  progress: {
    organisationReviewed: boolean;
    authorityReviewed: boolean;
    inventoryReviewed: boolean;
  };
  inventory: Item[];
  decisions: Record<string, "accepted" | "deferred" | "rejected">;
  package: GovernanceComponent[];
  connectors: Record<string, Connector>;
  audit: Array<{ at: string; action: string; detail: string }>;
};

type Recommendation = {
  id: string;
  title: string;
  rationale: string;
  priority: "Now" | "Next" | "Later";
  outputs: string[];
};

type Notice = {
  page: Page;
  kind: "saving" | "success" | "error";
  message: string;
  next?: Page;
  nextLabel?: string;
};

type Preset = {
  label: string;
  organisation: OrganisationProfile;
  inventory: ReadonlyArray<readonly [string, string, Item["status"]]>;
  dogfood?: boolean;
};

const APP_VERSION = "Private proposal 0.2";

const defaultKnowledge: KnowledgePlan = {
  sourceMode: "project-memory",
  sourceSpace: "Operations Automated repository",
  sourceRoot: "Controlled project memory and retained decisions",
  includeDescendants: true,
  destinationPlatform: "Confluence through private Workbench",
  destinationSpace: "Internal",
  destinationLifecycle: "Draft",
  destinationParent: "Company Governance",
  confirmed: false,
};

const blank: Workspace = {
  organisation: {
    name: "",
    sector: "",
    size: "",
    services: "",
    dependencies: "",
    regulation: "",
    immediateGoal: "",
  },
  authority: { ...defaultAuthority },
  knowledge: { ...defaultKnowledge },
  progress: {
    organisationReviewed: false,
    authorityReviewed: false,
    inventoryReviewed: false,
  },
  inventory: [],
  decisions: {},
  package: [],
  connectors: {
    confluence: { mode: "not-configured", reference: "" },
    notion: { mode: "not-configured", reference: "" },
    googleDocs: { mode: "not-configured", reference: "" },
    word: { mode: "not-configured", reference: "" },
  },
  audit: [],
};

const presets: Preset[] = [
  {
    label: "Operations Automated",
    organisation: operationsAutomatedProfile,
    inventory: operationsAutomatedInventory,
    dogfood: true,
  },
  {
    label: "Digital service",
    organisation: {
      name: "Beacon Digital Services",
      sector: "Digital services",
      size: "25 people",
      services: "Hosted workflow and customer-support software",
      dependencies: "Cloud hosting, identity provider and payment processor",
      regulation: "Contracts, privacy and general business obligations",
      immediateGoal: "Create a proportionate incident-management foundation",
    },
    inventory: [],
  },
  {
    label: "Digital bank",
    organisation: {
      name: "Harbourline Bank",
      sector: "Financial services",
      size: "900 people",
      services: "Current accounts, cards and mobile banking",
      dependencies: "Core banking, card processor, cloud and contact centre",
      regulation: "Fictional operational-resilience and consumer obligations",
      immediateGoal: "Connect fragmented controls, policies and evidence",
    },
    inventory: [
      ["Policy", "Incident Management Policy", "current"],
      ["Control catalogue", "Operational Control Catalogue", "current"],
      ["Procedure", "Major Incident Procedure", "outdated"],
    ],
  },
  {
    label: "Manufacturer",
    organisation: {
      name: "Redwood Components",
      sector: "Manufacturing",
      size: "420 people",
      services: "Precision components for industrial customers",
      dependencies: "Production line, specialist suppliers, logistics and safety systems",
      regulation: "Safety, product quality and contractual obligations",
      immediateGoal: "Improve supplier failure and continuity governance",
    },
    inventory: [
      ["Procedure", "Site Emergency Procedure", "current"],
      ["Runbook", "Production Recovery Runbook", "draft"],
    ],
  },
  {
    label: "Charity",
    organisation: {
      name: "Kindred Reach",
      sector: "Charity",
      size: "60 staff and 180 volunteers",
      services: "Community support and safeguarding",
      dependencies: "Volunteers, local partners, case system and donations",
      regulation: "Safeguarding, charity governance and privacy",
      immediateGoal: "Create usable safeguarding and continuity documentation",
    },
    inventory: [["Policy", "Safeguarding Policy", "current"]],
  },
  {
    label: "Professional services",
    organisation: {
      name: "Meridian Advisory",
      sector: "Professional services",
      size: "140 people",
      services: "Advisory projects and managed services",
      dependencies: "Specialist people, client knowledge, collaboration tools and subcontractors",
      regulation: "Professional duties, confidentiality and client contracts",
      immediateGoal: "Reduce key-person risk and standardise handovers",
    },
    inventory: [
      ["Standard", "Client Delivery Standard", "current"],
      ["Procedure", "Project Handover Procedure", "outdated"],
    ],
  },
];

const documentTypes = [
  "Framework",
  "Policy",
  "Procedure",
  "Runbook",
  "Standard",
  "Control catalogue",
  "Evidence standard",
  "Scenario library",
];

const navItems: Array<{ page: Page; number?: string; description: string }> = [
  { page: "Overview", description: "Purpose and progress" },
  { page: "Organisation", number: "01", description: "What you do and why" },
  { page: "Authority", number: "02", description: "Who can decide what" },
  { page: "Sources & destination", number: "03", description: "What to read and where drafts go" },
  { page: "Inventory", number: "04", description: "What exists and what is missing" },
  { page: "Recommendations", number: "05", description: "What the evidence suggests" },
  { page: "Draft documents", number: "06", description: "Read the actual output" },
  { page: "Audit", description: "Retained actions" },
];

const journeyPages: Page[] = [
  "Organisation",
  "Authority",
  "Sources & destination",
  "Inventory",
  "Recommendations",
  "Draft documents",
];

const organisationFields: Array<{
  key: keyof OrganisationProfile;
  label: string;
  help: string;
  example: string;
  wide?: boolean;
}> = [
  {
    key: "name",
    label: "Organisation or workspace name",
    help: "The name used to group this assessment and its draft governance.",
    example: "Operations Automated",
  },
  {
    key: "sector",
    label: "Sector",
    help: "The broad operating context. This helps tailor likely obligations, risks and examples.",
    example: "Operations management methodology and governance technology",
  },
  {
    key: "size",
    label: "Approximate size or stage",
    help: "Use a description that changes how proportionate the governance should be. Exact headcount is not required.",
    example: "Founder-led organisation in private internal validation",
  },
  {
    key: "services",
    label: "Important products or services",
    help: "What people rely on you to provide. Start with customer or stakeholder outcomes rather than internal departments.",
    example: "Methodology, private AI Workbench and Connected Governance",
    wide: true,
  },
  {
    key: "dependencies",
    label: "Critical people, technology and suppliers",
    help: "The people, knowledge, systems and third parties needed to deliver those services.",
    example: "Authorised roles, GitHub, private Workbench and Confluence Cloud",
    wide: true,
  },
  {
    key: "regulation",
    label: "Legal, regulatory, contractual or safety context",
    help: "Known boundaries that may affect the work. This is context, not a compliance determination.",
    example: "Applicable UK law, confidentiality and human approval of material decisions",
    wide: true,
  },
  {
    key: "immediateGoal",
    label: "Immediate problem or desired outcome",
    help: "The practical result this first governance cycle should create.",
    example: "Create the minimum useful internal business-governance foundation",
    wide: true,
  },
];

const authorityFields: Array<{
  key: keyof AuthorityProfile;
  label: string;
  help: string;
}> = [
  {
    key: "governanceAuthority",
    label: "Company governance authority",
    help: "The role that can approve company policy, material business-governance changes and company risk acceptance.",
  },
  {
    key: "methodologyAuthority",
    label: "Methodology authority",
    help: "The separate role that can approve what the customer-facing Operations Automated methodology means.",
  },
  {
    key: "documentOwner",
    label: "Document owner",
    help: "The role responsible for keeping a document accurate, useful and reviewed.",
  },
  {
    key: "controlOwner",
    label: "Control owner",
    help: "The role responsible for making sure a control is designed, operated, evidenced and improved.",
  },
  {
    key: "draftingAgent",
    label: "AI drafting role",
    help: "The named AI capability that may analyse and draft but cannot approve, publish Live or accept risk.",
  },
  {
    key: "publicationOperator",
    label: "Publication operator",
    help: "The role allowed to carry out an already authorised publication plan. Publishing does not create approval.",
  },
];

function isOperationsAutomated(workspace: Workspace) {
  return workspace.organisation.name.trim().toLowerCase() === "operations automated";
}

function inventoryFromKnownContext(): Item[] {
  return operationsAutomatedInventory.map((item, index) => ({
    id: `oa-known-${index}`,
    type: item[0],
    title: item[1],
    status: item[2] as Item["status"],
    source: "Controlled Operations Automated project memory",
  }));
}

function mergeKnownInventory(items: Item[]) {
  const titles = new Set(items.map((item) => item.title.toLowerCase()));
  return [
    ...items,
    ...inventoryFromKnownContext().filter((item) => !titles.has(item.title.toLowerCase())),
  ];
}

function sourceDescription(knowledge: KnowledgePlan) {
  if (knowledge.sourceMode === "project-memory") {
    return `${knowledge.sourceSpace} → ${knowledge.sourceRoot}`;
  }
  if (knowledge.sourceMode === "confluence") {
    return `Confluence via Workbench → ${knowledge.sourceSpace || "space not selected"} → ${
      knowledge.sourceRoot || "page tree not selected"
    }`;
  }
  return "Manual inventory entered by the authorised user";
}

function destinationDescription(knowledge: KnowledgePlan) {
  return `${knowledge.destinationPlatform} → ${knowledge.destinationSpace || "space not selected"} → ${
    knowledge.destinationLifecycle
  } → ${knowledge.destinationParent || "parent page not selected"}`;
}

function routeFor(workspace: Workspace): Recommendation[] {
  const types = new Set(
    workspace.inventory.filter((item) => item.status !== "missing").map((item) => item.type),
  );
  const result: Recommendation[] = [];

  if (!workspace.organisation.name || !workspace.organisation.services) {
    result.push({
      id: "context",
      title: "Complete operating context",
      rationale:
        "Useful governance and scenarios depend on the services, affected people, dependencies and decision authority.",
      priority: "Now",
      outputs: ["Organisation profile", "Service and dependency map"],
    });
  }

  if (isOperationsAutomated(workspace)) {
    result.push({
      id: "oa-business-foundation",
      title: "Create the Operations Automated business-governance foundation",
      rationale:
        "The existing records govern methodology development and publication, but they do not yet form a complete role-based company policy and control system. Create the smallest connected foundation without changing methodology meaning.",
      priority: "Now",
      outputs: [...businessFoundationOutputs],
    });
    return result;
  }

  if (!types.has("Policy")) {
    result.push({
      id: "policy",
      title: "Create minimum policy authority",
      rationale:
        "No current policy is recorded. Start with purpose, ownership and mandatory expectations.",
      priority: "Now",
      outputs: ["Policy", "Responsibility matrix"],
    });
  }
  if (!types.has("Procedure")) {
    result.push({
      id: "procedure",
      title: "Create an executable procedure",
      rationale: "No current procedure translates expectations into actions and evidence.",
      priority: types.has("Policy") ? "Now" : "Next",
      outputs: ["Procedure", "Escalation path", "Evidence requirements"],
    });
  }
  if (!types.has("Control catalogue")) {
    result.push({
      id: "controls",
      title: "Connect controls and evidence",
      rationale: "Control intent, operation and evidence are not visible as connected records.",
      priority: "Next",
      outputs: ["Control catalogue", "Evidence map"],
    });
  }
  if (!types.has("Scenario library") && workspace.organisation.services) {
    result.push({
      id: "scenarios",
      title: "Design context-specific validation",
      rationale: `Test ${workspace.organisation.services}, its dependencies and decision authority—not a generic scenario.`,
      priority: "Later",
      outputs: ["Scenario hypotheses", "Participant and evidence plan"],
    });
  }

  const outdated = workspace.inventory.filter((item) => item.status === "outdated");
  if (outdated.length) {
    result.push({
      id: "refresh",
      title: "Review outdated material",
      rationale: `${outdated.length} recorded artefact${outdated.length === 1 ? " is" : "s are"} outdated.`,
      priority: "Now",
      outputs: outdated.map((item) => item.title),
    });
  }
  return result;
}

function readiness(workspace: Workspace) {
  const types = new Set(
    workspace.inventory.filter((item) => item.status === "current").map((item) => item.type),
  );
  const level = (n: number) =>
    ["Foundational", "Developing", "Established", "Assured"][Math.min(n, 3)];

  return [
    [
      "Operating context",
      level(workspace.organisation.name && workspace.organisation.immediateGoal ? 1 : 0),
      workspace.organisation.name ? "Organisation and objective recorded" : "Context incomplete",
    ],
    [
      "Documentation",
      level(Math.min(types.size, 3)),
      `${types.size} current document type${types.size === 1 ? "" : "s"}`,
    ],
    [
      "Controls",
      level(types.has("Control catalogue") ? 2 : 0),
      types.has("Control catalogue") ? "Catalogue recorded" : "No connected catalogue",
    ],
    [
      "Evidence",
      level(types.has("Evidence standard") ? 2 : 0),
      types.has("Evidence standard") ? "Standard recorded" : "Evidence expectations incomplete",
    ],
    [
      "Testing",
      level(types.has("Scenario library") ? 2 : 0),
      types.has("Scenario library") ? "Scenario library recorded" : "Context required before testing",
    ],
    [
      "Controlled route",
      level(workspace.knowledge.confirmed ? 1 : 0),
      workspace.knowledge.confirmed
        ? "Source and Draft destination recorded"
        : "Source and destination need confirmation",
    ],
  ];
}

function stepComplete(page: Page, workspace: Workspace) {
  if (page === "Organisation") {
    return Boolean(
      workspace.progress.organisationReviewed &&
      workspace.organisation.name &&
        workspace.organisation.services &&
        workspace.organisation.immediateGoal,
    );
  }
  if (page === "Authority") {
    return (
      workspace.progress.authorityReviewed &&
      Object.values(workspace.authority).every((value) => value.trim())
    );
  }
  if (page === "Sources & destination") return workspace.knowledge.confirmed;
  if (page === "Inventory") return workspace.progress.inventoryReviewed;
  if (page === "Recommendations") return Object.keys(workspace.decisions).length > 0;
  if (page === "Draft documents") return workspace.package.length > 0;
  return false;
}

function nextPage(workspace: Workspace): Page {
  return (
    journeyPages.find((page) => !stepComplete(page, workspace)) ||
    "Draft documents"
  );
}

function HelpTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="help-tip">
      <button type="button" aria-label={`About ${label}`}>
        i
      </button>
      <span role="tooltip">{children}</span>
    </span>
  );
}

function FormField({
  label,
  help,
  example,
  wide,
  children,
}: {
  label: string;
  help: string;
  example?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span className="field-title">
        <span>{label}</span>
        <HelpTip label={label}>{help}</HelpTip>
      </span>
      {children}
      {example ? <small>Example: {example}</small> : null}
    </label>
  );
}

function PageIntro({
  page,
  eyebrow,
  title,
  children,
}: {
  page: Page;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  const index = journeyPages.indexOf(page);
  return (
    <section className="intro">
      {index >= 0 ? (
        <div className="step-label">
          <span>
            Step {index + 1} of {journeyPages.length}
          </span>
          <span>{eyebrow}</span>
        </div>
      ) : (
        <span className="kicker">{eyebrow}</span>
      )}
      <h1>{title}</h1>
      <p>{children}</p>
    </section>
  );
}

function SaveNotice({
  notice,
  page,
  go,
}: {
  notice: Notice | null;
  page: Page;
  go: (page: Page) => void;
}) {
  if (!notice || notice.page !== page) return null;
  return (
    <div className={`action-notice ${notice.kind}`} aria-live="polite">
      <div>
        <strong>
          {notice.kind === "saving"
            ? "Saving your work"
            : notice.kind === "error"
              ? "Your work is still on screen"
              : "Saved"}
        </strong>
        <p>{notice.message}</p>
      </div>
      {notice.kind === "success" && notice.next ? (
        <button type="button" onClick={() => go(notice.next!)}>
          {notice.nextLabel || `Continue to ${notice.next}`}
        </button>
      ) : null}
    </div>
  );
}

function JourneyStrip({
  workspace,
  go,
}: {
  workspace: Workspace;
  go: (page: Page) => void;
}) {
  return (
    <div className="journey-strip" aria-label="Governance creation journey">
      {journeyPages.map((page, index) => (
        <button type="button" key={page} onClick={() => go(page)}>
          <span className={stepComplete(page, workspace) ? "complete" : ""}>
            {stepComplete(page, workspace) ? "✓" : index + 1}
          </span>
          <strong>{page}</strong>
        </button>
      ))}
    </div>
  );
}

export function GovernanceLab() {
  const [workspace, setWorkspace] = useState<Workspace>(blank);
  const [active, setActive] = useState<Page>("Overview");
  const [saveState, setSaveState] = useState<"loading" | "saved" | "saving" | "error">(
    "loading",
  );
  const [notice, setNotice] = useState<Notice | null>(null);
  const [newItem, setNewItem] = useState({
    type: "Policy",
    title: "",
    status: "current" as Item["status"],
  });

  const recommendations = useMemo(() => routeFor(workspace), [workspace]);
  const dimensions = useMemo(() => readiness(workspace), [workspace]);

  useEffect(() => {
    fetch("/api/workspace")
      .then((response) => response.json())
      .then((workspaceData) => {
        const stored = workspaceData.state || {};
        const hydrated: Workspace = {
          ...blank,
          ...stored,
          organisation: { ...blank.organisation, ...(stored.organisation || {}) },
          authority: { ...defaultAuthority, ...(stored.authority || {}) },
          knowledge: { ...defaultKnowledge, ...(stored.knowledge || {}) },
          progress: { ...blank.progress, ...(stored.progress || {}) },
          connectors: { ...blank.connectors, ...(stored.connectors || {}) },
          inventory: Array.isArray(stored.inventory) ? stored.inventory : [],
          decisions: stored.decisions || {},
          package: Array.isArray(stored.package) ? stored.package : [],
          audit: Array.isArray(stored.audit) ? stored.audit : [],
        };
        if (isOperationsAutomated(hydrated) && !hydrated.inventory.length) {
          hydrated.inventory = inventoryFromKnownContext();
        }
        setWorkspace(hydrated);
        setSaveState("saved");
      })
      .catch(() => setSaveState("error"));
  }, []);

  function go(page: Page) {
    setActive(page);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(
    next: Workspace,
    action: string,
    detail: string,
    feedback?: Omit<Notice, "kind">,
  ) {
    const updated = {
      ...next,
      audit: [...next.audit, { at: new Date().toISOString(), action, detail }],
    };
    setWorkspace(updated);
    setSaveState("saving");
    if (feedback) {
      setNotice({
        ...feedback,
        kind: "saving",
        message: "Keeping this workspace up to date…",
      });
    }

    try {
      const response = await fetch("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: updated }),
      });
      if (!response.ok) throw new Error();
      setSaveState("saved");
      if (feedback) setNotice({ ...feedback, kind: "success" });
      return true;
    } catch {
      setSaveState("error");
      if (feedback) {
        setNotice({
          ...feedback,
          kind: "error",
          message:
            "The workspace could not be saved. Nothing has been cleared; try saving again.",
        });
      }
      return false;
    }
  }

  function loadPreset(index: number) {
    const preset = presets[index];
    const inventory = preset.inventory.map((item, itemIndex) => ({
      id: `preset-${index}-${itemIndex}`,
      type: item[0],
      title: item[1],
      status: item[2],
      source: preset.dogfood
        ? "Controlled Operations Automated project memory"
        : "Fictional test context",
    }));
    const knowledge = preset.dogfood
      ? { ...defaultKnowledge, confirmed: false }
      : {
          ...defaultKnowledge,
          sourceMode: "manual" as const,
          sourceSpace: "",
          sourceRoot: "",
          confirmed: false,
        };
    void save(
      {
        ...workspace,
        organisation: { ...preset.organisation },
        authority: { ...defaultAuthority },
        knowledge,
        progress: {
          organisationReviewed: false,
          authorityReviewed: false,
          inventoryReviewed: false,
        },
        inventory,
        decisions: {},
        package: [],
      },
      preset.dogfood ? "Private dogfooding context loaded" : "Fictional context loaded",
      preset.label,
      {
        page: "Organisation",
        message: `${preset.label} context is ready to review. Check the wording, then continue to authority.`,
        next: "Authority",
      },
    );
  }

  function saveOrganisation() {
    const next = isOperationsAutomated(workspace)
      ? {
          ...workspace,
          progress: { ...workspace.progress, organisationReviewed: true },
          inventory: mergeKnownInventory(workspace.inventory),
          knowledge: {
            ...defaultKnowledge,
            ...workspace.knowledge,
          },
        }
      : {
          ...workspace,
          progress: { ...workspace.progress, organisationReviewed: true },
        };
    void save(
      next,
      "Organisation profile updated",
      workspace.organisation.name,
      {
        page: "Organisation",
        message:
          "The operating context is recorded. Authority is the next decision because the documents need to know who may approve, own and publish them.",
        next: "Authority",
      },
    );
  }

  function saveAuthority() {
    void save(
      {
        ...workspace,
        progress: { ...workspace.progress, authorityReviewed: true },
      },
      "Authority profile updated",
      workspace.authority.governanceAuthority,
      {
        page: "Authority",
        message:
          "The roles are recorded. This does not delegate new authority; it tells the drafts which roles hold each responsibility.",
        next: "Sources & destination",
        nextLabel: "Continue to sources and destination",
      },
    );
  }

  function saveKnowledgePlan() {
    const next = {
      ...workspace,
      knowledge: { ...workspace.knowledge, confirmed: true },
      progress: { ...workspace.progress, inventoryReviewed: false },
      inventory: isOperationsAutomated(workspace)
        ? mergeKnownInventory(workspace.inventory)
        : workspace.inventory,
    };
    void save(
      next,
      "Source and Draft destination confirmed",
      `${sourceDescription(next.knowledge)} | ${destinationDescription(next.knowledge)}`,
      {
        page: "Sources & destination",
        message:
          "The input scope and Draft destination are now separate and visible. Saving this did not connect a new service or publish anything.",
        next: "Inventory",
      },
    );
  }

  function addKnownInventory() {
    const inventory = mergeKnownInventory(workspace.inventory);
    void save(
      {
        ...workspace,
        progress: { ...workspace.progress, inventoryReviewed: false },
        inventory,
      },
      "Known project inventory added",
      `${inventory.length} inventory items`,
      {
        page: "Inventory",
        message:
          "Known Operations Automated records and gaps have been added from the retained project context. Review the list, then confirm it below.",
      },
    );
  }

  function confirmInventory() {
    void save(
      {
        ...workspace,
        progress: { ...workspace.progress, inventoryReviewed: true },
      },
      "Working inventory confirmed",
      `${workspace.inventory.length} inventory items`,
      {
        page: "Inventory",
        message:
          "The working inventory is confirmed for this assessment. It is evidence about documents, not proof that the operation is effective.",
        next: "Recommendations",
      },
    );
  }

  async function assemble() {
    const outputs = recommendations
      .filter((recommendation) => workspace.decisions[recommendation.id] === "accepted")
      .flatMap((recommendation) => recommendation.outputs);
    const unique = outputs.filter((value, index) => outputs.indexOf(value) === index);
    const components = buildGovernanceComponents(
      unique,
      workspace.organisation,
      workspace.authority,
      destinationDescription(workspace.knowledge),
    );
    await save(
      { ...workspace, package: components },
      "Proposed governance documents generated",
      `${components.length} proposed documents`,
      {
        page: "Recommendations",
        message: `${components.length} proposed documents have been generated. They are ready to read; none is approved or published.`,
        next: "Draft documents",
        nextLabel: "Review the generated drafts",
      },
    );
  }

  function includeAllDrafts() {
    const selected = workspace.package.map((item) => ({ ...item, status: "accepted" as const }));
    void save(
      { ...workspace, package: selected },
      "All generated documents included in Draft hand-off",
      `${selected.length} proposed documents`,
      {
        page: "Draft documents",
        message:
          "All generated documents are selected for Workbench review. This selection is not policy approval and cannot publish to Live.",
      },
    );
  }

  const currentNext = nextPage(workspace);
  let view: ReactNode;

  if (active === "Overview") {
    view = (
      <>
        <section className="hero">
          <div>
            <span className="kicker">CONNECTED GOVERNANCE · PRIVATE PROPOSAL</span>
            <h1>See the governance. Understand the decision. Know what happens next.</h1>
            <p>
              Build a role-based governance foundation from the organisation’s real operating
              context, then review the actual proposed documents before anything reaches
              Confluence Draft.
            </p>
            <div className="actions">
              <button type="button" onClick={() => go(currentNext)}>
                Continue with {currentNext.toLowerCase()}
              </button>
              <button type="button" className="secondary" onClick={() => go("Draft documents")}>
                See the expected output
              </button>
            </div>
          </div>
          <div className="outcome-card">
            <span>Your current outcome</span>
            <strong>{workspace.organisation.name || "New governance workspace"}</strong>
            <p>
              {workspace.organisation.immediateGoal ||
                "Describe the organisation and the immediate outcome. The service will then build a visible route to proposed governance drafts."}
            </p>
            <dl>
              <div>
                <dt>Output</dt>
                <dd>Readable proposed documents</dd>
              </div>
              <div>
                <dt>Destination</dt>
                <dd>{workspace.knowledge.destinationLifecycle} only</dd>
              </div>
              <div>
                <dt>Approval</dt>
                <dd>Always human</dd>
              </div>
            </dl>
          </div>
        </section>

        <section>
          <span className="kicker">ONE GUIDED ROUTE</span>
          <h2>From context to reviewable output</h2>
          <JourneyStrip workspace={workspace} go={go} />
        </section>

        <section>
          <span className="kicker">WHAT YOU GET</span>
          <div className="value-grid">
            <article>
              <b>01</b>
              <h3>A visible assessment</h3>
              <p>
                The operation, decision roles, evidence scope, current documents and gaps are
                made explicit.
              </p>
            </article>
            <article>
              <b>02</b>
              <h3>An explained recommendation</h3>
              <p>
                See why work is proposed, the evidence used, the owner, the outputs and the
                exact Draft destination.
              </p>
            </article>
            <article>
              <b>03</b>
              <h3>The actual drafts</h3>
              <p>
                Read substantive frameworks, policies, standards and procedures before
                preparing a controlled Workbench hand-off.
              </p>
            </article>
          </div>
        </section>

        <section>
          <span className="kicker">CAPABILITY, NOT A SINGLE SCORE</span>
          <h2>Current readiness by dimension</h2>
          <div className="dimension-grid">
            {dimensions.map(([name, level, evidence]) => (
              <article key={name}>
                <span>{name}</span>
                <strong>{level}</strong>
                <p>{evidence}</p>
              </article>
            ))}
          </div>
        </section>
      </>
    );
  } else if (active === "Organisation") {
    view = (
      <>
        <PageIntro
          page="Organisation"
          eyebrow="CONTEXT BEFORE CONTENT"
          title="Start with what the organisation is trying to achieve."
        >
          The service needs enough context to produce useful governance, but not a long
          consultancy questionnaire. Use known Operations Automated details or a safe fictional
          example, then amend only what is wrong.
        </PageIntro>

        <section className="assist-panel">
          <div>
            <span className="kicker">ASSISTED START</span>
            <h2>Do not type what the project already knows.</h2>
            <p>
              The Operations Automated option fills the retained project context and known
              document inventory. It does not send data to another AI service.
            </p>
          </div>
          <button type="button" onClick={() => loadPreset(0)}>
            Use Operations Automated context
          </button>
        </section>

        <section>
          <h2>Or use a fictional testing context</h2>
          <div className="presets">
            {presets.slice(1).map((preset, index) => (
              <button type="button" onClick={() => loadPreset(index + 1)} key={preset.label}>
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        <section className="form-card">
          <div className="form-grid">
            {organisationFields.map((field) => (
              <FormField
                key={field.key}
                label={field.label}
                help={field.help}
                example={field.example}
                wide={field.wide}
              >
                <textarea
                  rows={field.key === "name" ? 1 : field.wide ? 3 : 2}
                  value={workspace.organisation[field.key]}
                  onChange={(event) =>
                    setWorkspace({
                      ...workspace,
                      progress: {
                        ...workspace.progress,
                        organisationReviewed: false,
                      },
                      organisation: {
                        ...workspace.organisation,
                        [field.key]: event.target.value,
                      },
                    })
                  }
                />
              </FormField>
            ))}
          </div>
          <div className="form-actions">
            <button type="button" onClick={saveOrganisation}>
              Save organisation context
            </button>
            <span>Saving records the context; it does not approve a policy or connect a service.</span>
          </div>
          <SaveNotice notice={notice} page="Organisation" go={go} />
        </section>
      </>
    );
  } else if (active === "Authority") {
    view = (
      <>
        <PageIntro
          page="Authority"
          eyebrow="WHO CAN DECIDE WHAT"
          title="Authority means the role allowed to make each decision."
        >
          A role name keeps the documents useful as people change. One authorised person may
          hold several roles during private validation, but the AI drafting role cannot approve
          its own work.
        </PageIntro>

        <section className="explanation-grid">
          <article>
            <span>Company governance</span>
            <strong>How Operations Automated runs as a business</strong>
            <p>Policies, business risk, controls, permissions and company publication.</p>
          </article>
          <article>
            <span>Customer methodology</span>
            <strong>What Operations Automated teaches other people</strong>
            <p>Method meaning, guidance, practices, templates and external release.</p>
          </article>
          <article className="decision-card">
            <span>Human control</span>
            <strong>Technical access is not decision authority</strong>
            <p>The audit retains the actual human actor when a consequential decision occurs.</p>
          </article>
        </section>

        <section className="form-card">
          <div className="form-heading">
            <div>
              <h2>Recommended role model</h2>
              <p>Keep these defaults unless a different role genuinely owns the decision.</p>
            </div>
            <button
              type="button"
              className="secondary"
              onClick={() =>
                setWorkspace({
                  ...workspace,
                  authority: { ...defaultAuthority },
                  progress: { ...workspace.progress, authorityReviewed: false },
                })
              }
            >
              Restore recommended roles
            </button>
          </div>
          <div className="form-grid">
            {authorityFields.map((field) => (
              <FormField key={field.key} label={field.label} help={field.help}>
                <input
                  value={workspace.authority[field.key]}
                  onChange={(event) =>
                    setWorkspace({
                      ...workspace,
                      progress: {
                        ...workspace.progress,
                        authorityReviewed: false,
                      },
                      authority: {
                        ...workspace.authority,
                        [field.key]: event.target.value,
                      },
                    })
                  }
                />
              </FormField>
            ))}
          </div>
          <div className="authority-boundary">
            <strong>What saving authority does—and does not do</strong>
            <p>
              It gives the proposed documents meaningful role names. It does not delegate new
              powers, approve anything, or make AI responsible for a human decision.
            </p>
          </div>
          <div className="form-actions">
            <button type="button" onClick={saveAuthority}>
              Save authority roles
            </button>
          </div>
          <SaveNotice notice={notice} page="Authority" go={go} />
        </section>
      </>
    );
  } else if (active === "Sources & destination") {
    view = (
      <>
        <PageIntro
          page="Sources & destination"
          eyebrow="INPUT IS NOT OUTPUT"
          title="Choose what the service reads and where proposed drafts should go."
        >
          Sources are evidence used to understand the current position. The destination is the
          separate Confluence location where reviewed drafts may later be published through the
          private Workbench.
        </PageIntro>

        <section className="flow-map" aria-label="Controlled source and publication flow">
          {[
            ["Read", "Authorised source scope"],
            ["Understand", "Inventory and gaps"],
            ["Create", "Proposed documents"],
            ["Review", "Private Workbench"],
            ["Publish", "Confluence Draft"],
          ].map(([verb, description], index) => (
            <article key={verb}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{verb}</strong>
              <small>{description}</small>
            </article>
          ))}
        </section>

        <section className="source-destination-grid">
          <article className="setup-card">
            <div className="setup-heading">
              <span>INPUT</span>
              <h2>Knowledge source</h2>
              <p>What the assessment is allowed to use as evidence.</p>
            </div>
            <FormField
              label="Source method"
              help="Choose the controlled project memory, a Confluence scope accessed through Workbench, or a manual inventory."
            >
              <select
                value={workspace.knowledge.sourceMode}
                onChange={(event) =>
                  setWorkspace({
                    ...workspace,
                    knowledge: {
                      ...workspace.knowledge,
                      sourceMode: event.target.value as KnowledgePlan["sourceMode"],
                      confirmed: false,
                    },
                  })
                }
              >
                <option value="project-memory">Authoritative project memory</option>
                <option value="confluence">Confluence through private Workbench</option>
                <option value="manual">Manual inventory</option>
              </select>
            </FormField>

            {workspace.knowledge.sourceMode === "project-memory" ? (
              <div className="path-card">
                <span>Selected source</span>
                <strong>{workspace.knowledge.sourceSpace}</strong>
                <p>{workspace.knowledge.sourceRoot}</p>
                <small>
                  The GitHub repository remains the authoritative project memory. Proposed and
                  approved content are not treated as the same status.
                </small>
              </div>
            ) : null}

            {workspace.knowledge.sourceMode === "confluence" ? (
              <div className="stack">
                <FormField
                  label="Source space"
                  help="The Confluence space that the private Workbench is authorised to read."
                  example="Internal"
                >
                  <input
                    value={workspace.knowledge.sourceSpace}
                    onChange={(event) =>
                      setWorkspace({
                        ...workspace,
                        knowledge: {
                          ...workspace.knowledge,
                          sourceSpace: event.target.value,
                          confirmed: false,
                        },
                      })
                    }
                  />
                </FormField>
                <FormField
                  label="Source root page"
                  help="The parent page or page tree to include. A future picker should browse this rather than require typing."
                  example="Live / Company Governance"
                >
                  <input
                    value={workspace.knowledge.sourceRoot}
                    onChange={(event) =>
                      setWorkspace({
                        ...workspace,
                        knowledge: {
                          ...workspace.knowledge,
                          sourceRoot: event.target.value,
                          confirmed: false,
                        },
                      })
                    }
                  />
                </FormField>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={workspace.knowledge.includeDescendants}
                    onChange={(event) =>
                      setWorkspace({
                        ...workspace,
                        knowledge: {
                          ...workspace.knowledge,
                          includeDescendants: event.target.checked,
                          confirmed: false,
                        },
                      })
                    }
                  />
                  Include child pages beneath the selected root
                </label>
              </div>
            ) : null}

            {workspace.knowledge.sourceMode === "manual" ? (
              <div className="path-card">
                <span>Manual route</span>
                <strong>You will build the inventory in the next step.</strong>
                <p>Use fictional, public or authorised non-confidential information only.</p>
              </div>
            ) : null}
          </article>

          <article className="setup-card destination">
            <div className="setup-heading">
              <span>OUTPUT</span>
              <h2>Draft destination</h2>
              <p>Where reviewed proposals should be prepared for human reading.</p>
            </div>
            <div className="connection-state">
              <span className="status current">Protected route retained</span>
              <strong>Private Workbench connection</strong>
              <p>
                The Confluence credential stays in the local Workbench. This hosted product
                records the destination but never asks for or stores the token.
              </p>
            </div>
            <FormField
              label="Publication platform"
              help="The system that will carry out a later authorised Draft publication."
            >
              <input value={workspace.knowledge.destinationPlatform} readOnly />
            </FormField>
            <div className="two-up">
              <FormField
                label="Confluence space"
                help="The destination space. This is separate from the source space."
                example="Internal"
              >
                <input
                  value={workspace.knowledge.destinationSpace}
                  onChange={(event) =>
                    setWorkspace({
                      ...workspace,
                      knowledge: {
                        ...workspace.knowledge,
                        destinationSpace: event.target.value,
                        confirmed: false,
                      },
                    })
                  }
                />
              </FormField>
              <FormField
                label="Lifecycle"
                help="Draft is the only permitted lifecycle in this pilot. Live needs separate human approval."
              >
                <input value={workspace.knowledge.destinationLifecycle} readOnly />
              </FormField>
            </div>
            <FormField
              label="Parent page"
              help="The human-readable folder or parent page that should contain the proposed company-governance documents."
              example="Company Governance"
            >
              <input
                value={workspace.knowledge.destinationParent}
                onChange={(event) =>
                  setWorkspace({
                    ...workspace,
                    knowledge: {
                      ...workspace.knowledge,
                      destinationParent: event.target.value,
                      confirmed: false,
                    },
                  })
                }
              />
            </FormField>
            <div className="path-card final-path">
              <span>Proposed destination</span>
              <strong>{destinationDescription(workspace.knowledge)}</strong>
              <small>Saving this destination does not publish or create a Confluence page.</small>
            </div>
          </article>
        </section>

        <section className="boundary">
          <strong>Current connection boundary</strong>
          <p>
            This version records source scope, destination and a credential-free hand-off. A
            direct hosted-to-Workbench import is not active because the local Workbench blocks
            cross-site requests by design. That protected hand-off requires a separate reviewed
            implementation; the interface does not pretend it already exists.
          </p>
        </section>

        <section className="form-actions standalone">
          <button
            type="button"
            onClick={saveKnowledgePlan}
            disabled={
              !workspace.knowledge.destinationSpace.trim() ||
              !workspace.knowledge.destinationParent.trim() ||
              (workspace.knowledge.sourceMode === "confluence" &&
                (!workspace.knowledge.sourceSpace.trim() ||
                  !workspace.knowledge.sourceRoot.trim()))
            }
          >
            Save source and Draft destination
          </button>
          <span>No API key is entered or copied here.</span>
        </section>
        <SaveNotice notice={notice} page="Sources & destination" go={go} />

        <details className="future-capability">
          <summary>Other future knowledge providers</summary>
          <p>
            Confluence is the current private route. Notion, Google Drive &amp; Docs and Microsoft
            365 retain provider-neutral connector contracts for later, separately approved work.
          </p>
        </details>
      </>
    );
  } else if (active === "Inventory") {
    view = (
      <>
        <PageIntro
          page="Inventory"
          eyebrow="START WITH WHAT EXISTS"
          title="See what is present, outdated or still missing."
        >
          An inventory is evidence about documentation—not proof that the operation works. The
          source of each item stays visible so the recommendation can be challenged.
        </PageIntro>

        <section className="evidence-banner">
          <div>
            <span>Inventory basis</span>
            <strong>{sourceDescription(workspace.knowledge)}</strong>
            <p>
              {workspace.knowledge.confirmed
                ? "Source and destination confirmed."
                : "Return to Sources & destination to confirm the evidence boundary."}
            </p>
          </div>
          {isOperationsAutomated(workspace) ? (
            <button type="button" className="secondary" onClick={addKnownInventory}>
              Add known project inventory
            </button>
          ) : null}
        </section>

        <section className="add-row">
          <FormField label="Document type" help="The kind of governance artefact being recorded.">
            <select
              value={newItem.type}
              onChange={(event) => setNewItem({ ...newItem, type: event.target.value })}
            >
              {documentTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Title" help="Use the title a reader would recognise.">
            <input
              placeholder="For example, Incident Management Policy"
              value={newItem.title}
              onChange={(event) => setNewItem({ ...newItem, title: event.target.value })}
            />
          </FormField>
          <FormField
            label="Current state"
            help="Current means usable now; Draft and Proposed remain unapproved; Missing records a known gap."
          >
            <select
              value={newItem.status}
              onChange={(event) =>
                setNewItem({ ...newItem, status: event.target.value as Item["status"] })
              }
            >
              <option value="current">Current</option>
              <option value="proposed">Proposed</option>
              <option value="draft">Draft</option>
              <option value="outdated">Outdated</option>
              <option value="missing">Known gap</option>
            </select>
          </FormField>
          <button
            type="button"
            disabled={!newItem.title.trim()}
            onClick={() => {
              const item: Item = {
                ...newItem,
                id: crypto.randomUUID(),
                source: "Manual entry",
              };
              void save(
                {
                  ...workspace,
                  progress: { ...workspace.progress, inventoryReviewed: false },
                  inventory: [...workspace.inventory, item],
                },
                "Inventory item added",
                item.title,
                {
                  page: "Inventory",
                  message: `${item.title} was added to the working inventory.`,
                },
              );
              setNewItem({ type: "Policy", title: "", status: "current" });
            }}
          >
            Add item
          </button>
        </section>

        <section>
          {workspace.inventory.length ? (
            <>
              <div className="table">
                {workspace.inventory.map((item) => (
                  <div className="row" key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      <span>
                        {item.type} · {item.source || "Source not recorded"}
                      </span>
                    </div>
                    <span className={`status ${item.status}`}>{item.status}</span>
                    <button
                      type="button"
                      className="remove"
                      onClick={() =>
                        void save(
                          {
                            ...workspace,
                            progress: {
                              ...workspace.progress,
                              inventoryReviewed: false,
                            },
                            inventory: workspace.inventory.filter(
                              (candidate) => candidate.id !== item.id,
                            ),
                          },
                          "Inventory item removed",
                          item.title,
                          {
                            page: "Inventory",
                            message: `${item.title} was removed from the working inventory.`,
                          },
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="form-actions standalone">
                <button type="button" onClick={confirmInventory}>
                  Use this inventory
                </button>
                <span>
                  {workspace.inventory.length} item{workspace.inventory.length === 1 ? "" : "s"}{" "}
                  will inform the recommendation.
                </span>
              </div>
            </>
          ) : (
            <div className="empty">
              <strong>No documentation recorded yet.</strong>
              <p>
                That is a valid starting point. Add an item, load the known Operations Automated
                context or continue to receive a minimum-foundation recommendation.
              </p>
              <button type="button" onClick={confirmInventory}>
                Continue with no existing documents
              </button>
            </div>
          )}
          <SaveNotice notice={notice} page="Inventory" go={go} />
        </section>
      </>
    );
  } else if (active === "Recommendations") {
    view = (
      <>
        <PageIntro
          page="Recommendations"
          eyebrow="AN EXPLAINED ROUTE"
          title="See what is proposed before authorising generation."
        >
          Each recommendation states why it exists, what informed it, who owns the output and
          where the proposed documents will go. Selecting a recommendation only permits draft
          generation.
        </PageIntro>

        <section className="recommendations">
          {recommendations.map((item) => (
            <article key={item.id}>
              <div className="recommendation-title">
                <span className="priority">{item.priority}</span>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.rationale}</p>
                </div>
              </div>

              <div className="recommendation-facts">
                <div>
                  <span>Evidence used</span>
                  <strong>
                    Organisation, authority, source plan and {workspace.inventory.length} inventory
                    items
                  </strong>
                </div>
                <div>
                  <span>Proposed owner</span>
                  <strong>{workspace.authority.documentOwner}</strong>
                </div>
                <div>
                  <span>Destination</span>
                  <strong>{destinationDescription(workspace.knowledge)}</strong>
                </div>
              </div>

              <details>
                <summary>See the {item.outputs.length} proposed outputs</summary>
                <div className="output-list">
                  {item.outputs.map((output, index) => (
                    <span key={output}>
                      {String(index + 1).padStart(2, "0")} · {output}
                    </span>
                  ))}
                </div>
              </details>

              <div className="decision-explanation">
                <strong>What selecting this means</strong>
                <p>
                  Generate proposed documents for human reading. It does not approve policy,
                  publish to Confluence, promote to Live or change the methodology.
                </p>
              </div>

              <div className="decisions">
                {(
                  [
                    ["accepted", "Select for draft generation"],
                    ["deferred", "Defer"],
                    ["rejected", "Reject"],
                  ] as const
                ).map(([decision, label]) => (
                  <button
                    type="button"
                    className={
                      workspace.decisions[item.id] === decision ? "selected" : "secondary"
                    }
                    onClick={() =>
                      void save(
                        {
                          ...workspace,
                          decisions: { ...workspace.decisions, [item.id]: decision },
                        },
                        "Recommendation disposition",
                        `${item.id}: ${decision}`,
                        {
                          page: "Recommendations",
                          message:
                            decision === "accepted"
                              ? "Selected for draft generation only. Review the proposed outputs above, then generate them when ready."
                              : `The recommendation was ${decision}. No documents were generated.`,
                        },
                      )
                    }
                    key={decision}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>

        <SaveNotice notice={notice} page="Recommendations" go={go} />

        <section className="generation-panel">
          <div>
            <span className="kicker">NEXT OUTPUT</span>
            <h2>Generate the documents you will actually review.</h2>
            <p>
              The content will remain proposed and will use the roles, source record and Draft
              destination shown above.
            </p>
          </div>
          <button
            type="button"
            disabled={
              !recommendations.some(
                (recommendation) => workspace.decisions[recommendation.id] === "accepted",
              )
            }
            onClick={() => void assemble()}
          >
            Generate proposed documents
          </button>
        </section>
      </>
    );
  } else if (active === "Draft documents") {
    const included = workspace.package.filter((item) => item.status === "accepted").length;
    view = (
      <>
        <PageIntro
          page="Draft documents"
          eyebrow="THE ACTUAL OUTPUT"
          title="Read the proposed governance before it leaves this workspace."
        >
          These are substantive frameworks, policies, standards and procedures. They remain
          proposed until the correct human authority reviews and approves them within a separate
          decision.
        </PageIntro>

        <section className="publication-rail" aria-label="Draft publication stages">
          {[
            ["Generated", workspace.package.length ? "complete" : "current"],
            ["Human review", workspace.package.length ? "current" : "future"],
            ["Workbench comparison", "future"],
            ["Confluence Draft", "future"],
            ["Live", "locked"],
          ].map(([label, state]) => (
            <article className={state} key={label}>
              <span />
              <strong>{label}</strong>
            </article>
          ))}
        </section>

        <section>
          {workspace.package.length ? (
            <>
              <div className="package-actions">
                <div>
                  <strong>{workspace.package.length} proposed documents generated</strong>
                  <p>
                    Read individually or select all for the Workbench review package. Selection is
                    not approval.
                  </p>
                </div>
                <button type="button" className="secondary" onClick={includeAllDrafts}>
                  Include all in Workbench review
                </button>
              </div>

              <div className="package-grid">
                {workspace.package.map((component) => (
                  <article key={component.id}>
                    <div className="component-meta">
                      <span>{component.id}</span>
                      <span>{component.documentType}</span>
                      <span>PROPOSED</span>
                    </div>
                    <h2>{component.title}</h2>
                    <p>{component.summary}</p>
                    <dl>
                      <div>
                        <dt>Owner</dt>
                        <dd>{workspace.authority.documentOwner}</dd>
                      </div>
                      <div>
                        <dt>Destination</dt>
                        <dd>{component.destination}</dd>
                      </div>
                    </dl>
                    <details>
                      <summary>Read the proposed document</summary>
                      <pre className="document-preview">{component.content}</pre>
                    </details>
                    <p className="source-note">Sources: {component.sources.join(" · ")}</p>
                    <button
                      type="button"
                      className={component.status === "accepted" ? "selected" : "secondary"}
                      onClick={() =>
                        void save(
                          {
                            ...workspace,
                            package: workspace.package.map((item) =>
                              item.id === component.id
                                ? {
                                    ...item,
                                    status:
                                      item.status === "accepted" ? "candidate" : "accepted",
                                  }
                                : item,
                            ),
                          },
                          "Draft document selection changed",
                          component.title,
                          {
                            page: "Draft documents",
                            message:
                              component.status === "accepted"
                                ? `${component.title} was removed from the Workbench review package.`
                                : `${component.title} was included in the Workbench review package.`,
                          },
                        )
                      }
                    >
                      {component.status === "accepted"
                        ? "Included in Workbench review"
                        : "Include in Workbench review"}
                    </button>
                  </article>
                ))}
              </div>

              <div className="handoff">
                <div>
                  <span className="kicker">CONTROLLED HAND-OFF</span>
                  <strong>
                    {included} of {workspace.package.length} documents selected
                  </strong>
                  <p>{destinationDescription(workspace.knowledge)}</p>
                </div>
                <div>
                  <p>
                    The package contains no credentials and grants no approval. The private
                    Workbench must compare committed source before any later Draft publication.
                    Direct import is not active in this version.
                  </p>
                  {included ? (
                    <a className="download" href="/api/governance-package">
                      Prepare credential-free Workbench package
                    </a>
                  ) : (
                    <button type="button" disabled>
                      Select at least one draft
                    </button>
                  )}
                </div>
              </div>
              <SaveNotice notice={notice} page="Draft documents" go={go} />
            </>
          ) : (
            <div className="empty">
              <strong>No proposed documents have been generated.</strong>
              <p>
                Review a recommendation first. The system will then create the documents for you
                to read here.
              </p>
              <button type="button" onClick={() => go("Recommendations")}>
                Review recommendations
              </button>
            </div>
          )}
        </section>
      </>
    );
  } else {
    view = (
      <>
        <PageIntro
          page="Audit"
          eyebrow="RETAINED ACTIONS"
          title="See what the workspace has recorded."
        >
          This trail shows saves, decisions and generated outputs. It does not turn a technical
          event into approval.
        </PageIntro>
        <section>
          {workspace.audit.length ? (
            <div className="audit">
              {[...workspace.audit].reverse().map((event, index) => (
                <article key={`${event.at}-${index}`}>
                  <time>{new Date(event.at).toLocaleString("en-GB")}</time>
                  <strong>{event.action}</strong>
                  <span>{event.detail}</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              <strong>No actions recorded yet.</strong>
            </div>
          )}
        </section>
      </>
    );
  }

  return (
    <div className="shell">
      <aside>
        <div className="brand">
          <Image src="/brand-mark.png" alt="" width={48} height={48} priority />
          <div className="wordmark">
            <small>Operations</small>
            <strong>Automated</strong>
            <span>Connected Governance</span>
          </div>
        </div>

        <div className="pilot-label">
          <span>Brand pilot</span>
          <strong>{APP_VERSION}</strong>
        </div>

        <nav aria-label="Connected Governance">
          {navItems.map((item) => {
            const complete = item.number && stepComplete(item.page, workspace);
            return (
              <button
                type="button"
                className={active === item.page ? "active" : ""}
                onClick={() => go(item.page)}
                key={item.page}
              >
                <span className={complete ? "complete" : ""}>
                  {complete ? "✓" : item.number || "·"}
                </span>
                <span>
                  <strong>{item.page}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="save" aria-live="polite">
          <i className={saveState} />
          <span>
            {saveState === "loading"
              ? "Loading workspace"
              : saveState === "saving"
                ? "Saving changes"
                : saveState === "error"
                  ? "Save needs attention"
                  : "Workspace saved"}
          </span>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <span>PRIVATE INTERNAL PROPOSAL</span>
            <strong>{workspace.organisation.name || "New governance workspace"}</strong>
          </div>
          <div className="header-actions">
            <span className="status proposed">Not approved</span>
            <a href="/signout-with-chatgpt?return_to=%2F">Sign out</a>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                if (confirm("Reset this private workspace and remove its saved progress?")) {
                  void save(
                    {
                      ...blank,
                      authority: { ...defaultAuthority },
                      knowledge: { ...defaultKnowledge },
                      progress: { ...blank.progress },
                      connectors: { ...blank.connectors },
                      audit: [],
                    },
                    "Workspace reset",
                    "Private workspace cleared",
                    {
                      page: active,
                      message: "The private workspace has been reset.",
                    },
                  );
                }
              }}
            >
              Reset
            </button>
          </div>
        </header>

        <div className="content">{view}</div>
        <footer>
          Connected Governance — by Operations Automated · Private internal dogfooding or
          fictional demonstration only · Proposed brand pilot · AI may propose but cannot approve
        </footer>
      </main>
    </div>
  );
}

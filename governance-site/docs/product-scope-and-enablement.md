# Operations Automated — Connected Governance

## Product definition

Operations Automated is a multi-company service that helps people discover, create, connect, approve, publish and maintain operational governance. It starts with whatever a company has: a mature policy estate, a few procedures, a catalogue, unstructured documents, or nothing.

It is not a replacement methodology and it is not a document chatbot. It applies the Operations Automated methodology while helping each company build a living, evidence-backed governance system. Findings from use can inform later methodology changes, but customer work does not silently rewrite the methodology.

The working product name is **Operations Automated — Connected Governance**. “Governance Knowledge Graph” is the internal name for the structured knowledge layer. “Knowledge base” is clearer user language than “KMDB”: neither a vector database nor a document index is the canonical record.

## Core principles

1. Start with the organisation and desired outcome, not a fixed document checklist.
2. Meet the organisation at its current maturity.
3. Keep source identity, hierarchy, permissions, versions and provenance.
4. Treat documents as published views of structured governance knowledge.
5. Let AI propose, extract, compare, classify, draft and question; never let it approve.
6. Let authorised users escalate a change upward. Only authorised roles can lower its risk or approval route.
7. Make every import, AI proposal, human decision, publication and override auditable.
8. Keep connectors and AI providers replaceable.

## Delivery model

### Multi-tenant SaaS

One hosted Operations Automated service supports many customer organisations. Every organisation is a tenant with isolated users, source connections, secrets, knowledge, search indexes, AI settings, approvals and audit records.

### Enterprise options

- **Managed single tenant:** dedicated application, database, storage and search boundary operated by Operations Automated.
- **Customer-controlled deployment:** a later option for customers that must operate the data plane in their environment.
- **Customer AI gateway:** the customer provides an approved gateway instead of a direct provider credential.

The proof of concept is one private tenant and one user. The domain model must still use tenant and membership boundaries now so that the first customer is not embedded as a global singleton.

## Product surfaces

| Surface | Purpose |
| --- | --- |
| Home | Maturity, risks, changes, questions and next actions |
| Organisation | Context, services, dependencies, obligations, maturity and outcomes |
| Sources | Install document-system connections and select governed source scopes |
| Inventory | Review discovered and manually declared documents, catalogues and gaps |
| Knowledge | Explore policies, requirements, controls, procedures, roles, evidence, tests and relationships |
| Questions | Answer mandatory and dynamically generated discovery questions |
| Recommendations | Accept, defer, reject or escalate proportionate next work |
| Governance package | Review candidate structured components and generated document views |
| Changes | Triage drift, conflicts and proposed updates by risk |
| Approvals | Route and record human approval |
| Publishing | Preview and release approved views back to source systems |
| AI settings | Select the managed example, bring a provider, or configure a customer gateway |
| Audit | Search the complete decision and activity history |

## Source connection and selection

The user journey stays consistent even when provider capabilities differ:

1. Select **Sources → Add source**.
2. Choose Confluence, Google Drive, Notion, Microsoft 365 or upload.
3. Authorise using OAuth or an administrator-approved installation.
4. Choose the top-level container: site, space, drive, shared page, library or upload set.
5. Browse a lazy-loaded hierarchy with tri-state checkboxes.
6. Select whole branches, parent-only nodes, child pages or individual files.
7. Set inclusion rules: descendants, maximum depth, content types, labels, status and exclusions.
8. Choose whether new descendants under selected roots join automatically.
9. Preview readable, excluded and permission-blocked objects.
10. Choose read-only or governed read/write mode and a sync schedule.
11. Run the initial sync, then review the discovered inventory and classifications.

The picker supports search, select all visible, include branch, exclude item, expand/collapse, partial-selection state, estimated count, permission warnings and a final scope summary.

### Provider-specific selection

| Provider | Container | Selectable hierarchy | Important behaviour |
| --- | --- | --- | --- |
| Confluence Cloud | Site then space | Page tree, parent page, descendants, individual pages | List only visible spaces. Retain depth and parent identity. |
| Google Drive & Docs | My Drive or Shared Drive | Folders, Google Docs and supported files | Folder selection is supported. Distinguish Shared Drive ownership and permissions. Export Workspace content when a portable representation is required. |
| Notion | Pages and data sources shared with the integration | Shared roots, nested pages and blocks | Search is not exhaustive and indexing is not immediate. Show refresh and shared-scope guidance. |
| Microsoft 365 | SharePoint site or OneDrive, then library | Folders, Word files and other drive items | Use Microsoft Graph drive items and the current OneDrive File Picker. Preserve eTags and library identity. |
| Upload | Upload set | Files and optional user-defined folders | Supports DOCX and PDF first; requires a declared owner and source-of-truth status. |

### Stored selection rule

```ts
type SourceSelectionRule = {
  tenantId: string;
  installationId: string;
  provider: "confluence" | "google-drive" | "notion" | "microsoft-365" | "upload";
  containerId: string;
  rootObjectId: string;
  includeDescendants: boolean;
  includeFutureDescendants: boolean;
  maximumDepth?: number;
  contentTypes: string[];
  labels: string[];
  includePatterns: string[];
  excludePatterns: string[];
  explicitIncludes: string[];
  explicitExcludes: string[];
  syncMode: "manual" | "scheduled" | "webhook";
  accessMode: "read" | "governed-read-write";
};
```

Rules are evaluated on each discovery run. Materialised source objects retain remote ID, parent ID, canonical path, URL, revision token, content hash, permission fingerprint, last-seen time, last-synchronised time and error state.

## Canonical governance model

The source document is not flattened into anonymous chunks. The canonical layer stores typed objects and relationships:

- organisation, service, product, process and dependency;
- obligation, policy statement, requirement and standard;
- risk, control, procedure step and decision authority;
- role, owner, approver and notified party;
- evidence requirement, evidence item, measure and exception;
- test, scenario, finding, action and lesson;
- candidate change, approval, publication and superseded version;
- source object, source snapshot, extracted assertion and provenance link.

Every extracted or generated object points to its source snapshot and, where possible, source location. Search indexes and embeddings are derived projections that can be deleted and rebuilt; they are never authoritative.

## AI delivery and bring-your-own-provider

Each tenant chooses one of three modes:

| Mode | Customer experience | Control boundary |
| --- | --- | --- |
| Operations Automated example | Enable a quota-limited managed model for demonstrations and early trials | Operations Automated pays and controls the provider account; initially fictional or approved test data only |
| Bring your own provider | Add an API credential, endpoint, project/deployment and permitted model list | Customer pays the provider; the secret remains server-side and tenant-isolated |
| Customer AI gateway | Configure an enterprise gateway or proxy | Customer applies its own routing, policy, logging and residency controls |

The AI adapter exposes governed capabilities rather than provider-specific calls:

- extract structured candidates with citations;
- classify discovered content and confidence;
- identify contradictions, gaps and stale statements;
- generate next questions from mandatory questions and missing evidence;
- propose relationships between governance objects;
- draft or revise a candidate component;
- summarise a change and recommend a risk route;
- retrieve and rerank authorised knowledge.

Configuration records provider, endpoint, model/deployment, permitted capabilities, budget, context limits, retention choice, region, redaction rules, prompt/template versions and an active credential reference. Credentials are encrypted in a secret store, never returned to the browser, and can be tested, rotated, disabled and deleted.

AI output is always a candidate with provider, model, prompt version, input references, timestamp, token/cost metadata and confidence. It cannot approve, lower a risk class, change source permissions or publish.

For an OpenAI-managed example, use the Responses API through a server-side project credential. File search/vector stores may be a derived retrieval implementation, but tenant indexes stay separate and lifecycle rules explicitly delete provider-side files and vector stores. Provider retention and residency controls are part of tenant enablement, not an assumption.

## Multi-tenant domain model

Minimum entities:

- `tenant`, `user`, `membership`, `role`, `permission`;
- `connector_installation`, `source_selection_rule`, `source_object`, `source_snapshot`, `sync_job`;
- `governance_object`, `governance_relationship`, `provenance_reference`;
- `question`, `answer`, `recommendation`, `disposition`;
- `ai_provider_configuration`, `ai_run`, `ai_candidate`;
- `change_case`, `risk_classification`, `approval_route`, `approval_decision`;
- `publication_target`, `publication`, `conflict`;
- `audit_event`.

Every tenant-owned row carries `tenant_id`. Object storage paths, vector namespaces, cache keys and job queues are tenant scoped. Authorisation is checked in the service layer and database policy, not only in the interface.

### Roles

| Role | Typical authority |
| --- | --- |
| Tenant owner | Organisation, billing, security and ultimate configuration |
| Administrator | Users, source installations, AI settings and policies |
| Governance owner | Model, risk classes, approval routes and releases |
| Document owner | Content scope, candidates and publication for owned material |
| Contributor | Answers, evidence and candidate changes |
| Reviewer / approver | Review or approve within delegated authority |
| Viewer | Read authorised released knowledge |
| Auditor | Read audit, provenance and evidence without editing |

Anyone with change-raising permission can escalate. Lowering the proposed risk or approval ring requires explicit `change.reclassify_down` authority and a reason.

## Synchronisation and publication

Discovery and publication are separate pipelines.

### Discovery

1. Enumerate the configured scope.
2. Compare remote revision, hash and permission fingerprint.
3. Fetch only new or changed authorised content.
4. Store an immutable source snapshot and provenance.
5. Extract structure deterministically before calling AI.
6. Create candidates for classifications, objects, relationships, gaps and questions.
7. Require human disposition for material changes.

### Publication

1. Assemble an approved release from canonical objects.
2. Render a provider-specific preview.
3. Re-read the remote revision and permissions.
4. Stop on conflicts or lost authority.
5. Require the correct human approval ring.
6. Write through the provider adapter.
7. Read back and verify the new remote revision.
8. Retain the release, before/after snapshot, actor and provider response.

Read and write access are separate grants. The first external connector release is read-only. Writes are enabled per installation only after conflict handling, approval routing, repair procedures and audit verification pass.

## Security and trust boundary

- OAuth with minimum scopes; no browser-stored provider tokens.
- Encrypted secrets with rotation and revocation.
- Tenant isolation across database, storage, search and jobs.
- Source permissions rechecked during sync and before answering a user.
- Content-level access filtering before retrieval, not after generation.
- Immutable audit for authentication, configuration, import, AI use, disposition, approval and publication.
- Configurable retention, deletion and export.
- Rate limits, quotas and cost controls per tenant and connector.
- Imported document instructions are content, never system commands.
- Sensitive-data classification and optional redaction before external AI calls.
- Queues, retries, idempotency keys, cursors and dead-letter review.

## Release scope

### Release 0 — current private proof of concept

- One authenticated tester.
- Persistent workspace.
- Operations Automated dogfooding organisation with role-based governance authority.
- Ten substantive proposed business-governance components that can be reviewed individually.
- Fictional company scenarios and manual inventory.
- Deterministic recommendations and human dispositions.
- Candidate package assembly and audit.
- Credential-free JSON hand-off of accepted components to the private Workbench's controlled Confluence Draft publication route.
- Provider-neutral connector profiles and single-object read probes.
- No browseable pickers, recurring sync, AI calls, direct publication or Live promotion.

### Release 1 — external design-partner pilot

- Tenant and membership model.
- Organisation onboarding and maturity questions.
- OAuth installation for Confluence first.
- Space and lazy page-tree picker with stored selection rules.
- Read-only initial and incremental sync.
- Source inventory, snapshots, provenance and permission warnings.
- Operations Automated managed AI example with quotas and citations.
- Mandatory plus dynamically generated questions.
- Candidate review, audit and fictional demonstration tenants.

### Release 2 — multi-source pilot

- Google Drive folder/file picker and Shared Drive support.
- Notion shared-root recursion.
- Microsoft 365 site/library/folder picker.
- Upload intake for DOCX and PDF.
- Bring-your-own AI provider and customer gateway configuration.
- Cross-source duplicate, contradiction and gap detection.
- Tenant roles, risk routes and approval rings.

### Release 3 — controlled maintenance

- Webhook or scheduled change detection.
- Change impact analysis and notifications.
- Governed Confluence publication, then other providers.
- Conflict handling, read-back verification and repair.
- Permission-constrained search and Q&A.
- Retention, export and tenant administration.

## Connector definition of done

A connector is not “enabled” merely because a token succeeds. It is ready for external use when:

- installation and reauthorisation work;
- visible containers can be enumerated;
- hierarchy selection and persisted rules work;
- permissions and partial failures are visible;
- full and incremental sync are idempotent;
- deleted, moved and permission-lost objects are handled;
- snapshots, provenance and audit are complete;
- rate limiting, pagination, retries and credential rotation are tested;
- tenant deletion removes local and provider-side derived data;
- publication remains impossible unless separately released.

## Immediate build sequence

1. Validate the Operations Automated dogfooding package and Workbench Draft hand-off without Live publication.
2. Feed document comments, edits and scenario findings back as evidence-backed candidate changes, routed to the correct operating system.
3. Add tenant, membership, connector-installation, selection-rule, source-object and snapshot tables.
4. Replace service-owner static tokens with tenant-scoped OAuth installations.
5. Implement the Confluence space/page-tree browser and selection-rule API.
6. Run read-only sync into source snapshots and inventory.
7. Add provenance-backed extraction candidates and question generation.
8. Add the managed AI example behind explicit consent, quotas and fictional-data guidance.
9. Test end to end with fictional companies of different maturity.
10. Add Google Drive using the same connector and picker contracts.
11. Add BYO AI after secret lifecycle, policy and deletion controls are complete.

## Capability references

- [Confluence spaces](https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-space/)
- [Confluence pages](https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-page/)
- [Confluence page descendants](https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-descendants/)
- [Google Drive file and folder search](https://developers.google.com/workspace/drive/api/guides/search-files)
- [Google Drive file hierarchy](https://developers.google.com/workspace/drive/api/guides/about-files)
- [Google Picker web component](https://developers.google.com/workspace/drive/picker/guides/web-component)
- [Google Drive export](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/export)
- [Notion nested page content](https://developers.notion.com/guides/data-apis/working-with-page-content)
- [Notion search limitations](https://developers.notion.com/reference/search-optimizations-and-limitations)
- [Microsoft Graph SharePoint model](https://learn.microsoft.com/en-us/graph/api/resources/sharepoint?view=graph-rest-1.0)
- [Microsoft Graph drive items](https://learn.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0)
- [OneDrive File Picker](https://learn.microsoft.com/en-us/onedrive/developer/controls/file-pickers/?view=odsp-graph-online)
- [OpenAI Responses API quickstart](https://platform.openai.com/docs/quickstart/make-your-first-api-request)
- [OpenAI platform data controls](https://platform.openai.com/docs/models/default-usage-policies-by-endpoint)

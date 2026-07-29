# Operations Automated Workbench

This is a private, local-first application prototype for applying and improving the Operations Automated methodology with AI-led, human-controlled governance.

> **Status:** Workbench 0.9.0 was approved and merged for private internal validation through PR #15. The later Workbench and methodology-publication increments remain proposed. The Workbench is not deployed or approved for external use.

> **Methodology boundary:** The approved Operations Automated v0.7 repository baseline remains authoritative. Workbench analysis, connected evidence, feedback classification and proposal preparation do not approve methodology meaning.

> **Proposed purpose-and-steering control:** Workbench build `1.6.0-steering-control-draft` adds a visible Product Purpose, project-boundary, prompt-provenance, conflict and recovery surface. It classifies and retains substantive request-intake recommendations, blocks new Build Jobs without an approved purpose, approved Steering contract and exact approved prompt, and preserves rejected or deferred routes. The Steering contract, purpose reconciliations and future Workbench build prompt remain proposed or Draft; this surface cannot approve them or migrate the separate Dynamic Governance Tool.

> **Proposed Methodology application-and-learning contract:** Workbench build `1.7.0-methodology-contract-draft` adds complete signal fields, related-signal detection and retained synthesis, full change-proposal fields, versioned Methodology releases, outcome reviews and an application envelope containing the exact baseline and knowledge snapshot. It rejects uncontracted RPG and Player Lab data and keeps Dynamic Governance findings as signals. These mechanics remain proposed, cannot approve themselves and do not change v0.7.

> **Proposed complete base journey:** Workbench build `1.8.0-workbench-base-completion-draft` makes the existing learning mechanics usable through one **Methodology learning** area, the two founder questions, visible Learning Reviews and full feedback-to-outcome traces. It also completes the Codex handoff and rejects incomplete returns until every acceptance criterion has evidence. The [base-completion proposal](../product/ai-workbench-base-completion.md) and its tests demonstrate the controlled vertical journey and recovery route; they do not approve Methodology meaning, merge, product release, Confluence Live promotion or external use.

> **Proposed mobile knowledge pilot:** Workbench build `1.1.2-mobile-voice-recovery-draft` corrects the local reading, phone layout and failed-transcription recovery path. A tailnet-only Tailscale Serve route was observed running between Jamie's computer and phone, with Funnel disabled. Operational activation is recorded as evidence; it does not create or replace the still-required governance decision or approve this product release.

> **Proposed Operate pilot:** Workbench build `1.3.0-operate-action-loop-draft` adds a unified **My Work** inbox, explainable **Do Next** order, the initial Operations Bible and a governed action loop. Every open item exposes a working next action. Oppa Mate suggests names and safe defaults; ordinary approvals use explicit labelled choices, material decisions require an outcome and higher-consequence Risk acceptance retains its stronger confirmation. This is prepared product behaviour, not an approved methodology or release.

> **Proposed operating-surface increment:** Workbench build `1.4.0-workbench-operating-surface-draft` joins governed knowledge, conversation continuity, configurable record and Work Profile definitions, the shared Decision/Approval model and the external-Codex Build Job loop. It is implemented for review on a proposal branch; it is not approved for merge, release, publication or customer use.

> **Proposed usability follow-on:** Workbench build `1.4.1-assisted-capture-actions-draft` lets Oppa Mate suggest an editable name and populated defaults, keeps optional detail collapsed, uses labelled clicks for ordinary Approval and requires a selected outcome for a material Decision. Risk acceptance keeps its stronger typed control. This is prepared for private review only.

> **Proposed source-context follow-on:** Workbench build `1.4.2-source-context-inline-help-draft` makes PR-backed work self-contained in **My Work**. It adds a safe direct source link, plain-English review package and exact decision; Oppa Mate help now opens inside the work item. A full conversation visibly retains the originating work, source and route back. This is prepared for private review only.

> **Proposed plain-language follow-on:** Workbench build `1.4.3-plain-language-user-journeys-draft` keeps the main Oppa Mate answer and feedback journey in ordinary user language. Source paths, status and control trace remain available in optional detail. Every feedback and guide action explains its result before the user chooses it. The change preserves existing local data and does not amend approved methodology meaning.

> **Proposed complete-workflow correction:** Workbench build `1.5.1-complete-workflows-draft` makes **My Work** a founder action queue rather than a mixed status list. Each detail explains the current step, owner, Jamie's part, the route to completion and its success evidence. Retained feedback completes automatically where no change is required; change candidates open one review; approved preparation opens one Codex-owned Build Job. Work discussions and the daily challenge use separate conversations. This remains proposed product behaviour for private review.

> **Proposed scheduled AI-owner queue:** Workbench build `1.5.3-ai-owner-queue-draft` exposes one local queue for bounded work assigned to Operations Automated AI or Codex. A recurring Codex task can claim one ready item, carry out its recorded prompt and return structured evidence to the Workbench. Items remain outside Jamie's **Do Next** list unless clarification or a governed decision is required. Manual copy and return remain available as recovery. This does not give AI approval, release, publication, risk-acceptance, spending or access authority.

Use either one-click entry point:

- Double-click the **Operations Automated Workbench** shortcut on the desktop.
- Double-click `Launch-Workbench.cmd` in the repository.
- Double-click `Launch-Brand-Review.cmd` to open the Workbench directly at the proposed Brand Review area.

The launcher locates an available Node.js runtime, opens a clearly labelled server window, verifies the local API and opens `http://127.0.0.1:4173` in the browser. If a recognised older Workbench is already using that address, it safely replaces that exact local Node.js process with the current build. It will not stop an unrecognised service. Keep the server window open while using the Workbench.

The page and server compare a controlled build marker. A persistent restart warning replaces misleading partial or indefinitely loading Brand Review content if their versions ever differ.

The underlying `.\Start-Workbench.ps1` command remains available for troubleshooting and automation.

The direct `npm start` command remains available for environments where Node.js and npm are already on `PATH`.

The launcher checks the running server build before opening the page. If an older recognised Workbench is still using port 4173, it verifies that the listener is the local Node Workbench, stops it and starts the selected repository build. This prevents an apparently running page from silently using missing or stale assets.

## Proposed phone access

The proportionate founder pilot is Tailscale Serve, not a public tunnel:

1. Jamie explicitly approves the private access connection and Jamie-only identity boundary.
2. Install Tailscale from its official source on this Windows computer and on the phone.
3. Sign in to both devices with the same authorised account.
4. Keep the Workbench listening only on `127.0.0.1:4173`.
5. Run `tailscale serve --bg 4173` and use the returned private HTTPS `*.ts.net` address on the phone.
6. Allow microphone access, complete one spoken challenge and confirm that an unauthorised identity cannot connect.
7. Record and test the Serve-disable and device-removal route.

The computer and Workbench still need to be running. If the phone reports **Bad Gateway**, start the desktop **Operations Automated Workbench** shortcut and keep the server window open. Tailscale Funnel, router port-forwarding and a public URL are not part of the proposed pilot. Documentation of the observed route does not approve it.

## Mobile voice and transcription recovery

1. Select **Record** and confirm that the microphone name and live sound-level bar appear.
2. Speak, then select **Stop recording**. The browser emits regular audio chunks so a mobile recording is not dependent on one final chunk.
3. The Workbench selects a supported WebM, MP4/M4A or Ogg container where the phone browser exposes that capability. The server also checks the audio file signature when mobile MIME metadata is missing.
4. If transcription succeeds, review the editable text before using it.
5. If transcription fails, do not repeat the recording immediately. The original audio remains temporarily in that browser tab: select **Retry transcription**, or select **Discard and record again**.
6. Expand **Recording details** only when troubleshooting. It shows duration, size, format, sound detection and a failure reference without retaining the audio on the server.

Temporary audio is held only in the current browser page. Refreshing or closing the page clears it. Successful and failed server attempts retain timing, size, format and error metadata for diagnosis, but not the recording or transcript content.

## Proposed brand review pilot

The current brand-system branch adds a bounded internal Brand Review area. It:

- consumes the shared `brand/tokens/brand.css` source and controlled OA mark;
- shows visual examples for the mark, palette, typography, connection field, Workbench, documentation, LinkedIn cover and source wording;
- links to the full live brand board and starter pages through the local Workbench server;
- displays the project-wide brand adoption register; and
- records approve-for-internal-use, revise or reject choices in the local Workbench database as review evidence; and
- automatically surfaces revision and rejection notes in a founder-feedback queue, where Codex can retain its response and return a prepared revision for founder re-review.

These item-level choices do not change repository status, merge the brand pull request or authorise publication. A Codex response also remains review evidence: it may reference work prepared on a proposal branch, but it does not create an automatic repository write or approval. The pilot remains proposed until Jamie explicitly decides the draft brand change.

## Provider setup

Voice transcription, translation and model reasoning require an OpenAI API key with API billing enabled. A ChatGPT subscription does not itself supply API credit.

1. Create an API key in the OpenAI API dashboard.
2. From the repository root, run `.\Configure-Workbench.ps1`.
3. Paste the key into that secure PowerShell prompt, not into the browser or chat.
4. Close any existing window titled **Operations Automated Workbench - keep open**.
5. Run `.\Start-Workbench.ps1`.
6. Open `http://127.0.0.1:4173`. The header should say **Provider connected**.
7. Select **Record**, check the live sound-level bar, speak, select **Stop**, review the transcript, optionally translate it, then choose **Use reviewed text**. If transcription fails, use the retained-recording retry panel before recording again.

The local server loads `.env` itself. The key is read only by the Node.js server and is never returned to the browser, logged, stored in SQLite or included in exports. `.env` is excluded from Git.

The configured defaults are `gpt-5.6-sol` for reasoning and `gpt-4o-mini-transcribe` for push-to-record speech transcription. Change the environment values later if you deliberately choose different capability tiers.

## Confluence setup and evidence synchronisation

The private Confluence connection is configured inside the Workbench; Jamie does not edit `.env` or another configuration file.

1. Start the Workbench and open **Connections**.
2. Enter the Atlassian Cloud site address, service-account email and scoped API token.
3. Select **Test and show spaces**. Testing is read-only and does not save the credential.
4. Assign a different accessible space to **Internal** and **Methodology**.
5. Select **Save encrypted connection**.
6. Select **Synchronise read-only evidence** when pages from those spaces should influence Workbench analysis.

The saved credential is encrypted with Windows Data Protection API for the current Windows user and stored under local application data, outside this repository. It is not returned to the browser, written to `.env`, stored in SQLite, included in exports or retained in conversation memory.

Synchronised page text is labelled external evidence and held only in server memory for this increment. Restarting the Workbench clears page text while retaining the encrypted connection. Synchronise again when required.

The approved-for-private-validation v0.7 evidence route exposes no Confluence create, update, move, archive or delete action. Read-only evidence synchronisation remains distinct from the proposed v0.8 documentation-publication workflow.

**Remove saved connection** deletes the locally protected credential and clears synchronised evidence. It does not revoke the token in Atlassian; revoke it there as well if the credential should no longer work.

This token-entry route is for Jamie's private local validation only. A customer-facing integration must use Atlassian's supported app authentication, such as OAuth 2.0 or Forge, rather than collecting customer API tokens.

## Governed documentation publication

Workbench 0.9.0 provides a separate, controlled route for delivering the repository as readable lifecycle-first Confluence documentation during private internal validation.

1. Open **Connections** and select **Preview documentation update**.
2. Review the create, update, unchanged and conflict counts.
3. Expand the Methodology and Internal page lists, then review Live, Draft and Archived within each space.
4. Resolve any conflict; the Workbench will not overwrite a page that changed independently or adopt an unmanaged same-title page. A tracked version conflict offers a separate **Use reviewed Git copy** recovery after both versions have been reviewed; that preparation performs no write and does not replace the later publication confirmation.
5. After the capability is approved, merged and running from `main`, confirm the reviewed plan and type **Publish reviewed pages to Confluence** exactly.
6. The Workbench creates parents before children, updates only tracked pages and retains the returned Confluence page versions.

Each space is organised first by lifecycle:

- **Live:** approved, published and recorded material active for its stated scope.
- **Draft:** ideas, drafts, proposals and unrecognised working states.
- **Archived:** superseded and rejected material retained for history.

The normal subject structure sits beneath each lifecycle folder:

- **Methodology:** core methodology, principles, evolution and governance, practical tools, and proposals and assurance.
- **Internal:** governance and direction, decisions, product and delivery, change history and assurance, and feedback and validation evidence.

Each controlled document displays its repository status, derived lifecycle location, approval or decision boundary, source path, source version, source commit and source hash. Git remains authoritative. A merge does not move a proposed artefact into Live.

An implemented methodology release recorded through the Workbench creates a pending Confluence-publication item. It does not write automatically. A later founder-confirmed publication clears the pending item.

The publication workflow cannot delete, archive or purge a page. It cannot edit an unmanaged page, create methodology approval, publish externally or act while the Workbench is running from a development branch.

## Consolidated methodology Draft

The managed Methodology Draft route began as the first human-first reading pilot approved through PR #17. It now carries the consolidated proposed v0.8 reading draft without changing the controlled mirror or Live methodology.

The Lab is published beneath the existing Methodology **Draft** parent. AI may publish a committed, conflict-free Draft without requesting another founder confirmation:

1. Open **Connections**.
2. Select **Preview methodology draft**.
3. Confirm that the plan contains only the ten proposed methodology pages in the private Methodology space.
4. Check automatically that the reading root resolves beneath the managed Draft parent and that no conflict exists.
5. Publish the Draft under the standing AI draft-publication authority.
6. Record returned page identifiers and versions.
7. Open the returned pages and complete **Review the consolidated draft**.
8. Retain the response through the existing feedback and challenge loop.

The managed manuscript is stored under `publication/methodology-lab-001` for backwards-compatible page identity. Every page remains proposed, maps to approved or recorded controlled sources and states that Git remains authoritative.

The Lab preview and Draft write are separate from the lifecycle-mirror plan. It cannot update a controlled-mirror item, clear a pending methodology-release publication, delete a page, promote content to Live or approve its own synthesis.

## Implemented MVP boundary

### Oppa Mate identity pilot

Oppa Mate is presented as the primary Operations Automated service-account user rather than a product sub-brand. The pilot uses a controlled **OM** avatar, the full name **Oppa Mate** and the role descriptor **Operations Automated service account**. The identity makes account activity recognisable but does not itself grant access, approval authority or permission to act. It remains draft and has its own item in Brand Review for founder approval, revision or rejection.

- Proposed unified **My Work** inbox across operational records, open change decisions and Brand Review work
- Search plus Blocked, Waiting on Jamie, Waiting on Codex, Work Profile and record-type filters
- Proposed explainable 80:20 priority and a five-item **Do Next** list
- Proposed Cases, Requests and Tasks with optional relationships, journey and product overlays
- Proposed Operations Bible covering Case, Request, Task, Incident, Problem, Change, Risk, Finding, Improvement, Scenario Test, Decision and Approval
- Versioned JSON Operations Bible and seven configurable Work Profiles loaded directly by the Workbench
- Correctable Oppa Mate record-type recommendation from ordinary-language capture
- One-description capture with an editable suggested name, visible type/profile recommendation and optional detail behind progressive disclosure
- Separate correctable Work Profile recommendation, retained correction memory and material follow-up questions
- Working type-and-status actions for every open Operations Bible state, with retained actor, evidence and outcome
- Safe action notes are suggested where possible; ordinary Approval is a labelled click, Decision outcome is mandatory and Risk acceptance retains exact confirmation
- Source-backed methodology and Brand Review items route into their existing governed action workflows
- Direct status changes cannot bypass the governed action route; Cases cannot close while contained work remains open
- Typed conversations with pre-send context preview
- Recent-message, rolling-summary and active Case/work continuity, including short follow-ups such as “yes, do that”
- Local SQLite persistence and restart recovery
- Governed knowledge manifest, heading-level SQLite FTS5 retrieval, optional embeddings and exact cited knowledge snapshots
- Read-only Confluence connection, Internal/Methodology space assignment and session-scoped connected-evidence retrieval
- Proposed human-readable Confluence page planning, AI-managed Draft publication, founder-controlled Live publication, optimistic conflict checks and version receipts
- Proposed Purpose & Steering registry, request-intake classification, project-boundary recommendations, exact prompt provenance, visible conflicts and tested recovery status
- Capability-tier routing and configurable cost gates
- Useful local answers, analyses, checklists, templates and proposal-preparation briefs grounded in repository evidence
- Optional server-side OpenAI Responses API route
- Mobile-aware push-to-record capture with live microphone level, supported-format selection, retained-tab retry and editable transcript review
- Optional English working translation while retaining the original transcript
- Working text, Markdown, CSV and JSON attachment extraction, hashing and reuse
- Reopenable conversation history and clearly explained saved feedback
- Seven-way feedback classification covering corrections, context, memory, evidence, methodology candidates, product candidates and no action
- Decision Inbox with separate preparation and release decisions
- Universal Decision and Approval records projected into My Work while specialist histories remain intact
- First-class Implementation Jobs with a copyable Codex brief, structured return receipt, separate release approval and authorised merge receipt
- One local `/api/ai-work` queue with claim-before-action and structured return routes for bounded AI-owned Tasks and already-authorised Build Job phases
- Plain-English decision briefs and a prominent link to the exact draft change on GitHub
- Bounded implementation instructions requiring a new branch, draft pull request, decision record, changelog, version impact and test evidence
- Founder-only release confirmation, retained repository references, reindexing and implementation receipts
- On-demand methodology challenges focused on principles, AI suitability, manual work or delivery capability
- A Methodology learning area with visible dispositions, related-signal Reviews, two direct founder questions and feedback-to-outcome release traces
- Plain-language answers with technical traceability collapsed by default
- Visible recording time, microphone signal, staged request-processing feedback and metadata-only failure auditing
- In-product user guide and soft/hard budget explanations
- Markdown export, usage ledger and audit records
- Push-to-record browser capture with editable review surface
- No approval from classification, no direct edits to main and no AI-authorised merge
- Exact Methodology application envelopes covering version, components, knowledge snapshot, context, evidence, assumptions, uncertainty, result, options, recommendation, authority, case test and feedback route
- Complete learning-signal boundaries, related-signal synthesis, proposed change fields, versioned release records, later-conversation version proof and linked outcome reviews
- Separate-product signal protection: Dynamic Governance findings remain evidence-only signals and RPG or Player Lab data is rejected without an approved signal contract

Retained image analysis and explicit image generation remain later increments and are not shown as available controls.

## Repository change mode

The default `WORKBENCH_REPOSITORY_MODE=manual` records Jamie Peppard's explicit **Approve and merge** release decision but requires the authorised merge to be completed outside the Workbench before its implementation receipt is submitted. This is the safer founder-controlled mode.

Set `WORKBENCH_REPOSITORY_MODE=github` only when the local server is deliberately allowed to invoke the authenticated GitHub CLI after Jamie's explicit confirmation. The server verifies the reviewed branch and `main` target before merging, then fetches and reindexes the merged baseline. AI cannot supply the founder confirmation.

## Challenge Studio

Select **Send me a challenge** from the header for the most useful unresolved methodology tension, or open **Challenge studio** to focus on principles, AI suitability, deliberately manual work or delivery capability. The prepared request asks for one contextual question, not a questionnaire. Any response remains conversation evidence until it is separately classified and governed.

## Privacy boundary

- All application records remain on the local computer unless Jamie deliberately invokes a configured provider or connection.
- An OpenAI request sends the reviewed input and selected evidence context to the configured model provider.
- A Confluence test or synchronisation sends the protected account credential to Atlassian and receives accessible space or selected-space page data.
- A controlled documentation publication sends the bounded page titles and bodies to Atlassian and receives page identifiers and versions. Draft-only plans use the standing AI authority; Live plans require founder confirmation.
- Page bodies retrieved by read-only evidence synchronisation are not persisted by the Workbench.
- Published page bodies already exist in the controlled repository and become retained in the selected private Confluence spaces.
- Credentials and page bodies are excluded from Workbench audit details.
- Browser storage is not an approved repository for confidential or regulated information.
- Use only information authorised for this private pilot and for the configured provider path.
- Exported files inherit the sensitivity of the information entered into them.

Connected pages are treated as untrusted evidence. Commands, approval claims or authority statements inside them do not override Workbench governance.

## Current limitations

- No accounts or collaboration
- No hosted cloud backup
- Confluence is the only privately validated business-system connection
- Connected page bodies must be synchronised again after restarting the server
- No automatic monitoring of Confluence changes
- No scheduled publication, AI promotion to Live, page deletion or general Confluence editing
- Documentation publication manages only pages created or previously tracked by the Workbench
- Scheduled AI-owner pickup depends on the computer, Codex app and local Workbench being available; there is no instant event-driven dispatch or catch-up guarantee
- Methodology authority remains in the controlled Git repository

# Operations Automated Workbench

This is a private, local-first application prototype for applying and improving the Operations Automated methodology with AI-led, human-controlled governance.

> **Status:** Workbench 0.9.0 was approved and merged for private internal validation through PR #15. It is not deployed or approved for external use.

> **Methodology boundary:** The approved Operations Automated v0.6 repository baseline remains authoritative. Workbench analysis, connected evidence, feedback classification and proposal preparation do not approve methodology meaning.

Use either one-click entry point:

- Double-click the **Operations Automated Workbench** shortcut on the desktop.
- Double-click `Launch-Workbench.cmd` in the repository.

The launcher locates an available Node.js runtime, opens a clearly labelled server window, verifies the local API and opens `http://127.0.0.1:4173` in the browser. Keep the server window open while using the Workbench.

The underlying `.\Start-Workbench.ps1` command remains available for troubleshooting and automation.

The direct `npm start` command remains available for environments where Node.js and npm are already on `PATH`.

## Provider setup

Voice transcription, translation and model reasoning require an OpenAI API key with API billing enabled. A ChatGPT subscription does not itself supply API credit.

1. Create an API key in the OpenAI API dashboard.
2. From the repository root, run `.\Configure-Workbench.ps1`.
3. Paste the key into that secure PowerShell prompt, not into the browser or chat.
4. Close any existing window titled **Operations Automated Workbench - keep open**.
5. Run `.\Start-Workbench.ps1`.
6. Open `http://127.0.0.1:4173`. The header should say **Provider connected**.
7. Select **Record**, speak, select **Stop**, review the transcript, optionally translate it, then choose **Use reviewed text**.

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

## Implemented MVP boundary

- Typed conversations with pre-send context preview
- Local SQLite persistence and restart recovery
- Status-aware, heading-level repository retrieval
- Read-only Confluence connection, Internal/Methodology space assignment and session-scoped connected-evidence retrieval
- Proposed human-readable Confluence page planning, founder-confirmed managed-page publication, optimistic conflict checks and version receipts
- Capability-tier routing and configurable cost gates
- Useful local answers, analyses, checklists, templates and proposal-preparation briefs grounded in repository evidence
- Optional server-side OpenAI Responses API route
- Push-to-record voice capture, transcription and editable transcript review
- Optional English working translation while retaining the original transcript
- Working text, Markdown, CSV and JSON attachment extraction, hashing and reuse
- Reopenable conversation history and clearly explained saved feedback
- Seven-way feedback classification covering corrections, context, memory, evidence, methodology candidates, product candidates and no action
- Decision Inbox with separate preparation and release decisions
- Plain-English decision briefs and a prominent link to the exact draft change on GitHub
- Bounded implementation instructions requiring a new branch, draft pull request, decision record, changelog, version impact and test evidence
- Founder-only release confirmation, retained repository references, reindexing and implementation receipts
- On-demand methodology challenges focused on principles, AI suitability, manual work or delivery capability
- Plain-language answers with technical traceability collapsed by default
- Visible recording time and staged request-processing feedback
- In-product user guide and soft/hard budget explanations
- Markdown export, usage ledger and audit records
- Push-to-record browser capture with editable review surface
- No approval from classification, no direct edits to main and no AI-authorised merge

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
- A founder-confirmed documentation publication sends the reviewed page titles and bodies to Atlassian and receives page identifiers and versions.
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
- No automatic publication, page deletion or general Confluence editing
- Documentation publication manages only pages created or previously tracked by the Workbench
- No automated operational execution
- Methodology authority remains in the controlled Git repository

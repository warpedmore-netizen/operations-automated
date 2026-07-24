# OPERATE Workspace MVP

This is a private, local-first application prototype for applying the approved Operations Automated methodology.

> **Status:** MVP 0.1 is approved for private testing. It is not deployed or approved for external use.

> **Internal-validation direction:** v0.4 parks this application as a retained learning experiment. Private testing showed that its record and approval mechanics work, but it does not return in-context AI analysis. Its code and private-test evidence remain available, while further interface development is paused.

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

## Implemented MVP boundary

- Typed conversations with pre-send context preview
- Local SQLite persistence and restart recovery
- Status-aware, heading-level repository retrieval
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

- No data is sent to a server or external service by the application.
- Browser storage is not an approved repository for confidential or regulated information.
- Use only non-confidential pilot information.
- Exported files inherit the sensitivity of the information entered into them.

## AI-assisted use

The **Copy AI brief** action creates a structured prompt containing the current problem, value matrix, OPERATE stage and governance boundary. It can be given to Codex for assistance.

The MVP deliberately does not embed an AI provider or store an API key. A secure in-product AI connection requires a separate data, security, cost and authority decision.

## Current limitations

- One workspace per browser
- No accounts or collaboration
- No cloud backup or synchronisation
- No external integrations
- No automated operational execution
- Methodology configuration is bundled with the application version

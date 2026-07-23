# Operations Automated Workbench

Status: private local MVP; deployment is not authorised.

The Workbench is a conversation-first interface for non-confidential Operations Automated project material. It stores conversations, structured feedback, usage records and audit events in a local SQLite database. Repository grounding retrieves small heading-level excerpts and preserves each source path, front-matter status, version and content hash.

## Start on Windows

From the repository root, right-click `Start-Workbench.ps1` and choose **Run with PowerShell**, or run:

```powershell
.\Start-Workbench.ps1
```

The starter locates an available Node.js runtime, starts the service, waits for it and verifies the local API before reporting the address. Open `http://127.0.0.1:4173`.

The direct `npm start` command remains available for environments where Node.js and npm are already on `PATH`.

## Provider setup

The application works without an API key: local history, context preview, repository retrieval, feedback, proposal packets, exports, settings and the usage ledger remain available. Offline responses are clearly labelled and make no AI claim.

For provider-backed responses, copy `.env.example` to `.env` outside source control, set `OPENAI_API_KEY`, and assign model IDs to the capability-tier environment variables. The key is read only by the server and is never returned to the browser, logged, stored in SQLite or included in exports.

The local server does not automatically load `.env`; set the variables in the PowerShell session or use your existing secret-loading mechanism before `npm start`.

## Implemented MVP boundary

- Typed conversations with pre-send context preview
- Local SQLite persistence and restart recovery
- Status-aware, heading-level repository retrieval
- Capability-tier routing and configurable cost gates
- Offline-safe responses and optional server-side OpenAI Responses API route
- Structured feedback dispositions and governed proposal packets
- Markdown export, usage ledger and audit records
- Push-to-record browser capture with editable review surface
- No automatic approval, publication, merge or repository content write

File extraction, provider transcription/translation, retained image analysis and explicit image generation are intentionally left behind explicit server boundaries for a later increment. The interface never sends an attachment merely because it was selected.

## Privacy boundary

- Use non-confidential project material only.
- Local database, uploads, attachments and audio are excluded from Git.
- Audio is not retained by the current implementation.
- No analytics or telemetry are included.
- Provider retention and data controls require separate review before confidential or external use.

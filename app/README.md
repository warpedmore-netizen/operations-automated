# OPERATE Workspace MVP

This is a private, local-first application prototype for applying the approved Operations Automated methodology.

## Use it

Open `index.html` in a modern browser. The application has no external dependencies and stores the current workspace in that browser only.

For local development, run:

```powershell
npm start
```

Then open `http://127.0.0.1:4173`.

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

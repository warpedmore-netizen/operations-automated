# Northstar Governance Lab

Deployable external-testing surface for the Operations Automated governance-as-code proof of concept.

The lab starts with an organisation's operating context and existing documentation, proposes a proportionate route, records human dispositions, assembles candidate governance components, and retains an audit trail. Five fictional organisations make it possible to test the approach without company data.

## Release boundaries

- ChatGPT sign-in is required.
- Each tester's D1 workspace is isolated by a one-way hash of their authenticated email.
- External testers are told to use fictional or non-confidential data.
- Recommendations and assembled components remain candidates; the application does not grant approval.
- Connector secrets stay server-side.
- Live connector reads remain disabled until test credentials are configured.
- Live connector writes remain release-gated and are not enabled by this release.

## Connector contracts

The deployable surface contains one platform-neutral connector status/probe API and four adapters:

| Connector | Read probe | Future governed publication |
| --- | --- | --- |
| Confluence | Page, body and version metadata | Version-aware page update |
| Notion | Page metadata and edit timestamp | Property and block reconciliation |
| Google Docs | Document structure and revision ID | Atomic batch update with revision control |
| Word / Microsoft 365 | Graph drive-item metadata | Controlled DOCX upload |

Set the server-side bindings listed in `.env.example` to activate a read probe. Use minimum-permission test tenants and never put tokens in browser storage or committed files.

## Local verification

Node.js 22.13 or newer and pnpm are required.

```bash
pnpm install
pnpm run db:generate
pnpm test
```

The build is powered by vinext and Cloudflare Workers. D1 schema changes generate migrations in `drizzle/`.

## Deployment

`.openai/hosting.json` links this directory to the existing OpenAI Sites project. Deployment must use the Sites source-repository, saved-version, and deployment flow so source, archive, migration and deployed version remain traceable.

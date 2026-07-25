# Operations Automated — Connected Governance

Deployable external-testing surface for the Operations Automated connected-governance proof of concept.

The service starts with an organisation's operating context and existing documentation, proposes a proportionate route, records human dispositions, assembles candidate governance components, and retains an audit trail. Five fictional organisations make it possible to test the approach without company data.

Operations Automated is also the first bounded dogfooding organisation. Its workspace creates a proposed business-governance foundation using role-based authority, keeps every component readable in the application and produces a credential-free Draft hand-off for the private AI Workbench. The hand-off does not approve, publish, delete or promote anything to Live.

The complete product, connector-selection, multi-tenant and AI-provider scope is in [`docs/product-scope-and-enablement.md`](docs/product-scope-and-enablement.md).

## Release boundaries

- ChatGPT sign-in is required.
- Each tester's D1 workspace is isolated by a one-way hash of their authenticated email.
- External testers are told to use fictional or non-confidential data.
- Recommendations and assembled components remain candidates; the application does not grant approval.
- The Operations Automated dogfooding package remains `proposed`; authority is expressed through roles rather than founder-specific prose.
- The downloadable Draft hand-off contains governance content and control metadata, but no credentials.
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

To download the current user's accepted candidate package for controlled Draft publication, use **Package → Prepare Draft hand-off**. The authenticated endpoint is `GET /api/governance-package`; an empty package is rejected until at least one candidate component has been accepted.

The build is powered by vinext and Cloudflare Workers. D1 schema changes generate migrations in `drizzle/`.

## Deployment

`.openai/hosting.json` links this directory to the existing OpenAI Sites project. Deployment must use the Sites source-repository, saved-version, and deployment flow so source, archive, migration and deployed version remain traceable.

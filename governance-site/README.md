# Operations Automated — Connected Governance

Deployable external-testing surface for the Operations Automated connected-governance proof of concept.

The service now includes the first complete private internal governance loop for Operations Automated. It generates twelve connected governance documents, supports human review and revision, publishes a controlled Confluence Draft, records explicit approval against exact content fingerprints, and promotes only unchanged approved pages into a Live reading tree.

The complete product, connector-selection, multi-tenant and AI-provider scope is in [`docs/product-scope-and-enablement.md`](docs/product-scope-and-enablement.md).

## Release boundaries

- ChatGPT sign-in is required.
- Each tester's D1 workspace is isolated by a one-way hash of their authenticated email.
- The supplied starter uses Operations Automated's own non-confidential operating context.
- Candidate and Confluence Draft content remain unapproved until Jamie records the exact in-app approval phrase.
- Approval is limited to private internal use and the exact selected content versions.
- Connector secrets stay server-side.
- Every Draft write and Live promotion requires a fresh conflict-free plan and exact confirmation phrase.
- Confluence page identifiers, versions, fingerprints, actors and times are retained in the workspace audit record.
- No delete, automatic publication, unmanaged-page takeover or external publication route exists.

## Working governance journey

1. Open **Organisation** and load or amend the Operations Automated starter.
2. Select **Generate all 12 documents**.
3. Review and edit candidates in **Governance pack**.
4. In **Confluence**, choose the internal governance space and preview the Draft plan.
5. Type `Send reviewed governance drafts to Confluence` to perform that reviewed Draft write.
6. Review the linked Confluence pages, select the intended documents and type `Approve selected governance documents for internal use`.
7. Preview the Live promotion and type `Promote approved governance documents to Live`.

Any edit after Draft publication requires a new Draft. Any edit after approval invalidates the approval. Any independent Confluence version change blocks the next write.

## Confluence connection

The private site uses server-side runtime values only:

- `CONFLUENCE_BASE_URL`: the Atlassian Cloud site URL or scoped API base;
- `CONFLUENCE_SITE_URL`: the normal `.atlassian.net` reading URL;
- `CONFLUENCE_ACCESS_TOKEN`: stored as a hosted secret; and
- `CONFLUENCE_ACCOUNT_EMAIL`: set only when the token requires Basic authentication.

The current private token mode is suitable only for Jamie's bounded internal validation. A distributed customer version must use an approved Atlassian OAuth installation rather than collecting customer API tokens.

## Other connector contracts

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

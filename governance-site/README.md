# Operations Automated — Connected Governance

Private, deployable testing surface for the proposed Connected Governance service.

The service now guides a tester from operating context to readable proposed governance:

1. describe the organisation and intended outcome;
2. define who may approve, own, draft and publish;
3. separate the knowledge source from the Confluence Draft destination;
4. inspect the current-document inventory and known gaps;
5. review an explained recommendation;
6. generate and read the actual proposed documents; and
7. prepare a credential-free package for later private Workbench review.

Operations Automated is the first bounded dogfooding organisation. Its known context and inventory can be loaded without retyping project memory. The interface also retains fictional organisations for safe testing.

## Status and authority

- This product increment is proposed for private internal validation.
- Generated documents remain `proposed`; selecting them for Workbench review does not approve them.
- Company governance and customer-methodology authority remain separate.
- The private Workbench retains the protected Confluence credential.
- The hosted product records source scope and destination but does not ask for or store an API key.
- Direct hosted-to-Workbench import is not active in this increment.
- Live publication, external release, automatic publication, deletion and silent overwrite remain disabled.

## Brand pilot

This interface pilots the separate draft Operations Automated brand system:

- the founder-supplied continuous OA mark;
- Obsidian, Midnight, blue and electric-cyan identity colours;
- Paper and Canvas working surfaces;
- explicit status, human decision and recovery language; and
- the endorsed product relationship **Connected Governance — by Operations Automated**.

This adoption does not approve the brand system for internal or external use. It creates an application pilot that Jamie can review alongside the brand proposal.

## Connector boundary

The deployable surface retains provider-neutral read-probe contracts for Confluence, Notion, Google Drive and Docs, and Microsoft 365. Confluence through the private Workbench is the only current internal route. A future integration must add an authorised broker or import route without exposing the local credential or weakening the Workbench cross-site protection.

## Local verification

Node.js 22.13 or newer and pnpm are required.

```bash
pnpm install
pnpm run lint
pnpm test
```

The build uses vinext and Cloudflare Workers. D1 schema changes generate migrations in `drizzle/`.

## Deployment

`.openai/hosting.json` links this directory to the existing private OpenAI Sites project. Deployment must use the Sites source-repository, saved-version and private-deployment flow so the deployed application remains traceable to the validated source.

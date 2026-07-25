---
id: OA-POC-OGC-001
title: Operational Governance as Code proof of concept
status: proposed
version: 0.1.0
owner: Operations Automated Governance Authority
---

# Operational Governance as Code

This standalone, fictional proof of concept is a service built from Operations Automated methodology principles. It helps users develop and maintain living operational documentation by treating connected governance records as the source of truth and documents as generated views. Those records can become a governed knowledge base for later AI-assisted monitoring, analysis and control. It demonstrates one Incident Management chain from a fictional obligation through controls, policy and procedure to scenario evidence, finding, human-approved change, immutable version and controlled release.

It is demonstration software, not a methodology update, regulatory advice, a compliance determination or an approved Operations Automated product. It contains no real organisation, customer or incident data. Findings from developing and using the service may enter the separate governed methodology-evolution loop as evidence; they never update the methodology automatically.

## Run

From the repository root:

```powershell
npm run governance:start
```

Open `http://127.0.0.1:4174`. The server creates `data/state.json` on first use and preserves governed actions across browser and server restarts. Use **Reset demo** to restore the fictional baseline.

## Test

```powershell
npm run governance:test
```

## Demonstrate the vertical slice

1. Open **Traceability** and inspect `OBL-IM-004` and its linked control, policy, procedure, test, evidence and finding.
1. Open **Document intake** and create a Word, Google Docs, Confluence, text or guided intake. Review the required and gap-driven questions, then accept, amend or reject extracted candidate objects.
2. Open **Scenario** and review the delayed Risk and Compliance notification.
3. Open **Finding** and accept the AI-labelled candidate as a human reviewer.
4. Open **Change proposal**, create the proposal, inspect the wording diff and record a human approval.
5. Open **Release**, create release `REL-IM-002` and view the regenerated policy, procedure and release notes.
6. Open **Audit log** to inspect the complete sequence and **Versions** to confirm the approved previous wording remains available.
7. Open **Integrations**, map the policy to either mock Confluence or mock Notion, publish it, check that it is in sync, simulate an external edit and confirm drift is detected and controlled overwrite is blocked.

## Architecture

The current milestone follows the repository's existing local-first, no-dependency architecture: browser UI, HTTP application service, atomic file persistence, domain service, generated Markdown views and mocked adapters. The service layer is isolated so a later implementation can adopt TypeScript, React and Prisma/SQLite without changing governance rules. See [architecture.md](docs/architecture.md).

Publication is platform-neutral. The core owns eligibility, deterministic generation, mappings, hashes, comparison, drift and conflict handling. Confluence and Notion adapters declare and translate their different hierarchy, content, permission and concurrency models. See [publication-adapters.md](docs/publication-adapters.md).

Adaptive intake and proportionate authority are described in [adaptive-intake-and-authority.md](docs/adaptive-intake-and-authority.md). The proof models one user while preserving the future distinction between escalation, restricted downgrade, approval, notification and acknowledgement.

The complete fictional validation route is recorded in [proof-of-concept-test-plan.md](docs/proof-of-concept-test-plan.md).

## Seed data

Seed records are created by `seed.mjs`; there is no import of regulatory or company data. Every external-source example is visibly marked fictional.

## Important limitations

The local state file is restart-safe but is not a multi-user database, authenticated, tamper-evident or suitable for confidential evidence. Hashes are illustrative. Approval identity is user-entered and therefore demonstrative, not strong authentication. Generated documents include approved records only.

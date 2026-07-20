---
status: proposed
owner: Jamie Peppard
---
# Architecture

## Milestone 1

- `seed.mjs`: fictional canonical starting records.
- `domain.mjs`: governance invariants, workflow, graph analysis, document generation and provider/adapter contracts.
- `app.mjs`: thin browser interaction layer.
- `server.mjs`: local static host.
- local HTTP API: server-side execution of governed actions.
- atomic JSON state file: restart-safe demonstration persistence with serialised writes.

This follows the repository's established local-first, dependency-free architecture and creates no external connection. It is a modular monolith, not a production architecture.

## Intended production migration

Move the same boundaries to TypeScript, React and a server-side application service. Use Prisma with SQLite locally and PostgreSQL in controlled environments. Add authenticated human identity, role-based access, database transactions, append-only audit protection, real integrity hashes, migrations, backups and retention controls. Generated documents should be reproducible artefacts keyed to release IDs. Secrets belong in environment variables or an approved secret manager.


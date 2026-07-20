---
status: proposed
owner: Jamie Peppard
---
# Confluence integration

The mock adapter logs an intended publish and blocks content without an approved-status marker. A real adapter should retrieve and compare the controlled page, require an approved release, publish idempotently, retain page ID/version and content hash, and audit success or failure. Credentials, space permissions, conflict handling, rollback and information classification require explicit approval before connection.


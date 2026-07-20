---
status: proposed
owner: Jamie Peppard
---
# Confluence integration

The mock adapter now maps a generated document to a page beneath a configured space and parent, translates approved content into a storage-page payload, retains the page version and content hash, detects drift and blocks an overwrite after the remote version changes. A real adapter should perform those operations idempotently and audit success or failure. Credentials, space permissions, conflict handling, rollback and information classification require explicit approval before connection.


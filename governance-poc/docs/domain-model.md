---
status: proposed
owner: Operations Automated Governance Authority
---
# Domain model

The implemented aggregate contains RegulatorySource, Obligation, Control, PolicyStatement, Procedure, ScenarioTest, ScenarioObservation, Incident, Evidence, Finding, ChangeProposal, Approval, Release, AuditEvent and AISuggestion. Stable human-readable IDs identify logical objects; `version` identifies immutable revisions. Typed links model many-to-many relationships independently of documents.

The seed is intentionally JSON-shaped for inspectability. Production persistence should normalise objects, versions, links, approvals and append-only audit events into relational tables. Approval and release operations are aggregate transactions: validate authority and status, append versions, append release, append audit event, then commit atomically.

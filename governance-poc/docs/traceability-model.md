---
status: proposed
owner: Operations Automated Governance Authority
---
# Traceability model

Links are first-class directed edges with `from`, `to` and `type`. The demonstration traverses upstream from a finding to its obligation and computes immediate upstream/downstream impact for a changed object. Impact also returns documents to regenerate, scenarios to repeat, owners to review and related findings.

`REG-DEMO-001 → OBL-IM-004 → CTRL-IM-012 → POL-IM-003 / PROC-IM-007 → TEST-IM-014 → OBS-IM-021 → FIND-IM-008 → CHG-IM-024 → REL-IM-002`

Production should enforce referential integrity, object-type constraints, validity dates and release-aware graph queries.

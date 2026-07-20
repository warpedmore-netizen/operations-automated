---
status: proposed
owner: Jamie Peppard
---
# Adaptive intake and authority

## Intake routes

Users may start from an existing Word document, a connected Google Docs or Confluence reference, text as a fallback, or guided questions when no document exists. Each adapter declares its source reference and structure so retrieval and parsing can vary without changing the governed review process.

The current Word, Google Docs and Confluence adapters are mocks: they retain provenance and generate the right missing-content question but do not retrieve external data. No credential or connection is authorised.

## Questioning

Every intake asks a small baseline covering owner, purpose, approval authority, review cycle, effective date and information classification. Deterministic gap rules add questions where content is missing or ambiguous, such as permissive `should` wording or absent evidence. A future AI provider may propose further questions, but must retain its input, output and rationale and cannot confirm answers.

## Candidate objects

Extraction produces suggested policy statements, procedure steps or document sections with provenance and confidence. A named human accepts, amends or rejects each candidate before it can become controlled content.

For guided creation, the first deterministic authoring provider converts the completed baseline into candidate role assignments, policy statements, controls, procedure steps and evidence requirements. Every candidate retains the question IDs that produced it. Only reviewed and accepted candidates can be assembled into a connected draft graph and generated preview; that preview remains explicitly unapproved.

## Proportionate authority

Default rings are Owner, Team, Governance forum and Executive or Board. Organisations may later rename and configure them. Any role may escalate a recommendation. Downgrading is allowed only for an explicitly configured role transition, requires justification and creates an audit event. Approval, notification and acknowledgement are separate obligations derived from the selected change class.

The proof uses one person but models future separation of contributor, document owner, governance chair and executive sponsor authority. Entered role names are demonstrative rather than authenticated.

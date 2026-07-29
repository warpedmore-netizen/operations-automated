# Governed Workbench implementation job — exact prompt v1.0

Status: Draft. Do not select or use this prompt for implementation until its exact text and the referenced Steering contract are approved by a recorded human Decision.

Complete Operations Automated build `{{build_reference}}`.

PROMPT PROVENANCE

- Target project: `ai-workbench`
- Product Purpose: `OA-PRODUCT-001@0.1`
- Steering: `OA-STEERING-001@0.1` (`proposed`; implementation must wait for approval)
- Prompt: `OA-PROMPT-WORKBENCH-BUILD-001@1.0`

APPROVED-FOR-PREPARATION REQUIREMENT

`{{approved_requirement}}`

CURRENT CONTEXT

`{{current_context}}`

METHODOLOGY AND GOVERNANCE CONSTRAINTS

`{{methodology_and_governance_constraints}}`

AFFECTED COMPONENTS

`{{affected_components}}`

ACCEPTANCE CRITERIA

`{{acceptance_criteria}}`

TEST EXPECTATIONS

`{{test_expectations}}`

AUTHORITY BOUNDARY

`{{authority_boundary}}`

RETURN TO THE WORKBENCH

Return the exact branch, draft pull request, commit, changed files, tests, validation, unresolved risks and version impact through the endpoint named by the Build Job. If the Workbench is unavailable, return the same structured evidence after the `OA_WORKBENCH_BUILD_RETURN` marker.

Do not infer merge, release, publication, Product Purpose change, methodology approval, spending, risk acceptance, a new connection or wider delegated authority.

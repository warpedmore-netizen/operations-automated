---
id: OA-PROPOSAL-011
title: Connected Governance Guided Journey and Brand Pilot Assurance Pack
status: proposed
version: 0.2
owner: Operations Automated Product Authority
date: 2026-07-25
---

# Connected Governance guided journey and brand pilot assurance pack

## Decision required later

After private use, decide whether the guided Connected Governance 0.2 journey and draft-brand pilot are suitable for continued internal validation.

This proposal does not ask Jamie to approve the generated company policies, the Operations Automated brand system, a new connection or any Live publication.

## Trigger

Founder testing showed that the service could save data and generate useful content, but the user was left to infer:

- what **Authority** meant;
- whether a save had worked;
- where to go next;
- what Sources and Inventory were doing;
- where generated documents would be created;
- what accepting a recommendation authorised; and
- what useful output the service ultimately returned.

Jamie also asked for the application to begin adopting the emerging Operations Automated brand so the product family feels professional and connected.

## Current and proposed experience

| Current 0.1 | Proposed 0.2 |
|---|---|
| Persistent lower-left save state | Inline confirmation beside the action and a labelled continuation |
| Specialist field labels | Accessible information help, examples and safe assisted context |
| Authority roles without a plain definition | Company governance, methodology and execution authority explained separately |
| Provider-oriented Sources page | Separate knowledge input and Confluence Draft destination |
| Inventory depended on how the profile was loaded | Known Operations Automated inventory added from retained project context |
| Recommendation title and output chips | Evidence, owner, destination, full output list and acceptance consequence |
| Generic assembly transition | Explicit proposed-document generation followed by a visible review action |
| Candidate package appears late | Expected output is explained on the overview and shown as the final guided step |
| Existing blue prototype styling | Proposed OA mark, semantic palette, voice and endorsed product relationship |

## What the implementation changes

- Creates a six-step journey with completion state.
- Keeps Overview and Audit as orientation and traceability rather than required form steps.
- Adds field-level explanations and examples.
- Adds a non-generative shortcut using known project context; no new AI service is contacted.
- Makes save success, failure and next action obvious.
- Records source scope and Draft destination as separate structured fields.
- Includes the destination in generated documents and the hand-off contract.
- Generates ten substantive role-based proposed documents for the Operations Automated case.
- Provides selection for Workbench review without calling it approval.
- Uses the draft Operations Automated identity in an explicitly labelled brand pilot.

## Evidence and confidence

Confidence is high that the former journey was unclear because Jamie described the exact sequence and the code confirmed that save state and transitions were visually weak.

Confidence is moderate that the new route resolves the problem until Jamie uses it. The interface requires private validation at ordinary and small-screen sizes. No claim is made that an independent user will understand it without testing.

## Alternatives considered

### Keep the current interface and add a user guide

This would explain terminology but leave save feedback, transition state and source/destination ambiguity inside the product.

### Automatically progress after every save

This reduces clicks but can conceal what happened. An inline result plus an explicit next action gives the user control without requiring them to find the next page.

### Copy the Confluence credential into the hosted site

This would shorten the route but duplicate a protected secret, expand the connection boundary and weaken the existing Workbench control. It is not recommended.

### Wait for the brand system to be approved

This would avoid using draft styling but lose the application pilot needed to judge the brand in context. A visibly proposed pilot provides evidence without representing approval.

## Dependencies and residual gaps

- The protected Confluence connection remains in the private Workbench.
- Direct Workbench import is not implemented.
- The hosted product does not perform live Confluence inventory retrieval.
- Field assistance uses retained context and examples; a generative AI provider connection remains a separate product decision.
- The brand system remains a separate draft proposal and may change.
- Independent-user and accessibility validation remain necessary.

## Controls

- Every generated document remains `proposed`.
- The interface states that save, selection and generation do not approve or publish.
- Confluence lifecycle is fixed to Draft in this pilot.
- No API key field, token copy or browser credential storage is added.
- The package contract keeps approval, Live promotion, deletion and automatic publication false.
- Product, methodology, company-governance and brand findings retain separate authority.

## Checks required

- Production build and lint.
- Automated tests covering guidance, source/destination separation, known inventory, recommendation meaning, brand status and hand-off controls.
- Secret-pattern and employer-specific-reference scan.
- Full-diff review for UK English, status and unintended authority.
- Private deployment only.

## Recommendation

Continue the existing draft proposal with the guided journey and brand pilot, then validate it privately from a reset workspace.

Do not approve generated company policy, the brand system, direct Confluence integration, Live publication, external release or customer use through this decision.

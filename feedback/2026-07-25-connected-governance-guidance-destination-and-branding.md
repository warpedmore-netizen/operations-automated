---
id: OA-FEEDBACK-018
title: Connected Governance Guidance, Destination and Branding
status: recorded
date: 2026-07-25
source: founder private product validation
owner: Operations Automated Product Authority
confidentiality: non-confidential project feedback
disposition: material product proposal
---

# Connected Governance guidance, destination and branding

## Reported experience

During first use, Jamie could save the organisation and authority profile but the interface did not make the outcome or next action sufficiently visible.

The reported friction was:

- save confirmation existed only as a small persistent indicator and was easy to miss;
- saving did not visibly progress the journey;
- **Authority** was specialist language without a plain explanation of what the user was deciding;
- fields did not explain their meaning or the expected level of detail;
- the interface offered a recommendation before clearly establishing the knowledge source, the document inventory or the intended publication destination;
- accepting a recommendation did not explain what would be created, where a draft could be read or what the acceptance authorised;
- **Sources**, **Inventory**, **Destination** and the generated governance package were not presented as distinct concepts;
- the existing private Workbench Confluence connection was not reflected in the route;
- the user should not have to enter another API key into the hosted application; and
- the application should adopt the emerging Operations Automated brand so the products feel professionally connected.

## Operational insight

A governance service must provide orientation and useful output throughout the journey. Hidden state, unexplained terminology and ambiguous transitions weaken human control even when the underlying technical action is safe.

Source evidence and publication destination are different governance objects:

- a **source** establishes what the assessment is permitted to read;
- an **inventory** records what was found or entered;
- a **recommendation** explains what the evidence suggests;
- a **draft package** is the actual proposed output; and
- a **destination** records where an authorised publication may later occur.

## Strongest contextual interpretation

Jamie is not asking the product to remove governance checks or publish automatically. The request is to remove unnecessary touchpoints, explain the decisions that remain, reuse the protected connection already established and make the result visible before asking for further authority.

The branding request is a request for coherent professional expression. It is not approval of the separate draft brand system or permission to make an external claim.

## Evidence and limits

### Recorded evidence

- Jamie described the exact first-use sequence and the point at which the next step became unclear.
- The existing interface saved state but showed confirmation primarily in the lower-left workspace indicator.
- The earlier Sources page presented provider capability before a concrete source and destination plan.
- The generated documents and credential-free hand-off already existed but were not explained as the expected user outcome early enough.
- The separate draft brand system provides a founder-supplied OA mark, colour tokens, voice rules and application guidance.

### Jamie's judgement

- The journey must visibly move forward.
- Fields need explanations or information tooltips.
- The product should distinguish input, inventory, recommendation, output and destination.
- The existing private Workbench connection should remain the credential boundary.
- Recommendations need to show what is being created and where it will go.
- Operations Automated products should adopt coherent professional branding.

### AI inference

- A six-step guided route with inline confirmation and explicit continue actions is the smallest coherent response.
- The Operations Automated dogfooding profile should automatically add the known retained inventory rather than depend on the preset button having been used.
- The hosted product can record source scope and Draft destination without receiving the Workbench credential.
- The draft brand can be piloted in this already-proposed application without representing the brand as approved.

### Limitation

The hosted site cannot safely call a Workbench running on `localhost`, and the Workbench deliberately blocks cross-site requests. A direct import or broker is a separate connection and security design decision. This proposal exposes the boundary instead of presenting an inactive route as complete.

## Challenge tests

### Reverse test

Automatically moving to the next page immediately after save could also hide what happened. The proposal therefore shows an obvious inline confirmation and a labelled **Continue** action rather than forcing navigation.

### Authority test

Recording a role name or Draft destination must not create delegated authority. The interface explicitly states that saving, selecting or generating does not approve policy, publish to Confluence or promote content to Live.

### Security test

Reusing the existing connection must not mean copying its token into the hosted product. The proposed route records scope and destination while the credential remains protected in the private Workbench.

### Transfer test

Operations Automated can use a known repository inventory. Another organisation may need a connected-source inventory or manual entry. The interface preserves all three routes rather than making the dogfooding shortcut universal.

### Brand-status test

A coherent brand pilot can improve usability and provide review evidence, but it must remain visibly linked to the draft brand status. Product adoption alone does not approve the brand system.

## Proposed response

- Add a visible six-step journey and completion state.
- Explain every organisation, authority, source and destination field with accessible help.
- Put save confirmation and the next action beside the action that caused it.
- Explain authority in plain language and retain role-based defaults.
- Separate knowledge source from Confluence Draft destination.
- Automatically add the known Operations Automated inventory from retained project context.
- Explain recommendation evidence, proposed outputs, owner, destination and acceptance consequence.
- Make substantive proposed documents the visible output.
- Keep the Workbench hand-off credential-free and disclose that direct import is not active.
- Pilot the draft OA mark, palette, typography hierarchy, voice and endorsed product relationship.

## Decision state

This feedback justifies a material product proposal. It does not change approved methodology meaning, approve the draft brand, connect another service, approve any generated company policy, or authorise Live or external publication.

---
id: OA-FEEDBACK-2026-07-25-006
title: Make the Workbench a mobile knowledge-development and approval control
status: proposed
owner: Jamie Peppard
date: 2026-07-25
feedback_type: product-change-candidate
affected_workspace: Operations Automated Workbench
submitting_user: Jamie Peppard
---

# Make the Workbench a mobile knowledge-development and approval control

## Source and boundary

- **Source:** Direct founder feedback from Jamie Peppard while reviewing the private local Workbench.
- **Conversation and message reference:** Current Codex task, 2026-07-25, request beginning “I'm currently not really using this workbench”.
- **Permission:** Jamie asked Codex to proceed with analysis, local usability correction and controlled preparation.
- **Information boundary:** Non-confidential Operations Automated product and methodology material.
- **Authority at intake:** Preparation is authorised. No remote-access connection, software installation, new Confluence write behaviour, merge or publication is inferred.

## Original wording

> I'm currently not really using this workbench because I'm developing a lot of the tools. The other reason I'm not using this is because I can't access it on a medium which will just let me sit wherever I want and challenge myself to a question or defend. How can I link this with my phone in the sense of I'm able to securely connect to the workbench, the AI system, the system behind it, and talk and do these challenges? Because that's what I'm really using this for. I'm not really using it for the building because it feels very hard to approve, understand what's going on there.
>
> When I go to the workbench, just saying the image doesn't show, whatever image, and it's very hard to read. I think this might be the branding update that I was talking to you about. When you go over highlight, you can barely see the actual names because the background's kind of light and then the writing turns white.
>
> I would like to go through the whole lifecycle of approving them. The system should be able to push into Confluence draft versions of the updates. From there, I should be able to review them and check them, and compare them with the live to see the differences. Once I press approve, then you can update the documentation and the GitHub repository with the actions of improvements.
>
> I'm using Codex to develop products, but I'm using the AI workbench to increase your intelligence, your repositories and our methodology. That's what I want this to control: the knowledge. I'm using Codex to build this, to hold, challenge, develop, encourage and connect the knowledge.

## Observed evidence

- The running Workbench returned HTTP 500 for its brand token sheet and logo.
- The missing token sheet left the rail background transparent while rail text remained pale or white.
- Both visible Workbench logo images had a natural width and height of zero.
- At a 390 × 844 phone viewport, the header actions collided with the conversation title, the navigation labels disappeared, the content became horizontally awkward and the main challenge journey was not practically usable.
- Tailscale is not installed or available on the current Windows path, so a private phone route cannot presently be activated.
- The approved Workbench already has governed Confluence evidence and publication controls, but it does not create an unmerged proposal as a readable Confluence review draft.
- A separate proposed Methodology Lab branch and draft PR #18 has demonstrated AI-managed publication beneath Confluence Draft. It is not merged into the current Workbench build and must remain visibly proposed.

## Operational insight

The Workbench's primary founder job is not general product construction. It is the knowledge-control loop:

1. challenge or defend a methodology position;
2. retain the useful correction, evidence or uncertainty;
3. compare the current approved meaning with a proposed change;
4. make preparation and release decisions in readable language;
5. keep Git as the authoritative source; and
6. publish the approved reading copy to Confluence with a receipt.

Codex remains the product-building and repository-execution environment. The Workbench should make the knowledge and decisions usable without exposing unnecessary developer mechanics.

## Strongest contextual interpretation

Jamie is not asking for governance to be removed. He is asking for governance to become legible and available in the context where he will actually use it: spoken, mobile and knowledge-first.

“Press approve” should therefore mean a clearly named decision with visible consequences. It should not collapse proposal preparation, release approval, repository merge and Confluence publication into one ambiguous click.

## Challenge tests

### Security and availability test

Phone convenience can create a larger access boundary. A public tunnel or router port-forward would expose a local application that has no independent user account system. The safer founder pilot is a private tailnet route, with the server still listening only on localhost and the phone authenticated through the same private identity.

The computer and Workbench must still be running. This is acceptable for a bounded pilot but is not a reliable hosted product.

### Authority test

Putting proposed text into Confluence before merge could make a polished draft look approved or allow Confluence to become a competing source of truth. Any review copy must be labelled Proposed, linked to its branch and source commit, visibly compared with the approved baseline, and incapable of authorising itself.

### Sequence test

A single approval cannot safely mean all of:

- “prepare the change”;
- “accept this methodology meaning”;
- “merge it into Git”; and
- “publish it to Confluence”.

The Workbench can make the sequence feel like one readable journey while retaining separate preparation, release and publication decisions.

### Transfer test

A future team member may need access without founder authority. Mobile identity, view permissions and approval authority must therefore remain distinct. A person who can read a challenge should not automatically be able to merge or publish.

## What changed the AI assessment

The prior product framing gave too much prominence to conversations, connections and construction capability. Jamie's feedback changes the recommended product centre to the challenge-to-knowledge-release journey.

The live inspection also changes the usability assessment: the current Workbench is not merely visually imperfect. Its stale-server and responsive-layout failures prevent practical use.

## Remaining disagreement or uncertainty

- Tailscale is the recommended private founder route, but its account, device and access-control configuration has not been reviewed or approved.
- A Confluence review-draft route is useful. PR #18 records standing founder authority and a completed Draft-only pilot, but that capability is unmerged and still needs a controlled integration and release decision before it becomes part of the ordinary Workbench.
- PR #18 provides strong implementation evidence for a Draft-only route; this proposal should reuse and reconcile that work rather than create a competing publication mechanism.
- Independent phone first-use and non-authorised-access tests have not yet been run.
- A continuously available hosted product may later be more valuable than a computer-dependent private route.

## Disposition

**Product change candidate; prepare now, connect later.**

Correct the broken local reading experience and mobile layout now. Prepare a traceable proposal for:

1. a private Tailscale phone pilot;
2. a knowledge-first Workbench journey; and
3. a readable Confluence proposal-review and diff pilot.

Do not install Tailscale, expose the Workbench, broaden the existing PR #18 Draft authority, merge or promote content to Live until the relevant explicit decision is recorded.

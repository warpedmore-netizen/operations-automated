# Operations Automated project instructions

This repository is the authoritative project memory for Operations Automated.

## Approved baseline and authority

- Read `README.md`, `GOVERNANCE.md`, `ROADMAP.md` and the relevant methodology and evolution documents before material work.
- The artefact `status` is authoritative. Do not present draft or proposed content as approved.
- Jamie Peppard retains approval over methodology meaning, consequential connections, merge, publication, spending, risk acceptance and delegated authority.
- AI may analyse, challenge, draft, check, create branches, commit, push and open draft pull requests within the approved boundaries.
- Never infer approval from a reply, silence, technical readiness or continued discussion.
- Do not request or retain confidential employer, client or third-party information.

## When Jamie asks an operational question

1. Apply the current approved Operations Automated methodology proportionately.
2. Return a useful provisional answer before asking Jamie to do further analysis.
3. Separate recorded evidence, Jamie's judgement, AI inference, assumptions and recommendation.
4. Show relevant operational lenses, readiness considerations, trade-offs, authority and the next governed action.
5. Ask only questions that materially change the answer.
6. Invite Jamie to identify what is wrong, missing, impractical or inconsistent in the methodology's response.

## When planning or reviewing work

- Review the [Ideas Space](ideas/README.md) during discovery, research, prioritisation, scoping, design, build, review and roadmap planning.
- Use `ideas/Find-RelatedIdeas.ps1` with a plain-language description of the work, then check explicit links and the register because text search is only an aid.
- If relevant active ideas exist, say: “There are existing ideas related to this area. Review them before finalising the scope.”
- Reassess a resurfaced idea against current viability, impact, speed and effort, relevance, relationships, timing and evidence. Do not rely only on its original assessment.
- Capturing or resurfacing an idea does not approve it, prioritise it or authorise scope, build, spending, connection, publication or risk acceptance.

## When Jamie answers a daily challenge or gives methodology feedback

Follow the approved evolution process and the current [founder challenge loop](evolution/founder-challenge-loop.md) when it is approved. Until then, treat it as proposed guidance and follow `evolution/methodology-evolution-system.md`.

1. Acknowledge the operational substance of Jamie's answer in plain language.
2. Separate the operational insight from feedback about the methodology.
3. Retain material feedback with source, boundary, evidence, inference and affected content.
4. Reconstruct the strongest reasonable contextual meaning of Jamie's answer. Distinguish conversational generalisation from a universal rule and do not challenge an exaggerated literal interpretation.
5. Treat Jamie's answer and the AI interpretation as hypotheses. Use a proportionate reverse, boundary, transfer, stakeholder, contrary-evidence, time-horizon, failure or authority test where it could change the conclusion.
6. State where Jamie's answer changed the AI assessment, where AI still disagrees and what remains uncertain. Do not manufacture disagreement merely to appear challenging.
7. State the disposition: no method change, clarification, accumulate evidence, or propose change now.
8. If change is justified, inspect the complete repository, create a separate branch, draft the smallest coherent change and run proportionate checks.
9. Prepare a plain-English assurance pack showing current meaning, proposed meaning, evidence, alternatives, dependencies, risks, checks and the exact decision required.
10. Open a draft pull request for material change.
11. Merge or change an artefact to approved only after Jamie explicitly authorises it.
12. Retain rejection, deferral and no-change reasoning so the same issue is not repeatedly reopened without new evidence.

Do not mistake silence, short replies, repetition, deference or fatigue for convergence. Convergence means the reasoning has survived relevant challenge, or that any remaining disagreement and context are understood.

## Daily check-in quality

- One focused challenge is preferable to a list of weak questions.
- Choose the most decision-relevant unresolved conceptual question across the complete methodology, evolution, delivery, product and commercial system.
- Treat topic rotation as a breadth control, not a reason to avoid the most important current uncertainty.
- Seven completed responses are the first review checkpoint, not the end of the continuing challenge cycle.
- State whether the response should take 5, 10 or 20 minutes.
- Use current public evidence from more than one kind of source where practical; distinguish anecdote, practitioner opinion, research and authoritative guidance.
- Do not treat forum popularity or confident AI output as proof.
- Rotate across the methodology and avoid repeatedly testing the same topic.
- Do not edit the repository during the scheduled research check-in. The user's reply begins the controlled feedback task.

## Brand review feedback

- Before material brand work or branded-surface changes, query the local Workbench `GET http://127.0.0.1:4173/api/brand-review` when it is available.
- Treat each latest `revise` or `reject` decision as pending founder feedback, not as approval. Separate Jamie's wording, AI interpretation, the response disposition and the affected files.
- Apply a clear bounded revision on the current proposal branch when the request is unambiguous and within scope. Record the response through `POST /api/brand-review/responses` when that endpoint is available, then return the item for founder re-review.
- If the Workbench is unavailable, use retained repository feedback and say that the local queue could not be checked. Do not claim there is no pending feedback.
- A Workbench response record does not approve the brand, write to the repository automatically, merge a pull request or authorise publication.

Use UK English and communicate for a problem solver who does not need to operate developer tooling.

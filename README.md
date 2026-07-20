# Operations Automated

Operations Automated is developing a living, human-led methodology for understanding, governing and improving operations, from basic operational clarity and process improvement through safe automation, AI readiness and bounded agentic operation.

The methodology is intended for individuals, teams and organisations. It considers operations as connected systems of purpose, people, demand, work, decisions, dependencies, risk, information, technology and learning.

This repository is the controlled source for the methodology, its principles, governance, evolution system, working tools and future delivery model.

> **Approved baseline:** v0.4 was approved by Jamie Peppard on 2026-07-20 for internal validation. It is not approved for external publication.
>
> **Current proposal:** v0.5 establishes a daily founder challenge, traceable feedback and plain-English methodology assurance loop. Its repository integration remains proposed until Jamie Peppard decides it.

## How the system fits together

| Component | Purpose | Status |
|---|---|---|
| [Operations Automated methodology](methodology/operations-automated-overview.md) | The complete system for understanding, managing and improving operations | Approved for internal validation |
| [Operational lenses](methodology/operational-lenses.md) | Connected views across value, people, work, flow, authority, risk, information, technology and learning | Approved for internal validation |
| [Readiness path](methodology/readiness-path.md) | Evidence-led progression from operational basics to automation, AI and agents | Approved for internal validation |
| [OPERATE](methodology/operate-overview.md) | The improvement and implementation cycle within the wider methodology | Approved for internal validation |
| [Output contract](methodology/output-contract.md) | The useful analysis, decisions and artefacts a user must receive | Approved for internal validation |
| [Evolution system](evolution/methodology-evolution-system.md) | The controlled loop that turns evidence and feedback into methodology releases | Approved for internal validation |
| [Delivery system](product/delivery-system.md) | Facilitated delivery now and a future evidence-led product | Approved for internal validation |

OPERATE means Observe, Prioritise, Examine, Redesign, Automate, Test and Evolve. It is an important cycle inside Operations Automated, but it is not the entire methodology.

## Working principles

- **Human-led automation:** Technology may execute repeatable work; people provide purpose, context, judgement, empathy, authority and accountability.
- **User-defined value:** The user defines what matters before the methodology decides what better means.
- **Learning through failure:** Bounded, observable and recoverable failure creates retained learning.
- **TIGIPI:** Think Idiot, Get Idiot, Prepare for Idiot is a memorable human-factors heuristic, not a judgement about people.
- **Proportionate readiness:** Automation, AI or agentic operation is adopted only where evidence shows that it creates justified value within the applicable boundaries.

## Current route

The internal-validation route is:

1. Use the [provisional Operations Automated self-assessment](pilots/operations-automated-self-assessment-001.md), created using the [operational assessment](templates/operational-assessment.md), to choose the first detailed guidance.
2. Run facilitated, non-confidential cases using AI to return analysis and governed next actions.
3. Record method problems with the [methodology feedback template](templates/methodology-feedback.md).
4. Process useful changes through the controlled evolution system.

See the [roadmap](ROADMAP.md) for the workstreams, milestones and human decision points.

## Daily methodology challenge

An active Codex automation sends Jamie one methodology challenge each day at 08:00 UK time. It reads the approved repository, reviews current public operational discussion, applies Operations Automated provisionally and gives Jamie a concrete response to critique in 5, 10 or 20 minutes.

The automation has no planned end date. Seven completed responses are the first quality and synthesis review, not the end of the challenge cycle. It continues until Jamie explicitly pauses, changes or stops it.

The scheduled check-in is read-only. Jamie's answer enters the controlled [founder challenge and feedback loop](evolution/founder-challenge-loop.md); it does not approve or automatically edit the methodology.

During the local pilot, Jamie's computer must be powered on, the ChatGPT desktop app must be running and this repository must be available at the scheduled time. Results appear in **Scheduled** and can be answered later. Jamie can request a manual check-in whenever a local run is missed.

Jamie may also start the same loop at any time by asking an operational question or explaining what the methodology has missed.

For a direct ad-hoc check-in, Jamie can simply say: **“Give me another methodology challenge.”** AI should review the retained evidence, avoid repeating a completed test and continue the same controlled feedback loop.

Scheduled and ad-hoc questions may challenge the whole Operations Automated system: its purpose, principles, methodology, work types, readiness, governance, evolution, delivery, product and commercial hypotheses. AI should choose the most decision-relevant unresolved conceptual question, not rotate topics merely for variety.

Answers are not accepted uncritically. AI may reverse an assumption, introduce contrary evidence, transfer the reasoning to another setting or test failure and authority. Jamie may challenge the AI's interpretation in return. Agreement is retained only when the reasoning survives proportionate testing; fatigue or silence is not agreement.

The first five responses are amalgamated in the proposed [founder pilot methodology synthesis](proposals/founder-pilot-initial-synthesis-v0.5.md). The seven-response review and Jamie's approval decision remain outstanding.

## Application experiment

The [OPERATE Workspace MVP 0.1](app/README.md) remains approved only for private testing and is not deployed or approved for external use.

Private testing demonstrated useful record, approval and export mechanics but also showed that the application mainly reorganises user input rather than returning genuine AI analysis. The v0.4 decision parks it as a retained learning experiment while the methodology and output model are validated. Its code is not deleted, and the unapproved interface experiment remains preserved on its separate branch.

## Repository control

- `main` is the current controlled internal project memory and may contain artefacts at different governance states.
- The `status` recorded on each artefact is the source of truth for whether it is an idea, draft, proposed, approved, published, superseded or rejected.
- Material changes are proposed through a branch and draft pull request.
- Jamie Peppard retains final approval during the founder-controlled phase.
- AI may prepare, test and publish proposals for review but may not infer approval or merge without explicit authorisation.
- Confidential employer, client or third-party information, data and proprietary artefacts do not belong in this repository.

See [CHARTER.md](CHARTER.md), [GOVERNANCE.md](GOVERNANCE.md) and [CHANGELOG.md](CHANGELOG.md).

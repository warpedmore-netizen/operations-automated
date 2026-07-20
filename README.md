# Operations Automated

Operations Automated is developing a living, human-led methodology for understanding, governing and improving operations, from basic operational clarity and process improvement through safe automation, AI readiness and bounded agentic operation.

The methodology is intended for individuals, teams and organisations. It considers operations as connected systems of purpose, people, demand, work, decisions, dependencies, risk, information, technology and learning.

This repository is the controlled source for the methodology, its principles, governance, evolution system, working tools and future delivery model.

> **Approved baseline:** Foundation v0.3 is approved for internal piloting. It is not approved for external publication.
>
> **Current proposal:** v0.4 proposes the complete methodology architecture, an AI-managed and human-controlled evolution system, and a reset of the product direction. It remains proposed until Jamie Peppard explicitly approves it.

## How the proposed system fits together

| Component | Purpose | Status |
|---|---|---|
| [Operations Automated methodology](methodology/operations-automated-overview.md) | The complete system for understanding, managing and improving operations | Proposed |
| [Operational lenses](methodology/operational-lenses.md) | Connected views across value, people, work, flow, authority, risk, information, technology and learning | Proposed |
| [Readiness path](methodology/readiness-path.md) | Evidence-led progression from operational basics to automation, AI and agents | Proposed |
| [OPERATE](methodology/operate-overview.md) | The improvement and implementation cycle within the wider methodology | Proposed revision; approved baseline retained in Git history |
| [Output contract](methodology/output-contract.md) | The useful analysis, decisions and artefacts a user must receive | Proposed |
| [Evolution system](evolution/methodology-evolution-system.md) | The controlled loop that turns evidence and feedback into methodology releases | Proposed |
| [Delivery system](product/delivery-system.md) | Facilitated delivery now and a future evidence-led product | Proposed |

OPERATE means Observe, Prioritise, Examine, Redesign, Automate, Test and Evolve. It is an important cycle inside Operations Automated, but it is not the entire methodology.

## Working principles

- **Human-led automation:** Technology may execute repeatable work; people provide purpose, context, judgement, empathy, authority and accountability.
- **User-defined value:** The user defines what matters before the methodology decides what better means.
- **Learning through failure:** Bounded, observable and recoverable failure creates retained learning.
- **TIGIPI:** Think Idiot, Get Idiot, Prepare for Idiot is a memorable human-factors heuristic, not a judgement about people.
- **Proportionate readiness:** Automation, AI or agentic operation is adopted only where evidence shows that it creates justified value within the applicable boundaries.

## Current route

Until v0.4 is decided, the approved v0.3 baseline remains authoritative. The proposed validation route is:

1. Review the [v0.4 change proposal](proposals/methodology-architecture-v0.4.md).
2. Apply the proposed method to Operations Automated itself using the [operational assessment](templates/operational-assessment.md).
3. Run facilitated, non-confidential cases using AI to return analysis and governed next actions.
4. Record method problems with the [methodology feedback template](templates/methodology-feedback.md).
5. Process useful changes through the controlled evolution system.

See the [proposed roadmap](ROADMAP.md) for the workstreams, milestones and human decision points.

## Application experiment

The [OPERATE Workspace MVP 0.1](app/README.md) remains approved only for private testing and is not deployed or approved for external use.

Private testing demonstrated useful record, approval and export mechanics but also showed that the application mainly reorganises user input rather than returning genuine AI analysis. The v0.4 proposal recommends parking it as a retained learning experiment while the methodology and output model are validated. Its code is not deleted, and the unapproved interface experiment remains preserved on its separate branch.

## Repository control

- `main` is the current controlled internal project memory and may contain artefacts at different governance states.
- The `status` recorded on each artefact is the source of truth for whether it is an idea, draft, proposed, approved, published, superseded or rejected.
- Material changes are proposed through a branch and draft pull request.
- Jamie Peppard retains final approval during the founder-controlled phase.
- AI may prepare, test and publish proposals for review but may not infer approval or merge without explicit authorisation.
- Confidential employer, client or third-party information, data and proprietary artefacts do not belong in this repository.

See [CHARTER.md](CHARTER.md), [GOVERNANCE.md](GOVERNANCE.md) and [CHANGELOG.md](CHANGELOG.md).

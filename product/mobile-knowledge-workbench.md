---
id: OA-PRODUCT-010
title: Mobile Knowledge Workbench and Governed Review Journey
status: proposed
version: 0.1
owner: Jamie Peppard
date: 2026-07-25
---

# Mobile knowledge workbench and governed review journey

## Problem and learning identified

The Workbench is most valuable to Jamie as an environment for spoken challenge, defence, retained learning and readable methodology decisions. Its current local-computer boundary and developer-shaped review surfaces prevent that use.

The product should control knowledge development while Codex remains the product-building environment.

## Relevant approved repository sources

- [Human-AI Collaboration Method](../methodology/human-ai-collaboration.md)
- [Activation and First Use](../methodology/activation-and-first-use.md)
- [Methodology Output Contract](../methodology/output-contract.md)
- [Methodology Evolution System](../evolution/methodology-evolution-system.md)
- [Founder Challenge and Feedback Loop](../evolution/founder-challenge-loop.md)
- [Private OPERATE Workspace MVP](MVP.md)
- [Governed Confluence Documentation Publication](confluence-governed-publication.md)
- [Confluence Human Publication Model](confluence-human-publication-model.md)

The artefact status remains authoritative. This proposal does not change approved methodology meaning.

## Affected files and components

- Workbench navigation, responsive layout, brand fallbacks and installable web manifest
- launcher and stale-server version verification
- Challenge Studio and in-product first-use guide
- Decision Inbox and readable proposal comparison
- Confluence publication planning and future review-draft handling
- remote-access setup, identity, least privilege, removal and first-use validation
- product documentation, feedback record, decision record and changelog

## Current wording and behaviour

The current approved product boundary describes a private local application with no accounts or hosted deployment. Governed Confluence publication reads from current `main`, previews create/update/unchanged/conflict outcomes and requires Jamie's plan-specific confirmation.

The running interface can be reached only on `127.0.0.1`. It has no approved phone-access route. An unmerged methodology proposal cannot be published as a Confluence review draft.

The separate proposed Methodology Lab pilot in draft PR #18 has demonstrated a bounded Draft-only publication route and created a ten-page private Confluence review set without altering the existing managed pages. That route is unmerged and is not part of the current approved Workbench behaviour.

## Proposed wording and behaviour

### Product purpose

> The Operations Automated Workbench is the private knowledge-control surface for challenging, defending, connecting, reviewing and releasing the methodology. Codex builds and implements products; the Workbench makes the knowledge lifecycle understandable and human-controlled.

### Founder phone pilot

1. Keep the Node server bound to `127.0.0.1:4173`.
2. Install Tailscale on the Windows computer and Jamie's phone only after explicit connection approval.
3. Use Tailscale Serve to provide a private HTTPS tailnet address for the local Workbench.
4. Restrict access to Jamie's identity and authorised devices through the tailnet policy.
5. Retain the existing provider, Confluence, feedback and decision boundaries.
6. Add the Workbench to the phone home screen and test one end-to-end spoken challenge.
7. Record how to disable Serve, remove the phone and revoke the connection.

Tailscale Funnel, a public tunnel and router port-forwarding are outside the proposal.

### Knowledge-first journey

The primary path should be:

> Challenge or defend → retain feedback → review current versus proposed meaning → prepare the bounded change → review the pull request → approve release → merge Git → publish the reconciled Confluence reading copy → retain the receipt.

Technical sources, hashes and controls remain available but visually secondary.

### Readable Confluence review draft

The ordinary Workbench journey should reconcile the existing PR #18 Draft-publication evidence into a clearly labelled Confluence **Review Draft** experience for an unmerged proposal. It must:

- show the approved current wording beside the proposed wording;
- identify the proposal branch, commit, repository status and expiry or review trigger;
- distinguish review-draft visibility from approval and release;
- require a fresh plan and exact founder confirmation before the Confluence write;
- never become approved retrieval context;
- never update the Live reading copy;
- link to the exact GitHub pull request and readable Workbench decision brief; and
- remain auditable if rejected, deferred or superseded.

PR #18 records Jamie's standing authority for AI to publish committed proposed material beneath the existing controlled private Draft parent without another confirmation. This proposal does not broaden that authority. Merge, conflict decisions, methodology meaning, Live promotion, new spaces, permissions, audiences and automatic interaction retrieval remain separately controlled.

## Rationale

- Mobile and voice access place the challenge at the point where Jamie will use it.
- A knowledge-first journey matches the Workbench's demonstrated founder value.
- HTTPS is required for a dependable browser microphone experience away from localhost.
- Keeping the server on localhost and using a private identity network is safer than making the application public.
- A readable review draft can reduce GitHub burden without changing Git authority.
- Separate decisions preserve reversibility and prevent a convenient click from silently expanding authority.

## Evidence

- Jamie's direct founder feedback on intended use and current friction.
- Visual inspection at desktop and 390 × 844 phone sizes.
- HTTP failures for the live brand stylesheet and logo.
- Existing approved activation, output, challenge, evolution and publication controls.
- Official Tailscale documentation for tailnet-only Serve, HTTPS and access-policy enforcement.
- Official Atlassian documentation for page versions, unpublished changes and version comparison.

Evidence is strong for founder usability and current technical failure. It remains weak for wider-user demand and independent mobile validation.

## Credible alternatives

1. **Local Wi-Fi access only:** lower setup, but not available wherever Jamie is and ordinary HTTP may block or weaken microphone use.
2. **Cloudflare Access or another identity-aware public edge:** browser-only access without a phone VPN, but it adds domain, identity, hosting and external exposure decisions.
3. **A hosted Workbench with application authentication:** best availability and multi-user potential, but materially increases security, privacy, data, cost, operations and incident obligations.
4. **Use Codex mobile or ChatGPT only:** convenient, but does not provide the Workbench's retained feedback, decision, Git and Confluence control surfaces.
5. **GitHub-only review:** retains excellent technical trace but does not meet the plain-language and knowledge-first requirement.
6. **No change:** keeps the smallest attack surface, but leaves the founder unable or unlikely to use the intended challenge loop.

## Risks and unintended consequences

- Lost or compromised phone access
- tailnet permissions broader than intended
- computer sleep, restart or stale Workbench process causing false availability
- provider or Confluence credentials remaining accessible through an authorised browser session
- a polished Confluence review draft being mistaken for approved guidance
- Git and Confluence diverging
- review fatigue from too many surfaces or decisions
- hidden model and transcription cost from easier mobile use
- dependency on an external private-network service
- a founder-specific interface overfitting later users

## Validation requirements

### Immediate interface checks

- brand tokens failing to load cannot remove the dark rail or make text unreadable;
- no broken primary logo appears;
- navigation labels remain visible and contrast-safe on hover, active and focus states;
- 390 × 844 and 430 × 932 layouts have no page-level horizontal scrolling;
- touch targets are at least 44 pixels for primary actions;
- challenge, record, stop, transcript review, send, processing and response states remain visible.

### Phone connection pilot

- Jamie explicitly approves the connection boundary;
- Tailscale is installed from the official source on Windows and the phone;
- Workbench remains bound to localhost;
- the phone reaches only the private HTTPS Serve address;
- a non-authorised identity or device is denied;
- one spoken challenge completes end to end;
- the computer-restart and stale-server recovery route works;
- Serve can be disabled and the phone removed without repository changes.

### Review-draft pilot

- current and proposed meaning are readable without developer tooling;
- repository status and source commit are visible;
- preparation approval remains separate from release approval;
- a Review Draft never enters approved retrieval;
- rejection and deferral remain auditable;
- Live Confluence content changes only after the later approved Git release and plan-specific publication.

## Expected cost and model route

- **Reasoning:** existing configured Workbench reasoning route; no change proposed.
- **Voice:** existing transcription route; mobile use may increase volume but not the per-request model design.
- **Tailscale:** no model cost. Account or plan cost must be checked before connection approval; no spending is authorised.
- **Confluence:** uses the existing private connection and the bounded standing Draft authority recorded in PR #18. Integration and merge remain separate; Live publication remains founder-confirmed.
- **Existing implementation evidence:** reuse and reconcile PR #18 rather than duplicate its Draft-publication code.
- **Development:** local implementation and testing through Codex on a separate branch and draft pull request.

## Version impact

- Proposed Workbench build: `1.1.0-mobile-knowledge-draft`
- Approved Operations Automated methodology baseline: unchanged at v0.6
- Approved Confluence publication behaviour: unchanged until a later review-draft decision
- External publication and customer use: unchanged and unapproved

## Exact decisions required

1. **Private phone connection:** approve or reject a Jamie-only Tailscale Serve pilot.
2. **Confluence review draft:** decide whether the existing PR #18 Draft-only capability should be integrated into the ordinary Workbench knowledge journey.
3. **Release:** after review and tests, separately approve or reject merge of the product change.

No one decision authorises all three.

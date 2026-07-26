---
id: OA-PRODUCT-010
title: Mobile Knowledge Workbench and Governed Review Journey
status: proposed
version: 0.2
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

The current approved product boundary describes a private local application with no accounts or hosted deployment. Governed Confluence publication reads from controlled committed source and previews create/update/unchanged/conflict outcomes. Live publication requires Jamie's plan-specific confirmation. The bounded private Draft route uses the standing authority recorded in the repository.

The running interface remains bound to `127.0.0.1`. A tailnet-only Tailscale Serve route has since been observed working between Jamie's computer and Samsung phone, with Funnel disabled. That is operational evidence, not an inferred governance approval. A committed methodology proposal may be published only beneath the controlled private Confluence Draft parent.

The separate proposed Methodology Lab pilot first demonstrated the bounded Draft-only publication route in draft PR #18 and created a ten-page private Confluence review set without altering the existing lifecycle mirror. Founder review later found that reader too light, so the same governed route is being expanded to a 20-chapter end-to-end v0.8 Draft. The capability remains a proposed private-review behaviour and does not approve the published methodology.

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

### Recoverable mobile voice

The first real phone pilot reached the recording and Stop states but failed during transcription. The previous implementation did not retain a failed audio blob in the browser or audit the failure stage, so the exact cause cannot be reconstructed.

The proposed recovery increment should:

1. display the selected microphone and a live sound-level signal while recording;
2. select a supported WebM, MP4/M4A or Ogg recording container where the browser exposes one;
3. emit regular recording chunks rather than depending only on a final mobile-browser chunk;
4. validate the received format by MIME type or file signature;
5. keep failed audio temporarily in the originating tab so transcription can be retried without repeating the recording;
6. distinguish missing audio, no detected speech, unsupported format, provider rejection, timeout and connection interruption; and
7. audit only timing, size, format, sound-signal and failure metadata, never the recording or transcript content.

### Knowledge-first journey

The primary path should be:

> Challenge or defend → retain feedback → review current versus proposed meaning → prepare the bounded change → review the pull request → approve release → merge Git → publish the reconciled Confluence reading copy → retain the receipt.

Technical sources, hashes and controls remain available but visually secondary.

### Readable Confluence review draft

The ordinary Workbench journey now reconciles the PR #18 Draft-publication evidence into a clearly labelled Confluence **Review Draft** experience for a committed proposal. It must:

- show the approved current wording beside the proposed wording;
- identify the proposal branch, commit, repository status and expiry or review trigger;
- distinguish review-draft visibility from approval and release;
- require a fresh, conflict-free plan and the applicable recorded authority before the Confluence write;
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
- The first real Samsung-phone attempt reached recording and Stop but did not create a successful transcription record.
- Tailscale status confirmed the computer and phone online in the same tailnet, Serve marked tailnet-only and Funnel disabled.
- The prior implementation retained no failed-attempt metadata and discarded the browser's only audio reference after the request failed.
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
- the selected microphone and live sound-level signal are visible before Stop;
- a forced transcription failure can be retried from the retained in-tab recording;
- Android WebM, mobile MP4/M4A, Ogg, missing MIME, empty audio and unsupported audio paths return the intended result;
- no recording or transcript content enters the audit record;
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
- **Confluence:** uses the existing private connection and the bounded standing Draft authority first recorded in PR #18. Draft publication remains distinct from methodology approval; Live publication remains founder-confirmed.
- **Existing implementation evidence:** reuse and reconcile PR #18 rather than duplicate its Draft-publication code.
- **Development:** local implementation and testing through Codex on a separate branch and draft pull request.

## Version impact

- End-to-end methodology Draft build: `1.5.1-end-to-end-methodology-draft`
- Approved Operations Automated methodology baseline: unchanged at v0.7
- Private Draft publication behaviour: integrated under the recorded standing authority
- External publication and customer use: unchanged and unapproved

## Exact decisions required

1. **Private phone connection:** approve or reject a Jamie-only Tailscale Serve pilot.
2. **Methodology meaning:** approve, revise, defer or reject the consolidated v0.8 proposal after review.
3. **Live or external release:** separately approve or reject any promotion beyond the controlled private Draft route.

No one decision authorises all three.

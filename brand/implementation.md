---
id: OA-BRAND-005
title: Brand Implementation Guide
status: draft
version: 0.1
owner: Jamie Peppard
date: 2026-07-25
---

# Brand implementation guide

## Purpose

Use one controlled source for identity decisions and adapt the expression to the job. A website, application and controlled document should feel related without pretending they are the same medium.

## Source hierarchy

1. Repository artefact status remains authoritative.
2. This brand system governs expression only after Jamie approves it for the stated scope.
3. Machine-readable tokens are the implementation source for colour, type, spacing, radius, shadow and motion.
4. Templates demonstrate use; they do not create methodology, product or publication approval.
5. Local product needs may extend the system but must not silently redefine a core token or logo.

## Quick start

### Website or browser application

1. Include [`tokens/brand.css`](tokens/brand.css).
2. Use the semantic tokens such as `--oa-surface`, `--oa-text` and `--oa-action`.
3. Compose the logo from the supplied OA loop derivative and accessible live text.
4. Use the public-page or application starter as the nearest reference.
5. Keep the draft or approval boundary visible where the content status matters.
6. Test keyboard focus, reflow, zoom, reduced motion and the actual first action.

### Native or cross-platform application

1. Import or translate [`tokens/brand.ts`](tokens/brand.ts) into the platform theme.
2. Preserve semantic roles rather than copying a hex value into many components.
3. Map system states to colour plus explicit text and iconography.
4. Keep irreversible, authority-bearing and ordinary actions visually distinct.
5. Use the master mark; do not create a platform-specific product logo by default.

### Documentation

1. Start with [`templates/documentation/document-template.md`](templates/documentation/document-template.md).
2. Preserve visible title, status, version, owner and scope.
3. Use the print stylesheet when generating HTML or PDF.
4. Keep the conclusion and next governed action before technical detail.
5. Use diagrams only when a relationship is materially clearer than prose.

## Surface profiles

### Public website

- Strong geometric hierarchy and controlled negative space.
- Obsidian or Midnight hero area, with Paper sections where sustained reading begins.
- One primary action per section.
- Plain explanation before methodology terms.
- Evidence and boundaries near claims.
- No external publication until separately authorised.

### Application

- Higher information density and stronger use of neutral canvas.
- Sans-serif typography for all controls and working content.
- Persistent orientation, status and recovery.
- Blue for ordinary primary action; amber for human decision points; red only for failure, block or destructive consequence.
- No dashboard full of scores without reasons and next actions.

### Long-form guidance

- Paper background, Ink text and restrained geometric display headings.
- Narrow reading measure and strong hierarchy.
- Small metadata layer using sans-serif or monospace.
- Tables use subtle rules and repeat headers across pages.
- A cover may use Midnight; internal pages remain predominantly light.

### Presentation

- One conclusion per slide.
- Use diagrams and large evidence statements instead of document-sized text.
- Keep the logo small and consistent.
- Use amber only for the decision or tension requiring attention.
- Show source and status in a quiet footer.

### Spreadsheet or analytical aid

- Use navy for title and section structure.
- Use blue for editable or active areas only when paired with labels.
- Keep input, formula, evidence gap and result visibly different.
- Never encode a gate, status or required action by fill colour alone.
- Include source, version, limits and decision owner.

## Logo composition in code

Use the image asset plus live, selectable text:

```html
<a class="oa-logo" href="/" aria-label="Operations Automated home">
  <img src="/brand/assets/logo/generated/mark-colour-transparent-1024.png" alt="">
  <span class="oa-wordmark"><small>Operations</small><strong>Automated</strong></span>
</a>
```

The empty image alternative text avoids repeating the name already present in the link.

## Theming

The CSS tokens expose:

- a default light theme;
- `[data-oa-theme="dark"]` for dark panels or complete surfaces; and
- semantic variables for text, surface, action, border, focus and states.

Do not select raw palette values when a semantic token exists. This allows accessible contrast or a later approved brand adjustment to be made centrally.

## Product extension rules

A product may add:

- one supporting accent colour;
- product-specific diagrams or illustrations;
- a denser spacing profile; and
- specialised data-visualisation tokens.

A product may not, without a brand decision:

- recolour or redraw the master mark;
- replace the primary typefaces;
- change the meaning of the core status colours;
- present a separate product as the whole Operations Automated methodology; or
- remove status, evidence, authority or recovery information to create a cleaner appearance.

## File and version discipline

- Keep source SVGs; generate PNGs from them.
- Name exports with asset, variant and size.
- Update `manifest.json` when an asset or token changes.
- Increase the brand version when a change could affect a consumer.
- Record breaking token changes and provide a migration note.
- Treat screenshots as examples, not sources.
- Keep logos and fonts free of third-party material unless their use and licence are recorded.
- Replace raster derivatives with an inferred vector master only after founder comparison and approval.

## Adoption sequence

1. Confirm the supplied OA loop mark, descriptor, strapline, palette and geometric type direction.
2. Approve, revise or reject v0.1 for internal use.
3. Pilot the system on one existing application, one controlled document and one public-page prototype.
4. Observe comprehension, consistency, accessibility and time to first use.
5. Amend the system through a governed proposal.
6. Decide external publication, trade-mark review and full product migration separately.

## Completion test

For each branded artefact, verify:

- the intended audience can identify Operations Automated;
- the purpose and first useful action are clear;
- the logo and name use an approved composition;
- semantic tokens are used consistently;
- text and control contrast passes the required baseline;
- status and meaning do not rely on colour alone;
- keyboard and reduced-motion behaviour work where relevant;
- the artefact states its source, status and boundary where material; and
- a user can reach and begin using it in the target environment.

## Cross-project adoption contract

`brand/adoption.json` is the project-level register for brand use. A controlled surface is interconnected with the brand system only when:

1. it appears in the adoption register;
2. it consumes the controlled token or asset source rather than copying a new theme;
3. its local extensions retain the shared semantic roles;
4. a visual example can be opened from the Workbench Brand Review area;
5. its review evidence and next gate are visible; and
6. its actual approval, migration and publication status remain separate.

The Workbench is the first bounded application pilot. It imports `brand/tokens/brand.css`, uses the generated OA mark and exposes `/#brand` for visual review. A new website, application, document family or social surface should be added to the register before it claims brand conformance.

# Operations Automated logo assets

## Source

The four-part colour mark is reproduced from repository reference:

`1c50729:governance-site/public/favicon.svg`

It is being used as the working source because Jamie directed the wider brand to use the improved and agreed logo concept. Adoption within the master brand remains draft until Jamie confirms the mark in the Brand System v0.1 decision.

## Authoritative files

- `mark-colour.svg` — source colours for normal use
- `mark-navy.svg` — single-colour use on pale backgrounds
- `mark-white.svg` — single-colour use on dark backgrounds
- `lockup-colour.svg` — working horizontal composition on pale backgrounds
- `lockup-white.svg` — working horizontal composition on dark backgrounds

The mark geometry and original three blue values must not change between exports.

## Generated files

The `generated` directory contains PNG delivery exports for favicons, applications and documents. Regenerate these with `scripts/build-assets.mjs` after an authoritative SVG changes.

The wordmark in the lock-up SVG uses live type so the typography can still be revised during the draft. Use the generated PNG for a stable internal placement. If the brand is later approved for external distribution, convert the final approved wordmark to vector outlines and retain the source-font licence with the release.

## Alternative text

When the full name is visible beside the mark:

```html
<img src="mark-colour.svg" alt="">
<span>Operations Automated</span>
```

When the mark is the only identity on first encounter, use:

```html
<img src="mark-colour.svg" alt="Operations Automated">
```

Do not repeat the same name in both image alternative text and adjacent visible text.

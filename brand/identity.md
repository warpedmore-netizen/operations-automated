---
id: OA-BRAND-003
title: Brand Identity and Expression
status: draft
version: 0.1
owner: Jamie Peppard
date: 2026-07-25
---

# Brand identity and expression

## Logo

### The mark

The four-part mark is the primary visual identifier. Distinct modules meet around a shared centre: separate work, people and systems remain recognisable while contributing to a connected whole.

The logo does not represent automation replacing people. It represents:

- connected work;
- different scales and work types;
- flow between distinct parts;
- a whole-system view; and
- movement that retains structure.

### Primary lock-up

Use the colour mark to the left of the words **Operations Automated**. The name uses the primary sans-serif typeface at weight 700. Keep the name on one line when space permits.

Use the mark alone for:

- favicons and application icons;
- small avatars;
- repeated navigation where the full name is already visible; and
- compact internal diagrams.

Do not use the mark alone on a first encounter when the name is not otherwise clear.

### Clear space

Keep clear space around the logo equal to the width of one small outer module in the mark. No text, border, photograph, control or other logo enters this space.

### Minimum size

- Mark alone: 24 CSS pixels or 8 mm wide.
- Horizontal lock-up: 160 CSS pixels or 42 mm wide.
- Below 24 pixels, use the supplied colour or monochrome SVG without effects.

### Approved working variants

| Surface | Asset |
|---|---|
| White, paper or pale neutral | Colour mark or navy mark |
| Midnight or dark photography | Colour mark or white mark |
| Single-colour print | Navy mark on light; white mark on dark |
| Status, alert or product accent | Keep the logo unchanged; change the surrounding component |

### Do not

- stretch, rotate, skew or crop the mark;
- separate, reorder or animate individual modules as if they were a different logo;
- place the mark in a circle, gear, robot head or generic technology badge;
- recolour it for status or for different products;
- add glow, bevel, outline or drop shadow;
- put detailed imagery or low-contrast colour behind it; or
- recreate the mark from text characters.

## Colour system

### Core palette

| Name | Hex | Role |
|---|---|---|
| Midnight | `#071A2D` | Dark foundation, confident navigation and high-contrast backgrounds |
| Deep navy | `#0B2742` | Primary brand ink and monochrome logo |
| Ink | `#102A43` | Main text |
| Action blue | `#0B77D2` | Accessible primary action and active state |
| Flow blue | `#2E9EFF` | Connection, flow and secondary graphical emphasis |
| Human sky | `#68C4FF` | Open, supportive highlight and the light module of the mark |
| Paper | `#F7FAFC` | Default background |
| Canvas | `#EEF4F8` | Section separation and application workspace |
| White | `#FFFFFF` | Cards and reversed text |

The source mark retains its original blue (`#0C79D8`) alongside Flow blue and Human sky. Action blue is a slightly deeper interface derivative so ordinary white button text meets the contrast baseline. It is the only default primary-action colour. Flow blue and Human sky are supporting colours and must not be used for small text on a light surface.

### Human decision accent

| Name | Hex | Role |
|---|---|---|
| Decision amber | `#A45A00` | Human judgement, attention and controlled decision points |
| Decision soft | `#FFF1D6` | Amber background |

Amber means “pay attention or decide”; it does not mean failure. Use it sparingly so human control points remain distinct.

### Operational state colours

| State | Strong | Soft |
|---|---|---|
| Success or ready | `#19705B` | `#E2F3ED` |
| Warning or needs evidence | `#8A5700` | `#FFF2D8` |
| Risk, failed or blocked | `#A43D3D` | `#FBE8E6` |
| Neutral or inactive | `#52677C` | `#E9EFF4` |

Always pair state colour with explicit text and, where useful, an icon or pattern. Colour alone never communicates status.

### Proportion

For a typical light surface:

- 65–75% paper, white and canvas;
- 15–25% midnight, navy and ink;
- 5–10% signal and flow blue; and
- less than 5% amber or operational state colours.

This is guidance, not a formula. High-density applications may use more neutral surface colour; campaigns may use a dark foundation.

## Typography

### Primary sans-serif

**Source Sans 3** is the preferred family for the wordmark, body copy, interfaces, tables and labels. It is direct, open and readable across dense operational material.

Fallback:

```text
Source Sans 3, Source Sans Pro, Segoe UI, Arial, sans-serif
```

### Editorial serif

**Source Serif 4** may be used for major editorial headlines, quotations and long-form chapter openings. It brings human warmth to a technical subject. Do not use it for controls, tables, small labels or dense application navigation.

Fallback:

```text
Source Serif 4, Georgia, Times New Roman, serif
```

### Monospace

Use **Cascadia Mono** for identifiers, versions, source references, code and machine-readable values.

Fallback:

```text
Cascadia Mono, SFMono-Regular, Consolas, monospace
```

### Type behaviour

- Use sentence case for headings, controls and navigation.
- Use weight and space before adding another colour or rule.
- Keep body text at 16 px or larger on websites and 10.5 pt or larger in documents.
- Keep line length near 55–75 characters for sustained reading.
- Use tabular numerals for metrics and dates where alignment matters.
- Avoid all-caps paragraphs and long strings of tracked capitals.
- Never use condensed text for body content.

## Layout and spacing

### Grid

Use a flexible 12-column web grid or the equivalent native layout. Let content determine the number of occupied columns. Small artefacts may use a simple one- or two-column structure.

### Spacing

The base unit is 4 px. The common rhythm is:

`4, 8, 12, 16, 24, 32, 48, 64, 96`

Use 24–32 px inside ordinary cards and 64–96 px between major public-page sections. Dense applications may use the smaller half of the scale.

### Shape

- Small control radius: 6 px.
- Card and panel radius: 12 px.
- Feature-panel radius: 20 px.
- Status pill: fully rounded.

The logo uses softened modules, so components may have gentle corners. Avoid over-rounded “toy” interfaces and avoid sharp-edged layouts that feel punitive.

### Lines and shadows

Use borders to express structure and shadows only to express elevation.

- Default border: 1 px in the line token.
- Brand rule: 2–3 px in signal blue where a connection or selected state needs emphasis.
- Default shadow: broad, low-opacity navy.
- Do not use glowing blue edges, glass effects or multiple stacked shadows.

## Backgrounds and patterns

### Light connection field

Use paper or canvas with two low-opacity linear gradients forming a 64 px grid. Add one or two soft radial blue fields to suggest connection and movement. Keep contrast below the level of body text and never place grid detail behind dense copy.

### Midnight connection field

Use Midnight with a subtle blue radial field and a low-opacity grid. Reserve this for hero areas, navigation, covers and controlled emphasis rather than every page.

### Connector motif

Use lines, routes and nodes only when they reveal a real relationship:

- inputs converging into an operation;
- evidence connecting to a decision;
- human control points;
- feedback returning to learning; or
- systems remaining separate but governed together.

Decorative connectors should be sparse and should never imply a relationship that does not exist.

## Imagery

Prefer:

- real people engaged in work, discussion, observation or decision-making;
- the context where operations happen;
- diagrams that make systems, flows, dependencies or outcomes clearer;
- varied roles, settings, ages and abilities without tokenistic staging; and
- open compositions with room for useful text.

Avoid:

- humanoid robots, glowing brains, holographic hands and generic AI circuitry;
- corporate handshakes and anonymous laptop stock photography;
- empty factories or data centres used as shorthand for every operation;
- imagery that implies automation is inherently progress; and
- people shown only as passive recipients of technology.

## Icons and diagrams

- Use a consistent 1.75–2 px line weight at 24 px.
- Keep corners gently rounded.
- Prefer simple operational objects and clear arrows over abstract technology symbols.
- Label diagrams directly where space permits.
- Use the master palette, but keep status meaning redundant in text or shape.
- Do not make every concept a gear.

## Motion

Motion should explain state or connection:

- 120–180 ms for control feedback;
- 220–320 ms for a panel or route change;
- ease-out when elements arrive and ease-in when they leave;
- no continuous decorative pulsing except a genuine, labelled in-progress state; and
- respect reduced-motion preferences.

If removing animation removes meaning, provide an equivalent static state.

## Accessibility baseline

The templates target WCAG 2.2 AA contrast for ordinary text and controls. The system also uses a visible two-colour focus treatment and does not use colour alone to identify status.

Reference:

- [WCAG 2.2 contrast minimum](https://www.w3.org/TR/WCAG22/#contrast-minimum)
- [WCAG 2.2 use of colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)
- [WCAG 2.2 focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance)

Passing contrast is a baseline, not proof of accessibility. Test zoom, reflow, keyboard use, touch targets, reduced motion, language, cognitive load and real first use.

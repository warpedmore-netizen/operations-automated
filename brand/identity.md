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

The continuous OA loop is the primary visual identifier. The O flows into the A as one controlled route: observation becomes action, learning returns to the operation, and connection creates forward movement.

The logo does not represent inevitable autonomy or automation replacing people. It represents:

- a whole operation rather than an isolated task;
- a connected improvement and learning loop;
- movement from understanding to action;
- continuity through change; and
- automation kept inside the wider operational system.

### Primary lock-up

Use the colour mark to the left of a two-level wordmark: tracked **OPERATIONS** above bold **AUTOMATED**. Keep the combination horizontal when space permits. The geometric display type should feel precise and contemporary, not futuristic or playful.

Use the mark alone for:

- favicons and application icons;
- small avatars;
- repeated navigation where the full name is already visible; and
- compact internal diagrams.

Do not use the mark alone on a first encounter when the name is not otherwise clear.

### Clear space

Keep clear space around the logo equal to the thickness of the O ribbon. No text, border, photograph, control or other logo enters this space.

### Minimum size

- Mark alone: 28 CSS pixels or 9 mm wide.
- Horizontal lock-up: 180 CSS pixels or 48 mm wide.
- Use the contained dark tile for favicons and very small placements until an approved vector master is available.

### Approved working variants

| Surface | Asset |
|---|---|
| Obsidian, Midnight or dark connected texture | Colour mark and white wordmark |
| White, paper or pale neutral | Deep-blue monochrome mark or contained dark tile |
| Single-colour print | Navy mark on light; white mark on dark |
| Status, alert or product accent | Keep the logo unchanged; change the surrounding component |

### Do not

- stretch, rotate, skew or crop the mark;
- break the continuous loop into unrelated O and A symbols;
- place the mark in a circle, gear, robot head or generic technology badge;
- recolour it for status or for different products;
- add glow, bevel, outline or drop shadow;
- put uncontrolled detailed imagery or low-contrast colour behind it; or
- recreate the mark from text characters.

## Colour system

### Core palette

| Name | Hex | Role |
|---|---|---|
| Obsidian | `#01070F` | Signature brand field and dark cover background |
| Midnight | `#03111E` | Dark panels, navigation and textured fields |
| Deep blue | `#063F72` | Primary monochrome mark and strong structural blue |
| Ink | `#102A43` | Main text on pale surfaces |
| Loop blue | `#0E5B92` | Main body of the OA loop and connected graphics |
| Action blue | `#0B77D2` | Accessible primary action and active state |
| Electric cyan | `#32B6FE` | Movement, connection and the bright loop transition |
| Paper | `#F5F7FA` | Sustained reading and document background |
| Canvas | `#EAF0F5` | Application workspace and section separation |
| White | `#FFFFFF` | Cards and reversed text |

The raster reference contains subtle tonal variation. The listed loop colours are representative implementation anchors, not permission to flatten or redraw the source art. Action blue is a slightly deeper interface derivative so ordinary white button text meets the contrast baseline. Electric cyan is an accent and must not be used for small text on a light surface.

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

For a signature or campaign surface:

- 55–70% Obsidian and Midnight;
- 15–25% deep and loop blue;
- 5–10% white, action blue and electric cyan; and
- less than 5% amber or operational state colours.

For a working document or high-density application, reverse the balance towards Paper, Canvas and White while retaining a dark masthead, OA mark and blue connection accent.

## Typography

### Primary sans-serif

**Source Sans 3** is the preferred family for body copy, interfaces, tables and labels. It is direct, open and readable across dense operational material.

Fallback:

```text
Source Sans 3, Source Sans Pro, Segoe UI, Arial, sans-serif
```

### Geometric display

**Montserrat** is the preferred display and recreated-wordmark family. Use it for major headings, covers and the two-level OPERATIONS / AUTOMATED composition. Its wide geometry and firm weight match the founder-supplied reference. Do not use heavy display weights for body copy.

Fallback:

```text
Montserrat, Aptos Display, Arial, sans-serif
```

### Monospace

Use **Cascadia Mono** for identifiers, versions, source references, code and machine-readable values.

Fallback:

```text
Cascadia Mono, SFMono-Regular, Consolas, monospace
```

### Type behaviour

- Use sentence case for ordinary headings, controls and navigation.
- Use tracked uppercase only for the OPERATIONS wordmark line, short cover labels and rare structural eyebrows.
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

The loop mark combines continuous curves with a precise A. Components may use restrained corners, but the system should feel more engineered than playful. Avoid over-rounded “toy” interfaces and avoid sharp-edged layouts that feel punitive.

### Lines and shadows

Use borders to express structure and shadows only to express elevation.

- Default border: 1 px in the line token.
- Brand rule: 2–3 px in signal blue where a connection or selected state needs emphasis.
- Default shadow: broad, low-opacity navy.
- Do not use glowing blue edges, glass effects or multiple stacked shadows.

## Backgrounds and patterns

### Obsidian connection field

Use Obsidian with a low-opacity irregular mesh, fine routes and a controlled blue/cyan edge light. The texture should feel physical and connected rather than like a generic circuit board. Keep the centre quiet enough for the mark and message.

### Light working field

Use Paper or Canvas for long reading, evidence, forms and dense application work. A very faint blue route or mesh may connect sections, but the texture must not reduce reading clarity.

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

The templates target WCAG 2.2 AA contrast for ordinary text and controls. The initial reference art is visually reviewed separately because text baked into an image cannot replace accessible live text. The system also uses a visible two-colour focus treatment and does not use colour alone to identify status.

Reference:

- [WCAG 2.2 contrast minimum](https://www.w3.org/TR/WCAG22/#contrast-minimum)
- [WCAG 2.2 use of colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)
- [WCAG 2.2 focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance)

Passing contrast is a baseline, not proof of accessibility. Test zoom, reflow, keyboard use, touch targets, reduced motion, language, cognitive load and real first use.

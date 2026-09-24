---
name: LUCERO STUDIO
description: Estudio de apps Android y web a medida; la página es un aerograma de correo aéreo.
colors:
  azul: "#16508e"
  azul-deep: "#0e3a6b"
  azul-night: "#0a2a4f"
  airmail-red: "#c8372d"
  ink: "#0b2545"
  ink-soft: "#3a5374"
  ground: "#e3ebf5"
  ground-deep: "#d4e0ee"
  paper: "#f7fafd"
  stamp-white: "#ffffff"
  on-azul: "#eef4fb"
  on-azul-soft: "#b9cde6"
  azul-line: "rgba(22, 80, 142, 0.22)"
  azul-faint: "rgba(22, 80, 142, 0.1)"
  error: "#b3261e"
typography:
  display:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5.4vw, 5.1rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 118"
  headline:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.5vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 800
    letterSpacing: "0.1em"
    fontVariation: "'wdth' 120"
  wordmark:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 125"
  typed:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 2
rounded:
  none: "0px"
  sm: "3px"
  circle: "50%"
spacing:
  gutter: "clamp(1rem, 4vw, 2.5rem)"
  section: "clamp(4.5rem, 10vw, 8rem)"
  section-head: "clamp(2.5rem, 5vw, 4rem)"
  column-gap: "clamp(2rem, 5vw, 5rem)"
  max-width: "1240px"
  header: "78px"
components:
  button-primary:
    backgroundColor: "{colors.azul}"
    textColor: "{colors.on-azul}"
    rounded: "{rounded.sm}"
    padding: "0.8rem 1.75rem"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.azul-deep}"
    textColor: "{colors.on-azul}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.azul}"
    rounded: "{rounded.sm}"
    padding: "0.8rem 1.75rem"
    height: "50px"
  button-secondary-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.azul}"
  button-nav:
    backgroundColor: "{colors.azul}"
    textColor: "{colors.on-azul}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1.15rem"
    height: "42px"
  input-letter:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.typed}"
    rounded: "{rounded.none}"
    padding: "0.55rem 0.1rem"
  input-letter-focus:
    backgroundColor: "{colors.azul-faint}"
  paper-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "clamp(1.5rem, 4vw, 3rem)"
  stamp-face:
    backgroundColor: "{colors.azul-deep}"
    textColor: "{colors.on-azul}"
    rounded: "{rounded.none}"
    padding: "1rem 0.75rem"
  soon-badge:
    backgroundColor: "transparent"
    textColor: "{colors.azul}"
    rounded: "{rounded.none}"
    padding: "0.55rem 1rem"
  route-mark:
    backgroundColor: "{colors.azul-deep}"
    textColor: "{colors.on-azul}"
    rounded: "{rounded.circle}"
    size: "64px"
---

# Design System: LUCERO STUDIO

## Overview

**Creative North Star: "Correo Aéreo"**

The site is an airmail aerogramme: a letter answered by the people who build. Pale blue onionskin ground, sheets of white and near-white paper laid on it, the logo's blue used as ink and as the colour of the stamp printer's plate. Every section is a piece of correspondence: the hero is an addressed envelope, services are a pane of perforated stamps with a catalogue entry beside it, the process is a postal route, the apps are the next issue, and the contact form is ruled letter paper with a typewriter hand.

Density is calm and editorial. One display headline outranks everything else; section heads sit a clear step below it, each under a full-width 3px blue rule. Paper objects (envelope, stamp pane, issue sheet) tilt a few degrees and cast soft, layered paper shadows; interface chrome (header, buttons, fields, nav) stays square to the grid. Red appears only inside the airmail chevron ribbon that edges the header, the route band, the footer and the paper sheets.

The world rejects the dark neon tech-agency look and its opposite, the white SaaS card grid. It is a postal world built entirely in code: stamps, postmarks and chevrons are CSS and inline SVG, and the only raster is the brand's own logo.

**Key Characteristics:**
- Onionskin-blue ground with paper sheets on top, never white-on-white.
- Airmail chevron (red / paper / azul / paper at -45deg) as the recurring edge device.
- Archivo at expanded widths (112-125%) for display, labels and the wordmark; Courier Prime only for what the visitor types.
- Perforated stamps, circular postmarks with wave cancellations, ruled letter lines.
- Soft two-layer paper shadows; slight tilts on paper objects only.
- A "ENVIADO" postmark stamps onto the letter when the form sends successfully.

## Colors

A single committed blue family on pale blue paper, with the airmail red confined to the chevron.

### Primary
- **Logo Azul** (azul): the committed brand ink from the logo. Fill of the primary action and the nav button, the hover fill of the Google Play button, the skip link and text selection. As text and line: section h2s, labels, links, postmark strokes, the 3px section rules, the focus ring.
- **Plate Azul** (azul-deep): large blue fields. The process route band, stamp faces, the "Por avión" label, primary-button hover.
- **Night Azul** (azul-night): the footer (the back of the envelope) and the darkest stamp in the pane.

### Secondary
- **Airmail Red** (airmail-red): exists only as one of the four stripes in the chevron ribbon.

### Neutral
- **Envelope Ink** (ink): body text, h1, titles, typed input.
- **Faded Ink** (ink-soft): lead paragraphs, section intros, secondary copy, nav links at rest.
- **Onionskin** (ground): the page ground and header background.
- **Onionskin Fold** (ground-deep): scrollbar track and the perforation holes in the stamp pane.
- **Letter Paper** (paper): envelope, letter form, issue sheet, privacy sheet, app cards; perforation holes on the hero stamp.
- **Stamp White** (stamp-white): stamp paper and the stamp pane sheet, one step brighter than letter paper.
- **On Azul** / **On Azul Soft** (on-azul, on-azul-soft): text and rules on blue fields; soft for secondary copy and the dashed flight path.
- **Guide Line** (azul-line): 1px hairlines, catalogue dividers, input baselines, letter ruling, the header's bottom edge.
- **Blue Wash** (azul-faint): input focus wash, empty issue slots, the privacy table of contents.
- **Error Red** (error): field errors and failed-send status only.

### Named Rules
**The One Red Rule.** Decorative red lives only in the chevron ribbon. Error red is functional and appears only on invalid fields and failed status. No red text, red buttons or red postmarks.

**The Reserved Blue Rule.** Logo Azul as a solid fill is reserved for the primary action, button hover/active states, the skip link and selection. Large fields (bands, stamps, labels) use Plate Azul or Night Azul.

## Typography

**Display Font:** Archivo, variable width 62-125, weight 400-900 (with Segoe UI, system-ui)
**Body Font:** Archivo (same stack)
**Label/Mono Font:** Courier Prime (with Courier New), for visitor-typed text only

**Character:** One grotesque stretched wide for a printed-postal voice: expanded and heavy for display, the wordmark and uppercase labels, normal width for reading. Courier Prime is the visitor's typewriter.

### Hierarchy
- **Display** (800, clamp(2.4rem, 5.4vw, 5.1rem), 1, width 118%, -0.03em): the single hero h1, in ink.
- **Headline** (800, clamp(2rem, 4.5vw, 3.5rem), 1, width 112%, -0.03em): section h2s in Logo Azul (On Azul on the route band). The privacy h1 uses the same voice at clamp(2.2rem, 6vw, 3.75rem).
- **Title** (800, 1.3-1.4rem, 1.2): service titles, route stop names, app titles.
- **Body** (400, 1.0625rem, 1.6; 1rem under 600px): reading text, capped at 28-48ch in columns and 68ch on the privacy page. Leads run clamp(1.05rem, 1.6vw, 1.25rem) in Faded Ink.
- **Label** (800, 0.78rem, 0.1em, width 120%, uppercase): form field labels, the privacy TOC heading, the "Próximamente" badge (0.8rem), the airmail label and stamp names.
- **Wordmark** (800, 1.05rem, 0.08em, width 125%): "LUCERO STUDIO" beside the logo, the footer sender (clamp(1.5rem, 3vw, 2.1rem), 0.04em).
- **Typed** (Courier Prime 400, 1.05rem): inputs and the textarea, on a 2rem line so text sits on the ruled lines.

### Named Rules
**The Typewriter Rule.** Courier Prime appears only in what the visitor types. Studio copy is always Archivo.

**The One Headline Rule.** The hero h1 outranks everything; no other heading approaches its size. Section heads stay a clear step below.

## Layout

Centred container of 1240px with a fluid gutter (clamp(1rem, 4vw, 2.5rem)) and a fixed 78px header (112px under 860px, 104px under 600px). Sections breathe with clamp(4.5rem, 10vw, 8rem) vertical padding. Each section opens with a head: a two-column grid (title left, intro up to 26rem right, aligned to the baseline) under a 3px Logo Azul rule, collapsing to one column under 860px.

Content blocks are asymmetric two-column grids with clamp(2rem, 5vw, 5rem) gaps: hero 1.15fr / 1fr, services 1.05fr / 1fr, contact 0.85fr / 1.15fr (sticky intro). The process is a four-stop row joined by a dashed flight path, becoming 2x2 under 1024px and a numbered list with side marks under 600px. Breakpoints: 1024px (hero and services stack), 860px (nav wraps under the logo, heads and contact stack), 600px (buttons full-width, envelope loses its fixed ratio).

## Elevation & Depth

Depth is paper on paper: soft, two-layer, ink-tinted shadows that read as a sheet resting on a desk, plus slight rotations on paper objects. Nothing uses hard offset shadows or glows.

### Shadow Vocabulary
- **Paper** (`box-shadow: 0 1px 2px rgba(11, 37, 69, 0.08), 0 10px 28px -8px rgba(11, 37, 69, 0.22)`): resting sheets: stamp pane, issue sheet, privacy sheet, app cards.
- **Lift** (`box-shadow: 0 2px 4px rgba(11, 37, 69, 0.1), 0 18px 36px -10px rgba(11, 37, 69, 0.3)`): the hero envelope, the letter form, app cards on hover.
- **Stamp** (`filter: drop-shadow(0 2px 3px rgba(11, 37, 69, 0.18))`): perforated stamps, so the shadow follows the perforations.
- **Primary Button** (`box-shadow: 0 2px 4px rgba(11, 37, 69, 0.18), 0 8px 18px -8px rgba(14, 58, 107, 0.6)`, deepening on hover): the one piece of chrome that lifts.

### Named Rules
**The Paper Tilt Rule.** Paper objects may rotate between -1deg and -3deg (envelope -3deg, stamp pane -1deg, issue sheet -1.5deg). Header, buttons, fields and text never rotate.

## Shapes

Square paper, barely softened chrome. Sheets, stamps, fields and badges have square corners; buttons take a 3px radius; the focus ring 2px. Circles are reserved for the logo, the route stop marks and the postmarks. The recurring silhouettes are postal: chevron ribbon borders (via border-image, 6-12px), perforated stamp edges (radial-gradient holes in the colour of the surface beneath, 12px pitch), inset frame lines on stamp faces, dashed outlines for unprinted stamp slots, and the triangular envelope flap on the footer.

## Components

### Buttons
Printed and firm.
- **Shape:** gently squared (3px), 2px Logo Azul border, 50px minimum height; Archivo 700 at 110% width.
- **Primary:** Logo Azul fill, On Azul text, primary shadow. Hover/focus: Plate Azul, lifts 2px, shadow deepens. Active: presses 1px down.
- **Secondary:** transparent with Logo Azul text and border; hover fills Letter Paper and lifts 2px.
- **Nav:** the primary button at 42px, 0.92rem, in the header.
- **Google Play (app card):** secondary style at full width; hover fills Logo Azul with On Azul text.
- Transitions run 0.3s on cubic-bezier(0.16, 1, 0.3, 1); hover lifts are disabled on touch.

### Cards / Containers
- **Paper sheet:** Letter Paper, square corners, chevron top edge (10px on the letter and privacy page, 6px on app cards), Paper or Lift shadow.
- **App card (template, not yet rendered):** 1.75rem padding, 88px app icon at 22% radius, title, description, full-width Google Play button; lifts 4px to the Lift shadow on hover.

### Inputs / Fields
- **Style:** letter lines, not boxes. Transparent, no radius, 1.5px Guide Line baseline, Courier Prime text. The textarea is ruled with Guide Line every 2rem.
- **Labels:** Label style in Logo Azul above the field.
- **Hover / Focus:** baseline turns Logo Azul; focus adds the Blue Wash.
- **Error:** baseline turns Error Red with a 5% red wash; message below in Error Red.

### Navigation
Wordmark and round logo left (the logo turns -12deg on hover), links in Faded Ink 600 at 0.95rem, nav button right, over a 6px chevron band on the header's top edge. Hover/focus turns the link Logo Azul and draws a 2px underline from the left, like an address line. Under 860px the links wrap to a full-width row below a hairline.

### Perforated Stamp
White stamp paper with round perforations; faces in Plate Azul, Night Azul or a pale engraved-paper tint, framed by an inset hairline 7px in, with an uppercase stamp name. In the pane, neighbouring stamps share perforations. The hero stamp carries the logo, rotated 4deg.

### Postmark
Inline SVG in Logo Azul: two concentric circles with ring text on a path, centre text, and four wave cancellation lines, at 0.78 opacity with multiply blending. It stamps in on load (0.7s, scale 1.35 to 1). The "ENVIADO" variant stamps onto the letter at -14deg only after a successful send.

### Route Stop
64px circular mark in Plate Azul with an On Azul ring and inner hairline, tabular numeral, joined to the next stop by a 2px dashed On Azul Soft flight path.

## Do's and Don'ts

### Do:
- **Do** edge major paper and bands with the airmail chevron (red / paper / azul / paper, 12px stripes at -45deg).
- **Do** open every section with a head under a 3px Logo Azul rule, the h2 at a clear step below the hero headline.
- **Do** set expanded Archivo (112-125% width) for display, wordmark and uppercase labels; normal width for reading.
- **Do** give paper objects the Paper or Lift shadow and, where they are objects rather than chrome, a -1deg to -3deg tilt.
- **Do** build postal artefacts (stamps, postmarks, rulings) in CSS and inline SVG in the blue family.
- **Do** keep Logo Azul fills for the primary action and interactive states; use Plate or Night Azul for fields.

### Don't:
- **Don't** use red anywhere outside the chevron ribbon, except Error Red on invalid fields and failed status.
- **Don't** use Courier Prime for studio copy.
- **Don't** use hard offset shadows, glows or neon; depth is soft paper shadow.
- **Don't** round sheets, stamps or fields; only buttons take the 3px radius and only logo, marks and postmarks are circles.
- **Don't** rotate interface chrome (header, buttons, fields, text blocks).
- **Don't** put small uppercase labels above headings; section heads open with the rule and the h2.
- **Don't** set type on a pure white page; the ground is always onionskin blue with paper laid on it.

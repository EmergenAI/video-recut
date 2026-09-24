# Graphic compositions

Read this when a board, comparison, chart, title, card, diagram or other designed area has to share
the frame with footage, or has to carry a passage by itself.

Begin with what the viewer is meant to grasp or feel. A graphic might clarify, give structure, create a
mood, land a joke or just be a pleasure to look at; it does not have to justify itself by carrying literal
information. How the picture changes over time belongs to [Motion graphics](motion.md).

## One idea per frame

Before placing anything, answer three questions:

1. Where does the eye land first?
2. What supports it?
3. What will the next meaningful beat change?

Express the answer through size, spacing, grouping, contrast, color and motion. Structure speaks
before any word is read: rows say "these are comparable", an empty slot says "something is coming",
two sides say "choose".

Compose the whole frame, not each element. Leave room for a board where the presenter is not
standing. Let one accent color tie together the caption highlight, the icons, the question mark and
the flash on a reveal. Judge color, coverage and brightness together: a large pale panel sitting
behind someone in a pale shirt flattens the whole picture even when each piece looks good alone.
Work with the framing and movement the footage actually has, not the framing you wished for.

## Settle the look before spreading it

- Translate the reference's feel into a few shared choices: palette, typefaces, edge treatment,
  depth, motion personality.
- Test them on a short, representative passage with the real footage and a draft render.
- Once accepted, write them into the composition page's shared CSS as custom properties and classes,
  so a later change happens in one place.
- Give graphic text its own job: labels, comparisons, emphasis the picture needs beyond what the
  captions already say.
- When you remove a redundant title or label, re-lay out what remains. Do not leave an unexplained
  hole; the frame must still look finished.

## Footage and graphics together

Keep three layers apart in your head:

| Layer | What it holds |
| --- | --- |
| The scene | What was generated or recorded: people, props, surroundings, and what they do to each other |
| The camera | How that scene is framed |
| The canvas | The final page: footage layers, captions and graphics arranged together |

A shop sign filmed in the scene belongs to the scene. An explanatory label pointing at it is an HTML
element laid over the top.

**When you are about to shoot or generate new footage,** reserve the space recurring graphics will
need, and turn that into camera facts: where the subject stands, how much of the body is visible,
room for gestures, distance, background. The generation model receives only picture requirements;
future motion graphics, text and explanations stay in the page. The wording of those picture
requirements belongs to [Image direction](../3-materials/images.md).

**When the footage already exists,** its framing is fixed. Decide what must stay readable, then
adjust the footage's view, the graphics, or both.

**Decide who leads at each moment.** A small moving face can beat a large still panel for attention.
Protect whatever carries the current beat: a mouth, a gesture, a product detail, a line of text. The
levers are:

- position and coverage on the canvas;
- the source crop: `object-fit`, `object-position`, or a clipping wrapper;
- paint order: page order (later draws on top) or CSS `z-index`, for timed and untimed layers alike; `data-track-index` only keeps clips on one track from overlapping in time.

The geometry is worked out in [Space: canvas, frames and fitting](page.md#space-canvas-frames-and-fitting).
Being A-roll does not reserve a fixed region for footage or keep it at the bottom of the stack
forever.

When a screen carries the argument, [Screen demonstrations](screen-demos.md) decides
evidence versus explanation; its view then shares canvas geometry and hierarchy with everything
around it, as here.

## Editable structure or media

| Use editable page structure when... | Use media when... |
| --- | --- |
| wording, alignment, timing, data or a repeated visual relation must be controlled | the picture itself is the content: a photo, artwork, texture, product shot |
| you need exact fonts, CSS geometry, or state driven by the timeline | a real screenshot or a finished image already says it; do not rebuild it pixel by pixel in HTML |

The line moves with each work. A score that updates with every answer is editable state. A paper
texture behind a board could be CSS or SVG, drawn procedurally, found, or generated; pick by the look,
how it must follow the theme, and how often it will change.

Icons, portraits and interface fragments can identify a subject, carry a theme, show the state of a
fact, or land a visual joke. Choose the source by what the viewer needs from it:

- **The asset is evidence** (exact current wording, data, UI, a private identity, a specific brand
  asset): use authoritative supplied or found material. Record where it came from and the terms of
  use.
- **The asset is for recognition or creative adaptation** (a widely known icon, figure, object, meme
  or place): the image model can draw it directly or from a reference, or you can find one. Check that
  the result carries the intended identity and plays its graphic role. A reconstruction keeps
  recognizability and relationships; an adaptation may move it into a new theme. Where it came from
  does not make an image more visually true.

Keep generation prompts in `prompts/` and reference files inside the project, so the creative intent
stays editable.

## Into the page

Draw element boundaries by behavior, not by size or looks. Example: a league table whose rows slide
and re-sort together, sharing one state, is one element containing its rows; the team crests beside it
that each pop in on their own second are separate layers.

- Scene and element boundaries, and which values are worth exposing:
  [Scene design](scenes.md).
- What the viewer experiences as it changes: [Motion graphics](motion.md).
- How it reads together with the real footage:
  [Judge the composition](../5-deliver/review.md#judge-the-composition).

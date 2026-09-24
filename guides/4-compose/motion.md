# Motion graphics

Consult this page whenever the picture changes over time through authored graphics, effects or a
coordinated scene.

Motion graphics explain a relationship, make a comparison felt, time a joke, or establish a visual
attitude. They range from a small accent, through a presenter working alongside a diagram, to a
fully animated passage. How elements share one frame belongs to
[Graphic compositions](graphics-layout.md); this page is about what the change does to the
viewing.

## Direct the change, not just the entrance

For every event, know three things: what the viewer sees before, what changes, and what remains
afterwards. The movement is what gives the next state its meaning. Some kinds of change:

- a board that accumulates answers as they are given;
- a picture that is picked up, dropped into a slot, and rejected back out;
- one picture stepping back so another idea can come forward.

A beautiful entrance does not rescue an end state that fails to show the point.

**Keep object identity through the change.** The same card keeps its image, shape and path. When an
interface changes style, keep its controls recognizable. The viewer then sees what changed instead of
learning a new picture on every beat.

**A hard cut is a handoff too.** Use it when presenting the next idea directly is clearer than living
through the process.

**Motion carries feeling.** A springy arrival is playful; a sudden hard swap has force; a slow, exact
build invites study. Choose the motion personality that belongs to this film, and leave the result on
screen long enough to be seen. How long depends on the text, the voice, the size of the picture and how
much there is to read.

## Motion belongs to one visual language

Color, type, edge treatment, texture, depth, movement and sound ought to support one another. A style such as
retro cartoon, precise mathematical diagram or spatial 3D makes its own choices about weight, paths,
perspective and rhythm. The style name is a creative direction, not an element type: extract the
concrete relations that make the style believable.

- Decisions shared across scenes go into the page's shared CSS (custom properties, classes) and shared
  timeline helper functions.
- When the style changes, keep meaningful objects intact: the content, controls and results that carry
  the idea keep doing their jobs. Recoloring only the outer frame changes less than you expect;
  removing labels may force a new layout.
- The film's specific palette, decoration and attitude are recorded in TREATMENT.md.

Source footage is part of the language. Moving the viewport (a `scale`/`translate` on the footage layer
or its wrapper) changes how it is watched without changing when the performance happens
([Footage layers and the three clocks](page.md#footage-layers-and-the-three-clocks)).
An image, an outline and a caption that move independently can share a moment without being one
element. When footage and graphics must move as one scene, put them in one wrapper and direct its
geometry together. Scene boundaries are covered in [Scene design](scenes.md).

## Events and motion have separate owners

- **Events** place the behavior and its key changes. An explanation, reveal or comparison can answer a
  named phrase or a named moment in the speech, resolved to seconds from `timeline.json`
  ([Place events by relationship](timing.md#place-events-by-relationship)). A silent
  animated passage uses authored seconds
  ([Durations for authored animation](timing.md#durations-for-authored-animation)).
- **Motion** (travel, settling, texture, secondary movement) is designed locally as tweens relative to
  those events on the paused timeline
  ([Animate with the paused timeline](page.md#animate-with-the-paused-timeline)).

Derive related motion from the relation it depicts:

- a pointer arrives at the control it is about to press;
- a label badge moves along with the object it names;
- a drag that gets refused travels back from the spot where it really ended up.

Compute positions from the related elements instead of typing independent coordinates, so a layout
change does not break the action. Coordinate entrance, response, hold and exit inside the scene
([Events, lifetime and state](scenes.md#events-lifetime-and-state)); independent
captions, sound and media layers stay free of it.

## Check it with real footage and sound

- Look at exact frames for shapes, overlaps and whether the settled state reads.
- Play the draft to feel weight, rhythm and whether the handoffs hold.
- Judge at delivery size and next to the neighbouring pictures, including the moment right after the
  showiest movement.

Frame and grid evidence: [Evidence frames and grids](../5-deliver/review.md#evidence-frames-and-grids).
Composition judgment: [Judge the composition](../5-deliver/review.md#judge-the-composition).
Drawing and deterministic rendering: [The composition page](page.md).

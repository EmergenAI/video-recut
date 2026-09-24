# Screen demonstrations

Use this page when the viewer needs to actually follow what happens on a screen (a website, app,
terminal, editor or anything else) rather than just catch sight of it.

## Decide the screen's job

A screen in the film does one of three jobs:

1. **Records a real state:** this is what the page, the settings, the output actually look like.
2. **Shows an action and its result:** the user does something; the interface responds.
3. **Stages an explanation of a relationship:** how a mechanism works, what connects to what.

Settle the job first. It decides the material and the treatment.

## Choose the evidence the argument needs

| Material | Use it to |
| --- | --- |
| Screenshot | Make wording, layout or one specific result readable |
| Screen recording | Keep an interaction and the interface's real response |
| Authored HTML scene | Isolate a concept, stage an example, keep changing labels and states editable |

These can share a passage: a real recording establishes the behavior while graphics around it tell
the viewer where to look. A still can also travel inside the viewport to guide the eye; that is a way
of looking at a still, not a recorded interaction, and the film should not pretend otherwise.

- **The exact wording, number or behavior is the claim:** rely on material that proves it, and store a
  source for it in the project that can be traced.
- **The screen only stands for an idea:** direct an invented state and action so the viewer grasps
  what it represents.

A film can switch between evidence and illustration as long as each role is clear in the argument.
Example: a real recording of a budgeting app shows the user importing a bank statement; the next beat
cuts to an authored animation of transactions sorting themselves into categories, explaining what the
app did behind that import.

## Stage a view the viewer can follow

- **Choose the region of the screen where the fact or the action lives.** Orient with the whole screen
  first if needed, then move close to read a control or watch it change.
- **Guide attention** with crops, zooms, a cursor and highlights, while keeping enough context to show
  *where* it is happening.
- **Judge legibility at delivery size.** A recording that is crisp at full resolution can become
  unreadable as a small inset on a phone.
- **Give every interaction a readable before and after:** the goal, the action, the visible response,
  and enough time to take in the result. You may show the result first and then go back to the cause;
  what matters is that the viewer can infer the relation.
- **Keep kinds of scrolling distinct.** A page or internal list scrolling means something different from
  the viewport, the device or the whole screen card moving.
- **Pace:** a real recording can keep the interface's own rhythm; an authored demonstration can put its
  key changes on speech events in the timeline.

What surrounds the screen is also a directing choice:

| Surround | What it says |
| --- | --- |
| Bare crop | The interface has authority and room to be read |
| A filmed or generated device | The screen lives in someone's world |
| A graphic frame | The screen joins the film's visual language |

Keep the real screen readable while you decide what the presenter, captions and other graphics
contribute. Shared hierarchy belongs to [Graphic compositions](graphics-layout.md); animation in
and around the demonstration belongs to [Motion graphics](motion.md).

## Build it

Choose the implementation from the screen's role.

- **Real screens** come from a recording the user supplies or makes, or from a scripted capture of a
  web page with the Skill's Puppeteer setup or the host's browser tool
  ([Capture a web page](../3-materials/media-prep.md#capture-a-web-page)).
- **Prepare them with ffmpeg before use:** probe, cut out the useful intervals, conform frame rate and
  size, and keep originals beside the processed versions
  ([Cut and keep intervals](../3-materials/media-prep.md#cut-and-keep-intervals),
  [Conform footage and audio](../3-materials/media-prep.md#conform-footage-and-audio)).
- **Present them as layers in an HTML scene.** Crop, zoom, device frame, cursor and highlight are
  ordinary elements animated on the timeline
  ([Footage layers and the three clocks](page.md#footage-layers-and-the-three-clocks)).
- **Editable illustrative screens** are built directly in HTML inside that scene.

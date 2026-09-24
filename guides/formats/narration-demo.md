# Narration-led demo

Read this when an independent voice-over carries the whole work or long stretches of it, and the
picture is products, hands, screens, demonstrations, B-roll, typography or motion graphics.

## Name the relationship first

A narration-led passage is organised by an accepted voice that no visible speaker delivers. The
picture is designed around that performance from the start; it is not something laid over a
presenter for a few seconds.

Common shapes: a desk demo, a screen tutorial, a product walkthrough, a visual essay, a montage with
voice-over, a motion-graphics explainer.

The test is not whether a face is on screen right now. A presenter-led piece that covers its speaker
with B-roll for a few seconds is still led by a visible performance. A narration-led passage is speech
that never depended on on-camera delivery. Mixed works can switch between the two as the story needs.

Write the relationship into the Treatment. It decides how you read the performance, what coverage
means, what counts as visual evidence and what review looks for. When a visible presenter stays in the
work but demonstrations and graphics take most of the screen, read
[presenter-led explainer](presenter-explainer.md) instead.

## One voice line, many visual answers

Write the narration as segments in `script.json`. Mark the words and moments that need a visual
answer: a named word span for a stretch the picture must cover, a named moment for a reveal or a cut.
Both resolve to seconds from the units and Cue times in `timing/timeline.json`.

A single segment of narration can hold several changes of picture. Switching to another side of the
product, a fresh screen, a hand doing something or a diagram appearing are all ways of answering the
same sentence; none of them is a reason to cut the voice into pieces.

Give every picture a job before you make it:

| Job | The viewer comes away with |
| --- | --- |
| Setting the scene | Who is talking about what, and where we are |
| Evidence | The claim, seen happening: before and after, in use, or side by side |
| Supporting footage | Something tangible to look at while an idea is explained, or a mood that contrasts with it |
| Screen detail | An exact interface state they need to read |
| Graphics and type | Order, totals, change over time, or anything no camera could film |

Jobs stack in time rather than taking turns: the phone frame stays put while its screen changes, the
captions keep pace with the voice, a label holds its position, a click sound lands on a tap. Plan the
passage as layers that persist and layers that change, not as a row of separate slides.

## Visual evidence, not illustrated nouns

Every picture should move the argument forward. A speed claim needs a visibly quick action or a
shortened process; a product claim needs the product in use or its result; an explanation needs a
graphic relationship readable at a glance. A generic image for each noun produces activity, not proof.

Example (invented): the narration says "a refill takes ten seconds". A still of a water bottle
illustrates the noun. A hand unscrewing the cartridge, clicking a new one in and the clock graphic
stopping at 0:09 proves the claim.

Generated images and video are ordinary production material. Treat the image model as a well-read
illustrator and the video model as a well-read camera crew. Private products, brands, people, data and
interfaces that public knowledge cannot establish need exact references. The Treatment and the
accepted references decide the prompt; each model's exact inputs and limits live in
[generation](../3-materials/generation-requests.md).

MiniMax H3 renders at most 15 seconds per shot, so a long demonstration is several shots joined by
cuts, a persistent frame or a graphic, not one request.

## The narrator is one person across the work

The narration can be a finished recording or TTS in an accepted voice
([voice and performance](../3-materials/speakers-and-narration.md) covers the difference). Render one speech
file per `script.json` segment with the chosen TTS service.

When the same person also appears speaking on camera, the file rendered in that voice can serve both
as the reference audio for their visible shot and as independent narration. The work changes the
relationship between voice and picture, never the speaker.

For every visible speaking shot, the segment's TTS file is the one sound of record and the generated
clip plays muted over it. If a short test shows the clip's own speech is better, extract it as that
segment's audio, align it and rebuild the timeline; never keep both
([route the voice once](../4-compose/sound.md#route-the-voice-once)).

Measurement and alignment belong to [script and time](../2-plan/script.md):
`timeline.mjs` turns the script, the speech files and any alignment into timed words and Cues. Place
each picture change by its relation to the words it answers
([place events by relationship](../4-compose/timing.md#place-events-by-relationship)), never by
typed seconds. When the voice is re-rendered, the pictures move with it and no new speech seams are
needed.

## Keep picture and sound continuous

Every intended interval needs a deliberate picture: a continuing shot, another piece of B-roll, a
persistent layer, a handoff or a designed background. Check the draft render and its frame sheets for
leftover frames or empty edges between decisions.

Music, ambience and effects can glue cuts or mark a change of section while the narration stays clear
([sound mix](../4-compose/mix.md)).

Captions are still the spoken words. Steps, labels, numbers, titles, call-to-action text and interface
text belong to typography, the screen or motion graphics, unless they are also read aloud.

## Review: does the picture earn the narration?

First watch it as an argument: does each visual change clarify, prove, pace or strengthen what is
said? After that, verify that products and screens are accurate, that hands and devices sit correctly,
that captions are timed well, that persistent layers are in the right state, and that visual handoffs work.

The visual sequence should form a clear progression together with the voice. Weak proof is fixed in
shot or scene design; wrong timing is fixed where the event relates to its words.

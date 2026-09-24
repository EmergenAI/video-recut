# Reviewing the film

Read this when you judge a draft or the finished film, locate what needs to change, fix it where the fact
lives, review with the user, or hand over the final video.

Review works from renders. A full draft render is the working preview. Read the picture with
`render.mjs frames` and `grid` sheets, play the MP4 to judge sound and feel, and judge the final MP4 as the
encoded deliverable. A single frame establishes detail; a dense run of frames establishes motion and
handoffs; playback establishes rhythm and sound. [Render](render.md) owns producing the files.

## Judge the composition

Look at the chosen performance and at the picture and sound assembled around it. For pure A-roll, judge
whether voice, action, reactions, camera changes and pauses carry the intended passages. For mixed work,
judge captions, evidence and graphic relationships together with the performance.

Watch what the render actually does. Is the contrast clear? Can the captions be read? Does the B-roll cover
the explanation it was meant to cover? Do entrances and exits land on the right word or action? Do
persistent objects keep their identity and state through handoffs? Does a moving video viewport play as
intended? Adjust layout, timing or scene behavior where that makes the passage better, and judge a local
change inside its surrounding composition.

Use the formal script and the production timeline to locate words, reveals and handoffs; the rendered
frames show how the chosen material works there. Keep the same produced media and timeline while you revise
layout and composition.

**Review the material actually used.** Only the composition page and the files it references reach the
film. A layout test with placeholder stills tells you about style and behavior; the real generated images
establish framing and color; generated video shows how moving faces and gestures interact with captions and
motion graphics. Check with the material that will appear in the deliverable.

**Know what each check establishes.**

| Check | Establishes |
| --- | --- |
| `render.mjs lint` | The page obeys the renderer's contract |
| A draft render | What the page shows and sounds like |
| The generated manifest | What Bibei actually produced |
| Creative review | Whether the composition carries out the Treatment and the relationships learned from the reference |

**Read a missing behavior from both the material and its presentation.** For expected speech, listen to the
render: a file in `composition/audio/` establishes the material, and its `<audio>` element (source, window,
volume) establishes whether it reaches the film. For an expected physical action, check the footage itself
and the viewport animation; presentation motion cannot replace an action missing from the material.
[Media](../3-materials/media-prep.md), [audio](../4-compose/sound.md) and [the composition page](../4-compose/page.md) complete these
relationships. Silence or stillness may also be a deliberate choice that serves the Brief.

Watch the complete film at the delivery size, and also its parts. A graphic that looks good alone can cover
a face, fight the opening hook, land on the wrong word or break the rhythm.

Check the relationships that make the composition work:

- **Performance**: the chosen material really contains the expected speech, action and reaction.
- **Picture and coverage**: B-roll supports its passage, and its window carries the intended explanation or
  handoff.
- **Timing and motion**: cuts, caption Cues, motion states and effects land on the intended word, phrase,
  pause or clock event. Check the important internal events, not only the outer window: a scene may begin on
  the correct phrase yet show its payoff a word too early or late. Each handoff becomes perceptible through
  its entry, settling, activity and exit.
- **Shared layout**: a layout built for a passage stays coherent as its content changes. Check handoffs and
  filled states, so that replacing a card or ending a window does not release space the passage still needs.
- **Captions**: each distinct variant (a different speaker, placement, color, emphasis, Cue shape or motion
  setup) can be read, belongs to the speech, and leaves the intended faces and actions clear.
- **Typography and UI**: independent text has the right hierarchy, content, duration and relationship to the
  picture.
- **Composition**: every element has enough room, and the whole frame keeps the intended hierarchy.
- **Sound**: the voice is heard once, music and effects sit under it, fades start and end with the sound, and
  nothing clips or cuts off.

**Read geometry in three nested layers**: the canvas, the outer frame or background, and the inner content.
Check containment and capacity at each boundary before judging visual alignment. Crops, bleeds, overlaps and
lopsided balance that were chosen on purpose belong to the design as long as they serve it; measurement describes what happened,
and the picture decides whether it works.

**At visual handoffs, look at what actually shows on screen before the change, while it happens and once
it is done.** Cutting back to the speaker could well be deliberate; one stray frame of a third view
blinking between two others almost certainly is not. Trace
an unintended exposure to its owner: the element's window, source playback (`data-media-start`, or a source
that has run out), a fade's opacity, a wrapper's lifetime, or a spatial crop. The intended picture does not
always need a full-screen source; a handful of frames or a designed background can make it.

Repeats of one visual setup can share a judgment. A clear change in speaker, position, style, content
shape, behavior or surrounding composition is separate evidence.

**Compare a rebuild by function.** Use the reference's `ANALYSIS.md` and `TIMELINE.md` as a map of
questions, and compare the intervals that reveal the important relationships: a board building up, A-roll
cutting to B-roll, the caption system changing speakers, a motion reveal, an ending that answers the opening.
Dense adjacent frames establish motion and order; full-resolution frames establish text and geometry.

The target may deliberately change the people, product, brand, language or visual world. Compare whether
each transformed element plays an equally useful role, not whether the pixels match; where the Treatment
deliberately changes a role, the Treatment wins.

When the user supplied a person or product, compare each new appearance with those real references and the
intended camera view. Judge recognizable identity, appeal, and whether the new subject sits naturally in the
film; the dialogue, demonstrations and graphic details should all fit that particular subject.

Look closely at how every relationship plays out: an entrance should draw the eye, a hold should leave time
to read, motion should make the change understandable, and an exit should make room for what follows. Compare source and
target at the corresponding word or action, since a new voice can put the event at a different second. The
reference gives precise design evidence; the Brief and Treatment decide which choices belong to this film.

## Evidence: frames and grids

Writing an element does not tell you which seconds are worth looking at. Take seconds from something you can
locate: a word or segment in `timing/timeline.json`, an authored clock time, a second the user named, or a
render you have already read. Until then, the exact position is an open question.
`node <skill>/scripts/timeline.mjs show timing/timeline.json` prints every Cue with its seconds, and
`timeline.json` holds each unit's `start` and `end`.

Pick the view for the question:

| Question | Command |
| --- | --- |
| The state before, during and after an event | `node <skill>/scripts/render.mjs frames renders/draft.mp4 renders/<name>.png --at t1,t2,t3,t4 --width 360` |
| An overview of the whole film, one frame per second | `node <skill>/scripts/render.mjs grid renders/draft.mp4 renders/grid.png --every 1` |
| Every frame of one movement | `node <skill>/scripts/render.mjs frames renders/draft.mp4 renders/<name>.png --cols 6 --width 180 --at <times at 1/fps steps>` |
| Text, edges and geometry at full size | `node <skill>/scripts/render.mjs frames renders/draft.mp4 renders/<name>.png --at <t> --width 1080` |

To list every frame of a movement from 7.5 s at 30 fps:

```bash
node -e "console.log(Array.from({ length: 18 }, (_, i) => (7.5 + i / 30).toFixed(3)).join(','))"
```

Every cell is labelled with its time and is exactly the video at that time. Open the PNG and read the sheet
yourself.

**Read at the scale the question needs.** To understand a handoff, widen the span to include a few seconds
before and after. To understand motion, go frame by frame: easing, flashes, overlaps and one-frame gaps are
only visible at frame density. For small details, zoom in: caption glyphs, thin borders, cutout edges and
alignment are judged at full size, not in a 180-pixel cell. When comparing with a reference, compare the
corresponding events, since different performances put them at different seconds; frames of the reference
video itself are covered in [reference video](../2-plan/reading-references.md).

**Listen.** Frames have no sound and no rhythm. Play the draft MP4 for the affected passage and for the whole
film: voice level and clarity, music under the speech, effects landing on words, fades, and silence where
there should be silence. You can cut a short clip with sound from the draft for the user
([draft and final renders](render.md#draft-and-final-renders)).

A draft is always a render of the whole film. After a change, render a new draft and look at the same
seconds as before so the two can be compared directly.

## Where to fix it

Every fact has one owner. Fix it there and keep everything around it.

| What the review found | Where to fix it |
| --- | --- |
| The story, shot logic or visual system does not match what was intended | `TREATMENT.md` (change `BRIEF.md` only when the user changes the request) |
| A word, speaker or Cue break is wrong | `script.json`; re-take speech for segments whose spoken words changed, then rebuild the timeline |
| A generated image or video does not show what it should | its prompt file in `prompts/`, then `bibei.mjs image <name> … --replace` (or `video`; paid: confirm first) |
| A line's delivery is wrong (pace, emphasis, pronunciation, voice) | re-take that segment's TTS, then rebuild the timeline |
| Word times, segment placement or spacing are wrong | `timeline.mjs build` with corrected alignment, or `gap` / `start` in `script.json` |
| Layout, captions, motion, event timing, layering or mix levels | `composition/index.html` |
| A file's crop, trim, loop, speed, fade, ducking or cutout | the FFmpeg-processed file, rebuilt from the kept original |
| The page points at the wrong file or version | the `src` in `composition/index.html` |

Before changing anything, connect the problem to its consequence and to the improvement you expect. For
example: "the before-and-after prices vanish before the viewer can compare them; hold the settled pair
another second so the difference can be read", or "the chart leaves while she is still citing it; move its
exit to the end of that sentence so the evidence stays under the claim it supports". Fix the owning fact and
keep the rest. Render a new draft, look at the affected span and its handoffs at the same seconds, then judge
it in the whole film. If it did not improve, re-examine your explanation before the next adjustment.

Rebuilding the timeline moves every word-timed event with its words; seconds written literally in the page
do not move. After a re-take or a `script.json` change, re-read the passages that use literal seconds.

Composition changes never need new paid media: reuse the accepted images, video and speech, and render
again. Asking for different generated media is a production decision; list the items and their cost to the
user and confirm before requesting ([before paying](../3-materials/generation-requests.md#before-paying)). When a request is
replaced, `bibei.mjs` keeps the earlier file ([reuse, versions and failures](../3-materials/generation-requests.md#reuse-versions-and-failures)).

## Review with the user

When the user is collaborating, show the actual composition as soon as a meaningful passage has been
rendered. Point to the passage, object or transition under discussion and its seconds, so the user can give
specific direction. Keep moving on choices already settled; showing progress does not have to become an
approval gate. Use the prepared production media, and say which passages are composed and which are still
placeholders. A frame sheet or a short clip often answers the current question more directly than the whole
film.

When you show an intermediate result, say what it is for, what it already achieves, and what significant
work remains to reach the Brief. Make the current scope clear so the user's direction is useful, then carry
on within the agreed delegation. A storyboard can settle framing, for instance, but only the produced
performance shows how the person actually moves and speaks.

**Timestamped notes.** The most useful feedback is one second plus one change:

- "0:07 — the price tag pops in before she says 'nineteen'; let it land on the number."
- "0:21 — the map covers her face; move it to the top half."

Invite notes in this form when you share a draft, then handle each one in a loop:

1. Render frames at that second (and around it) from the draft the user watched, so you see what they saw.
   Read the second together with the words spoken there; after a re-take the same words may sit at a
   different second.
2. Say what will change and where ([where to fix it](#where-to-fix-it)). A change of visual style,
   choreography or graphic structure usually needs page code or new direction; a position or a color is one
   value in the page.
3. Apply the change, render a new draft, and render frames at the same second (or the new second of a word
   that moved).
4. Show the user before and after at those seconds; add a short clip when the point is motion or sound.

Keep the notes and their status in `PROGRESS.md`, and write lasting directing decisions into `TREATMENT.md`.
The notes themselves are the review conversation.

Open the review in the user's language: say what is ready, invite timestamped notes, and say whether the
final render waits for their review or is already covered by their request. For example:

> The full draft is ready (48 s). The opening comparison, the three ranked picks and the closing card are
> all composed with the final voice; the product shots are the generated versions. If anything should
> change, send me notes as a time plus the change, like "0:12 — hold the price longer". Once you're happy
> I'll render the final file.

Treat this as a way of working together rather than a required sign-off. When the user has asked for the
finished file, they have already made that call.

## The finished work

The film is ready when layout, legibility and timing carry the Brief and Treatment clearly and strongly.
Keep going while a change improves what the film says; deliver when it works.

Render the final at `standard` (or `high`); it must pass the [delivery checks](render.md#delivery-checks)
and write its `.report.json`, and only a film with that report is delivered. Check the file
([deliverables](render.md#deliverables)), watch and listen to it once from start to end, and confirm
that every word you hear is the word the captions show (when you cannot play audio, run the objective
checks in [deliverables](render.md#deliverables) and tell the user the sound has not been listened
to, asking them to play it once). When you deliver, hand over the report with the film, name any
deviation it lists and who approved it, and explain the important choices and any material limits: for example, caption timing that is estimated rather than measured, generated shots that
only approximate the reference, or a font substituted on this machine.

With the video, point out specific things the user can still change easily, because the production stays
editable: a reveal bound to a word, the caption style, the music level. Each lives in one place
(`script.json`, `composition/index.html`, a prompt file) and needs only a new render. What to hand over when
the user wants to keep editing on another machine is in [project files](../2-plan/project-layout.md).

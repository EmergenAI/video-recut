# Presenter-led explainer

Read this when a spoken performance carries the explanation while demonstrations, comparisons and
motion graphics develop most of the visual argument.

The presenter can fill the frame, share it, shrink to an inset or leave for a while. The difficulty
comes from several relationships evolving at once, not from the number of effects or layers. When no
visible speaker delivers the voice, read [narration-led demo](narration-demo.md); for a presenter
who mostly holds the frame alone, read [talking head](talking-head.md).

## Follow the argument through objects that persist

Settle first what the viewer should understand and how the picture will make it understandable.

Example (invented): a piece on getting around a city. It opens with two cards, "rent a bike" and "buy
a bike", side by side. As the presenter weighs each, both stay visible; the one under discussion
lifts, the other dims but keeps its place. Then a third card, "bike subscription", slides in between
them and pushes them apart, changing their relationship. The persistent cards become the viewer's
memory of the argument. Their entry, movement, resting state and exit all carry meaning.

When a reference video informs the work, read it with a grid linked to the transcript so speech and
picture are read together ([reference video](../2-plan/reading-references.md)). Set the range and
sampling interval around the question you are investigating: a whole segment to see the argument, a
short handoff to see whether an object is replaced, moved, cropped or covered. Let each observation
revise your overall reading, and share it with the user as you go. A list of nouns on screen misses
the behaviour worth recreating.

Express the useful relationship with the target work's own subject and evidence. A failure needs an
attempt and a felt consequence. A "reuse" claim needs a recognisable structure whose content changes
while the useful behaviour stays. Exact wording can stay in captions while objects act out the
meaning; graphic text has its own job (labels, numbers and comparisons that help the demonstration
read).

## Performance and presentation combine independently

Speech segments on the timeline supply the performance, the media and the word times. Inside one
segment the layout can change several times. A new layout usually needs only a change of
presentation; different lines or a different performance beat may need new material. One scene can
also span several segments. Segment boundaries do not dictate scene boundaries or cuts.

The presenter footage is material in a changing picture. It can fill the frame, appear in several
places, join a comparison, and disappear while the argument continues. On the page this is one footage
layer whose frame, crop and opacity the timeline changes, or several layers reading the same file.
Visual emphasis follows whoever or whatever carries the idea now, including a return to the presenter
for a reaction or a direct address to the viewer.

Two ways to change how the viewer meets the same performance (invented):

- The full-frame presenter eases down into a small corner window as a flow diagram grows across the
  canvas.
- A hard cut from the original camera view to a cutout of the presenter standing beside a bar chart,
  pointing at the tallest bar.

Both keep the accepted performance and change only its presentation. A semantic event drives the
change; whether it cuts, moves, holds or fades is this work's own rhythm. Full frame, inset and cutout
are appearances, not separate production pipelines.

When motion graphics cover the presenter, the voice is still its own `<audio>` layer; covering the
picture does not silence the sound. Truly independent narration is a
[narration-led](narration-demo.md) relationship. A montage or a wordless ending can occupy ordinary
time outside any speech segment: the timeline holds word-anchored events and independently authored
ones side by side, with no invented performance needed to make room.

## Direct the footage for how it will be used

When the footage will fill the frame most of the time, generate it in the final shape. Bibei accepts
the video ratios 9:16, 3:4, 2:3, 4:5, 16:9, 4:3, 3:2 and 5:4 at 768p or 480p, but the MiniMax H3 workflow
outputs only portrait or landscape, so treat any other target (including square or 21:9) as portrait
or landscape cropped in the composition ([bibei models and
limits](../3-materials/generation-requests.md#bibei-models-and-limits)).

Plan ahead for the body, gestures, setting and detail the changing picture will need. A later inset or
odd-shaped viewport can sample the same source; the target shape alone does not decide the source
ratio. A tightly cropped source cannot later supply hands or setting. Choose the source view from the
work's actual visual needs across the whole piece.

Recurring graphics and source composition support each other. Translate the plan into concrete camera
requirements in the image request: the presenter to one side, enough body in frame, room for gestures,
a specific camera distance ([image direction](../3-materials/images.md)). The later motion graphics,
editorial copy and the explanation's metaphors stay in their own layers; the image request describes
only the picture to generate.

A cutout is useful when you need the presenter's silhouette; keep the opaque original when the real
setting matters. Keep processed versions beside the original
([cutouts and transparency](../3-materials/media-prep.md#cutouts-and-transparency)); the visual use can
change while the performance stays the same.

A presenter shot is at most 15 seconds, so a long explanation is several shots. Each uses the same
presenter image and that segment's speech file as reference audio; the cut between shots is an ordinary
edit seam that a layout change can hide or embrace ([talking head](talking-head.md) covers shot
patterns).

The segment's TTS file is the one sound of record, and the generated clip plays muted over it. Test
one short shot muted against its speech file first. If the test shows the clip's own speech is better,
extract it as that segment's audio, align it and rebuild the timeline; never keep both
([route the voice once](../4-compose/sound.md#route-the-voice-once)).

## Events need meaning, transitions need duration

Name in the script the spoken idea that drives each change: the word span or moment it answers. Resolve
it to seconds from `timing/timeline.json` and place the event there
([place events by relationship](../4-compose/timing.md#place-events-by-relationship)). That settles
why it happens here. Local durations and easing settle how it unfolds. One phrase can start a motion
that continues into the next; a resting state can stay useful long after its entry finishes.

Design each handoff from the states on both sides: what stays, and where attention lands. A hard cut is
a `tl.set` of the new state at the event. When the viewer should see a continuous transformation, a
short tween joins two longer treatments without changing the underlying footage. At the endpoints,
match viewport geometry and source crop together. Layers at the same instant are still independent:
when one replaces another, the timeline must hide the old state explicitly
([events, lifetime and state](../4-compose/scenes.md#events-lifetime-and-state)).

## Choose the visual language, then complete its system

Turn the intended mood into palette, type, edge treatment, depth, texture and motion, and judge them
together on a representative passage with real footage in it. Changing style moves all of these at
once: recolouring a glossy interface may keep its old mood.

Put accepted shared decisions into shared CSS variables, shared prompt wording or shared script
functions so related scenes evolve together. The specific colours and effects belong to this work's
Treatment.

Choose an implementation that expresses the target look well. A chalkboard look may suit a short
sequence of hand-drawn frames swapped on the beat; a frosted-glass dashboard may need real layered
elements with blur and depth. A reference supplies a look and behaviour to understand, not a required
implementation ([graphic compositions](../4-compose/graphics-layout.md),
[motion graphics](../4-compose/motion.md)).

When simplifying, keep the details that make a scene believable. Removing a redundant title changes
the layout left behind; a folder still needs readable contents; a terminal the voice describes needs
visible activity. A demonstration needs both an entry and a designed hold.

## Organise behaviour at a useful scale

Keep apart contributions that have independent reasons to change; keep together those that share
geometry and motion (a pointer, the object it drags, the target position). Plain functions can organise
the code without each becoming its own layer or file; a shared palette has code users but is not a
visible object.

Expose the inputs production actually adjusts: chosen footage, meaningful events, useful presentation
choices ([controls worth exposing](../4-compose/scenes.md#controls-worth-exposing)). A one-off
scene can keep fixed internal sizes and artwork. Caption position and colour can be named constants at
the top of the page, while redesigning an illustrated editor belongs in its markup and code.

Every frame describes the current state, before and after each event. The renderer seeks a paused
timeline to each frame, so state may depend only on time: tweens and `tl.set` at exact seconds, never
accumulated side effects. Linked motion derives from a shared layout; when a target moves, the
pointer's end point moves with it ([scene design](../4-compose/scenes.md),
[composition page](../4-compose/page.md)).

## Advance through visible feedback

A screen passage may show genuine interface evidence, an authored explanation, or
a mix of the two ([screen demonstrations](../4-compose/screen-demos.md)). Direction for generated material and its
references belongs to the craft pages ([formats index](index.md)).

While the design develops, review useful passages inside their surrounding composition: render a
draft, read the frame sheets around each event and handoff, and state what the passage demonstrates
and what it is still doing. A user's timestamped note may carry a change of visual idea that no single
constant can express. Trace it to the responsible script segment, prompt file, material or scene code;
the timestamp locates the evidence, but the change may reach a system that runs through the whole work.

When revising the composition, reuse the same request names so accepted generated material is kept
and not paid for again. The review loop belongs to [review](../5-deliver/review.md); draft and final
renders and deliverables belong to [render](../5-deliver/render.md).

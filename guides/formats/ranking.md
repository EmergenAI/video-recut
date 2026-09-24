# Ranking and listicle

Read this when the work argues by comparison: a board keeps earlier verdicts on view while the
person, evidence and performance of the moment make the case for the next.

A ranking can combine with a UGC-style presenter ([talking head](talking-head.md)), independent
narration or any other presentation.

## Let the board's state tell the story

Choose which results are fixed before the film starts and which ones the viewer sees get decided. A
partly filled board suggests a ranking in progress: preset entries hold their places from the start,
and each speech segment introduces the entry being judged now.

On the page the board is one HTML scene: markup for frames, rows and slots; CSS for its look; timeline
calls for every change ([scene design](../4-compose/scenes.md)). Keep four things distinct:

| Part | How it is written |
| --- | --- |
| The board's own window | The time the scene exists: a timed layer with `data-start` and `data-duration`, or a standing element whose opacity the timeline raises and lowers |
| Preset entries | Part of the initial state, written in the markup, visible from the board's first frame |
| Newly placed entries | Enter at an event: the word or moment in the script where the verdict lands, resolved to seconds from `timing/timeline.json` |
| The result | The board holds each result until a later event changes it |

Each state change is a `tl.set` at that word's time, or a short tween that settles: an icon drops into
a row, a row lights up, a counter advances. Nothing removes the entry when the sentence that placed it
ends. It stays because no later call takes it away, so every frame is a function of time, and seeking
to any second shows the board as far as the argument has built it
([events, lifetime and state](../4-compose/scenes.md#events-lifetime-and-state),
[place events by relationship](../4-compose/timing.md#place-events-by-relationship)).

Example (invented): a tier board of breakfast cereals, S to D. Two cereals already sit in B and D when
it opens. Segment s3 judges a honey-oat cereal; the icon drops into A on the word "solid", and the A
row glows for half a second on the same beat.

## Lay out the person and the argument together

Reserve space when the presenter is drawn. One possible layout (invented): the presenter on the left
third, the icon being judged floating on the right at shoulder height, the board across the lower half.
Other rankings may need other layouts. Balance an off-centre presenter with detail in the setting so
they do not look shoved aside by the graphics.

The voice supplies attitude and reasoning; captions follow reading rhythm
([captions](../4-compose/captions-style.md)). Still or moving B-roll illustrates a joke, comparison or claim over
the word span it answers ([b-roll](../4-compose/supporting-footage.md)). The board must stay readable as inserts come
and go.

The board's own sounds (a drop, a slide) are events too: at the same second as the state change they
answer, as an `<audio>` layer, placed once ([music and effects](../4-compose/sound.md#music-and-effects)).
Extra sound layers are for different sounds, not accidental repeats of an event the board already
answered.

When the presenter speaks on camera, the segment's TTS file is the one sound of record and the
generated clip plays muted over it. If a short test shows the clip's own speech is better, extract it
as that segment's audio, align it and rebuild the timeline; never keep both
([route the voice once](../4-compose/sound.md#route-the-voice-once)).

## Give every image an informational role

An icon might identify the real thing being ranked, establish the opening board, carry a new subject in
an adaptation, or turn a comment into a visual gag. Decide first what the viewer must recognise or
believe, then how to make it.

- When the exact current identity, wording, version or factual authority matters, use supplied or found
  material and record its source and any relevant terms of use.
- When the need is a recognisable visual meaning (a familiar person, company, product, app, meme or
  public symbol), a well-read image model can draw it. Attach an exact reference when the model cannot
  reliably hold a key fact.
- In a recreation, keep what the icons did and the recognisability the original relied on. In an
  adaptation, the new subject may need entirely different icons.

Whatever the source, check identity, exact version, resolution, crop, margin and transparency at the
final display size. The composition reads the chosen file from `composition/assets/` or
`composition/generated/`; choosing it is a one-time creative decision, and every later render reuses
that file.

Supporting B-roll has a different job. A generated comedy insert interprets a comment, while an icon
identifies an entry. Each insert picks the visual language its joke needs (a parody interface, a
dramatic still) and need not inherit the presenter's phone-camera description. A factual screenshot or
product proof gets its authority from the fact it shows.

## Choose the form the argument needs

A tier board, an ordered list and a comparison chart have different states and motion. Build the one
the argument needs as its own scene rather than bending an unrelated layout: a tier board needs rows
that receive icons; an ordered list needs positions that shift when a new entry is inserted; a chart
needs values that grow.

If an earlier production already has a close board, reuse its markup and code and change only what
differs ([find what already exists](../4-compose/scenes.md#find-what-already-exists)).

Review the claim on screen, the icon's movement, the board and the supporting image as one unit. They
can strengthen each other in time even when they do not begin on the same frame. Use one instant when several
layers truly represent the same event; use a word span when a passage owns an interval.

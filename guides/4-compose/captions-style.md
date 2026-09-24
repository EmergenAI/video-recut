# Captions

Read this when deciding how the film's captions read and look: where Cues break, how each language
groups its words, what gets emphasis, how lines sit in the frame and what style carries them. How the
page builds Cues, spans and style windows is in [captions-build.md](captions-build.md).

## Decide what is a caption

A caption shows the words being spoken, while they are spoken. Two tests decide it: the words match
the speech, and they appear with it. Size, decoration and position do not decide it.

- A huge animated word that lands as the speaker says it is still a caption.
- A phrase that was spoken but stays on screen long afterwards as a chapter heading has become
  typography.
- A standalone title, a lower third, a label or an editorial paraphrase is its own text or
  motion-graphics layer, not a caption.

Judge by the role the text plays in this film, then give it the matching owner.

## Displayed text and spoken text

The `text` of a `script.json` segment is what the viewer reads. It may deliberately differ from a
verbatim transcript. For example, the speaker says "twenty twenty-seven" and the screen shows `2027`;
the speaker says "about thirty percent" and the screen shows `~30%`.

- When the TTS voice needs another spelling to pronounce a word correctly, send that spelling to the
  segment's TTS request and keep the display spelling in `text`. Save what you actually sent in
  `prompts/<id>.speech.txt`.
- `timeline.mjs` always displays the script's words and takes only time from alignment. Its
  character matching tolerates differences; units it cannot match get interpolated times. After a
  build, run `timeline.mjs show timing/timeline.json` and look at the units around any respelled word
  in `timing/timeline.json` (their `source` reads `interpolated`).
- Leave out of `text` whatever is spoken but should not be shown: filler words, laughs, sounds.
  Alignment skips the extra characters. Nothing on the page can then refer to those words.
- Choosing and declaring fonts for Chinese, Latin and mixed lines is covered in
  [Text and fonts](page.md#text-and-fonts).

## Direct the captions for this film

- Study what captions do in the reference: how they group words, where they put emphasis, how they
  show who is speaking, what they avoid covering. Carry those relationships over when they serve the
  Brief, not the exact pixels.
- Switching to another language, performer, product or tone may justify changing the face, the grouping,
  the position or the motion. Start from the meaning of the new script and the film's overall character, and write the
  decision into `TREATMENT.md`.
- Quick changes suit a punchline. Longer phrases let an explanation breathe. The reference, the
  language and the energy decide; there is no fixed Cue length and no single right look.
- Reading phrase, layout and emphasis are decided together but stay separate jobs. A meaningful
  phrase can wrap onto two lines. A line can stay visible while the current word changes color.
  Hiding captions during a demonstration changes presentation only, never the script or the speech.

## Where words and times live

| Fact | Owner |
| --- | --- |
| Displayed words, speaker, `\|\|` Cue breaks | `script.json` (no seconds in it) |
| Spoken start and end of every unit; Cues grouping units | `timing/timeline.json`, loaded in the page as `window.TIMELINE` |
| How the timed units look and move | The page (CSS and timeline code) |

- Build the caption from those timed units. Do not retype the words into a separate text layer to get
  a particular shape.
- Time the captions against the speech file actually placed in the film. If the audio changes (a new
  take, a different speed, a cut), run `bibei.mjs align` again and rebuild the timeline. A purely
  visual change (a new style) touches only CSS and timeline tweens and reuses the same speech,
  alignment and `timeline.json`.
- Without an alignment file the timeline marks a segment `estimated`. Measured times come from Bibei
  alignment or from the word boundaries the speech tool itself reports; if it reports them, convert
  them before settling for estimates. If the design depends on exact word-by-word highlighting and
  neither is available, tell the user
  (see [Alignment](../1-setup/services.md#alignment)).

## Cue rhythm

A Cue is one timed block of displayed speech. How it looks is up to the composition.

- Every segment boundary starts a new Cue. `||` in `text` forces another break inside a segment.
- Without `||`, `timeline.mjs` splits long passages after sentence ends and then at clause
  punctuation, at about 14 CJK characters (16 for Korean, about 28 Latin characters). Write `||`
  where the meaning wants a different break. Once a segment has any `||`, it splits only there and
  where a Cue runs long.
- Changing style mid-Cue keeps the whole Cue and every word's timing. Visual wrapping is not a Cue: the
  page can wrap one Cue over several lines without any `||`.
- Group by language and picture. One Cue should carry a coherent phrase or thought the viewer can read
  while still watching the performance. Keep dependent words together. Give a punchline or a contrast
  its own Cue when the separation does visual work.
- Never split: a name, a negation and what it negates, an article and its noun, a preposition and
  its object, a phrasal verb, a number and its unit.

## Each language reads in different units

The smallest timed unit is a word in English and a single character in Chinese; the timeline builds
units that way. Chinese therefore gets character-accurate highlighting, but a Chinese Cue still carries
a meaningful phrase and can hold more units than an English one. Set Cue length by meaning, reading
time and the width the actual face takes, never by a fixed count. To judge whether a Cue fits, measure
the displayed text, not the unit count.

| Writing | Keep together | Watch for |
| --- | --- | --- |
| English | Useful phrases: articles, negations, names, quantities | Word lengths vary; the face and box width matter more than word count |
| Chinese | Compounds, names, modifiers with what they modify | A short complete clause may share a Cue; chopping into tiny groups fractures meaning and picture |
| Korean | The author's word spaces; grammatical phrases read as a whole | `3개월` and `3 개월` are two spellings; layout follows the one written |
| Mixed Chinese and Latin | Judge the whole phrase together | One Latin brand name or number may be as wide as several Han characters, so counting units says little about width |

**Spaces are authored.** The timeline keeps the spaces written in the script (each unit records the
space before it) and adds none. A boundary between Han and Latin, or a digit and a letter, does not
become a gap by itself. Write the space where you want one; leave it out for joined text.

| Script text | Screen |
| --- | --- |
| `新版 App 下周上线` | spaces around `App`, as written |
| `新版App下周上线` | joined, as written |
| `오늘 딱 5분만 투자하세요` | Korean word spaces kept; `5분` joined |

On the page, a space's width comes from the face and CSS `word-spacing`; `letter-spacing` adjusts
tracking. The unit spans must sit in an inline line with `white-space: pre-wrap` or the spaces
disappear ([Spacing and CJK text](captions-build.md#spacing-and-cjk-text)).

## Emphasis is separate from grouping

The same timing data supports several readings:

- a **stable full Cue**: the phrase sits still, easy to read while the viewer watches a detailed
  demonstration;
- a **current word** changing color: the line responds to the delivery;
- a **trail**: words stay lit once spoken;
- a **whole-phrase response**: a name or a punchline gets one visual accent.

Pick by the viewing rhythm. Word timing stays available even when the whole line never moves.

How the page does it (all by operating on unit spans on the timeline):

- Trail: set each unit to the spoken color at its `start` and leave it.
- Current-unit highlight: when the next unit starts, return the previous one to the resting color.
- Step versus wipe: a `tl.set` at the unit's start lights the whole unit at once; a wipe sweeps
  through the glyphs, for example by tweening a gradient position over the unit's own duration.
- Every variant follows each unit's own spoken time, including uneven delivery and pauses. A longer
  Cue changes the reading group, not the word times.

**Whole-group response.** When a compound, a name or a set phrase should respond as one, wrap its unit
spans in one element on the page and apply the highlight, underline or active box from the first
unit's start to the last unit's end. Each character keeps its own time inside. A Cue can mix such
groups with ordinary units. Use this only for a deliberate whole-phrase treatment; there is no need to
group every Chinese word. Page groups never create Cues; only `||` changes what is read together.

**Appearing is not the same as lighting up.** The whole Cue can be readable from its start while color
supplies emphasis; or each unit can appear at its own start (opacity set from 0); or a long Latin word
can type on grapheme by grapheme across its interval. A word that the TTS pronounced from another
spelling is still one timed unit on screen. Code patterns are in
[Word-by-word presentation](captions-build.md#word-by-word-presentation).

## Line layout serves the picture

- **Single line**: gives a run of short Cues one steady reading position. Control it through grouping,
  size, available width and spacing together.
- **Multi-line**: when a complete thought needs room, wrap the same Cue within the caption box width.
- **Keyword plus support**: an oversized keyword laid out on its own with smaller supporting words is
  a different layout, built from the same units.
- A visual line break alone is never a reason for `||`.

The same thought in three languages, each cut where its own phrases fall. These are alternative
script fragments for three versions of a film, not a bilingual performance; each would sit in its
own `script.json` with its own `language`:

```json
{ "id": "s4", "speaker": "host",
  "text": "Most people give up on a new habit || in the first week, || not the first month." }
```

```json
{ "id": "s4", "speaker": "host",
  "text": "大多数人放弃一个新习惯，||不是在第一个月，||而是在第一周。" }
```

```json
{ "id": "s4", "speaker": "host",
  "text": "새 습관을 포기하는 사람 대부분은 || 첫 달이 아니라 || 첫 주에 그만둬요." }
```

And a mixed Chinese-English line, with the author's spaces around the Latin words:

```json
{ "id": "s5", "speaker": "host",
  "text": "我用 Notion 记了三十天，||结果 streak 断在第 6 天。" }
```

A narrower box or faster delivery can move these breaks; the principle is that each Cue is a phrase a
viewer reads in one glance.

**Counted lines.** If the style deliberately wants a fixed number of characters per line, insert the
line breaks on the page by counting units, not in the script. Do not do this for normal width-driven
flow. Counting lines does not squeeze an overlong Cue onto one physical line; fix that with `||` or
size.

## Captions in the film's visual language

- Choose face, size, width, line height, contrast and motion together. When a Cue overflows, check the
  script grouping and the actual CSS; either can be the cause.
- How long a Cue lingers before and after its words decides its visibility; the highlight follows unit
  times.
- Judge weight, outline and shadow on the real glyphs, over the moving picture, at delivery size. A
  thick outline (`-webkit-text-stroke` with `paint-order: stroke fill`, or stacked `text-shadow`) gives
  a lively caption shape and separation; a tight shadow suits a quiet treatment. As weight rises, keep
  the counters of dense characters open. The right strength depends on face, size, background, style
  and language.
- Text and decoration can share a palette without coloring every word differently: a two-tone
  underlay, a shape behind the line, an offset shadow tie the caption into the film. Build text and
  its decoration as one caption element with its own CSS, so the decoration's extent, position and
  motion answer the words it supports.
- Compose captions, icons, flashes and other graphics as one picture. A speaker color and an answer
  accent can work together without matching. Check legibility on light and dark frames. Do not cover
  an important face or product. When following a head, leave room above it for the whole Cue, not
  only the anchor point.
- Normal placement: a steady reading zone, or a position that responds to the composition without a
  face box. Use [caption tracking](captions-follow.md) only when the user's reference clearly has
  captions following a head, or the user asks for it. A visible face is not a reason.

## Structure, treatment, parameters

| Layer | What it is | Where it lives |
| --- | --- | --- |
| Structure | The visual relationship the captions express: evenly flowing words, a phrase laid out independently, a shape attached to a speaker | The caption layer's markup and how the page builds it from the timeline |
| Treatment | One coordinated look inside that structure | A set of CSS classes (face, color, box, motion); can switch by speaker or time span |
| Parameters | The concrete decisions inside a treatment | Position and anchor, available width, wrapping, typography, color and box, current-word response, Cue motion, reveal, lead and hold |

Craft decides how the combination serves picture and reading rhythm; CSS and timeline code implement
it. Keep a proven treatment as a named set of classes in the composition so one edit changes it
everywhere, instead of scattered one-off values.

Every timeline segment carries `speaker`, so the page can give each speaker its own class with the
script and times unchanged. A treatment can switch mid-Cue, or hide for a time window (class or
opacity) during a demonstration, while the Cue content stays whole
([Style windows and hiding](captions-build.md#style-windows-and-hiding)). Keep one reading of
the script across speakers and treatments: a different color never needs a different transcript or
separately invented times.

## Start from the example or build a new structure

UGC, podcasts and interviews can start from the
[worked example](captions-build.md#worked-example): one element per Cue, one span per unit, a
settled face, a positioned box, a word highlight, a short hold after the last word. Add speaker
classes to tell host from guest. A tracked head can supply a moving anchor without changing words or
times.

A new visual relationship is ordinary page work: words arranged around a keyword, several people's
phrases in one shared composition, words and a graphic designed as one visual event. The timeline's
units and Cues supply words and time; the page decides presentation and motion, even for a layout used
once.

Element boundaries are free too. Captions that behave independently stay an independent layer. Words
and graphics whose layout or motion depend on each other can share one element and read the same
units. "Caption" names the relationship between displayed speech and performance; it does not demand a
separate layer or a particular look.

## Review in the actual composition

- Render a draft. Use `render.mjs frames <video> <out.png> --at …` at chosen seconds to check the real
  glyphs, spaces, outlines, decoration, wrapping and neighbouring states
  ([Evidence: frames and grids](../5-deliver/review.md#evidence-frames-and-grids)).
- Watch the draft with sound. Judge reading rhythm, emphasis, who is speaking, transitions between
  Cues and how any tracked motion relates to the voice. Check the final encoded file before delivery
  too.
- Too many small changes make the viewer hunt for the words again and again; overfull blocks load one
  picture state with too much.
- Fix at the owner: the reading units need another break → edit `||`; the units are right but size,
  wrapping, position or motion is wrong → edit CSS; a different structural relationship is needed →
  write a different caption layout on the page. Check against the real speaking speed and the picture,
  including entrances and exits.

# Script, timeline and event timing

Read this when writing or correcting `script.json`, building the timeline from speech, placing segments
with gaps or overlaps, deciding when a layer or event happens, or judging whether estimated word times
are good enough. The creative calls (what passages there are, where Cues
break, which words carry the meaning) are made in [Script and time](../2-plan/script.md). [Captions](captions-build.md) owns showing the
words; [the composition page](page.md#load-the-timeline) owns loading `timeline.js`.

## The formal script

`script.json` is the production's formal script: the words as they should be displayed, divided into
performable segments, each with its own speech file.

```json
{ "language": "zh",
  "segments": [
    { "id": "s1", "speaker": "narrator", "text": "其实我很贪恋你，||主动找我的时刻。",
      "audio": "composition/audio/s1.wav", "alignment": "composition/generated/s1.alignment.json" },
    { "id": "s2", "speaker": "narrator", "text": "因为只有这样，我才敢确定，我没有打扰到你",
      "audio": "composition/audio/s2.wav", "alignment": "composition/generated/s2.alignment.json",
      "gap": 0.5 },
    { "id": "s3", "speaker": "guest", "text": "Hi, I'm OK — 2 AI tools.",
      "audio": "composition/audio/s3.wav" }
  ] }
```

| Field | Meaning |
| --- | --- |
| `language` | The spoken language code (`zh`, `en`, `ko`, …); it also sets the Cue length for automatic splitting. |
| `id` | A unique segment name. The page refers to words by this id; keep it stable across revisions. |
| `speaker` | Who speaks the segment. Captions and scenes can style or place by it. |
| `text` | The words as displayed, with authored spaces and punctuation. `||` marks a Cue break. |
| `audio` | This segment's speech file. It must exist before the timeline is built. |
| `alignment` | Optional: the segment's alignment result. Without it, word times are estimated. |
| `gap` | Optional: seconds of silence before this segment (default `--gap`, 0.25). |
| `start` | Optional: pins the segment at this film second. |

Paths resolve from the folder holding `script.json`. Speech must live under `composition/` so the
renderer can load it. Other fields are ignored and are not carried into the timeline.

A segment is a performable passage with its own speech file. It need not equal a camera shot or a
speaker turn, but it has one `speaker`. When one generated performance carries a whole exchange, you can
keep it as one segment, or cut its extracted audio at the pauses into one file per turn
([cut and keep intervals](../3-materials/media-prep.md#cut-and-keep-intervals)) and pin each turn's segment with `start` at
the video's placement plus the turn's offset; captions and scenes then know who speaks each line.

**Display units.** `timeline.mjs` divides `text` into units: one CJK character, or one Latin or number
word with the punctuation attached to it. `"我才敢确定 AI 没有"` gives `我` `才` `敢` `确` `定` `AI` `没`
`有`, where `AI` and `没` each carry a leading space. Punctuation joins the unit before it. These units
are what captions light up and what the page refers to by index.

**Cue breaks.** `||` hands the caption to a new Cue between two units; it contributes no text. Use it for
meaningful reading phrases. Without `||`, long passages split after sentence ends and clauses at about 14
CJK characters (about 28 Latin characters). Once a segment has any `||`, its Cues split only there and
where a Cue runs long.

**Spaces are display information.** Write them exactly as they should appear: none between Chinese
characters, a space between English words, and in mixed text the spacing your caption style chooses.
Do not add spaces to make anything parse and do not strip authored ones. [Spacing and CJK
text](captions-build.md#spacing-and-cjk-text) owns the conventions.

**Display versus speech.** `text` is what the viewer reads; the words sent to the TTS service can differ
when pronunciation needs it (a letter name, a number read out, a coined name). Keep the text actually sent
in `prompts/<id>.speech.txt`. Alignment then matches the displayed text against what was heard: small
differences are tolerated and those units are interpolated; large differences lower measured coverage.
A spoken phrase that should never appear in captions can be left out of `text`; alignment ignores the
extra speech, but nothing in the page can then refer to those words.

## Speech timing from alignment

For each segment with speech, `bibei.mjs align` produces an alignment file: a WhisperX-compatible result
with per-word (for Chinese, per-character) start and end times inside that speech file
([speech](../3-materials/generation-requests.md#speech)). A speech tool that reports word boundaries while synthesizing gives
the same thing without Bibei: convert its boundaries to `timing/<segment id>.alignment.json` in the
minimal form `{ "segments": [ { "words": [ { "word", "start", "end" } ] } ] }` (or top-level `words`),
seconds from the start of that segment's file, one character per word for Chinese
([Alignment](../1-setup/services.md#alignment) has the format and the checks). `timeline.mjs` uses
either only for time. The displayed words always come from `script.json`.

It matches the script's characters to the heard characters in order, tolerating misheard, missing and
extra characters. A unit matched to heard speech is `measured`; a unit with no match takes a share of the
time between its timed neighbours, weighted by length and punctuation, and is `interpolated`. Units never
start before the previous one. The segment's `coverage` is the measured fraction.

A build warns when a segment's coverage is below 60%: the speech probably does not follow the script.
Listen to it. Fix the text if the script is wrong, or render the segment's speech again if the voice
misread, then align again (`--replace`, since the speech changed) and rebuild. Do not accept captions
that disagree with what is heard.

## Build the timeline

Run from the production folder after every change to `script.json`, a speech file or an alignment:

```bash
node <skill>/scripts/timeline.mjs build script.json --js composition/timeline.js
node <skill>/scripts/timeline.mjs show timing/timeline.json
```

`build` writes `timing/timeline.json` and, with `--js`, `composition/timeline.js`, which sets
`window.TIMELINE` to the same object with audio paths relative to `composition/`. It prints one line per
segment (start, speech length, `aligned` with its measured percentage or `estimated`, units and Cues) and
the total duration. `show` lists every Cue with its film times. Never edit either output by hand.

```text
{ format, language, duration,
  segments: [ { id, speaker, audio, start, end, audioDuration, timing: "aligned" | "estimated", coverage,
                units: [ { space?, text, start, end, source: "measured" | "interpolated" | "estimated" } ],
                cues:  [ { text, start, end, units: [from, to) } ] } ] }
```

All times are film seconds. A Cue's `units` is a half-open index range into its segment's `units`.

**Placement.** The first segment starts after `--lead` (0.3 s). Each later segment starts `gap` seconds
after the previous segment's speech file ends: its own `gap`, or `--gap` (0.25 s). A segment with `start`
sits at that film second, and the segments after it follow it. The film ends `--tail` (0.6 s) after the
latest speech ends.

```bash
node <skill>/scripts/timeline.mjs build script.json --js composition/timeline.js --gap 0.4 --lead 1.0 --tail 2.0
```

- **A pause for the picture.** Give the following segment a larger `gap`: a reveal, a breath, a product
  shot with no words.
- **Overlap.** Pin a segment with `start` earlier than the previous one's end: an interruption, a reply
  over a laugh. Both files play; the page decides how they appear and sound.
- **A fixed-time line.** Pin with `start` when a line must land at a known film second, such as on a music
  downbeat.
- **A wordless passage** (someone dancing, a silent product shot) is not a segment: `timeline.mjs`
  requires words. Leave room with `gap` or `start`, and author the picture there on the program clock.

The segment's `start` is where its speech file begins, including any leading silence in the file. Trim
padding from speech rather than compensating with placement.

**Length.** The film lasts `duration` from the timeline, and the page ends its GSAP timeline there
(`tl.set({}, {}, T.duration)`). For an ending that runs past the speech, raise `--tail` or end the page's
timeline later. For a piece of fixed length, set the length in the page and check that the speech fits:

```js
var DURATION = 30;
if (T.duration > DURATION) throw new Error("speech runs " + T.duration + "s, longer than " + DURATION + "s");
tl.set({}, {}, DURATION);
```

A motion-graphics piece with no speech needs no `script.json` or `timeline.mjs` at all: set `DURATION` in
the page and place every event on the program clock ([durations for authored
animation](#durations-for-authored-animation)).

## Place events by relationship

Choose time from the relationship the event has to the work:

- **A word.** A reveal answers a spoken word; a sound lands on it. Bind the event to that word.
- **A passage.** A covering picture explains a phrase; a board lives for a segment. Bind its window to
  the passage.
- **The clock.** An intro, a music-led rhythm, a pure motion-graphics piece. Use authored seconds.

For speech-linked events, resolve the word's time from `window.TIMELINE` when the page loads, never by
copying a second from `timeline.mjs show` into the page. A new take, a changed gap or real alignment
replacing estimates then moves the event with the word. Reference timecodes from `reference/TIMELINE.md`
document observations about another video, not this performance.

Define named events once, near the top of the page script, by segment id and unit index or by searching
the segment's displayed text. These helpers were verified in a render:

```js
var T = window.TIMELINE;
var FPS = 30;                                   // match render --fps
function frames(n) { return n / FPS; }

function segment(id) {
  for (var i = 0; i < T.segments.length; i++) if (T.segments[i].id === id) return T.segments[i];
  throw new Error("no segment " + id);
}
function at(id, k)    { return segment(id).units[k].start; }   // word k begins
function endOf(id, k) { return segment(id).units[k].end; }     // word k ends

// Find displayed text in a segment (including its spaces and punctuation); `occurrence` 0 is the first.
// Returns the unit range and its film times.
function find(id, text, occurrence) {
  var s = segment(id), joined = "", owner = [];
  s.units.forEach(function (u, k) {
    var piece = (k === 0 ? "" : (u.space || "")) + u.text;
    for (var c = 0; c < piece.length; c++) owner.push(k);
    joined += piece;
  });
  var from = -1;
  for (var n = 0; n <= (occurrence || 0); n++) {
    from = joined.indexOf(text, from + 1);
    if (from < 0) throw new Error(id + ": text not found: " + text);
  }
  var first = owner[from], last = owner[from + text.length - 1];
  return { first: first, last: last, start: s.units[first].start, end: s.units[last].end };
}

// The production's named events: Moments are instants, Selections are windows.
var MOMENTS = {
  sure:   find("s2", "确定").start,
  answer: at("s3", 2)
};
var SELECTIONS = {
  longing: find("s1", "主动找我的时刻"),
  whole:   { start: segment("s1").start, end: segment("s2").end }
};
```

`timeline.mjs` does not store named events: `script.json` has no field for them. They live in the page,
named once and used by every layer that responds to them, so a reveal, its sound and its flash share one
definition. A stale reference throws instead of silently landing on another word; after editing a
segment's text, re-check the events that refer to it. Prefer `find` for events whose words may move
within a segment, and unit indices for short fixed phrases.

Translate each relationship into an instant or a window:

| Relationship | Instant or window |
| --- | --- |
| On a word | `MOMENTS.sure` |
| Eight frames after a word | `MOMENTS.sure + frames(8)` |
| When a word ends | `endOf("s1", 6)`, or `find(...).end` |
| For a phrase | `{ start: SELECTIONS.longing.start, end: SELECTIONS.longing.end }` |
| For a segment | `{ start: segment("s2").start, end: segment("s2").end }` |
| Across segments | `{ start: find("s1", "主动").start, end: find("s2", "打扰到你").end }` |
| From a word, for 12 frames | `{ start: MOMENTS.answer, end: MOMENTS.answer + frames(12) }` |
| Ending on a word | `{ start: MOMENTS.answer - 0.25, end: MOMENTS.answer }` |
| On the clock | `2`, or `{ start: 2, end: 2 + frames(12) }` |
| The whole film | `{ start: 0, end: T.duration }` |

Use the result as the GSAP position (`tl.set(el, { opacity: 1 }, MOMENTS.sure)`) or as a timed element's
`data-start` and `data-duration` set by the page script before the timeline is registered. Both forms,
including setting attributes on an element already in the markup, render correctly.

The trigger, its offset and the length of the response are separate choices. A reveal can trigger on a
word, start two frames early so it is visible as the word lands, and take its own designed 0.4 s to
settle; the answer then stays visible after the word ends. Decide each independently:

- **Occupancy** follows the passage: a picture covering an explanation starts and ends with its
  Selection.
- **An event** follows a word, and its resulting state may persist until the scene's window ends.
- **Motion** has its own readable duration, whatever the word's length.

When two adjacent windows meet between phrases, choose who owns the pause. To give it to the incoming
picture, end the first window at the previous phrase's `end` and start the next there. If the outgoing
picture should hold through the pause instead, place the meeting point at the following phrase's `start`. A `||` between the phrases changes caption grouping,
not this visual boundary. Whether the cut belongs at that point is a question for [B-roll](supporting-footage.md).

A scene's outer window does not time its internal events. When selecting, dropping and revealing answer
three phrases, give each its own named Moment; placing them at fixed fractions of the scene would keep
neither their identities nor their relation to uneven delivery ([events, lifetime and
state](scenes.md#events-lifetime-and-state)).

## Durations for authored animation

Clock-based events are ordinary numbers on the same program clock. Put them in one place too, so the
rhythm is readable and editable:

```js
var BEATS = { title: 0.4, first: 1.6, second: 3.2, verdict: 5.0 };
var DURATION = 7;
tl.fromTo("#title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, BEATS.title);
tl.set({}, {}, DURATION);
```

Choose each duration for what the viewer must do: read a line, find an element, register a change.
An entrance catches the eye, a settle confirms the new state, a swap makes the change legible, and an
exit frees the frame for the following idea. A spoken Moment can trigger an animation whose internal
motion uses authored durations; decide which part follows the word and which keeps its own readable
length, and write that choice beside the event. Frames and seconds are both fine; `frames(n)` depends on
`FPS` matching the render's `--fps`. [Motion graphics](motion.md) owns the
craft of timing change.

## Estimated timing

A segment is `estimated` when it has no alignment file (none named, or the file is missing): the speech
tool reports no word boundaries and Bibei alignment is not yet available to the account, or neither has
been converted or run yet. Check first whether the speech tool can report boundaries; that is often
the cheapest route to measured times. `timeline.mjs` then finds the
speech inside the file by silence detection and divides that span among the units by character count,
with extra time after clause and sentence punctuation. Every unit is marked `source: "estimated"`, and the
segment `timing: "estimated"`. The segment's start, end and length are real; only the positions of words
inside it are guesses.

Estimates are acceptable for phrase-level captions that change Cue by Cue, for pictures that change at
segment or phrase boundaries with some slack, and for drafts made before alignment exists. They are not
acceptable where the viewer can see a mismatch: word-by-word highlighting, a reveal or sound meant to
land on a particular word, fast cuts on words, or any effect synced to lips.

When a deliverable relies on estimated timing, tell the user plainly which segments are estimated and
what that affects ("captions change on the right phrases; individual word highlights may run a little
early or late"). When alignment becomes available, align the speech (or convert the tool's boundaries), name the files in `script.json`,
rebuild, and re-render: named events defined by segment and text move to the measured times without
page edits. Check the build output: every segment should then read `aligned`, with no coverage warning.

# Captions

Read this when putting speech-linked text on screen: building Cues from the timeline, deciding when
each Cue appears and leaves, highlighting words as they are spoken, changing or hiding the caption
treatment for a passage, or writing a new caption layout. Judgments about legibility and direction
belong to [Caption craft](captions-style.md); [The composition page](page.md) owns the page
contract and fonts; [Timing](timing.md) owns how the timeline is built.

## Caption versus typography

A caption is text whose words correspond to the speech and stay close to its delivery: the viewer
reads what they hear, as they hear it. It is built from the timeline, and when the speech changes,
it follows.

Independent writing is typography: a title, a slogan, a summary, a verdict, a label on a diagram.
It may appear on a spoken word, but its wording and rhythm are its own. Give it its own element,
placement and lifetime in the page ([Text and fonts](page.md#text-and-fonts)); take its
start from the timeline when it answers a word.

The line between them is the design question, not the tag. A large keyword that lifts out of the
spoken phrase is still caption if it is the spoken word at the moment it is said. Different colors
per speaker, cue entrances, a karaoke fill or a position that follows a face are all treatments of
one caption layer. Once a keyword gets an enlarged line to itself, words take on distinct visual jobs, or
speakers hold a repeated arrangement in space, you have a new caption layout; write it as below.
Creating a caption layout for one film is normal production work.

Begin with the understanding or feeling the viewer should come away with. One phrase could set up
the idea in a supporting role and leave the stress to its key word. Settle how words arrive, how they
divide the space, how they react to the voice, and how they pass over to whatever is said next. Those decisions become the few constants at the top of the
caption script (colors, sizes, hold, style windows) and the arrangement in its code.

## Cues from the script

The chain has fixed owners:

```text
script.json   displayed words, speakers, `||` Cue breaks          (you write it)
alignment     measured times for the spoken characters           (bibei.mjs align, or estimated)
timeline.mjs  units with film times, Cues grouping those units   (timing/timeline.json, composition/timeline.js)
page script   visible schedule, layout, style windows, motion    (composition/index.html)
```

**Displayed words always come from the script.** Alignment only supplies time; a misheard word never
reaches the screen. To correct wording, speakers or Cue grouping, edit `script.json` and rebuild the
timeline: never patch caption text in the page.

**Units.** Each segment's `units` are the timed display pieces: one CJK or Hangul character, or one
Latin/number word, with its attached punctuation in `text`. Each unit has `start`, `end` and
`source` (`measured`, `interpolated` between measured neighbours, or `estimated` from the audio).

**Cues.** Each segment's `cues` are `{ text, start, end, units: [from, to) }`: a reading phrase
covering units `from` up to (not including) `to`, with `start` of its first unit and `end` of its
last. `||` in `text` forces a break. Without `||`, timeline.mjs splits a long passage after sentence
ends and then clauses at about 14 CJK characters (16 for Korean, about 28 Latin characters). Choose
`||` breaks for meaningful reading phrases: having timing for every character is no
reason to make Cues that small. A narrow caption box wrapping a Cue onto two lines is visual wrapping, not a
new Cue; if a phrase should be read as two, break it in the script.

Check the timing source before promising word-accurate effects. `timeline.mjs show
timing/timeline.json` lists each segment as `aligned` or `estimated`. Estimated word times are spread
over the speech by character weight: good enough for Cue-level captions, not for a karaoke highlight
that must land on each syllable. When alignment is unavailable and the design depends on word
timing, say so to the user ([Alignment](../1-setup/services.md#alignment)).

## Spoken time and visible time

A word's measured `start`/`end` is when it is spoken. When the Cue is on screen is a separate
decision, the visible schedule, derived from spoken time:

- **Lead**: show the Cue slightly before its first word so the eye arrives in time (0–0.15 s).
- **Hold (tail)**: keep it after its last word so a short phrase can be read (0.2–0.5 s).
- **Handoff**: a hold never overlaps the next Cue in the same box. Cut it short where the next Cue
  appears.
- **Pauses**: in a long pause, the hold ends and the box is empty; a Cue should not sit on screen
  through several seconds of silence unless that is the design.

Resolve these into explicit show/hide seconds before creating any elements, and keep the measured
unit times untouched for the word-level effects:

```js
var LEAD = 0.1, HOLD = 0.25;
var cues = [];                                   // every Cue in film order, with its segment
T.segments.forEach(function (s) {
  s.cues.forEach(function (c) { cues.push({ segment: s, cue: c }); });
});
cues.forEach(function (e, n) {
  e.show = Math.max(0, e.cue.start - LEAD);
  e.hide = e.cue.end + HOLD;
});
cues.forEach(function (e, n) {
  var next = cues[n + 1];
  if (next) {
    next.show = Math.max(next.show, e.cue.end);  // lead never covers the previous Cue's words
    e.hide = Math.min(e.hide, next.show);        // hold ends where the next Cue appears
  }
});
```

Two caption layers that should read as one (a lower main line and an upper translation) share one
schedule. Independent layers each resolve their own.

## Word-by-word presentation

Two different clocks can drive emphasis; choose the one that matches the intended effect.

- **Following the spoken words.** Each unit changes state at its own `start` (and, for a fill, over
  `start`→`end`). A pause holds the highlight still; a drawn-out syllable fills slowly. This is
  what a viewer reads as "the caption follows the voice".
- **Progress through the Cue.** A bar or wipe moving across the whole line from `cue.start` to
  `cue.end` follows elapsed time and text width, not the spoken characters. It is a different
  effect; use it only when that is the design.

A wipe inside each glyph (karaoke fill) is an explicit visual choice on top of word timing. Test any
effect with uneven unit durations and a pause: a short line where one word is drawn out and the
speaker stops mid-phrase shows at once whether the effect follows the intended clock.

Put each unit's state change on the timeline with `tl.set` at the unit's seconds, or a tween
starting there. Never infer word times from the Cue's duration.

## Style windows and hiding

A caption layer has a **base style** for the whole film, and **later overrides for time windows**:
a stronger treatment during the punchline, a speaker color during a guest's turn, a hidden window
during a screen demonstration. Where windows overlap, the one declared later wins, and it replaces the
whole style rather than merging properties with the one beneath it.

Implement a style as a CSS rule keyed on an attribute of the caption box, and a window as `tl.set`
of that attribute at its boundaries. Resolve overlaps once, at every boundary, so the winner is
explicit:

```js
// Declared order matters: later entries win where windows overlap.
var WINDOWS = [
  { start: wordStart("s2", "因"), end: segmentEnd("s2"), style: "punch" },
  { start: 7.0, end: 8.0, style: "warm" },
  { start: segmentStart("s4"), end: segmentEnd("s4"), style: "hidden" },   // screen demo
];
function applyWindows(el, windows) {
  var cuts = [];
  windows.forEach(function (w) { cuts.push(w.start, w.end); });
  cuts = cuts.filter(function (t, i) { return cuts.indexOf(t) === i; }).sort(function (a, b) { return a - b; });
  cuts.forEach(function (t) {
    var style = "";                                   // "" = base style
    windows.forEach(function (w) { if (t >= w.start && t < w.end) style = w.style; });
    if (t > 0) tl.set(el, { attr: { "data-style": style } }, t);   // at 0 the CSS base applies
  });
}
applyWindows(document.getElementById("captions"), WINDOWS);
```

```css
#captions[data-style="punch"] .cue  { font-size: 80px; }
#captions[data-style="warm"] .cue   { filter: drop-shadow(0 0 12px #ff7a00); }
#captions[data-style="hidden"]      { opacity: 0; }
```

(`wordStart`, `segmentStart` and `segmentEnd` are small lookups into `window.TIMELINE`, as in
[Load the timeline](page.md#load-the-timeline).) Place windows from the words and
segments they answer when the treatment follows what is said; absolute seconds are right for an
explicitly clock-timed change. The base style is the CSS without the attribute; a window that
starts at second 0 is written as the page's initial attribute instead (`<div id="captions"
data-style="punch">`), because a set at 0 does not render at frame 0.

**Unit colours belong to one mechanism.** Word lighting written as `tl.set(span, { color })` puts an
inline style on each span, and inline styles beat any class or attribute rule. A window that must
change unit colours cannot do it with a CSS rule like those above: the result would depend on which
set rendered last. Either set the spans' colour in the window with `tl.set` too, or route the colour
through a CSS variable: the spans read it (`.unit.lit { color: var(--lit); }`) and the window sets it
on the caption box with `tl.set(box, { "--lit": "#ffd400" }, t)`.

**A style change can happen inside a Cue.** A window starting on a word in the middle of a visible
Cue changes the whole Cue's appearance at that second; the Cue is not split, and the next Cue
continues in the window's style while it lasts. `||` decides which words are read together; a
window decides how they look. Moving a window does not move a Cue break.

**Hiding does not restart word times.** The hidden style hides the box; the Cue elements and their
word-level sets stay on the timeline. When the window ends mid-Cue, the Cue returns in the state its
words have reached at that second: the highlight continues from the current word, not from the
start. A hidden window covers the neighbouring Cues' lead and hold too; the audio is unchanged.
Several caption layers can deliberately show at the same time (a main line and a translation), or
take complementary windows.

Speaker styling follows the same rule without windows: `segment.speaker` is on every segment, so a
speaker's color or position can be chosen per Cue from its segment (see the variants below).

## Spacing and CJK text

Spacing is display content, and the timeline already carries it: each unit has an optional `space`,
the exact characters between it and the previous unit as written in the script. **Never rebuild
spacing by joining units with spaces or by guessing from the writing system.** Use `space + text`
for every unit, and drop the leading whitespace of a Cue's first unit (`space.trimStart()`), because
a Cue or line never starts with a space. `space` can also hold punctuation written after a space
(`" — "`, `" “"`); keep it with its word so it appears with that word.

| Script text | Displayed | What the author chose |
| --- | --- | --- |
| `是的 就是这样` | `是的 就是这样` | Chinese text with a deliberate space |
| `是的就是这样` | `是的就是这样` | Joined text |
| `Hello New York.` | `Hello New York.` | Word spaces in English; punctuation stays on its word |
| `이건 3개월 동안 만든 영상이에요.` | `이건 3개월 동안 만든 영상이에요.` | Korean word spaces; none inside `3개월` |
| `3 개월` | `3 개월` | A deliberately spaced alternative |
| `3D` / `3 D` | `3D` / `3 D` | Whether a digit touches a Latin letter is also the author's call |
| `其实我很贪恋你，\|\|主动找我的时刻。` | Two Cues: `其实我很贪恋你，` / `主动找我的时刻。` | `\|\|` is a Cue break, never displayed |

Do not insert spaces to help anything parse, strip spaces from Chinese, or infer Korean or English
gaps from speech. What the script says is what the screen shows. The displayed and spoken text are
the same text in `script.json`; if a TTS voice needs a different spelling to pronounce a word, keep the
display spelling in the script and check the rebuilt timeline's coverage for that segment.

Two HTML facts decide whether those spaces survive:

- **Spans directly inside a flex container lose their edge spaces.** Put the unit spans in an
  inline `<p class="line">` inside the flex Cue, never as direct flex items.
- **Collapsing whitespace eats doubled or edge spaces.** Give the line `white-space: pre-wrap`.

CJK text has no spaces to break at, so the browser breaks between any two characters. Size the
caption box so a typical Cue fits on one line at the chosen font size (about 14 characters at 68 px in
a 960 px box), and look at the longest Cue in a frame. Avoid leaving a single character or a lone
punctuation mark on a second line: shorten the Cue with `||`, reduce the size for that window, or
widen the box. Latin names and numbers inside Chinese take the Latin face in a Latin-first font stack
([Text and fonts](page.md#text-and-fonts)); check that their weight and height sit well
with the Han characters.

## Worked example

[composition.html](../examples/composition.html) renders three stills with word-by-word
captions from `timeline.js`. Its caption code, piece by piece:

```css
#captions { position: absolute; left: 60px; right: 60px; bottom: 260px; height: 220px; }
```

An untimed box: always present, positioned in canvas pixels, 960 px wide and anchored above the
bottom safe area. It is the element to key style windows on.

```css
.cue { position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center;
       text-align: center; opacity: 0; font-size: 68px; font-weight: 700; line-height: 1.3;
       color: #fff; text-shadow: 0 3px 14px rgba(0, 0, 0, .8); }
```

Every Cue fills the box and bottom-aligns its text, so consecutive Cues share one baseline. Each
starts at `opacity: 0` in CSS; the timeline shows it. The shadow keeps white text readable on light
pictures.

```css
.line { white-space: pre-wrap; }
.unit { color: rgba(255, 255, 255, .45); }
```

The inline line keeps the script's spaces (see above). Units start dim; each turns white when
spoken.

```js
var HOLD = 0.25; // visible time after the last word of a Cue, cut short by the next Cue
var cues = [];
T.segments.forEach(function (s) {
  s.cues.forEach(function (c) { cues.push({ segment: s, cue: c }); });
});
```

All Cues in film order, each with its segment, so the handoff between consecutive Cues can be
resolved across segment boundaries.

```js
cues.forEach(function (entry, n) {
  var s = entry.segment, c = entry.cue;
  var cue = document.createElement("div");
  cue.className = "cue";
  var line = document.createElement("p");
  line.className = "line";
  cue.appendChild(line);
```

One element per Cue, holding one inline line.

```js
  for (var k = c.units[0]; k < c.units[1]; k++) {
    var u = s.units[k];
    var space = u.space || "";
    var span = document.createElement("span");
    span.className = "unit";
    span.textContent = (k === c.units[0] ? space.trimStart() : space) + u.text;
    line.appendChild(span);
    tl.set(span, { color: "#fff" }, u.start);
  }
```

One span per unit in `[from, to)`. The span's text is the unit's own `space` plus its `text`, with the
Cue's leading whitespace dropped. A `tl.set` at the unit's spoken `start` lights it: seeking to any
second shows exactly the words spoken so far.

```js
  box.appendChild(cue);
  var hide = c.end + HOLD;
  if (n + 1 < cues.length) hide = Math.min(hide, cues[n + 1].cue.start);
  tl.set(cue, { opacity: 1 }, c.start);
  tl.set(cue, { opacity: 0 }, hide);
});
```

The visible schedule: on at the first word, off after the hold, or earlier where the next Cue
appears, so two Cues never share the box. Sets rather than fades need no hard kill. For a fade, tween
`opacity` over ~0.12 s ending at `hide` and keep the set at `hide`.

The variants below replace only the unit loop and the CSS, and keep the schedule. Each was rendered
and checked in frames.

**Karaoke fill.** A left-to-right wipe through each unit while it is spoken:

```css
.fill { background: linear-gradient(90deg, #ffd84d 50%, rgba(255,255,255,.45) 50%);
        background-size: 200% 100%; background-position: 100% 0;
        -webkit-background-clip: text; background-clip: text; color: transparent; }
#captions .cue { text-shadow: none; filter: drop-shadow(0 3px 8px rgba(0,0,0,.8)); }
```

```js
span.className = "fill";
tl.to(span, { backgroundPosition: "0% 0", duration: Math.max(0.04, u.end - u.start), ease: "none" }, u.start);
```

The gradient is twice the span's width; moving it from `100%` to `0%` slides the yellow half across
the glyphs over the unit's spoken duration. `text-shadow` paints over text clipped from a background,
so the shadow moves to a `drop-shadow` filter on the Cue.

**Pop-in per word.** Words appear as they are spoken, and the line never reflows:

```css
.pop { display: inline-block; opacity: 0; }
#captions .cue { color: #fff; }
```

```js
span.className = "pop";
tl.fromTo(span, { opacity: 0, scale: 0.6, y: 24 },
                { opacity: 1, scale: 1, y: 0, duration: 0.18, ease: "back.out(2)" }, u.start);
```

Unspoken words keep their width at `opacity: 0`, so the finished line is laid out from the start and
nothing jumps. Keep the unit's `space` inside the span: punctuation carried in `space` then appears
with its word, not before it.

**Two-line Cues.** Pairs of consecutive Cues in one segment share the screen: the current line bright,
the next one already visible and dim:

```css
.cue { flex-direction: column; justify-content: flex-end; }
.cue .line + .line { opacity: .55; }
```

```js
var groups = [];
T.segments.forEach(function (s) {
  for (var i = 0; i < s.cues.length; i += 2) {
    var pair = s.cues.slice(i, i + 2);
    var cue = document.createElement("div");
    cue.className = "cue";
    pair.forEach(function (c) {
      var line = document.createElement("p");
      line.className = "line";
      cue.appendChild(line);
      for (var k = c.units[0]; k < c.units[1]; k++) { /* unit spans as in the example */ }
    });
    box.appendChild(cue);
    var lines = cue.querySelectorAll(".line");
    if (lines[1]) tl.set(lines[1], { opacity: 1 }, pair[1].start);
    groups.push({ el: cue, start: pair[0].start, end: pair[pair.length - 1].end });
  }
});
// then resolve show/hide for `groups` exactly as for single Cues, and set opacity at those seconds
```

The pair is the scheduled unit: it appears with its first word and leaves after the second line's
hold. A segment with an odd number of Cues ends with a one-line group.

**Speaker color from `segment.speaker`.** Every unit of a segment takes its speaker's color when
spoken:

```js
var COLORS = { narrator: "#ffffff", guest: "#7fe0ff" };
tl.set(span, { color: COLORS[s.speaker] || "#ffffff" }, u.start);
```

Position or size per speaker works the same way: set a `data-speaker` attribute on the Cue element
from `s.speaker` and write CSS for `.cue[data-speaker="guest"]`.

**Test cases.** Before trusting a caption layout, render a short script that exercises it and read
the frames at the handoffs: a normal phrase; a Chinese passage with an intentional space; Korean word
spaces; a mixed number/Latin spelling (`3D`, `2 AI tools`); a drawn-out word followed by a pause; the
longest Cue at delivery size; a speaker change; a style window starting mid-Cue; and a hidden window
ending mid-Cue. Check the displayed words against the script and the lit word against the voice.
A still frame can show typography; only the rendered timeline establishes timing.

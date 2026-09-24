# The composition page

Read this when writing or changing `composition/index.html`: the HyperFrames page that holds the
picture and sound of the film. [Captions](captions-build.md) owns the speech-linked text,
[Audio](sound.md) the sound layers, [Render](../5-deliver/render.md) linting and encoding. The worked, rendered
example is [composition.html](../examples/composition.html) with its
[script.json](../examples/script.json).

The page is the edit. Everything the viewer sees or hears is an element on it, timed in film
seconds, and every change over time is a step on one paused GSAP timeline. The renderer opens the
page in a headless browser, seeks that timeline frame by frame, captures each frame and mixes the
page's audio. Write the page so that any requested second produces the complete picture for that
second, independently of which seconds were rendered before it.

## The HyperFrames contract

Start from `render.mjs init`, which writes a page with this shape and copies GSAP beside it:

```html
<!doctype html>
<html lang="zh">
<head>
<meta charset="UTF-8"/>
<script src="vendor/gsap.min.js"></script>
<script src="timeline.js"></script>
<style>
  @font-face { font-family: "Body"; src: local("Microsoft YaHei"), local("PingFang SC"), local("Noto Sans CJK SC"); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; background: #000; }
  #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; font-family: "Body"; }
  .clip { position: absolute; inset: 0; visibility: hidden; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920">
  <img id="shot1" class="clip" src="assets/shot1.jpg" data-start="0" data-duration="5" data-track-index="0"/>
</div>
<script>
  var tl = gsap.timeline({ paused: true });
  // tweens and sets, positioned in film seconds
  tl.set({}, {}, 5);                       // the film lasts as long as the timeline
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = tl;         // key = data-composition-id
</script>
</body>
</html>
```

The rules the renderer depends on:

- **One root.** `<div id="root" data-composition-id="main" data-start="0" data-width="…"
  data-height="…">` inside a full HTML document. `data-width`/`data-height` are the canvas in pixels;
  size `html`, `body` and `#root` to match.
- **One paused timeline, registered.** `gsap.timeline({ paused: true })`, stored as
  `window.__timelines["main"]`, with the key equal to `data-composition-id`. Build the whole timeline
  synchronously and register it last. The renderer drives it; nothing in the page plays it.
- **The film is as long as the timeline.** A clip's `data-duration` does not extend the film. End
  the script with `tl.set({}, {}, DURATION)`; with speech, `DURATION` is `window.TIMELINE.duration`.
- **Timed elements.** `<img>`, `<video muted playsinline>`, `<audio>` and `<div>` carry `data-start`
  and `data-duration` in seconds and `data-track-index`. The track index only organizes time (two
  elements on one track must not overlap); **it does not decide what draws in front**: see
  [timed layers](#timed-layers). Visual timed elements carry `class="clip"`, whose CSS includes
  `visibility: hidden`; the runtime shows each one inside its window. `<audio>` needs no class, but
  **every `<audio>` needs a unique `id`**: the renderer silently drops one without an id (the film has
  no sound) and lint does not flag it. Give `<video>` and other timed elements ids too.
- **The runtime owns presence and playback.** Never animate `visibility` or `display` of a clip and
  never call `play()`, `pause()` or set `currentTime`/`muted` on media. Animate `opacity` and
  transforms instead. `<video>` is always `muted playsinline`; its sound, when wanted, is a separate
  `<audio>`.
- **Write media elements with closing tags.** `<video …></video>` and `<audio …></audio>`; a
  self-closing `<video/>` swallows the rest of the page. `<img …/>` is fine.
- **Everything is local and inside `composition/`.** GSAP from `vendor/gsap.min.js`, pictures and
  fonts from `assets/`, speech and music from `audio/`, generated files from `generated/`. The
  renderer serves nothing outside the composition folder, and a render makes no network requests.

Elements that a synchronous script in the page creates before the timeline is registered are
honoured like written ones, including `<audio>` with data attributes; the worked example creates its
speech audio and captions from `window.TIMELINE` this way.

**Write shot videos and non-speech audio as elements.** Every generated shot `<video>` and every
`<audio>` other than speech (music, effects, ambience, footage sound) is written in `index.html`, so
the delivery checks, which read the page source, can see it
([production plan](../2-plan/production-plan.md#what-the-checks-read)). The script may still set their
`data-start` and `data-duration` from the timeline. Speech audio and captions stay script-built.

Keep one page and one composition. HyperFrames also documents nested compositions loaded with
`data-composition-src`; they are not needed for the work this Skill does and have not been verified
with this setup.

## Timed layers

Each visual element has two separate facts: its **lifetime** (when it is present) and its **paint
order** (what it covers). Decide both from the picture you intend.

- A timed element's lifetime is `data-start` + `data-duration`. Its **paint order is the browser's
  normal stacking**: an element later in the page draws over an earlier one, and CSS `z-index`
  (on positioned elements) overrides that. `data-track-index` has no effect on what covers what
  (verified by render: a later element on track 0 covered an earlier one on track 9, and a
  `z-index: 5` element covered a later one). Order the page back to front (pictures, footage views,
  graphics, captions) or give each layer class an explicit `z-index`. When a script creates
  elements, append them in the order they should stack, or set `el.style.zIndex`.
- Tracks still matter for time: elements on one track must not overlap. Give independent
  contributions their own tracks (pictures 0–9, footage views 10–19, graphics above). Audio tracks
  must not overlap on one index either; start them at 20 to keep the numbers readable.
- An untimed element (a caption box, a frame wrapper, a title card) is always present. Position it
  with CSS, stack it with `z-index`, start it invisible in CSS (`opacity: 0`) and drive its
  appearance with `tl.set`/tweens. Set an untimed element's initial state in CSS, not with a
  `tl.set` at second 0: a zero-duration set at 0 does not render while the playhead sits exactly at
  0, so frame 0 would show the unset state.
- Items with separate lifetimes are separate elements. A board that keeps its settled rows while
  later rows enter has one element per row, each revealed at its own second; the board itself
  lives for the whole passage.
- Content that moves, clips, fades or filters together shares one wrapper, and the treatment goes
  on that wrapper. Opacity and CSS filters apply to an element and everything inside it; a
  `backdrop-filter` panel blurs whatever is painted behind it at its position. Put the treatment
  on the element that owns the visible relationship: a transition that dissolves one picture into
  another owns both pictures; independent overlays stay siblings.
- When an exit tween fades something to `opacity: 0` exactly where its lifetime ends, add a hard
  `tl.set(el, { opacity: 0 }, end)` at that second. A render can seek straight past the fade, and
  the set guarantees the hidden state. For a clip, put the fade and the set on an inner wrapper,
  not the clip itself.

SVG and generated DOM share one document. Every `id` used by a mask, gradient, filter or `clipPath`
must be unique on the page; when a script creates several instances of one graphic, derive the ids
from the instance (`"mask-" + n`) and update every `url(#…)` reference with them.

Choose the drawing medium by the visible behavior. CSS transforms, clip-path, masks and SVG cover
panels, cards, tilts, reveals, wipes, charts and most motion graphics, and they are what the linter
and the verified renders exercise. A deforming textured surface or particle field may warrant a
`<canvas>` or WebGL; that path is not verified here. If you need it, draw each frame from a pure
function of the timeline time, never from accumulated state, and prove it with a draft render
inspected in [frames and grids](../5-deliver/review.md#evidence-frames-and-grids).

## Animate with the paused timeline

Every change over time is placed on `tl` at an absolute film second:

```js
tl.fromTo("#shot2", { scale: 1.08 }, { scale: 1, duration: 5.25, ease: "none" }, 5);  // tween
tl.set("#answer", { opacity: 1 }, 7.42);                                              // instant change
tl.to("#panel", { x: -420, duration: 0.6, ease: "power2.out" }, 9.1);
```

- **Place events by what they answer.** Positions come from `window.TIMELINE`: a word's `start`, a
  Cue's `end`, a segment's `start`, or an authored clock time for animation that is not tied to
  speech. [Timing](timing.md#place-events-by-relationship) explains choosing the relationship;
  [Load the timeline](#load-the-timeline) shows reading it. A hard-coded second is right only for
  genuinely clock-timed events.
- **Animate transforms and paint, not layout.** Use `x`, `y`, `xPercent`, `yPercent`, `scale`,
  `rotation`, `opacity`, colors, `clipPath`, `filter`, `backgroundPosition`. Tweening `left`,
  `top`, `right`, `bottom` or margins snaps to whole pixels and stutters under frame-by-frame
  capture; tweening `fontSize` or `letterSpacing` reflows text. The linter rejects these tweens
  (`gsap_non_transform_motion`). A `tl.set` of a layout property at one instant is fine.
- **Use `tl.set` for discrete changes.** A caption word lighting up, a card swapping content, a
  style window starting: all are sets at seconds. GSAP 3 has no `className` tween; change an
  attribute instead, `tl.set(box, { attr: { "data-style": "punch" } }, 6)`, and style it with
  `#box[data-style="punch"]` in CSS.
- **`fromTo` over `from`.** `fromTo` states both ends, so the element is correct whichever second
  the renderer seeks to first. Do not combine CSS `opacity: 0` with `gsap.from({ opacity: 0 })`;
  it animates from 0 to 0.
- **One writer per property at a time.** Two tweens overlapping on the same property of the same
  element fight; the linter warns (`overlapping_gsap_tweens`). Shorten one, or move one to a
  wrapper.

## Deterministic rendering

Several browser workers capture different frames of one render, each seeking independently. The
page must produce the same picture for a given second every time.

- No `Math.random()`, `Date.now()`, `new Date()`, `performance.now()`, `requestAnimationFrame`,
  `setTimeout`/`setInterval` for timing, CSS `transition`/`animation`/`@keyframes` for anything that
  changes over time, or network fetches. The linter blocks the common ones
  (`non_deterministic_code`, `requestanimationframe_in_composition`).
- When scattered or varied motion needs randomness, use a seeded generator and consume it in a fixed
  order while building the timeline:

  ```js
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var rand = mulberry32(42);
  ```
- Compute all layout while building: positions from known sizes, not measured in tween callbacks.
- Keep scripts synchronous. Do not build the timeline inside `document.fonts.ready` or another
  promise; register it at the end of the page script.

## Space: canvas, frames and fitting

Three rectangles are involved whenever a picture appears: the **canvas** (`data-width` ×
`data-height`), the **frame** the picture should occupy on it, and the **real image size** of the
source. Read the real size with ffprobe before placing anything
([Probe before use](../3-materials/media-prep.md#probe-before-use)); a generated image may not have the size you asked
for.

Coordinates start at the top left; x grows right, y grows down. A frame is an absolutely positioned
element with `left`, `top`, `width`, `height` in canvas pixels. Frames can overlap, bleed off the
canvas or nest; a nested frame's coordinates are relative to its parent, so subtract the parent's
origin when you computed a child position in canvas space.

**Fitting.** The picture fills its frame through `object-fit` on the `<img>`/`<video>`:

- `contain` shows the entire picture, possibly with empty margins around it;
- `cover` fills the frame and crops the overflow;
- `fill` stretches the picture to the frame, changing its proportions;
- `none` / `scale-down` keep the source's own pixel size (scaled down only if needed).

Work the numbers when the crop matters. A `1600 × 900` image in a `600 × 600` frame scales by
`min(600/1600, 600/900) = 0.375` under `contain`, becoming `600 × 337.5` with `131.25` px above and
below. Under `cover` it scales by `max(600/1600, 600/900) = 0.667`, becoming `1066.7 × 600`, and the
frame shows a `600`-wide window of it: `466.7` px of the scaled picture are cut away horizontally.

**Alignment.** `object-position: X% Y%` decides which part of the scaled picture sits in the frame:
it aligns the point X%/Y% across the picture with the point X%/Y% across the frame. `50% 50%` centers;
`50% 0%` keeps a cover crop on the top edge (a face in the upper part of a tall portrait);
`30% 50%` shows more of the left side. Pixel values (`object-position: -120px 0`) displace the
picture exactly. When you need a different point of the picture to meet a different point of the
frame (for example the subject's eye at the frame's upper third), compute the displacement:
`offset = frameX × frameWidth − contentX × scaledWidth` on each axis, and write it in pixels.
Choose alignment from the actual subject in the actual image.

**Border and padding shrink the fit area.** With `box-sizing: border-box`, a frame's border and
padding stay inside its outer size, and the picture fits into what remains. Put the border,
padding, background paint and shadow on a wrapper; let the `<img>`/`<video>` fill the wrapper's
content box at `width: 100%; height: 100%`. The wrapper's background shows wherever `contain`
leaves space.

**Shape the frame on the wrapper.** `overflow: hidden` with `border-radius` rounds it; a square
wrapper with `border-radius: 50%` makes a circular inset. `clip-path: inset(top right bottom left
round r)` crops a frame without changing its layout box and can be tweened. Rounded clipping follows
the wrapper, not the picture inside it: a `contain` picture sitting away from the wrapper's corners
keeps square corners. For corners that follow the picture, size the wrapper to the picture's
displayed aspect.

```html
<div id="presenter" style="position:absolute; left:728px; top:1540px; width:320px; height:320px;
     border-radius:50%; overflow:hidden; border:3px solid #D8C7A8; opacity:0">
  <video id="presenter-video" class="clip" src="generated/host.mp4" muted playsinline
         style="width:100%; height:100%; object-fit:cover; object-position:50% 30%"
         data-start="2" data-duration="8" data-track-index="5"></video>
</div>
```

The wrapper is untimed (its appearance is `tl.set("#presenter", { opacity: 1 }, 2)`); the video
inside is the timed element. Do not give a wrapper its own `data-start` when a timed `<video>` sits
inside it: nested timed media freezes (`video_nested_in_timed_element`). This shape crops
geometrically; a subject-shaped outline needs a cutout prepared as in
[Cutouts and transparency](../3-materials/media-prep.md#cutouts-and-transparency).

**Move the frame or move inside it.** Animating the wrapper (`x`, `y`, `scale`, `clipPath`) moves
the whole framed presentation, border and paint included. Animating the picture inside an
`overflow: hidden` wrapper (`scale`, `x`, `y` on the `<img>`) is a Ken Burns push or pan while the
frame outline stays still. Motion inside can expose the wrapper's background at the edges; start a
push-in from `scale: 1` under `cover`, or scale enough to keep the frame covered through the whole
move. Do not tween `width`/`height` of a `<video>` element itself; animate a wrapper and let the
video fill it.

**Tracked regions through crops.** A measured box on the source (a face, a product, from a detector
or from you reading frames) arrives in source pixels or normalized `[x, y, w, h]`. To place a
caption or pointer on it, carry it through the same geometry the picture uses: with source size
`W × H`, fit scale `s` and top-left offset `(ox, oy)` of the scaled picture inside a frame at
`(fx, fy)`:

```text
canvasX = fx + ox + x × W × s        canvasY = fy + oy + y × H × s
canvasW = w × W × s                  canvasH = h × H × s
```

Under `cover` with centered alignment, `ox = (frameW − W×s)/2` (negative when cropped); add any
`object-position` displacement and then any transform on the picture or wrapper. Boxes measured on a
source clip are in source time; shift them by the clip's `data-start − data-media-start` to put them
on the film clock. [Caption tracking](captions-follow.md) owns producing the
boxes.

## Footage layers and the three clocks

Three clocks run in every film with footage, and each is a separate fact:

| Clock | What sets it | What it answers |
| --- | --- | --- |
| Film | `data-start`, `data-duration` | When the footage is present on screen |
| Source | `data-media-start` | Which second of the source file plays at `data-start` |
| Animation | tween positions on `tl` | When its frame, crop or opacity changes |

At film second `t` inside its window, a video shows source second
`data-media-start + (t − data-start)`. The renderer keeps that mapping whatever the timeline
does to the element's opacity or transform.

**Trims.** Choose the source interval with `data-media-start` (in) and `data-duration` (length).
A window longer than the remaining source does not extend it: playback stops and the last frame
holds while the clip stays present. A shorter window truncates. Loops, holds and speed changes
are not attributes; prepare them as files with FFmpeg ([Conform footage and audio](../3-materials/media-prep.md#conform-footage-and-audio))
and place the result.

**Hiding footage does not restart it.** If a speaker is visible, covered by B-roll for four seconds,
then visible again, keep one video element spanning the whole passage and cover it (or set its
wrapper's `opacity` to 0 and back); when it returns, it shows the source second it has reached. If
you instead split it into two clips, the second clip's `data-media-start` must continue the source:
`mediaStart₂ = mediaStart₁ + (start₂ − start₁)`. A second clip with `data-media-start="0"` replays
from the beginning, which is right only when a replay is the intention.

**Simultaneous views and replays.** Two `<video>` elements with the same `src`, `data-start` and
`data-media-start` show the same instant: a sharp foreground and a blurred, enlarged background of
the same shot, or a close crop beside the wide view. A replay (the claim, then the moment again
from an earlier point) is a separate clip with its own `data-media-start`. Neither needs a second
copy of the speech in the sound.

**Original and cutout at matching positions.** A cutout prepared from footage is a different file
with the same timing. To cut or dissolve between original and cutout, give both the same
`data-start` and `data-media-start` so they depict the same source instant, and the same fit, crop
and transform so the subject lands on the same pixels. Equal frames alone do not align the subject
if the files differ in size or padding. Keep the original beside the processed file
([Keep originals beside processed versions](../3-materials/media-prep.md#keep-originals-beside-processed-versions)).

**Swapping content in one slot.** Pictures that replace each other in one place (steps of a demo,
a sequence of product shots) are consecutive clips on one track inside the same wrapper, each
starting where the previous ends. The wrapper keeps the shared frame, border and position while its
contents change. For a crossfade, overlap the two by the fade length on two tracks and fade the
incoming one in (on its own inner wrapper when it is a clip boundary). The incoming picture must
**stack above** the outgoing one: put it later in the page or give it a higher `z-index`. Its track
number does not do this, and a crossfade whose incoming picture sits underneath silently plays as a
hard cut at the end of the overlap. When two pictures show the same people, a long dissolve shows a
double image; keep it short (0.3–0.5 s) or cut.

**Continuous viewport handoff.** When the speaker moves from full screen into a side panel while a
diagram enters, animate one wrapper from the first frame to the second (`x`, `y`, `scale`,
`clipPath`), with the one video element inside it. The source keeps playing through the move.
Match the endpoint crops through the same numbers you used for the static layouts, so the subject
arrives where the settled layout expects it. Events inside the passage that answer other words
(the diagram's second label) get their own seconds from the timeline.

**Source sound is off unless chosen.** Every `<video>` is muted. When the footage's own sound
belongs in the film, extract or reference it as an `<audio>` with the same `data-start`,
`data-media-start` and `data-duration` as the picture ([Source sound from footage](sound.md#source-sound-from-footage)).
Holding a picture's last frame does not hold its sound.

**Check coverage.** List the picture clips per track with their windows and look for gaps: between
consecutive clips, where a video's source runs out before its window ends, and where a fade leaves
a lower layer or the black background exposed. Then look at the frames around every handoff in a
draft render ([Evidence: frames and grids](../5-deliver/review.md#evidence-frames-and-grids)). An exposure may be
intended; a one-frame flash of the wrong picture is not.

## Text and fonts

Glyph shapes and spacing decide how text wraps and how much room it needs, so choose the face
before you lay out captions or titles. A font supplies the glyphs, CSS supplies size and treatment,
and the element supplies wording, placement and lifetime.

**Declare every family.** Every `font-family` name used in the page's CSS needs an `@font-face`
(lint error `font_family_without_font_face` otherwise); generic names like `sans-serif` are
exempt. An installed font is declared with `local()` and its full font name; a file with `url()`:

```css
@font-face { font-family: "Caption"; font-weight: 700;
  src: local("Microsoft YaHei Bold"), local("PingFang SC Semibold"), local("Noto Sans CJK SC Bold"); }
@font-face { font-family: "Brand"; font-weight: 600;
  src: url("assets/fonts/Brand-SemiBold.woff2") format("woff2"); }
@font-face { font-family: "Brand"; font-weight: 400;
  src: url("assets/fonts/Brand-Regular.woff2") format("woff2"); }
```

`local()` depends on the rendering machine; list the equivalent names for Windows, macOS and Linux
as above, and prefer a bundled file in `composition/assets/fonts/` when the face must be exact or the
project will move to another machine. A font file must sit inside `composition/` to be served.

**Real weights only.** One `@font-face` per weight and style you actually have. Declaring
`font-weight: 700` on a regular-only file does not produce a bold face; the browser would fake it.
Use the weights the family really ships.

**Fallback order is a design choice.** `font-family: "Latin", "Caption", "Emoji"` gives Latin
letters and digits the Latin face and CJK characters the CJK face, character by character. Listing a
CJK face first makes it render the Latin text as well, which gives the line a more even look. Two
families at the same nominal weight need not match visually, so compare them side by side in one
caption line at the size it will be delivered.

**CJK choice.** For Chinese-led speech start from a face made for the script: Microsoft YaHei on
Windows, PingFang SC on macOS, Noto Sans CJK SC / Source Han Sans SC (Simplified), Noto Sans CJK TC
(Traditional) or a display face for short titles. Running speech wants a compact, legible face,
while a livelier one may fit a light-hearted caption or a brief title. Look at the actual words at
the size they will be delivered, punctuation, numbers and Latin names included. Good Han coverage alone does not make a size,
spacing or outline recipe tuned for English suit Chinese.

**Finding and bringing a face.** Look in the user's brand assets first. Installed fonts live in
`C:\Windows\Fonts` and `%LOCALAPPDATA%\Microsoft\Windows\Fonts` on Windows, `/Library/Fonts` and
`~/Library/Fonts` on macOS, and `fc-list` lists them on Linux. `.ttf`, `.otf`, `.woff` and `.woff2`
files can be copied into `composition/assets/fonts/`. A `.ttc`/`.otc` collection holds several faces;
`local()` can still select an installed face by name, but for a bundled file extract the single face
with a font tool when its license permits. When nothing available fits, download from the foundry's
or open-font project's official page, check script coverage, weights and license, and keep the
license file beside the font. Installing it system-wide is unnecessary.

**Emoji.** Add a color emoji face at the end of the stack:
`@font-face { font-family: "Emoji"; src: local("Segoe UI Emoji"), local("Apple Color Emoji"), local("Noto Color Emoji"); }`.
Write the intended code point sequence (for example `☎️` with its variation selector) when the color
form is wanted. Check the rendered frame: whether the headless browser draws color glyphs depends on
the fonts present on the rendering machine.

**Independent text.** Titles, labels, verdicts and on-screen copy that follow their own rhythm are
ordinary elements with their own placement and lifetime, revealed on the timeline. Caption text
that follows the speech is built from the timeline instead ([Captions](captions-build.md)). For rich text,
wrap a run in a `<span>` with its own class; the span's font, size and color replace the
surrounding ones for that run. Animate text with `opacity`, transforms, or per-word/per-character
spans revealed at seconds; never tween `fontSize` or `letterSpacing`.

## Load the timeline

`timeline.mjs build script.json --js composition/timeline.js` writes the speech timing as a script
that sets `window.TIMELINE`. Load it after GSAP and before the page script, so the page script
can read it synchronously:

```html
<script src="vendor/gsap.min.js"></script>
<script src="timeline.js"></script>
```

```js
var T = window.TIMELINE;          // { duration, language, segments: [...] }
var root = document.getElementById("root");
var tl = gsap.timeline({ paused: true });

// Speech: one <audio> per segment, where the timeline placed it.
T.segments.forEach(function (s, i) {
  var a = document.createElement("audio");
  a.id = "voice-" + s.id;
  a.src = s.audio;                              // relative to composition/
  a.setAttribute("data-start", s.start);
  a.setAttribute("data-duration", s.audioDuration);
  a.setAttribute("data-track-index", 20 + i);
  root.appendChild(a);
});

// Named instants for picture events, read from the words they answer.
function wordStart(segId, text) {
  var s = T.segments.find(function (x) { return x.id === segId; });
  var u = s.units.find(function (x) { return x.text.indexOf(text) === 0; });
  return u.start;
}
tl.set("#answer-card", { opacity: 1 }, wordStart("s2", "确"));

tl.set({}, {}, T.duration);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
```

Each segment carries `id`, `speaker`, `audio`, `start`, `end`, `audioDuration`, `timing`
(`"aligned"` or `"estimated"`), `units` (`{ space?, text, start, end, source }`) and `cues`
(`{ text, start, end, units: [from, to) }`); all times are film seconds.
[Build the timeline](timing.md#build-the-timeline) explains producing it.

Picture windows written as literal numbers in the HTML must be updated when the speech changes.
When a picture follows a word or segment, time it from `T` in the script instead (set the written
element's `data-start`/`data-duration`, or its tweens), so a re-take and a `timeline.mjs` rebuild move
it with the words. Do not edit `timeline.js` by hand;
rebuild it.

## Lint findings that matter

`render.mjs lint composition` runs before every render and blocks on errors. The findings you will
meet, and their fixes:

| Code | Meaning | Fix |
| --- | --- | --- |
| `font_family_without_font_face` | A family in CSS has no `@font-face` | Add one per family: `local()` or `url()` |
| `missing_local_asset` / `audio_src_not_found` | A `src` points to a missing file | Put the file under `composition/` and fix the path (paths are relative to the page) |
| `invalid_parent_traversal_in_asset_path` | A path climbs out with `../` | Move the file into `composition/` |
| `gsap_animates_clip_element` | A tween or set changes `visibility`/`display` of a clip | Remove it; the runtime owns presence. Fade `opacity` or an inner wrapper instead |
| `timed_element_missing_clip_class` / `timed_element_missing_visibility_hidden` | A timed visual element would be visible before its start | Add `class="clip"` with `.clip { visibility: hidden }` |
| `video_missing_muted` | `<video>` without `muted` | Add `muted playsinline`; put its sound in an `<audio>` |
| `video_nested_in_timed_element` | Timed `<video>` inside a timed wrapper | Remove the wrapper's `data-*` timing; drive its appearance with `opacity` |
| `self_closing_media_tag` | `<video …/>` or `<audio …/>` | Write the closing tag |
| `imperative_media_control` | Script calls `play()`, `pause()`, sets `currentTime`/`muted` | Remove it; use `data-start`, `data-duration`, `data-media-start` |
| `overlapping_clips_same_track` | Two clips overlap on one `data-track-index` | Move one to another track or fix the windows |
| `non_deterministic_code` / `requestanimationframe_in_composition` | Randomness, clocks or rAF in the page | Seeded randomness, timeline-driven motion |
| `gsap_non_transform_motion` | Tween of `left`/`top`/margins/`fontSize`/`letterSpacing` | Use `x`/`y`/`scale`; hold spacing static |
| `gsap_exit_missing_hard_kill` / `caption_exit_missing_hard_kill` | A fade-out ends at a boundary without a hard set | Add `tl.set(el, { opacity: 0 }, end)` after the fade |
| `missing_timeline_registry` / `gsap_timeline_not_registered` / `timeline_id_mismatch` | Timeline not registered under the composition id | `window.__timelines["main"] = tl` with the root's `data-composition-id` |
| `root_missing_dimensions` / `root_missing_composition_id` | Root attributes missing | Add `data-composition-id`, `data-start="0"`, `data-width`, `data-height` |
| `gsap_timeline_registered_before_async_build` | Timeline built in a promise | Build synchronously; register last |
| `overlapping_gsap_tweens` (warning) | Two tweens change one property at once | Shorten, move, or animate a wrapper |
| `gsap_timeline_set_initial_hide` (warning) | Initial hidden state set with `tl.set` at 0 | Put the initial state in CSS |
| `duplicate_audio_track` (warning) | Two `<audio>` overlap on one track | Give each its own track index |

Warnings do not block, but read them: most describe a picture that will differ from what you meant.
`--allow-lint-errors` exists for diagnosing a render; never deliver a film rendered with it.

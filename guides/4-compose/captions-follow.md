# Caption tracking

Read this only when the user's reference clearly has captions riding above a speaker's moving head, or
the user asks for it. Ordinary captions keep their own place on the page, and a face in the picture
never triggers a head box by itself. Head positions, measured or written by hand, answer one question:
where do this speaker's words appear in the actual picture?

## Who, where, when

Settle three facts before measuring anything:

- **Who** is the script segment's `speaker`. A detector's face-track id is not an identity.
- **Where** is that person's intended view in the final composition.
- **When** comes from the speech and the chosen caption treatment. In a normal exchange, the previous
  speaker's caption hands over when the next person starts talking. A face still being visible is no
  reason to keep old words up.

You can measure on two kinds of picture:

| Source | What you get | What you must still do |
| --- | --- | --- |
| A supplied or generated clip | Coordinates local to that source, in source time | Carry them through the clip's placement: `data-start`, `data-media-start`, crop, scale and any moving view |
| A rendered draft | Coordinates already in the composition and in film time | Only valid if no graphic covers the person being measured |

Keep the measurement tied to the use it serves. After a trim or retime, source timestamps mean
something else. After a crop or reframe, the boxes move. Shrinking a shot into picture-in-picture means
following the real transform.

When the same person appears in several views at once, choose which one the caption follows. One
caption layer follows one box per speaker at any moment; showing the same words in several places at
once is a hand-built layout of its own.

Leave room for the whole Cue and nearby graphics. Even when the head position is measured accurately, it
may suit a long line poorly as an anchor; in that case go back to the normal caption position.

## Where the boxes come from

This Skill ships no face detector. Tell the user which source this film will use:

- **A detector the user or host provides.** Any face or person detection that returns timestamped
  boxes works. Google Video Intelligence has been used: request `FACE_DETECTION` with
  `includeBoundingBoxes` enabled (face attributes are not needed). It is a paid service on the user's
  own account, so confirm before sending a request.
- **Hand-made keyframes.** Suitable for short passages or a speaker who moves slowly. Pick moments
  before and after each movement, extract full-size frames with ffmpeg, read the head's pixel box,
  and write the keys by hand:

  ```bash
  ffmpeg -ss 4.2 -i composition/generated/guest.mp4 -frames:v 1 renders/k-4.2.png
  ```

  Add keys where the head turns or shifts, not at a fixed rate.

Whichever source you use, check the result on a draft's `render.mjs frames` sheet before trusting it.

## Read detector output critically

A detection box is an observation. It is not the speaker, and it is not a head path ready to use.

- In a Google Video Intelligence response, `timeOffset` is relative to the input video and each
  rectangle is a `normalizedBoundingBox` (`left`, `top`, `right`, `bottom` in 0–1). Use every relevant
  observation, not just the first box a sample program prints.
- Returned tracks are candidates. Look at a representative frame for each and assign the useful spans
  to the target speaker. A track is not a global identity: a cut can split one person into several
  tracks, and a shared shot can hold several people. Merge, in film time, the spans that clearly
  belong to this speaker. Picking the first or the largest face can hang the guest's words on the
  interviewer's head.

## Map into the composition

Every step here is a decision you make and can check; nothing downstream fills in for you.

**Clock.** Write all keys in film seconds. For a clip at `data-start` S, `data-media-start` M, played
at normal speed, source second t maps to `S + (t − M)`. If you measured the original file, also account
for any trim or speed change you made with ffmpeg. Keys measured on a draft are already film time.

Example: the clip sits at `data-start="6"` with `data-media-start="1.5"`; a detection at
`timeOffset` 2.3 s lands at film second `6 + (2.3 − 1.5) = 6.8`.

**Geometry.** Turn detector edges into `[x, y, w, h]` with `w = right − left` and `h = bottom − top`.
Multiply normalized values by the measured video's pixel size, then carry the box through the clip's
real placement on the canvas (scale, `object-fit` crop, offset, picture-in-picture, split screen) as in
[Space: canvas, frames and fitting](page.md#space-canvas-frames-and-fitting).
The result is in canvas pixels. While a view moves or scales, keep mapping through its changing
transform; one fixed rectangle cannot describe motion.

Worked numbers: a 720 × 1280 clip fills a 1080 × 1920 canvas under `cover`, so the scale is
`max(1080/720, 1920/1280) = 1.5` with no offset. A face at left .42, top .30, right .61, bottom .47
becomes `x = .42 × 720 × 1.5 = 453.6`, `y = .30 × 1280 × 1.5 = 576`, `w = .19 × 720 × 1.5 = 205.2`,
`h = .17 × 1280 × 1.5 = 326.4`.

**Head extent.** Grow the face box to cover hair, hat and the margin you want. With padding ratios
pL, pT, pR, pB:

```text
(x − pL·w,  y − pT·h,  w·(1 + pL + pR),  h·(1 + pT + pB))
```

Choose the ratios from the visible head; there is no universal multiplier. With pL = pR = .15,
pT = .45, pB = .1 the face above becomes `[422.8, 429.1, 266.8, 505.9]`. Clamp the result to the canvas.

**Missing observations.** Interpolating or smoothing is an explicit preparation choice. Do it only
within one continuous shot of one person, check the result, and stop at cuts and occlusions. Where no
usable box exists, write `null`.

**Cuts.** Mark the first key after a camera change so the page jumps there instead of sliding the
caption across the cut.

## The heads data file

Keep one set of timed head boxes per speaker, for example `timing/heads.json`:

```json
{
  "width": 1080,
  "height": 1920,
  "tracks": {
    "guest": [
      { "t": 3.2, "box": [423, 429, 267, 506] },
      { "t": 4.0, "box": [441, 418, 267, 506] },
      { "t": 5.1, "box": [441, 418, 267, 506] },
      { "t": 5.6, "box": [612, 690, 214, 330], "cut": true },
      { "t": 7.4, "box": null }
    ]
  }
}
```

These numbers illustrate the shape of the data; they are not a real track.

- Keys are film seconds. Each `box` holds until the next key; `null` means no usable head. The page
  below glides between two boxes in the same shot; to hold a head still and then move, repeat the box
  (as at 5.1 above).
- The renderer allows no fetch, so write the same object as a script inside the composition folder,
  `composition/heads.js`:

  ```js
  window.HEADS = { "width": 1080, "height": 1920, "tracks": { "guest": [ /* keys as above */ ] } };
  ```

  and load it beside the timeline: `<script src="heads.js"></script>` after `timeline.js`, before the
  page script.
- Changing which camera view is used or where the clip is placed may require remapping.

## Captions for the target speaker only

The timeline already ties each speaker's words to their timed Cues. The head keys supply only a
position while this treatment follows the head.

Put that speaker's Cues in a layer of their own, for example `#guest-captions`: `position: absolute;
left: 0; top: 0;` a fixed width, `opacity: 0` in CSS, holding only the guest's Cues. Anchor it at its
bottom centre, so a key's `x, y` is where the bottom middle of the caption sits. Then move the layer
with timeline sets and tweens:

```js
var HEAD_GAP = 40;                                   // canvas px between head top and caption bottom
var layer = document.getElementById("guest-captions");
gsap.set(layer, { xPercent: -50, yPercent: -100 });  // static anchor, applied while building

function spot(box) { return { x: box[0] + box[2] / 2, y: box[1] - HEAD_GAP }; }

var keys = window.HEADS.tracks.guest;
keys.forEach(function (k, i) {
  var prev = keys[i - 1];
  if (k.box === null) {                              // no head: hide the layer from here
    tl.set(layer, { opacity: 0 }, k.t);
    return;
  }
  var to = spot(k.box);
  if (prev && prev.box && !k.cut) {                  // same shot: glide from the previous key
    var from = spot(prev.box);
    tl.fromTo(layer, { x: from.x, y: from.y },
                     { x: to.x, y: to.y, duration: k.t - prev.t, ease: "none",
                       immediateRender: false }, prev.t);
  } else {                                           // first key, after null, or after a cut: jump
    tl.set(layer, { x: to.x, y: to.y, opacity: 1 }, k.t);
  }
});
```

Everything is placed at absolute seconds on the paused timeline, `fromTo` states both ends so any
seek lands correctly, consecutive tweens never overlap on the same property, and nothing depends on
clocks or randomness. A key at second 0 would not render at frame 0 through `tl.set`; write that
first position and opacity in CSS or in the build-time `gsap.set` instead.

The layer is an ordinary untimed element, so animating its opacity and transform is allowed. The Cues
inside it keep the timed opacity their own caption code gives them.

**End on purpose.** Use the Cue's own schedule or a `null` key to end the display at the planned
handoff, including when a hold after the last word would push old words into the next speaker's turn.

When the person leaves the frame, is covered, or appears in another camera, choose explicitly: end the
caption, or switch back to the normal position through an explicit key or a separate layer. Nothing
falls back automatically. Neither a detector track nor a listener's face extends someone's speech. A
speaker without head keys keeps the normal caption position. For hiding captions over a span, use
[Style windows and hiding](captions-build.md#style-windows-and-hiding).

## Check the real placement

- Render a draft and take `render.mjs frames` at the first and last second of every tracked Cue, and
  just before and after each camera change and each speaker handoff
  ([Evidence: frames and grids](../5-deliver/review.md#evidence-frames-and-grids)).
- Look for: room above hair or hat for the whole line, clipping at the top of the canvas, collisions
  with graphics. Then watch with sound for jitter, jumps to the wrong person and reading rhythm.
- When the source timing or the visual placement changes, remap the affected keys. Never reuse stale
  coordinates.

External references: Google Video Intelligence
[face detection](https://docs.cloud.google.com/video-intelligence/docs/face-detection) and the
[`TimestampedObject`](https://docs.cloud.google.com/video-intelligence/docs/reference/rest/Shared.Types/AnnotateVideoResponse#TimestampedObject)
response reference.

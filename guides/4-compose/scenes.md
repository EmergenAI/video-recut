# Designing a scene

Read this before you write code for a new scene, and whenever you decide how a passage should be
organized on screen, how a transition should behave, or how to rebuild a visual system seen in a
reference.

Design a scene the way a director with taste and a careful user would: it should make one idea easy to
read, its behavior should be easy to follow while you produce the film, and it should take only the
inputs this work actually needs.

Other files own the neighbouring decisions:

- [Graphic compositions](graphics-layout.md): visual hierarchy within a frame.
- [Motion graphics](motion.md): how the picture changes over time.
- [The composition page](page.md): the HyperFrames rules every scene must obey.
- [Timing](timing.md): resolving words and clock beats into seconds.
- New caption treatments also need the [captions craft](captions-style.md) and
  [captions execution](captions-build.md) files.

**What a scene is here.** A scene is ordinary code in `composition/index.html`: a set of layers (timed
`<div>`, `<img>` and `<video>` elements and their children) plus one function that builds them and adds
their animation to the page's single paused GSAP timeline. In a large production you may move scene
functions into their own script files inside `composition/`; they still run synchronously before the
timeline is registered.

## Start from what the viewer sees

Begin with the experience, not the component: a comparison becomes clear, an answer settles a question,
a ranking builds up, a phrase lands with weight. Write down what appears, why it is there, what changes,
and what the viewer should remember afterwards. That description suggests both the visual design and
where the scene begins and ends.

Answer these before touching code:

- What does the viewer perceive, and why does it exist?
- Is it a caption, independent typography, A-roll, B-roll, motion graphic, interface, effect, sound, or
  a new character?
- What does it consume (media, words, events), and what does it contribute to the picture or the mix?
- Does it follow a spoken word, a phrase, a segment, an explicit clock span, or another scene's state?
- What changes over time, and what stays visually constant?
- Which choices need an input, and which can simply be designed for this one film?

**Write the ideal call first.** Before implementing, write the single call you would like to see in the
page: the content the scene receives and the events that drive it. For a match scoreboard in a sports
recap it might be:

```js
scoreboard({
  window: { start: segment("s4").start, end: segment("s5").end },
  teams: ["Harbour FC", "Millbrook"],
  score: [1, 0],                                          // already on the board when it appears
  changes: [{ at: MOMENTS.equalizer, score: [1, 1] },
            { at: MOMENTS.winner,    score: [1, 2] }]
});
```

(A design sketch, not rendered.) Then decide what each item does when it arrives: does it appear briefly,
stay once activated, replace the previous state, or reflow the layout? Those differences define a scene
far more than a list of decorative options does.

**Judge it inside the frame.** Look at the scene together with the presenter, the covering picture, the
captions and any other graphics: it needs a clear entry point, useful grouping and a stable state the
viewer can read. Color, density and motion serve the whole frame's hierarchy. Decide how the real text and
media fill their boxes: where lines break, what crops, what scales, how things align.

**Derive related geometry from one layout.** A pointer's end point comes from the button it clicks; a badge
attached to the pointer follows it; two views of the same playing source share its time. When the layout
changes, the motion that depends on it changes with it instead of being re-measured by hand.

## Choose scene boundaries

Draw the unit around shared behavior:

- A board whose rows share one layout and one persistent state is one scene.
- A standalone photo and an unrelated title can be sibling layers.
- An object that survives several cuts keeps one identity and evolves its state rather than being
  rebuilt in each shot.

When a performance shrinks from full screen into a side panel while a chart fills the freed space, the two
can belong to one scene that owns their relative layout, overlap, masks and coordinated motion. The A-roll
still supplies its performance at its placed time; visual ownership follows the behavior you designed.
Captions and independent overlays can stay separate.

Boundaries, inputs and reuse answer different needs:

| Question | Answer it when |
| --- | --- |
| A separate scene? | A part has its own visual job, lifetime or behavior that benefits from its own owner. Keep parts that share geometry, state or motion together. |
| An input? | The production needs an outside choice: a material, a spoken trigger, a position, or a setting you will really adjust. |
| Reuse? | The real uses have a relationship or treatment in common. Put that common behavior in one place, and make configurable only the things those uses actually vary. |

Split only when the parts have meaningfully separate jobs; keep coordinated geometry, state and
transitions together. Helper functions organize code without each becoming a scene. More layers is not
better; a useful division is one that keeps relationships intact as things change. Several segments can
develop one object, and one segment can hold several independent objects. Two objects landing on the
same Moment is not, on its own, a reason to put them in one scene.

Visual grouping and timing are separate choices. A merged scene can respond to spoken Moments; separate
layers can share one event. Where something sits on the canvas does not decide where its time comes from.

Editing material is not the same as changing its display. Trimming or retiming a performance changes the
media file and its word times ([media](../3-materials/media-prep.md)). Crossfading two sources, moving a clip into a panel or
masking it changes only the page; the source's time is untouched.

Build the smallest scene that expresses the role. A one-off scene with fixed labels, sizes, animation and
state is normal work. Reuse across productions is a separate decision.

## Events, lifetime and state

Resolve events to seconds once, at the top of the page script
([place events by relationship](timing.md#place-events-by-relationship)), and pass the numbers into the
scene. A scene never searches the script or guesses when a word is spoken; it consumes instants and
windows. One Moment can drive a reveal, a sound and a flash in three layers, and a new take moves all
three together.

Prefer spoken relationships for events that answer an argument or a performance; use explicit seconds for
authored lead-ins, short entrances and other clock decisions. In a pure motion-graphics piece, name the
events that carry meaning and pace them for reading. A scene that receives resolved seconds works the same
whether they came from words or from the clock.

**The outer window does not time the inside.** In a multi-step interface demo, the grab, the drag and the
drop may each answer a different phrase, so each gets its own event. Fixed offsets or percentages of the
outer window keep neither their identity nor their relationship to uneven delivery. The scene derives the
motion between events itself: pointer paths, button geometry, a click's rebound and decoration stay local.
Motion that simply unfolds across one event interval can use that interval's progress; you do not need a
named event for every keyframe.

Keep three meanings of time apart:

| Meaning | What it is | Where it lives |
| --- | --- | --- |
| **Lifetime** | The outer window: whether the scene is drawn at all | `data-start`, `data-duration` on the timed container |
| **Activation** | An event that changes something inside: an item enters, a value is replaced | a `tl.set` or tween at the event's second |
| **Persistent state** | What remains after activation until the lifetime ends | nothing undoes it before the window closes |

An item's window can mean "draw only during this span", as for an ordinary picture. An activation can play
an item's entrance and leave it on the board. A Moment can swap a placeholder for a lasting answer. A preset
item can already be in its initial state with no trigger at all. Write which meaning applies next to the
scene code.

**Worked example: a packing checklist.** The narrator says "Before the hike, check your bag." (`s1`) and
then "Pack a charger, a map, and water." (`s2`). A card lives from the start of `s1` to just after `s2`.
"Boots laced" is already ticked; each other item ticks on its word and stays ticked, and a meter fills with
each tick. The helpers `segment`, `find` and `frames` are the ones from
[timing](timing.md#place-events-by-relationship).

```css
.card  { position: absolute; left: 140px; top: 560px; width: 800px; padding: 56px 64px;
         border-radius: 36px; background: #f4efe4; color: #1d2a24; opacity: 0; }
.row   { display: flex; align-items: center; height: 120px; font-size: 64px; font-weight: 700; }
.box   { position: relative; width: 72px; height: 72px; margin-right: 40px;
         border: 6px solid #1d2a24; border-radius: 14px; }
.tick  { position: absolute; left: 18px; top: 2px; width: 24px; height: 44px; border: solid #d9582b;
         border-width: 0 10px 10px 0; transform: rotate(45deg) scale(0); opacity: 0; }
.label { opacity: 0.4; }
.row.done .tick  { transform: rotate(45deg) scale(1); opacity: 1; }
.row.done .label { opacity: 1; }
.meter { height: 16px; margin-top: 40px; border-radius: 8px; background: #d8d0bf; overflow: hidden; }
.fill  { height: 100%; background: #d9582b; transform-origin: 0 50%; }
```

```js
var MOMENTS = {
  charger: find("s2", "charger").start,
  map:     find("s2", "map").start,
  water:   find("s2", "water").start
};

// Checklist scene.
//   Lifetime:   opts.window -> the clip's data-start/data-duration; the runtime shows and hides it.
//   Activation: an item with `at` ticks at that second.
//   State:      a ticked item stays ticked, and the meter keeps its level, until the window ends.
//   Preset:     an item with `done: true` starts ticked (in CSS), with no trigger.
//   Motion keeps its own length whatever the word's length: tick 8 frames, meter 10, card in 12, out 8.
function checklist(id, opts) {
  var win = opts.window, items = opts.items;
  var clip = document.createElement("div");
  clip.id = id;
  clip.className = "clip";
  clip.setAttribute("data-start", win.start);
  clip.setAttribute("data-duration", win.end - win.start);
  clip.setAttribute("data-track-index", opts.track);
  var card = document.createElement("div");
  card.className = "card";
  clip.appendChild(card);

  var done = items.filter(function (item) { return item.done; }).length;
  var meter = document.createElement("div"); meter.className = "meter";
  var fill = document.createElement("div"); fill.className = "fill";
  fill.style.transform = "scaleX(" + done / items.length + ")";
  meter.appendChild(fill);

  items.forEach(function (item) {
    var row = document.createElement("div");
    row.className = "row" + (item.done ? " done" : "");
    row.innerHTML = '<div class="box"><div class="tick"></div></div><div class="label"></div>';
    row.querySelector(".label").textContent = item.label;
    card.appendChild(row);
    if (item.at === undefined) return;
    done++;
    // State the rotation at both ends: GSAP cannot recover it from a CSS scale(0).
    tl.fromTo(row.querySelector(".tick"), { rotation: 45, scale: 0, opacity: 0 },
      { rotation: 45, scale: 1, opacity: 1, duration: frames(8), ease: "back.out(2)" }, item.at);
    tl.fromTo(row.querySelector(".label"), { opacity: 0.4 }, { opacity: 1, duration: frames(6) }, item.at);
    tl.to(fill, { scaleX: done / items.length, duration: frames(10), ease: "power2.out" }, item.at);
  });
  card.appendChild(meter);

  // Entrance and exit on the inner card, never on the clip; a hard set closes the fade.
  tl.fromTo(card, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: frames(12), ease: "power2.out" }, win.start);
  tl.to(card, { opacity: 0, duration: frames(8) }, win.end - frames(8));
  tl.set(card, { opacity: 0 }, win.end);
  root.appendChild(clip);
}

checklist("bag", {
  window: { start: segment("s1").start, end: segment("s2").end + frames(12) },
  track: 3,
  items: [
    { label: "Boots laced", done: true },
    { label: "Charger", at: MOMENTS.charger },
    { label: "Map",     at: MOMENTS.map },
    { label: "Water",   at: MOMENTS.water }
  ]
});
```

This example was verified in a render: it lints clean, and frames of the draft show the card absent before
its window, only "Boots laced" ticked before "charger" is spoken, each later item ticking on its word and
staying ticked, the meter stepping with each tick, and the card gone after its window.

Rules the example relies on:

- `.clip` carries `visibility: hidden`. The runtime shows and hides the timed container; the timeline only
  animates the `opacity` and transforms of its children and never touches the clip's visibility.
- Initial states are in CSS, not in a `tl.set` at second 0.
- Every change of state is a tween or `tl.set` at a resolved second, so any frame renders the same when it
  is rendered directly, in any order.
- `segment`, `find`, `frames` and `MOMENTS` come from
  [place events by relationship](timing.md#place-events-by-relationship); `frames(n)` assumes `FPS`
  matches the render's `--fps`.

**Choose motion by the relationship.** Something arriving pulls the eye; something settling marks a new
state; a replacement lets the viewer read what changed; a departure makes room for what comes next. When an event interval
gets longer or shorter, decide which part follows it and which keeps its own readable duration, and say so
in the code, as the comment above does.

## Controls worth exposing

A good input either enables a useful directing choice or connects a real dependency: a media file, words,
an event, a position, or a treatment the work needs to vary. Connect script wording and events to their
owners (`script.json` and the page's named events) and pass materials in explicitly. Placeholder text,
decorative geometry and bespoke animation can stay local to a one-off scene. A fixed design that serves the
work is complete; promote a label to an input only when it later needs to change repeatedly.

Do not add inputs for color, mood, layout mode or easing name just because they might change. One
meaningful input can coordinate many details and keep the design whole; related visual choices can form a
small style object passed to several scenes. A spoken trigger is worth wiring even for a scene used once:
it ties the scene to the actual performance without exposing every animation detail.

**Example.** A film shows someone uploading a receipt in an expense app over a soft gradient background.
The background and the demo have different jobs, so they are separate scenes. Inside the demo scene keep
the button sizes, the panel spacing, the placeholder merchant names and the pointer's path; the pointer, the
dragged receipt thumbnail and the drop zone share one geometry, so they belong together. The demo's inputs
are only the real screenshot, the Moments it answers (say `grab` on "drag" and `drop` on "done"), and
perhaps its position on the canvas. Do not turn a mock interface into configurable software.

**Test the boundary with a change.** A change to one visual job should stay inside its owner; a shared
change should flow through one shared definition. Ask: suppose the speaker hesitates just before the
payoff; which event ought to shift with it, and which local design ought to stay where it is? If the same decision has to be rebuilt in several
scenes, merge its source. If a relationship needs to change in kind, write a new scene rather than piling
up mode switches. When reuse is needed, support the variation that actually occurs: a longer name, another
product, a different number of rows.

**Verify the behavior, not a design still.** In the real composition, look at the key states: just ahead of
the reveal, mid-change, once things come to rest, and on the way out. A frame sheet at those seconds
([evidence: frames and grids](../5-deliver/review.md#evidence-frames-and-grids)) answers hierarchy, legibility,
collisions and timing at once: the answer appears on its Moment, earlier answers stay, later ones are still
hidden, and the whole scene respects its outer window. When several actions follow different phrases,
check with a take whose spacing is uneven; stretching only the outer window hides internal triggers that
were wrongly fixed. Fix the owner (the event definition, the scene's behavior, or the visual idea itself)
and reuse the media already produced.

## Find what already exists

Before writing a new scene, look for one that already expresses the relationship:

- **Earlier scenes in this production.** A caption treatment, card or transition written for one passage
  often fits another. Call the same function with new content and events instead of copying it; when the
  second use needs a real variation, add that one input.
- **The example.** [composition.html](../examples/composition.html) shows stills with push-ins,
  speech placed from the timeline and word-by-word captions built from Cues, all verified in a render.
  Start from its structure.
- **Playbook patterns.** The [playbooks](../formats/index.md) describe recurring relationships and how
  they look on screen: a ranking that accumulates ([ranking listicle](../formats/ranking.md)),
  a presenter sharing the frame with explanatory graphics
  ([presenter-led explainer](../formats/presenter-explainer.md)), a screen carrying the
  evidence ([screen demonstrations](screen-demos.md)).

An existing scene fits when its role, inputs, timing behavior and visual scope match; different words,
colors, spacing or media are ordinary inputs. Record the creative role in the Treatment and the
implementation choice in the page. When nothing fits, carry the relevant relationship into a new scene,
and let the viewer's experience, not the existing inventory, decide what the scene is.

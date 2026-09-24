# How the production fits together

Read this before you turn a Treatment into files, or before you change an existing production. It covers how material, meaning, time, space, presentation and execution relate to each other.

The details live in the other pages of this folder: [generation](../3-materials/generation-requests.md), [media](../3-materials/media-prep.md), [timing](timing.md), [scene design](scenes.md), [composition HTML](page.md), [captions](captions-build.md), [audio](sound.md), [render](../5-deliver/render.md) and [review](../5-deliver/review.md). The creative decisions come from the creation files and the Format and Craft playbooks ([playbook index](../formats/index.md)).

**The governing idea:** an event goes wherever its meaning lands in the performance, and a layer takes whatever room it needs on the canvas. Meaning is not fitted into fixed time slots, and the canvas is not divided into fixed zones to hand out. The piece has one complete span of time and one canvas. Events attach to meaning. A scene boundary falls where content shares layout, state or motion. Semantic coverage doesn't have to fill the time, and visual layers don't have to divide the canvas. You decide which relationships the piece needs. The files and scripts express those relationships and carry them out.

## One timeline, one canvas

`composition/index.html` has one GSAP timeline and one root element with a fixed pixel size. Everything the viewer sees or hears runs on the same program clock and sits in the same coordinate space.

**Time.**
- `timeline.mjs` places each script segment's speech on the film clock and writes `timing/timeline.json` and `composition/timeline.js`.
- Gaps, overlaps and stretches with no speech are all valid. An authored ending can run past the last line of speech, and pure authored animation uses the same program clock with no speech at all.
- **Resolve word events at load time.** An event that answers a word or passage should look up that word's time from the timeline when the page loads. Never type in the second the word happens to fall at in this recording.
- **Independent rhythms share the clock.** A rhythm of its own can use authored clock positions, and a motion can have its own duration. Both still run on the same program clock. [Timing](timing.md) covers placement and event resolution.
- **The timeline doesn't present anything.** Placed speech exists before any presentation is chosen. The timeline does not pick the winning picture, the transition or the mix. An overlap just gives the page two sources, and the page decides what to show and play.
- Independent images, video, graphics and music place their events on the same clock, including events that follow speech.

**Space.**
- The root's `data-width` and `data-height` give the frame size and the coordinate system.
- A layer's box sets where the layer goes. `object-fit` and transforms map the source's real extent into that box.
- A scene owns its internal layout and motion. A presenter and a chart can share one scene while an independent title sits beside it as a sibling layer.
- Boxes can overlap, nest, move and run off the canvas. Normal page stacking decides what covers what: later elements draw over earlier ones, and CSS `z-index` overrides that (`data-track-index` does not affect it). For the geometry, see [space, canvas, frames and fitting](page.md#space-canvas-frames-and-fitting).

**Timing authority and visual extent are separate choices.**
- One scene can follow several spoken events, and separate layers can share one event.
- Filling the whole canvas doesn't mean choreographing to fixed seconds.
- Giving an image a spoken window doesn't make it part of the performance.

**Three clocks.**

| Clock | What it measures | Set by |
|---|---|---|
| Program time | When something appears | `data-start`, the position argument of GSAP calls |
| Source time | Which frame or sample inside the media file plays | The file itself, plus trimming |
| Local animation time | Where a tween is within its own duration | The tween |

A clip placed at program second 5 shows its source second 2 at program second 7. That holds even if a mask only reveals it at that moment. To start partway into a file, cut it first ([cut and keep intervals](../3-materials/media-prep.md#cut-and-keep-intervals)). Audio can also use `data-media-start`. The exact attributes are in [footage layers and the three clocks](page.md#footage-layers-and-the-three-clocks).

## Where each fact lives

Each fact has one home. Downstream files are derived from upstream ones, so change the home and then regenerate what comes after it.

| Home | Holds |
|---|---|
| `BRIEF.md`, `TREATMENT.md` | The user's request, agreements (including paid scope), the creative design |
| `script.json` | Displayed spoken words, segments, speakers, `\|\|` Cue breaks, segment placement (`gap`, `start`) |
| `prompts/` + `composition/generated/manifest.json` | One recorded prompt per generated item; the manifest logs every paid request, its task and its files |
| `timing/timeline.json` (+ `composition/timeline.js`) | Built by `timeline.mjs`: segment placement, per-unit word times, Cues, total duration |
| `composition/index.html` | Layers, scenes, named events, captions, audio placement, motion: the composition itself |
| `renders/` | Drafts, finals, frame sheets and grids: evidence, never a source |

The chain runs: BRIEF / TREATMENT → `script.json` → `prompts/` + manifest → `timing/timeline.json` → `composition/index.html` → `renders/`. The full layout is in [project files](../2-plan/project-layout.md). The renderer serves nothing outside `composition/`, so anything the page loads must live inside that folder.

## Materials and their roles

User files, generated images and video, and material from older projects can all supply the same kinds of material. An image has dimensions. Moving media has its own local time and a picture stream, an audio stream or both. Transparency is a property of a processed picture. Model reference, performed passage and standalone illustration are uses of a file, not kinds of file.

**Performance-carried pieces still get a script.** Short drama and pure A-roll still need `script.json` and a built timeline. The script names the performable passages, and the accepted speech supplies the real timing. This pays off even without motion graphics: you can swap a passage, change a line, place captions or redirect a voice while the relationships hold. A segment doesn't have to match one shot or one speaking turn.

**A-roll is a role.** In a spoken chain, A-roll is the performance that carries a script passage. Its picture can fill the frame, move around, sink beneath evidence, or be absent entirely in an audio-only performance. The role says nothing about source aspect ratio or layer type.

**Identity, role and look are separate questions.** A file's identity, its performance role and its current appearance answer different questions. One performance can feed several views. Replaying its source later is an independent layer with its own placement. Hard cuts and continuous motion are authored ways to change presentation. The timeline keeps performance time while each layer decides how to use the canvas, so a layout change can reuse the same material and word times.

Two kinds of content relationship:

| | Shows what is already on the timeline | Adds something new |
|---|---|---|
| Picture | Material performing that segment, placed at the segment's `start` | A standalone image, prepared video or HTML-drawn surface with its own window |
| Sound | That segment's speech audio, placed by `timeline.js` | Music, effects or ambience, each in its own `<audio>` element |
| Text | Captions built from script units and Cues at spoken time | Titles, labels and other independent type written in the page |

The same video can carry the performance in one place and appear as an independent replay somewhere else. Size and transparency don't decide its role. Assign it by what it does:

- **Existing material vs independent media.** Put a performance video at its segment's position so the lips match the speech. An independent insert gets its own window, often the window of a spoken phrase.
- **Captions vs typography.** The words the viewer hears come from `script.json` through the timeline's units and Cues ([captions](captions-build.md)). Text that isn't spoken is independent text in the page.
- **Audio is added explicitly.** A `<video>` in the page is always muted, and its sound can only enter through a separate `<audio>`. Adding a picture adds no sound, and covering a picture doesn't silence anything.
- **Never double a voice.** When a generated performance carries speech, use either its extracted audio or the TTS file for that segment, never both ([route the voice once](sound.md#route-the-voice-once)).

**Originals and processed files are both explicit.** A cutout and its source image are two files. If a layer shows only the cutout, CSS can't bring the original background back. A scene that needs the background must load the original file.

**Multi-beat scenes need their own speech anchors.** A new scene owns its shared behavior. When key events inside it answer different parts of the performance, each needs its own spoken relationship. Tying only the scene's outer window to speech can't keep several word-linked actions in sync ([scene design](scenes.md)).

## Give each part the direction it can realize

Hold the full creative intent yourself, and translate it into the instructions each part can actually use.

| Receiver | Direction it can realize |
|---|---|
| Image generation (Bibei) | Visible appearance, setting, camera relationship, activity, reference facts |
| Video generation (Bibei) | Dialogue, performance, physical interaction, camera behavior, intended cuts |
| Speech (TTS service) | Wording, vocal character, delivery, a suitable voice reference |
| Composition page | Chosen content, layout, events, treatment, captions, mix |

**Example.** The Treatment calls for a bar chart that grows beside a nutritionist while she lists sugar counts. The image model can't draw a chart that doesn't exist yet. It can, however, render "medium shot, woman standing in the left third of the frame, turned slightly toward frame right, plain wall on the right." The chart scene then gets the right-hand region and one event per count, each tied to the word that names it.

Translate each post-production graphic or on-screen text need into a picture fact the image model can produce. Keep the whole Treatment as context throughout. [Image direction](../3-materials/images.md), [video direction](../3-materials/video.md), [voice direction](../3-materials/voices.md) and [generation](../3-materials/generation-requests.md) own the local decisions and exact wording for each receiver.

Start from the Treatment's description, not from a tool list, and identify:

- the meaningful, performable script passages and who speaks them;
- which performances go on the timeline, and which independent material feeds other layers;
- the pictures and sounds the piece needs, including a plain full-frame performance;
- the relationships that should follow a word, phrase, pause or content event;
- the events that are genuinely clock-based;
- the final deliverables.

Route to the directing knowledge that applies:

- spoken structure: [script and time](../2-plan/script.md)
- A-roll and recurring voices: [voice and performance](../3-materials/speakers-and-narration.md)
- coverage: [B-roll](supporting-footage.md)
- an interface that carries the evidence: [screen demonstrations](screen-demos.md)
- text tied to speech: [captions craft](captions-style.md)
- visual hierarchy: [graphic compositions](graphics-layout.md)
- the changes within it: [motion graphics](motion.md)

A standalone media edit can stop at the requested media file.

**Measured data belongs in the page.** When an observation produces useful data, keep it as data in the page and pass it to the scene that uses it. For example, per-frame head positions measured so captions can sit above a moving head. When the measurement depends on generated material, the loop runs: a first draft supplies the material, you observe it and write the data, and the next render reuses the same media. The loop is covered in more detail in [Caption tracking](captions-follow.md).

## Fix the fact where it lives

Before changing an existing production, establish the current facts that could affect the change:

- the relevant parts of the Brief and Treatment, and `PROGRESS.md`;
- the affected `script.json` segments and prompt files;
- the manifest (`bibei.mjs status`) and the page;
- any relevant diffs. Leave unrelated work intact.

Then change the home of the fact:

| What changed | Where to change it |
|---|---|
| The creative design | `TREATMENT.md` |
| Words, speakers, Cue breaks, segment placement | `script.json`, then rebuild the timeline |
| Which word or phrase an event should follow | The named event in the page |
| Composition, layout, motion, authored timing | `composition/index.html` |
| The shot you want, or media the user asked for | The prompt file. This is a new paid request |

Never hand-edit `timing/timeline.json` or `composition/timeline.js`. They are rebuilt from `script.json`, the speech files and alignment. Never treat generated files or renders as editable sources. They are evidence and reusable inputs.

A change that still uses existing media keeps using it. A change that deliberately asks for new paid media must first fit the agreed paid scope ([before paying](../3-materials/generation-requests.md#before-paying)).

## Reuse produced work

When you revise or retry, keep using produced media that still fits the current intent. Replacing one image or restyling one caption doesn't send every other file back to generation. `bibei.mjs` reuses a result only when the name and the request match: the prompt, the parameters and the content of the reference files ([reuse, versions and failures](../3-materials/generation-requests.md#reuse-versions-and-failures)).

| Change | Keep | Redo or request |
|---|---|---|
| Caption look, motion or layout | All media, speech, alignment, timeline | The page; a new render |
| An event should follow a different word, speech unchanged | All media, speech, alignment, timeline | The named event in the page; a new render |
| `\|\|` Cue breaks or a segment's `gap` / `start` | Speech files and alignment | `timeline.mjs build`, then check the page's word-linked events; a new render |
| Only some B-roll images need replacing | Performances, voice, other useful media | The deliberately replaced images and the page that shows them |
| New presenter, same spoken argument | Unaffected B-roll, icons, music | New presenter images, the affected performance videos, the speech and alignment if the voice changes, the page |
| A new product changes the demo or the claims | Views and media whose content still applies | Affected product views, performances, speech, timeline, visual treatment |
| The same speech needs realigning | The speech file | `bibei.mjs align … --replace`, then `timeline.mjs build` |
| New wording for one segment | Other segments' speech and alignment | That segment's TTS, its alignment (`--replace`), the timeline, dependent events |

**Recheck word events after a script edit.** Word-linked events in the page resolve by segment id plus a unit index or text. Editing a segment's text can shift unit indices or remove the text an event searches for. After a script change, check every named event that refers to that segment ([place events by relationship](timing.md#place-events-by-relationship)).

**Don't pass off an old render as the changed composition.** It hides the change. After swapping a person or product, check which files the page still loads. If the page still points at the old presenter video, that person stays on screen no matter how you rewrote the image prompt.

**Generate only what the change needs.** Leave unrelated work alone. For example, fixing three B-roll stills that show the wrong café means three new image requests and three `src` changes in the page. That is no reason to request a new presenter performance.

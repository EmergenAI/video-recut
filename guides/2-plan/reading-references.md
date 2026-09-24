# Reading a reference video

Read this when a video file or link is evidence of what the new piece should keep, adapt or borrow.

The goal is a semantic reading anchored to timecodes: what the piece communicates, and which concrete
choices of picture, sound, text and motion make it communicate that. When the reference is a link,
save it locally with yt-dlp ([download a reference video](../3-materials/media-prep.md#download-a-reference-video))
and keep the file in `reference/`.

## Read the whole and the detail together

1. **Watch it through first.** Note the hook, the argument or story, where attention shifts, the payoff
   and the reaction the piece expects. Read the speech with its timing. Note who carries the
   performance, what the pictures add, and which caption, motion, typography, effect or audio systems
   keep returning or stay on screen. Sketch a working theory, open to revision, of why the piece succeeds.
2. **Describe every design element concretely:** its content and look, where it sits relative to other
   things, how it enters, what it does while present, how long it stays, how it leaves. Tie it to the
   word, pause or action it serves, and say what it does for the viewer: establishes a character,
   contrasts a claim, stacks up evidence, amplifies a reaction, makes a process readable, hands
   attention to the next idea.
3. **Let each level feed the other.** The meaning tells you where to look closely; close looking
   supplies the detail a rebuild needs and often exposes a purpose or link the first viewing missed. An
   explanation is worth something only if it explains specific choices.

When a choice puzzles you, widen the view: the surrounding words, neighbouring events, where the element
appeared earlier and what follows from it. Read the matching Format or Craft playbook
([formats index](../formats/index.md)) to sharpen the question.

A motion's name ("slides in", "pops") is only a starting point. Look at the path, the scale and opacity
change, the speed, any overshoot or settle, and how it relates to neighbouring events. For graphics,
look at hierarchy, type, colour and spacing: what the viewer reads first and what they then compare.
Find the continuous behaviour that connects frames; what looks like a dim duplicate at an exit may be
the same object fading out, and only the sequence tells you.

An object that survives a cut belongs to a system with a longer life than the shot. Track its state (a
new arrival may replace, append to or temporarily cover what was there), describe the system once, and
locate its changes in time. Shot boundaries help you navigate; meaning and continuity decide what
belongs together.

### Talk while you read

Explain to the user what a discovered timing, placement or movement does for the viewer and what it
suggests for the adaptation. Share a representative frame or a word-sampled sheet when it helps. Say the
provisional reading first, then how new evidence deepened or changed it. The Analysis and Timeline hold
the detail; the conversation keeps the user oriented and invites their taste. Routine progress does not
need fresh approval.

A short example of the voice to use:

> 0:00–0:03: the host never says "hook"; the hook is the price tag stuck on her forehead. She reads the
> list without noticing it, and the tag only gets explained at 0:21 when she peels it off to show the
> real price. So the opening is a planted question, not a joke. For your version, Lin can wear the old
> air fryer's receipt the same way and drop it into the rice cooker's steam at the payoff. I'll check
> whether the tag is also in the thumbnail frames next.

### What the reading must produce

- **Behaviour you can rebuild.** A still may be enough for a static layout; a changing comparison also
  needs its entry, states and hand-off. Record what objects do together. You do not need to guess the
  original author's code or layer structure.
- **An explanatory model for this commission.** When the person, product or words change, which
  relations survive and which need redesign? Record the observed behaviour first, then decide how the
  target realizes it. Picture, text and motion that move together may become one scene or one layer in
  the new piece; a recurring appearance may be one object's changing state.
- **Coverage.** The whole film, every independent system, and how each changes. Repeated behaviour can
  share one explanation, with each variant and hand-off located. Keep unresolved questions at the
  source time where they arise.

## Make time visible with speech alignment

For a reference with speech, extract the voice track as mono 16 kHz WAV and submit it to Bibei alignment
for word-level times:

```bash
ffmpeg -i reference/source.mp4 -vn -ac 1 -ar 16000 reference/source-speech.wav
node <skill>/scripts/bibei.mjs align ref-speech reference/source-speech.wav --language en --dir reference
```

This writes `reference/ref-speech.alignment.json` and records the request in `reference/manifest.json`.
Running the same command again reuses the finished result.

- Alignment is a Bibei request charged to the user's account; it belongs to the paid scope agreed in
  the [Brief](brief.md).
- Each upload must stay under 10 MB; a 16 kHz mono file reaches that at roughly five minutes of speech.
  Cut a longer reference into parts with FFmpeg, align each part under its own name, and add the part's
  start to its word times:

  ```bash
  ffmpeg -i reference/source-speech.wav -ss 0 -t 240 reference/source-speech-1.wav
  ffmpeg -i reference/source-speech.wav -ss 240 -t 240 reference/source-speech-2.wav
  ```

  (Times in `ref-speech-2.alignment.json` then need +240 s.)
- Pass the spoken language explicitly: `--language zh`, `en`, `es`, `ko`. Which languages actually
  work is up to the Bibei service ([alignment](../1-setup/services.md#alignment)). Chinese speech
  with English brand or person names still takes `zh`. Chinese comes back timed per character; group
  characters into meaningful phrases before you describe them or write new lines from them.
- The recognized spelling is the recognizer's interpretation. Coined words and unfamiliar names are
  often replaced, and a different spelling does not prove a mispronunciation. Use the result to recover
  content and locate moments; the new piece's pronunciation is settled in
  [script and time](script.md).

**When alignment is unavailable** (`bibei.mjs models` has no `alignment` group, or `align` reports the
endpoint does not exist), say so plainly and read time another way. Never invent exact word times.

- Sample the whole film evenly and compare with the picture changes:
  `node <skill>/scripts/render.mjs grid reference/source.mp4 reference/evidence/overview.png --every 1`.
- Write the transcript by hand from listening, burned-in captions or the platform's subtitles
  (`yt-dlp --write-subs --write-auto-subs --skip-download "<url>"`), marking each sentence with the
  nearest observed time.
- Find phrase boundaries with silence detection:
  `ffmpeg -i reference/source-speech.wav -af silencedetect=noise=-35dB:d=0.25 -f null -`.

Mark those times as approximate in `TIMELINE.md`, and reopen the passage when an exact relationship
matters.

A piece without speech is located through the actions and changes on screen.

## Tools and scale

| Need | Tool |
| --- | --- |
| Duration, size, frame rate, whether there is audio | `ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of json reference/source.mp4` |
| Cut out a passage | `ffmpeg -ss <start> -i reference/source.mp4 -t <length> <clip>` |
| Chosen instants on one time-labelled sheet | `render.mjs frames` |
| The whole file sampled at a fixed interval | `render.mjs grid` |
| A list of hard changes | FFmpeg scene score (below) |
| Save a supported video link | yt-dlp |

Scene changes:

```bash
ffmpeg -i reference/source.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep pts_time
```

In PowerShell use `| Select-String pts_time` instead of `grep`. Each `pts_time` is a source second.
Lower the threshold to 0.2 to catch soft transitions; raise it when camera movement floods the list.
The boundary list is a map for navigation, not an interpretation.

### Frame sheets

```bash
# overview of the whole film
node <skill>/scripts/render.mjs grid reference/source.mp4 reference/evidence/overview.png --every 1 --width 180 --cols 6
# the instants where chosen words begin
node <skill>/scripts/render.mjs frames reference/source.mp4 reference/evidence/list-words.png --at 8.42,9.10,9.71,10.25 --width 480 --cols 4
# every frame of a movement: cut the passage, then sample at 1/fps (here 30 fps)
ffmpeg -ss 12.0 -i reference/source.mp4 -t 1.5 reference/evidence/tag-peel.mp4
node <skill>/scripts/render.mjs grid reference/evidence/tag-peel.mp4 reference/evidence/tag-peel-frames.png --every 0.0333 --width 240 --cols 8
```

- **Clocks.** A cut clip has its own clock starting at 0, so its sheet labels are clip seconds; add the
  cut's start to record source time. `frames` labels source seconds directly, so prefer it for a few
  exact instants. A time label is valid only for its own media, and word times must come from an
  alignment of that same media (a separately aligned part shares its clock with the part's cut).
- **Choose instants by the question.** One frame per second across an opening; dense sampling across a
  hand-off; or the start times of target words taken from the alignment file. The sheet itself labels
  only seconds; keep the word-to-time notes in your notes so labels never cover the original captions or
  motion.
- **Use the alignment as a guide.** Find the phrase you want to understand, take its start and end, and
  sample with some margin on both sides.
- **Keep adjusting range, interval and cell size.** Go wide to follow the argument and persistent
  systems; go narrow and dense for entries, changes and hand-offs; enlarge a single frame
  (`--width 720`, one or two columns) to read type and spatial detail. Read a long reference in parts,
  but keep its overall development clear.
- **Mind the gaps between samples.** A wide overview can miss a brief event. Track the entry, change,
  persistence and exit of words and visual systems at a density that fits them; a few representative
  frames cannot give a temporal account; keep the range wide enough to see the hand-offs on both sides.
- **Captions.** Inspect every meaningfully different configuration (speaker treatment, position,
  emphasis, Cue shape, animation) and the transitions between configurations. Repeated uses can share
  one description with their content and timing differences noted.
- **Conflicting readings.** Reopen that source interval until the detail is legible. Keep what you can
  actually see or hear apart from your inferences about it. Player controls and overlays belong to the viewing
  interface, not the video.
- **Target against reference.** Render a production draft and sample both at the same meaningful events
  ([evidence frames and grids](../5-deliver/review.md#evidence-frames-and-grids)); align by what the
  event means, then compare the frames.

Save useful evidence under `reference/evidence/` with descriptive names.

## Keep a coherent record

Write into the project as understanding grows: the overall explanation and the detailed readings, with
source times and evidence paths, so someone else can take over from the files. Record what each choice
does for the viewer as well as how it looks.

- **`reference/ANALYSIS.md`** is the whole model: the piece's goal, how story and pace work, what each
  sound and picture system contributes, which systems persist or recur, how distant moments relate.
  Keep fact and interpretation distinguishable in the prose.
- **`reference/TIMELINE.md`** is the implementation you can locate in time. Name each section by source
  time and meaningful phase; in each, connect the active objects and their detailed behaviour to the
  words or actions they serve, enough for someone to find the event, understand what it expresses and
  build a counterpart. For example:

  > ### 0:08.4–0:11.9 — the four "don'ts", accelerating
  >
  > The host counts off four things not to put in the pot ("frozen", "rinsed", "salted", "stirred").
  > Each word brings a hand-drawn card in from the right edge, landing on the word's first syllable and
  > stacking slightly offset over the last one; the stack never clears until the reversal at 0:12.0.
  > The gaps shrink (0.68 s, 0.61 s, 0.54 s) while her delivery speeds up, so the pile feels like it is
  > getting out of hand, which is the set-up for "or just don't cook at all". Cards carry the word in
  > black marker on white, no caption duplicates them.
  > Evidence: `evidence/dont-cards.png` (frames at word starts), `ref-speech.alignment.json` words 21–27.

  Sections may overlap, and dense passages may carry finer time notes. A persistent title, board, music
  bed or caption system can span several sections; describe it once and refer to it where it changes.
  Keep exact text, meaningful colours, positions, motion phases and times where they matter, and go
  back to the media to confirm anything uncertain.
- **Use production terms by function.** A-roll carries the semantic performance, even as a small
  picture-in-picture or when covered by full-screen B-roll. A Caption shows the speech; Typography is
  independent text. Motion graphics and UI can carry their own text. One sound can support a single
  argument across several picture changes. Choose role names that clarify this particular piece.

## Turn understanding into new direction

- **Record relations, not only seconds.** Source time locates evidence. Write down the expressive
  relation as well: a reveal answers a question, a picture illustrates a phrase, an exit clears space for
  the next claim, an audio hand-off brings in the next speaker under the previous picture.
- **Let the request decide how relations survive.** A new person or product may change the argument,
  the copy, the number of examples, the graphic content, positions and durations; think it through with
  [transformations](adapting.md). Name the meaningful word spans and events with the target
  script's words, and let the accepted performance supply the time
  ([place events by relationship](../4-compose/timing.md#place-events-by-relationship) resolves them to
  seconds).
- **Generated camera shots.** [Image direction](../3-materials/images.md) turns an observed
  look into coherent styling and set direction; the reference notes keep the observations behind it.
- **Designed pictures.** [Scene design](../4-compose/scenes.md) turns the target relations into
  layers, states and events. One system can span several shots and one shot can hold several independent
  systems; set new scene boundaries by shared behaviour.
  How the overall design is split into separate instructions for material and composition is explained
  in [Give each part the direction it can realize](../4-compose/overview.md#give-each-part-the-direction-it-can-realize).
- **Completeness.** The record should explain the whole film from start to end, locate each visual
  system and its changes, and be concrete enough to direct the new piece: what to keep or adapt, how to
  express it, and why it belongs. Keep investigating any unresolved relation that could change the
  direction.
- **Progress.** `PROGRESS.md` holds the current question, the passages or systems still to read, and
  the next step. Write findings into the Analysis or Timeline while they are fresh, and revise them when
  your reading changes. Picking up again means rereading these files and returning to the source at the point they record. The
  user's goal lives in the Brief; the new design in the Treatment.
- **Keep timing evidence for performed events.** When the adaptation depends on a performance, physical
  action or camera relation that unfolds over time, save a useful source clip as timing evidence for the
  new shot. [Video direction](../3-materials/video.md) explains what such evidence can and
  cannot carry into a video request. The Analysis explains the point; the clip preserves the behaviour
  to study while directing.

# Two-person podcast

Come here when the argument is carried by how two people relate: a question draws out a claim,
a reaction changes what it means, a reply pays it off.

Let that relationship drive composition and performance.

## Build the pair from one useful first view

Generate Host A first, in a real setting. Derive Host B's complementary view from that image: opposite
screen position and eyeline, microphone entering from the other side, a different part of the same
room behind them. The opening view sets up the world the two share; its counterpart shows what the
other camera sees instead.

These idle views ([image direction](../3-materials/images.md) explains idle views) hold a relaxed
conversational posture: each host turned toward the other, face readable from the chosen camera. The
attitude is already there and can develop turn by turn.

Reference dependencies, for an invented show about sleep habits with a sunrise alarm clock as the
product:

```text
Host A view ─────────────────► Host B view
Host A view + clock reference ─► Host A holding the clock
Host B view + clock reference ─► Host B holding the clock
Host A view (+ logo) ─────────► each lifestyle scene (dark bedroom at dawn, kitchen, bus stop)
Host A view + Host B view ────► optional split-screen opening image
```

Most new views are one step from a useful parent. All lifestyle scenes derive from Host A's view, not
from each other. A holding-the-product view inherits its own host's camera and adds the real product
reference; it keeps eyeline, setting and microphone position and changes only the prop state. A
user-supplied image made elsewhere is also a valid reference.
[Conversation images](../3-materials/conversation-image-examples.md) shows concrete production direction and
what each reference is responsible for.

## Direct the conversation shot by speaker

Cast two voices with [voice direction](../3-materials/voices.md). Render TTS one segment per speaker
turn, each with its `speaker`. The script is the only dialogue text. Build `timing/timeline.json` from
these segments; it records where each turn starts and ends, and every cut follows from it.

Make each turn one MiniMax H3 shot (15 seconds or less): the current speaker's view as reference image,
that turn's speech file as reference audio. Split a turn longer than about 14 seconds into two segments
at a turn of thought, then either cut between two shots of the same view or insert a listener shot
between them.

```bash
node <skill>/scripts/bibei.mjs video b-turn-3 --model <minimax-h3-key> --prompt-file prompts/b-turn-3.txt --duration 7 --ratio 9:16 --ref-image composition/assets/host-b.png --ref-audio composition/audio/b-turn-3.wav --dir composition/generated
```

Use the account's MiniMax H3 key from `bibei.mjs models`, and agree the shot count and cost with the
user first ([video requests](../3-materials/generation-requests.md#video-requests)).

Place each shot as a muted footage layer at its segment's `start`, so the picture changes host exactly
when the voice does; the voice plays from its own `<audio>`
([place events by relationship](../4-compose/timing.md#place-events-by-relationship)).

### Sound of record

For every visible speaking shot, the segment's TTS file is the one sound of record and the generated
clip plays muted over it. H3 fuses reference audio into the video but does not promise lip-sync. Check
the first shot muted against its speech file before requesting the rest ([talking
head](talking-head.md) has the procedure). If that short test shows the clip's own speech is better,
extract it as that segment's audio, align it and rebuild the timeline; never keep both
([route the voice once](../4-compose/sound.md#route-the-voice-once)). AutoDL's dedicated lip-sync
workflow `minimax_h3_image_audio_to_video` is not on Bibei at the time of writing.

### Listeners and multi-turn requests

A listener reaction worth cutting to is a short shot with no reference audio: the listener's view plus
a prompt that keeps them silent but alive. Place it over the speaker's words while the voice continues
underneath. A silent listener stays alive through posture shifts, a brief look down and back up, and a
focused expression, without speaking.

One request holding both views and both voices, even several short turns, fits the limits (9 images, 3
audio files). Whether it gives each voice to the right host, in order, at the times the timeline
expects, has not been tested; try it on one short exchange first. One shot per turn is the reliable
default; anything over 15 seconds is several shots regardless.

### Prompt principles

There is no proven Bibei wording for this request yet. Write each prompt from these principles:

- Say which reference image is which host's view.
- Preserve both identities, outfits, the room, light, props, camera sides, lens feel and seating.
- Speaker map: only the host who owns the current line moves their mouth; listener inserts stay
  silent. Map the script's speaker names to the hosts explicitly in the action direction.
- Framing: each host keeps their base crop, or makes one gentle push on an important phrase or reaction
  and returns to base.
- Rhythm: tight handoffs, each line natural and unbroken.
- Choose performance tone, reactions and gesture size for this pair.
- Clean dialogue with room tone, realistic and stable picture, no readable text of any kind.
- End with this shot's lines exactly as in `script.json`, then this passage's action direction.

A single-host shot keeps only the parts that apply to that host.

Starting point, not yet proven (invented):

```text
The first reference image is Host B's camera view. Keep her identity, the grey knit sweater, the
bookshelf behind her, the warm lamp light and the microphone entering from the right, exactly as in
the reference, in the same framing throughout, with one gentle push-in on "every single morning" and a
return to the original framing. Host B is the only person speaking. Clean dialogue with quiet room
tone; realistic, stable picture; no readable text.

Line: "I tried it for a month, and I woke up before it went off every single morning."

Action: Host B (speaker "b" in the script) says this half-confessing, half-proud, one small open-hand
gesture toward Host A off screen on the last words.
```

When a wording works, save it in the project's `prompts/` folder and note in `PROGRESS.md` what it
achieved and on which model.

The action direction adds this passage's attention and interplay: who is claiming, who doubts, when a
reaction deserves a cut, who is holding the product.

## Make prop handoffs readable

A handoff needs clear ownership: A holds the product out toward the other host; B takes it in the
complementary view; later shots show who has it.

Shot-by-shot production makes this easier. Each shot's reference image carries the prop state it
needs: the handing-over shot uses "A holding the clock"; the receiving shot and B's later shots use "B
holding the clock"; A's later shots return to the empty-handed view. A few clear relationships are more
useful than specifying every finger. Let the cut carry the handoff; do not chain frames between shots.

A pair of action directions (invented):

- Giver: "Host A, a little smug, lifts the clock from the table and holds it out toward the right edge
  of frame, keeping it casual and the gesture compact. No lines."
- Receiver: "Host B, curious, reaches in from the left edge and takes the clock, turns it once to look
  at the face. Casual, compact, no lines."

These depend on the matching views and the product reference. If the handoff is digital (sending a
link by phone), make it a screen or conversational interaction instead of a physical pass.

## An opening can establish both people at once

Split the frame top and bottom and the pair is visible before the first question is over: one panel speaks; in the
other, the listener looks down, settles in the chair and looks back up. Small silent actions establish
that the conversation is already under way.

Two ways to build it:

- **One request:** a composed split-screen reference image, the question's speech file and matching
  direction. Invented direction: "Keep the top-and-bottom layout throughout. The top host asks the
  question. The bottom host glances down at her notes, shifts in her seat, then looks up toward the
  other panel and stays silent. Both panels feel like one conversation; no big gestures, no frozen
  stillness."
- **Assembled on the page:** the speaker's turn shot in the top half and a silent listener shot in the
  bottom half, each a footage layer cropped into its half. Each panel performs independently, and the
  layout can dissolve into ordinary speaker cuts.

Use a split only when that attention device serves the work.

## Coverage follows the idea, not every noun

Example (invented): Host A lists how badly the alarm used to wreck her mornings. Generate the lifestyle
scenes together as one short silent montage: one request, the scene images as references in order, no
reference audio, direction that names each scene and its small action and cuts between them. Place it
over the span from where Host A starts the example to where Host B starts replying. The viewer grasps
the larger habit; every cut need not land on a noun.

Let the montage play once at its natural speed. Its layer's `data-duration` is the clip's measured
length, not the span's. The span can be slightly longer than the clip; when the clip ends, the host shot
underneath returns. The partner's voice can start before the picture returns, a J-cut: B's `<audio>`
starts at its segment's `start` while the montage still holds the screen. Do not freeze the last frame
or change speed to fill the gap; stretching changes the motion.

When scenes must land on exact Cues (especially in a recreation), use separate clips instead: generate
each within 15 seconds, cut it to the needed part with ffmpeg
([cut and keep intervals](../3-materials/media-prep.md#cut-and-keep-intervals)) and place it on the words it
answers. [B-roll](../4-compose/supporting-footage.md) covers source length, short windows and seamless edges.

Host-coloured captions name the speaker even over full-screen B-roll: the caption class follows the
segment's `speaker` ([style windows and hiding](../4-compose/captions-build.md#style-windows-and-hiding)).
Coordinate them with the set's palette and the product treatment, and choose colours for this pair.

Review the whole piece for responsive timing, restrained reactions, prop continuity and an ending that
feels earned.

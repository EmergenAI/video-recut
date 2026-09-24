# Voice and performance

Read this when deciding which performance carries a passage, how one character keeps one voice across
the work, and whether an off-screen passage continues someone's on-camera performance or stands as its
own narration. Casting and directing the voice itself belong to [voice direction](voices.md).

## Segments and the performance that carries them

A **segment** is one performable passage in `script.json`. Before production it has an identity and a
meaning but no length. The **A-roll** is the performance that carries it. Once the performance exists,
its media has a measured duration, and after `timeline.mjs` aligns (or estimates) the audio, its words
have film times.

- A **visible** performance brings picture and sound: a person on camera saying the lines.
- An **audio-only** performance brings sound alone; other layers supply the picture.

By default `timeline.mjs build` places each segment's speech a short `gap` (0.25 s) after the previous
one ends, or at the `start` you wrote for it. Graphic-only stretches can sit before, between or after
segments. The exact placement rules live in [build the timeline](../4-compose/timing.md#build-the-timeline).

Ask of every passage: **who is speaking here?** The number of people in the frame is not the number of
speech clocks. A conversation with a listener in shot, or a performance cut between three angles, can
still be one segment.

A recurring person (host, podcast guest, interviewee, character) owns the time of their lines even when
another picture covers them. Overlays, captions, motion graphics and effects all take their seconds from
the time that performance establishes.

If an edit changes how long a performance actually runs, prepare the edited audio first, align it again,
then rebuild the timeline. Nothing downstream should keep the old timing.

A passage without words can still be a real performance (a dance, a reaction held for a beat); the
media's own start and end give it its window. A graphic-only stretch lasts as long as you author it.
`timeline.mjs` needs words, so neither is a segment: leave room for them with `gap` or `start`. Choose by
what the passage contains.

## A performance is a role, not a picture

A-roll names a role. Its material, its relation to the script and its place on the timeline stay the same
however the picture is used. One performance can fill the frame, sit in half a split screen, shrink into
a corner of a diagram, return later, or leave the frame entirely, and it can do all of that inside one
segment or across several.

A covering shot that happens to show the same person (pouring coffee, walking to the desk, no lines) is
not a new source of speech. Size, crop, transparency and whether a face is visible do not decide the
role; what the shot is used for does. The same file can also be reused elsewhere on its own clock.

On the page:

- every `<video>` is muted;
- the performance's sound is its own `<audio>` element placed at the segment's start;
- the performance's picture is a footage layer you may crop, scale and position freely
  ([footage layers and the three clocks](../4-compose/page.md#footage-layers-and-the-three-clocks),
  [space, canvas, frames and fitting](../4-compose/page.md#space-canvas-frames-and-fitting)).

When the picture changes for emphasis, choose a hard cut, a held layout, or continuous movement. For
continuous movement, the footage keeps playing from the same source position while only the view moves.
For a hard cut, the two states meet at the event you chose. In both cases the voice stays where it is.

## Neighbouring performances keep their own time

Place adjacent A-roll segments one after the other. Neither should eat into the other's duration.

The reason is how the takes are made. Each generation request is sized to the lines it carries (roughly
4–5 CJK characters or 2.5 English words per second before speech exists; the real length from `ffprobe`
afterwards). A speaking-video model spends the whole request on the performance, so asking it for silent
handles at head and tail works against it. A crossfade that consumes time eats into word windows,
stacks voices at the seam and breaks the rhythm.

For ordinary talking heads, podcasts, interviews and short dramas, the timeline's default short `gap` is
the join. Visual overlays and effects may still cross the seam.

When the overlap is the point (an interruption, dialogue spoken over dialogue, a line phrased to music),
give the segment a `start` pinned on the film clock, earlier or later than it would fall, and its own
`gap` for what follows. Each speech file keeps its own timing; any dissolve between pictures is a visual
matter, and any audio handoff is baked into the files as
[speech segments](../4-compose/sound.md#speech-segments) describes.

## One character, one accepted voice

The question is what a recording is used for, not whether it exists:

| The recording is… | What you do |
| --- | --- |
| The performance itself | Prepare it with ffmpeg and align it to the script. If its picture stays, it becomes a footage layer. |
| A reference for a new performance | Cut a short, clean sample and use it as the voice for new lines. |
| Absent | Design a voice from a description if the TTS service can; clone from a sample if it can; if it only offers presets, the chosen preset is the voice. |

A **voice sample** is ordinary accepted audio. Store it in `composition/audio/` (or `composition/assets/`)
under a stable name, such as `composition/audio/voice-mara.wav`, and reuse that same file, clone or preset
everywhere that character speaks.

- In newly generated performances, each speaking character has one voice. A silent listener does not gain
  a voice by being in shot; when they speak elsewhere, they bring their own sample.
- If the user supplies a specific private voice, cut a clean, representative excerpt as the sample.
  Otherwise cast through [voice direction](voices.md). A generic or imagined voice can be
  designed directly.
- For a new character, about five seconds of clear, natural designed speech is a good start: cheap to
  make and easy to pass into a speaking-video request. Pick a line that shows the tone you need. Leave out
  other voices, music, clipping, heavy reverb and long silences.
- When one request holds several speakers, give each a compact sample. MiniMax H3 on Bibei takes at most
  3 reference audio files, each 10 MB or smaller. Check other limits (count, length, format) with
  `bibei.mjs models` and with the TTS service ([speech (TTS)](../1-setup/services.md#speech-tts)).

## One voice, two kinds of performance

The dependency is shallow:

```text
designed / cloned / preset / supplied voice
                 │
                 ▼
        accepted voice sample
           ┌─────┴──────────────────────┐
           ▼                            ▼
  visible A-roll                 audio-only A-roll
  (TTS of the segment +          (TTS of the segment,
   video request with the         one file per segment)
   speech as reference audio)
```

The TTS service takes the voice and the segment's text and returns a file as long as the passage, not as
long as the sample. The video request takes the character's image and that speech. Two uses, one vocal
identity.

A work can mix both. A host who speaks on camera in one passage and narrates over a product demo in
another is one person because the voice is the same. A passage covered by B-roll may still be the voice
of the A-roll underneath. Judge by how the passage is built, not by whether the face is visible at this
second.

## Choosing visible or audio-only A-roll

### Visible A-roll

Generate it with MiniMax H3 on Bibei ([video requests](generation-requests.md#video-requests)):
the character's camera image as `--ref-image`, the segment's rendered speech file as `--ref-audio`, the
exact lines in the prompt file, and a duration of 15 seconds or less. A casting sample only establishes
timbre; it need not share words with the final lines.

**The sound of record.** By default the segment's TTS file is the one sound the film carries, and the
generated clip plays muted over it. Switch a passage only when a short test shows that the clip's own
speech is better *and* in sync with its mouth. Then:

1. extract the clip's sound with ffmpeg as `composition/audio/<segment>.wav`
   ([source sound from footage](../4-compose/sound.md#source-sound-from-footage));
2. name it as that segment's `audio` in `script.json`;
3. align it with `bibei.mjs align` and rebuild the timeline;
4. keep the muted video at the segment's start, so words, captions and picture share one clock.

Never keep both the TTS file and the clip's sound for the same passage
([route the voice once](../4-compose/sound.md#route-the-voice-once)). Record which one is the sound of
record in `PROGRESS.md`.

**What MiniMax H3 does not promise.** The workflow fuses reference audio into the video; it does not
promise lip-sync. Before paying for the rest, make one short shot and watch it muted against its speech
file: does the mouth follow the words, and does the model treat the audio as the voice to perform rather
than a clip to play back? AutoDL's dedicated lip-sync workflow (`minimax_h3_image_audio_to_video`) is not
on Bibei at the time of writing.

**Prompt wording.** No wording has yet been proven for this model on Bibei. Follow these principles:

- Say what each reference file is for. The image is the visible speaker and scene: keep identity, outfit,
  setting, lighting and framing. The audio is the voice to perform.
- Ask for the lines to be spoken verbatim and in order: no rewording, additions or omissions.

Starting point, not yet proven:

```text
The first reference image shows the speaker and the room; keep her face, green cardigan, the bookshelf
behind her and the soft window light exactly as shown. The first reference audio is her voice; she speaks
these lines in that voice, word for word and in this order, adding and dropping nothing:

"Three weeks in, I finally stopped fighting the sourdough. Here's what changed."

She leans in slightly on "finally", half-amused at herself.
```

When wording works, keep it in the project's `prompts/` folder and note in `PROGRESS.md` what it achieved
and on which model.

### Audio-only A-roll

Use it where the passage narrates independently: a first-person screen demo, a narration-led montage, a
motion-graphics explainer, the product segment inside a host-led piece. TTS renders the accepted voice
with the segment's text, one file per segment (`composition/audio/s1.wav`, `s2.wav`, …). It plays the
A-roll role but supplies no picture. `timeline.mjs` places and times the files in order, and the page
builds one `<audio>` per segment from the timeline.

Choose audio-only because the passage speaks on its own, not because a picture happens to cover the
speaker.

Keep every segment of one speaker on the same voice, service and settings, or the timbre drifts. After
re-rendering a segment, listen to it side by side with its neighbours.

## Voice-over is a relationship between sound and picture

Voice-over means the viewer hears speech while the speaker is not the main visible action. That alone
says nothing about how the speech was produced. Three common shapes:

- **Visible performance leads.** Covering pictures replace the face for a while; the visible A-roll is
  still the authority on time.
- **Independent narration leads.** Audio-only A-roll; the picture is designed separately.
- **Mixed work.** Choose the relationship segment by segment; the character's voice does not change.

Keep three questions apart:

| Question | What it decides |
| --- | --- |
| Is the speaker off-screen at this moment? | The viewing relationship |
| Is the voice supplied by a visible A-roll that is covered, or by A-roll that exists only as audio? | Where the sound is produced and who owns it |
| Is the segment led by a visible performance or by independent narration? | How the passage is built |

The same visual language can answer differently. Compare:

- A cooking explainer runs a persistent animated recipe card for forty seconds: ingredients slide in,
  quantities tick up, a timer spins. The card carries the explanation, and the voice is independent
  narration over it (see [graphic compositions](../4-compose/graphics-layout.md)).
- A chef is mid-sentence at the counter; for two seconds a graphic of the oven dial covers her, then she
  is back, still talking. The graphic is an overlay on her A-roll, and her performance owns that time.

Duration can hint at the answer but does not settle it. Ask: what carries the argument, the attitude and
the progress? Is there an on-camera performance that naturally continues through the overlay?

Segment boundaries express the modules of the work, not source labels. One narration segment can hold
several motion-graphics steps hung on named word spans or moments of the timeline. One performance segment
can begin under a graphic and reveal the speaker later. Splitting one generation into two segments does
not make either of them audio-only.

## Real performance takes real time

Estimating, measuring and aligning time belong to [script and time](../2-plan/script.md) and
[speech timing from alignment](../4-compose/timing.md#speech-timing-from-alignment). Once a performance
has a measured length, everything that depends on it follows the real delivery: when speech changes,
rebuild the timeline; captions, events and sounds read their seconds from it.

If a segment's timing is `estimated` (not aligned) and the design depends on word-accurate placement, tell
the user.

## Where the rest lives

- Different moods within one vocal identity: [voice direction](voices.md).
- The passage's meaning expressed through face, gesture and interaction: [video direction](video.md).
- Music, effects, ambience, gain and mix: [sound mix](../4-compose/mix.md).
- Casting and how references relate to the target's argument: [transformations](../2-plan/adapting.md).
- Format-specific practice: [presenter-led explainer](../formats/presenter-explainer.md),
  [narration-led demo](../formats/narration-demo.md); all playbooks: [index](../formats/index.md).

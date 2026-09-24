# Talking head

Read this when one engaging person speaks straight to the viewer and their attitude carries the film,
with captions, evidence and motion graphics helping the viewer keep up. A ranking can ride along (see
[ranking.md](ranking.md) for that combination); when demonstrations and motion
graphics carry most of the argument, read [presenter-explainer.md](presenter-explainer.md)
instead. The relationship stays the same whether the performance is newly generated or a recording the
user supplied: everything follows the spoken performance.

## One good image can carry the whole performance

- Make one image of the person in their setting with the presence, camera distance, posture and
  graphic space the video needs. If the person will fill most of the screen, start at the final aspect
  ratio. Leave room for the body and hand gestures later uses need; the target viewport can then
  change around the same image.
- Setting the person slightly to one side leaves space for icons on the other. The image prompt
  describes only the person and the visible setting; icons belong on their own layer. A desk or the
  angle of a chair makes the offset feel natural. Decide this per film.
- For a reusable front-facing speaking image, ask explicitly for the face toward the camera, head not
  tilted or turned. A clear attitude plus natural speaking hands gives the still some life. Idle-pose
  principles are in [images.md](../3-materials/images.md); the generated performance moves
  and reacts from this starting point.
- Establish the voice's appeal with [voices.md](../3-materials/voices.md), then render
  every line with TTS in that approved voice: one speech file per `script.json` segment. Every ordinary
  speaking shot uses the same image plus that segment's speech file. Each shot returns to the same
  visual premise and contributes one piece of the edited performance.
- Visible cuts are part of the goal. Small posture changes between segments make the video feel like a
  creator's own edited recording. This format wants an edited talk, not one uninterrupted simulated
  take, so the stable reference image can support each shot independently.

## Request each speaking shot directly

One speaking shot is one MiniMax H3 request on Bibei: the presenter image as reference image, the
segment's TTS file as reference audio, and a prompt with the line and the direction
([Video requests](../3-materials/generation-requests.md#video-requests)).

Limits to plan around ([Bibei capabilities and limits](../1-setup/services.md#bibei-capabilities-and-limits)):

| Limit | What to do |
| --- | --- |
| At most 15 s per shot, whole seconds | Measure each speech file with ffprobe and request a whole-second duration slightly longer than it. Split a segment whose speech runs past about 14 s at a natural turn of thought; the seam is just another edit point, which this format wants anyway. |
| 768p (or 480p); output portrait or landscape only | Bibei accepts the other listed ratios, but the workflow only outputs these two. Square, 4:5 or 21:9 deliveries are crops. |
| Each reference file at most 10 MB | Use a normal-size PNG/JPEG for the presenter and a single-segment WAV/MP3 for the speech. |
| No first/last frame, no reference video | Continuity between shots comes from the shared image and voice, not from chaining frames. |

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 composition/audio/hook.wav
node <skill>/scripts/bibei.mjs video hook --model <minimax-h3-key> --prompt-file prompts/hook.txt \
  --duration 8 --ratio 9:16 --ref-image composition/assets/presenter.png \
  --ref-audio composition/audio/hook.wav --dir composition/generated
```

`<minimax-h3-key>` is the account's MiniMax H3 key as listed by `bibei.mjs models`. Before the first
request, confirm the number of shots and the cost with the user.

### Test one shot and settle the sound of record

Request one shot, check it, and only then request the rest. MiniMax H3 fuses the reference audio into
the video; it does not promise lip-sync. Place the returned clip muted over its speech file in a draft
and watch whether the mouth follows the words.

**The rule: the segment's TTS file is the one sound of record, and the generated clip plays muted over
it.** The only exception comes from that short test: if the clip's own speech turns out better (for
example, it re-voiced the line with its own timing that the mouth follows, and it sounds right),
extract it and make it the segment's audio:

```bash
ffmpeg -i composition/generated/hook.mp4 -vn -c:a pcm_s16le -ar 48000 composition/audio/hook-take.wav
node <skill>/scripts/bibei.mjs align hook-take composition/audio/hook-take.wav --language en \
  --dir composition/generated
```

Point the segment's `audio` at `composition/audio/hook-take.wav` and its `alignment` at
`composition/generated/hook-take.alignment.json`, then rebuild the timeline with `timeline.mjs build`.
Keep the TTS file beside it; it is simply no longer used. Never keep both voices in the film. Either
way the footage layer stays muted
([Footage layers and the three clocks](../4-compose/page.md#footage-layers-and-the-three-clocks)).
If neither sound works, adjust the request and test again. Record which way you went in
`PROGRESS.md` and tell the user what you found.

The dedicated AutoDL lip-sync workflow `minimax_h3_image_audio_to_video` is not on Bibei yet.

## Direct the shot in plain words

There is no proven prompt wording for Bibei's MiniMax H3 yet. Work from these principles, and when a
wording gives a good shot, keep it in the project's `prompts/` folder and note it in `PROGRESS.md` so
the next shots reuse it.

- Open the prompt by saying what each reference is for: the image shows the speaker and setting (keep
  identity, face, clothing, setting, lighting, lens feel and broad framing); the audio is the speaker's
  voice. Refer to them by order in plain words ("the reference image", "the reference audio").
- Ask for the line spoken word for word, in order, with nothing reworded, added or dropped.
- Treat these as separate choices for this person: how tightly framing is locked; camera (fixed, or one
  gentle push on the most important phrase and back); performance tone; gesture size. Each can range
  from strict to loose, restrained to rich.
- Add the general quality constraints: realistic and stable face, hands, skin, light and motion; no
  readable text anywhere in the picture.
- End with the segment's line, exactly as in `script.json`, then this segment's attitude and a few
  motivated beats.

A starting point, not yet proven:

```text
The reference image shows the speaker and the room. Keep her face, hair, clothes, the kitchen behind
her, the warm window light and the medium-close framing. The reference audio is her voice.

One continuous take, fixed camera. She speaks directly to the lens and says the line below exactly,
word for word, in order. Realistic, steady face, hands and skin; natural light; no text, captions or
logos anywhere in the frame.

Line: "Everyone tells you to buy a stand mixer. You need a fork and four minutes."
Attitude: amused, a little conspiratorial. Raises one eyebrow on "stand mixer", holds up the fork on
"a fork", small satisfied nod at the end.
```

- Keep the camera fixed and let the performer stay expressive. Ask for one continuous take per shot;
  make jump cuts afterwards with ffmpeg, where they can be exact. Do not ask the model for them.
- What each input contributes is in [video.md](../3-materials/video.md). A film with a
  different camera, cast or relationship between performers needs its own direction.
- Action shows how this person feels about the scene. For a teasing host, amused doubt, a knowing look and
  a brief dismissive gesture help more than a limb-by-limb plan. Give the few actions a reason: a shrug
  that dismisses a claim, a lean in that makes the joke private. Leave precise numbers to voice,
  captions and motion graphics; the hands make readable emphasis.

An example of action direction for one character. It shows one attitude and its beats; it does not
define the personality of every creator:

```text
A retired bus driver reviewing city transit apps: patient, amused, unimpressed by hype.
- On "five-star rating", he lowers his reading glasses and looks over them at the camera.
- He taps the phone once against his palm before the verdict.
- A slow single nod on the last word, then stillness.
Hands: the phone stays in his left hand, screen never facing the camera; no pointing.
```

## Turn pauses into jump cuts

A creator's editing rhythm comes from removing pauses between phrases from picture and sound together.
This relies on the shot's mouth following the speech file from its first frame; the first-shot test
tells you whether it does.

Find the pauses in the segment's sound of record:

```bash
ffmpeg -hide_banner -i composition/audio/hook.wav -af silencedetect=noise=-35dB:d=0.3 -f null - 2>&1 | grep silence_
```

Each `silence_start` / `silence_end` pair is a candidate cut. Keep the speech between them, leaving
about 0.08 s of breath on each side so no syllable is clipped, and cut the shot and the speech with the
same intervals in one command:

```bash
KEEP="between(t,0,1.94)+between(t,2.48,5.16)+between(t,5.66,7.72)"
ffmpeg -i composition/generated/hook.mp4 -i composition/audio/hook.wav -filter_complex \
  "[0:v]select='$KEEP',setpts=N/FRAME_RATE/TB[v];[1:a]aselect='$KEEP',asetpts=N/SR/TB[a]" \
  -map "[v]" -an -c:v libx264 -crf 18 -pix_fmt yuv420p composition/assets/hook-cut.mp4 \
  -map "[a]" composition/audio/hook-cut.wav
```

- Cut only dead pauses. A breath before the punchline or a held look after it may be the performance.
- Keep the uncut files beside the cut ones
  ([Keep originals beside processed versions](../3-materials/media-prep.md#keep-originals-beside-processed-versions)).
- More cutting patterns are in [Cut and keep intervals](../3-materials/media-prep.md#cut-and-keep-intervals).

## Divide the work between voice and graphics

- Write natural stages into the script. For generated shots, render and measure each segment's speech
  first, then choose the generation length. For a supplied recording, the edited delivery sets the
  actual length (cutting in [media-prep.md](../3-materials/media-prep.md); word timing in
  [Alignment](../1-setup/services.md#alignment)).
- One segment can hold several edited shots, Cue breaks, graphic changes and speaker turns. Set its
  boundaries by the performance it carries.
- In `script.json`, point each segment's `audio` at the cut speech, align it (or let `timeline.mjs`
  estimate), and build `timing/timeline.json`. Place each cut shot as a muted footage layer at its
  segment's `start`; the speech plays from its own `<audio>`. When B-roll covers the picture, the speech
  continues.
- Place evidence on the span of words it answers and reveals on the moment they answer
  ([Place events by relationship](../4-compose/timing.md#place-events-by-relationship)). A running
  ranking board can persist across cuts while the current shot, the evidence image and the captions
  change.
- Review whether the person seems engaged and whether the visual layers support that engagement. A
  stable identity and a coherent setting matter; matching posture at every seam does not. A blank face,
  mechanically repeated gestures or intensity that never lets up ruins the effect even when every word
  is there.

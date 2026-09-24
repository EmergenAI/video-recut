# Video direction

Read this before writing or adapting a video prompt or directing a performance. Images establish who and
where; the video request makes the script and the visual idea move: speech, interaction, camera, and
wordless action.

## What to aim for

Creator-style social video rewards performers who are invested: the speaker reacts to what they are
saying and pulls the viewer into the thought. Voice, face and body carry it together.

"Expressive" means the attitude reads clearly. It can be big or restrained.

## When the action depends on how the source moves in time

Choose each input by what the new shot must achieve. A still fixes people, objects, place and framing.
Text fixes the action and why it happens.

Some shots depend on how something unfolds in time: rhythm, a path, contact, coordination between
people, the camera's relation to the action. Text and stills lose that. Make this judgment whether or not
the user named a generation method. When the exact movement does not matter, a broad description gives the
model useful freedom.

What gets replaced need not be a person; it may be an object, the world, the lines or the voice. Examples
of time-dependent action and what each relies on:

| Kind of action | What it depends on |
| --- | --- |
| A pratfall or physical gag | The pause before the fall and the speed of the recovery |
| A skateboard trick | The board's path and the exact moment of contact |
| Two people passing a tray through a crowded kitchen | Coordination and spacing between bodies |
| A locked-off security-camera "accident" | A fixed frame and something entering it unexpectedly |
| A pour-over coffee ritual | Steady, slow hand rhythm |

Watch and listen to a reference to learn what it contributes. Its tone can inspire the direction, but the
target's lines and voice come from the script and from [voice direction](voices.md).
Understanding a work by watching it is not the same as handing its clip to a generation request.

**What this account cannot take.** The account's video model accepts no reference video, no first frame
and no last frame, so movement cannot be transferred directly. It accepts up to 9 reference images and
text.

- **Method.** Grab frames from the source at the moments that define the action (the wind-up, the
  decisive contact or pose, the follow-through) as a contact sheet or single frames. Pass the key frames as
  reference images, then describe in order what happens between them. Watch the whole clip first; the
  defining frames are often in the middle. Keep each reference file at 10 MB or smaller.
- **Limit.** This recovers positions and the described order, not the source's timing. If exact movement
  is essential to the Treatment (a copied choreography, a joke that lives on a precise beat, a camera move
  that must match), tell the user the account has no motion reference, and say what an interpreted version
  would change. The user can accept it, switch service, or use the source footage directly where that is
  allowed.

**Long action.** One request lasts at most 15 seconds; that bounds a shot, not the film. Decide whether the action is several beats (it can
be cut) or whether being unbroken is the point. To cut it, split at meaningful changes of action or camera,
carry people, objects and world with the same set of reference images, and join the shots at the edit
points. A request cannot start from another clip's last frame, so a passage that must be one unbroken shot
longer than 15 seconds cannot be made on this account; explain what a cut version changes before
production.

The generated result sets the target's real length. A wordless clip takes its own interval, and a speech
segment that follows it can be placed after it with `start` in `script.json`.

How images carry identity and world across requests is covered in
[generated dependencies](reference-chains.md). This page covers what the video request is given and
what it is asked for.

## Direct the reason for the action

Give a clear expressive intent first, then a few details that decide where it lands. Start from how the
speaker regards the subject and treats the listener:

- letting a friend in on something they will be glad to know;
- gently correcting a common mistake without talking down;
- daring the viewer to disagree;
- sharing a small embarrassment they have made peace with.

Direction like this implies voice, face, posture and pace in one go.

High-level words need a sensory direction (the same idea as in [image direction](images.md)).
"Lively" or "expressive" only sets the energy level; the speaker's reaction to a specific meaning gives
the energy a direction.

Locate the central idea in the script and decide concretely how it will be expressed: which moment
deserves stress, a shift in expression, a movement of the body? Not every phrase needs every channel. One revealing reaction is enough.

Example. The line: *"Everyone told me to buy the expensive tent. I did. It leaked on night one."*

> She tells this like a story she has retold at parties: wry, not bitter. On "I did" she gives a tiny
> self-incriminating nod. Before "night one" she pauses and lets her face fall flat.

The first sentence sets the attitude; the others mark only the decisive beats.

Pick details that clarify a judgment, reveal a reaction or protect an important physical relationship.
Giving every phrase a gesture only adds choreography.

When the speech comes from a TTS file, its vocal tone was fixed when it was rendered. Give the speech
request and the video prompt the same direction so the visible reaction matches what is heard.

An attitude can develop or hold: won over by the example, or firm throughout. Let the idea decide. When
adapting a reference, find what triggered each reaction and where it landed, then find the matching idea
in the new script. Place stress to suit the target language's tones and rhythm; the source language's
stress pattern does not transfer.

Carry the character, voice and useful physical relationships across shots, and set the attitude afresh
for each passage: the same person can invite, doubt, tease and persuade. Keeping the framing steady lets
shifts in expression, voice and posture register.

## Restraint needs a purpose

Serious can mean weighing, insisting or doubting. A relaxed person can still tease, dismiss or lean in
with interest. Small, deliberate reactions often persuade more than constant movement. Two contrasting
examples, each an intent rather than a fixed pose:

- **A careful verdict.** An engineer reviewing a bridge report: still, eyes on the page; one slow exhale
  before "it will hold"; a single glance up to the camera on "for now".
- **Lazy dismissal.** A teenager asked whether he studied: slouched, not bothering to sit up; one eyebrow
  lifts on "obviously"; he goes back to his phone before the sentence is quite over.

Breathing, blinking and small posture shifts give life. A reaction to the content is what makes it a
performance; direct that reaction even when the body barely moves.

"Contrast" only names a relationship. Turn it into an attitude the character can play, such as "trying to
look unbothered about the award and failing at the corners of the mouth".

Humor comes from the line, the situation, the reaction or the delivery. Deadpan can sharpen a joke through
stress or dry understatement. An odd-looking character does not make a flat explanation funny by itself.
How the premise becomes the viewer's experience belongs to the Treatment ([brief](../2-plan/brief.md)).

## Keep the action inside the generated scene

The prompt describes what this generation shows over time. The performer relates only to the camera,
people, props and surroundings that exist in that scene.

- Translate the needs of later graphics into camera position, eyeline or gesture ("she glances toward the
  empty upper third"). Captions, icons and product cards are made in the composition page with their own
  content and time. A prop or screen that really exists in the scene is described as an object and passed
  as a reference image.
- Keep what is said separate from what is seen. The speaker can discuss objects, numbers, changes or an
  imagined demonstration while the camera only records the performance. Quoting a fragment of a line can
  place a stress or a hand beat, but its meaning must not turn into an object, text or event in the
  picture.
- Write direction with the performer as subject. "Make the idea tangible" or "prove it works" lets the
  model invent its own demonstration; translate them into voice, face and physical interaction first. Read
  the whole prompt as one description of one scene: a blanket "no text" does not fix a vague invitation to
  demonstrate.
- The model tends to make metaphors literal. Where a metaphor could introduce the wrong content, write
  concrete visible language: gaze, gesture, action, camera, cut. Social attitudes and aesthetic shorthand
  are still useful when they direct the performance. Write an imagined object in only if it should really
  appear in the world.
- A large goal such as "convince the viewer" belongs to the Treatment; turn it into this person's delivery
  and interaction. State whether an action really happens or is only a gesture.
- A natural emphatic gesture is more reliable than fingers showing an exact number. Leave counts to the
  voice, captions or motion graphics.
- Encounters have edges. The person interrupted was busy with something else; the person who finishes
  starts to leave. Small reasons make a clip feel like a slice of life rather than a pose cut off by the
  encoder.

## Footage for cutouts

When a moving silhouette is needed, choose a background-removal method that can handle the actual footage
([cutouts and transparency](media-prep.md#cutouts-and-transparency)).

- **New generation.** A continuous, evenly lit colour backdrop supports a keying workflow. Pick a colour
  distinct from hair, clothing and anything held. Write the visible body range, the performance and the
  steady backdrop into the prompt as facts of this recording. This is a footage choice made for that use.
- **Existing footage.** Use a suitable matting capability. Opaque footage can also keep working through
  crops and reframing.

A moving result needs its own alpha step; a transparent reference still does not make the generated video
transparent. If the original scene is also used, keep the original clip
([keep originals beside processed versions](media-prep.md#keep-originals-beside-processed-versions)).
Judge moving edges against the target background: shoulders, hair, hands, colour spill, changes in
transparency.

## Each input has one job

| Input | What it contributes |
| --- | --- |
| Character-and-scene reference image | Appearance, setting, framing, physical state to keep |
| Factual reference image (product, interface) | Visible facts that must stay continuous or exact |
| Still frames chosen from source footage | Positions, poses and camera at the moments that define an action |
| Speech file as reference audio | The exact lines and delivery the visible person performs (rendered by TTS from the script) |
| Script | Exact wording, pronunciation and turns (realized through the speech file) |
| Proven wording in the prompt | Reusable prompt relationships suited to this kind of shot |
| Passage direction | Attitude, attention, physical interaction, camera, motivated cuts |

Make the jobs explicit. Prompt text cannot attach a file, and a file does not say what to keep. Pass files
with `--ref-image` and `--ref-audio`, repeating each flag in the order the prompt mentions them, and state
in plain words what each one contributes ("The first reference image is the barista behind the counter;
the second is the café from the doorway, for the wide shot."). Check that the first result follows the
mapping before paying for the rest.

**Visible A-roll.** Render the segment's speech first, then give the video request the camera image and
that speech file. By default that speech file is the sound of record in the finished film and the clip
plays muted over it. MiniMax H3 fuses reference audio into the video and does not promise lip-sync, so test
one short shot first: watch it muted against the speech file and check that the mouth follows. Switch a
passage to the clip's own sound only if that test shows the clip's speech is better and in sync; then
extract it with ffmpeg as the segment's audio, align it and rebuild the timeline. Never keep both
([voice and performance](speakers-and-narration.md) has the steps).

Vocal identity belongs to [voice direction](voices.md). The passage direction gives the voice its
current mood, and the video prompt gives face and body the same attitude. How names and abbreviations are
spoken while keeping their displayed spelling belongs to [script and time](../2-plan/script.md).
Speech laid over a picture where the mouth is not visible is a different A-roll construction, covered in
[voice and performance](speakers-and-narration.md).

**Silent B-roll.** Direct only the visual event and pass no reference audio. Listener and reaction shots
stay silent but alive: breathing, attention, posture shifts, facial reactions. How B-roll cuts against the
performance underneath belongs to [b-roll](../4-compose/supporting-footage.md).

## What this account can generate

The account's video model is MiniMax H3 on Bibei. Read its key with
`node <skill>/scripts/bibei.mjs models`. Limits:

- 768p by default, or 480p with `--resolution 480p` (`bibei.mjs models` lists what the account
  offers). Bibei accepts 9:16, 3:4, 2:3, 4:5, 16:9, 4:3, 3:2 and 5:4 (no 1:1, no 21:9), but the
  workflow outputs only portrait or landscape; plan any other ratio as a crop.
- Whole seconds from 1 to 15 per request: per shot, not per film.
- Up to 9 reference images and 3 reference audio files, each 10 MB or smaller.
- No reference video, no first frame, no last frame.

| Generation relationship | Status |
| --- | --- |
| Reference-guided video: images and audio guide identity, world, speech and framing without fixing the endpoints | Available |
| Text-only video: the world and action need no pre-existing visual identity | Available (verified); leave out `--ref-image` |
| First/last-frame video | Not available |

Reference guidance is a good basis for controlled production anyway. How it maps to common needs:

- **A visible speaker.** Reference audio carries the speech; reference images carry the person and
  place. The workflow promises fused audio, not lip-sync: test one short shot muted against its speech file
  before planning the whole piece. If the account later offers a dedicated lip-sync workflow, prefer it for
  single-speaker shots (AutoDL's `minimax_h3_image_audio_to_video` is not on Bibei at the time of writing).
- **Continuity.** Reuse the same reference images across requests to keep people, clothes, places and
  products consistent.
- **Long passages.** Several shots of 15 seconds or less, cut at phrase or action boundaries.
- **One scene per request.** This is the default. Asking one request for several scenes (the sofa,
  then the sunset) is unreliable: the result tends to stay in one place. Make one request per scene
  with the same reference images and cut them together in the composition.
- **Several views of one scene in one request.** Several reference images can guide different angles
  of the same place. Say which people, scene or state each contributes and how the passage moves
  between them. None becomes a literal first or last frame.
- **Several speakers.** Up to 3 reference audio files can be passed, but how the model assigns voices to
  visible people is not established. The reliable route is one request per speaking view with that
  speaker's speech, then cut them together.

When the Treatment needs something the account lacks (motion or camera transfer from video, exact start or
end frames, one shot longer than 15 seconds, 1:1 or 21:9, more than 768p), tell the user before production
and say what the alternative gives: interpreted movement, a generated still held in the composition before
the clip, cut shots, a crop from a wider ratio, or 768p scaled to the canvas and judged for softness. Let
the user choose; do not substitute quietly.

## Prompt wording

No wording has yet been proven for MiniMax H3 on Bibei. Work from these principles:

- A prompt file can run in this order: what each reference file is → fixed quality and no-text
  constraints → framing → camera → performance → gesture → passage direction.
- Choose each dimension on its own to serve the intended delivery: tight or loose framing, a locked camera
  or one slow push-in, the performance's tone, how large the gestures are.
- When the speech file fixes the voice, the "voice" half of the performance describes how face and body
  respond to it, not a tone for the model to invent.
- General constraints: keep faces, hands, skin, light and motion realistic and stable; generate no
  subtitles, labels, logos, interface text or other readable text.

Starting point, not yet proven:

```text
The first reference image is the barista and the counter; keep his face, black apron, the chalkboard
behind him and the warm morning light. The first reference audio is his voice; he says these lines word
for word, in this order, adding nothing:

"Most people tamp way too hard. Watch — you barely need any pressure."

Realistic phone footage, stable face and hands, natural light. No captions, labels, logos or any
readable text.
Framing: medium shot, him slightly left of centre, room above his head.
Camera: locked off.
Performance: amused, like he has said this a hundred times and still enjoys it. He shakes his head a
little on "way too hard". On "Watch" his eyes drop to his hands and he presses the tamper lightly.
```

Check the first MiniMax H3 result before relying on any wording. When wording works, keep it in the
project's `prompts/` folder and note in `PROGRESS.md` what it achieved; wording proven across projects
belongs in [prompt wording that has been proven](generation-requests.md#prompt-wording-that-has-been-proven).

## Camera and cuts are part of the passage

For ordinary to-camera social video, prefer jump cuts that remove pauses at phrase boundaries. They keep
the explanation moving and give it the immediacy of a creator's own edit. A stable framing, an expressive
performance and frequent cuts can coexist. The alternative is one continuous explanation.

When a speech file drives the mouth, the pauses are already in the audio. The reliable approach is to cut
speech and picture at the same points (below).

A podcast can cut to the speaker or to a meaningful reaction. A street interview can favour the guest and
pick up reactions from the interviewer's view. An action unfolding, or a reaction held, may benefit from a
continuous shot (within 15 seconds).

One segment is not one shot. Several requests can reuse the same camera image and meet at natural edit
points; a long segment can be covered by several clips; a truly continuous shot needs a single request
that can hold it. The request span follows the intended performance and the model's limits, not one image
per shot.

Asking the prompt for jump cuts only asks the generator for an edit rhythm; nothing checks or trims the
returned media. For deterministic cuts or trims, use ffmpeg
([cut and keep intervals](media-prep.md#cut-and-keep-intervals)), or give the `<video>` in the
composition `data-media-start` and `data-duration` so only the wanted interval shows.

When you remove time from a clip whose mouth follows the speech, cut the sound of record at the same
points, and make the cut file that segment's `audio` in `script.json`, so the timeline, alignment and
captions describe the words the viewer actually hears.

## Size each request from the delivery

The speech sizes the request. Before speech exists, estimate about 4–5 CJK characters or 2.5 English words
per second. After TTS renders at the target pace, read the real length:

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 composition/audio/s1.wav
```

Let the intended performance set the pace, and carry it into both the voice and the passage direction. A
brisk social piece that trims pauses can start on the fast side; a service's default pace is not
necessarily right. Duration decides how much room the words have; stress, attitude and reaction decide
their character. The target delivery decides how much generated media is needed; a reference video's
length helps you understand its rhythm but does not become the target's length.

Set `--duration` to cover the speech plus any meaningful reaction before and after, up to 15 seconds:

```bash
node <skill>/scripts/bibei.mjs video s1-take --model <key> --prompt-file prompts/s1-take.txt --duration 8 --ratio 9:16 --ref-image composition/generated/presenter.png --ref-audio composition/audio/s1.wav --dir composition/generated
```

The 15-second limit bounds one request; it does not define the work's segments or edit beats. When the
speech does not fit, rethink the performable passages: merge a short question and answer, add a reaction
to a short line, split a long passage where the thought turns. To split, either give each part its own
segment and speech file, or cut one speech file at a natural pause with ffmpeg, make one request per part,
and let the clips cover the segment in order. Keep meaning and energy first, then settle the duration.

After production, probe each returned clip ([probe before use](media-prep.md#probe-before-use)),
find where the speech lands inside it, and place it aligned with the speech file; alignment supplies the
word positions. How captions, motion graphics and B-roll work with the performance is judged in composition
review ([judge the composition](../5-deliver/review.md#judge-the-composition),
[evidence frames and grids](../5-deliver/review.md#evidence-frames-and-grids)).

## Related

- [Transformations](../2-plan/adapting.md): how references relate to the target.
- [Give each part the direction it can realize](../4-compose/overview.md#give-each-part-the-direction-it-can-realize).
- [Video requests](generation-requests.md#video-requests): the command and its flags.

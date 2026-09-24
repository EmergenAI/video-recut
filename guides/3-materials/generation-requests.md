# Generating images, video and speech

Read this when a production needs generated images or video from Bibei, speech from a TTS service, or
alignment of that speech; when writing the prompt of record; or when deciding whether an earlier
request can be reused. [Image direction](images.md), [video
direction](video.md) and [voice direction](voices.md)
own what each request should accomplish. [Services](../1-setup/services.md) owns keys, accounts and
diagnosing a failing request; when `bibei.mjs key` reports no key, set one up as in
[Bibei key and account](../1-setup/services.md#bibei-key-and-account) before anything here.

All commands below run from the production folder; `<skill>` is the folder holding SKILL.md. Each
generated item has one prompt file in `prompts/` and one entry in `composition/generated/manifest.json`.

## Before paying

`bibei.mjs image`, `video` and `align` submit paid work immediately. The script never asks for
confirmation, so the agreement comes first and comes from you.

You may spend only on work that has been described to the user, charged to their Bibei account, within
a cost or budget they have accepted. Lay out those terms before you ask: which images, videos and alignments, at
which model, duration and count, and what they cost at the account's current rates. Read the rates and
the balance first:

```bash
node <skill>/scripts/bibei.mjs models
node <skill>/scripts/bibei.mjs balance
```

Estimate only as precisely as the present plan allows, and show any uncertainty that matters, such as a
video whose length hinges on speech that has not been recorded, or a shot that might take two tries.
Access and a points balance tell you what is able to run; only the user's agreement tells you how much
you are allowed to spend.
The TTS service is paid or free according to the service the user chose; include it in the same
conversation when it costs money.

The commission may span the entire production, or stop at analysing the reference so the user can
then decide whether to order the video. Record the agreement in [the Brief](../2-plan/brief.md) and resume from it with
`PROGRESS.md` and `bibei.mjs status`.

Keep moving on work the agreement covers, and tell the user how it is going. One agreement holds for
every command that follows; issuing another command does not by itself call for fresh approval. Go back
to the user for a decision once the work grows past the scope or cost they accepted. Asking for changes
to captions or motion graphics permits exactly those changes; any further generation has to be a
deliberate production decision that the paid scope already includes. If a notable change is covered,
say what it is and carry on; if it alters what the user agreed to pay for, let them decide.
`INSUFFICIENT_POINTS` and `TOKEN_DAILY_LIMIT_EXCEEDED` describe the state of the account: stop and report
them to the user instead of retrying.

## Bibei models and limits

`bibei.mjs models` lists the model keys this account offers, with pricing, grouped by medium (`image`,
`video`, and `alignment` once offered). Model keys differ between accounts; always pass a key from that
list, never a model's display name. The facts known at the time of writing:

| Medium | Models seen | Request limits |
| --- | --- | --- |
| Image | GPT Image 2, Nano Banana 2, Nano Banana Pro | Reference images: at most 10 (GPT Image 2), 14 (Nano Banana 2), 8 (Nano Banana Pro). `--size WxH` and/or `--ratio`; some models take preset sizes only (GPT Image 2 1K presets include 720x1280 for 9:16, 1024x1024 for 1:1, 1280x720 for 16:9). The result may be larger than asked at the same ratio (720x1280 returned 941x1672). No background or output-format choice. |
| Video | MiniMax H3 (the AutoDL workflow `minimax_h3_image_audio_to_video_v2_15s`) | `--resolution 768p` (default) or `480p`; whole seconds from 1 to 15 per shot (not per film); up to 9 reference images and 3 reference audio files; no reference video, no first or last frame. Bibei accepts ratios 9:16, 3:4, 2:3, 4:5, 16:9, 4:3, 3:2, 5:4 (no 21:9 or 1:1), but the workflow itself only outputs portrait or landscape, so treat every other ratio as "portrait or landscape, then crop in the composition" until a result shows otherwise. |
| Alignment | Being built on Bibei | Check `models` for an `alignment` group. Until it exists, timing is estimated. |

Every reference file must be 10 MB or smaller; JPEGs of a few hundred KB are enough. The script
uploads the bytes, so you need no public host, but Bibei must serve them to the video workflow at a
public URL (see [Reuse, versions and failures](#reuse-versions-and-failures) for what a failure of that
looks like). One key may make five generation calls per minute; the script waits out rate limits.
[Bibei capabilities and limits](../1-setup/services.md#bibei-capabilities-and-limits) keeps this
list current. Anything not listed there is unknown: check `models` or ask the user.

## Image requests

Write the prompt to `prompts/<name>.txt`, then:

```bash
node <skill>/scripts/bibei.mjs image hero --model <key> --prompt-file prompts/hero.txt \
  --ratio 9:16 --dir composition/generated
node <skill>/scripts/bibei.mjs image hero-product --model <key> --prompt-file prompts/hero-product.txt \
  --ratio 9:16 --ref composition/generated/hero.png --ref composition/assets/product.png \
  --dir composition/generated
```

The result is `composition/generated/<name>.png` (or `.jpg`/`.webp`, by what Bibei returns; several
results become `<name>-1`, `<name>-2`, …). `--ref` may repeat; references are uploaded in the order
given, so name each reference's responsibility in the prompt in that same order ("The first reference
image supplies the presenter's identity and outfit; the second supplies the product's exact shape and
label."). Prose describing a reference does not attach it; only `--ref` does. GPT Image 2 takes at
most 10 references. Probe the returned size before placing it: a model may return a larger image
than `--size` asked for, at the same ratio.

Choose `--ratio` from the footage the work needs, not automatically from the final canvas: a shape that
will later be inset or split on screen places no constraint on what you generate. When a model needs a preset size, pass `--size`
from its list in `models`.

Keep shot direction fluent prose. A prompt is a description of one picture: who or what is visible,
the camera's relationship to it, what is happening, and the place. For a camera image that should look
captured rather than rendered, open with a paragraph about how it was captured ([what tends to matter](#prompt-wording-that-has-been-proven)),
then write person, shot and setting as ordinary paragraphs. A derived view (the same person from
another angle, the same set with a product) can inherit its person or setting from a reference and omit
that paragraph, while stating what the reference preserves.

Give the image model only picture facts. A later caption, diagram or on-screen label is the page's
job; translate the need into what the camera sees ("room above the presenter's head", "the right third
of the frame is plain wall"). Ask for no readable text in a camera image unless the text is itself the
subject. [Image direction](images.md) and [its worked
example](image-examples.md) own the judgment.

## Video requests

```bash
node <skill>/scripts/bibei.mjs video hook-take --model <key> --prompt-file prompts/hook-take.txt \
  --duration 8 --ratio 9:16 --ref-image composition/generated/presenter.png \
  --ref-audio composition/audio/voice-sample.wav --dir composition/generated
```

`--duration` is required: whole seconds from 1 to 15 (round a measured speech length up); a longer
piece is several shots. `--resolution` is `768p` (default) or `480p`. `--ref-image` (up to 9) and
`--ref-audio` (up to 3) repeat and upload in the order given; with no `--ref-image` the request is
text-only video, which works. The result is
`composition/generated/<name>.mp4`. Always probe it before use (`ffprobe -show_streams`, see
[media preparation](media-prep.md#probe-before-use)): check its real duration, frame rate, dimensions and
whether it carries an audio stream.

**What reference audio does is not promised.** The workflow's own description says only that reference
images and audio are "fused" into one video (多图多音频参考, 音画融合); its three audio slots default to a
silent file when none is given. It does not promise lip-sync to the supplied audio. AutoDL publishes a
separate workflow for that (`minimax_h3_image_audio_to_video`, "图生视频-音频同步（自动对口型）": one
image plus one audio file, no prompt), which Bibei does not offer at the time of writing — check
`bibei.mjs models`. So before a production depends on a visible speaker matching the TTS file, run one
short test inside the agreed scope and check it muted against its speech file: does the mouth follow
the words, does the clip carry its own sound, does it re-voice the line? Record the answer in
`PROGRESS.md`, keep exactly one sound of record (the TTS file, or the clip's sound with the timeline
rebuilt from it), and tell the user what the account can and cannot do. How the prompt should name
references is also unestablished; refer to them by order in plain words ("the first reference image").

Direct the video with what it can realize: dialogue, performance, physical interaction, camera behavior
and motivated cuts. Give the spoken lines verbatim, in order, labelled by speaker when there is more
than one:

```text
A: 你看，这就是我说的那个方法。
B: 等等，就这么简单？
A: 就这么简单。
```

State once which reference image and which reference audio belong to A and to B. Direct attitude and a
few decisive actions rather than every gesture. Do not retype the dialogue into the action direction, and
do not split an exchange into one request per line when one request can carry it. Choose duration from
the speech it must hold: render the TTS first and read its length, or estimate at about 4–5 CJK
characters or 2.5 English words per second, and leave room for breath.

Name the edit language you want: "one continuous shot" and "a few cuts between the supplied views" ask
for different results. A request cannot trim, retime or extract audio from its own result; those are
[media operations](media-prep.md) on the returned file.

## Speech

There is no bundled TTS script. Speech comes from the service the user chose or from the host's own
speech tool; [Speech (TTS)](../1-setup/services.md#speech-tts) records which one this production
uses. Whatever the service, the result must satisfy the production:

- **One file per script segment**, saved as `composition/audio/<segment-id>.wav` (another format the
  service returns is fine; convert with ffmpeg if needed), and named in that segment's `audio` field in
  `script.json`.
- **The words of that segment, in order**, spoken by the voice cast for its speaker. When the spoken
  wording must differ from the displayed wording (a letter name, a reading of a number or a coined
  name), keep the exact text you sent to the service in `prompts/<segment-id>.speech.txt` so it can be
  reproduced.
- **Little leading and trailing silence.** `timeline.mjs` places segments by the file's full duration;
  long padding becomes unwanted gaps. Trim it ([cut and keep intervals](media-prep.md#cut-and-keep-intervals))
  rather than compensating with negative placement. Trimming the head shifts every word: if the
  alignment or engine boundaries came from the untrimmed file, trim only the tail, or re-align, or
  subtract the trimmed seconds from every time. Some engines (Windows SAPI) append about 0.9 s of
  silence to each file; trim those tails.
- **A consistent voice across segments.** Record the casting choice and the accepted sample in the
  Treatment; keep the sample beside the production's other audio.

Direct the voice through the service's own controls and text: wording, vocal character, delivery and
any voice reference it accepts. [Voice direction](voices.md) owns casting.
Read each file's real duration after rendering it:

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 composition/audio/s1.wav
```

Then align each segment so captions and word-linked events get measured times:

```bash
node <skill>/scripts/bibei.mjs align s1 composition/audio/s1.wav --language zh --dir composition/generated
```

`align` converts the speech to 16 kHz mono WAV with ffmpeg, submits it and writes
`composition/generated/s1.alignment.json`; name that file in the segment's `alignment` field. Pass the
spoken language explicitly (`zh`, `en`, `ko`, …). `--model` is optional. Alignment is a paid request
like the others and falls under the same agreement. If `align` reports that alignment is not available,
the account has no `alignment` group yet: leave `alignment` out of the segment, and `timeline.mjs` will
estimate word times from the audio ([estimated timing](../4-compose/timing.md#estimated-timing)). Tell the user
when captions or events need word-accurate timing and only estimates are available.

## Prompt wording that has been proven

Nothing is proven on this account yet. No paragraph has been tested enough on Bibei's image or video
models to be reused word for word, so every prompt starts as prose written for its shot. A paragraph
earns a place in the project's library only after it has improved real results more than once; until
then, treat any reusable text as a starting point and say so to yourself in the prompt file's name or
comment.

Keep the library in the production: `prompts/library.md`, one entry per paragraph with the model key it
was tested on, the date, what it fixed, and the prompt files that used it. Promote an entry from
"candidate" to "proven" only when the comparison is visible in frames you kept. Carry a proven entry into
a new production by copying it, with its record, rather than retyping it from memory.

Before reusing any paragraph, check that its assumptions still hold: one visible speaker versus two,
which reference comes first, portrait versus landscape, whether readable text is wanted. A paragraph that
names "the first reference image" breaks silently when the order of `--ref` changes.

What tends to matter, as principles to test rather than wording to copy:

- **Capture feel first.** For a picture that should look filmed rather than illustrated, open with how it
  was captured: the device, the kind of light, what is in focus, and what should be absent (heavy
  retouching, artificial blur, glossy skin). Then describe the person, the framing and the place.
- **References by role and order.** Say what each reference contributes ("the first image fixes the
  host's face and jacket; the second fixes the counter and shelves") and what may change.
- **Speech as script, not description.** For a speaking shot, give the exact lines once, in order, with
  speaker labels when there are two; direct attitude separately from the words.
- **No text in the picture** unless the text is the subject; captions and labels belong to the page.

A starting point for a filmed-looking still (not yet proven; adapt and record what happens):

```text
Photographed on a phone in available daylight, the way a friend would frame it: everything in the scene
stays readable, from the subject to the back wall. Natural skin and fabric texture, no smoothing, no
added bokeh, no stylized color grade. The frame is clean, with no captions, logos or stray lettering.
```

[Two-person podcast](../formats/podcast.md), [street
interview](../formats/street-interview.md) and [talking head](../formats/talking-head.md)
own the directing around speaking shots; write each request for its relationship directly.

## Reuse, versions and failures

Every `image`, `video` and `align` call is recorded in `composition/generated/manifest.json` before the
script waits for the result. A request is identified by what Bibei receives: model, prompt text,
parameters and the content (not the path) of every reference file; for `align`, the model, language and
the speech file's content.

- **Same name, same request, finished:** the files are reused and nothing is charged. Re-running a
  command is therefore safe.
- **Same name, same request, still running:** the script resumes waiting on the same task. An
  interrupted wait (closed terminal, 40-minute wait limit) resumes with the same command or with
  `bibei.mjs wait <name> --dir composition/generated`.
- **Same name, different request:** refused. Pass `--replace` to submit the new request under that name.
  The previous version is kept: its files are renamed to `<name>@<submitted time>.<ext>` and its manifest
  entry moves to that name, so the new result takes the plain name the page already refers to. Compare
  the two before deciding; to show the old one again, point the page's `src` at the versioned file.
- **Same name, same request, previous attempt failed:** re-running the command submits a new attempt
  (a new charge, shown as "retrying as attempt 2"). Change the request first when the failure was about
  its content or parameters.
- **References upload once:** an uploaded file is remembered by its content in the manifest, and a
  retry or another request with the same file reuses it without uploading again.
- **Resubmission never charges twice:** each attempt carries an Idempotency-Key derived from the request
  itself, so a resubmission after a lost response returns the original task.

Submit several independent requests without waiting, then collect them:

```bash
node <skill>/scripts/bibei.mjs image shot1 --model <key> --prompt-file prompts/shot1.txt --ratio 9:16 --dir composition/generated --no-wait
node <skill>/scripts/bibei.mjs image shot2 --model <key> --prompt-file prompts/shot2.txt --ratio 9:16 --dir composition/generated --no-wait
node <skill>/scripts/bibei.mjs status --dir composition/generated
node <skill>/scripts/bibei.mjs wait shot1 --dir composition/generated
node <skill>/scripts/bibei.mjs wait shot2 --dir composition/generated
```

`status` lists every entry with its kind, status, task id and files; use it before a revision to see
what already exists. If a finished entry's files were deleted, `wait <name>` downloads them again from
the task; the download links are signed and may expire.

A failed or cancelled task is recorded with Bibei's error code and message; the command exits with the
error. Read it before retrying: a content or parameter problem needs a changed request (`--replace`, or
a new name), while a transient service failure can be retried with the same command, which submits a
new attempt. [Diagnose a failing
request](../1-setup/services.md#diagnose-a-failing-request) covers the rest.

A video with reference images that fails within seconds never reached generation; `bibei.mjs` then
adds a likely-cause hint: the Bibei server could not serve the references to the video workflow
(typical of a local Bibei without public storage). Rewriting the prompt will not fix it. Tell the user
what it means for the video and let them choose before switching to text-only shots
([guiding the user](../1-setup/guiding-the-user.md#when-the-plan-cannot-be-realized-as-agreed)). A failure in one request
does not invalidate other finished requests; keep them.

Generated files are evidence and reusable inputs, not editable sources. When a generated image needs a
crop, a cutout or a resize, write the processed file beside it ([keep originals beside processed
versions](media-prep.md#keep-originals-beside-processed-versions)) instead of editing the file the manifest
names.

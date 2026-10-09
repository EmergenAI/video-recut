# Services

Read this when the work needs a paid or remote service: generating images or video, rendering speech,
aligning speech to words, checking an account, or understanding why a request failed. This page owns
which service does what, the key, the limits, cost talk and diagnosis. [Tools](machine.md) owns the
local machine; [generation](../3-materials/generation-requests.md) owns writing and submitting each request.

## Services this Skill uses

Start from the capability the next result needs, and identify what is already available. A
reference reading may need only alignment; a piece made of supplied footage and authored graphics may
need no generation at all. An existing generated file recorded in the manifest can satisfy a request
without another call.

| Part of the work | Service | How it is reached |
| --- | --- | --- |
| Images, video | Bibei open platform | `scripts/bibei.mjs image` / `video` |
| Speech timing (alignment) | Bibei alignment, or the speech tool's own word boundaries | `scripts/bibei.mjs align`, or a converted boundary file |
| Speech (TTS) | Bibei speech when the account lists it, else the host agent's own speech tool or a service the user chooses | `scripts/bibei.mjs speech`, or that tool or service |
| Media processing, probing, sheets | FFmpeg / ffprobe on this machine | Direct commands and `scripts/render.mjs` |
| Composition and rendering | HyperFrames on this machine | `scripts/render.mjs` |
| Reference download | yt-dlp on this machine | Direct command |

This Skill supplies no credits. Bibei and the TTS service have their own accounts and billing; a key
grants only what its issuing account permits. Explain consequential choices before a new account
connection or paid work, and record the user's settled choices in `BRIEF.md` so later work does not
ask again for each command. A failed service does not authorize switching to another account or
billing route; bring the choice back to the user.

## Bibei key and account

Run `bibei.mjs key` at the start of the work. It reports whether a key is configured and where it
comes from, and the API root in use; it never prints the key. `bibei.mjs` takes the first key it
finds:

1. `BIBEI_API_KEY`, the key itself, in the environment of the shell that runs it;
2. the file `BIBEI_API_KEY_FILE` names;
3. the key file `~/.config/video-director/bibei-key`.

The user creates the key on Bibei's Open Platform page, `<site>/app/open-platform` for the site
serving the API root (in production https://www.bibei.cn/app/open-platform), and puts it in place
themselves. The routes, in order of preference:

- **`bibei.mjs key --open`**: you run it; it creates the key file and opens it in the system text
  editor (Notepad on Windows, TextEdit on macOS). The user pastes the key alone on the first line,
  saves and closes it. The script never reads it back, and you never see it.
- **`bibei.mjs login`**: the user runs it in their own terminal; it reads the key hidden and saves it
  to the key file. It refuses to run without a terminal, so it is never yours to run.
- **The host agent's own secret or environment settings**, when you know exactly where they are.

Never write the key file yourself, and never let the key pass through the conversation, a project
file, a command argument or a commit. If the user starts to paste it into the chat, stop them; if it
arrives anyway, do not use or repeat it, and suggest they create a new key and revoke the pasted one.
A key copied together with the word `Bearer` from a setup page's example is accepted as is.
[Guiding the user](guiding-the-user.md#connecting-the-bibei-account) has the step-by-step wording.

Confirm the key works without spending anything:

```bash
node <skill>/scripts/bibei.mjs key
node <skill>/scripts/bibei.mjs balance
```

`balance` returns the account's available points, today's usage on this key and the key's daily
limit. Points are charged to the account the key belongs to.

The API root is, first found: `BIBEI_BASE_URL`, the first line of
`~/.config/video-director/bibei-base-url`, or `https://www.bibei.cn/api`. The file exists for testing
against a local Bibei from a host whose shell carries no custom environment; delete it when the test
is over, or every later request goes to the local server.

## Bibei capabilities and limits

`node <skill>/scripts/bibei.mjs models` lists the model keys this account can use, grouped by medium
(`image`, `video`, `audio` for speech and `alignment`), with their pricing and input limits. Model keys differ between
accounts; always take the key from this listing rather than from memory. What follows was observed in
the existing integration; the listing is the current truth.

- **Images**: GPT Image 2, Nano Banana 2 and Nano Banana Pro have been offered (for example the key
  `openai-gpt-image-2`). A request carries a model key, a prompt, optional reference images (at most 10
  for GPT Image 2, 14 for Nano Banana 2, 8 for Nano Banana Pro), and a size (`WxH`) and/or aspect ratio.
  Some models take preset sizes only; GPT Image 2's 1K presets include 720x1280 for 9:16, 1024x1024
  for 1:1 and 1280x720 for 16:9. The returned image can be larger than requested at the same ratio
  (720x1280 came back as 941x1672); probe it rather than assuming the size. There is no background or
  output-format field, so transparency comes from local processing.
- **Video**: MiniMax H3 (for example the key `autodl-art-minimax_h3_image_audio_to_video_v2_15s`,
  the AutoDL workflow of that name) renders at 768p (default) or 480p (`--resolution 480p`), for whole
  seconds from 1 to 15, with up to 9
  reference images and 3 reference audio files. It takes no reference video and no first or last
  frame. Bibei accepts the ratios 9:16, 3:4, 2:3, 4:5, 16:9, 4:3, 3:2 and 5:4 (no 21:9, no 1:1), but the
  workflow's own output settings are only portrait and landscape: expect a portrait or landscape
  frame and crop in the composition. Text-only video (no reference images) works. 15 seconds is the
  limit of one shot, not of the film. The workflow promises that reference audio is "fused"
  into the video, not that the picture lip-syncs to it; AutoDL's dedicated lip-sync workflow
  (`minimax_h3_image_audio_to_video`, one image plus one audio file) is not offered through Bibei at the
  time of writing. [Video requests](../3-materials/generation-requests.md#video-requests) explains the test to run
  before depending on a visible speaker.
- **Reference files**: each one at most 10 MB; JPEGs of a few hundred KB are plenty. `bibei.mjs`
  uploads the bytes, so you need no public host, but the Bibei server must then serve them to the
  video workflow at a public URL. A local Bibei without public storage fails reference-image video
  within seconds; `bibei.mjs` then prints a likely-cause hint. Do not keep rewriting the prompt: tell
  the user what it means for the video ([guiding the user](guiding-the-user.md#when-the-plan-cannot-be-realized-as-agreed)).
  Uploaded references are remembered by content in the manifest and reused on a retry.
- **Rate**: five generation calls per minute per key. `bibei.mjs` waits out a rate limit by itself.
- **Concurrency**: the account's membership tier sets how many tasks run at once; a free-tier account
  runs one, so video clips are generated one after another (about 2–3 minutes each, measured
  2026-09-24). Plan and quote waiting time from that queue, and submit early
  ([submit early, collect as results arrive](../3-materials/generation-requests.md#submit-early-collect-as-results-arrive)).
- **Speech**: Doubao speech (for example a key under the `audio` group). A request carries the exact
  words of one segment, a voice id from that model's `input.voices`, a speed from 0.5 to 2 and `wav` or
  `mp3`. One request may hold at most `input.maxChars` characters; split a longer segment at a sentence
  boundary. Priced by characters (`pricing.mode` `per_chars`: every `charsPerUnit` characters or part of
  them cost `pointsPerUnit`). Usually done within seconds.
- **Alignment**: speech recognition with per-character times, delivered as WhisperX-shaped JSON. It
  takes WAV only (`bibei.mjs align` converts the file first), at most `input.maxDurationSeconds` per
  request, and optionally the segment's known words, which make Chinese timing tighter. Priced by audio
  length (`pricing.mode` `per_seconds`). See [Alignment](#alignment).
- **Permissions**: every capability is a separate permission on the key: 生图, 生视频, 语音合成 and
  语音对齐. A key made before a permission existed never gains it; the fix is a new key with all four
  ticked ([guiding the user](guiding-the-user.md#connecting-the-bibei-account)).

`bibei.mjs` refuses a video request outside these limits before anything is uploaded or charged.
[Bibei models and limits](../3-materials/generation-requests.md#bibei-models-and-limits) turns them into request
choices.

## Speech (TTS)

Choose the speech source in this order:

1. a service the user or the project already named;
2. Bibei speech, when `bibei.mjs models` lists an `audio` model: it bills the same account as the
   pictures, needs no second sign-up, and keeps every segment on one fixed voice id;
3. the host agent's own speech tool (for example Doubao's);
4. otherwise, tell the user the video has spoken words and you cannot make a voice alone, and offer
   the options ([guiding the user](guiding-the-user.md#speech-when-the-host-has-no-voice-tool)).

With Bibei, render each segment from its spoken form of record:

```bash
node <skill>/scripts/bibei.mjs speech s1 --model <audio model key> --text-file prompts/s1.speech.txt --voice <voice id> --format wav
```

It writes `composition/audio/s1.wav` and records the request in `composition/audio/manifest.json`; the
same words, voice and settings return the saved file without charging again. Pass the same `--voice`,
`--speed` and `--format` to every segment of one speaker. With any other tool or service, follow its own
documentation, and let the user choose when a new account or cost is involved. Record the chosen service and voice in `BRIEF.md`, and the casting
reasoning in `TREATMENT.md`; [voice direction](../3-materials/voices.md) owns that choice.

Whatever produces it, the speech must satisfy what the rest of the production relies on:

- **One file per script segment**, saved as `composition/audio/<segment id>.wav` or `.mp3` and named
  in that segment's `audio` field in `script.json`.
- **Exactly the script's words**: the segment's `text`, or the spoken form of record in `prompts/`
  where pronunciation had to differ ([Script and time](../2-plan/script.md#write-the-intended-pronunciation)).
  An improvised, shortened or paraphrased reading breaks the match between Caption and sound.
- **One consistent voice per speaker** across all of that speaker's segments: same voice, same
  settings, same delivery direction, so separately rendered passages sound like one performance.
- **Clean speech**: no music or effects mixed in; those are added in the composition. Short natural
  silence at either end is fine.
- **Ordinary sample rates**: 44.1 or 48 kHz WAV or MP3 are fine; `align` converts what it needs.

After each file arrives, read its duration with ffprobe and listen to it, or align it, to confirm the
words and pronunciation. Before committing to a host speech tool, check a first segment:

- the intended voice and language (an installed voice can silently fall back to another);
- sample rate and channels (`ffprobe -v error -show_entries stream=sample_rate,channels -of csv=p=0 composition/audio/s1.wav`);
- leading and trailing silence (`silencedetect`, as in [Alignment](#alignment));
- the spoken words match the segment's text;
- level: audible and not clipping (`ffmpeg -i composition/audio/s1.wav -af volumedetect -f null -`,
  `max_volume` below 0 dB);
- the same settings (voice, rate, format) for every segment.

Windows PowerShell 5.1 reads a UTF-8 `.ps1` without a BOM in the system codepage, which garbles
Chinese strings in the script. Save such scripts with a BOM, or read the text from a UTF-8 file
(`Get-Content -Encoding UTF8 prompts/s1.speech.txt`). A mispronounced name is fixed in the spoken form and that one segment is
rendered again. [Speech](../3-materials/generation-requests.md#speech) covers the request side.

## Alignment

Alignment turns a speech file into measured word times. Run `bibei.mjs models` and look for an
`alignment` group; when an account has none, `bibei.mjs align` reports that alignment is not available,
which is a fact about that account, not a key problem.

`align` converts the speech to 16 kHz mono WAV with FFmpeg, uploads it (the 10 MB upload limit reaches
at roughly five minutes of speech; the model's `input.maxDurationSeconds` may be shorter) and writes
`<name>.alignment.json`, a WhisperX-compatible result with per-character times for Chinese. When the
words are known, as they are for your own segments, pass them with `--text-file prompts/s1.speech.txt`:
the service then fits the times to those words instead of guessing them, which is tighter for Chinese.
Leave it out for a reference whose words you do not have yet; the result's `text` is then the
recognized transcript. Name that file in the segment's
`alignment` field; `timeline.mjs` then takes the displayed words from the script and only the times
from the alignment. Pass the spoken language explicitly (`--language zh`, `en`, …).

**Boundaries from the speech tool.** Many TTS engines report word or character boundaries while they
synthesize (Windows SAPI, Azure, edge-tts and others). When the chosen tool reports them, convert them
into an alignment file, keep it as `timing/<segment id>.alignment.json` (`composition/generated/` is for
Bibei outputs), and name it in the segment's `alignment`; `timeline.mjs` then reports the segment
`aligned`. Bibei alignment remains the route when the tool gives no boundaries. The minimal form
`timeline.mjs` accepts:

```json
{ "segments": [ { "words": [ { "word": "今", "start": 0.12, "end": 0.31 } ] } ] }
```

or a top-level `{ "words": [ … ] }`. Times are seconds from the start of that segment's audio file.
`text` may stand in for `word`; a word without `start` and `end` is interpolated. For Chinese, one
character per word works best. Before trusting engine times, compare a few word starts with the gaps
silence detection finds in the same file:

```bash
ffmpeg -hide_banner -i composition/audio/s1.wav -af silencedetect=noise=-40dB:d=0.1 -f null - 2>&1 | grep silence_
```

Known trap: Windows SAPI reports audio positions as if the stream were 16 kHz, whatever the output
format. Writing at another rate, its times run long; multiply them by 16000 / (actual sample rate).

Without alignment, `timeline.mjs build` still works: it estimates each segment's word times from its
audio (speech bounds by silence detection, weighted by characters and punctuation pauses) and marks
the segment `estimated`. Cue-level Captions and passage-level cuts are often usable on estimates after
review. Word-by-word highlighting, karaoke reveals and graphics landing on a single word need measured
times. When the design needs word-accurate timing and alignment is unavailable, tell the user
plainly what will be approximate, and offer to simplify the Caption treatment, to switch to a speech
tool that reports boundaries, or to add alignment once Bibei offers it. [Estimated timing](../4-compose/timing.md#estimated-timing) covers what to
review.

## Talking about cost

Bibei charges points to the key's account. Before paid work, turn the plan into an estimate the user
can accept:

1. List the requests the remaining work needs: each image, each video shot with its duration, each
   speech segment with its character count, each alignment with its audio length. Count reuse: a request already finished in the manifest costs nothing again.
2. Price each from `bibei.mjs models`, in the units the listing states for that model.
3. Allow for realistic iteration—a second version of a key shot, a revised image—and say so
   separately rather than hiding it in the total.
4. Compare with `bibei.mjs balance`: available points and the key's daily limit, which can stop a
   large batch partway through a day.

Present the estimate in points, with what it buys, and ask for agreement before submitting. Keep your
proposed estimate distinct from what the user accepts, and an estimate distinct from a ceiling. Record
the accepted scope in `BRIEF.md` ([Brief](../2-plan/brief.md#brief-preserves-user-authority)) and
keep the remaining cost in `PROGRESS.md` when it matters. Work inside that agreement without asking
again for each command; return to the user when the plan grows beyond it. Bibei speech and
alignment are on the same bill; another TTS service's cost belongs to that service, so mention it when
the user's chosen service charges. `bibei.mjs` does not ask for confirmation
before spending: that conversation is yours. [Before paying](../3-materials/generation-requests.md#before-paying)
applies it to each request.

## Diagnose a failing request

A missing key, a rejected key, an unavailable model, an unsupported input and an exhausted account
call for different actions. Keep the command, the model key and the returned code, message and
request id together as the evidence. Bibei errors arrive as `{ error: { code, message, requestId } }`,
and `bibei.mjs` prints the HTTP status, code and request id.

| What you see | What it means and what to do |
| --- | --- |
| "No Bibei key is configured" | No key reached this shell. Walk the user through `bibei.mjs key --open` ([guiding the user](guiding-the-user.md#connecting-the-bibei-account)); never ask for the key itself. |
| HTTP 401 / 403 | The key was rejected. The user checks or replaces it; repeating the request will not help. |
| `INSUFFICIENT_POINTS` | The account is out of points. Tell the user; do not retry. |
| `TOKEN_DAILY_LIMIT_EXCEEDED` | The key reached its daily limit. Tell the user; the work can continue after the limit resets or with a limit they change. |
| Model key unknown or rejected | Re-read `bibei.mjs models` and use a key the account lists. |
| "Bibei alignment is not available" | The account or service does not offer alignment yet; use estimated timing and say so. |
| `TOKEN_SCOPE_DENIED` | The key lacks the permission for this request (often a key made before 语音合成 / 语音对齐 existed). Guide the user to make a new key with all four permissions; retrying will not help. |
| "speech … not available" | The account lists no `audio` model; use the host's speech tool or the user's service. |
| A reference-image video fails within seconds with a likely-cause hint | The Bibei server cannot serve the references to the video workflow. Changing the prompt will not help; tell the user and let them choose (text-only shots, or waiting). |
| Reference over 10 MB | Reduce the file locally ([Image operations](../3-materials/media-prep.md#image-operations)) and submit again. |
| "rate limited; retrying" | Normal; the script waits and continues. |
| "cannot reach …" after retries | A network route problem on this machine; check connectivity or proxy before anything else. |
| A task ends `failed`, `cancelled` or `degraded` | Read its message. Change the prompt, references or parameters for a real reason, then submit a new version deliberately with `--replace`; that is a new paid request. |
| "still … after 40 min" or a failed download | The task is recorded; resume with `bibei.mjs wait <name>`, or `bibei.mjs wait-all` for every unfinished task. Nothing is charged again. |

An isolated error does not prove that payment or another key will fix the request. Keep independent
work moving while a capability is unavailable—reference reading, script, scene design, composition
with placeholders—and say which deliverable is blocked on it. While the gap is being closed, keep
the service the user picked and the result they are aiming for.

# Audio

Read this when placing speech, music, ambience, effects or footage sound in the composition page,
and when setting their levels, fades, crossfades and ducking. [Sound mix](mix.md)
owns what the audible choices contribute to the work; [Media](../3-materials/media-prep.md) owns general FFmpeg
preparation; [The composition page](page.md) owns the page contract.

The renderer mixes every `<audio>` element on the page into the film's AAC track, as long as it has a
unique `id`: an `<audio>` without one is silently left out (verified; lint does not catch it), so
after a render confirm with ffprobe that the file has an audio stream. Each element plays
its file from `data-media-start` (default 0) at `data-start` for `data-duration` seconds, at a constant
`data-volume` between 0 and 1 (default 1). Overlapping elements on different tracks mix; one track
never holds two overlapping elements. That is the whole in-page vocabulary. Everything that changes
over time (a fade, a duck, a crossfade, a loop, a speed change) is baked into a prepared file with
FFmpeg, and the page places that file.

The HyperFrames engine contains code for volume automation driven from the page, but this Skill has
not verified it. Do not tween `volume` on the timeline; bake the change into the file.

Every sound other than the speech segments is written as an `<audio>` element in `index.html` (the
page script may set its `data-start` and `data-duration`) and registered in `plan.json` `audio` with
its `role` and `source`. The delivery checks read the page source, so a sound created at runtime or
left unregistered fails them ([production plan](../2-plan/production-plan.md#what-the-checks-read)).
The reference's sound is not a source unless the user asked for it.

## Route the voice once

Every spoken passage reaches the film through exactly one route. Speech from the TTS service is one
file per script segment, placed by the timeline. A generated video whose own soundtrack carries the
speech (a performed, lip-synced shot) is a different route for that passage: either its extracted
sound plays and that segment's TTS file does not, or the TTS file plays and the video stays muted.
Playing both doubles the voice with a slight echo. Decide the route per passage and note it in the
page script.

Multiple pictures of one performance never need multiple copies of its sound: a close view, a blurred
background of the same shot and a split-screen share one voice element. A covering picture leaves
the voice audible; a replay of an earlier moment is usually heard without replaying its sound, unless
the replay is the point.

Silence and a missing voice are different facts. A speech file that exists establishes the material;
its `<audio>` element on the page establishes that it reaches the film. When a passage is silent in a
render, check both: the file (ffprobe, listen) and the page element (its `src`, window and volume).

## Speech segments

Each segment's audio element comes from the timeline, placed where `timeline.mjs` put it:

```js
T.segments.forEach(function (s, i) {
  var a = document.createElement("audio");
  a.id = "voice-" + s.id;
  a.src = s.audio;                                   // e.g. "audio/s1.wav", relative to composition/
  a.setAttribute("data-start", s.start);
  a.setAttribute("data-duration", s.audioDuration);
  a.setAttribute("data-track-index", 20 + i);        // one track per segment: overlaps stay legal
  a.setAttribute("data-volume", s.speaker === "guest" ? 0.9 : 1);   // optional constant level
  root.appendChild(a);
});
```

**Base level and local overrides.** Most segments play at their natural level. A constant difference
for a whole segment (a quieter aside, a guest recorded hotter) is its `data-volume`. A change inside a
segment (a word dropped to a whisper, a line muted under a demonstration) is a prepared copy of that
segment's file with the change baked in, placed in the same window:

```bash
# s4 silent from 1.2 s to 3.0 s of its own file
ffmpeg -i composition/audio/s4.wav -af "volume=enable='between(t,1.2,3.0)':volume=0" composition/audio/s4-muted.wav
```

Keep the original speech file and point the element at the prepared copy; the timeline still
refers to the original, whose duration is unchanged.

**Trimming changes the timing.** Trimming a file's head moves every word earlier; alignment or
engine boundaries taken from the untrimmed file are then wrong. Trim only the tail, or re-align (or
subtract the trimmed seconds from every time), then rebuild the timeline. Engines that pad each file
(Windows SAPI adds about 0.9 s at the end) need their tails trimmed:

```bash
# trailing silence starts at 3.65 s (silencedetect); keep 0.1 s of it
ffmpeg -i composition/audio/s1-raw.wav -t 3.75 composition/audio/s1.wav
```

**Fade at the real start.** The film begins with a lead (0.3 s by default) before the first speech.
An opening fade belongs to the first sound's actual start, inside its file, not to film second 0
where there is nothing to fade. The same holds at the end: fade the last file's tail, not the
film's final second.

**Crossfades between segments.** Segments follow each other after a gap. When two should overlap
(an interruption, a dissolve from one voice into another), set the second segment's `start` in
`script.json` so it begins before the first ends, rebuild the timeline, and bake the handoff into
each file: a fade-out on the outgoing file's tail and a fade-in on the incoming file's head, each
over the overlap. The two roles are explicit; nothing is inferred from a picture transition.

```bash
# outgoing s2 is 4.60 s long; overlap 0.4 s
ffmpeg -i composition/audio/s2.wav -af "afade=t=out:st=4.2:d=0.4" composition/audio/s2-out.wav
ffmpeg -i composition/audio/s3.wav -af "afade=t=in:st=0:d=0.4"   composition/audio/s3-in.wav
```

Keep speech segments as separate files: merging two segments into one with `acrossfade` loses the
per-segment timing that captions and picture events rely on. Deliberate simultaneous speech (two
people talking over each other) keeps both files at full level with no fade.

## Music and effects

Music, ambience and effects are ordinary `<audio>` elements with their own tracks, written in the
page and registered in `plan.json`. Choose what the source does inside its window, then prepare it:

| Intended behavior | How |
| --- | --- |
| Play a chosen part | `data-media-start` = in-point, `data-duration` = length; or cut it: `ffmpeg -ss 12 -t 20 -i music.mp3 music-cut.wav` |
| Fill a longer window by repetition | `ffmpeg -stream_loop 3 -i loop.wav -t 42 music-loop.wav` (choose a loop point that is musically clean) |
| Fit the window by retiming | `ffmpeg -i music.wav -af "atempo=1.06" music-fit.wav` (pitch preserved; keep changes small, a few percent, so the music still sounds natural) |
| End on the music's own ending | Start it at `window end − source duration` |
| Hold beyond the source | Not available: a window longer than the source falls silent at the source end |

A long window does not loop or stretch a short source by itself. Two placements of one sound file are
two elements, each with its own window and track.

**No music supplied.** Ask the user in plain words ([guiding the user](../1-setup/guiding-the-user.md#music-when-none-is-available)):
a track they send and may use, a version without music, or generated music where the host offers it.
A synthesized placeholder is acceptable only when you tell the user it is one. Never use copyrighted
music without the rights, and never the reference's soundtrack unless the user asked for it.

**Hits tied to words.** An effect that lands with a reveal takes its second from the same word the
reveal uses, so both move together when the speech is re-taken. Write the element in the page and
let the script set its time:

```html
<audio id="hit-reveal" src="audio/hit.wav" data-start="0" data-duration="0.6" data-track-index="40" data-volume="0.45"></audio>
```

```js
var hitAt = wordStart("s3", "确");          // lookup into window.TIMELINE; see guides/4-compose/page.md
document.getElementById("hit-reveal")
  .setAttribute("data-start", Math.max(0, hitAt - 0.03));   // transient slightly ahead of the word
```

Several hits give each one its own track index (or non-overlapping windows on one track). The sound
and the picture it accompanies remain separate elements that share a second; neither reads the other.

## Levels, fades and ducking

`data-volume` is a linear amplitude multiplier from 0 to 1: `0.5` is about −6 dB. It cannot boost;
raise a quiet file with FFmpeg (`-af volume=4dB`). Use it for a constant level only.

Bake everything else. A music bed with a 1.5 s fade-in, a 1.5 s fade-out ending at 13.25 s, a base
level of 0.5, and ducking under the speech:

```bash
# 1. The speech as one bed on the film clock (only as the ducking key; it is not placed on the page).
#    adelay takes milliseconds: each segment's `start` from timeline.json × 1000.
ffmpeg -i composition/audio/s1.wav -i composition/audio/s2.wav -i composition/audio/s3.wav \
  -filter_complex "[0]adelay=300:all=1[a];[1]adelay=5400:all=1[b];[2]adelay=10250:all=1[c];\
[a][b][c]amix=inputs=3:normalize=0,apad=whole_dur=13.25[out]" \
  -map "[out]" -ac 2 -ar 48000 renders/voice-bed.wav

# 2. Music trimmed to the film, faded, lowered, and compressed whenever the speech bed is present.
ffmpeg -i composition/assets/music-source.wav -i renders/voice-bed.wav \
  -filter_complex "[0]atrim=0:13.25,asetpts=N/SR/TB,afade=t=in:d=1.5,afade=t=out:st=11.75:d=1.5,volume=0.5[m];\
[m][1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400,apad=whole_dur=13.25[out]" \
  -map "[out]" composition/audio/music.wav
```

```html
<audio id="music" src="audio/music.wav" data-start="0" data-duration="13.25" data-track-index="30"></audio>
```

When a script builds these commands from timing data, take each segment's `start` from
`timing/timeline.json` and resolve its `audio` against the folder holding `script.json` (the
production root); `composition/timeline.js` carries the same paths relative to `composition/` instead.
Run the script from the production root, as above.

`threshold` sets how loud the speech must be to trigger the duck (lower triggers sooner), `ratio`
how deep it goes, `attack`/`release` in milliseconds how quickly it dips and recovers. Give both
inputs the same channel layout (`-ac 2`). `apad` keeps the result the full film length. Rebuild the
bed and the ducked music whenever the timeline changes. A duck written by hand for one passage is a
volume change baked with `volume=enable='between(t,a,b)':volume=0.3` on the music file.

For an even level across files from different sources, normalize each one before placing it:

```bash
ffmpeg -i composition/assets/music-source.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 composition/assets/music-norm.wav
```

`loudnorm` resamples internally; `-ar 48000` restores the rate. Normalizing sets a source's own level;
the balance between voice and music is then set with `volume`/`data-volume` and judged by listening.

`acrossfade` joins two music files end to end with a crossfade, for a bed assembled from two cues:

```bash
ffmpeg -i music-a.wav -i music-b.wav -filter_complex "acrossfade=d=2:c1=tri:c2=tri" music-ab.wav
```

The joined file is `2` s shorter than the two sources added together; place it by its measured
duration. Measure every prepared file with ffprobe before writing its window.

After rendering, measure the film's loudness and listen to it ([Deliverables](../5-deliver/render.md#deliverables)).
Speech-led social video usually lands around −16 to −14 LUFS integrated with true peak below −1 dBTP;
a delivery platform's own target, when the user names one, wins.

## Source sound from footage

Every `<video>` is muted. When the footage's own sound belongs in the film (the location sound of a
street interview, a performed line in a generated shot, the click of a real product), extract the
interval that plays and place it with the same window as the picture:

```bash
# picture: data-start="2" data-media-start="2" data-duration="4"
ffmpeg -ss 2 -t 4 -i composition/assets/clip.mp4 -vn -af "afade=t=in:d=0.3,afade=t=out:st=3.6:d=0.4" \
  -ar 48000 composition/audio/clip-sound.wav
```

```html
<audio id="clip-sound" src="audio/clip-sound.wav" data-start="2" data-duration="4" data-track-index="31"></audio>
```

Register the extracted file in `plan.json` with role `footage` (or `ambience`) and the footage's own
source. The extracted file starts at the picture's in-point, so its element needs no `data-media-start`. If
you instead keep the whole soundtrack as one file, give its element the same `data-start`,
`data-media-start` and `data-duration` as the picture. Either way the sound follows the source clock:
holding a picture's last frame does not hold its sound, and a picture split into two clips needs its
sound split with the same source offsets.

Pointing an `<audio>` directly at the `.mp4` is described by HyperFrames but has not been verified in
this Skill; extracting is.

When the footage sound and the TTS speech overlap, only one carries the words
([Route the voice once](#route-the-voice-once)); ambience under the TTS voice is a separate, quieter
element.

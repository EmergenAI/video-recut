# The production plan and delivery checks

Read this before generating a production's material, whenever the plan changes, and whenever a final
render refuses with a delivery check. `plan.json` turns the Treatment into facts the scripts can
hold the finished film to. It keeps a production from quietly delivering less than was agreed: fewer
scenes, a shorter film, or sound that does not belong to the work.

## Write it before generating

Write `plan.json` in the production's root, beside `script.json` and `BRIEF.md` (the folder that holds
`composition/`), as soon as the Treatment is settled and before paying for any generation. A project
started before this file existed writes one from its current Treatment before its next final render.
A small complete example is [guides/examples/plan.json](../examples/plan.json); one with generated
shots and music:

```json
{
  "targetDuration": 30,
  "shots": [
    { "id": "s1", "scene": "窗边依偎", "duration": 7, "video": "shot-s1" },
    { "id": "s2", "scene": "牵手散步", "duration": 8, "video": "shot-s2" },
    { "id": "s3", "scene": "片尾字卡", "duration": 4 }
  ],
  "audio": [
    { "file": "audio/music.mp3", "role": "music", "source": "user-supplied", "note": "用户提供的授权音乐" }
  ],
  "deviations": []
}
```

- **`targetDuration`** (required, seconds): the film's length as the Brief and Treatment promise it.
- **`shots`** (required, at least one): every planned shot or scene in order, each with `id`, `scene`
  and a positive `duration` (its time in the film). `video` is the `bibei.mjs` name of the generated
  clip that realizes it; leave it out for authored scenes, held stills or title cards. Other fields
  (such as `still` in the example) are notes for you; the checks ignore them.
- **`audio`** (required, empty when the film has no sound besides speech): every audible file on the
  composition page except the speech segments of `script.json`, each with its `file` (path inside
  `composition/`, as the page writes it), `role` (`music`, `effect`, `ambience`, `footage` or
  `speech`) and `source` (`tts`, `host-tts`, `generated`, `user-supplied`, `recorded` or
  `reference`). A generated clip whose own sound plays is an unmuted `<video>`; register it with role
  `footage`. `note` is optional. Two of these values exist only to be declared honestly and fail
  unless the user approved them: role `speech` (speech belongs in `script.json`) and source
  `reference`.
- **`deviations`** (optional): changes from this plan that the user approved (below).

## One shot, one request

A video request produces at most 15 seconds; that limits a shot, not the film. Plan a longer or
multi-scene piece as several shots, one request per shot, each at most 15 seconds, carrying the same
character and world references into every request, and cut them together in the composition.
Asking one request for several scenes (a sofa, then a sunset) is unreliable on this model: the
result may stay in one place. Put scene changes at cuts you control.

## What the checks read

The checks read the source of `composition/index.html`, not the rendered page. So:

- **Write every generated shot video as a `<video>` element in `index.html`**, and every non-speech
  `<audio>` (music, effects, ambience, extracted footage sound) the same way. An element the page
  script creates at runtime is invisible to the checks: such a shot fails `scene-count`, and such a
  sound escapes the sound checks, which is exactly what they exist to prevent.
- **Speech is the exception.** The per-segment `<audio>` built from `timeline.js` is read from
  `script.json` instead, so keep creating it in the script.
- **Timing can still follow the words.** The page script may set `data-start` and `data-duration` on
  those written elements from `window.TIMELINE` ([Load the timeline](../4-compose/page.md#load-the-timeline)).

A shot counts as on the page when a `<video>` `src` ends with the file name of one of that shot's
manifest outputs (`composition/generated/manifest.json`), so a processed copy saved under another name
does not count; keep the generated name or record a deviation.

## What a final render checks

Every render except `--quality draft` is treated as a deliverable. `render.mjs render` runs these
checks first and refuses on a failure; `render.mjs check composition` runs them alone.

| Check | Fails when |
| --- | --- |
| `plan-present` | `plan.json` is missing beside `composition/`, or is not valid JSON |
| `plan-shape` | a required field is missing or a role or source is not one of the values above |
| `scene-count` | a shot's `video` has not finished successfully in the manifest, or none of its files is a `<video>` on the page |
| `shot-length` | a shot with a `video` is planned at more than 15 seconds, or its clip was requested at more than 15 |
| `audio-registered` | an `<audio>` or unmuted `<video>` on the page is neither a `script.json` speech file nor listed in `audio` |
| `speech-script` | a registered file has role `speech`; or, when `script.json` has speech, `timing/timeline.json` is missing or older than the script or a speech file, a speech file is missing, or the page does not load `timeline.js` |
| `reference-audio` | a registered file has source `reference`, or the loudness pattern of any audible or speech file matches media under `reference/` (the reference's soundtrack, extracted speech or a cut of them) |
| `duration` | after rendering, the film's length differs from `targetDuration` by more than 10% (at least 1.5 s) |

A passing render writes `<output>.report.json` beside the film, listing every check and every
deviation. A film whose length fails is renamed `<name>.REJECTED.mp4` and kept for review. **Deliver
only a render that has a report**; a file made any other way (a draft, a hand-made ffmpeg join) is
not a deliverable.

## When a check fails

Fix what it names: generate the missing shot, place its clip, register the sound with its true
source, replace reference sound with the planned music, rebuild the timeline. Do not edit
`plan.json` to make the film look finished: lowering `targetDuration`, deleting shots or relabeling a
source is the same silent reduction the checks exist to stop.

When the plan itself can no longer be realized (the account cannot make a shot, no suitable music
exists, the user wants the reference's own music), explain the situation and the choices to the user
in plain words ([Guiding the user](../1-setup/guiding-the-user.md)). Only after they agree,
record it:

```json
{ "check": "scene-count", "what": "只保留沙发一个场景", "userApproved": true, "userWords": "可以，先做一个场景" }
```

A failing check passes only through an entry with the same `check` and `"userApproved": true`. Add
`"file"` to limit it to one item: the sound's path for the sound checks, the shot `id` for
`scene-count` and `shot-length`. `userWords` keeps what the user actually said. The check output marks
an accepted deviation `ok*`, and the report lists every deviation, so the delivery shows what changed
and who agreed.

# Project files

Use this page when a production begins, when you pick one up again, or when its files need a new arrangement.

The layout below is the convention the scripts were written around. Every command takes ordinary paths;
the folder names mean something only because this Skill uses them consistently.

## Decide what belongs to the project

Understand the current request and write the target outcome into the Brief. The paths the user gives,
the notes of the chosen production and the files those notes explicitly reference decide what work
belongs to this project.

- Continuing or revising a named production: carry that work forward.
- A new adaptation: start from the reference and the requested changes, with its own target and working
  files. Once the target is clear, pick a sensible location and tell the user where the work lives.
- If the request could point at materially different productions, ask first.

The shell's current directory may be the Skill folder rather than a project. Look for evidence by
question:

| Question | Where to look |
| --- | --- |
| Are the tools installed and ready? | `node <skill>/scripts/render.mjs doctor`, `yt-dlp --version`, [tools](../1-setup/machine.md) |
| How is a composition or script written? | the execution docs and the samples in `guides/examples/` |
| What are this production's inputs and finished work? | the user's files, its notes, `script.json`, `composition/`, the generation manifest, `renders/`, and shared material the notes explicitly link |

Follow a path outside the project only when the user gave it or a recorded dependency explains its use.
A nearby project with a similar name or topic is not a connection. When an expected input is missing,
report what is missing, then settle where it should come from or prepare the new material needed. Do not
treat other productions on the machine as an implicit asset library.

Judge related earlier work by what it contributes: a reference, a reusable scene technique, or material
that fits the target's person, object, words or presentation. From an old composition take only the
mechanism; casting, prompts, material and accounts remain this production's choices. Say what is
usefully reused and what must change. Finding a similar finished video answers only "is there one?"; it
does not complete this commission. Discuss any proposal to substitute an existing video with the user.

Run commands from the production root. `script.json` resolves its `audio` and `alignment` paths from its
own folder; `bibei.mjs --dir composition/generated` and the render commands take paths from the shell's
current directory; every example in the Skill assumes that root. Leave the Skill's scripts in the Skill
folder and call them by path (`node <skill>/scripts/…`); never copy them into a production.

Helpers written for one production (a speech runner, a boundary converter, a music builder, a mix
script) belong to that production: keep them in its `tools/` folder, never inside the Skill, and note
in `PROGRESS.md` what each does and when to run it again.

## Keep reference facts and target facts apart

The reference record says what an existing piece did; the production says what the new piece should do
and holds its implementation. Keep them separate even when they sit side by side.

```text
<production>/
  BRIEF.md  TREATMENT.md  PROGRESS.md
  reference/            ANALYSIS.md, TIMELINE.md, downloaded source, frame sheets
  plan.json             planned shots, length and sounds; the delivery checks read it
  script.json           the formal script
  prompts/              one text file per generated item (the prompt of record)
  timing/timeline.json  written by timeline.mjs
  composition/          the HyperFrames project root: everything the picture and sound use
    index.html  timeline.js  vendor/gsap.min.js
    generated/          bibei.mjs output: manifest.json, images, videos, *.alignment.json
    audio/              speech (one file per segment), music, sound effects
    assets/             user-supplied and processed media, font files
  renders/              drafts, finals, review sheets
  tools/                helper scripts written for this production (optional)

~/.config/video-director/   per user, outside every production
  bibei-key             the user's Bibei key, put there by the user (never by you)
  bibei-base-url        optional: a non-production API root, for local testing only
```

- **`reference/`** holds the reference media (the downloaded source, the extracted speech and its
  alignment, clips in `evidence/`), frame sheets and the two reference documents. The delivery checks
  compare the film's audio against every media file in it, so keep the reference's sound here and out
  of `composition/` unless the user asked to use it.
- **`plan.json`** sits at the production root, beside `script.json`, and is written before any paid
  generation ([production plan](production-plan.md)). With several references, give each its own
  folder under `reference/` with its own Analysis and Timeline. When one reference serves several
  productions, link it from each Brief by relative path instead of copying it.
- **The renderer serves nothing outside `composition/`.** Every image, video, speech file, music track
  and font the page uses must live under it, referenced by a path relative to `index.html`. If a
  reference clip is also used in the new film (only when the user asked), copy it into `composition/assets/` and keep the archive
  copy in `reference/`. User material goes into `composition/assets/` unchanged, with processed versions
  beside it ([keep originals beside processed versions](../3-materials/media-prep.md#keep-originals-beside-processed-versions)).
- **`composition/generated/manifest.json` is the record of paid work.** `bibei.mjs` writes each request
  there before waiting: the name, what was asked (prompt, parameters, the content of reference files),
  the Bibei task, its status and the output files. That lets a repeated command reuse finished work
  without paying again, lets an interrupted wait resume the same task, and tells the next session which
  file came from which request. Never edit it by hand; read it with
  `node <skill>/scripts/bibei.mjs status --dir composition/generated`. The reference alignment uses
  `--dir reference` and has its own manifest there.

## One job per document

| File | Holds |
| --- | --- |
| `reference/ANALYSIS.md` | The current overall understanding of the reference: form, story, recurring systems, relations, functions, why it works. |
| `reference/TIMELINE.md` | What happens when and what it does for the viewer: each visual system's content, position, entry, change, persistence and exit, related to words or actions, with source times and evidence paths. Picture, speech, captions, typography, motion, effects and audio that happen together belong to one coherent record. These are reference notes; the target's real times come from `timing/timeline.json`. |
| reference `*.alignment.json` | Word-level spoken evidence, not a director's interpretation. |
| `reference/evidence/` | Only media worth reopening, with human-readable names. |
| `BRIEF.md` | What the user is after, plus their facts, limits, change requests and the paid scope they accepted ([Brief](brief.md)). |
| `TREATMENT.md` | Your current answer to the Brief as director: the complete creative layer, ahead of implementation detail. |
| `plan.json` | The planned shots, target length, every non-speech sound with its source, and user-approved deviations ([production plan](production-plan.md)). |
| `script.json` | The target's words, speakers, segments and Cue breaks. |
| `prompts/` | The exact text of every generation and speech request, one file each, named after its product. Edit revised prompts here; the manifest remembers what earlier files were made from. |
| `timing/timeline.json`, `composition/timeline.js` | Build products. Rebuild with `timeline.mjs build` whenever `script.json`, a speech file or an alignment changes; never edit by hand. |
| `composition/index.html` | The exact production implementation of picture and sound. |
| `PROGRESS.md` | A short snapshot of the current work (below). |

`PROGRESS.md` holds the current question, what remains to check or do, the next step, real blockers,
generation names still to finish, and which generated files the composition currently uses. When it
affects the agreed budget, note the cost of the remaining work. The manifest owns the request history;
the note only points to it. Move settled conclusions into the document that owns them. A sample:

```markdown
# Progress

Now: s3 speech arrived at 7.8 s, longer than the 6 s shot planned for it. Deciding between an 8 s
video request and trimming the line "and the tip, and the tax" (Treatment says keep it).

Next
- Align s3 and rebuild the timeline.
- Request `friend-reaction` video (8 s, refs: friend-a.png + s3 speech) once the length is settled.

Still to generate: friend-reaction, receipt-closeup
Composition uses: host-a.png, friend-a.png, table-wide.mp4 (the replaced `table-wide@…` version is unused)
Budget: about 40 points of the agreed 120 remain; friend-reaction at 8 s is the largest item left.

Open review notes (draft-03-timing.mp4)
- 0:04 "the split screen opens late; should open on 'pizza'" (user)
- 0:11 caption covers the receipt
```

These files are rewritten when the current facts change; they are not logs. `PROGRESS.md` can exist
while reading a reference or during production (either may span sessions). It does not mark a phase,
and you can delete it when there is nothing to hand over.

Together they are the working memory across sessions. Write findings and decisions into the owning
document as work advances, keeping the explanation and the concrete details. Provisional notes grow with
understanding. Store detailed evidence once and link to it. The conversation shares meaning; the files
keep the full picture. When picking the work back up, reread the project files as they stand and
whichever Skill pages apply; Progress names the open question, and the evidence, manifest and renders
show where to carry on. Update
whichever record a new discovery changes.

## Drafts and generated files are different things

- Trial copy and discarded ideas can sit in scratch notes beside the document they belong to; they are
  not part of the production until adopted.
- A generated file the composition no longer uses stays in `composition/generated/` with its manifest
  entry. The page not referencing it is what marks it unused; keeping it means you can return to it for
  free. Do not move or rename generated files: the manifest records them by name.
- When a generated or rendered file is deliberately given a new role (a still taken from a generated
  video, a processed cutout), save the result in `composition/assets/` under a descriptive name and
  leave the generated original where it is.
- Renders are views, not sources. `renders/` holds drafts, final MP4s and review sheets, all of which
  can be remade from the composition. Name drafts to show order and purpose, like
  `draft-NN-<purpose>.mp4`, and keep the ones review notes refer to.

## Hand over an editable production

The final MP4 is only the viewing deliverable. To keep working, someone needs the whole production folder
with its relative layout intact:

- the Brief, Treatment, Progress and the `reference/` folder;
- `plan.json`, `script.json`, `prompts/` and `timing/`;
- all of `composition/`, including `generated/manifest.json`, every generated file, the speech files,
  the user's material and bundled fonts.

The manifest travels with the files it names. It identifies a request by its content rather than its
location on disk, so on another machine the same command still recognizes finished work and does not pay
again.

A font referenced with `local()` exists only on machines that have it installed; to render elsewhere,
bundle the font file in `composition/assets/`.

The recipient installs the tools on their machine ([tools](../1-setup/machine.md)), connects their own Bibei
key if more paid work is needed ([Bibei key and account](../1-setup/services.md#bibei-key-and-account)), and renders one draft to confirm the production
reproduces. A key never travels with a project.

## Resume from the current facts

After an interruption or a context compaction, read the current Brief, Treatment, reference records,
`script.json`, the composition page and `PROGRESS.md` if there is one. Then read the actual state of paid
work:

```bash
node <skill>/scripts/bibei.mjs status --dir composition/generated
```

Continue from usable output that already exists. Lost conversation context is never a reason to submit
paid work again.

If a command was interrupted or returned nothing, the Bibei task may still be running. The manifest
already holds that task, so either of these resumes waiting on the same task:

```bash
node <skill>/scripts/bibei.mjs wait friend-reaction --dir composition/generated
# or repeat the original command exactly as it was
```

Repeating a finished request under the same name with the same content returns the existing file without
calling Bibei.

Neither notes nor similar file names decide which generated file the composition uses; the paths in the
page decide.

## Review notes travel with the work

When the user watches a draft and says what should change at which moment, record those timestamped
notes, with the draft file they refer to, in `PROGRESS.md` while they are open. A settled creative choice
goes into the Treatment; an execution fix goes into the file that owns it. Once the fix shows in a later
draft, remove the note from Progress. How to run the review conversation:
[review with the user](../5-deliver/review.md#review-with-the-user).

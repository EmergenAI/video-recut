# Local tools

Read this when you need to know whether this machine can process media, render a composition or download
a reference, and when you install or repair the Node dependencies, FFmpeg, the render browser or yt-dlp,
including on networks where the default download sources are slow or blocked.

## Check the machine

```bash
node <skill>/scripts/render.mjs doctor
```

It runs from any folder and prints one line per requirement, `ok` or `MISS`, with a fix for each miss:

- Node.js is 22 or newer;
- `ffmpeg` and `ffprobe` are on `PATH`;
- the render dependencies are installed beside the script;
- the pinned Chrome Headless Shell is present (checked once the dependencies are installed).

`doctor` changes nothing and downloads nothing. It does not check yt-dlp; run `yt-dlp --version` for that.

"Installed", "prepared" and "able to run" are different questions. A binary on disk is not necessarily on
the `PATH` of the shell that runs the command; `npm install` installs the render dependencies but not the
browser that renders; the system Chrome is not the pinned browser the renderer uses. Check only the facts
the next step actually needs instead of declaring the whole machine ready or not ready. Reading a reference,
for example, needs FFmpeg and perhaps yt-dlp, but not yet the render browser.

Repair from the narrowest evidence:

| Symptom | Where the fix lives |
| --- | --- |
| An executable is missing | The host's install and `PATH`: install it, then run from a shell that sees the new `PATH` |
| Render dependencies are missing | `npm install` in the Skill's `scripts` folder |
| The browser is missing | `node <skill>/scripts/render.mjs prepare-browser` |
| Lint errors | The composition page, not the tools ([when a render fails](../5-deliver/render.md#when-a-render-fails) separates page problems from machine problems) |
| Remote key, account, quota or model errors | The service ([services](services.md)); reinstalling local tools cannot fix them, even though the script runs locally |

A passing `-version` or `doctor` only shows that a tool exists; it does not promise that every operation
will succeed. When a specific input, codec or page fails, read the actual error.

## Install the render tooling

Rendering needs Node.js 22 or newer and one dependency install beside the scripts:

```bash
cd <skill>/scripts
npm install
```

This installs the exact versions pinned in `package.json` and `package-lock.json`: HyperFrames (lint and
producer), GSAP, and the browser installer. The folder turns off Puppeteer's own browser download, because
the renderer uses the pinned browser that `prepare-browser` installs separately. One install serves every
production; nothing is installed into a video project.

When `doctor` reports Node as too old, install Node the host's usual way: the official installer,
`winget install OpenJS.NodeJS.LTS`, `brew install node`, or the distribution's package manager.

If the default npm registry is slow or unreachable, see
[networks, mirrors and caches](#networks-mirrors-and-caches).

## FFmpeg

FFmpeg and ffprobe do the media work across the whole Skill: probing, cutting, conforming, extracting speech,
review sheets, and the renderer's own encoding. Both must be on `PATH`.

Install them machine-wide with the host's package manager, outside any project:

| Host | Command |
| --- | --- |
| Windows | `winget install --id Gyan.FFmpeg.Shared -e` |
| macOS | `brew install ffmpeg` |
| Debian / Ubuntu | `sudo apt install ffmpeg` |

Confirm from a new shell with `ffmpeg -version` and `ffprobe -version`. A new `PATH` reaches only processes
started after the install: on Windows open a new terminal, and a shell or agent session that was already
running may need a restart before it sees the tools.

Review sheets draw their time labels with FFmpeg's `drawtext` filter. The usual builds above include it; a
minimal build may not. When FFmpeg reports a missing filter or encoder, install a fuller build rather than
working around it.

## Chrome Headless Shell

The renderer captures frames with one pinned browser build: Chrome Headless Shell 152.0.7928.2, the build
the pinned HyperFrames release was tested with. Install it once per machine:

```bash
node <skill>/scripts/render.mjs prepare-browser
```

It downloads from Chrome for Testing into `~/.cache/hyperframes/chrome`, printing the source and progress,
and does nothing if the build is already there.

`render` uses this build and no other: another cached version or the system Chrome does not stand in for
it, and when it is missing the render stops and tells you to prepare it. Do not quietly switch to a
different browser to make a render work. The only override is the environment variable
`PRODUCER_HEADLESS_SHELL_PATH`, which the render reports as "not the tested build"; use it only when the
user agrees, and say so when you deliver.

When the official source is blocked or slow, use a mirror:

```bash
node <skill>/scripts/render.mjs prepare-browser --mirror <base-url>
```

The mirror must have the same archive layout and contain this exact build. If the mirror fails, the error is
reported and no other source is tried. A healthy cached install is kept, wherever it came from.

If the script reports that no managed build exists for this platform, this machine cannot render through
the script as prepared. Say so plainly rather than improvising a browser setup.

A ready browser does not guarantee that every page renders. When capture actually fails, work through
[when a render fails](../5-deliver/render.md#when-a-render-fails).

## yt-dlp

yt-dlp saves a video from a supported link so it can be read as a reference
([download a reference video](../3-materials/media-prep.md#download-a-reference-video)). It uses FFmpeg to merge
separate picture and sound streams, so install FFmpeg first.

| Host | Command |
| --- | --- |
| Windows | `winget install --id yt-dlp.yt-dlp -e` |
| macOS | `brew install yt-dlp` |
| Any platform with Python | `python -m pip install -U yt-dlp` |

Confirm with `yt-dlp --version`.

Video sites change often. When a video plays in the browser but extraction fails, yt-dlp is probably out of
date: update it the way it was installed (`yt-dlp -U` for the standalone executable) before looking further.

A link that needs a login needs the user's cookies (`--cookies-from-browser`), which reads the user's browser
data. Ask first, or have the user download the video and give you the file.

## Networks, mirrors and caches

Preparing the machine is part of delivering the film. Read what the current command is doing: which package
or archive, which download host, how much has arrived, and whether it is downloading, extracting or
installing. `prepare-browser` prints its source and percentage; `npm install --loglevel http` shows which
packages it is fetching.

Judge whether to keep waiting from transfer progress, a growing cache and process activity; a quiet screen
is not the same as a stalled one. Waiting helps a healthy but slow transfer; it does not help a route that
does not work. When a wait is expected, let the process run, move on with independent work (reading the
reference, the script, scene design), and tell the user what it means for the film.

Restricted networks, including mainland China, can make particular hosts slow or unreachable. Choose a
reachable source from the user's actual network and the evidence of the transfer; do not infer the network
from the language the user writes in. Replace only the part that is really blocked, and keep useful
downloads and caches.

Three different remedies:

- A **mirror** is another server offering copies of packages or archives. It changes only where the bytes
  come from; the pinned version still decides what runs.
- A **cache** holds files already downloaded and can remove the transfer altogether.
- A **proxy** forwards requests to the original destination.

Pick by the blocked resource:

| Resource | Route |
| --- | --- |
| npm packages (render dependencies) | `npm install --registry <url>`, or set `npm_config_registry` for that command. Mirrors can lag new versions, so check first, e.g. `npm view @hyperframes/producer@0.7.101 version --registry https://registry.npmmirror.com` |
| Chrome Headless Shell | `render.mjs prepare-browser --mirror <base-url>`; an npm mirror does not redirect the browser archive. npmmirror hosts a Chrome for Testing binary mirror at `https://cdn.npmmirror.com/binaries/chrome-for-testing`; confirm it has 152.0.7928.2 before relying on it |
| FFmpeg | The package manager's own sources (winget sources, Homebrew bottles and their mirror settings, the distribution's apt mirror); npm and PyPI mirrors do not affect them |
| yt-dlp | Its package manager's source, or a PyPI mirror: `pip install -i <index-url> yt-dlp`. The websites yt-dlp downloads from are a separate matter; route those with `--proxy <url>` |

Say it when you change the route: which download is blocked, which source you propose, and which command will
use it. Use mirrors the user or their organization trusts, scope them to the preparation command or the
session, and do not change machine-wide configuration without asking. Keep the pinned versions. Record the
choice in `PROGRESS.md` for the next session, and afterwards read the actual download host in the output to
confirm the intended route was used.

Only a few caches matter: the browser in `~/.cache/hyperframes/chrome`, the render dependencies in the
Skill's `scripts/node_modules`, and npm's own package cache. Prepare each machine once and reuse it for
every production. Changing the download source does not require deleting a cache that works.

Useful source documentation, as options to evaluate rather than automatic defaults: npmmirror
(https://npmmirror.com/) and the Tsinghua TUNA Homebrew help page
(https://mirrors.tuna.tsinghua.edu.cn/help/homebrew/).

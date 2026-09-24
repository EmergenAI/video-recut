# Preparing media

Read this when admitting supplied or generated files, cutting a recording, conforming footage and audio,
turning stills into clips, correcting or combining images, making cutouts, capturing a web page or
downloading a reference video. [The composition page](../4-compose/page.md) owns how prepared media is
placed and played; [FFmpeg](../1-setup/machine.md#ffmpeg) and [yt-dlp](../1-setup/machine.md#yt-dlp)
cover installing the tools.

Keep source facts, preparation and presentation distinct. Choose the preparation from the intended use:

| Material or purpose | What the next step needs from it |
| --- | --- |
| Still image (a transparent cutout counts) | The file and its real dimensions; the page supplies its window, box and motion. |
| Video, with or without audio or transparency | The intended picture stream at the program frame rate, its real duration, and its sound as a separate audio file when the work uses it. |
| Speech for a script segment | One file per segment with little padding ([speech](generation-requests.md#speech)). |
| Music, ambience or an effect | An audio file at 48 kHz; level, fades and ducking are mix decisions ([audio](../4-compose/sound.md)). |
| Text, shapes or a designed scene | Nothing to prepare: the page draws it directly. |
| A model reference | The exact image or audio the request accepts, under 10 MB; conforming is not a prerequisite. |

Nothing requires a reference to show up in the finished film. Likewise, footage with a person in it
only counts as performing a script segment once you put it at that segment's time. Everything the
page loads must end up inside `composition/` (usually `composition/assets/`).

## Probe before use

Read what a file actually contains before deciding what to do with it:

```bash
ffprobe -v error -show_streams -show_format composition/generated/hook-take.mp4
ffprobe -v error -show_entries stream=index,codec_type,codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels,duration:stream_tags=alpha_mode -of compact composition/generated/hook-take.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 composition/audio/s1.wav
```

Check the real duration (not the requested one), the frame rate, the dimensions, whether there is an
audio stream at all, and for a transparent video whether it has alpha (VP9 WebM with alpha reports
`alpha_mode=1` in its stream tags while `pix_fmt` still reads `yuv420p`; ProRes 4444 reports a `yuva…`
pixel format). A still placed in the page needs its real dimensions for fitting; read them the same way.

## Cut and keep intervals

A recording the user supplies might serve as a reference, as picture or sound standing on its own, or
as material that stays in the final work. If a passage retains the delivery that was really recorded,
the script can ride on that recording with no need to regenerate it. When only part of a file belongs in the work, write a new file.

Keep one interval, re-encoding so the cut lands on the exact frame:

```bash
ffmpeg -ss 12.4 -to 19.8 -i composition/assets/recording.mp4 \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k composition/assets/opening.mp4
```

Stream copy (`-c copy`) is faster but cuts only at keyframes; use it for rough reference extracts, not for
material whose first frame matters.

Join several kept intervals of the *same* recording, picture and sound together:

```bash
ffmpeg -i composition/assets/recording.mp4 -filter_complex \
 "[0:v]trim=start=12.4:end=15.7,setpts=PTS-STARTPTS[v0];[0:a]atrim=start=12.4:end=15.7,asetpts=PTS-STARTPTS[a0];\
  [0:v]trim=start=16.2:end=19.8,setpts=PTS-STARTPTS[v1];[0:a]atrim=start=16.2:end=19.8,asetpts=PTS-STARTPTS[a1];\
  [v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k composition/assets/opening-edited.mp4
```

Keep intervals of an audio file (for example, trimming pauses or padding from a speech file):

```bash
ffmpeg -i composition/audio/s1-raw.wav \
  -af "aselect='between(t,0.3,4.1)+between(t,4.6,9.2)',asetpts=N/SR/TB" composition/audio/s1.wav
```

Where you cut a file has no bearing on where the script or its segments divide. If the edited delivery performs a script
segment, its word times refer to the new file: name it in `script.json`, align it, and rebuild the
timeline. Extract a single frame as a reference or a still with `ffmpeg -ss 3.5 -i clip.mp4 -frames:v 1
frame.png`; extract a clip's sound with `ffmpeg -i clip.mp4 -vn -c:a pcm_s16le -ar 48000 clip.wav`.

## Conform footage and audio

Clips arrive with different frame rates, sample rates and extra streams. Conform moving footage to the
program frame rate (30 unless you render with another `--fps`) and audio to 48 kHz before placing it, so
lengths and sync combine predictably:

```bash
ffmpeg -i composition/generated/hook-take.mp4 -r 30 -c:v libx264 -crf 18 -pix_fmt yuv420p \
  -ar 48000 -ac 2 -c:a aac -b:a 192k composition/assets/hook-take-30.mp4
ffmpeg -i composition/assets/music-src.mp3 -ar 48000 -ac 2 composition/audio/music.wav
```

Because a `<video>` in the page is always muted, footage whose sound the work uses also needs that sound
as its own file, placed with an `<audio>` element at the same `data-start`
([source sound from footage](../4-compose/sound.md#source-sound-from-footage)). When picture and sound streams have
different lengths, decide which one the clip's length follows and trim the other.

Change speed only as a deliberate material edit, and treat the result as a new performance:

```bash
ffmpeg -i in.mp4 -filter_complex "[0:v]setpts=PTS/1.05[v];[0:a]atempo=1.05[a]" -map "[v]" -map "[a]" \
  -r 30 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac out.mp4
```

Reframe footage for the canvas aspect when the whole clip should fill it (cover, center crop):

```bash
ffmpeg -i composition/assets/landscape.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a copy composition/assets/landscape-vertical.mp4
```

Prefer reframing in the page (`object-fit`, `object-position`, a transform) when the framing may change
or move; bake it into the file only when every use needs the same crop. Pick source proportions to suit
the footage itself: a spoken piece that fills the frame can begin at the final aspect ratio, but a shot
that will later sit in an inset or split is not bound to that shape.

## Stills into clips

A still shown in the page already has a window: give the `<img>` a `data-start` and `data-duration` and
animate it on the timeline. Make a still into a video file only when a video is actually needed, such as
a model reference or an intermediate that other tools process:

```bash
ffmpeg -loop 1 -i composition/generated/shot1.png -t 6 -r 30 \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -pix_fmt yuv420p composition/assets/shot1.mp4
```

The `scale` expression keeps dimensions even, which H.264 requires.

## Image operations

An image operation writes another ordinary image file, which can feed a Bibei reference, a layer in the
page or another operation. Choose between three different things:

- **Flatten a fixed arrangement.** A comparison board, contact sheet or deliberately hard-edged collage
  can be one flattened PNG. Composite with ffmpeg (`[0][1]overlay=x=100:y=200`), or lay it out as a small
  HTML page and screenshot it ([capture a web page](#capture-a-web-page)). Flattening understands no
  people, objects or camera space: it cannot reconcile perspective, lighting, scale or a natural seam.
- **One coherent generated image.** When several references should become one camera image (a presenter
  holding the product in her kitchen), direct the image model to create that image, passing the
  references with `--ref`.
- **Separate layers in the page.** When the parts must stay independently timed, clipped, moved or
  revised, keep them as separate layers in the composition.

Crop and resize with ffmpeg:

```bash
ffmpeg -i composition/generated/hero.png -vf "crop=1080:1080:0:420,scale=720:720" composition/assets/hero-square.png
```

Keep operation and presentation distinct. Editing an image file changes the reusable image itself;
placing it in a box for a window and animating it changes only how this video shows it. Edit the file
when several consumers should receive the same prepared pixels; change the display when the change
belongs only to this presentation. A prompt problem is fixed in the prompt, and a different composition in
the shot or reference relationship, not by correcting pixels afterwards.

## Cutouts and transparency

This Skill has no background-removal service, and Bibei image requests have no transparent-background
option. Obtain a still cutout from the user, from a background-removal tool the host offers, or, when a
hard edge is acceptable, by generating the subject on a flat, evenly lit color the subject does not
contain and keying it:

```bash
ffmpeg -i composition/generated/product-green.png -vf "colorkey=0x00FF00:0.3:0.1,format=rgba" composition/assets/product-cutout.png
```

Judge the edge at the size it will be shown; a key leaves fringes a proper matte would not. Tell the user
which method produced a cutout and its quality.

A still cutout is not a video matte. Removing a still reference's background does not make generated
video transparent, and a moving silhouette needs a matte across every frame (keying footage shot against
a flat backdrop, or a video matting tool the user supplies). [Video
direction](video.md) explains preparing and judging footage for subject
isolation. A circular or rounded box in the page masks geometrically; it does not remove a subject's
background.

Carry alpha in a format that keeps it:

```bash
# VP9 WebM with alpha
ffmpeg -framerate 30 -i cutout/f%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -auto-alt-ref 0 composition/assets/presenter-cutout.webm
# ProRes 4444 MOV with alpha
ffmpeg -framerate 30 -i cutout/f%04d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le composition/assets/presenter-cutout.mov
# Back to a PNG sequence: the VP9 decoder must be named before -i, or the alpha is dropped
ffmpeg -c:v libvpx-vp9 -i composition/assets/presenter-cutout.webm cutout/f%04d.png
```

Both a VP9-alpha WebM and a ProRes 4444 MOV rendered with transparency preserved when placed as
`<video muted playsinline>` in a HyperFrames page on the tested setup (2026-09-23, Windows, the pinned
Chrome Headless Shell); check the first draft frame over a contrasting background before relying on it.
H.264 MP4 never carries alpha.

Operation order matters. Most ffmpeg operations above write opaque H.264: trim, retime or reframe a
performance *before* keying or matting it, or write the intermediate as a PNG sequence or an alpha format.
A picture-only operation that keeps every frame at its source instant (keying, a color correction)
preserves the accepted word times; trimming, retiming or replacing a performance changes them and needs a
new alignment for the result.

## Keep originals beside processed versions

A crop, cutout, key, conform or flattened composite produces a new file; it never replaces its source.
Keep the original beside it with a descriptive suffix (`presenter.png`, `presenter-cutout.png`,
`hook-take.mp4`, `hook-take-30.mp4`) and never overwrite a file the generation manifest names. No page
styling can recover pixels absent from the processed file: if a scene shows the cutout and a later scene
needs the original background, it loads the original file. Record in `PROGRESS.md` which processed file
came from which source and by which command, so the step can be repeated.

## Capture a web page

[Screen demonstrations](../4-compose/screen-demos.md) owns what a screen must show and
why; this section owns saving it. Two browsers may be available:

- **Puppeteer from the Skill's scripts.** `npm install` in `<skill>/scripts` installs `puppeteer-core`
  and `@puppeteer/browsers` (as dependencies of the render tooling), and `render.mjs prepare-browser`
  installs the pinned Chrome Headless Shell. A capture script can use both. This was tested for
  screenshots, element screenshots with a transparent background, and page recordings.
- **The host's browser tool,** when the host agent offers one. It can navigate, interact and take
  screenshots; whether it can save files at a chosen size or record video depends on that tool. Check
  what it actually offers and say so rather than assuming.

A capture script lives in the production (for example `capture/product.mjs`) and loads Puppeteer from the
Skill's installed modules:

```js
// capture/product.mjs — run: node capture/product.mjs <skill>/scripts <url>
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";

const [scripts, url] = process.argv.slice(2);
const require = createRequire(join(scripts, "package.json"));
const puppeteer = require("puppeteer-core");
const { Browser, computeExecutablePath } = require("@puppeteer/browsers");
const executablePath = computeExecutablePath({
  browser: Browser.CHROMEHEADLESSSHELL, buildId: "152.0.7928.2",
  cacheDir: join(homedir(), ".cache", "hyperframes", "chrome"),
});

const browser = await puppeteer.launch({
  executablePath,
  defaultViewport: { width: 540, height: 960, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle2" });
await page.screenshot({ path: "composition/assets/product-page.png" });           // viewport
await page.screenshot({ path: "composition/assets/product-full.png", fullPage: true });
const panel = await page.waitForSelector("#comparison", { visible: true });
await panel.screenshot({ path: "composition/assets/comparison.png", omitBackground: true });

const recording = await page.screencast({ path: "capture/product-demo.webm" });   // needs ffmpeg on PATH
await page.click("#show-example");
await page.waitForSelector("#example-result", { visible: true });
await new Promise((r) => setTimeout(r, 1500));   // let the result settle on screen
await recording.stop();
await browser.close();
```

The selectors above describe an example page; use the real controls and the meaningful start and end
states of the page you capture. A local HTML file loads with `pathToFileURL(file).href` from `node:url`.

Viewport and device scale are separate choices: 540 × 960 at scale 2 produces a 1080 × 1920 screenshot of
a phone-width layout. A selector, clip or `fullPage` chooses a different extent. `omitBackground: true`
keeps transparency when the page's own background is transparent. Device scale enlarges screenshots; a
screencast records at the viewport's CSS size.

The screencast is a VP9 WebM without a reliable duration header. Conform it before use:

```bash
ffmpeg -i capture/product-demo.webm -r 30 -c:v libx264 -crf 18 -pix_fmt yuv420p composition/assets/product-demo.mp4
```

For a scrolling demonstration, locate the element that really does the scrolling; the page itself can stay
put while a gallery inside it moves, and `window.scrollBy` then does nothing. Scroll that element (`el.scrollBy` inside
`page.evaluate`) in steps. Check the result with separated frames (`render.mjs frames
composition/assets/product-demo.mp4 capture/check.png --at 0.5,2,4`) to confirm the rows or states
actually change and the evidence is readable at its destination size. Crop, scroll position and
transitions in the edit can then be revised without capturing again.

Keep captures in `composition/assets/` and record the source page, the date and the purpose in
`PROGRESS.md`. A logged-in page needs the user's own session; ask the user to capture it or to provide
the screenshots rather than handling their credentials.

## Download a reference video

A reference or source clip on a video page can be saved with yt-dlp
([install](../1-setup/machine.md#yt-dlp)); ffmpeg merges separate picture and sound streams:

```bash
yt-dlp --no-playlist \
  -f "bv*[vcodec^=avc1][height<=1080]+ba[ext=m4a]/b[height<=1080]/b" \
  --merge-output-format mp4 -o "reference/source.mp4" "https://example.com/watch?v=VIDEO_ID"
ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate:format=duration -of compact reference/source.mp4
```

Quote the URL so its punctuation stays one argument. `--no-playlist` fetches the one video even when the
link belongs to a playlist; the format expression prefers H.264 near 1080p, and the site's available
formats decide the result. Supported sites and access depend on yt-dlp and the site; a failed download
prints yt-dlp's error. When a site refuses, the site's own download or export, or a file from the user,
supplies the same local file.

Record the source URL and the local path in `reference/ANALYSIS.md` (or the project notes) and reuse the
saved file when returning to the reference. Transcripts, timed frames and grids of it all refer to that
file's own clock ([reference video](../2-plan/reading-references.md)). When the clip becomes material in the
new video, copy the part you need into `composition/assets/` and prepare it as above.

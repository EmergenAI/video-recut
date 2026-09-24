# Third-party notices

The scripts in `scripts/` install and use the following software at run time. Each is distributed
under its own license by its authors; nothing from these packages is included in this repository
beyond what `npm install` downloads.

| Software | Used for | License |
| --- | --- | --- |
| `@hyperframes/producer`, `@hyperframes/lint` and their `@hyperframes/*` dependencies (HeyGen) | Rendering HTML compositions to video; linting pages | Apache License 2.0 |
| `@puppeteer/browsers` | Installing the pinned Chrome Headless Shell | Apache License 2.0 |
| `gsap` (GreenSock) | Animation timeline in composition pages; `render.mjs init` copies `gsap.min.js` into each composition | GreenSock Standard "no charge" license, https://gsap.com/standard-license |
| Chrome Headless Shell 152.0.7928.2 (Google) | Page rendering; downloaded by `render.mjs prepare-browser` from Chrome for Testing | Chrome for Testing terms |

Installed separately by the user and invoked as external programs: FFmpeg / ffprobe (LGPL or GPL,
depending on the build) and yt-dlp (Unlicense).

Material generated through the Bibei open platform (images, video, alignment) and through the TTS
service the user chooses is subject to those services' terms.

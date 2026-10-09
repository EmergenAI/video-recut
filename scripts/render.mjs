#!/usr/bin/env node
// Render tooling for the video-recut Skill. One file, no build step:
//   node render.mjs doctor
//   node render.mjs prepare-browser [--mirror <base-url>]
//   node render.mjs init <dir> [--width 1080] [--height 1920] [--id main]
//   node render.mjs lint <dir> [--entry index.html]
//   node render.mjs render <dir> <out.mp4> [--quality draft|standard|high] [--fps 30] [--workers 4]
//                          [--format mp4|webm|mov] [--entry index.html] [--allow-lint-errors] [--verbose]
//   node render.mjs check <dir> [--entry index.html]
// Every render except --quality draft is a deliverable: it first runs the delivery checks against the
// production's plan.json (check.mjs) and refuses on a failure; afterwards it checks the film's length
// and writes <out>.report.json. Only a render with that report may be delivered.
//   node render.mjs frames <video> <out.png> --at 0.5,2,3.4 [--width 240] [--cols 5]
//   node render.mjs grid <video> <out.png> [--every 1] [--width 180] [--cols 6]
// Install once beside this file: `npm install` (Puppeteer's own browser download is skipped by
// .puppeteerrc.cjs; `prepare-browser` installs the one pinned browser this script renders with).

import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { preflight, printResults, verifyOutput } from "./check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
// The HyperFrames release this script pins was tested with this Chrome Headless Shell build.
const BROWSER_BUILD = "152.0.7928.2";
const BROWSER_CACHE = join(homedir(), ".cache", "hyperframes", "chrome");

function fail(message, code = 1) {
  console.error(`error: ${message}`);
  process.exit(code);
}

function parse(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) { positional.push(arg); continue; }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) flags[key] = true;
    else { flags[key] = next; i += 1; }
  }
  return { positional, flags };
}

function int(value, fallback, name) {
  if (value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) fail(`--${name} must be a positive integer`);
  return n;
}

function which(command) {
  const result = spawnSync(command, ["-version"], { encoding: "utf8" });
  if (result.error) return undefined;
  return (result.stdout || result.stderr).split("\n")[0].trim();
}

async function browsers() {
  try {
    return await import("@puppeteer/browsers");
  } catch {
    fail(`dependencies are not installed; run \`npm install\` in ${here}`);
  }
}

async function browserPath() {
  const { Browser, computeExecutablePath } = await browsers();
  return computeExecutablePath({ browser: Browser.CHROMEHEADLESSSHELL, buildId: BROWSER_BUILD, cacheDir: BROWSER_CACHE });
}

async function doctor() {
  let ok = true;
  const report = (good, label, detail) => {
    if (!good) ok = false;
    console.log(`${good ? "ok  " : "MISS"}  ${label}${detail ? `: ${detail}` : ""}`);
  };
  const major = Number(process.versions.node.split(".")[0]);
  report(major >= 22, "Node.js >= 22", process.versions.node);
  const ffmpeg = which("ffmpeg");
  report(ffmpeg !== undefined, "ffmpeg on PATH", ffmpeg ?? "install FFmpeg (winget install Gyan.FFmpeg.Shared / brew install ffmpeg)");
  const ffprobe = which("ffprobe");
  report(ffprobe !== undefined, "ffprobe on PATH", ffprobe ?? "ships with FFmpeg");
  const installed = existsSync(join(here, "node_modules", "@hyperframes", "producer"));
  report(installed, "render dependencies", installed ? join(here, "node_modules") : `run \`npm install\` in ${here}`);
  if (installed) {
    const path = await browserPath();
    report(existsSync(path), `Chrome Headless Shell ${BROWSER_BUILD}`, existsSync(path) ? path : "run `node render.mjs prepare-browser`");
  }
  // Informational: rendering needs no key; generation does, and bibei.mjs explains how to set one up.
  const key = spawnSync(process.execPath, [join(here, "bibei.mjs"), "key"], { encoding: "utf8" });
  console.log(`${key.status === 0 ? "ok  " : "note"}  Bibei key: ${key.status === 0 ? "configured" : "not configured yet (run `node bibei.mjs key` for setup steps)"}`);
  process.exit(ok ? 0 : 1);
}

async function prepareBrowser(flags) {
  const { Browser, install, detectBrowserPlatform } = await browsers();
  const path = await browserPath();
  if (existsSync(path)) { console.log(`already installed: ${path}`); return; }
  const platform = detectBrowserPlatform();
  if (platform === undefined) fail("no managed Chrome Headless Shell for this platform; install Chrome yourself and set PRODUCER_HEADLESS_SHELL_PATH");
  const baseUrl = typeof flags.mirror === "string" ? flags.mirror : undefined;
  console.log(`installing Chrome Headless Shell ${BROWSER_BUILD} (${platform}) into ${BROWSER_CACHE}`);
  console.log(`source: ${baseUrl ?? "Chrome for Testing (official)"}`);
  let last = -1;
  await install({
    browser: Browser.CHROMEHEADLESSSHELL,
    buildId: BROWSER_BUILD,
    cacheDir: BROWSER_CACHE,
    ...(baseUrl ? { baseUrl } : {}),
    downloadProgressCallback: (done, total) => {
      const pct = total > 0 ? Math.floor((done / total) * 10) * 10 : 0;
      if (pct !== last) { last = pct; console.log(`  ${pct}% of ${(total / 1e6).toFixed(0)} MB`); }
    },
  });
  console.log(`installed: ${path}`);
}

const TEMPLATE = ({ id, width, height }) => `<!doctype html>
<html lang="zh">
<head>
<meta charset="UTF-8"/>
<script src="vendor/gsap.min.js"></script>
<script src="timeline.js"></script>
<style>
  /* Declare every font family you use. local() uses an installed font; url() a file in assets/. */
  @font-face { font-family: "Body"; src: local("Microsoft YaHei"), local("PingFang SC"), local("Noto Sans CJK SC"); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: #000; }
  #root { position: relative; width: ${width}px; height: ${height}px; overflow: hidden; font-family: "Body"; }
  /* Timed elements start hidden; the runtime shows each one inside its data-start/data-duration window. */
  .clip { position: absolute; inset: 0; visibility: hidden; }
</style>
</head>
<body>
<div id="root" data-composition-id="${id}" data-start="0" data-width="${width}" data-height="${height}">
  <!-- Timed elements: <img>, <video muted playsinline>, <audio>, <div> with class="clip" (audio needs no class),
       data-start, data-duration (seconds) and data-track-index (one track never overlaps itself).
       Stacking is page order (later on top) or CSS z-index; the track index does not affect it.
       Every <audio> needs a unique id or the renderer drops it. -->
</div>
<script>
  var tl = gsap.timeline({ paused: true });
  // tl.fromTo("#shot1", { scale: 1 }, { scale: 1.1, duration: 3, ease: "none" }, 0);
  tl.set({}, {}, 5); // total length in seconds
  window.__timelines = window.__timelines || {};
  window.__timelines["${id}"] = tl;
</script>
</body>
</html>
`;

async function init(positional, flags) {
  const dir = positional[0];
  if (!dir) fail("usage: init <dir> [--width 1080] [--height 1920] [--id main]");
  const width = int(flags.width, 1080, "width");
  const height = int(flags.height, 1920, "height");
  const id = typeof flags.id === "string" ? flags.id : "main";
  const entry = join(dir, "index.html");
  if (existsSync(entry)) fail(`${entry} already exists`);
  await mkdir(join(dir, "assets"), { recursive: true });
  await mkdir(join(dir, "vendor"), { recursive: true });
  const gsap = join(here, "node_modules", "gsap", "dist", "gsap.min.js");
  if (!existsSync(gsap)) fail(`dependencies are not installed; run \`npm install\` in ${here}`);
  await copyFile(gsap, join(dir, "vendor", "gsap.min.js"));
  await writeFile(entry, TEMPLATE({ id, width, height }));
  // A placeholder so the page loads before speech exists; timeline.mjs build --js replaces it.
  if (!existsSync(join(dir, "timeline.js"))) {
    await writeFile(join(dir, "timeline.js"),
      "// Placeholder: run timeline.mjs build <script.json> --js <this folder>/timeline.js\n"
      + "window.TIMELINE = { segments: [], duration: 5 };\n");
  }
  console.log(`created ${entry} (${width}x${height}, composition "${id}") with timeline.js (placeholder), vendor/gsap.min.js and assets/`);
}

async function lint(dir, entry) {
  let lintProject;
  try {
    ({ lintProject } = await import("@hyperframes/lint"));
  } catch {
    fail(`dependencies are not installed; run \`npm install\` in ${here}`);
  }
  // lintProject resolves an explicit entry against the process cwd, not the project.
  const result = await lintProject(resolve(dir), entry === undefined ? undefined : resolve(dir, entry));
  for (const { file, result: r } of result.results) {
    for (const f of r.findings) {
      console.log(`${f.severity.padEnd(7)} ${f.code}  ${f.file ?? file}${f.elementId ? `#${f.elementId}` : ""}`);
      console.log(`        ${f.message}`);
      if (f.fixHint) console.log(`        fix: ${f.fixHint}`);
    }
  }
  console.log(`lint: ${result.totalErrors} error(s), ${result.totalWarnings} warning(s)`);
  return result;
}

async function render(positional, flags) {
  const [dir, out] = positional;
  if (!dir || !out) fail("usage: render <dir> <out.mp4> [--quality draft|standard|high] [--fps 30] [--workers 4]");
  const entry = typeof flags.entry === "string" ? flags.entry : "index.html";
  if (!existsSync(join(dir, entry))) fail(`${join(dir, entry)} not found`);
  const quality = typeof flags.quality === "string" ? flags.quality : "standard";
  if (!["draft", "standard", "high"].includes(quality)) fail("--quality must be draft, standard or high");
  const format = typeof flags.format === "string" ? flags.format : "mp4";
  const fps = int(flags.fps, 30, "fps");
  // The producer warns above ~4 capture workers on a default Node heap.
  const workers = int(flags.workers, 4, "workers");

  // A deliverable must realize plan.json; drafts are for looking and skip the checks.
  let checked;
  if (quality !== "draft") {
    checked = await preflight(dir, entry);
    printResults(checked.results);
    if (checked.results.some((r) => !r.ok)) {
      fail("delivery checks failed; fix what they name (guides/2-plan/production-plan.md). A draft (--quality draft) still renders for review.");
    }
  } else {
    console.log("draft: delivery checks skipped; a draft is not a deliverable");
  }

  const linted = await lint(dir, entry);
  if (linted.totalErrors > 0 && !flags["allow-lint-errors"]) {
    fail("lint errors block rendering; fix them or pass --allow-lint-errors");
  }

  // A user-selected browser (PRODUCER_HEADLESS_SHELL_PATH) wins; otherwise the pinned managed build.
  const chosen = process.env.PRODUCER_HEADLESS_SHELL_PATH;
  if (chosen) {
    if (!existsSync(chosen)) fail(`PRODUCER_HEADLESS_SHELL_PATH points to a missing file: ${chosen}`);
    console.log(`browser: ${chosen} (PRODUCER_HEADLESS_SHELL_PATH; not the tested ${BROWSER_BUILD} build)`);
  } else {
    const chrome = await browserPath();
    if (!existsSync(chrome)) fail(`Chrome Headless Shell ${BROWSER_BUILD} is not installed; run \`node render.mjs prepare-browser\``);
    process.env.PRODUCER_HEADLESS_SHELL_PATH = chrome;
  }

  const { createRenderJob, executeRenderJob } = await import("@hyperframes/producer");
  // The engine logs every browser/session step to the console; keep that behind --verbose.
  const quiet = !flags.verbose;
  const original = { log: console.log, info: console.info, debug: console.debug, error: console.error };
  if (quiet) {
    console.log = () => {}; console.info = () => {}; console.debug = () => {};
    // Its info-level trace goes to stderr as "[INFO] …"; warnings and real errors still pass.
    console.error = (...args) => {
      if (typeof args[0] === "string" && args[0].startsWith("[INFO]")) return;
      original.error(...args);
    };
  }
  const say = (...args) => original.log(...args);

  const started = Date.now();
  let lastStage = "";
  let lastPct = -1;
  const job = createRenderJob({ fps, quality, format, workers, entryFile: entry });
  try {
    await mkdir(dirname(resolve(out)), { recursive: true });
    await executeRenderJob(job, resolve(dir), resolve(out), (j) => {
      const pct = Math.floor(Number(j.progress ?? 0) / 10) * 10;
      if (j.currentStage !== lastStage || pct !== lastPct) {
        lastStage = j.currentStage; lastPct = pct;
        const frames = j.totalFrames ? ` ${j.framesRendered ?? 0}/${j.totalFrames} frames` : "";
        say(`[${Math.round((Date.now() - started) / 1000)}s] ${j.currentStage ?? ""} ${pct}%${frames}`);
      }
    });
  } catch (error) {
    Object.assign(console, original);
    const details = job.errorDetails;
    console.error(`render failed${job.failedStage ? ` at ${job.failedStage}` : ""}: ${error instanceof Error ? error.message : String(error)}`);
    if (details?.browserConsoleTail?.length) console.error(`browser console:\n  ${details.browserConsoleTail.join("\n  ")}`);
    process.exit(1);
  }
  Object.assign(console, original);
  for (const w of job.warnings ?? []) console.warn(`warning: ${typeof w === "string" ? w : JSON.stringify(w)}`);
  const size = (await stat(resolve(out))).size;
  console.log(`rendered ${out} (${(size / 1e6).toFixed(1)} MB, ${fps} fps, ${quality}) in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  if (!checked) return;
  const length = verifyOutput(checked.plan, resolve(out));
  printResults([length]);
  if (!length.ok) {
    // Keep the file for review, under a name that cannot be mistaken for a deliverable.
    const file = resolve(out);
    const dot = file.lastIndexOf(".");
    const rejected = dot > file.lastIndexOf(sep) ? `${file.slice(0, dot)}.REJECTED${file.slice(dot)}` : `${file}.REJECTED`;
    await rename(file, rejected);
    fail(`the film does not match plan.json; kept for review as ${rejected}`);
  }
  const report = {
    format: "video-recut.delivery-report@1",
    output: resolve(out), createdAt: new Date().toISOString(), quality, fps,
    targetDuration: checked.plan.targetDuration,
    shots: checked.plan.shots.map((s) => ({ id: s.id, scene: s.scene })),
    checks: [...checked.results, length],
    deviations: checked.plan.deviations ?? [],
  };
  await writeFile(`${resolve(out)}.report.json`, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`delivery report: ${resolve(out)}.report.json`);
}

function ffmpeg(args) {
  const result = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { encoding: "utf8" });
  if (result.error) fail("ffmpeg is not on PATH");
  if (result.status !== 0) fail(`ffmpeg failed: ${result.stderr.trim()}`);
}

function probeDuration(video) {
  const result = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], { encoding: "utf8" });
  if (result.error) fail("ffprobe is not on PATH");
  const seconds = Number(result.stdout.trim());
  if (!Number.isFinite(seconds) || seconds <= 0) fail(`cannot read the duration of ${video}`);
  return seconds;
}

// A labelled contact sheet of chosen instants: the review evidence for "what is on screen at t".
async function frames(positional, flags, times) {
  const [video, out] = positional;
  if (!video || !out || times.length === 0) fail("usage: frames <video> <out.png> --at 0.5,2,3.4 [--width 240] [--cols 5]");
  const width = int(flags.width, 240, "width");
  const cols = int(flags.cols, Math.min(times.length, 5), "cols");
  const rows = Math.ceil(times.length / cols);
  const work = await mkdtemp(join(tmpdir(), "vd-frames-"));
  try {
    // One exact frame per instant, labelled with its time and bordered, then placed with xstack.
    // (FFmpeg's `tile` filter was seen carrying picture from a neighbouring cell into another; the
    // sheet is review evidence, so every cell must be exactly its own instant.)
    const files = [];
    for (const [i, t] of times.entries()) {
      const file = join(work, `f${String(i).padStart(4, "0")}.png`);
      ffmpeg(["-ss", String(t), "-i", video, "-frames:v", "1",
        "-vf", `scale=${width}:-2,drawtext=text='${t.toFixed(2)}s':x=6:y=6:fontsize=${Math.max(12, Math.round(width / 12))}:fontcolor=white:box=1:boxcolor=black@0.6,pad=iw+4:ih+4:2:2:black`,
        file]);
      files.push(file);
    }
    const cells = times.map((_, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      return `${c === 0 ? "0" : Array(c).fill("w0").join("+")}_${r === 0 ? "0" : Array(r).fill("h0").join("+")}`;
    });
    const stack = times.length === 1
      ? "[0]copy[out]"
      : `${times.map((_, i) => `[${i}]`).join("")}xstack=inputs=${times.length}:layout=${cells.join("|")}:fill=black[out]`;
    ffmpeg([...files.flatMap((f) => ["-i", f]), "-filter_complex", stack, "-map", "[out]", "-frames:v", "1", out]);
  } finally {
    await rm(work, { recursive: true, force: true });
  }
  console.log(`wrote ${out} (${times.length} frames, ${cols}x${rows})`);
}

const { positional: [command, ...rest], flags } = parse(process.argv.slice(2));
switch (command) {
  case "doctor": await doctor(); break;
  case "prepare-browser": await prepareBrowser(flags); break;
  case "init": await init(rest, flags); break;
  case "lint": {
    if (!rest[0]) fail("usage: lint <dir> [--entry index.html]");
    const result = await lint(rest[0], typeof flags.entry === "string" ? flags.entry : undefined);
    process.exit(result.totalErrors > 0 ? 1 : 0);
  }
  case "render": await render(rest, flags); break;
  case "check": {
    if (!rest[0]) fail("usage: check <dir> [--entry index.html]");
    const { results } = await preflight(rest[0], typeof flags.entry === "string" ? flags.entry : "index.html");
    printResults(results);
    process.exit(results.some((r) => !r.ok) ? 1 : 0);
  }
  case "frames": {
    const times = typeof flags.at === "string" ? flags.at.split(",").map(Number) : [];
    if (times.some((t) => !Number.isFinite(t) || t < 0)) fail("--at takes non-negative seconds, comma separated");
    await frames(rest, flags, times);
    break;
  }
  case "grid": {
    const [video] = rest;
    if (!video) fail("usage: grid <video> <out.png> [--every 1] [--width 180] [--cols 6]");
    const every = Number(flags.every ?? 1);
    if (!Number.isFinite(every) || every <= 0) fail("--every takes positive seconds");
    const duration = probeDuration(video);
    const times = [];
    for (let t = 0; t < duration - 0.001; t += every) times.push(Number(t.toFixed(3)));
    await frames(rest, { width: flags.width ?? 180, cols: flags.cols ?? 6 }, times);
    break;
  }
  default:
    console.log(await readFile(fileURLToPath(import.meta.url), "utf8").then((s) => {
      const header = s.split("\n").slice(1);
      return header.slice(0, header.findIndex((l) => !l.startsWith("//"))).map((l) => l.replace(/^\/\/ ?/u, "")).join("\n");
    }));
    process.exit(command === undefined || command === "help" ? 0 : 1);
}

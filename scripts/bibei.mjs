#!/usr/bin/env node
// Bibei open-platform client for the video-director Skill. Every paid request is recorded in a
// manifest before waiting, so an interrupted run resumes the same task instead of paying again.
//
//   node bibei.mjs models | balance
//   node bibei.mjs image <name> --model <key> --prompt-file <txt> [--ratio 9:16] [--size 1080x1920]
//                                [--ref a.jpg --ref b.png]
//   node bibei.mjs video <name> --model <key> --prompt-file <txt> --duration 6 [--ratio 9:16]
//                                [--resolution 768p|480p] [--ref-image a.jpg] [--ref-audio v.mp3]
//   node bibei.mjs align <name> <speech-audio> --language zh [--model <key>]
//   node bibei.mjs wait <name> | status [<name>]
//   node bibei.mjs key            (is a key configured, and how to set one up; never prints it)
//   node bibei.mjs key --open     (creates the key file and opens it in the system text editor
//                                  for the user to paste the token into; never reads it)
//   node bibei.mjs login          (the user runs this in their own terminal to save the key)
// Common flags: --dir <generated dir> (default composition/generated, run from the production root), --no-wait, --replace.
// Confirm paid scope with the user before running image/video/align; this script does not ask.
// Key, first found: BIBEI_API_KEY, the file BIBEI_API_KEY_FILE names, or ~/.config/video-director/
// bibei-key. API root: BIBEI_BASE_URL, else ~/.config/video-director/bibei-base-url, else
// https://www.bibei.cn/api.

import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// A file every host agent's shell can read, whatever environment that agent passes to it.
const DEFAULT_KEY_FILE = join(homedir(), ".config", "video-director", "bibei-key");
// The API root: BIBEI_BASE_URL, else the first line of ~/.config/video-director/bibei-base-url (for hosts
// whose shells carry no custom environment, such as testing against a local Bibei), else production.
const BASE_URL_FILE = join(homedir(), ".config", "video-director", "bibei-base-url");
const BASE = (process.env.BIBEI_BASE_URL?.trim()
  || (existsSync(BASE_URL_FILE) ? readFileSync(BASE_URL_FILE, "utf8").split(/\r?\n/u)[0].trim() : "")
  || "https://www.bibei.cn/api").replace(/\/+$/u, "");
// Where the user creates a key: the Open Platform page of the site that serves this API root.
const KEY_PAGE = `${/\/api$/u.test(BASE) ? BASE.slice(0, -4) : "https://www.bibei.cn"}/app/open-platform`;
const API = `${BASE}/open/v1/generation`;
const ASSET_MAX_BYTES = 10_000_000;
const VIDEO_RATIOS = new Set(["9:16", "3:4", "2:3", "4:5", "16:9", "4:3", "3:2", "5:4"]);
const MAX_VIDEO_SECONDS = 15;
const MAX_VIDEO_IMAGES = 9;
const MAX_VIDEO_AUDIOS = 3;
const TERMINAL = new Set(["succeeded", "failed", "cancelled", "degraded"]);
const POLL_MS = Number(process.env.BIBEI_POLL_MS ?? 10_000);
const WAIT_LIMIT_MS = 40 * 60_000;
// Account facts the user must act on; retrying cannot fix them.
const STOP_CODES = new Set(["INSUFFICIENT_POINTS", "TOKEN_DAILY_LIMIT_EXCEEDED"]);

class BibeiError extends Error {
  constructor(code, message, status) { super(message); this.code = code; this.status = status; }
}

function fail(message, code = 1) {
  console.error(`error: ${message}`);
  process.exit(code);
}

function parse(argv) {
  const positional = [];
  const flags = { ref: [], "ref-image": [], "ref-audio": [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) { positional.push(arg); continue; }
    const key = arg.slice(2);
    const next = argv[i + 1];
    const value = next === undefined || next.startsWith("--") ? true : (i += 1, next);
    if (Array.isArray(flags[key])) flags[key].push(value);
    else flags[key] = value;
  }
  return { positional, flags };
}

// Finds the key without reading it into any output. Returns { value, source } or { source: undefined }.
async function findKey() {
  if (process.env.BIBEI_API_KEY?.trim()) return { value: process.env.BIBEI_API_KEY, source: "BIBEI_API_KEY" };
  for (const file of [process.env.BIBEI_API_KEY_FILE, DEFAULT_KEY_FILE].filter(Boolean)) {
    if (!existsSync(file)) continue;
    const value = await readFile(file, "utf8");
    if (value.trim()) return { value, source: file };
  }
  return { source: undefined };
}

const SETUP = `No Bibei key is configured.
Agent: do not relay this text as it is. Walk the user through it in plain words, one step at a time,
as guides/1-setup/guiding-the-user.md requires; run \`bibei.mjs key --open\` for them.
The user sets it up once, without sharing it in chat:
  1. Sign in at ${KEY_PAGE} (register first if needed), click 创建 Key under API Key, tick 生图
     and 生视频, and copy the key; it is shown only once.
  2. Save it in one of these ways:
     - simplest: run \`bibei.mjs key --open\`; a text editor opens an empty file, the user pastes the
       token, saves and closes it
     - in their own terminal: node "${fileURLToPath(import.meta.url)}" login
     - or put the token alone in the file ${DEFAULT_KEY_FILE}
     - or set BIBEI_API_KEY (or BIBEI_API_KEY_FILE naming a file) in the environment the agent runs in
  3. Check it with \`bibei.mjs key\`, then \`bibei.mjs balance\`.`;

async function apiKey() {
  const { value } = await findKey();
  if (!value) fail(SETUP);
  // A key copied from the setup page's curl example carries the scheme word; the header adds its own.
  return value.trim().replace(/^Bearer\s+/iu, "");
}

// Opens the default key file in the platform's editor for the user; the script never reads it back here.
async function openKeyFile() {
  await mkdir(dirname(DEFAULT_KEY_FILE), { recursive: true });
  if (!existsSync(DEFAULT_KEY_FILE)) await writeFile(DEFAULT_KEY_FILE, "", { mode: 0o600 });
  const [cmd, args] = process.platform === "win32" ? ["notepad.exe", [DEFAULT_KEY_FILE]]
    : process.platform === "darwin" ? ["open", ["-e", DEFAULT_KEY_FILE]] : ["xdg-open", [DEFAULT_KEY_FILE]];
  // The editor stays open for the user after this script exits.
  const error = await new Promise((done) => {
    const child = spawn(cmd, args, { stdio: "ignore", detached: true });
    child.once("error", done);
    child.once("spawn", () => { child.unref(); done(undefined); });
  });
  console.log(error
    ? `could not open an editor; the user opens this file themselves: ${DEFAULT_KEY_FILE}`
    : `opened ${DEFAULT_KEY_FILE} in the text editor; the user pastes the key alone on the first line, saves and closes it`);
  console.log(`The key page: ${KEY_PAGE}. Afterwards run \`bibei.mjs key\` to confirm.`);
}

async function keyStatus() {
  const { source } = await findKey();
  if (!source) { console.log(SETUP); process.exit(2); }
  console.log(`Bibei key configured (from ${source}); API root ${BASE}. Run \`bibei.mjs balance\` to confirm it works.`);
}

// Interactive, in the user's own terminal only: the key is typed hidden and written to the default file.
async function login() {
  if (!process.stdin.isTTY) fail(`login reads the key from a terminal; ask the user to run it in their own terminal, or to save the key in ${DEFAULT_KEY_FILE}`);
  process.stdout.write(`Paste the Bibei API key from ${KEY_PAGE} (input hidden), then Enter: `);
  const value = await new Promise((done) => {
    let text = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      for (const ch of chunk) {
        if (ch === "\u0003") { process.stdout.write("\n"); process.exit(130); }
        if (ch === "\r" || ch === "\n") { process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write("\n"); done(text); return; }
        if (ch === "\u007f" || ch === "\b") text = text.slice(0, -1); else text += ch;
      }
    });
  });
  const key = value.trim().replace(/^Bearer\s+/iu, "");
  if (!key) fail("no key entered; nothing saved");
  await mkdir(dirname(DEFAULT_KEY_FILE), { recursive: true });
  await writeFile(DEFAULT_KEY_FILE, `${key}\n`, { mode: 0o600 });
  console.log(`saved to ${DEFAULT_KEY_FILE}; checking it with the account balance…`);
  console.log(JSON.stringify(await call("/balance"), null, 2));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const redact = (text) => String(text).replace(/https?:\/\/\S+/giu, "[url]");

async function call(path, init = {}, attempt = 0) {
  const key = await apiKey();
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...init,
      headers: { authorization: `Bearer ${key}`, ...(init.body ? { "content-type": "application/json" } : {}), ...(init.headers ?? {}) },
      signal: AbortSignal.timeout(120_000),
    });
  } catch (error) {
    if (attempt < 3) { await sleep(2_000 * (attempt + 1)); return call(path, init, attempt + 1); }
    throw new BibeiError("TRANSPORT", `cannot reach ${API}${path}: ${error.message}`);
  }
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = {}; }
  if (response.ok) return body;
  const error = body && typeof body.error === "object" ? body.error : {};
  const code = typeof error.code === "string" ? error.code : `HTTP_${response.status}`;
  if (response.status === 429 && !STOP_CODES.has(code) && attempt < 5) {
    // Bibei limits one key to five generation calls a minute; wait out the window.
    const after = Number(response.headers.get("retry-after"));
    const ms = Number.isFinite(after) && after > 0 ? after * 1000 : 15_000;
    console.error(`rate limited; retrying in ${Math.round(ms / 1000)}s`);
    await sleep(ms);
    return call(path, init, attempt + 1);
  }
  if (response.status >= 500 && attempt < 3) { await sleep(3_000 * (attempt + 1)); return call(path, init, attempt + 1); }
  const request = typeof error.requestId === "string" ? ` (request ${error.requestId})` : "";
  throw new BibeiError(code, `Bibei HTTP ${response.status} ${code}${request}: ${redact(error.message ?? text.slice(0, 300))}`, response.status);
}

// ---------- manifest ----------

async function loadManifest(dir) {
  const file = join(dir, "manifest.json");
  if (!existsSync(file)) return { file, data: { format: "video-director.generated@1", entries: {} } };
  return { file, data: JSON.parse(await readFile(file, "utf8")) };
}

async function saveManifest(manifest) {
  await mkdir(resolve(manifest.file, ".."), { recursive: true });
  const temp = `${manifest.file}.tmp`;
  await writeFile(temp, `${JSON.stringify(manifest.data, null, 2)}\n`);
  await rename(temp, manifest.file);
}

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

// ---------- requests ----------

async function uploadAsset(file) {
  const size = (await stat(file)).size;
  if (size > ASSET_MAX_BYTES) fail(`${file} is ${(size / 1e6).toFixed(1)} MB; Bibei accepts references up to 10 MB`);
  const body = { base64: (await readFile(file)).toString("base64"), filename: basename(file) };
  const response = await call("/assets", { method: "POST", body: JSON.stringify(body) });
  if (typeof response.assetId !== "string" || !response.assetId) throw new BibeiError("BAD_RESPONSE", "Bibei upload returned no assetId");
  return response.assetId;
}

async function readPrompt(flags) {
  if (typeof flags["prompt-file"] === "string") return (await readFile(flags["prompt-file"], "utf8")).trim();
  if (typeof flags.prompt === "string") return flags.prompt.trim();
  fail("give the prompt with --prompt-file <txt> (preferred: it stays in the project) or --prompt");
}

async function refs(files) {
  const out = [];
  for (const file of files) {
    if (typeof file !== "string" || !existsSync(file)) fail(`reference not found: ${file}`);
    out.push({ path: resolve(file), sha256: await sha256(file) });
  }
  return out;
}

// A request is identified by what Bibei receives: file content, not where the file sits on disk.
function requestKey(kind, identity) {
  const byContent = (list) => (list ?? []).map((r) => r.sha256);
  const { source, refs: r, images, audios, ...rest } = identity;
  void source;
  const canonical = { kind, ...rest, refs: byContent(r), images: byContent(images), audios: byContent(audios) };
  return `vd-${createHash("sha256").update(JSON.stringify(canonical)).digest("hex").slice(0, 40)}`;
}

async function prepareGeneration(kind, name, flags) {
  if (!name || !/^[\w.-]+$/u.test(name)) fail("give a name made of letters, digits, '-', '_' or '.'");
  if (typeof flags.model !== "string") fail("--model <key> is required; list the account's keys with `bibei.mjs models`");
  const prompt = await readPrompt(flags);
  if (kind === "image") {
    const spec = {
      model: flags.model, prompt,
      ratio: typeof flags.ratio === "string" ? flags.ratio : undefined,
      size: typeof flags.size === "string" ? flags.size : undefined,
      refs: await refs(flags.ref),
    };
    return spec;
  }
  const duration = Number(flags.duration);
  // The MiniMax H3 workflow takes whole seconds, 1–15.
  if (!Number.isInteger(duration) || duration < 1) fail("--duration takes whole seconds (1–15); round a measured speech length up");
  if (duration > MAX_VIDEO_SECONDS) fail(`Bibei renders at most ${MAX_VIDEO_SECONDS} seconds per video request`);
  const ratio = typeof flags.ratio === "string" ? flags.ratio : undefined;
  if (ratio !== undefined && !VIDEO_RATIOS.has(ratio)) fail(`Bibei video ratios are ${[...VIDEO_RATIOS].join(", ")}`);
  if (flags["ref-image"].length > MAX_VIDEO_IMAGES) fail(`Bibei video takes at most ${MAX_VIDEO_IMAGES} reference images`);
  if (flags["ref-audio"].length > MAX_VIDEO_AUDIOS) fail(`Bibei video takes at most ${MAX_VIDEO_AUDIOS} reference audio files`);
  // The account lists the resolutions a model offers (`bibei.mjs models`); 768p is the default.
  const resolution = typeof flags.resolution === "string" ? flags.resolution : "768p";
  return {
    model: flags.model, prompt, duration, ratio, resolution,
    images: await refs(flags["ref-image"]), audios: await refs(flags["ref-audio"]),
  };
}

// Uploaded references are remembered by content in the manifest, so a resubmission under the same
// Idempotency-Key sends the same asset ids and Bibei recognizes it as the same request.
async function assetFor(manifest, file, contentKey) {
  manifest.data.assets ??= {};
  if (manifest.data.assets[contentKey]) return manifest.data.assets[contentKey];
  const id = await uploadAsset(file);
  manifest.data.assets[contentKey] = id;
  await saveManifest(manifest);
  return id;
}

async function submit(kind, spec, idempotency, manifest) {
  const upload = async (list) => { const ids = []; for (const r of list) ids.push(await assetFor(manifest, r.path, r.sha256)); return ids; };
  if (kind === "image") {
    const imageAssetIds = await upload(spec.refs);
    const body = {
      modelKey: spec.model, prompt: spec.prompt,
      ...(imageAssetIds.length ? { imageAssetIds } : {}),
      ...(spec.size ? { size: spec.size } : {}),
      ...(spec.ratio ? { aspectRatio: spec.ratio } : {}),
    };
    return call("/images", { method: "POST", body: JSON.stringify(body), headers: { "idempotency-key": idempotency } });
  }
  if (kind === "video") {
    const imageAssetIds = await upload(spec.images);
    const audioAssetIds = await upload(spec.audios);
    const body = {
      modelKey: spec.model, prompt: spec.prompt, duration: spec.duration, resolution: spec.resolution,
      ...(spec.ratio ? { ratio: spec.ratio } : {}),
      ...(imageAssetIds.length ? { imageAssetIds } : {}),
      ...(audioAssetIds.length ? { audioAssetIds } : {}),
    };
    return call("/videos", { method: "POST", body: JSON.stringify(body), headers: { "idempotency-key": idempotency } });
  }
  const audioAssetId = await assetFor(manifest, spec.evidence, `align-evidence:${spec.sourceSha256}`);
  const body = { modelKey: spec.model, audioAssetId, language: spec.language };
  return call("/alignments", { method: "POST", body: JSON.stringify(body), headers: { "idempotency-key": idempotency } });
}

function extensionFor(mediaType, url, kind) {
  const byType = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "video/mp4": ".mp4", "video/quicktime": ".mov" };
  if (byType[mediaType]) return byType[mediaType];
  const fromUrl = extname(new URL(url).pathname);
  if (fromUrl) return fromUrl;
  return kind === "video" ? ".mp4" : ".png";
}

async function wait(entry, manifest, dir) {
  const started = Date.now();
  let lastStatus = "";
  while (true) {
    const task = await call(`/tasks/${encodeURIComponent(entry.taskId)}`);
    const status = String(task.status ?? "");
    if (status !== lastStatus) { console.log(`${entry.name}: ${status || "pending"}`); lastStatus = status; }
    if (TERMINAL.has(status)) return finish(entry, task, manifest, dir);
    if (Date.now() - started > WAIT_LIMIT_MS) {
      console.log(`${entry.name}: still ${status} after ${WAIT_LIMIT_MS / 60_000} min; resume with \`bibei.mjs wait ${entry.name}\``);
      process.exit(2);
    }
    await sleep(POLL_MS);
  }
}

async function finish(entry, task, manifest, dir) {
  entry.status = String(task.status);
  entry.completedAt = new Date().toISOString();
  if (entry.kind === "align") {
    if (task.status !== "succeeded" || !task.result) {
      entry.error = task.error ?? { code: "ALIGNMENT_FAILED", message: "no result" };
      await saveManifest(manifest);
      fail(`${entry.name}: alignment ${task.status}: ${redact(entry.error.message ?? entry.error.code)}`);
    }
    const file = join(dir, `${entry.name}.alignment.json`);
    await writeFile(file, `${JSON.stringify({ source: entry.source, language: entry.language, ...task.result }, null, 2)}\n`);
    entry.outputs = [relative(dir, file)];
    await saveManifest(manifest);
    console.log(`${entry.name}: wrote ${file}`);
    return;
  }
  // Bibei may return a site-relative file path ("/api/open/v1/files/…"); it resolves against the API root's origin.
  const urls = (Array.isArray(task.artifacts) ? task.artifacts : []).map((a) => a?.url).filter((u) => typeof u === "string" && u.length > 0)
    .map((u) => new URL(u, `${BASE}/`).href).filter((u) => /^https?:\/\//u.test(u));
  if (urls.length === 0) {
    entry.error = task.error ?? { code: "NO_ARTIFACT", message: `task ${task.status} without artifacts` };
    await saveManifest(manifest);
    // A video with reference files that fails within a minute never reached generation; the usual cause
    // is a Bibei server that cannot serve the references to the video workflow, not the prompt.
    const quick = Date.parse(task.finishedAt ?? "") - Date.parse(task.submittedAt ?? entry.submittedAt ?? "") < 60_000;
    const withRefs = (entry.images?.length ?? 0) + (entry.audios?.length ?? 0) > 0;
    const hint = entry.kind === "video" && withRefs && quick && entry.error.code === "PROVIDER_ERROR"
      ? "\nLikely cause: the video workflow could not fetch the reference files from this Bibei server, so reference-image video is unavailable right now. Changing the prompt will not fix it. Tell the user what that means for the video (guides/1-setup/guiding-the-user.md) before switching to prompt-only shots."
      : "";
    fail(`${entry.name}: ${task.status}: ${redact(entry.error.message ?? entry.error.code)}${hint}`);
  }
  entry.outputs = [];
  for (const [i, url] of urls.entries()) {
    // Artifact URLs are signed and take no Authorization header.
    const response = await fetch(url, { signal: AbortSignal.timeout(300_000) });
    if (!response.ok) fail(`${entry.name}: download failed with HTTP ${response.status}; retry with \`bibei.mjs wait ${entry.name}\``);
    const bytes = Buffer.from(await response.arrayBuffer());
    const file = join(dir, `${entry.name}${urls.length > 1 ? `-${i + 1}` : ""}${extensionFor(response.headers.get("content-type")?.split(";")[0], url, entry.kind)}`);
    await writeFile(file, bytes);
    entry.outputs.push(relative(dir, file));
    console.log(`${entry.name}: saved ${file}`);
  }
  await saveManifest(manifest);
}

// Alignment evidence is canonical 16 kHz mono 16-bit PCM WAV, converted locally.
async function evidenceWav(source) {
  const work = await mkdtemp(join(tmpdir(), "vd-align-"));
  const out = join(work, "evidence.wav");
  const result = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", source, "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", out], { encoding: "utf8" });
  if (result.error) fail("ffmpeg is not on PATH");
  if (result.status !== 0) fail(`cannot convert ${source}: ${result.stderr.trim()}`);
  return { out, work };
}

async function generate(kind, positional, flags) {
  const dir = resolve(typeof flags.dir === "string" ? flags.dir : join("composition", "generated"));
  const manifest = await loadManifest(dir);
  const name = positional[0];
  let spec;
  let cleanup;
  if (kind === "align") {
    const source = positional[1];
    if (!name || !source) fail("usage: align <name> <speech-audio> --language zh [--model <key>]");
    if (!existsSync(source)) fail(`audio not found: ${source}`);
    if (typeof flags.language !== "string" || !/^[a-z]{2,3}$/u.test(flags.language)) fail("--language takes an explicit code such as zh or en");
    const { out, work } = await evidenceWav(source);
    cleanup = work;
    spec = { model: typeof flags.model === "string" ? flags.model : "default", language: flags.language, source: resolve(source), sourceSha256: await sha256(source), evidence: out };
  } else {
    spec = await prepareGeneration(kind, name, flags);
  }
  try {
    const { evidence, ...identity } = spec;
    void evidence;
    const request = requestKey(kind, identity);
    const previous = manifest.data.entries[name];
    const same = previous && previous.request === request;
    if (previous && !same && !flags.replace) {
      fail(`${name} already exists with a different request; pass --replace to generate a new version (the old files stay on disk)`);
    }
    if (same && previous.status === "succeeded" && (previous.outputs ?? []).every((f) => existsSync(join(dir, f)))) {
      console.log(`${name}: reusing ${previous.outputs.join(", ")} (same request already succeeded; nothing charged)`);
      return;
    }
    if (same && previous.taskId && !TERMINAL.has(previous.status)) {
      console.log(`${name}: resuming task ${previous.taskId}`);
      if (!flags["no-wait"]) await wait(previous, manifest, dir);
      return;
    }
    if (previous && flags.replace && !same) {
      // Keep the replaced version: its files move aside under a versioned name, so the new result
      // can take the plain name the composition refers to.
      const version = `${name}@${String(previous.submittedAt ?? Date.now()).replace(/[:.]/gu, "-")}`;
      const kept = [];
      for (const file of previous.outputs ?? []) {
        const from = join(dir, file);
        if (!existsSync(from)) continue;
        const to = join(dir, file.replace(name, version));
        await rename(from, to);
        kept.push(relative(dir, to));
      }
      manifest.data.entries[version] = { ...previous, name: version, outputs: kept };
      delete manifest.data.entries[name];
      await saveManifest(manifest);
      if (kept.length) console.log(`${name}: previous version kept as ${kept.join(", ")}`);
    }
    // A request whose previous attempt ended without a result is retried as a new attempt; any other
    // resubmission of the same request carries the same Idempotency-Key, so a lost response returns
    // the original task instead of charging again.
    const retried = same && TERMINAL.has(previous.status) && previous.status !== "succeeded";
    const attempt = retried ? (previous.attempt ?? 1) + 1 : 1;
    // The key belongs to this name's attempt: another name with the same content is its own task.
    const base = `vd-${createHash("sha256").update(`${request}|${name}`).digest("hex").slice(0, 40)}`;
    const idempotency = attempt === 1 ? base : `${base}-a${attempt}`;
    if (retried) console.log(`${name}: previous attempt ${previous.status}; retrying as attempt ${attempt}`);
    const entry = {
      name, kind, request, attempt,
      ...(kind === "align" ? { model: spec.model, language: spec.language, source: spec.source } : identity),
      submittedAt: new Date().toISOString(), status: "submitting",
    };
    const response = await submit(kind, kind === "align" ? spec : identity, idempotency, manifest);
    if (typeof response.taskId !== "string" || !response.taskId) throw new BibeiError("BAD_RESPONSE", "Bibei returned no taskId");
    entry.taskId = response.taskId;
    entry.idempotencyKey = idempotency;
    entry.status = String(response.status ?? "queued");
    manifest.data.entries[name] = entry;
    await saveManifest(manifest);
    console.log(`${name}: submitted task ${entry.taskId}`);
    if (!flags["no-wait"]) await wait(entry, manifest, dir);
  } catch (error) {
    if (error instanceof BibeiError) {
      if (error.status === 404 && kind === "align") fail(`Bibei alignment is not available at ${API}/alignments (${error.code}); check \`bibei.mjs models\` for an "alignment" group`);
      fail(STOP_CODES.has(error.code) ? `${error.message}\nThis is an account limit: tell the user instead of retrying.` : error.message);
    }
    throw error;
  } finally {
    if (cleanup) await rm(cleanup, { recursive: true, force: true });
  }
}

const { positional: [command, ...rest], flags } = parse(process.argv.slice(2));
try {
  switch (command) {
    case "models": console.log(JSON.stringify(await call("/models"), null, 2)); break;
    case "balance": console.log(JSON.stringify(await call("/balance"), null, 2)); break;
    case "key": if (flags.open) await openKeyFile(); else await keyStatus(); break;
    case "login": await login(); break;
    case "image": await generate("image", rest, flags); break;
    case "video": await generate("video", rest, flags); break;
    case "align": await generate("align", rest, flags); break;
    case "wait": {
      const dir = resolve(typeof flags.dir === "string" ? flags.dir : join("composition", "generated"));
      const manifest = await loadManifest(dir);
      const entry = manifest.data.entries[rest[0]];
      if (!entry?.taskId) fail(`no submitted task named ${rest[0]} in ${manifest.file}`);
      if (entry.status === "succeeded" && entry.outputs?.every((f) => existsSync(join(dir, f)))) { console.log(`${entry.name}: done: ${entry.outputs.join(", ")}`); break; }
      await wait(entry, manifest, dir);
      break;
    }
    case "status": {
      const dir = resolve(typeof flags.dir === "string" ? flags.dir : join("composition", "generated"));
      const { data } = await loadManifest(dir);
      const rows = Object.values(data.entries).filter((e) => !rest[0] || e.name === rest[0]);
      for (const e of rows) console.log(`${e.name.padEnd(24)} ${e.kind.padEnd(6)} ${String(e.status).padEnd(10)} ${e.taskId ?? ""} ${(e.outputs ?? []).join(", ")}`);
      if (rows.length === 0) console.log("no entries");
      break;
    }
    default: {
      const self = await readFile(new URL(import.meta.url), "utf8");
      const header = self.split("\n").slice(1);
      console.log(header.slice(0, header.findIndex((l) => !l.startsWith("//"))).map((l) => l.replace(/^\/\/ ?/u, "")).join("\n"));
      process.exit(command === undefined || command === "help" ? 0 : 1);
    }
  }
} catch (error) {
  if (error instanceof BibeiError) fail(error.message);
  throw error;
}

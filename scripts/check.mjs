// Delivery checks for the video-director Skill: a final render must realize the production's
// plan.json. `render.mjs render` runs `preflight` before any non-draft render and `verifyOutput`
// after it; `render.mjs check <composition-dir>` runs the preflight alone.
//
// Each check has an id. A failing check passes only through a matching entry in plan.json's
// `deviations` that the user approved: { "check": "<id>", "file": "<optional path>",
// "what": "…", "userApproved": true, "userWords": "…" }.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";

export const MAX_SHOT_SECONDS = 15;
const AUDIO_SOURCES = new Set(["tts", "host-tts", "generated", "user-supplied", "recorded", "reference"]);
const AUDIO_ROLES = new Set(["speech", "music", "effect", "ambience", "footage"]);
const MEDIA_EXT = new Set([".mp4", ".mov", ".webm", ".mkv", ".m4v", ".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg", ".opus"]);
// Envelope similarity above this means the file carries the reference's own sound.
const REFERENCE_SIMILARITY = 0.9;
const GUIDE = "guides/2-plan/production-plan.md";

const TELL_USER = "If this change is what the work now needs, tell the user in plain words (guides/1-setup/guiding-the-user.md) and record it in plan.json `deviations` only after they agree.";

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/gu)) {
    out[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? "";
  }
  return out;
}

// Static media elements of the page. Speech <audio> built at runtime from timeline.js is read from
// script.json instead.
function mediaElements(html) {
  const found = [];
  for (const m of html.matchAll(/<(video|audio)\b([^>]*)>/giu)) {
    const a = attrs(m[2]);
    if (a.src) found.push({ kind: m[1].toLowerCase(), src: a.src, muted: "muted" in a, start: Number(a["data-start"] ?? 0), duration: Number(a["data-duration"] ?? NaN) });
  }
  return found;
}

function norm(path) { return path.replace(/\\/gu, "/").replace(/^\.\//u, ""); }

async function readJson(file) {
  try { return JSON.parse(await readFile(file, "utf8")); } catch (error) { return { __error: error.message }; }
}

// ---------- reference-sound fingerprint ----------

// Loudness envelope: RMS of 50 ms frames of mono 8 kHz audio, as a plain array.
function envelope(file, maxSeconds) {
  const args = ["-v", "error", "-i", file, "-vn", "-ac", "1", "-ar", "8000", ...(maxSeconds ? ["-t", String(maxSeconds)] : []), "-f", "s16le", "-"];
  const result = spawnSync("ffmpeg", args, { maxBuffer: 512 * 1024 * 1024 });
  if (result.error || result.status !== 0 || !result.stdout?.length) return undefined;
  const samples = new Int16Array(result.stdout.buffer, result.stdout.byteOffset, Math.floor(result.stdout.length / 2));
  const frame = 400;
  const env = [];
  for (let i = 0; i + frame <= samples.length; i += frame) {
    let sum = 0;
    for (let j = i; j < i + frame; j += 1) sum += samples[j] * samples[j];
    env.push(Math.sqrt(sum / frame));
  }
  return env;
}

// Best Pearson correlation of `a` against `b` over all offsets with a meaningful overlap.
function bestMatch(a, b) {
  const minOverlap = Math.min(a.length, b.length, 200); // 10 s, or the whole shorter file
  if (minOverlap < 40) return 0; // under 2 s: too short to judge
  let best = 0;
  for (let off = -(a.length - minOverlap); off <= b.length - minOverlap; off += 1) {
    const s = Math.max(0, -off);
    const e = Math.min(a.length, b.length - off);
    const n = e - s;
    if (n < minOverlap) continue;
    let sa = 0; let sb = 0;
    for (let i = s; i < e; i += 1) { sa += a[i]; sb += b[i + off]; }
    const ma = sa / n; const mb = sb / n;
    let num = 0; let da = 0; let db = 0;
    for (let i = s; i < e; i += 1) {
      const x = a[i] - ma; const y = b[i + off] - mb;
      num += x * y; da += x * x; db += y * y;
    }
    if (da > 0 && db > 0) best = Math.max(best, num / Math.sqrt(da * db));
  }
  return best;
}

function referenceMedia(root) {
  const dir = join(root, "reference");
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (MEDIA_EXT.has(extname(name).toLowerCase())) out.push(p);
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}

// ---------- the checks ----------

export async function preflight(compositionDir, entry = "index.html") {
  const comp = resolve(compositionDir);
  const root = dirname(comp);
  const results = [];
  const fail = (check, message, file) => results.push({ check, ok: false, message, ...(file ? { file } : {}) });
  const pass = (check, message) => results.push({ check, ok: true, message });

  const planFile = join(root, "plan.json");
  if (!existsSync(planFile)) {
    fail("plan-present", `${planFile} is missing. Write it before a final render: the planned shots, target duration and every non-speech sound with its source, taken from TREATMENT.md (${GUIDE}). A project started before plan.json existed needs one written now from its current Treatment.`);
    return { root, plan: undefined, results };
  }
  const plan = await readJson(planFile);
  if (plan.__error) { fail("plan-present", `plan.json is not valid JSON: ${plan.__error}`); return { root, plan: undefined, results }; }
  pass("plan-present", "plan.json found");

  // Shape
  const shapeErrors = [];
  if (!(Number(plan.targetDuration) > 0)) shapeErrors.push("`targetDuration` (seconds) is required");
  if (!Array.isArray(plan.shots) || plan.shots.length === 0) shapeErrors.push("`shots` must list at least one shot");
  if (!Array.isArray(plan.audio)) shapeErrors.push("`audio` must be an array (empty when the film has no sound besides speech)");
  if (plan.deviations !== undefined && !Array.isArray(plan.deviations)) shapeErrors.push("`deviations` must be an array");
  for (const [i, s] of (plan.shots ?? []).entries()) {
    if (!s?.id || !s?.scene) shapeErrors.push(`shots[${i}] needs \`id\` and \`scene\``);
    if (!(Number(s?.duration) > 0)) shapeErrors.push(`shots[${i}] needs a positive \`duration\``);
  }
  for (const [i, a] of (plan.audio ?? []).entries()) {
    if (!a?.file) shapeErrors.push(`audio[${i}] needs \`file\` (path inside composition/)`);
    if (!AUDIO_ROLES.has(a?.role)) shapeErrors.push(`audio[${i}].role must be one of ${[...AUDIO_ROLES].join(", ")}`);
    if (!AUDIO_SOURCES.has(a?.source)) shapeErrors.push(`audio[${i}].source must be one of ${[...AUDIO_SOURCES].join(", ")}`);
  }
  if (shapeErrors.length) { fail("plan-shape", `plan.json: ${shapeErrors.join("; ")} (${GUIDE})`); return { root, plan, results }; }
  pass("plan-shape", `${plan.shots.length} shots, target ${plan.targetDuration}s`);

  const html = await readFile(join(comp, entry), "utf8");
  const media = mediaElements(html);
  const manifest = await readJson(join(comp, "generated", "manifest.json"));
  const entries = manifest.__error ? {} : manifest.entries ?? {};

  // Shots: each generated shot is at most 15 s, finished, and on the page.
  for (const shot of plan.shots) {
    if (Number(shot.duration) > MAX_SHOT_SECONDS && shot.video) {
      fail("shot-length", `shot ${shot.id} is planned at ${shot.duration}s; a generated shot is at most ${MAX_SHOT_SECONDS}s. Split it into shots of at most ${MAX_SHOT_SECONDS}s, each its own request, cut together in the composition.`, shot.id);
    }
    if (!shot.video) continue;
    const e = entries[shot.video];
    if (!e || e.status !== "succeeded" || !e.outputs?.length) {
      fail("scene-count", `shot ${shot.id} ("${shot.scene}") names video "${shot.video}", which has not been generated successfully (bibei.mjs status). Generate it, or ${TELL_USER.charAt(0).toLowerCase()}${TELL_USER.slice(1)}`, shot.id);
      continue;
    }
    if (Number(e.duration) > MAX_SHOT_SECONDS) fail("shot-length", `video ${shot.video} was requested at ${e.duration}s; the limit is ${MAX_SHOT_SECONDS}s per request.`, shot.id);
    const used = media.some((m) => m.kind === "video" && e.outputs.some((o) => norm(m.src).endsWith(basename(o))));
    if (!used) fail("scene-count", `shot ${shot.id} ("${shot.scene}") is planned but its video ${e.outputs.join(", ")} is not on the composition page. Place it, or ${TELL_USER.charAt(0).toLowerCase()}${TELL_USER.slice(1)}`, shot.id);
  }
  if (!results.some((r) => r.check === "scene-count" && !r.ok)) pass("scene-count", `all ${plan.shots.length} planned shots are realized`);
  if (!results.some((r) => r.check === "shot-length" && !r.ok)) pass("shot-length", `every generated shot is at most ${MAX_SHOT_SECONDS}s`);

  // Sound: every audible file is registered with its source.
  const registered = new Map((plan.audio ?? []).map((a) => [norm(a.file), a]));
  const script = existsSync(join(root, "script.json")) ? await readJson(join(root, "script.json")) : undefined;
  const speechFiles = new Set((script?.segments ?? []).filter((s) => s.audio).map((s) => norm(relative(comp, resolve(root, s.audio)))));
  const audible = media.filter((m) => m.kind === "audio" || !m.muted).map((m) => norm(m.src));
  for (const file of new Set(audible)) {
    if (speechFiles.has(file)) continue;
    const a = registered.get(file);
    if (!a) { fail("audio-registered", `${file} is audible in the composition but not listed in plan.json \`audio\` with its role and source. Register it; a sound whose source you cannot name does not belong in the film.`, file); continue; }
    if (a.role === "speech") fail("speech-script", `${file} is speech but is not a segment of script.json. Every spoken word comes from script.json segments so captions and sound stay the same words; add the segment and rebuild the timeline.`, file);
    if (a.source === "reference") fail("reference-audio", `${file} is the reference's own sound. Reference material is for analysis; its sound goes into the film only when the user asked for it. ${TELL_USER}`, file);
  }
  if (!results.some((r) => r.check === "audio-registered" && !r.ok)) pass("audio-registered", `${audible.length} audible file(s) registered`);

  // Speech: script-owned, and the timeline built after its last change.
  if (speechFiles.size > 0) {
    const timeline = join(root, "timing", "timeline.json");
    const newest = Math.max(statSync(join(root, "script.json")).mtimeMs, ...[...speechFiles].map((f) => (existsSync(join(comp, f)) ? statSync(join(comp, f)).mtimeMs : 0)));
    if (!existsSync(timeline)) fail("speech-script", "script.json has speech but timing/timeline.json is missing; run timeline.mjs build so captions come from the same words as the sound.");
    else if (statSync(timeline).mtimeMs + 1 < newest) fail("speech-script", "script.json or a speech file changed after timing/timeline.json was built; rebuild it with timeline.mjs build.");
    if (!/timeline\.js/u.test(html)) fail("speech-script", "the composition does not load timeline.js, so captions and speech placement are not taken from the timeline.");
    for (const f of speechFiles) if (!existsSync(join(comp, f))) fail("speech-script", `speech file ${f} named in script.json does not exist.`, f);
  }
  if (!results.some((r) => r.check === "speech-script" && !r.ok)) pass("speech-script", speechFiles.size ? `${speechFiles.size} speech segment(s) from script.json` : "no speech");

  // Reference sound: compare every audible file with the reference media.
  const refs = referenceMedia(root);
  if (refs.length > 0) {
    const refEnvs = refs.map((r) => ({ file: r, env: envelope(r, 600) })).filter((r) => r.env?.length);
    for (const file of new Set([...audible, ...speechFiles])) {
      const env = envelope(join(comp, file), 120);
      if (!env?.length) continue;
      for (const r of refEnvs) {
        const score = bestMatch(env, r.env);
        if (score >= REFERENCE_SIMILARITY) {
          fail("reference-audio", `${file} carries the sound of the reference ${relative(root, r.file)} (similarity ${score.toFixed(2)}). Reference material is for analysis, not for the film, unless the user asked to reuse it. Replace it with the planned sound, or ${TELL_USER.charAt(0).toLowerCase()}${TELL_USER.slice(1)}`, file);
          break;
        }
      }
    }
  }
  if (!results.some((r) => r.check === "reference-audio" && !r.ok)) pass("reference-audio", refs.length ? `no audible file matches the reference's sound (${refs.length} reference file(s) compared)` : "no reference media");

  return { root, plan, results: applyDeviations(plan, results) };
}

// A failing check passes when the user approved a deviation for that check (and file, when named).
function applyDeviations(plan, results) {
  const approved = (plan?.deviations ?? []).filter((d) => d?.userApproved === true && d.check);
  return results.map((r) => {
    if (r.ok) return r;
    const d = approved.find((x) => x.check === r.check && (!x.file || !r.file || norm(x.file) === norm(r.file)));
    return d ? { ...r, ok: true, deviation: d.what ?? true, message: `${r.message} — accepted as a user-approved deviation: ${d.what ?? ""}` } : r;
  });
}

// After rendering: the film's actual length against the plan.
export function verifyOutput(plan, output) {
  const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", output], { encoding: "utf8" });
  const seconds = Number(probe.stdout?.trim());
  const target = Number(plan.targetDuration);
  const tolerance = Math.max(1.5, target * 0.1);
  const result = Number.isFinite(seconds) && Math.abs(seconds - target) <= tolerance
    ? { check: "duration", ok: true, message: `film is ${seconds.toFixed(2)}s; planned ${target}s` }
    : { check: "duration", ok: false, message: `film is ${Number.isFinite(seconds) ? seconds.toFixed(2) : "?"}s but plan.json promises ${target}s (±${tolerance.toFixed(1)}s). Realize the planned length, or ${TELL_USER.charAt(0).toLowerCase()}${TELL_USER.slice(1)}` };
  return applyDeviations(plan, [result])[0];
}

export function printResults(results) {
  for (const r of results) console.log(`${r.ok ? (r.deviation ? "ok* " : "ok  ") : "FAIL"}  ${r.check}: ${r.message}`);
}

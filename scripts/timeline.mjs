#!/usr/bin/env node
// Builds the production timeline from the formal script, each segment's speech audio and (when
// available) its measured alignment. Displayed words always come from the script; alignment only
// supplies time.
//
//   node timeline.mjs build <script.json> [--out timing/timeline.json] [--js composition/timeline.js]
//   (timeline.js carries audio paths relative to its own folder, the composition's render root)
//                           [--gap 0.25] [--lead 0.3] [--tail 0.6]
//   node timeline.mjs show <timeline.json>
//
// script.json:
//   { "language": "zh",
//     "segments": [ { "id": "s1", "speaker": "narrator", "text": "其实我很贪恋你||主动找我的时刻",
//                     "audio": "composition/audio/s1.wav", "alignment": "composition/generated/s1.alignment.json",
//                     "gap": 0.3, "start": 12.0 } ] }
// `||` in text marks a caption Cue break. `alignment` is optional (without it, times are estimated
// from the audio). `start` pins a segment on the film clock; otherwise it follows the previous one
// after `gap` (default --gap). Paths resolve from the script file's folder.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

function fail(message) { console.error(`error: ${message}`); process.exit(1); }

function parse(argv) {
  const positional = []; const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) { positional.push(a); continue; }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) flags[a.slice(2)] = true;
    else { flags[a.slice(2)] = next; i += 1; }
  }
  return { positional, flags };
}

const num = (v, d, name) => {
  if (v === undefined) return d;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) fail(`--${name} takes non-negative seconds`);
  return n;
};
const round = (t) => Math.round(t * 1000) / 1000;

// ---------- script text → display units ----------

const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const WORDCHAR = /[\p{L}\p{N}'’]/u;
// Sentence ends and clause marks: where speech pauses and where a Cue may break.
const STRONG = /[。！？!?…；;]/u;
const WEAK = /[，,、：:—–]/u;

/** One displayed unit: a CJK character or a Latin/number word, with its punctuation and spacing. */
function units(text) {
  const out = [];
  const breaks = new Set();
  let space = "";
  let i = 0;
  const chars = [...text];
  while (i < chars.length) {
    if (chars[i] === "|" && chars[i + 1] === "|") { breaks.add(out.length); i += 2; continue; }
    const c = chars[i];
    if (/\s/u.test(c)) { space += c; i += 1; continue; }
    if (CJK.test(c)) { out.push({ space, text: c }); space = ""; i += 1; continue; }
    if (WORDCHAR.test(c)) {
      let w = "";
      while (i < chars.length && WORDCHAR.test(chars[i]) && !CJK.test(chars[i])) { w += chars[i]; i += 1; }
      out.push({ space, text: w }); space = ""; continue;
    }
    // Punctuation: attach to the previous unit; before any unit, to the next one's leading space.
    if (out.length > 0 && space === "") out[out.length - 1].text += c;
    else space += c;
    i += 1;
  }
  if (space && out.length > 0) out[out.length - 1].text += space.trimEnd();
  return { units: out, breaks: [...breaks].filter((b) => b > 0 && b < out.length).sort((a, b) => a - b) };
}

const key = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

// ---------- alignment evidence ----------

/** Flatten a WhisperX-shaped result into timed characters (a timed word spreads over its chars). */
function evidenceChars(result) {
  const words = [];
  for (const seg of Array.isArray(result.segments) ? result.segments : []) {
    for (const w of Array.isArray(seg.words) ? seg.words : []) words.push(w);
  }
  if (words.length === 0 && Array.isArray(result.words)) words.push(...result.words);
  const chars = [];
  for (const w of words) {
    const k = [...key(String(w.word ?? w.text ?? ""))];
    if (k.length === 0) continue;
    const timed = Number.isFinite(w.start) && Number.isFinite(w.end) && w.end >= w.start;
    k.forEach((c, j) => chars.push(timed
      ? { c, start: w.start + ((w.end - w.start) * j) / k.length, end: w.start + ((w.end - w.start) * (j + 1)) / k.length }
      : { c }));
  }
  return chars;
}

// Edit costs: an exact match is free; a substitution (a misheard character, still spoken at that
// time) costs less than dropping one side and inserting the other, but more than either alone, so a
// skipped or extra character never drags its neighbours onto the wrong time.
const INDEL = 2;
const SUB = 3;

/** Monotonic character alignment; returns script-char index → evidence-char index. */
function match(a, b) {
  const n = a.length, m = b.length;
  const cost = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = 0; i <= n; i += 1) cost[i][0] = i * INDEL;
  for (let j = 0; j <= m; j += 1) cost[0][j] = j * INDEL;
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      const sub = cost[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : SUB);
      cost[i][j] = Math.min(sub, cost[i - 1][j] + INDEL, cost[i][j - 1] + INDEL);
    }
  }
  const pairs = new Map();
  let i = n, j = m;
  while (i > 0 && j > 0) {
    const same = a[i - 1] === b[j - 1];
    if (cost[i][j] === cost[i - 1][j - 1] + (same ? 0 : SUB)) {
      pairs.set(i - 1, j - 1); i -= 1; j -= 1;
    } else if (cost[i][j] === cost[i - 1][j] + INDEL) i -= 1;
    else j -= 1;
  }
  return pairs;
}

function aligned(list, result, audioDuration) {
  const ev = evidenceChars(result);
  const script = [];
  list.forEach((u, index) => [...key(u.text)].forEach((c) => script.push({ c, index })));
  const pairs = match(script.map((s) => s.c), ev.map((e) => e.c));
  const measured = list.map(() => ({ start: Infinity, end: -Infinity }));
  script.forEach((s, k) => {
    const e = pairs.has(k) ? ev[pairs.get(k)] : undefined;
    if (e && e.start !== undefined) {
      measured[s.index].start = Math.min(measured[s.index].start, e.start);
      measured[s.index].end = Math.max(measured[s.index].end, e.end);
    }
  });
  const timedEv = ev.filter((e) => e.start !== undefined);
  const speechStart = timedEv.length ? timedEv[0].start : 0;
  const speechEnd = timedEv.length ? timedEv[timedEv.length - 1].end : audioDuration;
  const out = list.map((u, i) => (Number.isFinite(measured[i].start)
    ? { ...u, start: measured[i].start, end: measured[i].end, source: "measured" }
    : { ...u }));
  fillGaps(out, speechStart, speechEnd, "interpolated");
  // Keep order: a unit never starts before the previous one.
  for (let i = 1; i < out.length; i += 1) {
    if (out[i].start < out[i - 1].start) out[i].start = out[i - 1].start;
    if (out[i].end < out[i].start) out[i].end = out[i].start;
  }
  const measuredCount = out.filter((u) => u.source === "measured").length;
  return { units: out, coverage: list.length ? measuredCount / list.length : 1 };
}

/** Units without time share the span between their timed neighbours, by character weight. */
function fillGaps(list, lower, upper, source) {
  let i = 0;
  while (i < list.length) {
    if (list[i].start !== undefined) { i += 1; continue; }
    let j = i;
    while (j < list.length && list[j].start === undefined) j += 1;
    const from = i > 0 ? list[i - 1].end : lower;
    const to = j < list.length ? list[j].start : upper;
    const weights = list.slice(i, j).map(weight);
    const total = weights.reduce((a, b) => a + b, 0);
    let t = from;
    for (let k = i; k < j; k += 1) {
      const d = total > 0 ? ((Math.max(to, from) - from) * weights[k - i]) / total : 0;
      list[k] = { ...list[k], start: t, end: t + d, source };
      t += d;
    }
    i = j;
  }
}

/** Speaking weight: characters, plus a pause after clause and sentence punctuation. */
function weight(u) {
  const chars = Math.max(1, [...key(u.text)].length);
  const base = CJK.test(u.text) ? chars : Math.max(1, chars / 3);
  return base + (STRONG.test(u.text) ? 1.2 : WEAK.test(u.text) ? 0.6 : 0);
}

// ---------- audio ----------

function probeDuration(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  if (r.error) fail("ffprobe is not on PATH");
  const d = Number(r.stdout.trim());
  if (!Number.isFinite(d) || d <= 0) fail(`cannot read the duration of ${file}`);
  return d;
}

/** Leading and trailing silence, so estimated words land inside the actual speech. */
function speechBounds(file, duration) {
  const r = spawnSync("ffmpeg", ["-v", "info", "-i", file, "-af", "silencedetect=noise=-38dB:d=0.12", "-f", "null", "-"], { encoding: "utf8" });
  const log = r.stderr ?? "";
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/gu)].map((m) => Number(m[1]));
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/gu)].map((m) => Number(m[1]));
  let start = 0, end = duration;
  if (starts.length && starts[0] <= 0.01 && ends.length) start = ends[0];
  const lastStart = starts[starts.length - 1];
  if (lastStart !== undefined && lastStart > start && (ends.length < starts.length || ends[ends.length - 1] >= duration - 0.05)) end = lastStart;
  return { start: Math.min(start, end), end };
}

// ---------- cues ----------

/** Reading width: a CJK character is one, any other character half. */
function width(s) {
  let w = 0;
  for (const c of s) w += CJK.test(c) ? 1 : 0.5;
  return w;
}

function cues(list, breaks, language) {
  // About 14 CJK characters, or 28 Latin characters, per Cue line.
  const limit = language === "ko" ? 16 : 14;
  const bounds = [0, ...breaks, list.length];
  const out = [];
  for (let b = 0; b + 1 < bounds.length; b += 1) {
    // Within an authored Cue, split only when it runs long: after sentence ends, then clauses.
    let from = bounds[b];
    const to = bounds[b + 1];
    let length = 0, lastWeak = -1;
    for (let i = from; i < to; i += 1) {
      length += width(list[i].space + list[i].text);
      const endsHere = i + 1;
      if (STRONG.test(list[i].text) && endsHere < to && breaks.length === 0) { out.push([from, endsHere]); from = endsHere; length = 0; lastWeak = -1; continue; }
      if (WEAK.test(list[i].text)) lastWeak = endsHere;
      if (length > limit && endsHere < to) {
        const cut = lastWeak > from ? lastWeak : endsHere;
        out.push([from, cut]);
        from = cut; lastWeak = -1;
        length = list.slice(from, endsHere).reduce((n, u) => n + width(u.space + u.text), 0);
      }
    }
    if (from < to) out.push([from, to]);
  }
  return out.map(([a, b]) => ({
    text: list.slice(a, b).map((u, k) => (k === 0 ? u.space.trimStart() : u.space) + u.text).join(""),
    start: list[a].start, end: list[b - 1].end, units: [a, b],
  }));
}

// ---------- build ----------

async function build(scriptFile, flags) {
  const base = dirname(resolve(scriptFile));
  const script = JSON.parse(await readFile(scriptFile, "utf8"));
  if (!Array.isArray(script.segments) || script.segments.length === 0) fail("script.json needs a non-empty segments array");
  const language = String(script.language ?? "zh");
  const gap = num(flags.gap, 0.25, "gap");
  const lead = num(flags.lead, 0.3, "lead");
  const tail = num(flags.tail, 0.6, "tail");
  const ids = new Set();
  let cursor = lead;
  const segments = [];
  const report = [];
  for (const [n, seg] of script.segments.entries()) {
    const id = String(seg.id ?? `s${n + 1}`);
    if (ids.has(id)) fail(`duplicate segment id ${id}`);
    ids.add(id);
    if (typeof seg.text !== "string" || !seg.text.trim()) fail(`segment ${id} has no text`);
    if (typeof seg.audio !== "string") fail(`segment ${id} has no audio; generate its speech first`);
    const audio = resolve(base, seg.audio);
    if (!existsSync(audio)) fail(`segment ${id}: audio not found: ${seg.audio}`);
    const audioDuration = probeDuration(audio);
    const { units: list, breaks } = units(seg.text);
    if (list.length === 0) fail(`segment ${id} has no speakable text`);

    let timed, timing, coverage;
    if (typeof seg.alignment === "string" && existsSync(resolve(base, seg.alignment))) {
      const result = JSON.parse(await readFile(resolve(base, seg.alignment), "utf8"));
      ({ units: timed, coverage } = aligned(list, result, audioDuration));
      timing = "aligned";
    } else {
      if (typeof seg.alignment === "string") console.warn(`warning: ${id}: alignment ${seg.alignment} not found; estimating`);
      const bounds = speechBounds(audio, audioDuration);
      timed = list.map((u) => ({ ...u }));
      fillGaps(timed, bounds.start, bounds.end, "estimated");
      timing = "estimated";
      coverage = 0;
    }
    const start = Number.isFinite(seg.start) ? seg.start : cursor + (n === 0 ? 0 : Number.isFinite(seg.gap) ? seg.gap : gap);
    const shift = (u) => ({ ...u, start: round(start + u.start), end: round(start + Math.min(u.end, audioDuration)) });
    const placed = timed.map(shift);
    segments.push({
      id, speaker: seg.speaker ?? null, audio: relative(base, audio).replaceAll("\\", "/"),
      start: round(start), end: round(start + audioDuration), audioDuration: round(audioDuration),
      timing, coverage: round(coverage),
      units: placed.map(({ space, text, start: s, end: e, source }) => ({ ...(space ? { space } : {}), text, start: s, end: e, source })),
      cues: cues(placed, breaks, language).map((c) => ({ ...c, start: round(c.start), end: round(c.end) })),
    });
    report.push(`${id.padEnd(8)} ${String(round(start)).padStart(7)}s +${audioDuration.toFixed(2)}s  ${timing}${timing === "aligned" ? ` (${Math.round(coverage * 100)}% measured)` : ""}  ${list.length} units, ${segments.at(-1).cues.length} cues`);
    cursor = start + audioDuration;
  }
  const duration = round(Math.max(...segments.map((s) => s.end)) + tail);
  const timeline = { format: "video-director.timeline@1", language, duration, segments };
  const out = resolve(typeof flags.out === "string" ? flags.out : resolve(base, "timing", "timeline.json"));
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(timeline, null, 2)}\n`);
  if (typeof flags.js === "string") {
    // The composition folder is the render root: the page sees audio paths relative to it, and
    // the renderer serves nothing outside it.
    const jsDir = dirname(resolve(flags.js));
    const outside = [];
    const forPage = {
      ...timeline,
      segments: segments.map((s) => {
        const path = relative(jsDir, resolve(base, s.audio)).replaceAll("\\", "/");
        if (path.startsWith("../") || /^[a-z]:/iu.test(path)) outside.push(s.id);
        return { ...s, audio: path };
      }),
    };
    if (outside.length) console.warn(`warning: audio for ${outside.join(", ")} lies outside ${jsDir}; the renderer cannot load it — keep speech under the composition folder`);
    await mkdir(jsDir, { recursive: true });
    await writeFile(resolve(flags.js), `// Generated by timeline.mjs from ${relative(jsDir, resolve(scriptFile)).replaceAll("\\", "/")}; rebuild instead of editing.\nwindow.TIMELINE = ${JSON.stringify(forPage)};\n`);
  }
  console.log(report.join("\n"));
  console.log(`duration ${duration}s -> ${out}${typeof flags.js === "string" ? ` and ${flags.js}` : ""}`);
  const weak = segments.filter((s) => s.timing === "aligned" && s.coverage < 0.6);
  if (weak.length) console.warn(`warning: low measured coverage in ${weak.map((s) => s.id).join(", ")}: check that the speech follows the script`);
}

async function show(file) {
  const t = JSON.parse(await readFile(file, "utf8"));
  for (const s of t.segments) {
    console.log(`${s.id} [${s.start}–${s.end}] ${s.timing}`);
    for (const c of s.cues) console.log(`  ${String(c.start).padStart(7)}–${String(c.end).padEnd(7)} ${c.text}`);
  }
  console.log(`duration ${t.duration}s`);
}

const { positional: [command, ...rest], flags } = parse(process.argv.slice(2));
if (command === "build" && rest[0]) await build(rest[0], flags);
else if (command === "show" && rest[0]) await show(rest[0]);
else {
  const self = await readFile(new URL(import.meta.url), "utf8");
  const lines = self.split("\n").slice(1);
  console.log(lines.slice(0, lines.findIndex((l) => !l.startsWith("//"))).map((l) => l.replace(/^\/\/ ?/u, "")).join("\n"));
  process.exit(command === undefined || command === "help" ? 0 : 1);
}

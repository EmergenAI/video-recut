# Video Recut

An Agent Skill that directs and produces short videos from a brief, reference videos or supplied
material. It generates images and video through the user's own Bibei account, uses the host agent's
speech tool (or a TTS service the user names), and composes and renders the result as an HTML
composition with HyperFrames and FFmpeg.

## Install

```bash
npx skills add EmergenAI/video-recut -g
```

`-g` installs the Skill in your user folder, so your agent can use it in every project. Without it,
the Skill is installed only into the folder you run the command in. The installer asks which agents
to install for.

Before the first video you need Node.js 22 or newer, FFmpeg and ffprobe on your PATH, and your own
Bibei open-platform key with credits (https://www.bibei.cn/app/open-platform). The agent checks each
of these and walks you through anything missing; the Skill pays for no generation.

## What is inside

- `SKILL.md`: the Skill's entry point
- `guides/`: directing and production knowledge the agent reads as needed, in the order of the work
  (`1-setup`, `2-plan`, `3-materials`, `4-compose`, `5-deliver`), plus `formats/` and worked `examples/`
- `scripts/`: `bibei.mjs` (generation), `timeline.mjs` (speech timing), `render.mjs` (render and review),
  `check.mjs` (delivery checks a final render runs against the production's `plan.json`)

Setup: run `npm install` in `scripts/`, then `node scripts/render.mjs doctor`. Each user connects
their own Bibei key on first use (`node scripts/bibei.mjs key`). See `THIRD_PARTY_NOTICES.md` for the
software the scripts install and use.

## License

MIT, see `LICENSE`. Third-party software the scripts install keeps its own license
(`THIRD_PARTY_NOTICES.md`).

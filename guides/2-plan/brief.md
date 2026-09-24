# Brief and Treatment

Come here any time the target video needs defining. The starting point might be a reference, a rough
idea, a project already under way, or a change to something that has been made.

Two documents carry the definition. `BRIEF.md` records the user's wishes and the questions that are
theirs alone to decide. `TREATMENT.md` holds your answer as director: the complete creative design of the new piece.
Keep them apart; they change for different reasons.

## Brief preserves user authority

Record the user's wishes, along with any facts that only the user is in a position to state. When one
sentence covers it, write one sentence:

> Remake the attached cooking reel beat for beat, but the host is my sister Lin (photos in
> `composition/assets/lin/`) and the product is our Hearthstone ceramic rice cooker instead of the air
> fryer.

Add more only when it matters to the work. Useful categories:

- the outcome, audience, platform, deliverables and commercial purpose;
- claims, product facts, offers, the call to action, language, and any fact that must be exact;
- each reference and what the user wants to inherit from it;
- the replacements, additions, removals and style changes they asked for;
- private identity material (the user's face, voice, family) and exact brand material (logo files,
  colour codes, UI screenshots);
- hard limits on length, format, budget and delivery;
- choices the user has explicitly kept for themselves.

Where a paraphrase could shift the meaning, quote the user or stay close to their words. Do not turn
the way one example video happens to open into a format rule, and keep implementation choices out.

In a faithful adaptation, relationships the user did not mention are inherited from the reference by
default: the structure, the role each layer plays, the promise-and-payoff relation, and the sound and
picture systems that make the piece work. Treat that as the starting interpretation, not a
pixel-for-pixel copy.

Ask the user only when the known facts cannot decide between materially different targets, a private
fact, a significant trade-off of value, the deliverables, or authority to spend. Routine casting, art
direction, shots, caption treatment, scene design, prompts and implementation are your job; decide
them and say what you chose.

### Paid scope

Record the spending agreement as a production constraint, in plain words:

- which account pays, by a non-secret label ("the user's Bibei account", "the TTS service the user
  picked");
- which work the agreement covers;
- the points or cost the user accepted, and any limit they attached.

Keep your proposed estimate distinct from what the user accepted, and an estimate distinct from a hard
ceiling. Update the section whenever the user changes it, so another session can continue under the
same authority. Record, in the same everyday language, the voice and service choices the user made and
any machine setup they agreed to. Never write a key into the Brief.

How to build the estimate: [talking about cost](../1-setup/services.md#talking-about-cost). How the
agreement applies to each paid request: [before paying](../3-materials/generation-requests.md#before-paying).

## TREATMENT.md: the director's answer

Synthesize the Brief, what matters from the references and your current creative judgement into one
complete design for the new piece. Cover what the piece needs, for example:

- the creative premise and what the viewer experiences;
- the progression: the opening hook, reveals, payoff, call to action;
- the target pace and the job of each major passage;
- characters, performance, voice, camera, locations, the visual world;
- the A-roll, B-roll, captions, typography, motion, effects and audio systems the target really needs;
- how each requested change propagates through those systems;
- which generated or user-supplied material anchors identity and continuity;
- the open creative questions that genuinely block the design from becoming concrete.

Write it in a director's language. File names, HTML structure, model keys, request order and task ids
belong to the production files, not here. Compare:

- Director's language: "The first shot holds on the empty pot long enough for the viewer to expect
  failure. The lid lifts on 'thirty minutes', and the steam answers the doubt before Lin does."
- Director's language: "Lin talks to the lens like a friend who already made the mistake you are about
  to make: amused, never preachy. Her hands stay busy; the advice comes out sideways."
- Not the Treatment's job: "Scene 2 uses `generated/lin-kitchen-a.png` from 1.2 s with a GSAP fade."

Say how the appeal reaches the viewer. If the piece runs on contrast, state what expectation it sets
up first and how the wording, situation, reveal or response plays with it; a difference is only the
start of an idea until you say why it is funny or satisfying. Give each performer a clear attitude
toward the topic and toward the listener. [Voice direction](../3-materials/voices.md) and
[video direction](../3-materials/video.md) turn those attitudes into casting and
performance.

A reference's Analysis explains why the old piece worked; the Treatment says what the new piece is. For
an original piece, the Treatment grows from the Brief, relevant examples and your own judgement rather
than from one dominant reference. Keep those sources of creative evidence distinct.

## One formal script

Spoken wording has authority in exactly one place: `script.json`. Draft lines in scratch notes if that
helps; once a wording is adopted, move it into `script.json` and do not keep a second full copy in the
Brief or the Treatment.

- The Brief may keep a claim that must appear or an exact phrase the user gave.
- The Treatment says what each passage has to accomplish.
- `script.json` owns the actual words, speakers, segments and Cue breaks. See
  [script and time](script.md).

## Change the file that owns the fact

| What changed | Edit |
| --- | --- |
| The user's goal, claims, constraints or requested replacements | `BRIEF.md` |
| The story, shot logic, visual system, performance or creative approach | `TREATMENT.md` |
| Prompt refinements, scene geometry, choice of generated version, timing fixes that keep the same design | `script.json`, the prompt file in `prompts/`, or the composition page; not the Treatment |
| New evidence about a reference | its Analysis or Timeline, which may lead you to reconsider the Treatment |

Draft renders and review sheets make the current design visible. If the design itself is wrong, revise
the Treatment. If the design is right and the execution is wrong, fix the production. Change the Brief
only when the user's facts changed.

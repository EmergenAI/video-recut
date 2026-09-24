# Street interview

Read this when an interviewer meets someone with a life of their own, asks a question and gets an
answer worth watching.

In most cases the story belongs to the guest, and the interviewer's job is to help the viewer uncover it.

## Establish the encounter, then derive attention from it

Use three views:

1. **Shared view.** Generate one image with both people and their real spatial relationship on the
   street.
2. **Guest close view**, derived directly from the shared view.
3. **Interviewer close view**, derived directly from the shared view, keeping part of the guest at the
   opposite edge so the exchange stays readable.

```text
shared street view ──► guest close view
        └────────────► interviewer close view (part of the guest at the edge)
```

Eyelines: the guest looks at the interviewer, and the interviewer looks back along the same screen
axis. That attention plus a comfortable microphone position is the idle state of each reusable view
([image direction](../3-materials/images.md) explains idle views). Openings, reactions and exits
grow from this encounter inside their own shots. Once the shared image exists, derived prompts need
very little added; [conversation images](../3-materials/conversation-image-examples.md) shows how little.

Three views are a good closed set for a short piece, not a rule. A longer interview can add a wider
establishing shot or a second location.

The interviewer always owns the microphone and moves it toward whoever speaks. Holding it out to the
guest is not handing it over.

## One speech file per voice turn

Cast two voices with [voice direction](../3-materials/voices.md). Render TTS one segment per speaker
turn, each with its `speaker`. A turn is the natural unit: one person, one voice, one reason for the
camera to be there.

## Cut to whoever matters now

The guest's answers favour the guest close view. A short, neutral question can stay on the shared
view. Only a sceptical or emotionally important follow-up earns the interviewer close view. This is
steering attention, not rotating cameras on a timer.

Make each turn one MiniMax H3 shot (15 seconds or less) in the view the cut logic chose. In the
composition, cut at the segment boundaries from `timing/timeline.json`, so each cut lands exactly on the
change of speaker and moves with it if the voices are retimed
([place events by relationship](../4-compose/timing.md#place-events-by-relationship)).

A silent reaction that deserves its own view is a short shot with no reference audio and a prompt that
keeps the person listening.

Hold the chosen framing behaviour within each view and cut straight to the next. Invented camera moves
between views change the scene's grammar.

One request could carry a whole exchange: H3 takes up to 9 reference images and 3 reference audio
files, enough for three views and two voices. Whether it gives each voice to the right person, in
order, at the times the timeline expects, has not been tested. Try it on one short exchange and check
before relying on it; anything over 15 seconds is several shots regardless.

For a single-turn shot, pass the held view as the first reference image and the speaker's speech file
as reference audio. When the close view alone cannot establish the street, the other person or the
microphone, add the shared view as the second image:

```bash
node <skill>/scripts/bibei.mjs video answer-1 --model <minimax-h3-key> --prompt-file prompts/answer-1.txt --duration 6 --ratio 9:16 --ref-image composition/assets/guest-close.png --ref-image composition/assets/shared.png --ref-audio composition/audio/answer-1.wav --dir composition/generated
```

Use the account's MiniMax H3 key from `bibei.mjs models`, and agree the shot count and cost with the
user first ([video requests](../3-materials/generation-requests.md#video-requests)).

### Prompt principles

There is no proven Bibei wording for this request yet. Write each prompt from these principles:

- Name which camera view each reference image is, in the order passed.
- Treat the supplied views as a closed set of shots: each shot uses exactly one as its full frame, cuts
  jump directly between them, no new views or in-between framings.
- Preserve both identities, outfits, the location, props, microphone, light, camera side and spatial
  relationship.
- Map roles: who is the interviewer, who is the guest; only the current speaker moves their mouth.
- Microphone: the interviewer always holds the same microphone, near their own mouth when asking,
  reaching naturally toward the guest when the guest speaks.
- Choose one camera behaviour: slight handheld drift without changing the framing, fully locked, or one
  modest push toward the speaker and back to the original framing.
- Choose performance tone, reaction strength and gesture size for this work.
- Clean dialogue over street ambience, realistic and stable picture, no captions, labels or overlays,
  but real signage in the scene stays.
- End with this shot's line exactly as in `script.json`, then this passage's action direction.

Starting point, not yet proven (invented):

```text
The first reference image is the guest's close view; the second is the shared street view showing both
people. Use only the first image's framing for the whole shot, with slight handheld drift and no change
of framing. Keep the guest's identity, green apron, the flower stall, the interviewer's red microphone
and the late-afternoon light exactly as in the references. Only the guest speaks; the interviewer's
microphone stays reaching toward her. Clean dialogue with light street ambience. Realistic, stable
picture. No captions or overlays; the stall's real sign may stay.

Line: "Honestly? I used to think tulips were boring. Then I sold four hundred of them in one morning."

Action: she is still holding a pot as she answers, amused, and taps its rim once on "four hundred".
```

When a wording works, save it in the project's `prompts/` folder and note in `PROGRESS.md` what it
achieved and on which model.

## Sound of record

Each shot is a muted footage layer starting at its segment's `start`; the voice plays from its own
`<audio>`. For every visible speaking shot the segment's TTS file is the one sound of record.

H3 fuses reference audio into the video but does not promise lip-sync. Check the first shot muted
against its speech file before requesting the rest ([talking head](talking-head.md) has the procedure).
If that short test shows the clip's own speech is better, extract it as the segment's audio, align it
and rebuild the timeline so cuts and captions follow it; never keep both
([route the voice once](../4-compose/sound.md#route-the-voice-once)). AutoDL's dedicated lip-sync
workflow `minimax_h3_image_audio_to_video` is not on Bibei at the time of writing.

## Give the encounter a before and an after

Opening: the guest is busy with a plausible small task; the interviewer steps in and asks; the guest
looks up or turns to answer. Let the exchange start naturally rather than forcing a fixed silent delay
before every line.

Ending: attention returns to the guest, who finishes the last thought and starts to turn away. These
small actions suggest a life off screen. They work because they have a reason, not because every
interview needs the same moves.

Example (invented): a man is chaining his bicycle outside a library.

1. Shared view: the interviewer asks "What's a rule you break every day?" and the man glances up from
   the lock.
2. Guest close view: he answers that he never returns books on time, then admits he has a library fine
   older than his niece.
3. The answer surprises, so a short interviewer close view: "How old is she?" with a disbelieving
   half-laugh.
4. Guest close view: "Eleven." Action direction for this shot only: he pats the bike seat and starts
   toward the library doors.

The opening and closing actions belong only to their own shots; the middle shots carry the behaviour
of their own exchanges.

In the middle, give a few readable gestures a purpose: a confident jab, a shrug, a glance that notices
an unexpected answer. Avoid exaggerated emotion, continuous motion and precise counting gestures. The
performer should look responsive, not like they are running through an animation list.

## One reveal is one event on several layers

One answer moment can update a slot in an answer bar, trigger a short sound effect and fire a coloured
flash at once. Answered slots stay visible; unanswered ones keep their question mark.

Resolve that moment once from the answer's word time in `timing/timeline.json` and give the same second
to every user of it, so the reveal still lands together when the delivery changes.

Treat caption colour, placeholder and answer icons, flash colour and the character of the sound as a
single visual and rhythmic design. An accent colour can come from an icon's own character; every layer need not share it.
When an icon's exact shape and colour matter, use a real image asset.

The answer bar is an ordinary HTML scene on the composition page. Its own window is the time it is
visible; each answer is a `tl.set` at its moment; slots stay revealed because no later call takes them
away ([events, lifetime and state](../4-compose/scenes.md#events-lifetime-and-state)).

## Captions can follow the guest's head

Speaker-coloured captions come from each segment's `speaker` and caption classes
([style windows and hiding](../4-compose/captions-build.md#style-windows-and-hiding)).

When captions should follow a person: render the composition first with ordinary caption placement;
then run face detection on the speaking footage to get boxes; expand the chosen person's box to a head
region, anchor the caption above it and render again, reusing the footage already paid for.
[Caption tracking](../4-compose/captions-follow.md) is a specialised process with an external measuring
step, not a required first step for interviews. A fixed interviewer caption and a tracking guest
caption can coexist. Shared markup, timing and styling belong to [captions](../4-compose/captions-build.md).

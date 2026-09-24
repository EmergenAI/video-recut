# Adapting a reference into the target

Turn here when the user supplies a reference and wants a version of their own, whether that means a new
person, product, world, performance, story or audience. A single creative aim may involve several of
these changes at once.

## Start from why the original works

Look at the material and the request together. Why is the original appealing? How can that appeal
belong to the new person or product? Keep what is particular to the original: its humour, its visual
relationships, its rhythm.

Three documents divide the work. The reference record describes the original; the Brief records the
user's intent; the Treatment explains how the new piece works. A discovery can revise any of them.

## Keep the role, rebuild the form

**Rebuild semantic timing, not seconds.** If an element appears during a certain phrase or settles on a
conclusion in the reference, bind it to the target's own script in the same way. A new speaker or a
changed argument moves the seconds; the relation survives. Keep an explicit clock interval only when
that interval is itself part of the design.

**Find every role before replacing anything.** A host may appear as a talking head, a voice, the subject
of B-roll, a face on a phone screen and an identity inside a motion system. A product, likewise, may
show up as a prop, on a screen, in a demonstration, as a claim and in the final call to action. Convert the role at every real
appearance, not just the most visible pixels.

**Do not copy a form that no longer fits.** Keep the purpose of an action, framing or callback, and
design a form that suits the new subject, product, platform and audience:

- The reference host raises one eyebrow and slowly slides a bad product off the table. The user's
  version stars their cat. The cat does not raise an eyebrow; it gives the product one long blink, then
  deliberately walks across it to sit on something else. Same verdict, the cat's own vocabulary.
- The reference proves an app's benefit with a screen recording. The target sells a vacuum flask, which
  has no screen. The proof becomes physical: the flask filled at a 6 a.m. trailhead, opened at the
  summit, steam visible in the cold air, with a time stamp as typography. Same "it still works hours
  later", different evidence.

Angles worth considering (prompts for thought, not fields to fill in):

- **Subject and identity:** who carries each narrative role, and every place that identity appears.
- **Product and brand:** product facts, how it is used, props, UI, logo, colours, proof, offer, CTA.
- **Script, language and CTA:** the meaning, speech rhythm, on-screen text, demonstrations, and the
  timing relations that move with new words.
- **Platform, length and aspect:** which narrative functions stay, compress, expand or need new framing.
- **Visual or tonal style:** carried through generated shots, captions, typography, motion, effects and
  audio, without erasing useful structure.
- **Adding or removing a system:** reassign the work the old system did, so no hole opens in the story.
- **Several references:** state which function comes from which reference, and resolve conflicts in the
  Treatment rather than blending surface details.

## Rebuild an event from source material

Some adaptations are recognizable by an event unfolding rather than by a subject's pixels: a stylized
performance straight to camera, a dance passage, a fight, a moving camera, an accident in a locked-off
shot. These depend on particular timing and physical relations, so look for time evidence there: the
performance, the reaction, the action, the contact, the camera, the outcome.

The target can change the person, the objects, the setting, the lines, the voice, the visual world, or
several at once. Swapping the person is the most common; a narrow swap can keep every other relation.
If a different subject or story alters the meaning of an action, adjust that action to fit what the target intends.

Source material is evidence, not a ready-made target timeline; the Brief and Treatment hold the changes
and the new answers.

In comedic talking references, an unusual camera position often works together with a character's
tone, expressions and gestures. Put the lines in the script, decide whose voice the target uses, and
direct how the visible performance lands the joke. A portrait the user supplies settles appearance only,
not voice or manner of performance. [Voice direction](../3-materials/voices.md) handles
casting; [video direction](../3-materials/video.md) handles how a studied source clip
informs a new shot.

## When the user says "use my face"

Example: the reference is a creator ranking five gas-station snacks from "never again" to "would drive
back for this", each reveal cutting to a close-up of their disgusted or delighted face. The user sends
three selfies and wants to be the ranker.

- The jokes aim at the snacks, not at the original creator, so the spoken verdicts and reveals may
  transfer almost directly.
- Put the user in the camera picture. Keep the reference's attitude, its useful framing, and the space
  it leaves for the rank graphics.
- Give the user the full [image direction](../3-materials/images.md) treatment you would
  give any lead: work on their appeal and presence. That one accepted image can carry the ordinary
  talking shots and feed the user's other appearances.
- Rethink any joke about the original creator's looks or personal history. A new lead may need a
  different delivery or a better version of the bit. If the subject is a pet or another non-human, let
  it express the same attitude its own way. Make the new character inhabit the piece.
- The selfies supply visual identity only. The voice comes from audio the user provides or a voice cast
  for this performance (voice direction). The selfies' background and pose can give way to the shots the
  video needs; [generated dependencies](../3-materials/reference-chains.md) decides where that
  image enters production.

## When the user says "use my product"

Example: the reference is a two-person skit where one friend casually recommends a standing desk, the
other scoffs, and a satisfying demo (the desk rising with a coffee cup that does not spill) wins them
over. The user wants to promote Kyrra, an app that splits shared bills from a photo of the receipt.

- The conversational structure can stay: the offhand recommendation, the sceptic, the demo that
  satisfies. So can the recognizable shape: the split-screen opening, the complementary angles, the
  captions coloured by speaker.
- The new conversation revolves around one objection the product really answers ("we'll still argue
  about who had the extra drink"). The demo, the covering pictures and the graphic reveal all support
  one "oh, got it" moment: the receipt photo resolves into four names with their own totals. Lines,
  actions, pictures and CTA all grow from what the product really offers.
- Product images and UI the user supplies decide the look; the user's facts and product material decide
  the claims. Fill important gaps from that material or by confirming with the user, and keep the
  creative work moving meanwhile.
- If the person and the product are both replaced, think about how they relate as a pair: what makes this
  person the one to recommend it, how the other party reacts, and what makes the meeting enjoyable. The Treatment holds the creative answer;
  `script.json` and the composition page express the words, references and timing relations.

## Generation is ordinary production

Treat the image model, the video model and speech generation as a well-travelled crew: they know what
kitchens, trailheads and gas stations look like and can make them to order. "Realistic" names a look
(phone-camera feel, natural light, documentary movement, room tone); it says nothing about the origin of
the footage. The normal job is to create the target media.

External references become necessary when general knowledge cannot fix a precise identity, such as
the user in person, a product that is private or little known, a proprietary interface, or a specific
logo or data display. Once a generated image, shot or voice is accepted, later work can treat it as
the authority.

What each kind of control means:

- **Reference-conditioned generation** when identity, art direction, composition or product continuity
  matter: the inputs guide the shot without having to become its first or last frame.
- **Keyframe constraints** when the end picture is itself part of a designed continuous change.
- **Text alone** when you want variety and there is no exact anchor.

Which of these a model accepts is a fact about that model. MiniMax H3 through Bibei accepts reference
images and reference audio; it does not accept a first or last frame, or a reference video. Check
[Bibei models and limits](../3-materials/generation-requests.md#bibei-models-and-limits) and `bibei.mjs models`.

## Keep media dependencies shallow and useful

- Generate what will actually be used: the main A-roll camera image, a reverse angle, B-roll images,
  product close-ups, the picture for a layer in the composition. The first accepted host image is often
  the main A-roll camera image.
- Another A-roll angle can be generated from it. Describe the new camera relation, eyeline, recurring
  objects and light, and what naturally changes when the camera turns around. A shared world lives in
  the relations between useful shots; it does not need an abstract base plate.
- Generate a standalone identity sheet or location image only when the piece itself needs it. Avoid
  chains of intermediate images that exist only to feed the next generation.
- When one shot is split because of the model's duration limit, every part reuses the same accepted
  visual authority, unless the cut is designed around a literal boundary frame.
- Accepted material enters the composition from `composition/generated/`, and the generation manifest
  records the request behind each file. Use draft renders and review sheets to develop captions, motion,
  B-roll coverage, effects and sound around that material.
- When a generated result fails its role, first change the responsible prompt, reference relation or
  shot design, then decide whether another authorized request is warranted. Revise the Treatment only
  when the creative answer itself changed.

# Image direction

Read this before you write or revise an image prompt.

The image model can paint whatever the work needs: a person framed by a camera, a place that looks
lived in, a product, an icon, an impossible event seen through an ordinary lens. Treat every request as
directing one whole picture. You decide the subject, how strong its look should be, and the relationships
the viewer must see. The model fills in the rest. Reference images carry chosen visual facts into that
same act of painting.

The most common case in phone-first video is a person in a place, filmed on a phone. For that case the
capture paragraph supplies the photographic language, and you direct the person, how the camera meets
them, and where they are. [Worked examples](image-examples.md) show full prompts and why each
one reads the way it does.

## Two judgments that shape every prompt

**The model has habits.** Give it a generic subject ("a woman talking in a café") and the face,
styling, pose and room all fall back to what the model usually draws. A casting noun, a named kind and
strength of beauty, a haircut, the social character of a place: each of these moves the whole picture.
You cannot steer everything, so pick the few dimensions that matter for this work and direct them
firmly.

**A few decisive strokes carry the picture.** A presenter needs a face worth watching and a clear
relationship with the lens. A product needs its signature shape and its use. An icon needs one readable
visual idea. A place needs a handful of convincing objects and a sense of space. Any of these beats a
long inventory.

"Few" counts decisions, not words. Spend words wherever they change the picture.

When the work needs a presenter people want to watch, direct attractiveness boldly and for the
character's real age. Photographic realism and striking looks are compatible. Equally, fatigue, comedy
or an unflattering expression can be the character when the story calls for it.

## Four paragraphs, four jobs

For a person in a scene, write four paragraphs in this order:

| Paragraph | Its job |
| --- | --- |
| Capture | The photographic language: what kind of recorded image this is. See [Use a concrete capture direction](#use-a-concrete-capture-direction). |
| Person | Who this is, why they hold attention, and the few appearance choices that make them specific. |
| Shot | The person's action, who they are talking to, and how the camera frames their face, body and surroundings. |
| Setting | Where they are, the palette, and the visible details that make the place feel inhabited. |

This is a division of directing work, not a form to fill. When a reference already fixes the person or
the place, drop that paragraph. Other kinds of image (a product render, a flat icon, an illustration) may
need a completely different structure.

The paragraphs touch each other: clothing is part of the palette, and a table in the setting is what
makes an off-center framing look natural. Keep each paragraph focused, but do not treat the boundaries
as walls.

## Questions that find the decisions

Use these to find the high-value choices. They are not seven sentences you must write; one sentence can
answer several, and the brief or a reference may already answer some.

- What kind of captured image is this?
- Who is this, and how do they attract the viewer, and how strongly?
- Which appearance choices make them recognizable instead of generic?
- What ongoing activity or state can the next video continue?
- How does the camera frame this encounter: face, body, gaze, free space?
- What visible relationship makes the person belong to the place?
- Which colors give the whole picture its character?

## Cast with conviction

There is no proven Bibei wording for casting yet. Work from these principles, and when a phrasing gives
you the face you wanted, save it in the project's `prompts/` folder and note in `PROGRESS.md` which model
it worked on.

- For an adult presenter, state an explicit age and role, then use a casting noun to steer the face's
  character ("a 34-year-old ceramicist cast like the lead of a prestige drama"). When a reference image
  fixes the look, let the reference carry identity instead.
- Give beauty both a strength and a type. A weighty comparison ("the kind of face that fronts a luxury
  campaign", "a character actor's lived-in handsomeness") directs better than a bare adjective. Find an
  equally strong comparison for each age, culture and role.
- Cultural background, visual charisma and a social or aesthetic type can combine, but write only the
  ones that define this character. A job title alone rarely produces a distinct face.
- Realize the direction through a few visible anchors: the hair around the face, the eyes or eye makeup,
  one memorable garment or accessory.
- For a half-body portrait, ask for broad shoulders and a good head-to-shoulder proportion. Models tend to
  draw a large head on narrow shoulders; the point is proportion, not bare shoulders.
- A portrait reference can supply identity, appearance cues or a camera position. Say what this picture
  inherits from it and what changes (angle, styling, place). See [generated
  dependencies](reference-chains.md).

Starting point, not yet proven:

```text
She is a 34-year-old Mexican ceramicist, cast like the lead of a prestige drama: strikingly beautiful in
a grounded, sunlit way. Heavy dark hair pinned up loosely with a pencil, a few strands falling by her
cheek. Strong brows, direct warm eyes. Broad shoulders and a well-balanced head-to-shoulder proportion.
A faded indigo work shirt with the sleeves rolled, a dusting of dry clay on one forearm.
```

## Choose an idle state for the encounter

A character image that will be reused for video should hand the video a state it can continue.
Talking to the viewer while gesturing with empty hands is an activity in progress, not a frozen pose.
Moods such as inviting, curious or teasing can last across many beats.

A laugh, a gasp or any other momentary expression locks the picture to one instant. Use one only when
that instant is what the shot is about; let the planned performance decide.

- **Presenter addressing the viewer:** face square to the lens, no head tilt or turn. That gives the
  video a stable starting point; body and hands can do whatever suits the scene.
- **Podcast partner or interviewee:** gaze relates to the other person. The reference image should
  establish that relationship, and the face must stay readable at the camera angle the work needs.

## Frame for the use

Direct framing, distance, body arrangement, and the angle and position of the face as one encounter.

- A close half-body shot keeps face, shoulders and gestures clear. Go wider when the shot must hold an
  action or a second person.
- Put the face where the later layout needs it, but describe only the physical scene the model should
  paint. An off-center subject can be motivated by something in the story (a table, another person, a
  doorframe) or simply be where the camera stands.
- When motion graphics will share the frame, direct only the filmed scene the viewer sees. An icon drawn
  on a sign or a phone screen belongs to that image and moves with it. An icon that must appear or move
  on its own is a separate image, placed and animated as a composition layer or drawn directly. See
  [graphic compositions](../4-compose/graphics-layout.md).
- Describe how the person really interacts with people and objects in the scene. Choose the source view
  that gives the performance the body, gestures and setting it needs. Cropping and fitting belong to
  [space, canvas, frames and fitting](../4-compose/page.md#space-canvas-frames-and-fitting);
  how the picture relates to what surrounds it belongs to [graphic compositions](../4-compose/graphics-layout.md).

## Build the place from a few details

The setting carries a social world; it is not a colored panel behind a face.

- Choose a place people will recognize, plus a handful of details that account for this person being in it. Pick objects for
  the story and the visual character; let the model supply the rest.
- A window or an opening behind the person adds depth.
- Give the place a deliberate palette, for example two dominant colors, carried by real architecture,
  clothing, plants and objects rather than a uniformly painted wall.
- Large bright or dark areas become interesting through real surfaces: wood grain, tiles, a shopfront,
  foliage.
- Write colors as colors on materials ("cobalt-glazed tiles", "a terracotta wall"). Natural light is
  already in the capture paragraph. Write time of day, weather or a specific light event only when the
  story or a reference needs it to be seen.

## Use a concrete capture direction

There is no proven Bibei wording for the capture paragraph yet. If the
[proven wording](generation-requests.md#prompt-wording-that-has-been-proven) section lists capture
wording tested on the model you are using, use it. Otherwise write your own from these principles:

- Put the capture paragraph first, and keep it whole rather than scattering its sentences.
- Ask for a single frame of real phone video with its texture. The finish should not look oily or
  overprocessed. The background stays sharp, with no depth-of-field blur. Skin has natural fine texture,
  the light is natural, and the image is coherent and free of artifacts.
- After it, write the content as ordinary prose. A fantastical character can still stand in a filmed
  real world.
- Other targets (an illustration, a product render) need their own texture language instead.

Starting point, not yet proven:

```text
A single frame pulled from ordinary phone video, with the look of a real handheld phone recording rather
than a staged photo shoot. The finish is clean and unretouched, never glossy or overprocessed. The whole
scene stays in focus with no background blur. Skin keeps its real, fine texture, the light is the natural
light of the place, and the frame is coherent with no distorted details.
```

When a version works well, save its exact text in `prompts/` and record in `PROGRESS.md` which model and
which shots it was used for.

## Prompt files and requests

Keep each prompt as one text file, `prompts/<name>.txt`: capture, person, shot and setting paragraphs
separated by blank lines. They are paragraphs, not labelled fields. When a reference supplies the person
or the place, leave that paragraph out and say in the affected paragraph what each reference keeps. The
shot paragraph is always needed.

```bash
node <skill>/scripts/bibei.mjs image portrait --model <key> --prompt-file prompts/portrait.txt \
  --ratio 9:16 --size 720x1280 --dir composition/generated
```

- GPT Image 2 is the usual model for this kind of picture. Find this account's key for it with
  `node <skill>/scripts/bibei.mjs models`.
- Aspect ratio and size are request parameters. Never write them into the prompt.
- GPT Image 2 takes preset sizes. Its 1K presets include 720x1280 (9:16), 1024x1024 (1:1) and 1280x720
  (16:9). 1K is enough for a picture-in-picture. For a full-screen image, or one that will be a video
  reference, use a larger preset when the account offers one. Check `bibei.mjs models` or [image
  requests](generation-requests.md#image-requests); do not guess sizes.

## Let references carry the facts they own

- A portrait fixes identity. A camera-position image fixes a shared place. A product image fixes the
  product.
- Say what each reference contributes and what this picture should show. Attach the actual files with
  `--ref`, in the same order the prompt names them: "reference image 2" is the second `--ref`. Each
  reference file must be 10 MB or smaller.
- When a reference already solves the hard part, spend the prompt on the new encounter or viewpoint. The
  model still repaints the whole view.
- When the same photographic world continues into another view, carry the same phone-capture direction
  into it.
- Branching into several views belongs to [generated dependencies](reference-chains.md). Replacing
  a face or product across a whole film belongs to [transformations](../2-plan/adapting.md).

A finished prompt should read like one picture: a clear subject, visible relationships, a visual
character. The [examples](image-examples.md) are evidence for particular pictures, not
sentences to copy; the [base shot](image-examples.md#base-shot-ceramicist-in-a-courtyard-workshop)
walks through the reasoning behind one prompt.

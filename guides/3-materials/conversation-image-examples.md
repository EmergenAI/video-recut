# Conversation image examples

Read this when you are directing a set of images for a podcast, a call or a street interview, and need
to see how the images derive from one another.

Each example states its inputs: text only, or "input 1 = an earlier image" and "input 2 = a product
icon or logo". What matters is the relationship between images: which parent each one takes, what it
keeps, what it changes. The hosts, products and props here are invented for this page. They are not a
template for conversations. Some images in a real project will be generated alone and imported as
files.

Aspect ratio goes on the request as `--ratio`, never into the prompt.

## Shared capture language

Every image in a set opens with the same capture paragraph, written once at the top of the prompt file.
Then come person, shot and setting, each as its own paragraph. Put each reference's responsibility in
the paragraph it affects. A derived view whose references already fix the person and the place can be
short, and may leave out the person and setting paragraphs.

There is no proven Bibei wording for the capture paragraph yet; see [Use a concrete capture
direction](images.md#use-a-concrete-capture-direction) for the principles. Starting point, not
yet proven:

```text
A single frame pulled from ordinary phone video, with the look of a real handheld phone recording rather
than a staged photo shoot. The finish is clean and unretouched, never glossy or overprocessed. The whole
scene stays in focus with no background blur. Skin keeps its real, fine texture, the light is the natural
light of the place, and the frame is coherent with no distorted details.
```

The prompts below show only what follows it. Record wording that works in `prompts/` and in
`PROGRESS.md`.

Requests use `bibei.mjs image` with `--ratio 9:16` (or the ratio the footage needs). References go in
with `--ref` in the order the prompt names them: "reference image 2" is the second `--ref`.

```bash
node <skill>/scripts/bibei.mjs image ines-holds-app --model <key> --prompt-file prompts/ines-holds-app.txt \
  --ratio 9:16 --size <9:16 preset> --ref composition/generated/ines.png \
  --ref composition/assets/tidepool-icon.png --dir composition/generated
```

Do not copy time of day, brightness or exposure notes from one project's shots into another. A new
phone-video image starts from [image direction](images.md) and the capture paragraph, and
mentions light only when the scene needs it to be seen.

## Podcast at a corner table

An invented show, *Petisco*, recorded at a corner table in a Lisbon tasca. Two hosts, Inês and Kwame, and
a budgeting app called Tidepool.

### Inês, the main view

Inputs: text only.

```text
She is Inês, a 31-year-old Portuguese host with the easy, magnetic beauty of a romantic-comedy lead.
Dark wavy hair to the collarbone with a center part, bold winged eyeliner, red lipstick. A cream
cable-knit sweater and a thin gold chain. Broad shoulders, good head-to-shoulder proportion.

She sits at a small wooden table, turned slightly to her left toward her co-host just outside the frame,
mid-sentence with one open hand lifted. A podcast microphone on a short arm enters from the lower right
and stops near her chin; its foam cover is printed with the word PETISCO. Her face sits in the upper
left third. On the table in front of the right side of the frame: two small glasses of wine, a plate of
olives, a folded paper menu.

A narrow traditional tasca in Lisbon. Blue-and-white azulejo tiles on the lower half of the wall behind
her, whitewashed plaster above, a wooden shelf of wine bottles, a hanging string of dried peppers. A
waiter's apron on a hook by the kitchen door.
```

One text prompt establishes person, place and social situation together. The table objects balance her
off-center position and imply that the partner sits across, to her left. The branding sits on the
microphone, where the camera would really see it.

### Kwame, the reverse view

Inputs: input 1 = Inês's main view.

```text
Reference image 1 shows the same tasca and the same table from the other side. Keep the room's tiles,
plaster, wood and colors, and the table objects.

He is Kwame, a 35-year-old Ghanaian-Portuguese host, handsome with a warm, quick-witted charm. Short
twists, a trimmed beard, a rust corduroy overshirt over a white T-shirt. Broad shoulders, good
head-to-shoulder proportion.

He sits across the table from where the first camera stood, turned slightly to his right toward Inês just
outside the frame, listening with a half-smile. His own microphone enters from the lower left. His face
sits in the upper right third.

Behind him the camera now sees the other end of the room: the tasca's front window onto the street, a
coat stand, and the end of the bar counter.
```

"Symmetry" here means the conversation mirrors: he looks the opposite way, his microphone comes from the
opposite side, his face sits on the other side of the frame. The wall is not mirrored. The camera looks
into the other half of the room, so the background is new while the world is the same.

### Inês holding the app

Inputs: input 1 = Inês's main view, input 2 = the Tidepool app icon.

```text
Keep reference image 1 exactly: the same woman, framing, light, table and microphone position.

The only change: in her hand on the right side of the frame she holds up a phone toward the camera,
screen facing out, showing the app whose icon is reference image 2 open on its home screen.
```

Almost everything is inherited, so the prompt only names the change. "Right side of the frame" names the
hand from the viewer's side; "her right hand" would be ambiguous across camera positions.

### Kwame holding the app

Inputs: input 1 = Kwame's reverse view, input 2 = the Tidepool app icon.

```text
Keep reference image 1 exactly: the same man, framing, light, table and microphone position.

The only change: in his hand on the left side of the frame he holds a phone toward the camera, screen
facing out, showing the app whose icon is reference image 2.
```

This derives from Kwame's own view, not from Inês holding the app. Both hosts showing the same phone does
not mean they share camera geometry.

## Everyday branches for one host

Short lifestyle cutaways of Inês, each an independent branch. Inputs for every one: input 1 = Inês's main
view (identity), input 2 = the Tidepool logo. Each keeps her recognizable face, beauty and build, and
changes situation, outfit, camera and place. The logo appears on an object in the scene.

- **Raised-arm selfie at a market.** "The woman from reference image 1, same face and hair, in a denim
  jacket, taking a selfie with her arm raised at a fruit stall in the Mercado da Ribeira, laughing at the
  lens. A reusable shopping bag on her shoulder carries the logo from reference image 2."
- **Mirror selfie after a run.** "The woman from reference image 1 in running clothes, hair tied back,
  photographing herself in the mirror of a small gym changing room with her phone at chest height. The
  phone case carries the logo from reference image 2."
- **Low-angle desk view.** "Seen from table height across her desk, the woman from reference image 1 in
  reading glasses and a gray hoodie, writing in a notebook. A mug beside the laptop carries the logo from
  reference image 2."

None of these depends on another; each goes back to the main view for identity.

## Optional split-screen opener

Inputs: input 1 = Inês's main view, input 2 = Kwame's reverse view.

```text
A vertical split screen. Top half: the woman and framing from reference image 1. Bottom half: the man and
framing from reference image 2. Both look toward each other's half as if mid-conversation.
```

The references already fix both people and the room, so the direction is short. Small movements for the
silent host belong to [video direction](video.md), not to a longer still prompt. A split
can also be two layers in the composition instead of one generated image.

## Street interview beside a classic car

### Shared scene

Inputs: text only.

```text
Two people stand on a Milan side street, both visible from the knees up, no one else in the frame.

On the left, the interviewer: a 26-year-old Italian man, boyishly handsome, curly brown hair, a navy
bomber jacket, holding a handheld microphone with a yellow foam cover out toward his guest. He looks at
her. On the right, the guest: a 55-year-old woman of striking, silver-haired elegance, like a fashion
house's creative director, in a camel coat, dark sunglasses pushed up into her hair, a leather top-handle
bag on her arm. She leans lightly on a polished green vintage roadster parked at the curb and answers,
looking at him.

The camera is at chest height, level, on the pavement. Ochre and pale-pink building fronts behind them,
tall green shutters, a tram line in the cobbles.
```

Text alone establishes both people, the microphone reaching between them, the car, and the line of gaze.
The luxury styling belongs to this guest, not to street interviews in general.

### Guest close-up

Inputs: input 1 = the shared scene.

```text
The woman from reference image 1, same place and outfit. A closer view from beside the interviewer's
shoulder: her from the chest up, answering him, the yellow microphone entering from the left edge. The
green car's hood is visible behind her.
```

Only attention and crop change; person and encounter are inherited.

### Interviewer close-up

Inputs: input 1 = the shared scene.

```text
The man from reference image 1, same place and outfit. A closer view from beside the guest: him from the
chest up, holding out the microphone and listening. The edge of her camel coat shoulder stays in the
right edge of the frame.
```

This also comes from the shared scene, not from the guest close-up. A sliver of the other person keeps
the encounter alive in a single-person frame.

## What transfers

- Transfer decisions, not decoration lists. Make one useful person-in-a-world starting image, derive the
  views you need, and write what each parent keeps. When a real person or product must be exact, connect
  the authoritative reference.
- Podcast branches change camera, prop state or daily situation, each for its own reason. Interview
  branches change attention while keeping the shared encounter.
- Neither graph needs a chain of generated-video last frames, and neither needs every speaking shot to
  repaint all the material.

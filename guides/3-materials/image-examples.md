# Image direction examples

Read this when you want to see the four-paragraph prompt from [image direction](images.md)
written out in full, and how it changes from one picture to the next.

Every example below is one prompt file with paragraphs in fixed order: capture, person, shot, setting.
All are full-screen vertical portraits, so each request uses `--ratio 9:16` and the largest 9:16 `--size`
preset that the account's GPT Image 2 key offers (check `node <skill>/scripts/bibei.mjs models`; 720x1280
is the 1K preset).

```bash
node <skill>/scripts/bibei.mjs image ceramicist --model <gpt-image-2-key> \
  --prompt-file prompts/ceramicist.txt --ratio 9:16 --size <largest 9:16 preset> \
  --dir composition/generated
```

These prompts are written for this page and have not been run on Bibei. Treat them as illustrations of
the reasoning, not as proven wording. When one of your own prompts gives a result the user picks, keep
it in `prompts/` and note in `PROGRESS.md` what made it work.

## The shared capture paragraph

Every example opens with the same capture paragraph, so the photographic world stays constant while
person, shot and setting change. There is no proven Bibei wording for it yet; see [Use a concrete capture
direction](images.md#use-a-concrete-capture-direction). Starting point, not yet proven:

```text
A single frame pulled from ordinary phone video, with the look of a real handheld phone recording rather
than a staged photo shoot. The finish is clean and unretouched, never glossy or overprocessed. The whole
scene stays in focus with no background blur. Skin keeps its real, fine texture, the light is the natural
light of the place, and the frame is coherent with no distorted details.
```

Below, each prompt shows only the three paragraphs that follow it.

An aesthetic-type noun ("prestige-drama lead", "Savile Row dandy", "thrift-store stylist") organizes the
look. The concrete details chosen after it (hair, makeup, clothing, accessories) make it specific.

## Base shot: ceramicist in a courtyard workshop

```text
She is a 34-year-old Mexican ceramicist, cast like the lead of a prestige drama: strikingly beautiful in
a grounded, sunlit way, the kind of face a camera keeps returning to. Heavy dark hair pinned up loosely
with a pencil, a few strands falling by her cheek. Strong brows, direct warm eyes, a small gold hoop in
one ear. Broad shoulders and a well-balanced head-to-shoulder proportion. A faded indigo work shirt with
the sleeves rolled, a dusting of dry clay on one forearm.

She sits at a heavy wooden worktable and talks straight to the camera as if explaining something she
loves, face square to the lens, both hands open and mid-gesture above the table. The camera is at her eye
level, close enough to hold her from the waist up. She sits in the left part of the frame with her face
in the upper left; the table runs toward the right edge, where a row of freshly thrown bowls dries on a
board.

A shaded courtyard workshop in Oaxaca. A terracotta wall behind her, a doorway of cobalt-painted wood
opening onto a second courtyard with a lemon tree, shelves of glazed pots in blue and rust. Clay dust on
the tiled floor, a bucket of slip by the table leg, a folded apron hanging on a nail.
```

Why it reads this way:

- **Person.** The casting noun and "the kind of face a camera keeps returning to" set type and strength
  together. The pencil in the hair and the clay on the forearm are the two anchors that make her a
  ceramicist rather than a model holding a pot. Broad shoulders counter the large-head habit.
- **Shot.** Face square to the lens plus open, empty hands mid-gesture is the reusable idle state from
  [Choose an idle state for the encounter](images.md#choose-an-idle-state-for-the-encounter):
  video can pick up from it and keep talking. The drying bowls give the off-center framing a physical
  reason; without them the empty right side would look like a layout hole.
- **Setting.** Two color roles: terracotta (wall, rust glazes) and cobalt (door, blue glazes). The
  indigo shirt sits between them, and the lemon tree adds a small green accent. The doorway and the
  second courtyard create a distant layer behind the table and the wall.
- **What the model adds.** Tile patterns, the exact number of bowls, leaf shapes, folds in the shirt.
  Those are the model's contribution to this picture, not requirements for the next one.
- **What is only this framing.** The upper-left face and the bowls on the right are this composition's
  choices. The reusable part is the frontal face and the talking gesture.

## Variation 1: the same ceramicist, standing and centered

```text
The same woman as the reference image: keep her face, hair, shirt and proportions.

She stands behind the worktable facing the camera, centered in the frame, face square to the lens,
talking to the viewer. She holds a half-finished bowl in both hands at chest height, turning it slightly
as she speaks. The camera is at chest height and far enough back to include the table edge and her
hips.

The same courtyard workshop, now seen straight on: the cobalt doorway directly behind her, framing her
head and shoulders, the lemon tree visible through it.
```

What changed and why: a demonstration opening needs her centered with something in her hands, so the
pose, position and relationship to the table change while casting and proportions stay. The person and
setting paragraphs shrink to what differs, because the base shot is attached with `--ref` and carries
identity and place. The doorway is moved behind her head on purpose: a centered frame needs a centered
structure, or it drifts.

## Variation 2: the same ceramicist, turned toward a guest

```text
The same woman as the reference image: keep her face, hair, shirt and proportions.

She sits at the worktable, turned about three-quarters toward someone just outside the right edge of the
frame, listening and about to answer, eyebrows lifted with interest. Her face stays fully readable. The
guest's forearm and a mug rest on the right edge of the table. The camera is at her eye level, waist-up.

The same courtyard workshop; the camera now sees the shelves of glazed pots behind her instead of the
doorway.
```

What changed and why: for a podcast-style exchange the attention moves to the partner, which is the other
idle state in [Choose an idle state for the encounter](images.md#choose-an-idle-state-for-the-encounter).
The guest's forearm and mug make the off-screen partner physical. Turning the camera toward the shelves
shows a different part of the same place, so a second view of the guest can show the doorway.

## Variation 3: bespoke tailor in a south London shop

```text
He is a 46-year-old British-Nigerian tailor, cast as a Savile Row dandy with a leading man's presence:
handsome, self-assured, silver just starting at the temples. Close-cropped hair and a neat beard, round
tortoiseshell glasses, a tape measure hung around his neck. A mustard waistcoat over a crisp white shirt,
sleeves held with elastic armbands. Broad shoulders, good head-to-shoulder proportion.

He stands at his cutting table talking to the camera, face square to the lens, one hand resting on a
bolt of cloth and the other open in a gesture. His face sits in the upper right of the frame; the cutting
table with chalk and shears fills the lower left. The camera is at chest height, waist-up.

A narrow tailoring shop in Peckham. Bottle-green painted shelving stacked with folded cloth, a dress form
wearing a half-made jacket, a shopfront window onto the street behind him.
```

What changed and why: a new person, so the person paragraph carries the most weight. The glasses, tape
measure and armbands carry the dandy type. He stands and sits right because the cutting table, which the
story needs anyway, occupies the left. Mustard and bottle green are the two colors; the white shirt keeps
his face bright against the dark shelving.

## Variation 4: thrift stylist on a Seoul side street

```text
She is a 27-year-old Korean stylist who runs a secondhand clothing shop, cast like the lead of a youth
indie film: effortlessly striking, with a cool, amused confidence. A glossy black bob with blunt bangs,
soft brown eyeliner, small silver earrings in a row. An oversized lilac cardigan over an olive slip
dress, a canvas tote on one shoulder. Broad shoulders, good head-to-shoulder proportion.

She stands on the pavement facing the camera, centered, face square to the lens, talking to the viewer
with a teasing half-smile, one hand lifted as if about to count on her fingers. The camera is at eye
level, framing her from mid-thigh up.

A quiet side street in Mangwon-dong, Seoul. Behind her, her shop's open doorway with a rail of coats
spilling onto the pavement, potted plants on the step, a neighbor's olive-green shutter, a bicycle
leaning against the wall.
```

What changed and why: outdoors and on the street, so the setting has to explain why she is standing
there; the coat rail spilling from her own shop does it. She is centered because nothing in the story
pushes her aside. The bangs, eyeliner and stacked earrings carry the style. Lilac and olive run through
both clothing and street, so she belongs to the place instead of standing in front of it.

## Variation 5: harbor cook on the Norwegian coast

```text
He is a 63-year-old Norwegian fisherman turned cook, cast with a weathered silver-fox handsomeness, the
kind of face a documentary crew would build a series around. Thick white hair pushed back, a trimmed
white beard, pale blue eyes creased from squinting at the sea. A rust-red wool sweater with a rolled
collar. Broad shoulders, good head-to-shoulder proportion.

He sits on an upturned fish crate facing the camera, face square to the lens, telling the viewer a story
with both hands open. His face is in the upper left; to the right, a smoking rack of fish on a low grill.
The camera is at his eye level, waist-up.

A small outdoor smokehouse on a harbor in Lofoten. Slate-gray water and a slate roof behind him, a red
wooden boathouse at the far side of the harbor, coiled rope and a stack of crates on the quay.
```

What changed and why: age and type change the casting language; "silver fox" plus the documentary-crew
comparison give strength without making him young. The grill motivates the right-hand space the same way
the bowls did in the base shot. Rust red and slate gray come from sweater, boathouse, water and roof, so
the palette is carried by real things.

## Variation 6: astrophysics lecturer in a reading room

```text
She is a 45-year-old Indian astrophysicist who lectures to the public, cast with an elegant, commanding
beauty, like the lead of a prestige legal drama. Long black hair with a single streak of silver, worn in a
low loose knot. Kohl-lined eyes, a small dark bindi. A deep teal silk blouse and a slim brass cuff on one
wrist. Broad shoulders, good head-to-shoulder proportion.

She sits at a long reading table facing the camera, face square to the lens, explaining with one hand
raised, a small brass orrery on the table to her left. Her face is in the upper right of the frame. The
camera is at eye level, waist-up.

An old university reading room: tall windows behind her, dark wood shelves, green-shaded brass lamps
along the table, star charts pinned to a board.
```

What changed and why: indoor and quiet where the tailor was busy. The silver streak, kohl and brass cuff
carry the elegant-academic type. The orrery is both a story object and the reason her face sits on the
right. Teal and brass are the two colors, repeated in blouse, lamps, cuff and orrery.

## What varies across the set

| Example | Person | Position | Face | Place | Colors |
| --- | --- | --- | --- | --- | --- |
| Base shot | Mexican woman, 34 | Sitting | Upper left | Courtyard workshop | Terracotta, cobalt |
| Variation 1 | Same | Standing | Center | Same, doorway behind | Same |
| Variation 2 | Same | Sitting, turned to guest | Upper left | Same, shelves behind | Same |
| Variation 3 | British-Nigerian man, 46 | Standing | Upper right | Tailoring shop | Mustard, bottle green |
| Variation 4 | Korean woman, 27 | Standing | Center | Street, outdoors | Lilac, olive |
| Variation 5 | Norwegian man, 63 | Sitting | Upper left | Harbor, outdoors | Rust red, slate gray |
| Variation 6 | Indian woman, 45 | Sitting | Upper right | Reading room | Teal, brass |

The capture paragraph never changes. Each example spends its words on casting, one object that motivates
the framing, and a palette carried by real materials.

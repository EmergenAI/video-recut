# B-roll and footage-led pictures

Read this when images or clips will carry part of a passage's picture.

Footage can give the viewer a visual answer: evidence for a claim, a place to sink into, an action to
understand, a contrast, a joke. B-roll is the usual editing use of footage when a performance carries
the words and the time. The same material can also lead the picture in a narrated explanation or in a
passage with no speech at all. Decide its role by what the viewer needs to see, not by whether it is a
still, a video or a person.

## Give every picture a reason to appear

- Creator videos often show the speaker's life while the talk continues: working, studying, travelling,
  using the product, reacting somewhere else. It makes the person and their world concrete.
- The person in a lifestyle shot or a silent clip can be the voice we are hearing. The words still come
  from the placed speech file. Another passage can use a visible speaking shot that carries its own line.
  The difference between the two is worked out in [Voice and performance](../3-materials/speakers-and-narration.md).
- An image carries a product fact; a moving demonstration proves an action; a screenshot makes an
  interface state readable. One well-chosen picture can beat a new shot for every noun.

Making new material belongs to [image direction](../3-materials/images.md) and [video
direction](../3-materials/video.md). This page covers why and how material appears. When the screen itself is
the explanation or the evidence, read [screen demonstrations](screen-demos.md).

## Two ways a picture relates to the idea

**Exact correspondence.** The argument depends on a picture being visible at that moment. Give it the
stretch of speech the argument needs, and let `timing/timeline.json` resolve that stretch into seconds
([place events by relationship](timing.md#place-events-by-relationship)). A brief
appearance can use only part of a long clip. The duration you requested from the generator does not set
how long the picture is shown.

**A visual idea across several pictures.** Habits, experiences, processes and attitudes read better as a
sequence. The pictures can be separate layers, or several scenes inside one generated clip. Change them
with the beats of the argument, not on every noun. Where a reference's exact correspondence matters,
keep it.

To direct a generated multi-scene clip:

- name the reference images in scene order and say what each contributes;
- give each scene one small action;
- say which you want: continuous within each scene, or one unbroken shot for the whole clip. They are
  different results.

Direct images, existing video or independently arranged layers can reach the same goal. A generated
montage is one option, not a requirement.

## Prompts for silent generated B-roll

There is no proven Bibei wording for silent B-roll yet. Put a fixed block of text in the prompt file
before the scene description, and test the first result on the account's model before relying on it.
The block should:

- state that this is silent supporting footage, focused on visible action, how objects behave, camera
  movement and edit rhythm, with people doing things rather than talking to the lens;
- bind the references: keep the identity, product, interface, props, set, light, texture, clothing and
  composition from the reference images, use them in the given order, and follow what the story says each
  one is for;
- keep the frame clean: no subtitles, floating text, labels, logos or ad overlays, while labels, screens,
  web pages and documents that belong to real objects in the references stay attached to those objects;
- choose one edit language: one continuous shot, crisp jump-cut beats, match cuts (similar composition or
  motion), or inserts of related detail (hands, screen, product, face, reaction).

Starting point, not yet proven:

```text
Silent supporting footage for an edited video. No one speaks to the camera; show people doing things,
objects reacting, and deliberate camera movement. Use the reference images in the order given and keep
their people, products, screens, props, place, light, texture, clothing and framing. Add no subtitles,
captions, labels, logos or overlays; any text that is part of a real object in the references stays on
that object. Edit rhythm: match cuts between the scenes, each scene held long enough to read.

Scene 1, from the first reference image: ...
```

When a version works, keep it in `prompts/` and note in `PROGRESS.md` which model it ran on and what it
fixed.

## Footage and performance in the same frame

- A still can fill the canvas; a clip can play beside a moving presenter; either can sit in a frame, be
  cropped, masked or given a designed border.
- The chosen picture can take the attention while the performance stays visible elsewhere, or fill the
  frame while the performance's voice continues. Position and layer order follow the composition, not the
  label "B-roll".
- Each independent picture is an `<img>` or a muted `<video>` layer with its own frame, look and playback.
  A still has a display window and does not need to become a video.
- Keep three things apart: where the clip sits in the film, how long it is shown, and which part of the
  source file plays. See [footage layers and the three
  clocks](page.md#footage-layers-and-the-three-clocks).
- When footage, presenter and graphics share a layout or movement, let one scene own them
  ([scene design](scenes.md)). A border or animated frame is a presentation choice,
  not a new kind of material. Canvas, frames, fit and crop are in [space, canvas, frames and
  fitting](page.md#space-canvas-frames-and-fitting).
- When a clip's own location or action sound helps, bring it into the mix as a separate `<audio>` element
  beside the muted picture. Placing a picture never replaces the performance's voice. Levels and balance
  belong to [sound mix](mix.md).

## Pictures enter and leave on their own rhythm

- A picture answering a spoken point follows a phrase or a moment. A musical beat or a physical action can
  set its own time.
- A picture's window need not start and stop with a speaker. When the partner starts talking, the last
  lifestyle shot can stay a moment before their face appears: a J-cut. Speech decides whose words are
  heard; the visual composition decides when the view changes.
- End a picture when the idea, the action and the time to take it in are done. A still lasts its window;
  a clip also has its own playback length. If the final action matters, let it finish; otherwise cut on a
  better beat.
- To use part of a clip, either cut the interval with ffmpeg ([cut and keep
  intervals](../3-materials/media-prep.md#cut-and-keep-intervals)), or place the whole file and show only what
  you need: `data-media-start` sets where in the file playback begins, `data-duration` sets how long the
  layer stays.
- Freezing the last frame, looping and changing speed are explicit media operations and expressive
  choices. A window longer than the remaining footage is not filled automatically.
- Neighbouring pictures can meet at a meaningful boundary, bridge the pause between words, or
  deliberately reveal another view. Shared boundaries are resolved in timing; accidental flashes and gaps
  are found in [review](../5-deliver/review.md#judge-the-composition). Check the actual result: windows
  that are continuous on paper cannot make exhausted footage or transparent frames fill the screen.

## When footage leads the whole passage

A music-driven montage, a tactile craft film or a visual product explainer can make images and clips the
main sequence.

- Cut on the visual argument, the physical action or the musical phrase.
- Cut to a close shot only when it reveals something the wide shot cannot.
- Give a quiet touch or a settling motion time to finish.
- Sound support belongs to [sound mix](mix.md).

One timeline holds speech segments, gaps and directly authored intervals, and independent material can
occupy any of them. A wordless passage is not a segment: leave room for it with a later segment's `gap` or
`start`, sized to the clip's own length, and author the picture there. Passages of pure footage and
graphics run on authored time. Neither needs a hidden speaking picture. See [build the
timeline](timing.md#build-the-timeline).

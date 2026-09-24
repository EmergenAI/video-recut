# Generated dependencies

Read this when a new image or video must inherit facts from a picture that already exists.

Every image request is still a whole new painting. A reference only brings in useful visual memory: a
person's appearance, a product's form, a place's mood and geometry, a camera relationship, a physical
state. Some details must match exactly; others only give a world the model may reinterpret from a new
viewpoint. For each new picture, say what it inherits and what it newly shows. Let the creative need
decide the shape of the graph between images, not a fixed pipeline.

## One image opens another view

A typical case: one host's image establishes the person, the encounter and the place. The co-host's
image is anchored on it, and changes several parts at once:

| Paragraph | What happens |
| --- | --- |
| Capture | The same phone-video photographic language. |
| Person | A new person with their own look, inside the shared encounter. |
| Shot | Together the two views make up a conversation: the opposite side of the table, looking at the partner, the microphone entering from the matching side. |
| Setting | The same place and palette, but the new camera sees another part of the building, furniture or activity. |

The model paints a whole new view. What ties the two images together is the shared world and the
geometry of the conversation, even though the person, composition and background all change. Symmetry
belongs to the encounter; the second camera sees whatever is visible from where it stands.

The relationship matters more than copying the background. A two-person encounter carries who faces
whom, which side the microphone enters from, and which part of the room each camera sees. A split-screen
call or reaction shot can put the two people in different rooms; what they share is only who is talking
to whom.

The same main image can also combine with a product image in a separate request: person and most of the
view continue, and only the hand, the phone and its screen change. One reference can support very
different changes, because each new image has a different intention.

[Conversation image examples](conversation-image-examples.md) show the prompts and inputs for both kinds.

## Give each new image the references it needs

- **The first camera image** can establish the person and the place together: one person, several, or
  the whole encounter. When other views need that world, bring in its mood, palette, materials and
  spatial relationships. Several speaking shots can share one resulting image.
- **A new place** can start from a camera image that already puts the person in the new setting. The
  existing view supplies identity and styling; a product or continuing prop supplies form and state; the
  new image settles place and composition together.
- **A place without its own key image** does not need one: the character reference can go straight into
  [video direction](video.md).
- **Across a scene change,** the previous location's furniture and camera positions have done their job.
  Inherit only the person's identity and the state of any relevant prop, and only when the moment earns
  an image. A change of outfit, time or scene changes which facts need inheriting.
- **Grow or branch.** A view can grow from the previous view along the story when a change of state
  matters, or branch from the character reference when earlier scenes have nothing to contribute.
- **Partial inheritance.** A portrait can contribute identity only while clothes, action and place change.
  A holding-the-product variant can inherit nearly the whole view and change only the hand and the object.
  An image with no person can still borrow from product, place, graphic or composition references.

Pick references by the relationship the next image needs. Go to the image that actually knows that
relationship; a chain through unrelated intermediate scenes accumulates their accidental details.

When an existing image already serves the target view, use it. When a new one is needed, connect the
images that carry the facts and say in the prompt what each one does. With several references,
"reference image 2" is the second `--ref` of this `bibei.mjs image` request. When references carry most
of the picture, the direction can state only the change. Exact parameters and each model's reference
limit are in [image requests](generation-requests.md#image-requests).

## Keep the graph in the project

Later views may reuse the same relationship, so keep its parts in the project:

- prompts in `prompts/`;
- reference files in `composition/assets/` or `composition/generated/`;
- every request and its outputs in `composition/generated/manifest.json` (the script records them).

Casting, framing, palette and capture language belong to [image direction](images.md). When to
reuse produced work is in [reuse produced work](../4-compose/overview.md#reuse-produced-work).

## Carrying it into motion

The image graph records visual facts to inherit. It is not the shot order of the video, and it does not
set where one video request ends and the next begins.

- One camera image can guide a passage with several views or several speaking shots in the same world.
- Several images can contribute different facts to one video request.
- A performance or camera move that a still cannot show needs another route into the video request. The
  account's video model takes no reference video; choosing inputs and describing motion belongs to
  [video direction](video.md).

The role produced material plays in the finished work belongs to [voice and
performance](speakers-and-narration.md) and [B-roll](../4-compose/supporting-footage.md).

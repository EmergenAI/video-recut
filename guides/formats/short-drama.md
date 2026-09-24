# Short drama

Read this when characters drive the story: what people want, notice, do and feel toward each other
makes one event lead to the next.

Short drama is rich A-roll carried by performance. It is not reserved for plotted fiction. Any
piece whose story rests on a human event can take this dramatic shape, whether that is a family moment,
a set-up meeting, a podcast conversation or a street interview. For the conversation-specific versions, see
[two-person podcast](podcast.md) and [street interview](street-interview.md).

## Give every segment a dramatic job

Start from the causal chain in the Treatment. Each step should change something: someone wants a
thing; someone else changes what it means; an action has a consequence; a reveal changes what the
viewer understands. Dialogue can carry the step, and so can silence, a reaction or a physical action.

A segment is a performable dramatic passage, not a shot and not a speaker turn. One segment can hold
two people and several cuts; one passage can also be produced in parts, each part a separate
generation that reuses the same camera view. Pick whichever shape keeps the action and the exchange
clear.

Measure the script before choosing durations ([script and time](../2-plan/script.md)):
the line density tells you how much room is left for pauses, reactions and business.

The model's request length limits what can be generated together; it does not define the scene.
MiniMax H3 renders at most 15 seconds per request, so a longer continuous exchange becomes several
shots joined at motivated cuts: a look, an interruption, a turn of the head.

Example (invented): a baker has saved the last cherry cake for a regular customer. A stranger buys it
while she is in the back. The customer arrives, sees the empty shelf, then sees the stranger outside
the window and freezes: it is her brother, whom she has not spoken to in years. Four steps, each one
changing what the cake means. The dialogue is sparse; the freeze and the look through the glass carry
the turn.

## Build the camera views the story needs

When the work depends on recognisable people, a shared world, blocking or composition, start from
reference-conditioned generation. A key image can establish a character, a complete story view with
the characters placed in the scene, or both.

Direct images and shots in natural language, from the dramatic intent of the moment
([image direction](../3-materials/images.md), [video direction](../3-materials/video.md)).
Dramatic scenes vary a lot, so free direction suits them. Only when a prompt relationship has held up
across several productions is it worth keeping as proven wording.

Your first useful image might be a character reference, or it might be the encounter itself. Derive each later view
from the image that already holds the facts it needs
([generated dependencies](../3-materials/reference-chains.md)):

| From | To | What the edge carries |
| --- | --- | --- |
| Character image | A view that establishes a new place or dramatic state | Identity |
| Shared two-person view | Close views of each person | Bodies, eyeline axis, the encounter itself |
| One story view | The next story view | Costume, props, spatial relationships |
| User-supplied image | Used directly | Whatever it already shows of the intended person and shot |

For the bakery: a character image of the baker; a shared view of the counter with baker and customer
across it; from that, one close view per side; the window view with the brother outside is derived
from the shared view so the street, glass and light match.

A few views of one place can support many shots, such as one view per side of a conversation. Small
reframing, performance and camera changes happen inside the video. Add an image only when a new view
must establish something that matters: a changed relationship, the state of a key prop, a space the
plot depends on.

Decide separately which views to establish and which dramatic actions to generate together. One
request can move between several compositions or places; one view can guide several shots. H3 takes up
to 9 reference images and 3 reference audio files per request, which usually covers a segment's views
and voices. Give a new place its own image only when the story needs that view established. Image
dependencies follow visual dependencies, not the number of places or edits.

## One world, seen from different sides

The setting is part of the story. It may show how close these people are or where they stand, account
for why they are together,
set up a comic contrast, plant an object that will matter, or make a new scene readable at a glance.
Direct the setting's character as firmly as the people's; otherwise the model returns a generic room.

Related views share the facts that make the place recognisable: atmosphere, materials, palette, social
setting, spatial layout. Each camera sees a plausible different part of that place, for example the
wall of flour sacks behind the baker and the street door behind the customer.

## Performance carries the event

Action direction keeps cause and attention intact: who starts it, who notices, what changes hands,
what a reaction is answering, and why attention or the camera moves now. A glance, an interruption, a
refusal to answer, a turn away: these matter when they change the dramatic relationship. Do not
direct them as decoration.

## Visible speaking shots and their sound

For every shot where someone is visibly speaking, the segment's TTS file is the one sound of record
and the generated clip plays muted over it. Pass the TTS file as the shot's reference audio, then check
the first such shot muted against its speech file before paying for the rest (see
[talking head](talking-head.md) and [video requests](../3-materials/generation-requests.md#video-requests)):
H3 fuses reference audio into the video but does not promise lip-sync.

If that short test shows the clip's own speech is better than the TTS file, switch the route for that
segment: extract the clip's speech as the segment's audio, align it and rebuild the timeline so words
and cuts follow the new file ([source sound from footage](../4-compose/sound.md#source-sound-from-footage)).
Never keep both; one passage reaches the film through one route
([route the voice once](../4-compose/sound.md#route-the-voice-once)). Record the choice in
`PROGRESS.md`.

## Other layers sharpen, they do not replace

Captions, typography, motion graphics, effects and B-roll can sharpen an event without taking over the
human line. A phone notification can reveal the stranger's name before the customer says it; an
insert of the receipt can prove the cake was sold minutes ago; a final graphic can make the ending
readable. Even when another layer covers the picture, the A-roll performance and its sound must still
mean something.

## Review

Ask whether the dramatic causality holds and whether people, places and actions stay continuous. At every
point the viewer should be able to tell who is doing what, what has just changed, and what leads into
the next view or scene. New short-drama
forms can combine these parts differently, but they keep this responsibility.

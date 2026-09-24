# Sound mix

Read this when you decide what the viewer hears in a passage or across the film, and how the sound
already in the material relates to any music or effects you add.

Who performs the lines and where a voice comes from belongs to
[Voice and performance](../3-materials/speakers-and-narration.md).

## Listen to what the material already brings

- **Talking-video A-roll:** picture, words and sound belong to one performed clip. When B-roll, a
  graphic or another angle replaces the picture, its sound carries on in place on the timeline.
- **Audio-only A-roll** supplies the spoken performance; the picture is made separately.
- **A wordless performance** may bring its own sound or be silent.
- **B-roll** may be a still, a silent clip, or footage whose own sound is worth keeping. What it does in
  the picture does not settle whether it is audible: it may contribute one specific action sound, or nothing at all.

Each performance's audio reaches the film exactly once, chosen by what this passage actually plays
([Route the voice once](sound.md#route-the-voice-once)). In the composition every
`<video>` is muted, so source sound is always an explicit choice: extract it from the same file into its
own `<audio>` layer where it should be heard
([Source sound from footage](sound.md#source-sound-from-footage)). A spoken performance
under a covering picture stays available.

Before adding anything, hear what is already there. Then give each addition a job:

| Sound | Its usual job |
| --- | --- |
| Music | Rhythm, mood, a turn in the line of thought |
| Short effect | An audible edge on a contact, a reveal, a transition |
| Sustained ambience | Placing the location or bridging cuts, when the footage cannot do it |

These are jobs in the work, not layers to fill. The ambience may already live inside the performance.
Length alone does not make ambience and an effect different assets. Designed quiet is expressive too.

This Skill gives you methods to prepare, place and mix sound; it has no library of music, effects or
ambience. Choose or make what the work needs from supplied, recorded, generated or other sources, and
keep it in `composition/audio/`. TREATMENT.md records why a sound is needed; the composition page
expresses how it is used; `plan.json` registers every non-speech sound with its `role` and true
`source` ([production plan](../2-plan/production-plan.md)).

The reference's own sound is not one of those sources. Its soundtrack, music or voices are for
analysis; they go into the film only when the user asked for that, and the delivery checks compare
the film's audio against `reference/` to catch it.

When the piece wants music and none was supplied, ask the user as in
[guiding the user](../1-setup/guiding-the-user.md#music-when-none-is-available): a track they send and
may use, a version without music, or generated music where the host offers it. A synthesized bed is
a placeholder, and you say so when you deliver. Never use copyrighted music without the rights.

## Decide who leads the ear

When the voice carries the idea, its key words must be understandable in the finished film. Music and
effects step back under names, numbers, claims, punchlines and quiet reactions, and take more room in
pauses and in passages led by action or music. Shape this with level, placement, fades, arrangement and
source choice; do not assume the same balance at every moment. Normalizing gets a source ready and no more;
what the listener hears as the balance is set in the composition.

Who does what:

- **The composition page** places each sound and sets its constant level. An `<audio>` layer takes
  `data-start`, `data-duration`, `data-media-start` and `data-volume` (0 to 1); the renderer mixes
  every layer into the MP4.
- **ffmpeg, beforehand,** shapes anything inside a file: `loudnorm` to even out loudness, `afade` for
  fades, `volume` for a fixed gain, `sidechaincompress` keyed on the speech so music ducks under the
  voice. Keep processed files beside the originals, and redo the processing when the speech or its
  placement changes. Commands are in
  [Levels, fades and ducking](sound.md#levels-fades-and-ducking).

Give every added sound an expressive reason. A comparison can share one motif across both sides; a
reveal can take one precise accent; a tactile process may want a tiny contact sound rather than a big
impact. Repeating the same whoosh just because another cut happened drains it of meaning; change the
sound when the event's dramatic role changes. Let the work's character steer the sound palette.

## Tie a sound to what causes it

- A sound that answers the meaning of speech follows a named phrase or a named moment, resolved from
  `timeline.json`, and moves with it when the speech is re-taken.
- A sound that belongs to a scene's own entrance, state change or handoff follows that scene's event
  time.
- Music and other independently directed events can occupy an authored window.

Pick the relation by asking what makes the sound happen. One audiovisual event can share a single
cause; there is no need to time the picture and the sound separately. Resolution is in
[Place events by relationship](timing.md#place-events-by-relationship); placement is
in [Music and effects](sound.md#music-and-effects).

## Keep the sound continuous across picture changes

A cut in the picture need not cut the acoustic world. Room tone carries on across angles of one
location; music strings a montage together; a speaker's sound continues while another picture is in
frame. The reverse also holds: a change of place, of speaker perspective or of story state may need an
audible handoff even when the picture changes gently. Go by how the listener experiences the
encounter.

Join speech, source action sounds and effect tails at the rhythm the scene needs, and use silence,
fades and overlaps to make the handoff audible.

Check in an actual draft render: the voice is clear wherever it carries meaning, each effect belongs to
its event, and the whole soundtrack keeps the character the work intends.

# Voice direction

Read this before you choose, design or replace the voice of anyone who speaks in the work, including
when you adapt a work whose voice sample has already been accepted.

The goal is a voice the viewer wants to keep listening to. For creator-style social video that usually
means a voice with a recognizable character, some appeal of its own, and the sense that it is talking
to someone.

## Cast the person, then hear them

Picture the situation first: who is speaking, to whom, and what is attractive about how this person
sounds. The character's temperament usually suggests the voice.

- A job title (founder, creator, coach) only gives context. You still decide how *this* person sounds.
- "An unexpected voice" describes a relationship to the casting, not a voice. Name the specific
  pleasing sound you picked, or the model has nothing to realize.
- Work as you would with image prompts: set the appeal with a few high-level, sensory words, then pin
  down the traits that decide it.
- Pitch, weight, brightness, softness and grain are casting decisions, not synonyms for "nice voice".
  Choose a rasp or a breathy edge only when it belongs to this person.
- Let the imagined encounter set the voice's presence: an eager recommendation projects; a late-night
  confession stays close.

Base the choice on the character reference images and the Brief. A voice the user supplies fixes the
exact identity. A voice the project already has continues while it still fits. A new person gets a
voice worth following.

Record the casting decision, and what any reference contributed, in TREATMENT.md. Keep the accepted
sample file with the rest of the work's audio.

## Describe the voice in one vivid paragraph

A short paragraph is usually enough. It carries three things:

1. a recognizable vocal character;
2. the sound qualities that make it pleasant;
3. who it is typically talking to, and how.

Sharpen it with a few extra dimensions only where they settle the choice: apparent age and gender,
language or accent, pitch, texture, articulation. This is not a form to fill in. A cultural or
character sketch earns its place only if it makes the voice audible in the reader's head.

Translate the character's job in the film into things a listener can hear. If the viewer must be
convinced, ask for clean articulation and deliberate stress. The request describes the voice and the
way of speaking; music, graphic reveals and the mix have their own direction elsewhere.

Two contrasting descriptions, written for this page:

> **Quick and mischievous.** A young woman with a bright, slightly nasal voice that seems to be
> suppressing a laugh. Light and agile, she tips up at the ends of phrases as if letting a friend in on
> a trick, and clips her consonants neatly so even fast lines stay clear.

The appeal here is play: brightness and agility make the listener feel included in a joke.

> **Warm and certain.** A man in his fifties with a low, rounded voice and a little texture at the
> bottom of it. He speaks unhurriedly, leans on the one word that matters in each sentence, and sounds
> like he is sitting across a kitchen table from you.

The appeal here is trust: weight, closeness and a steady emphasis make the listener believe him.

Pitch and pace are separate choices. A high voice can be unhurried; a low voice can be nimble. Keep the
traits that define the casting and set language and speech density from the work.

## Make the sample carry the character

When you choose or design a sample, prefer one in the target language, spoken in a manner that fits
the new work. A sample carries pronunciation and phrasing cues, not only timbre. Moving an identity
across languages does not bring the target accent and rhythm with it: keep the identity and state the
target-language traits explicitly in the request.

Write a sample line that is short, natural, and gives the voice room to show itself. Let the intended
way of speaking serve an idea in the sentence rather than just reciting a product name. For example,
for the warm and certain voice above:

> "Most people fix the wrong thing first. Start with the one that's been bothering you for a year."

If the work contains unfamiliar names, write their intended pronunciation into the script before any
of them appears in a sample.

How a voice becomes reusable depends on the TTS service the user chose or the host agent offers:

| The service can... | Casting means... |
| --- | --- |
| design a voice from a text description | writing the paragraph above and judging what comes back |
| clone a voice from a short recording | preparing a clean sample in the right language and manner |
| offer only a preset library | auditioning candidates and picking the closest to the direction |

Before you promise design or cloning, confirm with the user, or with the host's speech tool, which of
these is actually available ([Speech (TTS)](../1-setup/services.md#speech-tts)). Whichever route
it is, the result is one accepted voice: a sample file, a cloned voice, or a named preset. A
talking-video request can take the sample file as reference audio and perform the whole script with it;
independent narration uses the same voice in the TTS service.

A casting line and a finished passage do different jobs. Preparing, reusing and performing with the
accepted sample belongs to [Voice and performance](speakers-and-narration.md). The exact inputs a
service accepts come from its own documentation.

## One voice, many intentions

The approved voice fixes who is speaking and shows one possible manner of delivery. Every finished
passage is spoken for a purpose of its own: to hook, to doubt, to be won over by an example, to land a confident
conclusion. Direct those attitudes through the video performance or through whatever expressive
controls the speech service accepts, while keeping one recognizable person. A consistent identity does
not require a fixed mood for the whole film.

How attitude shows up in gaze, gesture and interaction is covered by [Video direction](video.md).
Where speech stands alone, its attitude comes from the script text and the service's expression controls. See also
[Give each part the direction it can realize](../4-compose/overview.md#give-each-part-the-direction-it-can-realize).

**Estimating length.** Plan with roughly 4–5 CJK characters or about 2.5 English words per second, then
read the real duration of the rendered speech with ffprobe. The rate only sizes the passage; the
character comes from the voice and the performance direction. Speed alone never produces emphasis, a
change of attitude or expressive intonation. Script structure and timing are covered in
[Script and time](../2-plan/script.md).

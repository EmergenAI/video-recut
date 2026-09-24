# Script and time

Read this when deciding the target's wording, how names and numbers are pronounced, how speech divides
into performable passages, and which meanings the picture and sound follow; also for measured lengths
and passages without speech.

This file owns the creative decisions. The exact fields of `script.json` are in
[the formal script](../4-compose/timing.md#the-formal-script); how speech and alignment become
`timing/timeline.json` is in [timing](../4-compose/timing.md).

## script.json is the only authority for spoken words

Put in `script.json` only the words the target video says, and shows as spoken text. Leave out
reference timecodes, visual styling, prompts and service decisions. The Brief may keep a required
claim and the Treatment may describe what a passage does, but the adopted wording appears once, here.

A minimal example:

```json
{
  "language": "en",
  "segments": [
    {
      "id": "s1",
      "speaker": "host",
      "text": "I stopped arguing about who paid for pizza.|| Kyrra does the math.",
      "audio": "composition/audio/s1.wav",
      "alignment": "composition/generated/s1.alignment.json"
    },
    {
      "id": "s2",
      "speaker": "friend",
      "text": "Wait, it splits the tip too?",
      "audio": "composition/audio/s2.wav",
      "alignment": "composition/generated/s2.alignment.json"
    }
  ]
}
```

Choose the structure by the ideas being expressed and the performance carrying them:

- **Segment**: a performable passage built around one idea, delivery and action, with its own speech
  file. Once the speech exists it takes its place on the timeline from measured or estimated word times.
- **`speaker`**: assigns the passage to a performer. Voice, caption treatment and picture can change
  with the speaker.
- **`text`**: the displayed wording. Captions show exactly this, and alignment matches against it.
- **`||` inside `text`**: here one on-screen caption Cue hands over to the next.
- **Named word span**: the meaning an element serves (a demo covers an explanation; a comparison runs
  through one claim), named by segment and words and resolved to seconds from `timing/timeline.json`.
- **Named moment**: an event such as an answer or verdict, which graphics, sound and effects can answer
  together; usually a word's start. What state persists afterwards is the scene's decision.

Keep named spans and moments in the composition page's own vocabulary, for example a small table of
`{ segment, word }` anchors at the top of the page script, so a wording change is fixed in one place.

Think of a Cue as a span of on-screen speech with its own timing; it is not the same as one line of text. The caption treatment can wrap it,
reveal or highlight word by word, and give the whole block an entry, exit or hand-off. Segment
boundaries already separate Cues; long segments split automatically at sentence ends and clauses; a
style window can change the look mid-Cue while keeping content and word times. Use `||` only when one
segment still needs a deliberate reading hand-off. [Captions](../4-compose/captions-style.md) owns that
judgement.

## Write the intended pronunciation

Decide pronunciation while writing, before any speech is requested: coined names, unfamiliar brands,
abbreviations, numbers, and Chinese characters with more than one reading.

`text` keeps the displayed spelling. Give the speech service a clear spoken form: words, syllables or
letter names that read naturally in the target language. A familiar word's sound, a phonetic respelling
or a homophone can make an unfamiliar name concrete while the displayed spelling stays the same. Where
ordinary spelling already carries the intended reading, leave it alone; an English name inside Chinese
copy does not need automatic transliteration.

When the spoken wording must differ, write the segment's spoken text in its speech request and save it
as that segment's prompt of record, `prompts/<id>.speech.txt`, so a repeated or revised request sends
the same reading. For the example above:

```text
prompts/s1.speech.txt
I stopped arguing about who paid for pizza. Keera does the math.
```

The request itself is covered in [speech](../3-materials/generation-requests.md#speech).

Alignment recognizes the spoken audio and matches it to the displayed `text`, tolerating small
differences: an initialism read letter by letter or a number read out in Chinese is matched where the
characters allow, and otherwise interpolated between timed neighbours. A long divergence between what
is said and what is shown leaves many words without measured time. Keep the two close and let them
differ only on the words that truly need another reading.

### Choosing the spelling that carries the sound

These are the author's own illustrative choices, not results verified on every speech service:

| Intended reading | `text` (displayed) | Spoken text sent to speech |
| --- | --- | --- |
| A single letter by its name | `Plan Q` | `Plan cue` |
| An initialism spelled with letter names | `SQL export` | `ess cue ell export` |
| Letters separated by spaces | `EV charger` | `E V charger` |
| An abbreviation read as one word | `SKU count` | `skew count` |
| A coined name given familiar syllables | `Kyrra` | `Keera` |
| A name read through a Chinese homophone | `我在用 Kyrra 记账` | `我在用凯拉记账` |

- A letter's name, a letter's sound and an abbreviation read as a word are three different choices; one
  spelling selects one reading. When the word must be spelled out, use letter names.
- Write the whole line in natural phrasing. Do not insert artificial pauses between every letter or
  syllable.
- Phonetic notation, IPA included, helps only a service that understands it, and a service's own
  pronunciation feature belongs to that service's documentation; do not assume one exists. Put the
  pronunciation aid in the spoken text itself. An instruction like "please say it as…" is voice
  direction, not words the performer should speak.

### Carry the chosen reading through the piece

A spoken form applies only where it is written. Carry it to every occurrence of that name, including in
other segments, so separately generated speech gets the same guidance. Captions keep the display
spelling from `text`. Settle readings before estimating length and before requesting speech.

Chinese copy follows the same method for numbers and names: display the compact form, and choose the
spoken reading from the sentence's meaning.

| Kind | `text` | Spoken text |
| --- | --- | --- |
| A year | `2019 年我开了第一家店` | `二零一九年我开了第一家店` |
| A price | `到手价 ¥59.9` | `到手价五十九块九` |

When a character with several readings could be misread in context, remove the ambiguity with a
homophone or a rewording in the spoken text, and listen to confirm. Captions keep the simplified or
traditional characters as written; alignment supplies time only and never rewrites the displayed script.

## Choose performable passages

- Each segment has one speech file, `composition/audio/<id>.wav` (or `.mp3`), generated from the spoken
  text in the voice chosen for its speaker. What the file must satisfy:
  [speech (TTS)](../1-setup/services.md#speech-tts).
- Changing a passage's words means changing its `text`, and its spoken form if it has one, then
  regenerating that segment's speech. The other segments stay.
- Set boundaries by natural production passages and delivery length, not by picture cuts: a
  single unbroken narration may sit under numerous B-roll changes, each tied to a named word span. A new speaker starts a new
  segment (each turn with its own file and voice); a `||` Cue break needs no extra speech file. Short
  segments are easy to revise and realign; long ones keep a performance's continuous breath. Choose by
  what the delivery needs.
- When kept recorded speech carries a passage, extract that footage's audio with FFmpeg as the
  segment's speech file. `text` holds the words of the final performance, aligned on its own clock.
  Cuts inside the recording change the performance material; several kept clips can form one passage.
- Wordless passages need no segment: a product detail shot, a musical beat, a piece made entirely of
  prepared material. Place them in the composition on their own seconds. A speech segment after one can
  set `start` to begin at a given film time instead of following the previous segment's gap. Spoken
  passages, wordless footage and pure graphics can share one film.

## Timing authored animation

In a speech-led piece, a graphic's timing usually follows what it explains: a reveal belongs to its
named moment, a covering picture to its named span. After rewriting an argument or changing a
performance, rebuild the timeline and the design lands on the target's real times. Reference seconds
record observations; the target's words express what the new graphic follows.

Chat animations, charts and kinetic type can be drawn entirely by the composition. Their information
and changes still mean something: you decide when the viewer receives each item and how long they need
to read it. Keep the content and event times in that scene, as authored seconds on the paused GSAP
timeline. A piece with no speech at all needs no `script.json`; its length is the timeline's length
([animate with the paused timeline](../4-compose/page.md#animate-with-the-paused-timeline)).

Choose the timing method per relationship, not once for the whole film. A line of speech might open a chat
scene whose messages then arrive at authored intervals, while elsewhere an authored animation might
bring in a single item exactly on a spoken word. The trigger and the entry duration are two choices: the answer word's start places the answer,
and a duration of a few frames gives its arrival a character. See
[place events by relationship](../4-compose/timing.md#place-events-by-relationship) and
[durations for authored animation](../4-compose/timing.md#durations-for-authored-animation).

## Measure before setting lengths

When A-roll performance is new or altered, its duration is set by what the target says, how it is
delivered and what happens on screen. Use the reference timeline to grasp pace and relations; the actual
times belong to the new performance.
The same words from another speaker or in another delivery change length.

**Before speech exists, estimate.** Mandarin dialogue runs about 4–5 characters per second; English
about 2.5 words per second. Count the spoken text, not the displayed text (Chinese numbers read aloud
count by syllable). Brisk social delivery sits at the top of the range, careful explanation at the
bottom. The rates include ordinary pauses; leave extra time for deliberate reactions, demonstrations
and holds, and keep related performances at a consistent density.

**After speech exists, measure.** Replace the estimate with the file's real duration:

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 composition/audio/s1.wav
```

The measured duration is the basis for every later choice.

When a segment's speech decides a generated shot's length, size the video request from the measurement
and the durations the model supports. MiniMax H3 accepts whole seconds up to 15; `bibei.mjs models`
lists what the account currently offers. Round to the intended performance rather than squeezing a line
into the shortest supported value.

- **Leave breath in energetic delivery.** Derive a candidate rate from the spoken density of the
  reference's passages, then adjust for the target language, terminology and action. After rounding,
  check the real density; giving every line the shortest duration makes the whole piece feel rushed.
  Write the chosen rate and the meaningful pauses into the Treatment so later passages follow it.
- **Shape passages with the estimate.** A short line can merge into the next response, grow slightly, or
  leave room for an action. A long one can be tightened or split where the idea naturally turns. Keep
  the meaning and energy, then estimate again. [Video direction](../3-materials/video.md)
  applies this judgement within the chosen model's request range.
- **Estimates size requests; they do not place words.** Once a passage's speech is accepted, align it
  with `bibei.mjs align` and build the timeline with `timeline.mjs build`. The measured duration answers
  how much media is needed and how long the passage is; the aligned words answer where captions, B-roll,
  motion and effects fall in the actual audio. Without alignment, `timeline.mjs` estimates word times
  from the audio and marks the segment `estimated`
  ([estimated timing](../4-compose/timing.md#estimated-timing) says where that precision is enough and
  what to tell the user).
- **Wordless passages** take their request length from the action, the music or the visual rhythm;
  speech rate does not apply. The final media still decides the passage's span.

## Bind meaning to script identity

Picture, caption treatment, motion states, sound and effects that belong to the spoken meaning name the
word span or moment they serve by segment and words; the seconds come from `timing/timeline.json` (the
same object as `window.TIMELINE` in the page). Use explicit seconds only for design that is truly
clock-based or has no speech.

Choose anchors deliberately, including which side owns a pause. Adjacent B-roll can end a passage at the
next word's start rather than the previous word's end, which decides whether the pause belongs to the
outgoing or the incoming picture. A sustained reaction can include the silence before the next word.
Resolving anchors and deliberate offsets: [place events by
relationship](../4-compose/timing.md#place-events-by-relationship).

Reference notes keep the original seconds and say which original words or content event an element
served. The target design names the intended relationship with the target's words, and once the target
audio is aligned the timeline supplies the seconds. Do not copy reference timestamps into the target,
and do not keep an accidental lead or lag unless that offset is itself the design.

## Where timing problems in a draft belong

| Symptom in the draft | Fix |
| --- | --- |
| Wrong Cue break or wrong anchor word | `script.json`, or the anchor table in the page |
| The speech performance changed the intended pace | the duration choices, the voice direction, or the Treatment |
| The right word span, rendered badly | the scene in the composition page |
| A generated shot that does not work | its prompt, references, chosen version or shot design |

Put each correction where the fact lives.

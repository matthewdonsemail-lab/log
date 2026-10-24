---
name: personaPicture
description: Draw random personas from the warm-up datasets, store them in media/personas/personas.jsonl with each one's characteristics and image prompt, generate each one's profile picture in the low-angle selfie style through treg, and have SubQ check it matches the persona, regenerating until it does. Use when matt asks for personas, profile pictures for personas, or more of them.
---

# personaPicture

A persona here is just a person, not a buyer persona: who they are, drawn from
the same datasets the Reels warm-up uses (`src/warmup/persona`,
`~/.logCli/datasets`). Code: `src/media/persona`, run by
`scripts/media/personaPictures.ts`.

Only adults are drawn (`PERSONA_MIN_AGE`, 18). The doomscrolling dataset has
teenagers in it, and they are filtered out before the draw.

## What's stored

`media/personas/personas.jsonl` holds one line per persona:

- `personaId`, `seed`, `country`
- `characteristics`: age, gender, occupation, education, when and why they
  scroll, mood, sleep, device and the rest of the draw's summary
- `sources`: the dataset rows it came from
- `prompt`, `avoid`, `size`, `resolution`, `generatedWith`: what is fed to the
  image model
- `attempts`: every generation, with its task, URL, credits, the prompt used and
  SubQ's scores
- `profilePicture`, `matched`

Each picture is at `media/personas/<personaId>/profilePicture.png`.

## The style

It is read from matt's two example photos, which are kept in
`~/.logCli/personaExamples` and are never committed, because they are real
people:

- the camera held low, below the chin, pointing up at the face, with the
  ceiling behind the head: an unflattering angle
- the arm holding the camera out of the frame: an arm in the picture looks
  wrong and unnatural (matt, 2026-10-24)
- a flat, unsmiling expression and ordinary clothes
- bad light: a blown-out ceiling light, or a dark room lit from below
- old front-camera quality: soft focus, noise, washed-out colours

The place comes from the occupation and the light from the time of day they
scroll. The prompt never says phone, iPhone or screen (`listingCreative`), and
it carries no text or logos.

Generation is done only from the prompt. matt's photos are never passed to the
image model, so no real face is copied. They go only to SubQ, as the style to
judge against.

## The check

SubQ (Decisions API) gets the picture as image 1 and the examples as images 2
and 3. It is asked about image 1 only:

- `matchesPersona` (must reach 0.7)
- `ageFits`, `genderFits`, `lifeFits`, `selfieStyle`, `looksReal`, `noText`
  (each must reach 0.6)
- `armHidden`: the arm holding the camera is out of the picture or under 20% of
  it (must reach 0.6)
- `lowAngle`: the camera is below the face pointing up at it (must reach 0.6)
- `unflattering`: an unflattering, careless shot, not posed or attractive (must
  reach 0.6)

When any of them is low, it regenerates. The first prompt already carries the
fixes for selfieStyle, noText, armHidden, lowAngle and unflattering, because
first attempts missed them. Each later prompt adds a fix for every check that
has failed so far. It tries at most 5 times, then keeps the closest attempt and
sets `matched: false`.

The first approved picture is SubQ's third style example, after matt's two.

## matt's verdict comes first

- `--approve <id,id>` locks pictures matt likes (`approved`). They are never
  rechecked or regenerated, and `--redo` refuses them.
- `--redo <id>` rejects one picture (it is kept in `rejected`, with its
  attempts) and regenerates it.
- `--recheck` checks every picture that isn't approved against the current
  checks, and regenerates whichever fail.

matt approved fullTimeEmployeeMale30, fullTimeEmployeeMale26 and
freelancerSelfEmployedMale36 ("perfect") and rejected studentFemale25
(2026-10-24).

## Running

```bash
bun scripts/media/personaPictures.ts --count 5 --country US
```

Run it live through Monitor (rule 26). It costs $0.034 an image through
`reapi.image-gen.gemini-3-pro-image`, plus one SubQ call per image (rule 41:
only as many as matt asked for). A new run replaces `personas.jsonl`.

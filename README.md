# lofi.rig

A 2-week experiment to answer one question: **can an amateur make lofi beats they like, using AI + a simple DSL?**

## What this is

- `rig.html` — a single HTML file. Open in Chrome. It parses a custom lofi DSL and plays it via Tone.js.
- `rainy_window.lofi` — a starter beat to play with.
- `CLAUDE_PROMPT.md` — system prompt to teach Claude (or any LLM CLI) the DSL.

There is no install. No build step. No backend. The browser handles audio. Your terminal handles AI generation. The two communicate through one text file on disk.

## Setup (60 seconds)

1. Open `rig.html` in **Chrome** or **Edge** (needs File System Access API, no Firefox/Safari for now).
2. Click **load**, pick `rainy_window.lofi`.
3. Click **play**. You should hear a sleepy lofi beat.
4. Press **stop** when you've heard enough.

## The actual experiment

Open `rainy_window.lofi` in your terminal:

```sh
# replace the file with a fresh AI-generated beat
claude -p "$(cat CLAUDE_PROMPT.md)\n\nUser request: make a slow rainy day beat in D minor with deep bass" \
  > rainy_window.lofi
```

(or use any LLM CLI — `aider`, `opencode`, raw `curl` to the Anthropic API, etc.)

Then in the browser:
- Click **reload** (or hit play, which always re-reads the file)
- Hear the new beat

That's the loop. Iterate. Try different prompts. See what works.

## Keyboard shortcuts

- `Space` — play/stop
- `Cmd/Ctrl + R` — reload file (without page refresh)

## DSL quick reference

```
@tempo 78          # bpm
@swing 0.62        # 0.5 = straight, 0.7 = heavy swing
@fx vinyl 0.4      # vinyl crackle 0-1
@fx reverb 0.35    # reverb 0-1
@fx lowpass 0.5    # 0 = muffled, 1 = bright

kick:   x . . . . . . . . . x . . . . .
snare:  . . . . x . . . . . . . x . . .
hat:    x . x . x . x . x . x . x . x .

bass:   A2 . . . . . E2 . G2 . . . A2 . . .

chords: Am7 Dm7 E7 Am7
```

16 steps per bar for drums and notes. One chord per bar; the chord track loops.

## What to look for during the experiment

After 1-2 weeks of using this, ask yourself:

1. **Time to first beat I like** — how long?
2. **Hit rate** — how many AI generations are keepers?
3. **Iteration loop** — can I steer the AI toward what I want with plain language?
4. **Show-a-friend test** — would I send any of these to someone?
5. **Repeat use** — do I open this voluntarily tomorrow?

Strong yes on most → product is worth building.
Weak signal → you've learned what to fix.

## Limitations of this rig

This is intentionally minimal. It is **not** the product. It's a test rig for the workflow.

- Chrome/Edge only
- Single file at a time
- No save library, no sharing, no export
- Synthesized sounds (no real samples — yet)
- Lofi only (no other genres)
- No visualizer, no fancy UI
- Manual reload (no live file watching)

If the workflow feels good with these limits, the polished product feels great with them removed.
# lofi-rig

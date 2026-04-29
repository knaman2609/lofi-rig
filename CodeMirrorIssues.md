# Current Issues

## 1. Syntax Highlighter (main thing to fix)
The CM6 `StreamLanguage` tokenizer in `src/dsl/cm-language.js` has a state-carry bug.
The `state.kind` (drum / note / chord) may not persist correctly across continuation lines.

**Root cause:** The per-token state approach in StreamLanguage is fragile.
**Fix plan:** Rewrite the tokenizer to use a per-line approach — scan the whole line at once to determine context, rather than relying on state carried token-by-token.

**File to fix:** `src/dsl/cm-language.js` — the `token()` function inside `StreamLanguage.define()`

## 2. Already Fixed
- Cmd+Z undo — works now (CM6 handles it natively)
- Cmd+Shift+Up/Down — octave shift, undoable via CM6 transactions
- Line numbers — removed

## 3. Other things to do (future)
- Hover tooltips (hover C4 → shows "C, octave 4")
- Autocomplete for note/chord names
- In-place AI (ghost text for next bar suggestions)
- Click a note → plays that note
- Step flash via CM6 decorations (currently wired up, needs testing)

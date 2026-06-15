# Git Quest — CLAUDE.md

Project reference for Claude Code. **`index.html` is the source of truth** — if anything
here drifts from the code, the code wins. Read the relevant part of `index.html` before
editing.

## What it is
A browser game that teaches Git **by playing it** — a Monument-Valley-inspired isometric
3D adventure. You're the Keeper of "the Repository," a world undone by a storm; you sail
dusk isles and rebuild its history by running **real Git commands** at rune-stones, then
beat a flashcard "guardian" boss on each isle. Repo state carries across islands; clearing
the final isle shows a victory screen.

## Shape of the project
- **One static file: `index.html`.** Vanilla Three.js r128 from cdnjs. **No build step, no
  npm dependencies.**
- **Live:** https://git-quest-six.vercel.app  ·  **Repo:** https://github.com/pixelsncodes/git-quest
  (local at `~/projects/git-quest`, WSL/Ubuntu)
- **Deploy = `git push` to `main`** → Vercel auto-builds in seconds. Vercel settings:
  Framework Preset **Other**, Build Command **empty**, Output Directory **root**.
- **3 islands done** (I First Light · II Forking Tides · III Far Shore). Commands exercised
  so far: init, add, commit, switch -c, merge, remote add, push.

## Codebase (all inside the final `<script>` in `index.html`)
1. **Git engine** — pure functions. `freshGit()` returns the repo model:
   `{ initialized, workingFiles, staged, commits, commitOrder, branches{main:null}, lanes,
   head, counter, remote, lastCmd }`. `runCommand(git, raw)` dispatches commands. Helpers:
   `genHash`, `tokenize`, `clone()` (structuredClone + JSON fallback), `L(text,type)`
   (terminal-line objects), `mix(a,b,t)` (blend two hex colors).
   - **Implemented:** init, status, add, commit, log, branch, switch/checkout, merge,
     `remote add origin`, push (+ help/ls/clear).
   - **Not yet implemented:** clone, fetch, pull, restore, reset, revert, diff, tag, stash.
     Any island using these needs the engine extended first.
2. **Data** — `CAMPAIGN` (array; one object per island: numeral/name/rank/guardian, `seed`,
   `intro`/`outro`, ASCII `map`, `stations[]`, `quiz[]`), plus `RANKS` and `PALETTES`
   (per-isle sky/base/rim/tile colors).
3. **Scene** — fixed isometric orthographic camera; layered terrain; persistent character.
4. **Runtime** — island load/save/resume, BFS movement + click-picking, render loop,
   station teach→console panel, flashcard boss, results/victory, HUD/boot.

### Runtime internals (verified by the harness)
- `currentIsle` — index of the current island. `loadIsland(i)` loads island `i` and
  (re)assigns both `IS` and `currentIsle`.
- `IS` — the **live per-island state object** (reassigned by `loadIsland`, so read it via a
  getter/closure, never a one-time snapshot). Holds the station list, hero tile, and the
  `complete` / gate-open flags.
- Station flow: `openStation(i)` → `toConsole()` → `submitStation(cmd)` → `stationSolved`
  flag → `advanceStation()`.
- Boss: `startBoss()`, `choose(idx)`, `bossActive` flag, `bq` (questions), `bIdx` (current
  index), `nextQ()`, `endBoss(win)`, HP via `getHp()`. A per-answer `setTimeout(~1250ms)`
  and a `setInterval` (`qTimer`, cleared synchronously by `resolve()`) drive pacing.
- Transition: `resultAction()` advances to the next island (calls `loadIsland(nxt)`) or
  fires the victory screen on the final island.

## Conventions & gotchas (real bugs — don't re-break)
- **Layered terrain:** purple **base** slab → coral **rim** slab → cream **tile caps**
  (cap gaps reveal the rim as grid lines). `CAP_TOP=0.66`, `RIM_TOP=0.58`, `BASE_TOP=0.2`.
  Structures sit at cap top. Walls (`#`) are short non-walkable blocks that gate the guardian.
- **Occlusion rule (map layout):** the camera is a fixed iso angle, so a tall object hides
  any tile on the diagonal between it and the camera. **Keep the guardian + its gating walls
  (`#`) at the FAR/top edge and put runes in the open mid-field**, or a rune-click hits the
  wall. Give each isle a distinct diamond layout (so far: diagonal / square / row).
- **Character is constant** across isles (white robe, orange hat). Each isle gets its own
  `PALETTE`; game-object colors stay fixed: gate magenta, guardian teal, diamonds
  cyan (dormant) → gold (active) → green (done), monument gold.
- **Lights are restrained** (hemi ~0.5, key ~0.82, rim ~0.22) so cream tiles don't blow out
  to white. Don't crank them.
- **Flashcards** reshuffle card order AND the 4 options at render time (correct answer lands
  evenly A/B/C/D). When adding cards, the `answer` index just points at the correct option;
  the runtime reshuffles.
- **Hidden overlays must be fully inert** (`visibility:hidden` + `pointer-events:none` on the
  element AND all children) or an invisible button eats clicks.
- **Persistence:** progress is saved to **`localStorage`** (key `gitquest:save:v1`) via
  `hasStore` / `persist` / `readSave` / `clearSave`; survives a refresh. `hasStore()` returns
  false under Node, so the harness runs in-memory.

## Testing & deploy
- **Logic:** `node harness3.js` — `stubs.js` fakes THREE + the DOM, boots the **real** game,
  and drives all 3 islands' stations + bosses + transitions + victory + the flashcard
  answer-slot distribution (32 checks). It loads the game via
  `new Function(src + 'return {…}')` to reach internals, and uses **getter closures** for
  live state. **When adding an island, add one entry to the per-island solving-commands
  table at the top of `harness3.js`.** Caveat: the boss per-answer timer is hand-simulated
  in the harness, so a change to the boss answer-callback *timing* won't be auto-caught.
- **Storage test:** `node harness-storage.js` — localStorage / Node-degradation checks.
- **Visual:** open `index.html` in a browser. Neither Claude nor Claude Code can see the
  rendered 3D — verify visuals by asking the user.
- **Deploy:** `git push` to `main`.

## Roadmap
- **Phase 0 (done):** localStorage persistence.
- **Phase 1 — Isle IV: Undo & Recover** (restore / reset / revert) — *Warden of Second Chances*.
- **Phase 2 — Isle V: Collaboration** (clone / fetch / pull) — *The Envoy*.
- **Phase 3 — Isle VI: Inspect & Mark** (log / diff / tag) — *The Loremaster*; **final isle → rank Git Sage**.

**Per-island recipe:** (a) extend the engine with the island's commands + add a `git help`
line, with a harness check; (b) add the `CAMPAIGN` entry + ASCII map (apply the occlusion
rule) + `PALETTES` entry + `stations[]` + `quiz[]`; (c) update `RANKS` so Git Sage lands on
the final island; (d) add the island's solving commands to the `harness3.js` table and run
`node harness3.js`; (e) user eyeballs it locally; (f) push.

**Rank ladder target:**
`["Wanderer","Apprentice","Committer","Merge Master","Remote Rider","Mender","Collaborator","Git Sage"]`
— I→Committer, II→Merge Master, III→Remote Rider, IV→Mender, V→Collaborator, VI→Git Sage
(final). The victory screen fires on the last `CAMPAIGN` entry automatically.

Island content + flashcards for IV–VI are pre-written in the project handoff doc; pull from
there when building each.

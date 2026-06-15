# Git Quest — Architecture & Design Document

*An isometric, Monument Valley-inspired adventure that teaches Git & GitHub by playing.*

---

## 1. Vision & pillars

You explore calm, dreamlike islands as a small wanderer. On each island you **solve the lesson by typing real Git commands** at a terminal shrine — the world physically responds as your repository takes shape — and then **defeat the island's guardian by answering flashcards against the clock**. Clear all fourteen islands to go from "what's a repo?" to rebasing like a pro, and post your run to a global leaderboard.

**Three design pillars** (every decision serves these):

1. **Learn by doing, not reading.** The core verb is *typing real Git*. No walls of text — you perform the actual workflow and watch it work.
2. **Calm, beautiful exploration.** Monument Valley's serenity: soft dusk palette, flat-shaded impossible architecture, unhurried movement, deliberate camera.
3. **Earned mastery.** Boss flashcards under time pressure turn recall into a skill, and the leaderboard gives it stakes.

---

## 2. Core gameplay loop (per island)

```
   ┌────────────────────────────────────────────────────────────┐
   │  EXPLORE        TERMINAL SHRINE        GATE         GUARDIAN │
   │  tap-to-move →  type real git to  →  unlocks  →  flashcard   │
   │  the wanderer   complete objectives   when repo    boss on   │
   │  walks the      (the commit monument  reaches      a timer   │
   │  island         grows as you go)      goal state             │
   └────────────────────────────────────────────────────────────┘
                                                          │
                                   win → rank up, score, sail to next island
```

1. **Explore.** You control the wanderer and tap where to walk. The island has a few points of interest: the terminal shrine, lore stones (optional flavor), and the guardian's gate.
2. **The terminal shrine** — *this single station is the learning, the puzzle, and the practice at once.* Stepping onto it opens a console. You type real Git commands (`git init`, `git add`, `git commit`…) that run against a simulated repository. Each lesson has **ordered objectives**; as you complete them, the **commit monument** in the scene grows and the guardian's gate unlocks. Hints are available per objective. Free typing is encouraged — `help`, `git log`, experimentation all work.
3. **The guardian.** Once the gate is open, walk to the guardian to start the **boss fight**: shuffled flashcards from that lesson, on a countdown, with guardian + heart HP, time and streak bonuses.
4. **Reward.** Win → new rank, score added, the bridge to the next island appears.

This loop satisfies every requirement: *control a character* (explore), *move around a map* (tap-to-move), *solve puzzles while learning* (terminal objectives), *type and practice Git* (the console), *fight bosses with flashcards* (the guardian).

---

## 3. The big reuse: the original terminal engine

The original 2D Git Quest already contains a complete, framework-agnostic **Git simulator** — the part you liked. It is a set of pure functions with no React or DOM dependencies:

- `freshGit()` → a new repo state object (`workingFiles`, `staged`, `commits`, `commitOrder`, `branches`, `head`, `remote`, `ignore`, `stash`, `tags`, …).
- `runCommand(git, rawString)` → `{ git, lines }` — parses and executes a typed command, returning the new state and terminal output lines.
- Supports the full curriculum: `init, status, add, commit, log, branch, switch/checkout, merge, remote, push, pull, clone, restore, reset, revert, stash, tag, rebase, config, diff`, plus `echo "…" > .gitignore`, `ls`, `help`, `clear`.
- Helpers: `genHash`, `tokenize`, `ancestry`, `isIgnored`.

**This ports directly** into `src/engine/git.js` with zero gameplay rewrite. The 3D game wraps it in a new console UI and drives the world from its state. The per-lesson **objectives** (ordered `check(git, snap)` predicates) also port directly — they already exist for all 14 lessons.

> Implication: the hardest part of "practice typing Git" is already solved. Phase 1 is mostly *integration*, not invention.

---

## 4. Movement system (tap-to-move)

**Grid.** Each island is authored as a 2D array of tiles. Tiles carry a type (`walkable`, `wall`, `water`, `shrine`, `gate`, `guardian`, `spawn`, `prop`) and an optional height for steps/elevation.

**Tap to move.** A tap raycasts to the tapped tile. If it's walkable, a **breadth-first search** over the walkable grid finds the shortest path; the wanderer then tweens smoothly waypoint-to-waypoint, turning to face travel direction. A soft ring pulses at the tapped destination (very MV).

**Interaction.** Arriving on (or adjacent to) a tagged tile fires its trigger: the shrine opens the terminal; the guardian tile (once the gate is open) starts the boss; lore stones show a one-line caption.

**Coordinates.** `tile(col,row) → world(x,y,z)` = `(col*TILE, heightOf(tile), row*TILE)`. One shared helper module owns this mapping so geometry, raycasting, and pathfinding agree.

**Camera.** Fixed isometric orthographic for small islands; gentle damped follow if a map is larger than the viewport. (Monument Valley keeps the camera composed — we avoid free-orbit.)

---

## 5. Boss fight (already built — keep)

Already implemented and working: shuffled flashcards, a countdown ring, guardian HP + player hearts, correct answers damage the guardian, wrong/timeout costs a heart, score = base + time bonus + streak bonus. On victory you can name yourself and post to the leaderboard. This stays essentially as-is; only its entry point changes (triggered by reaching the guardian instead of a button).

---

## 6. Scoring & leaderboard (plumbing already built)

- **Run score** = boss score (time + streak) **+** a small *clarity bonus* for solving the terminal puzzle with few hints / few wrong commands. (Optional; encourages real understanding.)
- Posts to a **Vercel serverless function backed by Upstash Redis** (a sorted set — `ZADD` best score, `ZRANGE` top N). Already implemented in `api/leaderboard.js`, with a local-device fallback so the game runs offline during dev.

---

## 7. World & progression

- **14 islands = 14 lessons**, in two arcs: **Fundamentals** (1–8: init → collaboration) and **Advanced** (9–14: ignore, undo, stash, tags, rebase, pro habits).
- **Progress gates** the next island; your **rank** climbs with each clear (Wanderer → … → Git Sage).
- **World map / island-hopping hub** (Phase 2): the islands float in the dusk along a path; cleared ones lit, the next one beckoning, later ones silhouetted. For the Phase 1 slice, a single island stands alone.
- **Save/resume:** progress, rank, score, and player name persist (localStorage now; can sync to the cloud later).

---

## 8. Technical architecture

**Stack:** Vite · React 19 · React Three Fiber v9 · drei · three · (Vercel serverless + Upstash for the leaderboard). No engine framework needed beyond this.

**Proposed module map:**

```
src/
  main.jsx
  App.jsx                 # top-level screen/state machine
  state/
    gameStore.js          # central store: screen, progress, score, name, git state, save/load
  engine/
    git.js                # PORTED pure Git simulator (freshGit, runCommand, helpers)
  data/
    lessons.js            # teaching content + quiz  (exists)
    objectives.js         # per-lesson ordered terminal objectives (port from original)
    maps.js               # per-lesson tile maps (grid + spawn/shrine/gate/guardian/props)
  game/
    GameCanvas.jsx        # the shared <Canvas>: iso camera, lights, ground
    Island.jsx            # builds island geometry from a map definition
    Character.jsx         # the wanderer + movement tween
    movement.js           # grid math + BFS pathfinding + tile↔world coords
    Shrine.jsx            # terminal-shrine object + arrival trigger
    Guardian.jsx          # boss gate/guardian object
    CommitMonument.jsx    # 3D structure that grows from the live commit graph
    theme.js              # palette + ranks  (exists)
  ui/
    TitleScreen.jsx
    Hud.jsx               # rank, progress, leaderboard button
    Terminal.jsx          # console overlay driving engine/git.js + objectives + hints
    Lore.jsx              # optional prose drawer (reuses lesson.content blocks)
    BossFight.jsx         # flashcards  (exists)
    Leaderboard.jsx       # (exists)
  styles.css
api/
  leaderboard.js          # Upstash-backed serverless fn  (exists)
```

**State management.** Coordinating the 3D scene, the terminal, and the UI is cleaner with a small central store than prop-drilling. **Recommendation: Zustand** — it's the standard React Three Fiber companion, ~1KB, and lets both meshes and DOM read/update the same state without re-render storms. (Alternative: React context + reducer, no new dependency, slightly more boilerplate.)

**Screen / state machine:**

```
title → world(explore) ──tap shrine──▶ terminal(overlay on world)
                                            │ objectives complete
                                            ▼
world(gate open) ──tap guardian──▶ boss ──win──▶ result ──▶ world(next island)
                                          └─lose─▶ retry
                                                          all 14 cleared → victory
```

The **terminal is an overlay** over the still-visible world (so you see the monument grow as you type); the **boss is a focused screen**.

---

## 9. Data formats

**Objective** (ported; drives the terminal puzzle):
```js
{ text: "Save your snapshot with git commit",
  hint: 'git commit -m "Add homepage"',
  check: (git, snap) => git.commitOrder.length > snap.commits }
```
A lesson's objectives are an ordered array; completing the last one opens the gate.

**Tile map** (new; authored per island). Compact ASCII legend + metadata, e.g.:
```
legend:  . walkable   # wall   ~ water   S spawn   T terminal shrine   G guardian   x prop
grid:
  ~ ~ ~ ~ ~ ~ ~
  ~ . . . T . ~
  ~ . # . . . ~
  ~ S . . . G ~
  ~ . . x . . ~
  ~ ~ ~ ~ ~ ~ ~
meta: { tier: "fundamentals", elevation: { "T": 1 } }
```
A tiny parser turns this into tile objects + positions for geometry, pathfinding, and triggers. Hand-authoring 14 small maps is very manageable, and the format is friendly to tweak in Claude Code.

**Engine API** (ported, stable): `freshGit()`, `runCommand(git, raw) → {git, lines}`.

---

## 10. Art direction (established)

Monument Valley dusk, already encoded in `theme.js`: peach→periwinkle sky gradient, warm sand architecture, terracotta/teal accents, plum shadows, a single gold light for objectives. Tiles are soft `RoundedBox` stepping-stones with flat shading and long soft shadows. The **commit monument** rises as a glowing structure keyed to the commit graph; the **guardian** is the faceted crystal-golem. A soft tap-ring marks your destination. Ambient motion is gentle (a slow "breathing" sway), never a spin. Bloom and particles come in the polish phase.

---

## 11. Build roadmap

**Phase 0 — Foundation (done).** Static island, boss fight, leaderboard plumbing, lessons + quiz data, deploy path, dusk look.

**Phase 1 — Vertical slice (next).** *One island, fully playable end to end:*
- tap-to-move wanderer on a real tile map;
- terminal shrine wired to the ported engine + that lesson's objectives;
- commit monument grows; gate unlocks on completion;
- walk to guardian → existing boss fight → result → leaderboard.
This is where we lock the *feel*. Target lesson: an early command lesson (e.g. "Starting a Repository" / "Saving Your Work") so the terminal does meaningful work.

**Phase 2 — Templating.** Author maps + objectives for all 14; world-map island hopping; progression gating; per-island geometry variety.

**Phase 3 — Juice & polish.** Commit-monument animations, sound, particles, postprocessing bloom, victory camera sweep, onboarding/tutorial, full accessibility pass (keyboard fallback, reduced motion, focus states).

**Phase 4 — Ship.** Deploy to `kaziahmed.net` — subdomain `gitquest.kaziahmed.net` (simplest) or the `/git-quest` path via a Vercel rewrite — and connect Upstash via the Vercel Marketplace (auto-injects env vars). Every `git push` redeploys.

---

## 12. Open decisions (need your call before/at Phase 1)

1. **State management:** Zustand (recommended) vs React context. Affects boilerplate, not features.
2. **New dependency budget:** OK to add Zustand (~1KB) and later `@react-three/postprocessing` for bloom? (Both are standard, safe.)
3. **Terminal placement:** overlay on the world (recommended — you watch the monument grow) vs a dedicated screen.
4. **Map ambition for the slice:** flat-ish first island (fast, robust) vs lean into impossible-geometry/elevation immediately (prettier, more finicky). Recommendation: flat-ish for the slice, MV illusions in Phase 3.
5. **Clarity bonus** in scoring: include the "few hints / few wrong commands" bonus now, or keep scoring boss-only for the slice?

---

## 13. Risks & mitigations

- **Feel of tap-to-move / pathfinding** is the main unknown → that's exactly why Phase 1 is a single playable slice before templating.
- **Scope creep across 14 islands** → the map + objective formats make islands data, not bespoke code; author once the engine is proven.
- **3D + DOM state coordination** → the central store (Zustand) keeps the terminal, HUD, and scene in sync cleanly.
- **One-shot build quality** → build the slice, play it, iterate in Claude Code against the live dev server before scaling.

---

*Next step after sign-off: build the Phase 1 vertical slice (one fully-playable island). Bring this doc into the repo (e.g. `DESIGN.md`) so Claude Code can use it as shared context while building.*

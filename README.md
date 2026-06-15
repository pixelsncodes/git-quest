# Git Quest — 3D isometric edition

A Monument Valley-inspired isometric adventure that teaches Git & GitHub. Climb
impossible islands, then beat each island's guardian by answering its flashcards
before the timer runs out. Scores go to a global leaderboard.

Built with **Vite + React 19 + React Three Fiber (three.js)**. Leaderboard runs on
a **Vercel serverless function backed by Upstash Redis**. Deploys to Vercel from
GitHub; works under a subdomain (`gitquest.kaziahmed.net`) or a path
(`kaziahmed.net/git-quest`).

---

## What's in this vertical slice

- A fully styled isometric world (orthographic camera, dusk palette, soft shadows,
  a tower + impossible staircase + arch, a glowing objective crystal, a wandering
  character, distant locked islands).
- The complete 14-lesson curriculum + 53 flashcards already ported into
  `src/data/lessons.js`. The **current** island is fully playable; clearing it
  advances you to the next.
- A timed **boss fight**: shuffled flashcards, a countdown ring, guardian + heart
  HP, scoring with time and streak bonuses.
- A **leaderboard** that uses Upstash in the cloud and falls back to a local
  per-device board automatically, so it's always playable — even before you wire
  up the backend.

> This is the foundation. The 3D world currently renders one island at a time;
> the natural next step is a fly-between-islands world map. See "Extending" below.

---

## 1. Run it locally

Requires Node 18+ (Node 20 LTS recommended).

```bash
npm install
npm run dev
```

Open http://localhost:5173. The leaderboard will say **offline · this device** —
that's expected until you connect Upstash (step 4). Everything else works.

```bash
npm run build     # production build into dist/
npm run preview   # preview the production build locally
```

---

## 2. Push to a new GitHub repo

```bash
git init
git add .
git commit -m "Git Quest: isometric edition (vertical slice)"
git branch -M main
git remote add origin https://github.com/<your-username>/git-quest.git
git push -u origin main
```

(Create the empty `git-quest` repo on GitHub first, without a README so the push
isn't rejected.)

---

## 3. Import to Vercel

1. In the Vercel dashboard → **Add New… → Project** → import your `git-quest` repo.
2. Vercel auto-detects Vite. Leave the defaults (Build: `vite build`, Output: `dist`).
3. Deploy. You'll get a URL like `https://git-quest-xxxx.vercel.app`.

Every `git push` to `main` now redeploys automatically.

---

## 4. Add the leaderboard (Upstash Redis, free)

1. In your Vercel project → **Storage** → **Connect Database** → choose **Upstash**
   (Marketplace) → create a Redis database.
2. Vercel automatically injects `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN` into the project as environment variables.
3. **Redeploy** (or push a commit) so the serverless function picks them up.

That's it — the leaderboard tag in-game flips to **live · global**.

**To test the live leaderboard locally too:**

```bash
npm i -g vercel        # if you don't have the CLI
vercel link            # link this folder to the Vercel project
vercel env pull .env.local
npm run dev
```

Free tier: 256 MB and 500K commands/month — a single play uses only a handful of
Redis commands, so it's effectively free for a personal site. You can set a budget
cap in the Upstash dashboard to guarantee you're never billed.

---

## 5. Put it on kaziahmed.net

You do **not** put this project inside your kaziahmed.net repo. Keep it separate;
expose it from your main domain one of two ways.

### Option A — subdomain `gitquest.kaziahmed.net` (simplest)

In the **git-quest** Vercel project → **Settings → Domains** → add
`gitquest.kaziahmed.net`. Add the CNAME record Vercel shows you at your DNS
provider. Done. No base-path changes needed.

### Option B — path `kaziahmed.net/git-quest`

1. In the **git-quest** Vercel project → **Settings → Environment Variables**, add
   `BASE_PATH = /git-quest/` and redeploy. (This makes Vite emit assets under
   `/git-quest/`; the app reads the API relative to that base automatically.)
2. In your **kaziahmed.net** project, add these rewrites to its `vercel.json`
   (API rule first so it isn't swallowed):

   ```json
   {
     "rewrites": [
       { "source": "/git-quest/api/:path*", "destination": "https://git-quest-xxxx.vercel.app/api/:path*" },
       { "source": "/git-quest/:path*",     "destination": "https://git-quest-xxxx.vercel.app/git-quest/:path*" },
       { "source": "/git-quest",            "destination": "https://git-quest-xxxx.vercel.app/git-quest/" }
     ]
   }
   ```

   Replace `git-quest-xxxx.vercel.app` with your actual git-quest deployment URL.
   Push kaziahmed.net, and `kaziahmed.net/git-quest` now serves the game.

If your main site is Next.js, you can instead put the same rules under `rewrites`
in `next.config.js` — both work identically on Vercel.

---

## Project structure

```
git-quest/
├── api/leaderboard.js      Vercel serverless fn (Upstash Redis sorted set)
├── src/
│   ├── App.jsx             screen flow: title → world → boss → result → leaderboard
│   ├── game/
│   │   ├── World.jsx       the R3F canvas, iso camera, lighting
│   │   ├── Island.jsx      modular MV-style island geometry
│   │   ├── Objective.jsx   the glowing crystal that starts the boss fight
│   │   ├── Player.jsx      the wandering character
│   │   └── theme.js        palette + ranks
│   ├── ui/
│   │   ├── BossFight.jsx   timed flashcard combat
│   │   └── Leaderboard.jsx
│   ├── lib/api.js          leaderboard client + offline fallback
│   └── data/lessons.js     14 lessons, 53 flashcards
└── vite.config.js          base path is env-driven (BASE_PATH)
```

---

## Extending (next steps)

- **World map:** render all 14 islands along a floating path and let the camera
  fly between them; lock the ones past your progress.
- **Per-island geometry:** vary `Island.jsx` by lesson so each feels distinct.
- **Juice:** add `@react-three/postprocessing` for real bloom, particle dust,
  a victory camera sweep, and sound.
- **Difficulty curve:** shorten the per-question timer on advanced islands
  (already slightly shorter for the `advanced` tier).

---

Made by porting the original Git Quest learning game into a 3D adventure.
The curriculum content is unchanged — only the way you play it.

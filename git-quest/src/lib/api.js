// Leaderboard client.
// Talks to the Vercel serverless function at <base>api/leaderboard.
// If that endpoint isn't available yet (e.g. local dev before Upstash is wired,
// or `vite preview` without serverless), it transparently falls back to a
// localStorage board so the game is always playable.

const ENDPOINT = `${import.meta.env.BASE_URL}api/leaderboard`;
const LOCAL_KEY = "gitquest:leaderboard:local";

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeLocal(rows) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}
function localTop(n = 20) {
  return readLocal()
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

export async function fetchLeaderboard(limit = 20) {
  try {
    const res = await fetch(`${ENDPOINT}?limit=${limit}`, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { source: "cloud", rows: data.rows || [] };
  } catch {
    return { source: "local", rows: localTop(limit) };
  }
}

export async function submitScore(name, score) {
  const clean = (name || "Anonymous").trim().slice(0, 18) || "Anonymous";
  const payload = { name: clean, score: Math.round(score) };
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { source: "cloud", rank: data.rank, rows: data.rows || [] };
  } catch {
    // local fallback: keep only the player's best
    const rows = readLocal();
    const existing = rows.find((r) => r.name === clean);
    if (existing) existing.score = Math.max(existing.score, payload.score);
    else rows.push({ ...payload, ts: Date.now() });
    writeLocal(rows);
    const sorted = rows.sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex((r) => r.name === clean) + 1;
    return { source: "local", rank, rows: sorted.slice(0, 20) };
  }
}

// Vercel Serverless Function: /api/leaderboard
//
// Backed by an Upstash Redis sorted set — the textbook leaderboard structure.
// ZADD with GT keeps each player's BEST score; ZRANGE (reversed) reads the top N
// in one call; ZREVRANK gives a player's rank.
//
// Credentials (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN) are injected
// automatically when you add the Upstash integration from the Vercel Marketplace.
// For local dev, put them in .env.local (see .env.example).

import { Redis } from "@upstash/redis";

const KEY = "gitquest:leaderboard";
const MAX_NAME = 18;

function getRedis() {
  // Throws if env vars are missing — handled below so the client can fall back.
  return Redis.fromEnv();
}

async function topRows(redis, limit) {
  // returns [{ member, score }, ...] highest first
  const raw = await redis.zrange(KEY, 0, limit - 1, { rev: true, withScores: true });
  const rows = [];
  for (let i = 0; i < raw.length; i += 2) {
    rows.push({ name: String(raw[i]), score: Number(raw[i + 1]) });
  }
  return rows;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  let redis;
  try {
    redis = getRedis();
  } catch {
    return res.status(503).json({ error: "leaderboard not configured", rows: [] });
  }

  try {
    if (req.method === "GET") {
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const rows = await topRows(redis, limit);
      return res.status(200).json({ rows });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const name = String(body.name || "Anonymous").trim().slice(0, MAX_NAME) || "Anonymous";
      const score = Math.max(0, Math.min(Math.round(Number(body.score) || 0), 10_000_000));

      // keep the player's best score only
      await redis.zadd(KEY, { gt: true }, { score, member: name });

      const revrank = await redis.zrevrank(KEY, name); // 0-based, null if absent
      const rank = revrank === null || revrank === undefined ? null : revrank + 1;
      const rows = await topRows(redis, 20);
      return res.status(200).json({ rank, rows });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: "leaderboard error", detail: String(err?.message || err), rows: [] });
  }
}

import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../lib/api";

export default function Leaderboard({ highlightName, initialRows, source, onClose }) {
  const [rows, setRows] = useState(initialRows || []);
  const [src, setSrc] = useState(source || null);
  const [loading, setLoading] = useState(!initialRows);

  useEffect(() => {
    if (initialRows) return;
    let alive = true;
    (async () => {
      const { rows, source } = await fetchLeaderboard(20);
      if (alive) { setRows(rows); setSrc(source); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [initialRows]);

  return (
    <div className="lb">
      <div className="lb-head">
        <h2>Leaderboard</h2>
        {src === "local" && <span className="lb-tag">offline · this device</span>}
        {src === "cloud" && <span className="lb-tag cloud">live · global</span>}
      </div>

      {loading ? (
        <p className="lb-empty">Reading the scrolls…</p>
      ) : rows.length === 0 ? (
        <p className="lb-empty">No scores yet. Be the first to topple a guardian.</p>
      ) : (
        <ol className="lb-list">
          {rows.map((r, i) => (
            <li key={r.name + i} className={r.name === highlightName ? "me" : ""}>
              <span className="lb-rank">{i + 1}</span>
              <span className="lb-name">{r.name}</span>
              <span className="lb-score">{Number(r.score).toLocaleString()}</span>
            </li>
          ))}
        </ol>
      )}

      <button className="btn ghost" onClick={onClose}>Back to the map</button>
    </div>
  );
}

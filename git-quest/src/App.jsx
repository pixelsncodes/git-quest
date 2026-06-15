import { useEffect, useState } from "react";
import World from "./game/World";
import Lesson from "./ui/Lesson";
import LessonTerminal from "./ui/LessonTerminal";
import BossFight from "./ui/BossFight";
import { freshGit } from "./engine/git.js";
import Leaderboard from "./ui/Leaderboard";
import { LESSONS, TOTAL_LESSONS } from "./data/lessons";
import { RANKS } from "./game/theme";
import { submitScore } from "./lib/api";

const SAVE = "gitquest:save";

function loadSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE) || "{}");
  } catch {
    return {};
  }
}

export default function App() {
  const saved = loadSave();
  const [screen, setScreen] = useState("title"); // title | world | boss | result | leaderboard
  const [progress, setProgress] = useState(saved.progress || 0); // islands cleared
  const [name, setName] = useState(saved.name || "");
  const [totalScore, setTotalScore] = useState(saved.totalScore || 0);
  const [result, setResult] = useState(null);
  const [lbState, setLbState] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [git, setGit] = useState(freshGit);

  const lessonIdx = Math.min(progress, TOTAL_LESSONS - 1);
  const lesson = LESSONS[lessonIdx];
  const rank = RANKS[Math.min(progress, RANKS.length - 1)];
  const finished = progress >= TOTAL_LESSONS;

  useEffect(() => {
    localStorage.setItem(SAVE, JSON.stringify({ progress, name, totalScore }));
  }, [progress, name, totalScore]);

  function startLesson() { setScreen("lesson"); }
  function startBoss() { setScreen("boss"); }

  function onBossComplete(r) {
    setResult(r);
    if (r.won) setTotalScore((t) => t + r.score);
    setScreen("result");
  }

  function advance() {
    if (result?.won) setProgress((p) => Math.min(p + 1, TOTAL_LESSONS));
    setResult(null);
    setScreen("world");
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await submitScore(name || "Anonymous", totalScore);
    setLbState({ rows: res.rows, source: res.source, rank: res.rank });
    setSubmitting(false);
    setScreen("leaderboard");
  }

  // ---------- TITLE ----------
  if (screen === "title") {
    return (
      <div className="screen title">
        <div className="title-sky" />
        <div className="title-inner">
          <p className="kicker">an isometric adventure for learning git</p>
          <h1 className="logo">Git&nbsp;Quest</h1>
          <p className="tagline">
            Climb impossible islands. Face each guardian. Win by answering its
            flashcards before the sand runs out — and carve your name into the leaderboard.
          </p>
          <div className="title-actions">
            <button className="btn primary" onClick={() => setScreen("world")}>
              {progress > 0 ? "Continue the climb" : "Begin the quest"}
            </button>
            <button className="btn ghost" onClick={() => { setLbState(null); setScreen("leaderboard"); }}>
              Leaderboard
            </button>
          </div>
          {progress > 0 && <p className="title-prog">{rank} · {progress}/{TOTAL_LESSONS} islands cleared</p>}
        </div>
      </div>
    );
  }

  // ---------- LEADERBOARD ----------
  if (screen === "leaderboard") {
    return (
      <Leaderboard
        highlightName={name}
        initialRows={lbState?.rows}
        source={lbState?.source}
        onClose={() => setScreen(progress > 0 ? "world" : "title")}
      />
    );
  }

  // ---------- LESSON (learn phase: interactive terminal) ----------
  if (screen === "lesson") {
    return <LessonTerminal key={lessonIdx} lesson={lesson} git={git} setGit={setGit} onReady={startBoss} onBack={() => setScreen("world")} />;
  }

  // ---------- BOSS ----------
  if (screen === "boss") {
    return <BossFight lesson={lesson} onComplete={onBossComplete} onFlee={() => setScreen("world")} />;
  }

  // ---------- RESULT ----------
  if (screen === "result" && result) {
    return (
      <div className={`screen result ${result.won ? "win" : "lose"}`}>
        <div className="result-inner">
          {result.won ? (
            <>
              <div className="result-badge">★</div>
              <h2>Guardian toppled</h2>
              <p className="result-sub">You cleared <b>{lesson.title}</b> and earned the rank of <b>{RANKS[Math.min(progress + 1, RANKS.length - 1)]}</b>.</p>
              <div className="result-stats">
                <div><span>{result.score.toLocaleString()}</span>this run</div>
                <div><span>{result.bestStreak}×</span>best streak</div>
                <div><span>{(totalScore).toLocaleString()}</span>total</div>
              </div>
              <div className="name-row">
                <input
                  value={name}
                  maxLength={18}
                  placeholder="Your name for the leaderboard"
                  onChange={(e) => setName(e.target.value)}
                />
                <button className="btn primary" disabled={submitting} onClick={handleSubmit}>
                  {submitting ? "Posting…" : "Post score"}
                </button>
              </div>
              <button className="btn ghost" onClick={advance}>
                {finished || progress + 1 >= TOTAL_LESSONS ? "Finish" : "On to the next island →"}
              </button>
            </>
          ) : (
            <>
              <div className="result-badge lose">✕</div>
              <h2>The guardian held</h2>
              <p className="result-sub">You ran out of hearts against <b>{lesson.title}</b>. Study the cards and try again — speed and streaks are everything.</p>
              <div className="title-actions">
                <button className="btn primary" onClick={startBoss}>Rematch</button>
                <button className="btn ghost" onClick={() => { setResult(null); setScreen("world"); }}>Back to the island</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ---------- WORLD ----------
  return (
    <div className="screen world">
      <World tier={lesson.tier} lessonTitle={lesson.title} onChallenge={startLesson} />

      <div className="hud">
        <button className="hud-brand" onClick={() => setScreen("title")}>Git Quest</button>
        <div className="hud-right">
          <button className="hud-btn" onClick={() => { setLbState(null); setScreen("leaderboard"); }}>Leaderboard</button>
          <div className="hud-rank"><b>{rank}</b><span>{progress}/{TOTAL_LESSONS}</span></div>
        </div>
      </div>

      <div className="island-card">
        <span className="island-eyebrow">{lesson.eyebrow}</span>
        <h2 className="island-title">{lesson.title}</h2>
        <p className="island-blurb">{lesson.blurb}</p>
        <div className="island-actions">
          <button className="btn primary" onClick={startLesson}>Study the lesson</button>
          <button className="btn ghost" onClick={startBoss}>Skip to guardian</button>
        </div>
        <p className="island-hint">Learn the concept, then beat the guardian's flashcards against the clock.</p>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";

const PLAYER_HP = 3;

// shuffle a copy
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// A faceted guardian that reacts to damage.
function Guardian({ hpPct, hit, tier }) {
  const color = tier === "advanced" ? "#7E72B8" : "#E08763";
  return (
    <svg className={`guardian ${hit ? "guardian--hit" : ""}`} viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
      <defs>
        <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7DD9A" />
          <stop offset="1" stopColor={color} />
        </linearGradient>
      </defs>
      <g style={{ opacity: 0.35 + 0.65 * hpPct, transition: "opacity .3s" }}>
        <polygon points="60,10 95,40 78,95 42,95 25,40" fill="url(#gd)" stroke="#4A3B6B" strokeWidth="2" />
        <polygon points="60,10 78,95 60,60" fill="#000" opacity="0.08" />
        <circle cx="48" cy="50" r="4" fill="#3A2F52" />
        <circle cx="72" cy="50" r="4" fill="#3A2F52" />
        <path d="M48 70 Q60 78 72 70" fill="none" stroke="#3A2F52" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function BossFight({ lesson, onComplete, onFlee }) {
  const timePerQ = lesson.tier === "advanced" ? 11 : 14;
  const bossMax = lesson.quiz.length;

  const queue = useRef(shuffled(lesson.quiz));
  const qIndex = useRef(0);

  const [card, setCard] = useState(queue.current[0]);
  const [order, setOrder] = useState(() => shuffled(lesson.quiz[0] ? lesson.quiz[0].options.map((_, i) => i) : []));
  const [bossHp, setBossHp] = useState(bossMax);
  const [playerHp, setPlayerHp] = useState(PLAYER_HP);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const scoreRef = useRef(0);
  const bestStreakRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState(timePerQ);
  const [picked, setPicked] = useState(null); // index chosen (original index)
  const [phase, setPhase] = useState("ask"); // ask | reveal
  const [hit, setHit] = useState(false);

  const tickRef = useRef(null);
  const prefersReduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // countdown
  useEffect(() => {
    if (phase !== "ask") return;
    setTimeLeft(timePerQ);
    const started = Date.now();
    tickRef.current = setInterval(() => {
      const left = timePerQ - (Date.now() - started) / 1000;
      if (left <= 0) {
        clearInterval(tickRef.current);
        setTimeLeft(0);
        resolve(null); // timeout = wrong
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, card]);

  function nextCard(nextBossHp, nextPlayerHp) {
    // win / lose checks happen in resolve(); here we just advance
    qIndex.current += 1;
    if (qIndex.current >= queue.current.length) {
      // reloop remaining attempts (boss still alive); reshuffle for variety
      queue.current = shuffled(lesson.quiz);
      qIndex.current = 0;
    }
    const c = queue.current[qIndex.current];
    setCard(c);
    setOrder(shuffled(c.options.map((_, i) => i)));
    setPicked(null);
    setPhase("ask");
  }

  function resolve(chosenIdx) {
    clearInterval(tickRef.current);
    if (phase === "reveal") return;
    const correct = chosenIdx === card.answer;
    setPicked(chosenIdx);
    setPhase("reveal");

    if (correct) {
      const remaining = Math.max(0, timeLeft);
      const timeBonus = Math.round((remaining / timePerQ) * 100);
      const newStreak = streak + 1;
      const streakBonus = Math.min(newStreak - 1, 6) * 25;
      const gained = 100 + timeBonus + streakBonus;
      const newBoss = Math.max(0, bossHp - 1);
      scoreRef.current += gained;
      setScore(scoreRef.current);
      setStreak(newStreak);
      bestStreakRef.current = Math.max(bestStreakRef.current, newStreak);
      setBestStreak(bestStreakRef.current);
      setBossHp(newBoss);
      setHit(true);
      setTimeout(() => setHit(false), 320);
      setTimeout(() => {
        if (newBoss <= 0) finish(true);
        else nextCard();
      }, prefersReduced ? 600 : 1400);
    } else {
      const newPlayer = Math.max(0, playerHp - 1);
      setPlayerHp(newPlayer);
      setStreak(0);
      setTimeout(() => {
        if (newPlayer <= 0) finish(false);
        else nextCard();
      }, prefersReduced ? 900 : 1900);
    }
  }

  function finish(won) {
    const finalScore = won ? scoreRef.current : Math.round(scoreRef.current * 0.5);
    onComplete({ won, score: finalScore, bestStreak: bestStreakRef.current });
  }

  const timePct = Math.max(0, timeLeft / timePerQ);
  const dash = 2 * Math.PI * 26;

  return (
    <div className="boss-screen">
      <div className="boss-grain" />
      <header className="boss-top">
        <button className="flee" onClick={onFlee}>← Retreat</button>
        <div className="boss-name">{lesson.badge} — Guardian of {lesson.title}</div>
        <div className="boss-score">{score.toLocaleString()} pts</div>
      </header>

      <div className="boss-stage">
        <Guardian hpPct={bossHp / bossMax} hit={hit} tier={lesson.tier} />
        <div className="bars">
          <div className="bar boss">
            <span className="bar-label">Guardian</span>
            <div className="bar-track"><span style={{ width: `${(bossHp / bossMax) * 100}%` }} className="bar-fill boss-fill" /></div>
          </div>
          <div className="bar you">
            <span className="bar-label">You</span>
            <div className="hearts">
              {Array.from({ length: PLAYER_HP }).map((_, i) => (
                <span key={i} className={`heart ${i < playerHp ? "" : "lost"}`}>♥</span>
              ))}
            </div>
          </div>
          {streak > 1 && <div className="streak">🔥 {streak} streak</div>}
        </div>
      </div>

      <div className="card-zone">
        <div className="timer-ring">
          <svg viewBox="0 0 60 60" width="56" height="56">
            <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="5" />
            <circle
              cx="30" cy="30" r="26" fill="none"
              stroke={timePct < 0.3 ? "#E0876B" : "#F4C95D"} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={dash} strokeDashoffset={dash * (1 - timePct)}
              transform="rotate(-90 30 30)"
              style={{ transition: "stroke-dashoffset .1s linear" }}
            />
          </svg>
          <span className="timer-num">{Math.ceil(timeLeft)}</span>
        </div>

        <h2 className="boss-q">{card.q}</h2>

        <div className="boss-opts">
          {order.map((origIdx) => {
            const isCorrect = origIdx === card.answer;
            const isPicked = picked === origIdx;
            let cls = "boss-opt";
            if (phase === "reveal") {
              if (isCorrect) cls += " correct";
              else if (isPicked) cls += " wrong";
              else cls += " dim";
            }
            return (
              <button
                key={origIdx}
                className={cls}
                disabled={phase === "reveal"}
                onClick={() => resolve(origIdx)}
              >
                {card.options[origIdx]}
              </button>
            );
          })}
        </div>

        {phase === "reveal" && (
          <p className={`boss-explain ${picked === card.answer ? "good" : "bad"}`}>
            {picked === card.answer ? "Direct hit! " : (picked === null ? "Too slow — " : "Blocked! ")}
            {card.explain}
          </p>
        )}
      </div>
    </div>
  );
}

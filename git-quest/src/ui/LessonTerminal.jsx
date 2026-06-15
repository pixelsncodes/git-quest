import { useState, useEffect, useRef } from "react";
import { runCommand } from "../engine/git.js";
import { getChallenge } from "../data/objectives.js";

/* ---- minimal icon set ---- */
const Icon = ({ name, size = 16 }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "branch") return (<svg {...p}><circle cx="6" cy="6" r="2.4" /><circle cx="6" cy="18" r="2.4" /><circle cx="18" cy="8" r="2.4" /><path d="M6 8.4v7.2M18 10.4c0 4-6 1.6-6 5.6" /></svg>);
  if (name === "book") return (<svg {...p}><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" /><path d="M9 3v18" /></svg>);
  if (name === "check") return (<svg {...p}><path d="M5 12l4 4L19 6" /></svg>);
  if (name === "lock") return (<svg {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
  if (name === "arrow") return (<svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
  return null;
};

/* ---- live commit graph (ported) ---- */
function CommitGraph({ git }) {
  const ids = git.commitOrder;
  const NODE = 58, LANEH = 52, PAD = 30;
  const laneColors = ["#3FB950", "#45C4D6", "#A371F7", "#E3B341"];
  const maxLane = Math.max(0, ...Object.values(git.lanes));
  const width = Math.max(220, PAD * 2 + Math.max(1, ids.length) * NODE);
  const height = PAD * 2 + maxLane * LANEH + 30 + (Object.keys(git.tags || {}).length ? 24 : 0);
  const cx = (c) => PAD + c.order * NODE + 14;
  const cy = (c) => PAD + (git.lanes[c.branch] ?? 0) * LANEH;
  const colorFor = (c) => (c.merge ? "#F05133" : laneColors[(git.lanes[c.branch] ?? 0) % laneColors.length]);
  const tipBy = {};
  Object.entries(git.branches).forEach(([b, tip]) => { if (tip) (tipBy[tip] = tipBy[tip] || []).push(b); });
  const tagsBy = {};
  Object.entries(git.tags || {}).forEach(([n, id]) => { if (id) (tagsBy[id] = tagsBy[id] || []).push(n); });

  if (!git.initialized)
    return (<div className="graph-empty"><Icon name="branch" size={24} /><span>No repository yet.<br />Run <code>git init</code> to begin.</span></div>);
  if (ids.length === 0)
    return (<div className="graph-empty"><Icon name="book" size={24} /><span>Repository ready.<br />Your first commit will appear here.</span></div>);

  return (
    <div className="graph-scroll">
      <svg width={width} height={height} className="graph-svg" role="img" aria-label="Commit history graph">
        {ids.map((id) => {
          const c = git.commits[id];
          return c.parents.map((pid, i) => {
            const pp = git.commits[pid];
            if (!pp) return null;
            return (<path key={id + pid + i} d={`M ${cx(pp)} ${cy(pp)} C ${cx(pp) + NODE / 2} ${cy(pp)}, ${cx(c) - NODE / 2} ${cy(c)}, ${cx(c)} ${cy(c)}`} stroke={c.merge && i === 1 ? "#F05133" : colorFor(pp)} strokeWidth="2.5" fill="none" opacity="0.7" />);
          });
        })}
        {ids.map((id) => {
          const c = git.commits[id];
          const tips = tipBy[id] || [];
          return (
            <g key={id} className="graph-node">
              <circle cx={cx(c)} cy={cy(c)} r={c.merge ? 11 : 9} fill="#11141C" stroke={colorFor(c)} strokeWidth="3" />
              {c.merge && <circle cx={cx(c)} cy={cy(c)} r="3.5" fill="#F05133" />}
              <text x={cx(c)} y={cy(c) + 26} textAnchor="middle" className="graph-hash">{c.id}</text>
              {(tagsBy[id] || []).map((tg, ti) => (
                <g key={tg} transform={`translate(${cx(c)}, ${cy(c) + 38 + ti * 15})`}>
                  <rect x={-tg.length * 3.3 - 7} y={-8} width={tg.length * 6.6 + 14} height={15} rx={4} fill="#1C2230" stroke="#E3B341" strokeWidth="1.2" />
                  <text x={0} y={3} textAnchor="middle" className="graph-branch" fill="#E3B341">{tg}</text>
                </g>
              ))}
              {tips.map((b, bi) => (
                <g key={b} transform={`translate(${cx(c)}, ${cy(c) - 18 - bi * 17})`}>
                  <rect x={-b.length * 3.6 - 8} y={-9} width={b.length * 7.2 + 16} height={17} rx={8.5} fill={git.head === b ? colorFor(c) : "#1C2230"} stroke={colorFor(c)} strokeWidth="1.5" />
                  <text x={0} y={3} textAnchor="middle" className="graph-branch" fill={git.head === b ? "#0B0D12" : colorFor(c)}>{git.head === b ? `${b} ←` : b}</text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---- the practice terminal (ported) ---- */
function Terminal({ git, setGit, onCommand }) {
  const [history, setHistory] = useState([{ text: "Practice terminal — type real Git commands. Try `help` if you're stuck.", type: "muted" }]);
  const [value, setValue] = useState("");
  const [cmdHist, setCmdHist] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [history]);

  const submit = (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    const { git: newGit, lines } = runCommand(git, cmd);
    if (lines.some((l) => l.__clear)) setHistory([]);
    else setHistory((h) => [...h, { text: cmd, type: "cmd" }, ...lines]);
    setGit(newGit);
    onCommand && onCommand(newGit, cmd);
    setCmdHist((h) => [...h, cmd]);
    setHistIdx(-1);
    setValue("");
  };

  const onKey = (e) => {
    if (e.key === "Enter") submit(value);
    else if (e.key === "ArrowUp") { e.preventDefault(); if (!cmdHist.length) return; const idx = histIdx < 0 ? cmdHist.length - 1 : Math.max(0, histIdx - 1); setHistIdx(idx); setValue(cmdHist[idx]); }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (histIdx < 0) return; const idx = histIdx + 1; if (idx >= cmdHist.length) { setHistIdx(-1); setValue(""); } else { setHistIdx(idx); setValue(cmdHist[idx]); } }
  };

  return (
    <div className="term" onClick={() => inputRef.current && inputRef.current.focus()}>
      <div className="term-bar"><span className="dot r" /><span className="dot y" /><span className="dot g" /><span className="term-title">bash — my-site</span></div>
      <div className="term-body" ref={bodyRef}>
        {history.map((l, i) => (
          <div key={i} className={`tline ${l.type}`}>{l.type === "cmd" ? <span className="prompt">$ </span> : null}{l.text || "\u00A0"}</div>
        ))}
        <div className="tline input-line">
          <span className="prompt">$ </span>
          <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKey} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" placeholder="type a git command…" aria-label="terminal input" />
        </div>
      </div>
    </div>
  );
}

/* ---- lesson notes (optional lore drawer) ---- */
function Notes({ content }) {
  return (
    <div className="notes-drawer">
      {content.map((b, i) => {
        if (b.p) return <p key={i} className="nd-p">{b.p}</p>;
        if (b.h) return <h4 key={i} className="nd-h">{b.h}</h4>;
        if (b.analogy) return <div key={i} className="nd-callout"><b>Picture it · </b>{b.analogy}</div>;
        if (b.tip) return <div key={i} className="nd-callout tip"><b>Tip · </b>{b.tip}</div>;
        if (b.cmds) return <div key={i} className="nd-cmds">{b.cmds.map((c, k) => <div key={k}><code>{c.cmd}</code><span>{c.desc}</span></div>)}</div>;
        return null;
      })}
    </div>
  );
}

export default function LessonTerminal({ lesson, git, setGit, onReady, onBack }) {
  const ch = getChallenge(lesson.id);
  const seeded = useRef(false);
  const [snap] = useState({ commits: git.commitOrder.length });
  const objectives = ch?.objectives || [];
  const [objDone, setObjDone] = useState(() => objectives.map(() => false));
  const [showHint, setShowHint] = useState(null);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    setGit((g) => {
      const ng = structuredClone(g);
      if (ch?.seed) Object.keys(ch.seed).forEach((f) => { if (ng.staged[f] == null) ng.workingFiles[f] = true; });
      if (ch?.setup) ch.setup(ng);
      return ng;
    });
    // eslint-disable-next-line
  }, []);

  const complete = objectives.length ? objDone.every(Boolean) : true;
  const nextIdx = objDone.findIndex((x) => !x);

  const handleCommand = (newGit) => {
    if (!objectives.length) return;
    setObjDone((prev) => {
      const next = [...prev];
      objectives.forEach((o, oi) => {
        if (!next[oi] && o.check(newGit, snap)) {
          const priorOk = oi === 0 || next[oi - 1];
          if (priorOk) next[oi] = true;
        }
      });
      return next;
    });
  };

  return (
    <div className="lesson-terminal">
      <header className="lt-top">
        <button className="flee" onClick={onBack}>← Island</button>
        <span className="lt-eyebrow">{lesson.eyebrow}</span>
        <button className="lt-notes-btn" onClick={() => setShowNotes((s) => !s)}>{showNotes ? "Hide notes" : "Show notes"}</button>
      </header>

      <div className="lt-goal">
        <h2>{lesson.title}</h2>
        <p>{ch?.intro || lesson.blurb}</p>
      </div>

      {showNotes && lesson.content && <Notes content={lesson.content} />}

      <div className="lt-grid">
        <div className="lt-left">
          {objectives.length > 0 && (
            <div className="lt-panel">
              <div className="lt-panel-label"><Icon name="check" size={14} /> Your task — type these commands</div>
              <ul className="obj-list">
                {objectives.map((o, oi) => (
                  <li key={oi} className={objDone[oi] ? "ok" : oi === nextIdx ? "active" : ""}>
                    <span className="obj-check">{objDone[oi] ? <Icon name="check" size={12} /> : oi + 1}</span>
                    <span className="obj-text">{o.text}</span>
                    {!objDone[oi] && <button className="hint-btn" onClick={() => setShowHint(showHint === oi ? null : oi)}>{showHint === oi ? "hide" : "hint"}</button>}
                    {showHint === oi && <code className="obj-hint">{o.hint}</code>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Terminal git={git} setGit={setGit} onCommand={handleCommand} />
        </div>

        <div className="lt-right">
          <div className="lt-panel graph-panel">
            <div className="lt-panel-label"><Icon name="branch" size={14} /> Live commit graph</div>
            <CommitGraph git={git} />
          </div>
        </div>
      </div>

      <div className="lt-foot">
        {complete ? (
          <button className="btn primary" onClick={onReady}>Face the guardian <Icon name="arrow" size={16} /></button>
        ) : (
          <div className="lt-locked"><Icon name="lock" size={14} /> Finish the task above to challenge the guardian</div>
        )}
      </div>
    </div>
  );
}

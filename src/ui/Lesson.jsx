import { useMemo, useState } from "react";

// Split a lesson's content into "tablets" (chapters). A new tablet begins at
// each heading; anything before the first heading is the opening tablet.
function paginate(content) {
  const pages = [];
  let current = { heading: null, blocks: [] };
  for (const block of content) {
    if (block.h) {
      if (current.blocks.length) pages.push(current);
      current = { heading: block.h, blocks: [] };
    } else {
      current.blocks.push(block);
    }
  }
  if (current.blocks.length) pages.push(current);
  return pages;
}

function Block({ block }) {
  if (block.p) return <p className="lp">{block.p}</p>;
  if (block.analogy)
    return (
      <div className="callout analogy">
        <span className="callout-tag">Picture it</span>
        <p>{block.analogy}</p>
      </div>
    );
  if (block.tip)
    return (
      <div className="callout tip">
        <span className="callout-tag">Tip</span>
        <p>{block.tip}</p>
      </div>
    );
  if (block.cmds)
    return (
      <div className="cmd-card">
        {block.cmds.map((c, i) => (
          <div className="cmd-row" key={i}>
            <code>{c.cmd}</code>
            <span>{c.desc}</span>
          </div>
        ))}
      </div>
    );
  return null;
}

export default function Lesson({ lesson, onReady, onBack }) {
  const pages = useMemo(() => paginate(lesson.content), [lesson]);
  const [i, setI] = useState(0);
  const page = pages[i];
  const last = i === pages.length - 1;

  return (
    <div className="lesson-screen">
      <header className="lesson-top">
        <button className="flee" onClick={onBack}>← Island</button>
        <span className="lesson-eyebrow">{lesson.eyebrow}</span>
        <span className="lesson-count">{i + 1} / {pages.length}</span>
      </header>

      <div className="tablet">
        <h2 className="tablet-h">{page.heading || lesson.title}</h2>
        <div className="tablet-body">
          {page.blocks.map((b, k) => (
            <Block key={k} block={b} />
          ))}
        </div>
      </div>

      <div className="lesson-foot">
        <div className="dots">
          {pages.map((_, k) => (
            <span key={k} className={`dot ${k === i ? "on" : ""} ${k < i ? "done" : ""}`} />
          ))}
        </div>
        <div className="lesson-nav">
          {i > 0 && (
            <button className="btn ghost" onClick={() => setI((n) => n - 1)}>Back</button>
          )}
          {last ? (
            <button className="btn primary" onClick={onReady}>Face the guardian →</button>
          ) : (
            <button className="btn primary" onClick={() => setI((n) => n + 1)}>Next</button>
          )}
        </div>
      </div>
    </div>
  );
}

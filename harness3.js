'use strict';
const fs = require('fs');
require('./stubs');

const html = fs.readFileSync(__dirname + '/index.html', 'utf8');

const scriptRe = /<script(\s[^>]*)?>([^]*?)<\/script>/gi;
let lastInline = null, m;
while ((m = scriptRe.exec(html)) !== null) {
  if (!/\bsrc\s*=/i.test(m[1] || '')) lastInline = m[2];
}
if (!lastInline) { console.error('No inline script found'); process.exit(1); }

// ── ISLE SOLVING COMMANDS ────────────────────────────────────────────────────
// One entry per station; each is an array of commands (multi-cmd stations list
// all in order). Verified against each station's check() in CAMPAIGN.
// To add Isle VI: append one entry here.
const ISLE_CMDS = [
  // Isle I  (3 stations)
  [
    ['git init'],
    ['git add index.html'],
    ['git commit -m "Add homepage"'],
  ],
  // Isle II  (4 stations)
  [
    ['git switch -c about-page'],
    ['git add about.html', 'git commit -m "Add about page"'],
    ['git switch main'],
    ['git merge about-page'],
  ],
  // Isle III  (3 stations)
  [
    ['git remote add origin https://github.com/keeper/world.git'],
    ['git add README.md', 'git commit -m "Add README"'],
    ['git push -u origin main'],
  ],
  // Isle IV  (3 stations)
  [
    ['git restore index.html'],
    ['git restore --staged notes.txt'],
    ['git revert HEAD'],
  ],
  // Isle V  (3 stations)
  [
    ['git clone https://github.com/keepers/atlas.git'],
    ['git fetch origin'],
    ['git pull origin main'],
  ],
  // Isle VI  (3 stations)
  [
    ['git log'],
    ['git diff'],
    ['git tag v1.0'],
  ],
];

// ── BOOT + EXPORT ─────────────────────────────────────────────────────────────
// new Function runs in global scope — all stubs on global.* are visible.
// Getters are closures so they read the live mutable value on every call.
let CAMPAIGN, gameShuffle,
    loadIsland, openStation, toConsole, submitStation, advanceStation,
    startBoss, choose, nextQ, endBoss,
    getIS, getStationSolved, getBossActive, getCurCard, getHp,
    getResultAction, getResultOpen, getCurrentIsle,
    setStoryOpen, setStarted;

try {
  const fn = new Function(lastInline + `
;return {
  CAMPAIGN, shuffle,
  loadIsland, openStation, toConsole, submitStation, advanceStation,
  startBoss, choose, nextQ, endBoss,
  getIS:            () => IS,
  getStationSolved: () => stationSolved,
  getBossActive:    () => bossActive,
  getCurCard:       () => curCard,
  getHp:            () => hp,
  getResultAction:  () => resultAction,
  getResultOpen:    () => resultOpen,
  getCurrentIsle:   () => currentIsle,
  setStoryOpen:     (v) => { storyOpen = v; },
  setStarted:       (v) => { started   = v; },
};`);
  const exp = fn();
  ({ CAMPAIGN, loadIsland, openStation, toConsole, submitStation, advanceStation,
     startBoss, choose, nextQ, endBoss,
     getIS, getStationSolved, getBossActive, getCurCard, getHp,
     getResultAction, getResultOpen, getCurrentIsle,
     setStoryOpen, setStarted } = exp);
  gameShuffle = exp.shuffle;
  console.log('GAME BOOTED OK');
} catch (e) {
  console.error('BOOT ERROR:', e.message);
  console.error(e.stack);
  process.exit(1);
}

// ── Assertions ────────────────────────────────────────────────────────────────
let failed = false;
function pass(msg) { console.log('PASS:', msg); }
function fail(msg) { console.log('FAIL:', msg); failed = true; }

// 1. CAMPAIGN sanity
if (Array.isArray(CAMPAIGN) && CAMPAIGN.length === 6) {
  pass('CAMPAIGN has 6 islands');
} else {
  fail(`CAMPAIGN length is ${Array.isArray(CAMPAIGN) ? CAMPAIGN.length : typeof CAMPAIGN}`);
}

// 2. Flashcard answer-slot distribution (real shuffle from game source)
{
  const RUNS_PER_CARD = 400;
  const counts = [0, 0, 0, 0];
  let total = 0;
  for (const isle of CAMPAIGN) {
    for (const src of isle.quiz) {
      for (let i = 0; i < RUNS_PER_CARD; i++) {
        const order = gameShuffle(src.options.map((_, j) => j));
        counts[order.indexOf(src.answer)]++;
        total++;
      }
    }
  }
  const pcts = counts.map(c => (c / total * 100).toFixed(1));
  console.log(`  Slot distribution  A=${pcts[0]}%  B=${pcts[1]}%  C=${pcts[2]}%  D=${pcts[3]}%`);
  if (counts.every(c => { const p = c / total * 100; return p >= 18 && p <= 32; })) {
    pass('all slots within 18%–32%');
  } else {
    fail(`slot distribution out of range (${pcts.join('% ')}%)`);
  }
}

// ── Campaign helpers ───────────────────────────────────────────────────────────
const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

function playStations(i) {
  console.log(`\n── Isle ${NUMERALS[i]} stations ──`);
  for (let si = 0; si < ISLE_CMDS[i].length; si++) {
    openStation(si);
    toConsole();
    for (const cmd of ISLE_CMDS[i][si]) submitStation(cmd);
    if (getStationSolved()) pass(`Isle ${NUMERALS[i]} stn ${si + 1} solved`);
    else                    fail(`Isle ${NUMERALS[i]} stn ${si + 1} NOT solved`);
    advanceStation();
  }
  const IS = getIS();
  if (IS && IS.complete) pass(`Isle ${NUMERALS[i]} complete`);
  else                   fail(`Isle ${NUMERALS[i]} NOT complete`);
  if (IS && IS.gateOpen) pass(`Isle ${NUMERALS[i]} gate open`);
  else                   fail(`Isle ${NUMERALS[i]} gate NOT open`);
}

function playBoss(i) {
  console.log(`\n── Isle ${NUMERALS[i]} boss ──`);
  startBoss();              // initialises boss, calls nextQ() → sets curCard
  const GUARD = 50;
  let count = 0;
  while (getBossActive() && count < GUARD) {
    count++;
    const card = getCurCard();
    if (!card) break;
    choose(card.answer);   // resolve(true, slot) → hp--, bIdx++, setTimeout scheduled
    // Drive synchronously: replicate the 1250ms setTimeout callback
    if (getHp() <= 0) endBoss(true);
    else              nextQ();
  }
  if (!getBossActive()) pass(`Isle ${NUMERALS[i]} boss done (${count} Q)`);
  else                  fail(`Isle ${NUMERALS[i]} boss did not end after ${GUARD} Q`);
}

// ── Full campaign ─────────────────────────────────────────────────────────────

// Isle I
loadIsland(0);
setStoryOpen(false); setStarted(true);
playStations(0);
playBoss(0);

// Transition I → II
console.log('\n── transition I → II ──');
getResultAction()();          // hideVeil + resultOpen=false + loadIsland(1)
setStoryOpen(false); setStarted(true);
if (getCurrentIsle() === 1) pass('currentIsle → 1 (Isle II)');
else                        fail(`currentIsle is ${getCurrentIsle()}, expected 1`);

// Isle II
playStations(1);
playBoss(1);

// Transition II → III
console.log('\n── transition II → III ──');
getResultAction()();          // loadIsland(2)
setStoryOpen(false); setStarted(true);
if (getCurrentIsle() === 2) pass('currentIsle → 2 (Isle III)');
else                        fail(`currentIsle is ${getCurrentIsle()}, expected 2`);

// Isle III
playStations(2);
playBoss(2);

// Transition III → IV
console.log('\n── transition III → IV ──');
getResultAction()();          // loadIsland(3)
setStoryOpen(false); setStarted(true);
if (getCurrentIsle() === 3) pass('currentIsle → 3 (Isle IV)');
else                        fail(`currentIsle is ${getCurrentIsle()}, expected 3`);

// Isle IV
playStations(3);
playBoss(3);

// Transition IV → V
console.log('\n── transition IV → V ──');
getResultAction()();          // loadIsland(4)
setStoryOpen(false); setStarted(true);
if (getCurrentIsle() === 4) pass('currentIsle → 4 (Isle V)');
else                        fail(`currentIsle is ${getCurrentIsle()}, expected 4`);

// Isle V
playStations(4);
playBoss(4);

// Transition V → VI
console.log('\n── transition V → VI ──');
getResultAction()();          // loadIsland(5)
setStoryOpen(false); setStarted(true);
if (getCurrentIsle() === 5) pass('currentIsle → 5 (Isle VI)');
else                        fail(`currentIsle is ${getCurrentIsle()}, expected 5`);

// Isle VI
playStations(5);
playBoss(5);

// Victory
console.log('\n── victory ──');
if (getResultOpen())                         pass('result screen open after final boss');
else                                         fail('result screen NOT open after final boss');
const ctaText = global.document.getElementById('resCta').textContent;
if (ctaText === 'Set sail again ▸')         pass('victory CTA: "Set sail again ▸"');
else                                         fail(`victory CTA: "${ctaText}"`);
const lastIdx = CAMPAIGN.length - 1;
if (getCurrentIsle() === lastIdx)            pass(`currentIsle is ${lastIdx} (final, pre-restart)`);
else                                         fail(`currentIsle is ${getCurrentIsle()}, expected ${lastIdx}`);

process.exit(failed ? 1 : 0);

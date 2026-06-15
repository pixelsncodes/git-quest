// harness3.js — smoke-tests the storage layer in Node (where localStorage is absent).
// hasStore() must return false, and all four functions must degrade gracefully.

const SAVE_KEY = "gitquest:save:v1";

function hasStore(){
  try{ localStorage.setItem("__probe__","1"); localStorage.removeItem("__probe__"); return true; }catch(e){ return false; }
}
function persist(){
  if(!hasStore())return;
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify({isle:currentIsle,rank:progressRank,score:totalScore,git})); }catch(e){}
}
async function readSave(){
  if(!hasStore())return null;
  try{ const raw=localStorage.getItem(SAVE_KEY); return raw?JSON.parse(raw):null; }catch(e){ return null; }
}
function clearSave(){
  if(!hasStore())return;
  try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
}

let failures = 0;
function assert(label, cond){
  if(cond){ console.log("PASS", label); }
  else { console.error("FAIL", label); failures++; }
}

assert("hasStore() returns false in Node", hasStore() === false);

let threw = false;
try{ persist(); clearSave(); }catch(e){ threw = true; }
assert("persist() and clearSave() are no-ops (no throw)", !threw);

readSave().then(s => {
  assert("readSave() resolves to null", s === null);
  if(failures){ console.error(`\n${failures} test(s) failed`); process.exit(1); }
  else{ console.log("\nAll tests passed — localStorage absent, storage silently skipped."); }
});

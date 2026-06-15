// Ported from the original Git Quest: a pure, framework-free Git simulator.
// freshGit() -> new repo state;  runCommand(git, rawString) -> { git, lines }


/* ============================================================
   GIT QUEST — a playable game for learning Git & GitHub
   ============================================================ */

/* ---------- tiny git engine (pure functions) ---------- */

function genHash(n) {
  const x = ((n + 1) * 2654435761) % 2147483647;
  return (x >>> 0).toString(16).padStart(7, "0").slice(0, 7);
}

function freshGit() {
  return {
    initialized: false,
    workingFiles: {}, // {name:true} changed-but-not-staged
    staged: {}, // {name:true}
    commits: {}, // id -> {id,message,parents,branch,order,lane,merge}
    commitOrder: [],
    branches: { main: null }, // name -> tip commit id
    lanes: { main: 0 },
    head: "main",
    counter: 0,
    remote: null, // {url, commitIds:[], branches:{}}
    lastCmd: "",
    ignore: [], // .gitignore patterns
    stash: [], // [{working:{}, staged:{}}]
    tags: {}, // name -> commitId
  };
}

// is a filename matched by any .gitignore pattern?
function isIgnored(g, name) {
  return (g.ignore || []).some((pat) => {
    if (!pat) return false;
    if (pat.endsWith("/")) return name === pat.slice(0, -1) || name.startsWith(pat);
    if (pat.startsWith("*.")) return name.endsWith(pat.slice(1));
    return name === pat;
  });
}

// commit ids reachable from a tip (its ancestry), inclusive
function ancestry(g, tip) {
  const seen = new Set();
  const stack = tip ? [tip] : [];
  while (stack.length) {
    const id = stack.pop();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    (g.commits[id]?.parents || []).forEach((p) => stack.push(p));
  }
  return seen;
}

function tokenize(input) {
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  const out = [];
  let m;
  while ((m = re.exec(input))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

function assignLane(g, name) {
  if (g.lanes[name] == null) g.lanes[name] = Object.keys(g.lanes).length;
}

function runCommand(git, raw) {
  const input = (raw || "").trim();
  const t = tokenize(input);
  const out = [];
  const say = (text, type = "out") => out.push({ text, type });
  if (t.length === 0) return { git, lines: [] };

  if (t[0] === "clear") return { git, lines: [{ __clear: true }] };
  if (t[0] === "help") {
    say("Try these commands:", "head");
    say("  git init · git status · git add <file> · git commit -m \"msg\"");
    say("  git log · git branch · git switch -c <name> · git merge <name>");
    say("  git remote add origin <url> · git push · git pull · git clone <url>");
    say("  git restore [--staged] <file> · git revert HEAD · git stash · git stash pop");
    say("  git tag <name> · git rebase <branch> · git diff · echo \"x\" > .gitignore");
    say("  ls · clear");
    return { git, lines: out };
  }

  const g = structuredClone(git);

  if (t[0] === "ls") {
    const all = [...Object.keys(g.workingFiles), ...Object.keys(g.staged)];
    say(all.length ? all.join("   ") : "(empty project)");
    return { git: g, lines: out };
  }
  if (t[0] === "echo") {
    // echo "text" > file   or   echo "text" >> file
    const gt = t.indexOf(">");
    const gg = t.indexOf(">>");
    const redir = gg >= 0 ? gg : gt;
    if (redir < 0 || !t[redir + 1]) {
      say(t.slice(1).join(" ").replace(/^["']|["']$/g, ""));
      return { git: g, lines: out };
    }
    const file = t[redir + 1];
    const text = t.slice(1, redir).join(" ").replace(/^["']|["']$/g, "");
    if (file === ".gitignore") {
      if (gg < 0) g.ignore = [];
      if (text) g.ignore.push(text);
      if (!g.staged[".gitignore"]) g.workingFiles[".gitignore"] = true;
      say(`Added pattern to .gitignore → ${text}`, "success");
      say("Matching files will now be hidden from Git.", "muted");
    } else {
      if (!g.staged[file]) g.workingFiles[file] = true;
      say(`Wrote to ${file}`, "success");
    }
    g.lastCmd = "echo";
    return { git: g, lines: out };
  }
  if (t[0] !== "git") {
    say(`command not found: ${t[0]}`, "err");
    say("This is a git practice terminal — start commands with “git”.", "muted");
    return { git, lines: out };
  }

  const sub = t[1];

  if (sub === "--version" || sub === "version") {
    say("git version 2.43.0", "out");
    g.lastCmd = "version";
    return { git: g, lines: out };
  }

  if (sub === "init") {
    if (g.initialized) say("Reinitialized existing Git repository in /my-site/.git/", "out");
    else {
      g.initialized = true;
      say("Initialized empty Git repository in /my-site/.git/", "success");
      say("Git is now watching this folder.", "muted");
    }
    g.lastCmd = "init";
    return { git: g, lines: out };
  }

  if (!g.initialized) {
    say("fatal: not a git repository", "err");
    say('Run "git init" first to create one.', "muted");
    return { git, lines: out };
  }

  switch (sub) {
    case "status": {
      g.lastCmd = "status";
      say(`On branch ${g.head}`, "cyan");
      if (g.branches[g.head] == null) say("No commits yet", "muted");
      const stagedNames = Object.keys(g.staged);
      const untracked = Object.keys(g.workingFiles).filter((f) => !isIgnored(g, f));
      const ignoredCount = Object.keys(g.workingFiles).filter((f) => isIgnored(g, f)).length;
      if (stagedNames.length) {
        say("Changes to be committed:", "success");
        stagedNames.forEach((f) => say("    new file:   " + f, "success"));
      }
      if (untracked.length) {
        say("Untracked files:", "coral");
        untracked.forEach((f) => say("    " + f, "coral"));
        say('  (use "git add <file>" to stage them)', "muted");
      }
      if (ignoredCount) say(`  (${ignoredCount} file(s) ignored via .gitignore)`, "muted");
      if (!stagedNames.length && !untracked.length)
        say("nothing to commit, working tree clean", "muted");
      return { git: g, lines: out };
    }
    case "add": {
      g.lastCmd = "add";
      const target = t[2];
      if (!target) {
        say("Nothing specified. Try: git add . (to stage everything)", "err");
        break;
      }
      if (target === "." || target === "-A") {
        const names = Object.keys(g.workingFiles).filter((n) => !isIgnored(g, n));
        if (!names.length) say("Nothing to add — working tree is clean.", "muted");
        else {
          names.forEach((n) => {
            g.staged[n] = true;
            delete g.workingFiles[n];
          });
          say(`Staged ${names.length} file(s): ${names.join(", ")}`, "success");
        }
      } else if (g.staged[target]) {
        say(`${target} is already staged.`, "muted");
      } else if (g.workingFiles[target]) {
        g.staged[target] = true;
        delete g.workingFiles[target];
        say(`Staged ${target}`, "success");
      } else {
        say(`fatal: pathspec '${target}' did not match any files`, "err");
        say("Tip: type ls to see your files.", "muted");
      }
      break;
    }
    case "commit": {
      g.lastCmd = "commit";
      const mi = t.indexOf("-m");
      const msg = mi >= 0 ? t[mi + 1] : null;
      if (Object.keys(g.staged).length === 0) {
        say("nothing to commit — stage files first with git add", "err");
        break;
      }
      if (!msg) {
        say('Please add a message: git commit -m "what you changed"', "err");
        break;
      }
      const id = genHash(g.counter);
      const parentTip = g.branches[g.head];
      g.commits[id] = {
        id,
        message: msg,
        parents: parentTip ? [parentTip] : [],
        branch: g.head,
        order: g.counter,
        lane: g.lanes[g.head] ?? 0,
      };
      g.commitOrder.push(id);
      const n = Object.keys(g.staged).length;
      g.branches[g.head] = id;
      g.counter++;
      g.staged = {};
      say(`[${g.head} ${id}] ${msg}`, "success");
      say(` ${n} file(s) committed — snapshot saved.`, "muted");
      break;
    }
    case "log": {
      g.lastCmd = "log";
      if (g.commitOrder.length === 0) {
        say("fatal: your current branch does not have any commits yet", "err");
        break;
      }
      const oneline = t.includes("--oneline");
      let cur = g.branches[g.head];
      const chain = [];
      while (cur) {
        const c = g.commits[cur];
        chain.push(c);
        cur = c.parents[0];
      }
      chain.forEach((c, i) => {
        if (oneline) say(`${c.id} ${c.message}`, "amber");
        else {
          say(`commit ${c.id}` + (i === 0 ? `  (HEAD -> ${g.head})` : ""), "amber");
          say(`    ${c.message}`);
          if (i < chain.length - 1) say("");
        }
      });
      break;
    }
    case "branch": {
      g.lastCmd = "branch";
      const name = t[2];
      if (!name) {
        Object.keys(g.branches).forEach((b) =>
          say((b === g.head ? "* " : "  ") + b, b === g.head ? "success" : "out")
        );
      } else if (Object.prototype.hasOwnProperty.call(g.branches, name)) {
        say(`fatal: a branch named '${name}' already exists`, "err");
      } else {
        g.branches[name] = g.branches[g.head];
        assignLane(g, name);
        say(`Created branch ${name} (you are still on ${g.head})`, "success");
      }
      break;
    }
    case "switch":
    case "checkout": {
      g.lastCmd = "switch";
      let name;
      let create = false;
      const flag = sub === "switch" ? "-c" : "-b";
      if (t[2] === flag) {
        create = true;
        name = t[3];
      } else name = t[2];
      if (!name) {
        say("Please name a branch, e.g. git switch -c feature", "err");
        break;
      }
      if (create) {
        if (Object.prototype.hasOwnProperty.call(g.branches, name)) {
          say(`fatal: a branch named '${name}' already exists`, "err");
          break;
        }
        g.branches[name] = g.branches[g.head];
        assignLane(g, name);
        g.head = name;
        say(`Switched to a new branch '${name}'`, "success");
        say("New commits now go here, leaving main untouched.", "muted");
      } else {
        if (!Object.prototype.hasOwnProperty.call(g.branches, name)) {
          say(`error: no branch named '${name}'`, "err");
          break;
        }
        g.head = name;
        say(`Switched to branch '${name}'`, "success");
      }
      break;
    }
    case "merge": {
      g.lastCmd = "merge";
      const other = t[2];
      if (!other || !Object.prototype.hasOwnProperty.call(g.branches, other)) {
        say(`merge: '${other}' — not something we can merge`, "err");
        break;
      }
      if (other === g.head) {
        say("Already up to date.", "muted");
        break;
      }
      const targetTip = g.branches[g.head];
      const sourceTip = g.branches[other];
      if (sourceTip === targetTip || sourceTip == null) {
        say("Already up to date.", "muted");
        break;
      }
      const id = genHash(g.counter);
      g.commits[id] = {
        id,
        message: `Merge branch '${other}' into ${g.head}`,
        parents: [targetTip, sourceTip].filter(Boolean),
        branch: g.head,
        order: g.counter,
        lane: g.lanes[g.head] ?? 0,
        merge: true,
      };
      g.commitOrder.push(id);
      g.branches[g.head] = id;
      g.counter++;
      say(`Merging ${other} into ${g.head}...`, "out");
      say("Merge made — the two timelines are now one.", "success");
      break;
    }
    case "remote": {
      g.lastCmd = "remote";
      if (t[2] === "add" && t[3] === "origin" && t[4]) {
        g.remote = { url: t[4], commitIds: [], branches: {} };
        say(`Remote "origin" added → ${t[4]}`, "success");
        say("origin is a nickname for your GitHub copy.", "muted");
      } else if (t[2] === "-v" || !t[2]) {
        if (g.remote) say(`origin  ${g.remote.url} (fetch & push)`, "cyan");
        else say("(no remotes yet)", "muted");
      } else say("usage: git remote add origin <url>", "err");
      break;
    }
    case "push": {
      g.lastCmd = "push";
      if (!g.remote) {
        say("fatal: no remote configured.", "err");
        say("Run: git remote add origin <url>", "muted");
        break;
      }
      const tip = g.branches[g.head];
      if (tip == null) {
        say("Everything up-to-date (no commits to push).", "muted");
        break;
      }
      let cur = tip;
      const ids = [];
      while (cur) {
        ids.push(cur);
        cur = g.commits[cur].parents[0];
      }
      g.remote.commitIds = Array.from(new Set([...g.remote.commitIds, ...ids]));
      g.remote.branches[g.head] = tip;
      say("Enumerating objects... compressing... done.", "out");
      say(`To ${g.remote.url}`, "out");
      say(` * ${g.head} -> ${g.head}`, "success");
      say("Your code is now backed up on GitHub.", "muted");
      break;
    }
    case "pull": {
      g.lastCmd = "pull";
      if (!g.remote) say("fatal: no remote configured.", "err");
      else say("Already up to date.", "muted");
      break;
    }
    case "clone": {
      g.lastCmd = "clone";
      if (!t[2]) say("usage: git clone <url>", "err");
      else {
        say(`Cloning into a new folder from ${t[2]}...`, "out");
        say("done.", "success");
      }
      break;
    }
    case "restore": {
      g.lastCmd = "restore";
      const staged = t.includes("--staged");
      const file = t[t.length - 1];
      if (!file || file === "--staged") { say("usage: git restore [--staged] <file>", "err"); break; }
      if (staged) {
        if (g.staged[file]) {
          delete g.staged[file];
          g.workingFiles[file] = true;
          say(`Unstaged ${file} — it's back to an untracked change.`, "success");
        } else say(`${file} is not staged.`, "muted");
      } else {
        if (g.workingFiles[file]) {
          delete g.workingFiles[file];
          say(`Discarded changes in ${file}. The edit is gone.`, "success");
        } else say(`No working changes to restore in ${file}.`, "muted");
      }
      break;
    }
    case "reset": {
      g.lastCmd = "reset";
      // git reset <file>  → unstage (older syntax for restore --staged)
      const file = t[t.length - 1];
      if (t.includes("--hard")) { say("(--hard discards changes — be careful with it on real repos!)", "muted"); break; }
      if (file && g.staged[file]) {
        delete g.staged[file];
        g.workingFiles[file] = true;
        say(`Unstaged ${file}.`, "success");
      } else if (file === "reset" || !file) {
        const names = Object.keys(g.staged);
        names.forEach((n) => { g.workingFiles[n] = true; delete g.staged[n]; });
        say(names.length ? `Unstaged ${names.length} file(s).` : "Nothing staged to reset.", names.length ? "success" : "muted");
      } else say(`Nothing to reset for ${file}.`, "muted");
      break;
    }
    case "revert": {
      g.lastCmd = "revert";
      const tip = g.branches[g.head];
      if (tip == null) { say("fatal: nothing to revert — no commits yet.", "err"); break; }
      const ref = t[2];
      let target = tip;
      if (ref && ref !== "HEAD" && g.commits[ref]) target = ref;
      const tc = g.commits[target];
      const id = genHash(g.counter);
      g.commits[id] = {
        id,
        message: `Revert "${tc.message}"`,
        parents: [tip],
        branch: g.head,
        order: g.counter,
        lane: g.lanes[g.head] ?? 0,
        revert: true,
      };
      g.commitOrder.push(id);
      g.branches[g.head] = id;
      g.counter++;
      say(`Reverting ${tc.id}...`, "out");
      say(`[${g.head} ${id}] Revert "${tc.message}"`, "success");
      say("A new commit was made that undoes the old one — history is preserved.", "muted");
      break;
    }
    case "stash": {
      g.lastCmd = "stash";
      const action = t[2];
      if (action === "list") {
        if (!g.stash.length) say("(no stash entries)", "muted");
        else g.stash.forEach((s, i) => say(`stash@{${i}}: WIP (${s.count} change(s))`, "cyan"));
      } else if (action === "pop" || action === "apply") {
        if (!g.stash.length) { say("No stash entries to pop.", "err"); break; }
        const s = g.stash.shift();
        Object.keys(s.working).forEach((f) => { g.workingFiles[f] = true; });
        Object.keys(s.staged).forEach((f) => { g.staged[f] = true; });
        say("Popped your stash — your changes are back.", "success");
      } else {
        const w = { ...g.workingFiles }, st = { ...g.staged };
        const count = Object.keys(w).length + Object.keys(st).length;
        if (!count) { say("No local changes to save.", "muted"); break; }
        g.stash.unshift({ working: w, staged: st, count });
        g.workingFiles = {};
        g.staged = {};
        say("Saved working changes to the stash. Your tree is clean now.", "success");
        say('Get them back anytime with: git stash pop', "muted");
      }
      break;
    }
    case "tag": {
      g.lastCmd = "tag";
      const ai = t.indexOf("-a");
      const name = ai >= 0 ? t[ai + 1] : t[2];
      if (!name) {
        const names = Object.keys(g.tags);
        if (!names.length) say("(no tags yet)", "muted");
        else names.forEach((n) => say(n, "amber"));
        break;
      }
      const tip = g.branches[g.head];
      if (tip == null) { say("fatal: no commit to tag yet.", "err"); break; }
      g.tags[name] = tip;
      say(`Tagged ${tip} as ${name}.`, "success");
      if (ai >= 0) say("Annotated tag created — perfect for marking a release.", "muted");
      break;
    }
    case "rebase": {
      g.lastCmd = "rebase";
      const base = t[2];
      if (!base || !Object.prototype.hasOwnProperty.call(g.branches, base)) {
        say(`usage: git rebase <branch> (e.g. git rebase main)`, "err");
        break;
      }
      if (base === g.head) { say("Cannot rebase a branch onto itself.", "err"); break; }
      const baseTip = g.branches[base];
      const myTip = g.branches[g.head];
      const baseAnc = ancestry(g, baseTip);
      if (baseAnc.has(myTip)) { say("Current branch is up to date — nothing to rebase.", "muted"); break; }
      // commits unique to current branch, oldest first
      const myAnc = [...ancestry(g, myTip)];
      const unique = myAnc.filter((id) => !baseAnc.has(id)).sort((a, b) => g.commits[a].order - g.commits[b].order);
      if (!unique.length) { say("Nothing to replay.", "muted"); break; }
      let parent = baseTip;
      unique.forEach((id) => {
        g.commits[id].parents = [parent];
        g.commits[id].lane = g.lanes[g.head] ?? 0;
        g.commits[id].branch = g.head;
        parent = id;
      });
      g.branches[g.head] = parent;
      say(`Rewinding head to replay your work on top of ${base}...`, "out");
      say(`Successfully rebased ${g.head} onto ${base}.`, "success");
      say("Your commits now sit in a straight line after main — clean, linear history.", "muted");
      break;
    }
    case "config": {
      g.lastCmd = "config";
      if (t.includes("--global") && t.join(" ").includes("alias")) {
        say("Alias saved. You can now use your shortcut instead of the full command.", "success");
      } else if (t.includes("user.name") || t.includes("user.email")) {
        say("Saved. Git will stamp your commits with this identity.", "success");
      } else say("Config updated.", "muted");
      break;
    }
    case "diff": {
      g.lastCmd = "diff";
      const changed = [...Object.keys(g.staged), ...Object.keys(g.workingFiles).filter((f) => !isIgnored(g, f))];
      if (!changed.length) { say("(no changes — working tree clean)", "muted"); break; }
      changed.forEach((f) => {
        say(`diff --git a/${f} b/${f}`, "amber");
        say(`+ your new lines in ${f}`, "success");
        say(`- lines you removed`, "coral");
      });
      say("diff shows line-by-line what changed before you commit.", "muted");
      break;
    }
    default:
      say(`git: '${sub}' is not a command we cover here. Type help.`, "err");
  }
  return { git: g, lines: out };
}

export { freshGit, runCommand, genHash, ancestry, isIgnored, tokenize };

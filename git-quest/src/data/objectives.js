// Per-lesson terminal challenges, ported from the original game.
// Each lesson: seed files, optional setup(g), and ordered objectives whose
// check(git, snap) predicates run against the live engine state.
import { genHash, ancestry } from "../engine/git.js";

export const CHALLENGES = {
  1: {
    intro: "Let's wake up the time machine. Type the command below to confirm Git is online.",
    seed: null,
    setup: null,
    pr: false,
    objectives: [
      { text: "Run git --version", hint: "git --version", check: (g) => g.lastCmd === "version" }
    ],
  },
  2: {
    intro: "You're starting a personal website. The folder has an index.html file in it. Turn it into a repo, then check the status.",
    seed: {"index.html":true},
    setup: null,
    pr: false,
    objectives: [
      { text: "Create the repository with git init", hint: "git init", check: (g) => g.initialized },
      { text: "Check the dashboard with git status", hint: "git status", check: (g) => g.lastCmd === "status" }
    ],
  },
  3: {
    intro: "Time to save your first snapshot. Stage index.html, then commit it with a clear message.",
    seed: null,
    setup: null,
    pr: false,
    objectives: [
      { text: "Stage the file with git add index.html (or git add .)", hint: "git add index.html", check: (g) => g.lastCmd === "add" || Object.keys(g.staged).length > 0 || g.commitOrder.length > 0 },
      { text: "Save it with git commit -m \"Add homepage\"", hint: "git commit -m \"Add homepage\"", check: (g, snap) => g.commitOrder.length > snap.commits }
    ],
  },
  4: {
    intro: "Your project gained a style.css file. Commit it, then read your history to see the timeline grow.",
    seed: {"style.css":true},
    setup: null,
    pr: false,
    objectives: [
      { text: "Stage style.css (git add style.css)", hint: "git add style.css", check: (g) => g.lastCmd === "add" || g.commitOrder.length > 1 },
      { text: "Commit it (git commit -m \"Add styles\")", hint: "git commit -m \"Add styles\"", check: (g, snap) => g.commitOrder.length > snap.commits },
      { text: "View the logbook with git log", hint: "git log", check: (g) => g.lastCmd === "log" }
    ],
  },
  5: {
    intro: "You want to add an About page without disturbing main. Branch off, then commit your new about.html there.",
    seed: {"about.html":true},
    setup: null,
    pr: false,
    objectives: [
      { text: "Create & switch to a branch: git switch -c about-page", hint: "git switch -c about-page", check: (g) => g.head !== "main" },
      { text: "Stage & commit about.html on your branch", hint: "git add about.html  then  git commit -m \"Add about page\"", check: (g, snap) => g.commitOrder.length > snap.commits && g.head !== "main" }
    ],
  },
  6: {
    intro: "Your about-page branch is ready. Switch back to main, then merge it in to reunite the timelines.",
    seed: null,
    setup: null,
    pr: false,
    objectives: [
      { text: "Switch back to main: git switch main", hint: "git switch main", check: (g) => g.head === "main" },
      { text: "Merge your branch: git merge about-page", hint: "git merge about-page", check: (g) => Object.values(g.commits).some((c) => c.merge) }
    ],
  },
  7: {
    intro: "Get your site online. Connect a GitHub remote, then push your main branch up.",
    seed: null,
    setup: null,
    pr: false,
    objectives: [
      { text: "Add the remote: git remote add origin https://github.com/you/my-site.git", hint: "git remote add origin https://github.com/you/my-site.git", check: (g) => g.remote != null },
      { text: "Push your work: git push -u origin main", hint: "git push -u origin main", check: (g) => g.remote && g.remote.commitIds.length > 0 }
    ],
  },
  8: {
    intro: "Forks, pull requests, issues — how people build together.",
    seed: null,
    setup: null,
    pr: true,
    objectives: [],
  },
  9: {
    intro: "Your project picked up a secret.env (passwords!), a node_modules folder, and a log file. None should be in Git. Build a .gitignore to keep them out, then commit it.",
    seed: {"secret.env":true,"node_modules":true,"app.log":true},
    setup: null,
    pr: false,
    objectives: [
      { text: "Ignore the secrets file: echo \"secret.env\" > .gitignore", hint: "echo \"secret.env\" > .gitignore", check: (g) => (g.ignore || []).includes("secret.env") },
      { text: "Also ignore the folder: echo \"node_modules/\" >> .gitignore", hint: "echo \"node_modules/\" >> .gitignore", check: (g) => (g.ignore || []).includes("node_modules/") },
      { text: "Check that the junk is now hidden: git status", hint: "git status", check: (g) => g.lastCmd === "status" },
      { text: "Track the .gitignore itself: git add .gitignore then git commit -m \"Add gitignore\"", hint: "git add .gitignore  then  git commit -m \"Add gitignore\"", check: (g, snap) => g.commitOrder.length > snap.commits }
    ],
  },
  10: {
    intro: "You accidentally staged typo.html, and your last commit introduced a bug. Clean it up: unstage the file, discard it, then safely revert the bad commit.",
    seed: null,
    setup: (g) => { g.workingFiles["typo.html"] = true; g.staged["typo.html"] = true; delete g.workingFiles["typo.html"]; },
    pr: false,
    objectives: [
      { text: "Unstage the accidental file: git restore --staged typo.html", hint: "git restore --staged typo.html", check: (g) => !g.staged["typo.html"] && !!g.workingFiles["typo.html"] },
      { text: "Throw the bad edit away: git restore typo.html", hint: "git restore typo.html", check: (g) => !g.workingFiles["typo.html"] && !g.staged["typo.html"] },
      { text: "Safely undo your last commit: git revert HEAD", hint: "git revert HEAD", check: (g) => Object.values(g.commits).some((c) => c.revert) }
    ],
  },
  11: {
    intro: "You've got a half-finished halfdone.css change but need a clean tree right now. Stash it, peek at the drawer, then pop it back.",
    seed: {"halfdone.css":true},
    setup: null,
    pr: false,
    objectives: [
      { text: "Tuck your work away: git stash", hint: "git stash", check: (g) => (g.stash || []).length > 0 && !g.workingFiles["halfdone.css"] },
      { text: "See it in the drawer: git stash list", hint: "git stash list", check: (g) => g.lastCmd === "stash" },
      { text: "Bring it back: git stash pop", hint: "git stash pop", check: (g) => (g.stash || []).length === 0 && !!g.workingFiles["halfdone.css"] }
    ],
  },
  12: {
    intro: "Your site is ready to ship. Mark this commit as your first official release, then add an annotated tag for a follow-up version.",
    seed: null,
    setup: null,
    pr: false,
    objectives: [
      { text: "Tag your first release: git tag v1.0.0", hint: "git tag v1.0.0", check: (g) => !!(g.tags && g.tags["v1.0.0"]) },
      { text: "Add an annotated tag: git tag -a v1.1.0 -m \"Polish release\"", hint: "git tag -a v1.1.0 -m \"Polish release\"", check: (g) => !!(g.tags && g.tags["v1.1.0"]) },
      { text: "List your tags: git tag", hint: "git tag", check: (g) => g.lastCmd === "tag" }
    ],
  },
  13: {
    intro: "You're on the 'polish' branch, but a teammate already pushed a commit to main — your histories have diverged. Rebase onto main to replay your work on top, then fast-forward main.",
    seed: null,
    setup: (g) => {
      if (g.branches.polish) return;
      const base = g.branches.main;
      // a teammate's commit lands on main
      const mid = genHash(g.counter);
      g.commits[mid] = { id: mid, message: "Update homepage copy (teammate)", parents: base ? [base] : [], branch: "main", order: g.counter, lane: g.lanes.main ?? 0 };
      g.commitOrder.push(mid); g.branches.main = mid; g.counter++;
      // you branch off the OLD base and commit there → divergence
      g.branches["polish"] = base; g.lanes["polish"] = Object.keys(g.lanes).length; g.head = "polish";
      const pid = genHash(g.counter);
      g.commits[pid] = { id: pid, message: "Polish footer styles", parents: base ? [base] : [], branch: "polish", order: g.counter, lane: g.lanes["polish"] };
      g.commitOrder.push(pid); g.branches["polish"] = pid; g.counter++;
    },
    pr: false,
    objectives: [
      { text: "Replay your work onto main: git rebase main", hint: "git rebase main", check: (g) => g.lastCmd === "rebase" && g.branches.main != null && ancestry(g, g.branches.polish).has(g.branches.main) },
      { text: "Hop to main: git switch main", hint: "git switch main", check: (g) => g.head === "main" },
      { text: "Bring polish in: git merge polish", hint: "git merge polish", check: (g) => g.head === "main" && g.lastCmd === "merge" }
    ],
  },
  14: {
    intro: "Set up your pro toolkit: configure your identity, review your changes with diff, then create your first alias.",
    seed: {"notes.md":true},
    setup: null,
    pr: false,
    objectives: [
      { text: "Set your name: git config --global user.name \"Ada Lovelace\"", hint: "git config --global user.name \"Ada Lovelace\"", check: (g) => g.lastCmd === "config" },
      { text: "Preview your changes: git diff", hint: "git diff", check: (g) => g.lastCmd === "diff" },
      { text: "Create a shortcut: git config --global alias.st status", hint: "git config --global alias.st status", check: (g) => g.lastCmd === "config" }
    ],
  },
};

export function getChallenge(id) { return CHALLENGES[id] || null; }

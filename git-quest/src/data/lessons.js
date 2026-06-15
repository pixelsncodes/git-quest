// 14 lessons, each an island. Every lesson has:
//   content[] — the teaching blocks shown in the Learn phase
//   quiz[]    — the flashcards used in the boss fight
// Block kinds: { p } paragraph, { h } heading, { analogy }, { tip }, { cmds:[{cmd,desc}] }

export const LESSONS = [
  {
    "id": 1,
    "title": "What is Git?",
    "eyebrow": "Level 1 · The Time Machine",
    "badge": "Time Traveler",
    "blurb": "Why version control exists, and how Git differs from GitHub.",
    "tier": "fundamentals",
    "content": [
      {
        "p": "Ever ended up with files like report_final_FINAL_v2_USE_THIS.doc? That chaos is exactly what Git replaces."
      },
      {
        "p": "Git is a version control system — a time machine for your project. It records a snapshot every time you save, so you can rewind to any point, see what changed, and experiment without fear of breaking things."
      },
      {
        "analogy": "Think of it as infinite save points in a video game. Mess something up? Load an earlier save. Want to try a risky path? Branch off into an alternate timeline and merge it back only if it works."
      },
      {
        "h": "Git vs GitHub — not the same thing"
      },
      {
        "p": "Git is the tool that runs on your computer and tracks history. GitHub is a website that stores your Git projects online so you can back them up, share them, and work with other people."
      },
      {
        "analogy": "Git is the camera that takes the photos. GitHub is the cloud album where you post and share them."
      },
      {
        "tip": "You can use Git completely offline. GitHub just gives your repo a home on the internet."
      },
      {
        "cmds": [
          {
            "cmd": "git --version",
            "desc": "check that Git is installed"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "In one line: what is Git?",
        "options": [
          "A programming language",
          "A version control system that tracks changes to files",
          "A website for storing code",
          "A text editor"
        ],
        "answer": 1,
        "explain": "Git tracks every version of your files so you can rewind, compare, and branch."
      },
      {
        "q": "What's the difference between Git and GitHub?",
        "options": [
          "They're the same thing",
          "Git is online, GitHub is offline",
          "Git tracks history on your computer; GitHub hosts repos online",
          "GitHub came first"
        ],
        "answer": 2,
        "explain": "Git = the tool on your machine. GitHub = a place to host Git repos online."
      },
      {
        "q": "Can you use Git without an internet connection?",
        "options": [
          "No, it always needs the cloud",
          "Yes — Git works entirely offline",
          "Only on weekends",
          "Only with GitHub Pro"
        ],
        "answer": 1,
        "explain": "Git is local. The internet only matters when you sync with a remote like GitHub."
      }
    ]
  },
  {
    "id": 2,
    "title": "Starting a Repository",
    "eyebrow": "Level 2 · Plant the Flag",
    "badge": "Repo Founder",
    "blurb": "Turn a folder into a tracked project and read its status.",
    "tier": "fundamentals",
    "content": [
      {
        "p": "A repository (or repo) is just a project folder that Git is watching. You turn an ordinary folder into a repo with git init."
      },
      {
        "p": "Behind the scenes, git init creates a hidden .git folder. That folder is Git's brain — it stores your entire history. You never edit it by hand."
      },
      {
        "h": "Your dashboard: git status"
      },
      {
        "p": "git status is the command you'll run the most. It tells you which branch you're on and which files have changed, are staged, or aren't tracked yet. When in doubt, check status."
      },
      {
        "analogy": "git status is like glancing at the dashboard of your car before driving — a quick read of where everything stands."
      },
      {
        "tip": "Files Git hasn't been told about yet show up as “Untracked”. That's normal for brand-new files."
      },
      {
        "cmds": [
          {
            "cmd": "git init",
            "desc": "start tracking the current folder"
          },
          {
            "cmd": "git status",
            "desc": "see what's going on right now"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What does git init do?",
        "options": [
          "Deletes all files",
          "Turns a folder into a Git repository",
          "Uploads code to GitHub",
          "Installs Git"
        ],
        "answer": 1,
        "explain": "git init creates the hidden .git folder and starts tracking the project."
      },
      {
        "q": "Which command shows what's changed and which branch you're on?",
        "options": [
          "git show",
          "git check",
          "git status",
          "git info"
        ],
        "answer": 2,
        "explain": "git status is your everyday dashboard."
      },
      {
        "q": "A brand-new file Git hasn't recorded yet is labelled…",
        "options": [
          "Committed",
          "Untracked",
          "Merged",
          "Pushed"
        ],
        "answer": 1,
        "explain": "Untracked = Git sees the file but isn't recording its history yet."
      }
    ]
  },
  {
    "id": 3,
    "title": "Saving Your Work",
    "eyebrow": "Level 3 · Snapshots in Time",
    "badge": "Committer",
    "blurb": "The staging area, and how add + commit save a snapshot.",
    "tier": "fundamentals",
    "content": [
      {
        "p": "Saving in Git is a two-step move. First you stage the changes you want to keep, then you commit them as a permanent snapshot."
      },
      {
        "h": "The three areas"
      },
      {
        "p": "1) Working directory — your live files. 2) Staging area — a holding zone for changes you're about to save. 3) Repository — the permanent history of committed snapshots."
      },
      {
        "analogy": "git add is packing items into a box. git commit is sealing that box, writing a label on it, and putting it on the shelf. The label is your commit message."
      },
      {
        "p": "Every commit gets a unique ID (a hash like a1b2c3d) and a message describing what changed. Good messages are short and say what you did: “Add homepage layout”."
      },
      {
        "tip": "Staging lets you commit some changes now and others later — you control exactly what goes into each snapshot."
      },
      {
        "cmds": [
          {
            "cmd": "git add <file>",
            "desc": "stage one file (or git add . for all)"
          },
          {
            "cmd": "git commit -m \"message\"",
            "desc": "save a snapshot with a label"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What does git add do?",
        "options": [
          "Permanently saves a snapshot",
          "Stages changes so they're ready to commit",
          "Uploads to GitHub",
          "Creates a branch"
        ],
        "answer": 1,
        "explain": "add moves changes into the staging area — the box you're packing."
      },
      {
        "q": "What does git commit do?",
        "options": [
          "Stages a file",
          "Saves a permanent snapshot of staged changes",
          "Deletes history",
          "Connects to GitHub"
        ],
        "answer": 1,
        "explain": "commit seals the staged changes into history with a message."
      },
      {
        "q": "Which holding zone sits between your live files and history?",
        "options": [
          "The branch",
          "The remote",
          "The staging area",
          "The HEAD"
        ],
        "answer": 2,
        "explain": "Working directory → staging area → repository."
      },
      {
        "q": "What's the -m flag for in git commit?",
        "options": [
          "Merge",
          "Provide the commit message",
          "Make a branch",
          "Mark as important"
        ],
        "answer": 1,
        "explain": "-m lets you attach the message inline: git commit -m \"...\""
      }
    ]
  },
  {
    "id": 4,
    "title": "Viewing History",
    "eyebrow": "Level 4 · The Logbook",
    "badge": "Historian",
    "blurb": "Read your project's history and learn what HEAD means.",
    "tier": "fundamentals",
    "content": [
      {
        "p": "Every commit you make builds a timeline. git log lets you read that timeline newest-first, showing each commit's ID, message, and author."
      },
      {
        "p": "git log --oneline gives a compact view — one line per commit — which is perfect for a quick overview."
      },
      {
        "h": "What is HEAD?"
      },
      {
        "p": "HEAD is a pointer that means “you are here”. It points to the commit you're currently sitting on, usually the latest one on your branch. When you move around history, HEAD moves with you."
      },
      {
        "analogy": "HEAD is the “You are here” dot on a mall map. The commits are the stores; HEAD shows which one you're standing in."
      },
      {
        "tip": "Commit IDs look random (like 3f9a1c2) but each one is unique and lets you jump to that exact snapshot."
      },
      {
        "cmds": [
          {
            "cmd": "git log",
            "desc": "show full commit history"
          },
          {
            "cmd": "git log --oneline",
            "desc": "compact one-line-per-commit view"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What does git log show?",
        "options": [
          "A list of branches",
          "Your commit history",
          "Files in the staging area",
          "Remote URLs"
        ],
        "answer": 1,
        "explain": "git log walks back through your commits, newest first."
      },
      {
        "q": "What does HEAD point to?",
        "options": [
          "The first commit ever",
          "The commit you're currently on",
          "The remote server",
          "A deleted file"
        ],
        "answer": 1,
        "explain": "HEAD = “you are here”, normally the latest commit on your branch."
      },
      {
        "q": "Which flag gives a compact one-line history?",
        "options": [
          "--short",
          "--compact",
          "--oneline",
          "--mini"
        ],
        "answer": 2,
        "explain": "git log --oneline condenses each commit to a single line."
      }
    ]
  },
  {
    "id": 5,
    "title": "Branching",
    "eyebrow": "Level 5 · Parallel Universes",
    "badge": "Brancher",
    "blurb": "Work on new ideas safely without touching your main line.",
    "tier": "fundamentals",
    "content": [
      {
        "p": "A branch is a separate line of work — an alternate timeline. Your project starts on a branch called main. You create new branches to build features or fix bugs without risking the stable version."
      },
      {
        "analogy": "Branching is a “what if?” universe. You split off, experiment freely, and main stays safe and untouched. If your experiment works, you bring it back. If not, you just abandon the branch."
      },
      {
        "p": "git switch -c feature creates a new branch and moves you onto it in one step. Any commits you make now land on feature, leaving main exactly as it was."
      },
      {
        "p": "git switch <name> hops between existing branches. (Older tutorials use git checkout — it does the same job.)"
      },
      {
        "tip": "Teams use a branch per feature so everyone can work in parallel without stepping on each other's code."
      },
      {
        "cmds": [
          {
            "cmd": "git switch -c <name>",
            "desc": "create a branch and switch to it"
          },
          {
            "cmd": "git switch <name>",
            "desc": "move to an existing branch"
          },
          {
            "cmd": "git branch",
            "desc": "list all branches (* marks current)"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is a branch?",
        "options": [
          "A backup file",
          "A separate line of work / timeline",
          "A type of commit",
          "A GitHub account"
        ],
        "answer": 1,
        "explain": "A branch lets you develop in parallel without affecting main."
      },
      {
        "q": "What's the default branch usually called?",
        "options": [
          "master-list",
          "main",
          "root",
          "origin"
        ],
        "answer": 1,
        "explain": "Modern Git uses main as the default starting branch."
      },
      {
        "q": "git switch -c feature does what?",
        "options": [
          "Deletes the feature branch",
          "Creates a new branch and switches to it",
          "Commits your changes",
          "Pushes to GitHub"
        ],
        "answer": 1,
        "explain": "The -c means create, then it moves you onto the new branch."
      },
      {
        "q": "Why work on a separate branch?",
        "options": [
          "It's faster to type",
          "To experiment without breaking the stable main line",
          "Git requires it for every file",
          "To avoid writing commit messages"
        ],
        "answer": 1,
        "explain": "Branches isolate risky or in-progress work from your stable code."
      }
    ]
  },
  {
    "id": 6,
    "title": "Merging",
    "eyebrow": "Level 6 · Timelines Reunite",
    "badge": "Merge Master",
    "blurb": "Combine a finished branch back into main.",
    "tier": "fundamentals",
    "content": [
      {
        "p": "Once a branch is ready, you merge it back so its changes join the main timeline. You switch to the branch you want to merge into (usually main), then run git merge <other-branch>."
      },
      {
        "p": "Git combines the histories and creates a merge commit that ties the two lines together. Your graph shows the branch splitting off and then rejoining."
      },
      {
        "analogy": "Merging is two rivers flowing back into one. Everything you did on the side branch now flows into main."
      },
      {
        "h": "A quick word on conflicts"
      },
      {
        "p": "If both branches changed the same line of the same file, Git can't guess which to keep — that's a merge conflict. Git marks the spot and asks you to choose. You edit the file, pick the right version, then commit. Conflicts sound scary but are routine."
      },
      {
        "tip": "Merge into the branch you're standing on. So: switch to main first, then merge feature into it."
      },
      {
        "cmds": [
          {
            "cmd": "git switch main",
            "desc": "stand on the branch you'll merge into"
          },
          {
            "cmd": "git merge <branch>",
            "desc": "bring that branch's work in"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What does git merge do?",
        "options": [
          "Deletes a branch",
          "Combines another branch's changes into your current one",
          "Renames the project",
          "Uploads code"
        ],
        "answer": 1,
        "explain": "merge brings the changes from one branch into the branch you're on."
      },
      {
        "q": "Before merging feature into main, you should…",
        "options": [
          "Delete main",
          "Switch to main first",
          "Push to GitHub",
          "Run git init again"
        ],
        "answer": 1,
        "explain": "You merge into the branch you're currently standing on."
      },
      {
        "q": "A merge conflict happens when…",
        "options": [
          "Two branches change the same line differently",
          "You have too many branches",
          "GitHub is down",
          "A commit message is too long"
        ],
        "answer": 0,
        "explain": "Git can't auto-pick between two edits to the same line, so it asks you."
      }
    ]
  },
  {
    "id": 7,
    "title": "Going Online with GitHub",
    "eyebrow": "Level 7 · Cloud Save",
    "badge": "Cloud Engineer",
    "blurb": "Connect your repo to GitHub and push your work online.",
    "tier": "fundamentals",
    "content": [
      {
        "p": "So far everything has lived on your computer. GitHub gives your repo a home on the internet — a remote copy you can back up, share, and build a portfolio with."
      },
      {
        "h": "Remotes, push, pull, clone"
      },
      {
        "p": "A remote is a link to the online copy of your repo. The default nickname for it is origin. You add it once with git remote add origin <url>."
      },
      {
        "p": "git push uploads your commits to GitHub. git pull downloads new commits others have added. git clone makes a fresh local copy of an existing GitHub repo."
      },
      {
        "analogy": "Think of GitHub as cloud storage for code. push = upload your changes, pull = download the latest, clone = grab a whole project for the first time."
      },
      {
        "tip": "The first push of a branch often uses git push -u origin main. The -u links your local branch to the remote one so later you can just type git push."
      },
      {
        "cmds": [
          {
            "cmd": "git remote add origin <url>",
            "desc": "link your repo to GitHub"
          },
          {
            "cmd": "git push -u origin main",
            "desc": "upload commits the first time"
          },
          {
            "cmd": "git pull",
            "desc": "download new commits"
          },
          {
            "cmd": "git clone <url>",
            "desc": "copy a repo to your computer"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is GitHub?",
        "options": [
          "A version of Git",
          "A website that hosts Git repositories online",
          "A programming language",
          "A text editor"
        ],
        "answer": 1,
        "explain": "GitHub hosts your repos online for backup and collaboration."
      },
      {
        "q": "What does git push do?",
        "options": [
          "Downloads commits",
          "Uploads your local commits to the remote",
          "Deletes a branch",
          "Creates a repo"
        ],
        "answer": 1,
        "explain": "push sends your commits up to GitHub."
      },
      {
        "q": "What is origin?",
        "options": [
          "Your first commit",
          "The default nickname for your remote repo",
          "The main branch",
          "A merge conflict"
        ],
        "answer": 1,
        "explain": "origin is the conventional name for your remote on GitHub."
      },
      {
        "q": "git clone is used to…",
        "options": [
          "Make a copy of an existing repo on your computer",
          "Delete a repository",
          "Rename a branch",
          "Stage files"
        ],
        "answer": 0,
        "explain": "clone downloads a full repo so you can work on it locally."
      }
    ]
  },
  {
    "id": 8,
    "title": "Collaboration",
    "eyebrow": "Level 8 · Teaming Up",
    "badge": "Collaborator",
    "blurb": "Forks, pull requests, issues — how people build together.",
    "tier": "fundamentals",
    "content": [
      {
        "p": "GitHub's real power is teamwork. Here's the vocabulary you'll see everywhere in open source and on real teams."
      },
      {
        "h": "The building blocks"
      },
      {
        "p": "Fork: your own personal copy of someone else's repo, so you can experiment freely. README: the front page of a repo (a README.md file) that explains what the project is. Issue: a ticket to track a bug, task, or idea — a to-do item the team can discuss."
      },
      {
        "h": "Pull requests — the heart of collaboration"
      },
      {
        "p": "A pull request (PR) proposes that your branch be merged into the main project. Others review it, leave comments, request changes, and approve. Once approved, it gets merged. It's a code review and a merge, with a discussion attached."
      },
      {
        "analogy": "A pull request is like submitting an essay for feedback before it goes in the final book. Reviewers suggest edits; once everyone's happy, it's published (merged)."
      },
      {
        "tip": "The standard open-source flow: fork → branch → commit → push → open a pull request → review → merge."
      }
    ],
    "quiz": [
      {
        "q": "What is a pull request?",
        "options": [
          "A way to delete code",
          "A proposal to merge your changes, open for review",
          "A type of commit",
          "A backup"
        ],
        "answer": 1,
        "explain": "A PR proposes a merge and invites review and discussion first."
      },
      {
        "q": "What is a fork?",
        "options": [
          "A merge conflict",
          "Your own copy of someone else's repository",
          "A deleted branch",
          "A commit message"
        ],
        "answer": 1,
        "explain": "Forking gives you a personal copy to work on freely."
      },
      {
        "q": "What are GitHub issues used for?",
        "options": [
          "Storing passwords",
          "Tracking bugs, tasks, and ideas",
          "Hosting images",
          "Running code"
        ],
        "answer": 1,
        "explain": "Issues are tickets for bugs, tasks, and feature discussions."
      },
      {
        "q": "What does a README file do?",
        "options": [
          "Runs the program",
          "Explains what the project is and how to use it",
          "Stores your commits",
          "Connects to the remote"
        ],
        "answer": 1,
        "explain": "The README is the repo's front page and first impression."
      },
      {
        "q": "Order the open-source flow:",
        "options": [
          "push → fork → merge → commit",
          "fork → branch → commit → push → pull request → merge",
          "commit → clone → delete → push",
          "merge → fork → push → branch"
        ],
        "answer": 1,
        "explain": "Fork it, branch, commit, push, open a PR, get it reviewed, then merge."
      }
    ]
  },
  {
    "id": 9,
    "title": "Ignoring Files",
    "eyebrow": "Level 9 · The Bouncer",
    "badge": "Curator",
    "blurb": "Keep secrets and junk out of Git with a .gitignore file.",
    "tier": "advanced",
    "content": [
      {
        "p": "Not everything in your folder belongs in Git. Passwords, API keys, huge build folders, and auto-generated junk should never be committed. A .gitignore file is the bouncer at the door — it tells Git which files to pretend it can't see."
      },
      {
        "h": "How it works"
      },
      {
        "p": "You create a file literally named .gitignore and list patterns inside it, one per line. Any file matching a pattern stays untracked forever — it won't show up in git status and git add . will skip it."
      },
      {
        "analogy": "Think of .gitignore as a “do not pack” list for your suitcase. Toiletries you'll buy there, dirty laundry — leave them out automatically so you never pack them by accident."
      },
      {
        "p": "Common entries: secret.env (credentials), node_modules/ (downloaded dependencies), *.log (log files). The trailing slash means “a whole folder”; the *. means “any file with this extension”."
      },
      {
        "tip": "Add .gitignore at the very start of a project — before your first commit — so secrets never get recorded even once. Once something is committed, removing it later is much harder."
      },
      {
        "cmds": [
          {
            "cmd": "echo \"secret.env\" > .gitignore",
            "desc": "create .gitignore ignoring a file"
          },
          {
            "cmd": "echo \"node_modules/\" >> .gitignore",
            "desc": "append another pattern (>> adds a line)"
          },
          {
            "cmd": "git status",
            "desc": "confirm the junk is now hidden"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is a .gitignore file for?",
        "options": [
          "Deleting files",
          "Listing files Git should not track",
          "Speeding up commits",
          "Storing passwords safely"
        ],
        "answer": 1,
        "explain": "It tells Git which files to skip — secrets, build junk, logs."
      },
      {
        "q": "What does the pattern *.log match?",
        "options": [
          "A folder named log",
          "Only one file called log",
          "Any file ending in .log",
          "Nothing"
        ],
        "answer": 2,
        "explain": "*. means “any name” with that extension — every .log file."
      },
      {
        "q": "Why ignore a file before your first commit?",
        "options": [
          "It's faster",
          "So a secret never gets recorded in history at all",
          "Git requires it",
          "To avoid branches"
        ],
        "answer": 1,
        "explain": "Once committed, a secret lives in history and is hard to fully remove."
      },
      {
        "q": "What does node_modules/ (with a slash) mean?",
        "options": [
          "A single file",
          "Ignore the entire folder",
          "A branch",
          "A remote"
        ],
        "answer": 1,
        "explain": "A trailing slash targets a whole directory."
      }
    ]
  },
  {
    "id": 10,
    "title": "Undoing Mistakes",
    "eyebrow": "Level 10 · The Eraser",
    "badge": "Time Mender",
    "blurb": "Unstage, discard, and safely reverse changes when things go wrong.",
    "tier": "advanced",
    "content": [
      {
        "p": "Everyone makes mistakes — staged the wrong file, want to throw away an edit, or need to undo a commit that's already saved. Git has a precise tool for each situation."
      },
      {
        "h": "Three levels of undo"
      },
      {
        "p": "git restore --staged <file> takes a file back out of the staging area (you staged it by accident). git restore <file> throws away your edits to a file and returns it to the last committed version. Both work before you commit."
      },
      {
        "p": "git revert <commit> is the safe way to undo a commit that's already in history. Instead of deleting it, Git creates a brand-new commit that reverses the changes. Your history stays intact — nothing is rewritten, which is essential when others share the repo."
      },
      {
        "analogy": "restore is an undo button for unsaved work. revert is writing a correction in the next chapter of a published book — you don't tear out the old page, you add one that fixes it."
      },
      {
        "tip": "Prefer revert over deleting history on any branch other people use. It's the polite, non-destructive undo."
      },
      {
        "cmds": [
          {
            "cmd": "git restore --staged <file>",
            "desc": "unstage a file you added by mistake"
          },
          {
            "cmd": "git restore <file>",
            "desc": "discard edits, back to last commit"
          },
          {
            "cmd": "git revert HEAD",
            "desc": "make a new commit that undoes the last one"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "You staged a file by accident. What unstages it?",
        "options": [
          "git delete",
          "git restore --staged <file>",
          "git commit",
          "git push"
        ],
        "answer": 1,
        "explain": "restore --staged pulls it back out of the staging area."
      },
      {
        "q": "How do you safely undo a commit others already have?",
        "options": [
          "Delete the repo",
          "git revert — adds a new commit that reverses it",
          "git restore",
          "Rename the branch"
        ],
        "answer": 1,
        "explain": "revert is non-destructive: it reverses changes with a new commit."
      },
      {
        "q": "git restore <file> (no --staged) does what?",
        "options": [
          "Stages the file",
          "Discards your edits, back to the last commit",
          "Deletes the repo",
          "Pushes the file"
        ],
        "answer": 1,
        "explain": "It throws away working-directory changes to that file."
      },
      {
        "q": "Why prefer revert over deleting history on a shared branch?",
        "options": [
          "It's faster to type",
          "It doesn't rewrite history others depend on",
          "It uses less space",
          "Git forbids deleting"
        ],
        "answer": 1,
        "explain": "Rewriting shared history breaks everyone else's copy — revert is safe."
      }
    ]
  },
  {
    "id": 11,
    "title": "Stashing Work",
    "eyebrow": "Level 11 · The Drawer",
    "badge": "Quartermaster",
    "blurb": "Tuck unfinished changes aside, then bring them back later.",
    "tier": "advanced",
    "content": [
      {
        "p": "Picture this: you're halfway through a feature when an urgent bug needs fixing on another branch. Your work isn't ready to commit, but switching branches would drag your messy changes along. Enter git stash."
      },
      {
        "h": "Stash = a temporary drawer"
      },
      {
        "p": "git stash sweeps all your uncommitted changes into a hidden drawer and gives you a clean working tree instantly. You can switch branches, fix the fire, then run git stash pop to pull your half-done work right back out, exactly as you left it."
      },
      {
        "analogy": "Stashing is sweeping the clutter off your desk into a drawer so you can deal with something urgent — then sliding the drawer back open to carry on."
      },
      {
        "p": "git stash list shows everything you've tucked away. You can stash multiple times; pop takes the most recent back first."
      },
      {
        "tip": "Stash is for short-term juggling, not long-term storage. If work is worth keeping for a while, make a commit on a branch instead."
      },
      {
        "cmds": [
          {
            "cmd": "git stash",
            "desc": "tuck away all uncommitted changes"
          },
          {
            "cmd": "git stash list",
            "desc": "see what's in the drawer"
          },
          {
            "cmd": "git stash pop",
            "desc": "bring your changes back"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What does git stash do?",
        "options": [
          "Commits your changes",
          "Tucks uncommitted changes aside and cleans your tree",
          "Deletes changes",
          "Pushes to GitHub"
        ],
        "answer": 1,
        "explain": "It saves your work-in-progress and gives you a clean slate."
      },
      {
        "q": "How do you get stashed changes back?",
        "options": [
          "git restore",
          "git stash pop",
          "git commit",
          "git merge"
        ],
        "answer": 1,
        "explain": "pop reapplies the most recent stash and removes it from the drawer."
      },
      {
        "q": "When is stashing most useful?",
        "options": [
          "Long-term backups",
          "When you must switch context with unfinished, uncommitted work",
          "Instead of GitHub",
          "To rename branches"
        ],
        "answer": 1,
        "explain": "It's perfect for quickly setting aside messy work to handle something urgent."
      },
      {
        "q": "What does git stash list show?",
        "options": [
          "Your commits",
          "Your branches",
          "The changes you've stashed away",
          "Remote URLs"
        ],
        "answer": 2,
        "explain": "It lists each stash entry waiting in the drawer."
      }
    ]
  },
  {
    "id": 12,
    "title": "Tags & Releases",
    "eyebrow": "Level 12 · The Milestone",
    "badge": "Release Manager",
    "blurb": "Mark important commits as named versions and releases.",
    "tier": "advanced",
    "content": [
      {
        "p": "Commit IDs like 3f9a1c2 are precise but forgettable. When you ship version 1.0 of your project, you want a friendly, permanent bookmark on that exact commit. That's a tag."
      },
      {
        "h": "Tags mark milestones"
      },
      {
        "p": "git tag v1.0.0 sticks a label on the current commit. Tags are commonly used for releases and follow “semantic versioning”: v1.0.0 = MAJOR.MINOR.PATCH. Bump PATCH for fixes, MINOR for new features, MAJOR for breaking changes."
      },
      {
        "p": "An annotated tag (git tag -a v1.0.0 -m \"message\") stores extra info: who made it, when, and a note. These are the recommended kind for real releases. On GitHub, pushed tags become Releases people can download."
      },
      {
        "analogy": "Tags are the chapter bookmarks in your project's story — “Chapter 1: First Release” — so you and others can jump straight to any milestone."
      },
      {
        "tip": "Tags don't move. Unlike a branch (which advances with each commit), a tag stays pinned to the exact commit you put it on, forever."
      },
      {
        "cmds": [
          {
            "cmd": "git tag v1.0.0",
            "desc": "bookmark the current commit as a version"
          },
          {
            "cmd": "git tag -a v1.1.0 -m \"note\"",
            "desc": "annotated tag for a real release"
          },
          {
            "cmd": "git tag",
            "desc": "list all your tags"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What is a Git tag?",
        "options": [
          "A branch",
          "A permanent label on a specific commit",
          "A commit message",
          "A remote"
        ],
        "answer": 1,
        "explain": "Tags bookmark exact commits — usually for versions and releases."
      },
      {
        "q": "In v2.3.1, what does the 2 represent?",
        "options": [
          "The patch number",
          "The MAJOR version (breaking changes)",
          "The day",
          "The branch count"
        ],
        "answer": 1,
        "explain": "Semantic versioning is MAJOR.MINOR.PATCH — 2 is MAJOR."
      },
      {
        "q": "How does a tag differ from a branch?",
        "options": [
          "Tags move with new commits",
          "A tag stays pinned to one commit; a branch advances",
          "Tags can't be pushed",
          "They're identical"
        ],
        "answer": 1,
        "explain": "Branches move forward; tags stay fixed on their commit."
      },
      {
        "q": "Which makes an annotated release tag?",
        "options": [
          "git tag v1",
          "git tag -a v1.0.0 -m \"msg\"",
          "git branch v1",
          "git commit -m v1"
        ],
        "answer": 1,
        "explain": "-a creates an annotated tag with author, date, and a message."
      }
    ]
  },
  {
    "id": 13,
    "title": "Rebasing",
    "eyebrow": "Level 13 · The Straightener",
    "badge": "History Architect",
    "blurb": "Replay your commits onto the latest main for a clean, linear history.",
    "tier": "advanced",
    "content": [
      {
        "p": "When you work on a branch while main keeps moving, your history forks and the graph gets tangled with merge commits. Rebasing is an alternative to merging that keeps history beautifully linear."
      },
      {
        "h": "Rebase = move your branch's base"
      },
      {
        "p": "git rebase main lifts the commits you made on your branch and replays them one by one on top of main's latest commit — as if you'd started your work from there all along. No merge commit, just a clean straight line."
      },
      {
        "analogy": "Imagine you built an extension off the old back wall of a house, but the house got renovated. Rebasing carefully detaches your extension and reattaches it to the new wall — same work, now fitting the updated structure."
      },
      {
        "p": "There's one golden rule: never rebase commits you've already pushed and shared. Rebasing rewrites commit history, and rewriting shared history confuses everyone else's copy. Rebase your own local work before sharing it — that's the sweet spot."
      },
      {
        "tip": "Merge preserves the exact branching story; rebase rewrites it into a tidy line. Teams pick one style. Both are valid — now you understand the trade-off."
      },
      {
        "cmds": [
          {
            "cmd": "git rebase main",
            "desc": "replay your branch on top of main"
          },
          {
            "cmd": "git switch main",
            "desc": "then move to main…"
          },
          {
            "cmd": "git merge <branch>",
            "desc": "…to fast-forward it in cleanly"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What does git rebase main do (from your branch)?",
        "options": [
          "Deletes main",
          "Replays your commits on top of main's latest commit",
          "Pushes to GitHub",
          "Creates a merge commit"
        ],
        "answer": 1,
        "explain": "It moves your branch's base forward, producing linear history."
      },
      {
        "q": "What's the golden rule of rebasing?",
        "options": [
          "Always rebase everything",
          "Never rebase commits you've already pushed/shared",
          "Rebase only on Fridays",
          "Rebase before every commit"
        ],
        "answer": 1,
        "explain": "Rewriting shared history breaks everyone else's copy."
      },
      {
        "q": "How does rebase differ from merge?",
        "options": [
          "They're identical",
          "Rebase keeps a linear history; merge records the branch split",
          "Rebase deletes commits",
          "Merge is always better"
        ],
        "answer": 1,
        "explain": "Rebase rewrites into a clean line; merge preserves the branching story."
      },
      {
        "q": "Rebasing is safest on…",
        "options": [
          "Shared main",
          "Your own local, unpushed work",
          "Deleted branches",
          "The remote directly"
        ],
        "answer": 1,
        "explain": "Tidy up your local commits before you share them."
      }
    ]
  },
  {
    "id": 14,
    "title": "Pro Habits",
    "eyebrow": "Level 14 · The Craft",
    "badge": "Git Sage",
    "blurb": "Identity, diffs, aliases, and the habits that make Git effortless.",
    "tier": "advanced",
    "content": [
      {
        "p": "You now know the whole core toolkit. This final level is about the habits that separate someone who fights Git from someone who flows with it."
      },
      {
        "h": "Set your identity"
      },
      {
        "p": "Configure who you are once, and every commit gets stamped correctly: git config --global user.name and user.email. The --global flag means it applies to all your projects."
      },
      {
        "h": "Look before you leap"
      },
      {
        "p": "git diff shows the exact lines you changed before you stage or commit. Running it as a reflex prevents committing debug code or stray edits. Review, then commit."
      },
      {
        "h": "Write commits your future self will thank you for"
      },
      {
        "p": "Good messages are short, in the present tense, and say what the change does: “Add login form”, not “stuff”. Future-you reading the log will understand the story at a glance."
      },
      {
        "h": "Aliases = speed"
      },
      {
        "p": "Create shortcuts for commands you type constantly: git config --global alias.st status lets you type git st. Small thing, huge daily payoff."
      },
      {
        "tip": "The loop you'll run thousands of times: edit → git diff → git add → git commit → git push. It becomes muscle memory faster than you'd think."
      },
      {
        "cmds": [
          {
            "cmd": "git config --global user.name \"You\"",
            "desc": "stamp commits with your name"
          },
          {
            "cmd": "git diff",
            "desc": "review changes before committing"
          },
          {
            "cmd": "git config --global alias.co checkout",
            "desc": "make a handy shortcut"
          }
        ]
      }
    ],
    "quiz": [
      {
        "q": "What does git config --global user.name do?",
        "options": [
          "Renames a branch",
          "Sets the author name stamped on your commits",
          "Logs you into GitHub",
          "Creates a repo"
        ],
        "answer": 1,
        "explain": "It sets your identity for commits across all projects."
      },
      {
        "q": "Why run git diff before committing?",
        "options": [
          "It's required",
          "To review exactly what changed and avoid committing mistakes",
          "To push faster",
          "To create a branch"
        ],
        "answer": 1,
        "explain": "Reviewing changes catches stray edits and debug code."
      },
      {
        "q": "What makes a good commit message?",
        "options": [
          "As long as possible",
          "Short, present-tense, says what the change does",
          "Just the date",
          "Random characters"
        ],
        "answer": 1,
        "explain": "“Add login form” tells the story; “stuff” tells you nothing."
      },
      {
        "q": "What's a Git alias?",
        "options": [
          "A second username",
          "A shortcut for a command you type often",
          "A type of branch",
          "A backup"
        ],
        "answer": 1,
        "explain": "alias.st = status lets you type git st — small wins add up."
      }
    ]
  }
];

export const TOTAL_LESSONS = LESSONS.length;
export function lessonById(id) { return LESSONS.find((l) => l.id === id); }

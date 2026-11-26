# job-search-agent

An AI agent system that runs my job search every morning. It finds new roles across job boards and employers' own applicant tracking systems, checks each one is really live, filters them against my criteria, and writes a ready-to-submit pack for the best matches: a role-specific cover letter, a CV verdict, and an answer to every question on the real application form. I review and submit; the agent never applies on my behalf.

This repo is the code and design. The live system runs in a Claude project; personal data (CV, letters, applications, voice guide) is kept out of here.

## How it fits together

```
                  ┌──────────────────────────── Claude project ────────────────────────────┐
  me ── chat ──▶  │  Coordinator  ── spawns ──▶  threads (one per piece of work)           │
                  │      │                         e.g. "Automate daily job applications"  │
                  │      │                                                                │
                  │  shared memory (goals, rules, never-again list)  +  project files       │
                  │      ▲                                                                │
                  │      │ reads RUNBOOK.md every run                                      │
                  │  Scheduled run, 07:43 daily ───────────────┐                           │
                  └────────────────────────────────────────────┼───────────────────────────┘
                                                               │ drives
                                               ┌───────────────▼───────────────┐
                                               │ Built-in browser in the Claude │
                                               │ desktop app on my Mac          │
                                               │  • LinkedIn guest search       │
                                               │  • Indeed UK                   │
                                               │  • Greenhouse / Ashby / Lever  │
                                               │  • employer apply pages        │
                                               └───────────────┬───────────────┘
                                                               │ writes
                                               ┌───────────────▼───────────────┐
                                               │ Job Inbox app (artifact + db)  │
                                               │ roles · runs · applications    │
                                               └────────────────────────────────┘
```

**Coordinator and threads.** I talk to one coordinator agent in a project chat. It spins up a separate agent thread for each piece of work (the daily run, tracking applications, interview prep, a single cover letter) and they share one memory store. Anything I tell one of them that matters later, like "don't suggest this company again" or "letters are too casual", is written to memory, so every future run follows it.

**Why the browser runs on my Mac.** Job boards and ATS pages block cloud traffic. So the scheduled agent runs in the cloud but drives the built-in browser pane of the Claude desktop app on my own machine, which looks like a normal visitor. If the Mac is asleep, the run says it couldn't verify listings rather than guessing.

**Discovery.** Two scripts are injected into the browser with a javascript tool:
- [`scripts/linkedin-board-scan.js`](scripts/linkedin-board-scan.js): ~45 role queries × 2 locations through LinkedIn's guest jobs endpoint, paginated, de-duplicated, with back-off on rate limits.
- [`scripts/ats-board-scan.js`](scripts/ats-board-scan.js): sweeps ~60 target employers' own Greenhouse, Ashby and Lever boards in parallel, filtered by role family, UK location and seniority.

Plus Indeed page text and a few targeted web searches.

**Verification.** Nothing is suggested unless it's confirmed live on the employer's own careers page that day, and the link I get is always the employer's own apply page. This rule exists because an early run suggested a role that had already closed.

**Seen list.** Every role looked at goes into `seen.csv` with a decision, so nothing is shown twice, and the reason for each skip is logged.

**Role packs.** For the best 1 to 3 matches, the agent opens the real application form, reads every field, and writes:
1. Links and pay (listed, or an estimate marked as one)
2. CV check: send as is, small tweaks, or needs big changes, with the exact edits
3. A cover letter tied to that company's product and customers
4. Answers to every form question within its character limits, with ⚠ on anything only I can answer, and a "before you press Submit" list

Writing follows a voice guide built from my own emails, with a checklist of stock AI phrasing to strip out. See [`examples/role-pack.example.json`](examples/role-pack.example.json) for the shape.

**Job Inbox app.** [`app/job-inbox.html`](app/job-inbox.html) is a single-file web app published as a Claude artifact, backed by a small shared database:

| Collection | What's in it |
|---|---|
| `roles` | One doc per role pack. The Inbox tab and a page per job, with copy buttons for each form answer and a cover-letter PDF export. "Skip" and "I've applied" buttons write back status. |
| `runs` | One doc per daily run: what was searched, how many listings, sources, and every role dropped with the reason. |
| `applications` | The master list of applications and their status, shown on the Applications and Dashboard tabs (weekly volume, status breakdown, response rate). |

The next morning's run reads those button presses back, so the app and the agent stay in sync: what I mark applied or skipped never comes back.

## Files

| Path | Purpose |
|---|---|
| `RUNBOOK.md` | The step-by-step instructions the scheduled agent reads every run |
| `scripts/` | Browser-side discovery scripts |
| `app/job-inbox.html` | The Job Inbox app (set your name and contact line in `PROFILE` at the top of the script) |
| `examples/` | Sanitised examples of a role pack, `seen.csv` and `applications.csv` |

## Design choices
- **Human submits.** The agent prepares everything but never applies, creates accounts or contacts employers.
- **Memory over prompts.** Feedback becomes durable rules in shared memory rather than being repeated each day.
- **Verify before suggesting.** Live checks on the employer's own ATS, every time.
- **One place to look.** Results land in the app, not in chat; chat gets one line and a link.

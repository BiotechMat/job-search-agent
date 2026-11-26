# Daily run: runbook

This is the instruction file the scheduled agent reads at the start of every run (07:43 UK time, weekdays and weekends). It is written for an agent, not a person. Personal details, the candidate's voice guide and the list of past applications live in private project files and memory, not in this repo.

## Inputs read every run
- Project memory: goals, target roles, pay band, location, writing rules, companies to never suggest again.
- `applications.csv` (master list mirror) and `seen.csv` (every role ever looked at, with a decision). Anything in either is never suggested again.
- `voice.md`: the candidate's own writing style guide, with an anti-AI-phrasing checklist. Every letter and form answer must pass it.
- The candidate's CV (PDF).

## 1. Discover (job boards first)
1. Open `https://www.linkedin.com/jobs/search?...` in the desktop app's built-in browser (guest, no login) and run `scripts/linkedin-board-scan.js` with the javascript tool. Set `window.__DAYS=3` so a missed day is covered; `seen.csv` stops repeats. The script fans out ~45 queries x 2 locations through LinkedIn's guest endpoint and backs off on HTTP 429.
2. Second sources: Indeed UK page text (`fromage=3`, often shows salaries); `scripts/ats-board-scan.js` run from a `boards-api.greenhouse.io` page, which sweeps ~60 target employers' Greenhouse, Ashby and Lever boards directly; 2-3 web searches. Glassdoor, Reed, Totaljobs and CV-Library are fallbacks when LinkedIn looks thin.
3. Weekly: a wider sweep with a broader query list and `__DAYS=7`.

## 2. Verify
Every pick is confirmed live on the employer's own careers page or ATS (Greenhouse, Lever, Ashby, Workday...) that day. The link handed over is always the employer's own apply page, never a job board link. Agency ads only count if the real employer's listing can be found.

## 3. Filter
Sector and company type, role family (commercial, presales, solutions, account management, partnerships), seniority (no director/VP), location (commutable or UK remote), pay band (drop roles clearly below target), language requirements, and the never-again list.

## 4. Write one pack per role (best 1-3 matches)
Each pack has four parts, always:
- **Links**: employer job page and apply link (opened that day), plus pay if listed or a marked estimate.
- **CV check**: "send as is", "small tweaks" or "needs big changes", with the specific edits for this role, and any must-have the candidate doesn't meet.
- **Cover letter**: tied to this company's product and customers, in the candidate's voice per `voice.md`, checklist run, words counted.
- **Application form**: open the real apply page, read every field (Lever: `.application-question, .application-additional, .custom-question`; otherwise page text and multi-step pages, never submitting), answer every question within its character limit, mark with ⚠ only what the candidate must decide (right to work, diversity, declarations, guesses), and end with a "before you press Submit" list. Never invent facts. If a form needs an account first, say so and don't create one.

## 5. Record and deliver
1. Read the Job Inbox app's `roles` and `applications` collections. Roles marked skipped or applied go into `seen.csv`; an applied role with no `applications` doc gets one.
2. Rewrite `applications.csv` from the `applications` collection as a backup mirror (never delete from either side; rows only in the CSV are added to the app).
3. Write each pack as a `roles` doc (id `YYYY-MM-DD-company-role`) and as a JSON file in a dated folder.
4. Write a `runs` doc: one-line note, number scanned, sources, and every role looked at closely and dropped, with the reason.
5. Post one line in the thread: how many new roles, with the app link. No attachments.

## Hard rules
- Never submit an application, create an account or contact an employer. The candidate submits.
- If the computer or built-in browser can't be reached, don't suggest unverified roles; say the run couldn't verify listings.

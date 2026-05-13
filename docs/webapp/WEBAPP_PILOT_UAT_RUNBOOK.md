# WebApp Pilot UAT Runbook

Operational playbook for the staff trial against the Phase 94 frozen WebApp. Use alongside the role-specific scripts (`WEBAPP_ADMIN_UAT_SCRIPT.md`, `WEBAPP_SUPERVISOR_UAT_SCRIPT.md`, `WEBAPP_OPERATOR_UAT_SCRIPT.md`).

---

## 1. Session preparation (0.5 day)

- [ ] Confirm latest `phase/from-v2.4.1-TASK-FIN` is deployed (`clasp push --force` + Apps Script → Deploy → New version).
- [ ] Confirm the spreadsheet menu shows `🧪 CBV Test Console → Phase 95 — Pilot UAT`.
- [ ] Run `Phase 94 — UI Freeze / UAT → Run UI Freeze Health Check` → must be `GO` or `GO_WITH_WARNINGS`.
- [ ] Run `Phase 95 — Pilot UAT → Run Pilot UAT Readiness Check` → must be `GO` or `GO_WITH_WARNINGS`.
- [ ] Prepare device matrix: at least one Desktop (1280×800 or better), one Tablet (1024×768), two Mobile devices (414×896 + 360×800).
- [ ] Prepare test accounts: one Admin, one Supervisor, two Operators.
- [ ] Sanity-check sample data: `HOME_ALERT` has ≥10 rows; `CBV_TEST_REPORTS` and reference sheets present (or accept the documented warnings).
- [ ] Brief participants: this is read-first; no buttons should perform writes. If they think a button writes, **that is feedback, not a bug to silence**.

## 2. Test flow

Sessions can run in parallel or in this order:

1. **Operator session(s)** — day 1.
2. **Supervisor session** — day 2.
3. **Admin session** — day 3.

For each session:

1. The tester opens a fresh browser / private window.
2. The shadow observer prepares a blank feedback log (one row per step per route, or per anomaly).
3. The tester walks through the role script step by step, reading the expected result before observing.
4. The observer captures one feedback row whenever:
   - The result deviates from expected.
   - The tester is confused.
   - The tester suggests a fix.
   - The tester reports unexpected speed / usability concerns.
5. The observer asks for `SPEED_RATING` and `USABILITY_RATING` (1–5) at the end of each route segment.
6. If a step fails outright, the observer records `RESULT=FAIL` with the appropriate `SEVERITY`.

## 3. Recording rules

- **Append-only.** Never edit or delete a recorded feedback row. Add a follow-up row instead.
- **Verbatim error messages.** Copy the text the tester sees; do not paraphrase.
- **One severity per row.** If a step touches multiple issues, log multiple rows.
- **`IS_BLOCKER=true` iff `SEVERITY=BLOCKER`.** Never `IS_BLOCKER=true` with a lower severity.
- **Tester role mismatches.** If an Operator stumbles into Admin behaviour, record under their assigned `TESTER_ROLE` — that is itself useful signal.

## 4. Feedback capture

The feedback row must conform to `WEBAPP_UAT_FEEDBACK_SCHEMA.md` (17 fields).

Recommended storage options (pick **one** per pilot):

- **Sheet** named e.g. `WEBAPP_UAT_RESULTS` — append-only, columns from the schema, **not auto-created** (must be manually prepared per `WEBAPP_UAT_RESULT_LOG_CONTRACT.md`).
- **Structured doc** (Markdown / Google Doc) — one section per session, one table per route.
- **Test Console JSON archives** — every `Run Pilot UAT Readiness Check` JSON is archived alongside the feedback log.

## 5. Triage flow

After all sessions:

1. Convene the triage call (UAT lead + Phase 95 owner + at least one role rep).
2. Classify each feedback row per `WEBAPP_UAT_ISSUE_TRIAGE_MATRIX.md`.
3. Cluster duplicates; do not delete originals.
4. Decide GO / GO_WITH_WARNINGS / NO_GO per `WEBAPP_PILOT_GO_NO_GO_CRITERIA.md`.
5. Draft `WEBAPP_PILOT_SIGNOFF_TEMPLATE.md` immediately after triage; circulate for signatures.

## 6. Signoff flow

- Each signoff is recorded in a copy of `WEBAPP_PILOT_SIGNOFF_TEMPLATE.md` stored under `00_SYSTEM_BRAIN/001_HANDOFF/` (or the team's chosen audit location).
- Signoff includes:
  - Date, session IDs, participants.
  - Final result (GO / GO_WITH_WARNINGS / NO_GO).
  - List of BLOCKER / HIGH issues + waivers.
  - Next step (Phase 96 mutation design vs. Phase 96 UAT Fix Pack).
- Signatures are typed names + dates; no electronic signature widget is required for pilot.

## 7. Forbidden during the trial

- **Do not add WebApp write buttons.** Even temporarily.
- **Do not add AppSheet Bot.** Even temporarily.
- **Do not run auto assign / auto resolve / auto escalate scripts.**
- **Do not edit recorded feedback rows.** Append a correction row instead.
- **Do not mark anything "production-ready"** in any artefact.

## 8. After the trial

- Archive the Phase 94 + Phase 95 Test Console reports next to the feedback log.
- If GO / GO_WITH_WARNINGS → plan **Phase 96 — Controlled WebApp Action Design / Mutation Guard Blueprint**.
- If NO_GO → plan **Phase 96 — UAT Fix Pack** (NOT mutation design).
- Update `00_SYSTEM_BRAIN/001_HANDOFF/` with the signoff document.

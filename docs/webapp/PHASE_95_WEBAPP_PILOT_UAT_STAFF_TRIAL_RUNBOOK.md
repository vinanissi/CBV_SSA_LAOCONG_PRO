# PHASE 95 — WebApp Pilot UAT / Staff Trial Runbook

**Status:** Pilot UAT readiness (pilot tier, runbook-only).  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Standard:** CBV Operational Ecosystem Standard V1 · CBV_TCS_V1.  
**Phase scope:** runbook / operational ergonomics. **No new feature. No new mutation.**

---

## 1. Phase purpose

Phase 94 froze the WebApp UI foundation. Phase 95 defines **how** real staff will trial that frozen surface: who participates, in what order, with what scripts, capturing what feedback, triaging which severities, deciding on go/no-go.

Phase 95 deliberately:

- **Does not** add new business features.
- **Does not** open any write / mutation path.
- **Does not** add AppSheet Bot or AI runtime.
- **Does not** claim production readiness.

## 2. Why staff trial now

- Phase 94 confirms the UI contract is consistent and verifiable.
- The Phase 94 mutation validator is clean.
- Without staff-level UAT, the pilot tier is structurally complete but not operationally validated.
- Phase 95 produces the artefacts that justify (or block) Phase 96's mutation-design work.

## 3. Scope

In scope:

- Pilot UAT runbook (`WEBAPP_PILOT_UAT_RUNBOOK.md`).
- Staff scripts for Admin / Supervisor / Operator.
- Feedback schema (17 fields) + optional sheet contract (append-only).
- Issue triage matrix (BLOCKER / HIGH / MEDIUM / LOW / OBSERVATION).
- Go / no-go criteria + waiver rules.
- Pilot signoff template.
- Phase 95 Test Console under `🧪 CBV Test Console → Phase 95 — Pilot UAT`.
- Reuse of `WEBAPP_ROUTE_SMOKE_TEST_MATRIX.md` from Phase 94.

Out of scope:

- New WebApp feature.
- Write actions / mutation runtime / controlled writeback.
- AI assist / automation runtime.
- AppSheet Bot.
- Production certification.

## 4. Required participants

- **Admin** — at least 1. Covers `/runtime/health`, `/reports`, `/admin/reference`, `?action=ping`.
- **Supervisor** — at least 1. Covers `/home-alert/sla`, `/home-alert/timeline`, `/home-alert/kanban`.
- **Operator** — at least 2. Covers `/workspace`, `/home-alert/my-queue` on desktop + tablet + mobile.

A "shadow observer" (note-taker) is recommended for each session — they fill the feedback rows so the tester stays focused on the WebApp.

## 5. Expected output

After the trial, the following are produced:

1. **Feedback log** — rows matching `WEBAPP_UAT_FEEDBACK_SCHEMA.md` (17 fields per row), captured either in a sheet (per `WEBAPP_UAT_RESULT_LOG_CONTRACT.md`) or in a structured doc.
2. **Triaged issue list** — each issue classified per `WEBAPP_UAT_ISSUE_TRIAGE_MATRIX.md`.
3. **Pilot signoff** — filled `WEBAPP_PILOT_SIGNOFF_TEMPLATE.md` recording GO / GO_WITH_WARNINGS / NO_GO and waivers.
4. **Updated CBV_TCS_V1 report** — output of `CbvWebAppUat_TestConsole_run()` archived for audit.

## 6. Safety rules

1. **No mutation.** Phase 95 namespace (`CbvWebAppUat_*`) is scanned by the verb-at-start + allowlist validator. The trial itself must not introduce mutation paths.
2. **No production-ready claim.** Anywhere.
3. **No auto assign / auto resolve / auto escalate.** Anywhere.
4. **No AppSheet Bot.** Anywhere.
5. **No AI runtime / ENV-A / queue intelligence.** Anywhere.
6. **Append-only feedback.** No silent edits or deletes of recorded feedback rows.
7. **Human-in-the-loop.** All decisions (severity, waivers, go/no-go) require a human signoff.

## 7. Next step

- Run the staff trial per `WEBAPP_PILOT_UAT_RUNBOOK.md`.
- Collect feedback per `WEBAPP_UAT_FEEDBACK_SCHEMA.md`.
- Triage per `WEBAPP_UAT_ISSUE_TRIAGE_MATRIX.md`.
- Decide per `WEBAPP_PILOT_GO_NO_GO_CRITERIA.md`.
- Record signoff per `WEBAPP_PILOT_SIGNOFF_TEMPLATE.md`.

Then:

- **GO** or **GO_WITH_WARNINGS** → plan **Phase 96 — Controlled WebApp Action Design / Mutation Guard Blueprint**.
- **NO_GO** → plan **Phase 96 — UAT Fix Pack** (NOT mutation design).

## 8. References

- `00_SYSTEM_BRAIN/000_TEST_CONSOLE/CBV_TCS_V1/docs/CBV_TCS_V1_STANDARD.md`
- `docs/webapp/PHASE_94_WEBAPP_UI_FOUNDATION_FREEZE_UAT_HARDENING.md`
- `docs/webapp/WEBAPP_UI_FOUNDATION_STANDARD.md`
- `docs/webapp/WEBAPP_ROUTE_FREEZE_MATRIX.md`
- `docs/webapp/WEBAPP_ROUTE_SMOKE_TEST_MATRIX.md`
- `docs/webapp/WEBAPP_SAFETY_FOOTER_STANDARD.md`
- `00_SYSTEM_BRAIN/002_DECISIONS/033_WEBAPP_UI_FOUNDATION_FREEZE_DECISION.md`

# WebApp Pilot Go / No-Go Criteria

Decision rules applied at the end of the Phase 95 staff trial. Source of truth: `CbvWebAppUat_getGoNoGoCriteria()`.

---

## 1. GO

All of the following must hold:

- All operational routes open and render the expected page.
- **No BLOCKER** captured.
- **No security leakage** — no plain secrets / tokens / API keys; emails masked.
- **No mutation UI** — no edit / save / delete / toggle / drag-drop save / assign / resolve / escalate buttons visible.
- Operators understand the main queue workflow without external help on **at least 80%** of cards.
- Supervisor can interpret SLA, Timeline, and Kanban states.
- Admin can read runtime health, reports, and governance summaries.
- All four safety footer phrases (verbatim) present on every operational route, plus `No drag-drop save` on Timeline / Kanban.
- Phase 94 + Phase 95 Test Console reports both return `GO` or `GO_WITH_WARNINGS`.

## 2. GO_WITH_WARNINGS

All GO criteria hold, plus:

- **No BLOCKER.**
- **At most 2 HIGH** issues, each with an explicit waiver recorded in the signoff template.
- MEDIUM items captured as tracked follow-ups.
- LOW / OBSERVATION items logged for backlog or future polish.

## 3. NO_GO

Any one of the following triggers `NO_GO`:

- Any BLOCKER captured.
- Any security leak — plain-text secret / token / API key / unmasked email anywhere in the WebApp.
- Any route crashes or white-screens on a supported breakpoint.
- Any fake mutation UI visible — a button that looks like it writes but does nothing (operators may try anyway, which is unsafe).
- Operator cannot use the My Queue core workflow.
- Any production-ready claim observed in WebApp UI / reports / handoffs.
- More than 2 HIGH issues, or any HIGH issue without a recorded waiver.
- Phase 94 or Phase 95 Test Console returns `FAIL`.

## 4. Waiver rules

A waiver is a written, signed acknowledgement in the signoff template explaining:

1. The HIGH issue (route, scenario, severity).
2. The operational mitigation in the meantime.
3. The planned fix window.

Constraints:

- **Maximum 2 waivers** per pilot.
- Waivers are **append-only** — they cannot be silently rescinded.
- A waiver is **never** allowed for a BLOCKER.
- A waiver requires both the UAT lead and the Phase 95 owner signatures.

## 5. Next step matrix

| Pilot outcome | Phase 96 must be |
|---------------|------------------|
| GO | Phase 96 — Controlled WebApp Action Design / Mutation Guard Blueprint |
| GO_WITH_WARNINGS | Phase 96 — Controlled WebApp Action Design / Mutation Guard Blueprint (with HIGH waivers tracked as first items) |
| NO_GO | Phase 96 — UAT Fix Pack (**NOT** mutation design). Address BLOCKERs first; re-run the relevant scripts; schedule another pilot. |

## 6. Decision recording

The outcome must be recorded in:

1. `WEBAPP_PILOT_SIGNOFF_TEMPLATE.md` (filled copy stored under `00_SYSTEM_BRAIN/001_HANDOFF/`).
2. A successor decision file under `00_SYSTEM_BRAIN/002_DECISIONS/` if the outcome triggers Phase 96 mutation design (i.e. references Phase 94's freeze decision and announces controlled mutation design intent).

## 7. Anti-patterns to reject

- Marking the pilot `GO_WITH_WARNINGS` while one of the four base safety phrases is missing → that is a HIGH issue without a valid waiver path; reclassify as BLOCKER.
- Marking the pilot `GO` while emails are visible in plain text → reclassify as BLOCKER.
- Claiming `GO` because "the BLOCKER is intermittent" → intermittent BLOCKERs are still BLOCKERs.
- Skipping mobile breakpoints because "operators usually use desktop" → mobile is part of the frozen baseline.

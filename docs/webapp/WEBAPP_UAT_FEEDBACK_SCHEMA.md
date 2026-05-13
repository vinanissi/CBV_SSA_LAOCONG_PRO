# WebApp UAT Feedback Schema

Frozen field set for every feedback row captured during the Phase 95 staff trial. Source of truth: `CbvWebAppUat_getFeedbackSchema()`.

---

## 1. Field definitions

| # | Field | Type | Required | Allowed values | Description |
|---|-------|------|----------|----------------|-------------|
| 1 | `UAT_ID` | STRING | Yes | — | Unique row id, e.g. `UAT-2026-05-13-001`. |
| 2 | `SESSION_ID` | STRING | Yes | — | Session grouping id (one per role-day, e.g. `S-2026-05-13-ADMIN`). |
| 3 | `TEST_DATE` | DATE | Yes | ISO `YYYY-MM-DD` | Date of the test. |
| 4 | `TESTER_EMAIL` | STRING | Yes | corporate email | Tester identity. |
| 5 | `TESTER_ROLE` | ENUM | Yes | `Admin` · `Supervisor` · `Operator` | Role under test. |
| 6 | `ROUTE` | STRING | Yes | one of the frozen routes or `?action=ping` | What was tested. |
| 7 | `DEVICE_TYPE` | ENUM | Yes | `Desktop` · `Tablet` · `Mobile` | Device category. |
| 8 | `SCENARIO` | STRING | Yes | step id (`A1..A10`, `S1..S9`, `O1..O9`) or free-form scenario name | Which step / scenario. |
| 9 | `RESULT` | ENUM | Yes | `PASS` · `WARN` · `FAIL` | Step result. |
| 10 | `SEVERITY` | ENUM | Yes | `BLOCKER` · `HIGH` · `MEDIUM` · `LOW` · `OBSERVATION` | Severity per triage matrix. |
| 11 | `SPEED_RATING` | INT | No | 1–5 | Subjective speed rating (5 = fastest). |
| 12 | `USABILITY_RATING` | INT | No | 1–5 | Subjective usability rating (5 = easiest). |
| 13 | `CONFUSION_POINT` | TEXT | No | free text | Where the tester got confused. |
| 14 | `ERROR_MESSAGE` | TEXT | No | verbatim text | Error / warning text observed (verbatim). |
| 15 | `SUGGESTED_FIX` | TEXT | No | free text | Tester-suggested fix or wording change. |
| 16 | `IS_BLOCKER` | BOOL | Yes | `true` / `false` | `true` **iff** `SEVERITY = BLOCKER`. |
| 17 | `CREATED_AT` | TIMESTAMP | Yes | ISO `YYYY-MM-DDTHH:mm:ssZ` | Time of capture. |

## 2. Severity mapping

`SEVERITY` is the central field. It determines:

- whether the row blocks pilot signoff,
- whether the row needs a waiver,
- whether the row is tracked as a follow-up,
- whether the row is informational only.

See `WEBAPP_UAT_ISSUE_TRIAGE_MATRIX.md` for the full mapping.

## 3. Validation rules

1. **`IS_BLOCKER`-`SEVERITY` consistency.** `IS_BLOCKER = true` if and only if `SEVERITY = BLOCKER`. Validators should reject inconsistencies.
2. **Append-only.** Never edit or delete a recorded row. Add a follow-up row (link via `SUGGESTED_FIX` or a free-text reference) instead.
3. **Verbatim error text.** Do not paraphrase `ERROR_MESSAGE`; capture what the user sees.
4. **Role-route consistency.** Operator rows should not generally reference `/admin/reference`; if they do, flag in `SUGGESTED_FIX` so reviewers can see why.
5. **`SPEED_RATING` / `USABILITY_RATING`** are optional but strongly recommended for at least one row per route per device.

## 4. Allowed values quick-reference

- `TESTER_ROLE`: `Admin`, `Supervisor`, `Operator`.
- `DEVICE_TYPE`: `Desktop`, `Tablet`, `Mobile`.
- `RESULT`: `PASS`, `WARN`, `FAIL`.
- `SEVERITY`: `BLOCKER`, `HIGH`, `MEDIUM`, `LOW`, `OBSERVATION`.
- `ROUTE` (operational): `/workspace`, `/home-alert/my-queue`, `/home-alert/sla`, `/home-alert/timeline`, `/home-alert/kanban`, `/runtime/health`, `/reports`, `/admin/reference`.
- `ROUTE` (support): `?action=ping`.

## 5. Privacy

- `TESTER_EMAIL` is corporate. Outside the audit log, prefer `TESTER_ROLE` in summaries.
- No customer / borrower PII is required by the schema. If a tester accidentally pastes PII into `CONFUSION_POINT` or `ERROR_MESSAGE`, redact in a follow-up row and document the redaction (append-only).

## 6. Storage

Two acceptable storage modes:

1. **Sheet** named e.g. `WEBAPP_UAT_RESULTS` — per `WEBAPP_UAT_RESULT_LOG_CONTRACT.md`. Append-only, columns from this schema, manually prepared (no auto-create from Phase 95).
2. **Structured doc** (Markdown / Google Doc) — one table per session, columns from this schema.

Whichever storage is chosen, an export to JSON is recommended so that future phases can index past UAT decisions.

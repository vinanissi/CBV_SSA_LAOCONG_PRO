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

---

## 7. Phase 97 — Operational capture sheet `CBV_WEBAPP_UAT_FEEDBACK`

**Source of truth (runtime):** `CbvWebAppStaffTrial_getFeedbackSchema()` trong `05_GAS_RUNTIME/998J_WEBAPP_STAFF_TRIAL_RUNTIME.js`.

Phase **95** (mục 1–6 trên) mô tả **bộ trường scripted UAT** (17 cột, ví dụ `UAT_ID`, `RESULT`, …) dùng cho bảng/log tùy chọn như `WEBAPP_UAT_RESULTS`.  
Phase **97** thêm **một sheet Google riêng** tên cố định **`CBV_WEBAPP_UAT_FEEDBACK`** với **23 cột** dưới đây — dùng cho staff trial, ghi qua menu/API `CbvWebAppStaffTrial_createFeedback` (chỉ append dòng feedback, **không** ghi TASK_MAIN).

| # | Column | Required (API) | Type / enum | Description |
|---|--------|----------------|-------------|---------------|
| 1 | `FEEDBACK_ID` | auto | string | Id duy nhất (sinh tự động, ví dụ `FB-…`). |
| 2 | `CREATED_AT` | auto | timestamp | Thời điểm tạo dòng. |
| 3 | `CREATED_BY` | auto nếu có Session | email / id | Người ghi; có thể truyền trong payload. |
| 4 | `ROLE` | **Yes** | `Admin` · `Supervisor` · `Operator` | Vai trò trial. |
| 5 | `TRIAL_SESSION_ID` | No | string | Nhóm phiên (ví dụ `S-2026-05-14-OP`). |
| 6 | `ROUTE` | **Yes** | frozen route hoặc `?action=ping` | Route đang thử. |
| 7 | `DEVICE_TYPE` | No | string | e.g. Desktop / Tablet / Mobile. |
| 8 | `SCREEN_SIZE` | No | string | Ghi chú viewport nếu cần. |
| 9 | `TASK_CONTEXT` | No | string | Ngữ cảnh tác vụ (không bắt buộc mã task). |
| 10 | `FEEDBACK_TYPE` | **Yes** | `NAVIGATION` · `MOBILE_UI` · `COPY_CONFUSION` · `DATA_CONFUSION` · `PERFORMANCE` · `ACCESS` · `SAFETY` · `OTHER` | Phân loại. |
| 11 | `SEVERITY` | **Yes** | `LOW` · `MEDIUM` · `HIGH` · `CRITICAL` | Mức độ. |
| 12 | `TITLE` | **Yes** | string | Tiêu đề ngắn. |
| 13 | `DESCRIPTION` | No | text | Mô tả chi tiết. |
| 14 | `EXPECTED_BEHAVIOR` | No | text | Kỳ vọng. |
| 15 | `ACTUAL_BEHAVIOR` | No | text | Quan sát thực tế. |
| 16 | `REPRO_STEPS` | No | text | Bước tái hiện. |
| 17 | `SCREENSHOT_URL` | No | url | Link ảnh minh họa (không nhúng PII nhạy cảm). |
| 18 | `STATUS` | default `NEW` | `NEW` · `TRIAGED` · `ACCEPTED` · `DEFERRED` · `REJECTED` · `RESOLVED_MANUAL` | Trạng thái xử lý (Phase 97 ưu tiên ghi tay sau này). |
| 19 | `TRIAGE_OWNER` | No | string | Người nhận xử lý. |
| 20 | `TRIAGE_NOTE` | No | text | Ghi chú triage. |
| 21 | `DECISION` | No | `GO` · `GO_WITH_WARNINGS` · `NO_GO` · `NEEDS_FIX` · `NEEDS_MORE_TRIAL` | Quyết định pilot (điền sau review). |
| 22 | `RELATED_TRACE_ID` | No | string | Trace / report id nếu có. |
| 23 | `IS_DELETED` | default `FALSE` | `TRUE` / `FALSE` | **Không** xóa vật lý dòng; cờ chỉ mang tính lọc sau này (append-only vật lý). |

**Append-only:** không xóa dòng lịch sử; không cập nhật bảng nghiệp vụ. Cập nhật trạng thái sau này (nếu có) phải có phase/guard riêng — Phase 97 chỉ **capture + đọc + validate**.

**Triage:** `WEBAPP_STAFF_TRIAL_TRIAGE_MATRIX.md`.


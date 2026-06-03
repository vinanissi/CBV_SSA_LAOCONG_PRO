# OCMS Case Strip Visibility Rules — V0

**Version:** 0.1  
**Status:** Design authority (UI visibility spec)  
**Phase:** `PHASE_OCMS_02A_CASE_STRIP_VISIBILITY_RULES`  
**Branch:** `phase/ocms-foundation-v1`  
**ADR:** `ADR_OCMS_CASE_STRIP_VISIBILITY_RULES.md`  
**Input contract:** `OCMS_READ_MODEL_CONTRACT.md`  
**Feature flag:** `OCMS_CASE_STRIP_ENABLED` (required for OCMS_03)

---

## 1. Purpose

Define **when** and **what** the Case Context Strip shows in Work Inbox Focus — derived from `CaseReadModel` — without implementing UI.

---

## 2. Inputs from CaseReadModel

| Input | Strip use |
|-------|-----------|
| `caseType` | Badge label (Vietnamese) |
| `title` | Strip title if adds context |
| `lifecycle` | Phase chip |
| `result` | Optional chip (if non-null) |
| `responsibility` | EXPANDED only |
| `relations[]` | PRIMARY (+ TARGET in EXPANDED) |
| `memorySummary.recent` | 1–3 lines |
| `projections.*.summary` | Warning context only — not raw `data` |
| `permissions` | Gates HIDDEN / links / private fields |
| `source` | Profile selection |
| `diagnostics` | confidence, warnings[0..1] |

---

## 3. Visibility levels

| Level | Operator experience |
|-------|---------------------|
| **HIDDEN** | No strip rendered |
| **MINIMAL** | One line: type + lifecycle + optional warning |
| **STANDARD** | Title (if needed), type, lifecycle, primary relation, 1 recent memory |
| **EXPANDED** | STANDARD + target relation, result, responsible/reviewer, 2–3 recent |

### 3.1 Level resolution (algorithm sketch)

```text
IF NOT OCMS_CASE_STRIP_ENABLED → HIDDEN
IF NOT permissions.canView → HIDDEN
IF diagnostics.confidence = UNKNOWN AND source = ALERT_ANCHORED (orphan) → MINIMAL or HIDDEN
IF diagnostics.confidence = LOW OR source = MANUAL_CASE_KEY AND confidence < MEDIUM → MINIMAL
IF caseType IN (HO_SO, FINANCE) AND confidence IN (MEDIUM, HIGH) → EXPANDED
IF source = TASK_ANCHORED AND caseType = OPERATIONS → MINIMAL or STANDARD
ELSE → STANDARD
```

---

## 4. Source-specific rules

### 4.1 TASK_ANCHORED / OPERATIONS

| Aspect | Rule |
|--------|------|
| Default level | **MINIMAL** or **STANDARD** |
| Show | caseType **Vận hành**, lifecycle.label, primary TASK relation label, memory last activity if any |
| Hide | Long relations list, result if null, projection debug |
| Task-only | Strip **allowed** — compact context only |

### 4.2 HO_SO_ANCHORED / MIXED

| Aspect | Rule |
|--------|------|
| Default level | **STANDARD** → **EXPANDED** when confidence MEDIUM+ |
| Show | caseType **Hồ sơ**, lifecycle, PRIMARY HO_SO, TARGET XA_VIEN if present, recent memory (short) |
| Warnings | Missing giấy tờ / `missingProjections` hoSo → operator warning line |
| Deep link | `/ho-so/:id` if `permissions.canOpenRelated` |

### 4.3 FINANCE_ANCHORED

| Aspect | Rule |
|--------|------|
| Default level | **EXPANDED** when confidence MEDIUM+ else STANDARD |
| Show | caseType **Tài chính**, lifecycle, result if non-null, primary transaction label, responsible/reviewer if present |
| Private | If `!canSeePrivateFields` — hide amounts, account hints; show warning **"Một số thông tin tài chính bị ẩn."** |
| Hide | Raw finance projection `data` |

### 4.4 ALERT_ANCHORED

| Aspect | Rule |
|--------|------|
| Show strip | Only if alert has TASK or HO_SO relation / clear work item |
| Orphan alert | **MINIMAL:** "Cảnh báo chưa gắn hồ sơ/case." — no fake Case |
| Hide | Fake caseType / relations |

### 4.5 MANUAL_CASE_KEY

| Aspect | Rule |
|--------|------|
| confidence ≥ MEDIUM | STANDARD |
| confidence LOW/UNKNOWN | MINIMAL: **"Chưa đủ dữ liệu case."** |

### 4.6 MIXED

| Aspect | Rule |
|--------|------|
| Priority | Strongest anchor: HO_SO &gt; FINANCE &gt; TASK |
| Title | Omit strip title if identical to task header title |
| Level | Follow dominant caseType profile |

---

## 5. Field display matrix

| Field | MINIMAL | STANDARD | EXPANDED | Never |
|-------|---------|----------|----------|-------|
| caseType label | ✓ | ✓ | ✓ | |
| lifecycle.label | ✓ | ✓ | ✓ | |
| title | | ✓* | ✓* | if duplicate task title |
| primary relation | | ✓ | ✓ | |
| target relation | | | ✓ | |
| result.label | | | ✓† | if null |
| responsible | | | ✓‡ | |
| reviewer | | | ✓§ | |
| memory recent[0] | | ✓ | ✓ | |
| memory recent[1..2] | | | ✓ | |
| diagnostics.warnings[0..1] | ✓ | ✓ | ✓ | |
| caseKey raw | | | | ✓ |
| projections.data | | | | ✓ |
| confidence enum | | | | ✓ (prod) |
| sourceRuntime debug | | | | ✓ (prod) |

\* Skip when same as Focus task title.  
† FINANCE may show result in STANDARD when non-null.  
‡ When ≠ assignee or type requires accountability.  
§ When lifecycle = REVIEW.

---

## 6. Permission handling

| Permission | Strip behavior |
|------------|----------------|
| `canView: false` | **HIDDEN** |
| `canOpenRelated: false` | Text labels only — no `<a>` / router links |
| `canOpenSource: false` | No link to source task/module beyond inbox |
| `canSeePrivateFields: false` | Strip finance private summaries; show privacy warning |
| `canMutateTask` | Does not affect strip visibility — actions stay in task toolbar |

Private **task** (`IS_PRIVATE`): respect `canView`; strip hidden if user cannot see task.

---

## 7. Confidence handling

| confidence | Strip impact |
|------------|--------------|
| HIGH | Full profile level allowed |
| MEDIUM | STANDARD; EXPANDED for HO_SO/FINANCE |
| LOW | MINIMAL + warning from diagnostics |
| UNKNOWN | MINIMAL or HIDDEN; message **"Chưa đọc được ngữ cảnh case."** |

Never display raw `confidence` string to operators in production.

---

## 8. Diagnostic handling

| diagnostics field | Operator strip |
|-------------------|----------------|
| `warnings[0..1]` | Show as subtle warning line (max 2) |
| `missingRelations` | Map to **"Chưa xác định thực thể chính"** if PRIMARY missing |
| `missingProjections` | **"Chưa đọc được dữ liệu liên quan"** |
| `runtimeState: NOT_WIRED` | Staging/dev: optional small debug chip; **prod: hidden** |
| Full diagnostics object | Never |

---

## 9. Fallback rules

| Condition | Fallback |
|-----------|----------|
| caseType missing | OPERATIONS if TASK_ANCHORED; else warning **"Loại case chưa xác định"** |
| lifecycle missing | **"Đang xử lý"** if task active; else **"Chưa xác định giai đoạn"** |
| PRIMARY relation missing | Warning **"Chưa xác định thực thể chính"** — no fake relation |
| projection missing | Strip may still show if relations OK + projection warning |
| canView false | HIDDEN |
| canOpenRelated false | Labels only |
| Flag off | HIDDEN |

---

## 10. Operator wording (Vietnamese labels)

| Code | Strip label |
|------|-------------|
| OPERATIONS | Vận hành |
| HO_SO | Hồ sơ |
| FINANCE | Tài chính |
| INVOICE | Hóa đơn |
| MEMBERSHIP | Xã viên |
| COMPLAINT | Khiếu nại |
| PROJECT | Dự án |
| SUPPORT | Hỗ trợ |
| COMPLIANCE | Tuân thủ |
| DOCUMENT | Tài liệu |

Lifecycle uses `lifecycle.label` from read model (already Vietnamese-oriented).

---

## 11. Anti-patterns

| Pattern | Reject |
|---------|--------|
| Strip replaces task header | Task header owns execution |
| Label inbox row "Case" | ADR-001 violation |
| Show fake HO_SO when missing | Use warning |
| Show finance amount when !canSeePrivateFields | Permission leak |
| Render full relations[] | PRIMARY (+ TARGET in EXPANDED) only |
| Strip visible when flag off | Flag required |

---

## 12. OCMS_03 implementation notes

1. **Placement:** Below `CompactTaskHeader` — secondary panel, collapsible optional.
2. **Hook (future):** `useCaseReadModel(taskId)` → pass to `resolveStripVisibility()`.
3. **Component (future):** `WorkInboxCaseContextStrip.tsx` — props: `{ visibility, fields, warnings, links }`.
4. **Flag:** env or runtime config `OCMS_CASE_STRIP_ENABLED`.
5. **Tests:** Static checks against visibility matrix per fixture JSON from `OCMS_READ_MODEL_EXAMPLES.md`.
6. **No mutations** in strip — buttons remain task/checklist/attachment flows.

---

## 13. Document map

| Document | Role |
|----------|------|
| `ADR_OCMS_CASE_STRIP_VISIBILITY_RULES.md` | Binding ADR |
| `OCMS_READ_MODEL_CONTRACT.md` | §12 strip usage |
| `OCMS_READ_MODEL_EXAMPLES.md` | Test fixtures |

---

## 14. Layout authority binding

Visibility **level** selects **field set**; layout authority selects **placement and height**:

| Level | Max height | Placement |
|-------|------------|-----------|
| HIDDEN | 0 | Not mounted |
| MINIMAL | 28–36px | Main Area below header |
| STANDARD | 48–72px | Same |
| EXPANDED | 96–128px | Same; collapse required |

**Authoritative layout:** `OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md`  
**ADR:** `ADR_OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md`

This section does not alter §1–§13 above.

---

*Append-only visibility spec.*

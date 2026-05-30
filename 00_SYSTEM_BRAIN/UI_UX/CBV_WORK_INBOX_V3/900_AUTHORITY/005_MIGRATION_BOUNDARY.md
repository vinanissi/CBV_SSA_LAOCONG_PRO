# 005 — Migration Boundary (AS-IS → TO-BE)

**Purpose:** Explicit gap list — implementation phase must close these deliberately.

---

## 1. Route migration

| AS-IS (code) | TO-BE (V3) | Strategy |
|--------------|------------|----------|
| `/` → OperationalHome | `/` → `/inbox` | Redirect + keep launchpad optional |
| `/tasks` | `/inbox` | **Alias** 301/`<Navigate>` |
| `/tasks/:taskId` | `/task/:id` | Alias |
| `/hoso` | `/ho-so` list or deep link only | Phase decision |
| `/observation` | `/admin/health` | Admin guard |
| — | `/admin/*` | New module |

**Không xóa** `/tasks` cho đến khi UAT + telemetry xác nhận.

---

## 2. IA / grouping migration

| AS-IS | TO-BE |
|-------|-------|
| Filters: mine, pending, overdue, approval | ≤5 simple tabs OR map into groups |
| `group=cognition` (default) | **Hidden** from Operator default view |
| `group=status` | Optional advanced / supervisor |
| Cognition buckets in `deriveVisibleTaskRuntime` | Need Action / Waiting / Follow Up / Completed |

**Mapping logic** lives in adapter layer — decision note required for exact rules.

Suggested (non-binding until decision):

| V3 group | Derived from |
|----------|--------------|
| Need Action | overdue + actionable pending |
| Waiting | waiting / approval |
| Follow Up | follow_up slice |
| Completed | terminal statuses |

---

## 3. Focus migration

| AS-IS | TO-BE |
|-------|-------|
| `focusQueueMode` session dim | V3 Focus Mode OR rename |
| Multiple cards visible | Single task UI |
| Control strip compressed | Nav/filter hidden |

Options (pick one in decision note):

- **A)** Replace focus queue with V3 Focus Mode
- **B)** Keep dim mode for supervisors; V3 focus for operators
- **C)** Rename UI labels only (not recommended — behavior still differs)

---

## 4. Component migration

| AS-IS component | TO-BE direction |
|-----------------|-----------------|
| `TaskControlSurface` | `InboxTabs` + simpler surface |
| `TaskCard` | Wrap to `TaskCardModel` |
| `GroupModeSelect` | Remove from Operator default |
| `QuickFocusFilters` | May map to tabs or hidden advanced |
| `DetailPanel` | `TaskDetailPanel` with tabs (Thông tin, …) |
| `StatusSummaryCard` | **New** — not in codebase |

---

## 5. Token migration

Merge `006_DESIGN_TOKENS.md` YAML → `tailwind.config.ts` incrementally.

**Không** breaking global theme outside inbox surfaces in first FE PR.

---

## 6. Mobile migration

| AS-IS | TO-BE |
|-------|-------|
| `min-w-[1366px]` shell | Responsive shell |
| Bottom sheet detail only | Bottom nav + full screen routes |

Major layout change — separate sub-phase recommended.

---

## 7. Out of scope (unchanged by V3 inbox)

- TASK_MAIN schema (SHARED_WITH, IS_PRIVATE)
- GAS auto-assign / escalate
- AppSheet as CRUD channel
- API envelope shape

---

## 8. Phase gate checklist

Before claiming "V3 inbox done":

- [ ] `/inbox` default works
- [ ] `/tasks` aliases work
- [ ] Operator default: no cognition label in UI
- [ ] Focus Mode 1-task passes UAT
- [ ] `013_ACCEPTANCE_CRITERIA.md` all PASS
- [ ] `001_CURRENT_RUNTIME_TRUTH.md` updated to new AS-IS OR renamed to `_2026xxxx`

---

## 9. Authority pack phase boundary

**This document does not authorize code changes.**

Only `PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION` closes gaps above.

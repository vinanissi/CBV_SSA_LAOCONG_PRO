# TASK Progress Logic

**Module:** TASK_CENTER  
**Implementation:** `05_GAS_RUNTIME/20_TASK_SERVICE.js`

---

## 1. Source of Truth

**TASK_CHECKLIST** is the source of truth for task completion and progress.

- Progress = (done checklist items / total checklist items) × 100
- No manual override — progress is always derived from checklist
- Admin override: future; not implemented (would require explicit admin-only API)

---

## 2. Progress Calculation

```javascript
/**
 * @param {string} taskId
 * @returns {number} 0–100
 */
function calculateProgress(taskId)
```

| Condition | Result |
|-----------|--------|
| 0 checklist items | 0 |
| N items, 0 done | 0 |
| N items, k done | round((k / N) × 100) |
| Task STATUS = DONE | 100 (forced on transition) |

---

## 3. Auto-Update Triggers

| Event | Action |
|-------|--------|
| createTask | PROGRESS_PERCENT = 0 |
| addChecklistItem | syncTaskProgress(taskId) |
| markChecklistDone | syncTaskProgress(taskId) |
| setTaskStatus(id, DONE) | PROGRESS_PERCENT = 100 |

---

## 4. Validation Rules

| Rule | Enforcement |
|------|-------------|
| DONE only when all required checklist done | ensureTaskCanComplete (03_SHARED_VALIDATION) |
| Progress auto-calculated | syncTaskProgress; no setter for PROGRESS_PERCENT |
| No manual override | PROGRESS_PERCENT = VISIBLE_READONLY in AppSheet |

---

## 5. Schema

**TASK_MAIN.PROGRESS_PERCENT** — Number, 0–100, system-maintained.

---

## 6. Integration Points

| Entry point | Progress behavior |
|-------------|-------------------|
| addChecklistItem | syncTaskProgress after append |
| markChecklistDone | syncTaskProgress after update |
| setTaskStatus(DONE) | Set PROGRESS_PERCENT = 100 |
| createTask | PROGRESS_PERCENT = 0 |

**Note:** If `markChecklistUndone` is added later, it must call `syncTaskProgress`.

---

## 7. Deployment

For existing deployments: add PROGRESS_PERCENT column to TASK_MAIN sheet (after DONE_AT). Bootstrap will create it for new deployments.

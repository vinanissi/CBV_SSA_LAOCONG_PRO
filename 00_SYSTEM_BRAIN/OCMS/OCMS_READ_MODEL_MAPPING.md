# OCMS Read Model Mapping — AS-IS → CaseReadModel

**Version:** 0.1  
**Phase:** `PHASE_OCMS_02_READ_MODEL_CONTRACT`  
**Contract:** `OCMS_READ_MODEL_CONTRACT.md`

---

## 1. Purpose

Map **AS-IS CBV runtimes** to `CaseReadModel` fields without persistence or fake data.

---

## 2. Source runtimes (AS-IS)

| Runtime | Sheet / API | Read use |
|---------|-------------|----------|
| TASK_GS_01 | `TASK_MAIN` | workItems, responsibility hints, task projection |
| TASK_GS_01 | `TASK_UPDATE_LOG` | memorySummary.timeline, recent |
| Work Inbox | `TASK_CHECKLIST` | memorySummary.checklist |
| Work Inbox | `TASK_ATTACHMENT` | memorySummary.attachments, evidence count |
| HOME_ALERT | `HOME_ALERT` | workItems ALERT, alerts projection |
| RF06 / GAS | `HO_SO_MASTER`, `HO_SO_FILE` | hoSo projection, relations |
| RF06 / GAS | `HO_SO_UPDATE_LOG` | memorySummary.timeline (federated later) |
| RF06 / GAS | `FINANCE_TRANSACTION`, `FINANCE_LOG` | finance projection, relations |
| Legacy | `TASK_TIMELINE` | read-only legacy timeline (low priority) |

---

## 3. P0 mapping strategies

### 3.1 OPERATIONS — TASK_ANCHORED

| Contract field | Source | Rule |
|----------------|--------|------|
| caseKey | `OPERATIONS:TASK:{TASK_ID}` | TASK_ID from anchor task |
| caseType | `OPERATIONS` | Fixed for task-only anchor |
| title | `TASK_MAIN.TITLE` or equivalent | Required |
| lifecycle | INFERRED | See §4 — not raw STATUS |
| result | null or INFERRED | If task complete → lifecycle RESOLVED hint; result Completed only if rule applied |
| responsible | `OWNER_ID` | USER_DIRECTORY display |
| support | `ASSIGNEE_ID` if ≠ owner | |
| relations | TASK PRIMARY | `{ targetType: TASK, targetId, role: PRIMARY }` |
| workItems | Single TASK row | status = TASK status field |
| memorySummary.counts | checklist/attachment/timeline APIs | 0 if unreadable + warning |
| projections.task | task workspace snapshot | stale if snapshot age > threshold (future) |

### 3.2 HO_SO — HO_SO_ANCHORED (or TASK with HO_SO_ID)

| Contract field | Source | Rule |
|----------------|--------|------|
| caseKey | `HO_SO:{HO_SO_ID}` | From master ID or task link field |
| caseType | `HO_SO` | |
| title | `HO_SO_MASTER` display / task title | Prefer hồ sơ name |
| lifecycle | INFERRED | TRIAGE→ACTIVE→REVIEW heuristics from logs |
| result | INFERRED from hồ sơ status fields if present | Else null |
| relations | PRIMARY HO_SO, TARGET XA_VIEN | From master columns |
| projections.hoSo | `HO_SO_MASTER` + file count | |
| workItems | Linked TASK rows | Optional multi-task |

**Trigger:** Focus on task with `HO_SO_ID` (or equivalent) → source `MIXED` or `HO_SO_ANCHORED`.

### 3.3 FINANCE — FINANCE_ANCHORED

| Contract field | Source | Rule |
|----------------|--------|------|
| caseKey | `FINANCE:TX:{TX_ID}` | Transaction id |
| caseType | `FINANCE` | |
| title | Transaction description / task title | |
| lifecycle | INFERRED | REVIEW if pending approval |
| result | Map from transaction state | Draft/Approved/Paid per result model |
| relations | PRIMARY FINANCE_TRANSACTION | SECONDARY INVOICE if linked |
| projections.finance | `FINANCE_TRANSACTION` slice | |
| workItems | Supporting TASK if present | |

---

## 4. Lifecycle inference (not task status)

| TASK_MAIN signal | Inferred lifecycle | Confidence |
|------------------|-------------------|------------|
| Open / In Progress | ACTIVE | MEDIUM |
| Waiting (if distinct) | WAITING | MEDIUM |
| Done + no reviewer | RESOLVED | LOW |
| Done + review types | REVIEW or RESOLVED | LOW — needs type |
| Blocked flag (future) | BLOCKED | HIGH if field exists |

**Rule:** Never set `lifecycle.code` = copy of status string without mapping table.

---

## 5. Result inference

| Condition | result | Confidence |
|-----------|--------|------------|
| No outcome | `null` | HIGH |
| Task done, OPERATIONS | `{ code: Completed, group: COMPLETED }` | LOW — optional |
| HO_SO approved field | `{ code: Approved, group: APPROVED }` | MEDIUM if field trusted |
| Finance tx state = paid | `{ code: Paid, group: APPROVED }` | MEDIUM |

---

## 6. Memory summary mapping

| Count | Source |
|-------|--------|
| timeline | `TASK_UPDATE_LOG` row count (+ HO_SO log if anchored) |
| checklist | `TASK_CHECKLIST` active rows |
| attachments | `TASK_ATTACHMENT` rows |
| comments | update log entries tagged comment (future) |
| decisions | manual tag or future |
| handoffs | manual tag or future |
| evidence | attachments filtered type=evidence (future) or = attachments |

**recent[]:** Last N from TASK_UPDATE_LOG + latest checklist toggle + latest attachment.

---

## 7. Fallback rules

| Situation | Behavior |
|-----------|----------|
| HO_SO_ID missing for HO_SO type request | Fall back TASK_ANCHORED OPERATIONS + warning |
| Finance tx not found | `projections.finance: null`, `missingProjections: ['finance']` |
| USER_DIRECTORY miss | displayName null, confidence LOW |
| Worker unreachable | diagnostics.runtimeState NOT_WIRED, confidence UNKNOWN |
| Private task + no permission | canView false, minimal shell |

---

## 8. Missing data rules

1. **No silent fake** — do not synthesize HO_SO row or finance tx.
2. Populate `diagnostics.missingRelations` when PRIMARY expected per caseType absent.
3. Populate `diagnostics.warnings` with human-readable reason.
4. Empty counts = 0 with source UNAVAILABLE if API not called.

---

## 9. Relation derivation

| From | Relation |
|------|----------|
| Task TASK_ID | TASK PRIMARY |
| Task HO_SO_ID column | HO_SO PRIMARY + projectionKey hoSo |
| Task member ref | XA_VIEN TARGET |
| Alert id on task | ALERT SOURCE |
| Finance ref on task | FINANCE_TRANSACTION SECONDARY |

---

## 10. Permissions derivation

| Check | Field |
|-------|-------|
| canUserSeeTask (SHARED_WITH, IS_PRIVATE) | canView, canSeePrivateFields |
| Task assign/complete API available | canMutateTask |
| Module routes exist | canOpenRelated |

---

## 11. Document map

| Document | Role |
|----------|------|
| `OCMS_READ_MODEL_CONTRACT.md` | Schema |
| `OCMS_READ_MODEL_EXAMPLES.md` | Instances |

---

*Append-only mapping spec.*

# Service Rule Audit

## Summary
Audit of GAS services against workflow, business spec, and service contract.

## HO_SO Module

### Workflow Compliance
| Transition | Spec | Service | Status |
|------------|------|---------|--------|
| NEW -> ACTIVE | WORKFLOW | setHoSoStatus | OK |
| ACTIVE -> INACTIVE | WORKFLOW | setHoSoStatus | OK |
| INACTIVE -> ACTIVE | WORKFLOW | setHoSoStatus | OK |
| ACTIVE -> ARCHIVED | WORKFLOW | setHoSoStatus | OK |
| INACTIVE -> ARCHIVED | WORKFLOW | setHoSoStatus | OK |

### Service Contract Compliance
| Contract | Implementation | Status |
|----------|----------------|--------|
| createHoSo: type, code unique, name | createHoSo with ensureRequired, ensureEnum, duplicate check | OK |
| attachHoSoFile: ho so exists, file group valid, file url | attachHoSoFile with _findById, ensureEnum, ensureRequired | OK |

### Business Spec Compliance
- CODE unique per type: OK
- NAME required: OK
- No physical delete: OK (IS_DELETED)
- File: link/id only: OK (FILE_URL, DRIVE_FILE_ID)

---

## TASK_CENTER Module

### Workflow Compliance
| Transition | Spec | Service | Status |
|------------|------|---------|--------|
| NEW -> ASSIGNED | WORKFLOW | setTaskStatus | OK |
| NEW -> CANCELLED | WORKFLOW | setTaskStatus | OK |
| ASSIGNED -> IN_PROGRESS | WORKFLOW | setTaskStatus | OK |
| ASSIGNED -> CANCELLED | WORKFLOW | setTaskStatus | OK |
| IN_PROGRESS -> WAITING | WORKFLOW | setTaskStatus | OK |
| IN_PROGRESS -> DONE | WORKFLOW | setTaskStatus | OK |
| IN_PROGRESS -> CANCELLED | WORKFLOW | setTaskStatus | OK |
| WAITING -> IN_PROGRESS | WORKFLOW | setTaskStatus | OK |
| WAITING -> CANCELLED | WORKFLOW | setTaskStatus | OK |
| DONE -> ARCHIVED | WORKFLOW | setTaskStatus | OK |
| CANCELLED -> ARCHIVED | WORKFLOW | setTaskStatus | OK |

### Service Contract Compliance
| Contract | Implementation | Status |
|----------|----------------|--------|
| completeTask: task exists, open, checklist done | setTaskStatus(DONE) + ensureTaskCanComplete | OK |
| assignTask: owner valid, task not terminal | **Not implemented** | GAP |

### assignTask Gap
SERVICE_CONTRACT defines `assignTask(taskId, ownerId)`. No dedicated function exists.
- **Workaround**: createTask requires OWNER_ID; use setTaskStatus(id, 'ASSIGNED') to transition NEW->ASSIGNED. Owner is set at create time.
- **Resolution**: Document as accepted; assignTask could be added later if reassignment is needed.

### Business Spec Compliance
- Title, Owner, Priority required: OK
- DONE blocked if required checklist incomplete: OK (ensureTaskCanComplete)
- Status changes logged: OK (addTaskUpdate)
- RELATED_ENTITY_TYPE/ID: OK

---

## FINANCE Module

### Workflow Compliance
| Transition | Spec | Service | Status |
|------------|------|---------|--------|
| NEW -> CONFIRMED | WORKFLOW | setFinanceStatus | OK |
| NEW -> CANCELLED | WORKFLOW | setFinanceStatus | OK |
| CONFIRMED -> ARCHIVED | WORKFLOW | setFinanceStatus | OK |
| CANCELLED -> ARCHIVED | WORKFLOW | setFinanceStatus | OK |

### Service Contract Compliance
| Contract | Implementation | Status |
|----------|----------------|--------|
| confirmTransaction: exists, NEW, amount>0, category valid | setFinanceStatus(CONFIRMED) + createTransaction validation | OK |
| updateDraftTransaction: only when status=NEW | updateDraftTransaction checks STATUS=NEW | OK |

### Business Spec Compliance
- TRANS_TYPE, CATEGORY, AMOUNT>0 required: OK
- No edit after CONFIRMED: OK (updateDraftTransaction blocks)
- Log before/after: OK (logFinance)
- No physical delete: OK (IS_DELETED)

---

## Schema Safety
- All services use CBV_CONFIG.SHEETS and schema-aligned record structure
- No direct sheet mutation outside repository
- _appendRecord, _updateRow, _findById used consistently

## Known Issues (Not Fixed)
1. **repository._rows**: Uses `lastRow - 1`, excluding last row. May be intentional (footer). Left unchanged.
2. **assignTask**: Not implemented; workaround documented above.

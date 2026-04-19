# Architecture Changelog

**Purpose:** Document the cleanup from hybrid/legacy design to final non-hybrid architecture.

---

## Final Architecture Enforced

| Area | Final Design |
|------|--------------|
| **USER_DIRECTORY** | Separate canonical user table. Users are global. No HTX dependency. |
| **DON_VI** | Separate organization table. Covers CONG_TY, HTX, DOI_KINH_DOANH, BO_PHAN, NHOM. No separate HTX table. NOT in MASTER_CODE. |
| **MASTER_CODE** | Static/semi-static business master data only. Does NOT store DON_VI or USER. |
| **ENUM_DICTIONARY** | Enum dictionary only. |
| **TASK_MAIN** | Uses TASK_TYPE_ID (REF to MASTER_CODE), DON_VI_ID (REF to DON_VI). No TASK_TYPE, no HTX_ID. |
| **FINANCE_TRANSACTION** | Uses DON_VI_ID (→ DON_VI) for unit attribution. |

---

## Old Assumptions Removed

1. **DON_VI in MASTER_CODE** — Removed. DON_VI is a separate table.
2. **HTX as separate core table** — Removed. HTX is a DON_VI_TYPE in DON_VI.
3. **USER_DIRECTORY depends on HTX** — Removed. Users are global.
4. **Hybrid schema acceptable** — Removed. Non-hybrid only.
5. **TASK_MAIN uses both TASK_TYPE and TASK_TYPE_ID** — Removed. TASK_TYPE_ID only.
6. **TASK_MAIN uses HTX_ID** — Removed. DON_VI_ID only.
7. **MASTER_CODE stores USER** — Removed. USER_DIRECTORY only.
8. **MASTER_CODE stores DON_VI** — Removed. DON_VI table only.
9. **Legacy/hybrid as current architecture** — Removed. Final only.

---

## Fields Removed from Design

| Table | Field | Replacement |
|-------|-------|-------------|
| TASK_MAIN | TASK_TYPE | TASK_TYPE_ID |
| TASK_MAIN | HTX_ID | DON_VI_ID |
| TASK_MAIN | RESULT_NOTE | RESULT_SUMMARY |
| TASK_CHECKLIST | DESCRIPTION | — |
| TASK_UPDATE_LOG | CONTENT | ACTION, OLD_STATUS, NEW_STATUS, NOTE |

---

## Official Final Fields

| Table | Key Final Fields |
|-------|------------------|
| USER_DIRECTORY | ID, USER_CODE, FULL_NAME, DISPLAY_NAME, EMAIL, PHONE, ROLE, POSITION, STATUS, IS_SYSTEM, ALLOW_LOGIN, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED |
| DON_VI | ID, DON_VI_TYPE, CODE, NAME, DISPLAY_TEXT, SHORT_NAME, PARENT_ID, STATUS, SORT_ORDER, MANAGER_USER_ID, EMAIL, PHONE, ADDRESS, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED |
| MASTER_CODE | ID, MASTER_GROUP, CODE, NAME, DISPLAY_TEXT, STATUS, SORT_ORDER, IS_SYSTEM, ALLOW_EDIT, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED |
| TASK_MAIN | ID, TASK_CODE, TITLE, DESCRIPTION, TASK_TYPE_ID, STATUS, PRIORITY, OWNER_ID, REPORTER_ID, DON_VI_ID, RELATED_ENTITY_TYPE, RELATED_ENTITY_ID, START_DATE, DUE_DATE, DONE_AT, RESULT_SUMMARY, PROGRESS_PERCENT, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED |
| TASK_CHECKLIST | ID, TASK_ID, ITEM_NO, TITLE, IS_REQUIRED, IS_DONE, DONE_AT, DONE_BY, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED |
| TASK_UPDATE_LOG | ID, TASK_ID, UPDATE_TYPE, ACTION, OLD_STATUS, NEW_STATUS, NOTE, ACTOR_ID, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED |
| TASK_ATTACHMENT | ID, TASK_ID, FILE_NAME, FILE_URL, DRIVE_FILE_ID, ATTACHMENT_TYPE, TITLE, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED |
| FINANCE_TRANSACTION | ID, TRANS_CODE, TRANS_DATE, TRANS_TYPE, STATUS, CATEGORY, AMOUNT, DON_VI_ID, COUNTERPARTY, PAYMENT_METHOD, REFERENCE_NO, RELATED_ENTITY_TYPE, RELATED_ENTITY_ID, DESCRIPTION, EVIDENCE_URL, CONFIRMED_AT, CONFIRMED_BY, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED |

---

## Documentation Updated

- 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md (created)
- 01_SCHEMA/*.md (10 schema docs created)
- 04_APPSHEET/APPSHEET_REF_MAP.md (updated)
- 04_APPSHEET/APPSHEET_FIELD_POLICY_MAP.md (updated)
- 04_APPSHEET/APPSHEET_VIEW_UX_MAP.md (updated)
- 09_AUDIT/DEPRECATED_OLD_DESIGN_ITEMS.md (created)

---

## 2026-04-19 — Event-driven core (phase 1)

- **Sheets:** `EVENT_QUEUE`, `RULE_DEF` added to `90_BOOTSTRAP_SCHEMA.js` and `CBV_CONFIG.SHEETS`.
- **GAS:** `04_CORE_EVENT_TYPES.js`, `04_CORE_EVENT_QUEUE.js`, `04_CORE_RULE_ENGINE.js`, `04_CORE_EVENT_PROCESSOR.js` — queue append, rule load/evaluate (safe JSON), processor + batch stub, `executeCoreAction_` stubs.
- **Emission:** `30_FINANCE_SERVICE.js` calls `cbvTryEmitCoreEvent_` on create + status change (`FINANCE_CREATED`, `FINANCE_STATUS_CHANGED`).
- **Docs:** `00_OVERVIEW/EVENT_DRIVEN_MIGRATION_PLAN.md` (audit + migration phases). Script property `CBV_CORE_EVENT_MODE`: `off` | `shadow` (default) | `on`.
- **Menu / trigger:** `04_CORE_EVENT_TRIGGERS.js` — `CBV PRO` → Bootstrap & init → Process EVENT_QUEUE now; Install/Remove EVENT_QUEUE trigger (every 5 min).

---

## 2026-04-19 — Event-driven core (P2 emit + SEND_ALERT audit)

- **Emit:** `20_TASK_SERVICE.js` (`TASK_*` events), `10_HOSO_SERVICE.js` (`HO_SO_*` events); webhook `checklistDone` / `addLog` covered via task service.
- **`executeCoreAction_`:** `SEND_ALERT` → `logAdminAudit` → **`ADMIN_AUDIT_LOG`** (`AUDIT_TYPE` `CORE_RULE`, actor `cbvSystemActor()`).
- **Docs / samples:** `00_OVERVIEW/RULE_DEF_SAMPLE_ROWS_TASK_HOSO.tsv`, `EVENT_DRIVEN_MIGRATION_PLAN.md`, `02_MODULES/FINANCE/APPSHEET_OPERATIONS_GUIDE.md` §10; `DEPENDENCY_MAP.md` updated.

# Data Model Map — Case-Centric Refactor Audit

**Phase:** `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT`  
**Date:** 2026-06-01  
**Rule:** Map only — no new tables or columns in this phase.

---

## Task data model (`TASK_MAIN`)

**Authority:** `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js`, `06_DATABASE/_generated_schema/TASK_MAIN.csv`

| Column group | Fields | Case refactor note |
|--------------|--------|-------------------|
| Identity | `ID`, `TASK_CODE` | Remains execution key; not Case ID |
| Content | `TITLE`, `DESCRIPTION`, `TASK_TYPE_ID` | Task under Case in target model |
| Execution | `STATUS`, `PRIORITY`, `PROGRESS_PERCENT`, `RESULT_SUMMARY` | Task lifecycle — distinct from Case WorkflowState |
| Ownership | `OWNER_ID`, `REPORTER_ID`, `DON_VI_ID`, `SHARED_WITH`, `IS_PRIVATE` | Task responsibility; Case may aggregate separately later |
| Dates | `START_DATE`, `DUE_DATE`, `DONE_AT` | Task deadlines |
| **Case linkage** | `RELATED_ENTITY_TYPE`, `RELATED_ENTITY_ID` | Primary sheet anchor for OCMS discovery |
| Audit | `CREATED_*`, `UPDATED_*`, `IS_DELETED`, flags | Standard |

**FE projection (`TaskItem`):** adds `relatedHoSoId`, `relatedEntityType`, `relatedEntityId` from GAS mapping (`40_TaskDbService.js`).

---

## Checklist data model (`TASK_CHECKLIST`)

| Field | Role |
|-------|------|
| `TASK_ID` | Parent key — **task-scoped today** |
| `ITEM_NO`, `TITLE`, `IS_REQUIRED`, `IS_DONE` | Step state |
| `DONE_AT`, `DONE_BY`, `NOTE` | Completion audit |

**Target model:** Checklist belongs to **Case**; items may spawn **Tasks** when separate owner/deadline needed. **Today:** persisted only under task.

---

## Document / attachment model

| Store | Key fields | Scope |
|-------|------------|-------|
| `TASK_ATTACHMENT` | `TASK_ID`, file metadata, URLs | Task-scoped |
| Work Inbox `document` ops | Via `wiOp` → operational sheets | Task-scoped |
| `HO_SO_FILE` | `HO_SO_ID`, `FILE_URL`, `DOC_TYPE` | Hồ sơ module — case anchor via HO_SO |

**Target model:** Documents attach to Case; may link from Task or HO_SO projections.

---

## Timeline model

| Store | Behavior | Scope |
|-------|----------|-------|
| `TASK_UPDATE_LOG` | Append-only updates (05_GAS_RUNTIME) | Task |
| `TASK_TIMELINE` (gas-runtime-api config) | Work Inbox operational timeline | Task |
| `HO_SO_UPDATE_LOG` | Hồ sơ history | HO_SO entity |

**Target model:** Federated Case timeline (read-merge) — OCMS_04 direction; not implemented.

---

## Handoff model

| Layer | Representation |
|-------|----------------|
| UI | `HandoffDialog`, `InlineHandoffStrip`, `buildFocusHandoffView()` from timeline |
| Data | Derived from assign actions + timeline entries — **no dedicated HANDOFF sheet** |
| Task fields | `OWNER_ID` change via assign API |

**Target model:** Handoff block on Case read model; persistence TBD.

---

## Status / lifecycle mapping

| Concept | Current store | Notes |
|---------|---------------|-------|
| Task status | `TASK_MAIN.STATUS` | Inbox filters, focus actions |
| Case lifecycle (logical) | OCMS `OCMS_CASE_LIFECYCLE_MODEL.md` | **Not persisted** — strip may show derived label |
| Case result | OCMS result model | Read-only derivation |
| HO_SO status | `HO_SO_MASTER.STATUS` | Module projection |
| Alert status | `HOME_ALERT` projection | Work item, not Case root |

---

## Ownership / responsibility mapping

| Level | Mechanism |
|-------|-----------|
| Task owner | `OWNER_ID`, assign API |
| Task visibility | `IS_PRIVATE`, `SHARED_WITH`, `canUserSeeTask` (GAS) |
| Case responsibility (logical) | OCMS CRM triad docs — memory model, not sheet |
| Hồ sơ owner | `HO_SO_MASTER.OWNER_ID`, `MANAGER_USER_ID` |

---

## Case-related fields (existing)

| Source | Field / concept | Role in OCMS |
|--------|-----------------|--------------|
| `TASK_MAIN` | `RELATED_ENTITY_TYPE`, `RELATED_ENTITY_ID` | Discovery anchor |
| FE | `relatedHoSoId` | HO_SO_ANCHORED shortcut |
| FE | `caseKey` (derived) | Identity per `OCMS_CASE_KEY_AUTHORITY.md` |
| FE | `caseDiscoverySource` | HO_SO / FINANCE / ALERT / TASK / MANUAL |
| HO_SO / FINANCE sheets | `RELATED_ENTITY_*` on other entities | Cross-module anchors |

**No `CASE_ID` column on TASK_MAIN today.**

---

## Missing fields for Case-Centric Runtime (document only)

| Need | Status | Recommended phase |
|------|--------|-------------------|
| Stable Case ID (persisted) | **Missing** | Defer until `PHASE_OCMS_05` / explicit persistence ADR |
| Case ↔ Task relation table | **Missing** | Optional; may use anchors + read model first |
| Case-level checklist store | **Missing** | Extract from task checklist or new sheet — persistence phase |
| Case WorkflowState column | **Missing** | Authority phase first, persistence later |
| Case-level handoff record | **Missing** | Read model from timeline first |

**Explicit:** `CASE_MAIN` **not** justified by this audit — read-model-first refactor is viable.

---

*Schema authority unchanged. Any future column requires manifest + audit + ADR per workspace rules.*

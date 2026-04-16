# TASK Architecture Audit

**⚠️ SUPERSEDED.** This audit recommended HTX_ID. Final architecture uses DON_VI_ID (REF DON_VI). See 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md and 09_AUDIT/DEPRECATED_OLD_DESIGN_ITEMS.md.

**Date:** 2025-03-21  
**Scope:** Canonical task architecture vs implementation.

---

## 1. Architecture Compliance

| Requirement | Status | Evidence |
|-------------|--------|----------|
| HO_SO_MASTER = business entities only | **PASS** | HTX, XA_VIEN, XE, TAI_XE; no user role |
| USER_DIRECTORY = canonical user source | **PASS** | OWNER_ID, REPORTER_ID, DONE_BY, ACTOR_ID ref USER_DIRECTORY |
| TASK_MAIN contains HTX_ID | **GAP** | schema_manifest.json, 90_BOOTSTRAP_SCHEMA: TASK_MAIN has no HTX_ID |
| TASK_MAIN contains OWNER_ID, REPORTER_ID | **PASS** | Present; ref USER_DIRECTORY |
| Checklist/attachment/log = child of TASK_MAIN | **PASS** | TASK_ID → TASK_MAIN |
| AppSheet refs safe | **PASS** | ACTIVE_USERS from USER_DIRECTORY; Allow Adds OFF |
| GAS = real validator | **PASS** | assertActiveUserId, validateTaskTransition |

---

## 2. Explicit Statements

### Users are shared
- USER_DIRECTORY is system-wide.
- Same user can own/report tasks across multiple HTX.
- USER_DIRECTORY.HTX_ID is optional; users are not bound to a fixed HTX by default.

### Task belongs to HTX
- Canonical model: TASK_MAIN.HTX_ID → HO_SO_MASTER (HO_SO_TYPE=HTX).
- **Current schema:** TASK_MAIN does NOT have HTX_ID. This is a schema gap.

---

## 3. Ref Directions (Current)

| From | Column | To | Implemented |
|------|--------|-----|-------------|
| TASK_MAIN | OWNER_ID | USER_DIRECTORY | Yes |
| TASK_MAIN | REPORTER_ID | USER_DIRECTORY | Yes |
| TASK_MAIN | HTX_ID | HO_SO_MASTER | **No (column missing)** |
| TASK_CHECKLIST | TASK_ID | TASK_MAIN | Yes |
| TASK_CHECKLIST | DONE_BY | USER_DIRECTORY | Yes |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN | Yes |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN | Yes |
| TASK_UPDATE_LOG | ACTOR_ID | USER_DIRECTORY (or email) | Yes |

---

## 4. Next Implementation Step

**Add HTX_ID to TASK_MAIN**

1. Schema: Add HTX_ID to TASK_MAIN in schema_manifest.json, 90_BOOTSTRAP_SCHEMA.js, _generated_schema/TASK_MAIN.csv.
2. GAS: In createTask, accept optional HTX_ID; validate against HO_SO_MASTER (HO_SO_TYPE=HTX) when provided.
3. AppSheet: Add HTX_ID ref → ACTIVE_HTX; Allow Adds OFF.
4. Migration: Backfill HTX_ID for existing tasks if business rules allow (or leave blank for legacy).

---

## 5. References

- 03_SHARED/TASK_SYSTEM_ARCHITECTURE.md
- 03_SHARED/TASK_DATA_FLOW.md
- 06_DATABASE/schema_manifest.json
- 05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js

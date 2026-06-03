# Checklist Local → Sheet/Drive Migration Plan

**Phase:** `PHASE_CHECKLIST_08_SHEET_DRIVE_PERSISTENCE_DECISION`  
**Status:** ACTIVE — migration tooling in phase 12 (`PHASE_CHECKLIST_12_LOCAL_RUNTIME_MIGRATION`)

---

## Current local-first stores

| Key pattern | Content |
|-------------|---------|
| `cbv-checklist-feedback:v1:{taskId}` | Feedback by item |
| `cbv-checklist-attachment:v1:{taskId}` | Attachment metadata |
| `cbv-checklist-link:v1:{taskId}` | Links |
| `cbv-checklist-history:v1:{taskId}` | History entries |
| `cbv-checklist-crud-overlay:v1:{taskId}` | Note + isArchived overlay |
| `cbv-checklist-layout:v1:{taskId}` | Expanded ids + archivedVisible |

Items already on Sheet via API — **no item migration** except overlay fields (`note` if only local, `isArchived`).

---

## Recommended implementation phases

| Phase | Name | Scope |
|-------|------|--------|
| **09** | `PHASE_CHECKLIST_09_SHEET_SCHEMA_BOOTSTRAP` | Create satellite tabs, headers, bootstrap manifest, protect rows |
| **10** | `PHASE_CHECKLIST_10_DRIVE_FOLDER_BOOTSTRAP` | Idempotent `OCMS_CHECKLIST_FILES` folder API |
| **11** | `PHASE_CHECKLIST_11_SHEET_DRIVE_BRIDGE_IMPLEMENTATION` | GAS + Worker CRUD; FE adapters; feature flag |
| **12** | `PHASE_CHECKLIST_12_LOCAL_RUNTIME_MIGRATION` | Export/import tool; operator-triggered merge |

*(Names align with manifest; adjust in registry if renamed.)*

---

## Migration steps (phase 12 — manual-first)

1. **Export** — browser script or admin page dumps localStorage JSON per `taskId`.
2. **Validate** — schema check against contracts; skip malformed rows.
3. **Map IDs** — preserve IDs where Sheet empty; generate new on conflict.
4. **Items** — PATCH `TASK_CHECKLIST` for `NOTE`, proposed `IS_ARCHIVED` only when changed vs Sheet.
5. **Satellite** — append feedback/history; upsert links/attachments/layout.
6. **Files** — for each local attachment with blob unavailable: keep URL row; operator re-upload in phase 11+.
7. **Dedupe** — hash `(task_id, checklist_item_id, message, created_at)` for history; similar for feedback.
8. **Verify** — row counts + sample UAT per task.
9. **Cutover** — enable `CHECKLIST_SHEET_BRIDGE_ENABLED`; clear local keys **only** after operator confirms.

---

## Conflict handling

| Conflict | Resolution |
|----------|------------|
| Sheet row exists, local differs | **Sheet wins** unless operator picks "import local" per task |
| Duplicate history message + timestamp | Skip second insert; log warning |
| Attachment URL vs Drive file | Prefer Drive metadata when `drive_file_id` present |
| Template seed vs Sheet | Sheet wins after first bootstrap import |

---

## Rollback

1. Disable bridge feature flag.
2. FE reverts to localStorage adapters (code path retained until deprecation ADR).
3. Sheet/Drive data remains — no automatic delete.

---

## Deferred automation

- Background sync
- Multi-user real-time merge
- Auto-upload on file picker
- Scheduled migration jobs

All require separate ADR after phase 12 UAT.

---

## Risks

| Risk | Mitigation |
|------|------------|
| localStorage quota | Migration per-task; export before cutover |
| No binary in local attachment store | Metadata-only migration; operator re-upload |
| Sheet row limits | Archive old history to cold store (future) |
| Concurrent editors | Last-write-wins v1; conflict UI later |

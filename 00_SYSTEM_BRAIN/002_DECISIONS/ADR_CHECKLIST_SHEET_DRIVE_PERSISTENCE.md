# ADR — Checklist Sheet + Drive Persistence

- **ID:** `ADR_CHECKLIST_SHEET_DRIVE_PERSISTENCE`
- **Date:** 2026-06-01
- **Status:** **ACCEPTED** (`PHASE_CHECKLIST_08_SHEET_DRIVE_PERSISTENCE_DECISION`)
- **Related:** `ADR_CASE_CENTRIC_RUNTIME.md`, `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md`, `TASK_CHECKLIST_SCHEMA.md`, `CHECKLIST_SHEET_DRIVE_PERSISTENCE_AUTHORITY.md`

---

## Context

Phases `PHASE_CHECKLIST_01`–`07` delivered a full Smart Checklist operator surface:

- Core items: **API-backed** via existing `TASK_CHECKLIST` / `49_WorkInboxChecklist.js` (Google Sheet).
- Feedback, attachments (metadata), links, history, layout archive overlay, templates: **browser localStorage** or **static seed** (templates).

Operators need durable, auditable checklist data and file evidence without rewriting Work Inbox or introducing workflow/agent runtimes.

---

## Decision

1. **Google Sheet is the system of record for checklist structured data** — items, feedback, links, history, templates, layout state, and **file metadata** (not file bytes).

2. **Google Drive is the system of record for checklist binary files** — PDF, images, spreadsheets attached to checklist items.

3. **Canonical item store:** existing spreadsheet tab **`TASK_CHECKLIST`** (not a duplicate `CHECKLIST_ITEMS` tab in production). Logical name `CHECKLIST_ITEMS` in contracts maps 1:1 to `TASK_CHECKLIST` columns — see `CHECKLIST_SHEET_PERSISTENCE_CONTRACT.md`.

4. **New satellite tabs** (bootstrap in phase 09): `CHECKLIST_FEEDBACK`, `CHECKLIST_ATTACHMENTS`, `CHECKLIST_LINKS`, `CHECKLIST_HISTORY`, `CHECKLIST_TEMPLATES`, `CHECKLIST_TEMPLATE_ITEMS`, `CHECKLIST_LAYOUT_STATE`.

5. **Drive folder root:** `OCMS_CHECKLIST_FILES/` under the project’s operational Drive root (align with `TASK_ATTACHMENT` / Work Inbox Drive conventions when bridge is built). Path pattern: `TASK_<taskId>/ITEM_<checklistItemId>/`.

6. **Append-only:** `CHECKLIST_HISTORY` rows are never updated in place; corrections are new rows.

7. **No implementation in phase 08** — no sheet creation, upload, migration, or background sync.

8. **Local runtime after bridge:** UI may cache read models; **must not** be authoritative once Sheet/Drive bridge is live for that concern.

9. **Preserves:** all Smart Checklist UI runtimes (01–07). Bridge phases swap persistence adapters only.

10. **Explicitly out of scope for persistence ADR:** workflow engine, agent runtime, Case `CASE_MAIN` store, auto-sync without operator visibility.

---

## Consequences

| Area | Effect |
|------|--------|
| Phase 09 | Schema bootstrap + manifest alignment for new tabs |
| Phase 10 | Idempotent Drive folder provisioning |
| Phase 11 | GAS/Worker read-write bridge; FE stops writing localStorage for bridged concerns |
| Phase 12 | Optional export/import migration from localStorage; manual-first |
| TASK_CHECKLIST | Additive columns only (`IS_ARCHIVED`, `SCHEMA_VERSION`) via controlled migration — no drop |

---

## Alternatives rejected

| Alternative | Why rejected |
|-------------|--------------|
| Keep all satellite data in localStorage | No cross-device audit; conflicts with TASK_CHECKLIST already on Sheet |
| Store files in Sheet as Base64 | Sheet size/performance; violates Drive-first file rule |
| Single mega-tab | Poor audit, breaks append-only history, blocks parallel writes |
| Immediate auto-sync | Violates Manual First → Auto Later; risks silent overwrite |

---

## Rollback

Until phase 11 is production-enabled:

- Existing `TASK_CHECKLIST` GAS path remains.
- localStorage runtimes remain fallback.
- Feature flag `CHECKLIST_SHEET_BRIDGE_ENABLED` (proposed) defaults **false** until UAT sign-off.

Rollback = disable flag; FE reverts to local adapters; Sheet rows remain (non-destructive).

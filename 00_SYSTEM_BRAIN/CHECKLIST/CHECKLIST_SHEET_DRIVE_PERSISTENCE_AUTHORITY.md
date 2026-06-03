# Checklist Sheet + Drive Persistence Authority

**Phase:** `PHASE_CHECKLIST_08_SHEET_DRIVE_PERSISTENCE_DECISION`  
**Status:** ACCEPTED (decision only — no bridge live)

---

## Source of truth

| Concern | Authority |
|---------|-----------|
| Checklist items | Google Sheet tab **`TASK_CHECKLIST`** |
| Feedback, links, history, layout, templates | Google Sheet satellite tabs (post phase 09) |
| Attachment metadata | `CHECKLIST_ATTACHMENTS` Sheet tab |
| Attachment bytes | Google Drive under `OCMS_CHECKLIST_FILES/` |
| Case projection | Read-only compose from Sheet/Drive (Case remains projection layer) |

---

## Runtime today (pre-bridge)

| Runtime | Persistence |
|---------|-------------|
| Items CRUD | **Sheet** via GAS (`49_WorkInboxChecklist.js`) |
| Feedback | `localStorage` `cbv-checklist-feedback:v1:{taskId}` |
| Attachments | `localStorage` metadata only |
| Links | `localStorage` |
| History | `localStorage` append-only |
| Layout / archive overlay | `localStorage` |
| Templates | In-bundle static seed |

---

## Binding rules

1. **Google Sheet** is SoT for checklist **data** after bridge is enabled for that concern.
2. **Google Drive** is SoT for checklist **files** after upload bridge is enabled.
3. **localStorage** is temporary cache/UI convenience only **after** bridge UAT — not authoritative.
4. **History** Sheet rows: **append-only**.
5. **No binary** in Sheet.
6. **No destructive migration** without explicit operator-approved phase.
7. **No uncontrolled background sync** — writes observable in Work Inbox; flag-gated.
8. **No workflow engine** or **agent runtime** introduced by persistence work.

---

## Implementation ownership (future)

| Phase | Owner artifact |
|-------|----------------|
| 09 | `90_BOOTSTRAP_SCHEMA` / GAS ensure tabs |
| 10 | Drive folder service (GAS or shared util) |
| 11 | `49_WorkInboxChecklist.js` extensions + new `5x_` modules + Worker routes |
| 12 | FE adapter swap + migration tooling |

---

## Contracts

- `CHECKLIST_SHEET_PERSISTENCE_CONTRACT.md`
- `CHECKLIST_DRIVE_PERSISTENCE_CONTRACT.md`
- `CHECKLIST_SHEET_DRIVE_MAPPING_NOTES.md`
- `CHECKLIST_LOCAL_TO_SHEET_DRIVE_MIGRATION_PLAN.md`
- `ADR_CHECKLIST_SHEET_DRIVE_PERSISTENCE.md`

---

## Verify (decision phase)

```bash
npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistPersistenceDecisionChecks.ts
```

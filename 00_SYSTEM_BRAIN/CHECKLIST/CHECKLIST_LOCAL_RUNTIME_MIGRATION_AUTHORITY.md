# Checklist Local Runtime Migration Authority

**Phase:** `PHASE_CHECKLIST_12_LOCAL_RUNTIME_MIGRATION`

---

## Who may migrate

| Actor | Permission |
|-------|------------|
| Operator with NOTES permission | Dry-run + commit via UI |
| Apps Script | `CBV_TCS_CHECKLIST_12_validateMigration`, `clMigrateFromLocalExport_` |

---

## Commit authority

Commit requires:

- Explicit checkbox in UI (`commitConfirmed`)
- Sheet bridge enabled (recommended)
- Worker + Task DB available

---

## Not authorized in phase 12

- Auto-migrate on page load
- Background scheduled migration
- localStorage clear after success
- File binary upload
- Sheet row delete

---

## Next phase

`PHASE_CHECKLIST_13_FILE_UPLOAD_RUNTIME`

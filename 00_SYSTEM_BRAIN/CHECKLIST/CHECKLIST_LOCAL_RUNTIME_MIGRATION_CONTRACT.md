# Checklist Local Runtime Migration Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_12_LOCAL_RUNTIME_MIGRATION`  
**Status:** ACTIVE

---

## API (Workboard)

| Function | Purpose |
|----------|---------|
| `inspectLocalRuntime(taskId?)` | Count local records per task |
| `exportLocalRuntime(taskId?)` | JSON backup payload |
| `downloadMigrationExport(taskId?)` | Download JSON file |
| `dryRunLocalToSheetDriveMigration(input, operator)` | Preview without writes |
| `commitLocalToSheetDriveMigration(input, operator)` | Write via phase 11 bridge |
| `validateChecklistLocalRuntimeMigration()` | Static readiness check |

---

## MigrationInput

```text
taskId?, checklistItemIds?, includeFeedback/Attachments/Links/History/Templates/LayoutState/CrudOverlay
dryRun: boolean
commitConfirmed: boolean  // REQUIRED true for commit
actor?, traceId?
```

---

## Rules

1. **Dry-run before commit** — operator reviews report.
2. **commitConfirmed** — must be `true` for non-dry-run.
3. **Idempotent** — duplicate IDs skipped (`skip_duplicate`).
4. **localStorage preserved** — never auto-cleared.
5. **Append-only** — feedback/history via bridge append methods.
6. **Attachments** — metadata only; Drive folder ensured, no file upload.
7. **Templates** — static seed not migrated from localStorage in v1.

---

## Duplicate keys

`feedback_id`, `attachment_id`, `link_id`, `history_id`, and `history` content hash `(itemId|createdAt|message)`.

---

## Rollback

1. Disable bridge flag (`cbv-checklist-sheet-bridge:v1` or env).
2. FE uses localStorage again.
3. Sheet rows remain — no automatic delete.

---

## GAS

`validateChecklistLocalRuntimeMigration()` — readiness  
`clMigrateFromLocalExport_(payload)` — optional server ingest of export JSON (subset)

---

## UI

`ChecklistMigrationPanel` on Work Inbox checklist section — Export, Dry-run, Commit (checkbox).

# Local Runtime Migration — Runtime Notes

**Phase:** `PHASE_CHECKLIST_12_LOCAL_RUNTIME_MIGRATION`

---

## localStorage keys

| Prefix | Store |
|--------|--------|
| `cbv-checklist-feedback:v1:` | Feedback |
| `cbv-checklist-attachment:v1:` | Attachments metadata |
| `cbv-checklist-link:v1:` | Links |
| `cbv-checklist-history:v1:` | History |
| `cbv-checklist-crud-overlay:v1:` | Note/archive overlay |
| `cbv-checklist-layout:v1:` | Expanded/archived UI |

---

## Operator flow

1. Open task checklist → **Di chuyển dữ liệu local → Sheet**
2. **Export JSON** (backup)
3. Enable bridge if needed
4. **Dry-run** → review counts
5. Check confirmation → **Commit migration**
6. Enable bridge for reads; verify Sheet tabs
7. Clear local keys manually only after UAT

---

## Code

- `checklistLocalRuntimeMigration.ts`
- `ChecklistMigrationPanel.tsx`
- `54_CHECKLIST_LOCAL_RUNTIME_MIGRATION.js` (GAS validate)

---

## Cutover

After successful commit + UAT: set `cbv-checklist-sheet-bridge:v1=true` and keep local export file for audit.

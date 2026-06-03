# Dossier Cross-Focus — Runtime Notes

**Phase:** `PHASE_DOSSIER_04_CROSS_FOCUS_NAVIGATION`

---

## Operator flow

1. Open Focus → tab **Hồ sơ**.
2. Click **Đi tới bước** on a checklist-linked item or group header.
3. Center checklist scrolls, expands, and highlights the step briefly.

Task-level items show: *Tài liệu cấp task, không gắn với bước checklist.*

---

## Pilot

```bash
npx tsx 00_SYSTEM_BRAIN/DOSSIER/dossierCrossFocusChecks.ts
```

---

## Rollback

Remove `useChecklistCrossFocusListener` from `WorkInboxChecklistSection` and revert `DossierAggregatePanel` to phase 03 (no **Đi tới bước** buttons).

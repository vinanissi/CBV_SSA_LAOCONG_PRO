# Dossier Actions — Runtime Notes

**Phase:** `PHASE_DOSSIER_05_DOSSIER_ACTIONS`

---

## UI per item type

| Type | Actions |
|------|---------|
| Attachment / link | Mở · Copy link · Mở Drive (if applicable) · Đi tới bước |
| Feedback | Đi tới bước · Xem ngữ cảnh |
| Task-level | Mở · Copy link · (no Đi tới bước) |

---

## Pilot

```bash
npx tsx 00_SYSTEM_BRAIN/DOSSIER/dossierActionsChecks.ts
```

---

## Rollback

Revert `DossierAggregatePanel` to phase 04 (single **Đi tới bước** button, no action row).

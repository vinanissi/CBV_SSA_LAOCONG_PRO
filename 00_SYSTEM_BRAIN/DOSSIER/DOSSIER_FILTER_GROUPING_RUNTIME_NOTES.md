# Dossier Filter & Grouping — Runtime Notes

**Phase:** `PHASE_DOSSIER_03_DOSSIER_FILTER_AND_GROUPING`

---

## UI

Right **Hồ sơ** tab:

- Filter chips: **Tất cả** · **Tài liệu** · **Liên kết** · **Phản hồi** (with counts)
- Grouping: **Theo bước** · **Cấp task** · **Danh sách**

---

## Pilot

```bash
npx tsx 00_SYSTEM_BRAIN/DOSSIER/dossierFilterGroupingChecks.ts
```

---

## Rollback

Revert `DossierAggregatePanel.tsx` to phase 01/02 version (filters removed).

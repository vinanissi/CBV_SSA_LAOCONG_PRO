# Phase Report — DOSSIER_02 Remove Recent Documents From Center

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_DOSSIER_02_REMOVE_RECENT_DOCUMENTS_FROM_CENTER` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-01 |

---

## Delivered

- Center **TÀI LIỆU GẦN ĐÂY** hidden by default (feature-flag rollback)
- Compact hint → right panel **Hồ sơ**
- `WorkInboxTaskAttachmentDialogHost` preserves task attach from action bar
- Checklist upload/metadata unchanged
- Layout contract + authority + checks

---

## Warnings

- Live UI smoke test not run in CI
- Task attach only via action bar dialog (not center button)

---

## Next

`PHASE_DOSSIER_03_DOSSIER_FILTER_AND_GROUPING`

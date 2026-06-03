# Dossier Center / Right Layout — Runtime Notes

**Phase:** `PHASE_DOSSIER_02_REMOVE_RECENT_DOCUMENTS_FROM_CENTER`

---

## Code

| Artifact | Path |
|----------|------|
| Layout flag | `dossierCenterLayoutConfig.ts` |
| Center UI | `FocusContentCards.tsx` |
| Task attach dialog | `WorkInboxTaskAttachmentDialogHost.tsx` |
| Right aggregate | `DossierAggregatePanel` (phase 01) |

---

## Pilot

1. Focus task → center shows checklist only + hint to **Hồ sơ**.
2. Right **Hồ sơ** → task + checklist documents.
3. **Đính kèm tài liệu** from action bar still opens dialog.

```bash
npx tsx 00_SYSTEM_BRAIN/DOSSIER/dossierCenterLayoutChecks.ts
```

---

## Rollback

`localStorage.setItem('cbv-dossier-center-attachments-preview:v1', 'true')` then reload.

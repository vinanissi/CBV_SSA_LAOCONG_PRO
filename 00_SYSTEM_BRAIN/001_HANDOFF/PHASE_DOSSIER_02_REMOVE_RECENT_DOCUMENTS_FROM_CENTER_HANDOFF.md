# Handoff — DOSSIER_02 Remove Center Documents

| **Next** | `PHASE_DOSSIER_03_DOSSIER_FILTER_AND_GROUPING` |

---

## Verify

1. Focus mode: no **TÀI LIỆU GẦN ĐÂY** block under checklist.
2. Hint points to **Hồ sơ** tab.
3. **Hồ sơ** shows task + checklist evidence.
4. Action bar **Đính kèm tài liệu** still works.

```bash
npx tsx 00_SYSTEM_BRAIN/DOSSIER/dossierCenterLayoutChecks.ts
```

---

## Rollback

`localStorage.setItem('cbv-dossier-center-attachments-preview:v1', 'true')`

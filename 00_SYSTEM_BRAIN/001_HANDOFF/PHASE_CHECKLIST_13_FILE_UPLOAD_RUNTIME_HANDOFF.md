# Handoff — CHECKLIST_13 File Upload Runtime

| **Next** | `PHASE_CHECKLIST_14_MULTI_USER_SYNC` |

---

## Pilot steps

1. Deploy GAS (`clasp push`) + Worker with checklist bridge route.
2. Configure Drive root (phase 10).
3. Enable bridge:

```javascript
localStorage.setItem('cbv-checklist-sheet-bridge:v1', 'true')
```

4. Open task checklist → item → **📎 Tài liệu** → **+ Tải tệp lên**.
5. Select file ≤10MB → confirm Drive file, Sheet row, history.

```bash
npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistFileUploadChecks.ts
```

GAS: `CBV_TCS_CHECKLIST_13_validateUpload()`

---

## Rollback

Disable bridge flag; uploads blocked; existing Drive files not auto-deleted.

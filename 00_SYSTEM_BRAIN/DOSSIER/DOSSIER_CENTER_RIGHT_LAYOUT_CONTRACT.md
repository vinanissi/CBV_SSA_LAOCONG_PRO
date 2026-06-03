# Dossier Center / Right Layout Contract

**Phase:** `PHASE_DOSSIER_02_REMOVE_RECENT_DOCUMENTS_FROM_CENTER`  
**Status:** ACTIVE

---

## Layout model

```text
centerPanelRole: checklist_work_surface
rightPanelRole: dossier_evidence_view
centerRecentDocumentsVisible: false (default)
rightPanelDossierRequired: true
```

---

## Rules

- Center must **not** render full **TÀI LIỆU GẦN ĐÂY** block by default.
- Right **Hồ sơ** tab aggregates task + checklist evidence.
- Compact hint in center may point operators to **Hồ sơ**.

---

## Rollback

```javascript
localStorage.setItem('cbv-dossier-center-attachments-preview:v1', 'true')
```

Or `VITE_DOSSIER_CENTER_ATTACHMENTS_PREVIEW=true`.

---

## Upload access

| Entry | Location |
|-------|----------|
| Task-level link/text attach | Action bar → Đính kèm tài liệu (dialog host) |
| Checklist file upload | Checklist item → 📎 → Tải tệp lên |
| Checklist metadata | + Thêm tài liệu |

---

## Next

`PHASE_DOSSIER_03_DOSSIER_FILTER_AND_GROUPING`

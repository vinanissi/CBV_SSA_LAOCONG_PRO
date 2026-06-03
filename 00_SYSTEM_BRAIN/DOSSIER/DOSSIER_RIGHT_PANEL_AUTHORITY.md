# Dossier Right Panel Authority

**Phase:** `PHASE_DOSSIER_01_RIGHT_PANEL_AGGREGATE_VIEW`

---

## Authority

| Layer | Role |
|-------|------|
| Sheet/Drive | Persistence (unchanged) |
| Task attachments | Task-level source |
| Checklist runtime | Item-level sources |
| Dossier view | **Aggregate read model only** |

---

## Layout

```text
Center = Checklist work surface (+ preview attachments until phase 02)
Right  = Hồ sơ aggregate tab (read-only)
```

---

## Not authorized

- New persistence store
- File move/delete from dossier tab
- Workflow / agent runtime

---

## Next

`PHASE_DOSSIER_02_REMOVE_RECENT_DOCUMENTS_FROM_CENTER`

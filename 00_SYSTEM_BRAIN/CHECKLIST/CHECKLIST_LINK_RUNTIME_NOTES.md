# Checklist Link Runtime Notes

**Phase:** `PHASE_CHECKLIST_04_LINKS`

---

## Flow

```text
🔗 Liên kết chip → ChecklistLinkPanel
  → registerLink / openChecklistLinkUrl
  → checklistLinkLocalStore
```

Inline actions re-derived after link enrich so chip count stays in sync.

---

## Type inference

`inferChecklistLinkType(url)` — zalo, sheet, form, drive, external.

---

## Limitations

- Per-browser localStorage
- No link preview/metadata fetch
- Label+invalid URL stored as disabled reference

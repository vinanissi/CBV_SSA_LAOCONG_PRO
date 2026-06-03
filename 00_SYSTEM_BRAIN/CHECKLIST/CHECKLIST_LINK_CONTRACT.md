# Checklist Link Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_04_LINKS`  
**Status:** ACCEPTED (local reference runtime)

---

## ChecklistLink

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | |
| `checklistItemId` | string | yes | |
| `label` | string | yes | Operator-facing name |
| `url` | string | yes | May be empty → disabled open |
| `type` | string | no | Inferred: zalo, drive, sheet, form, external |
| `description` | string \| null | no | |
| `source` | string | no | manual, existing_document, … |
| `createdBy` | string \| null | no | |
| `createdAt` | string \| null | no | |

---

## SmartChecklistItem

```text
linkCount: number   // = links.length when enriched
links?: ChecklistLink[]
```

Defaults: `links = []`, `linkCount = 0`.

---

## Open rules

- Valid URL: `http:` or `https:` only → `window.open` with `noopener`
- Invalid/missing URL: render disabled; label-only reference allowed

---

## Storage

`localStorage` key: `cbv-checklist-link:v1:{taskId}`

---

## Out of scope

Global link repo, Zalo API, Drive sync, `CHECKLIST_LINK_TABLE`, workflow, agents.

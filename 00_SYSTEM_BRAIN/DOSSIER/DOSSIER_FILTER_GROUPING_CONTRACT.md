# Dossier Filter & Grouping Contract

**Phase:** `PHASE_DOSSIER_03_DOSSIER_FILTER_AND_GROUPING`  
**Status:** ACTIVE

---

## Filters

| id | label | itemTypes |
|----|-------|-----------|
| all | Tất cả | attachment, link, feedback |
| attachments | Tài liệu | attachment |
| links | Liên kết | link |
| feedback | Phản hồi | feedback |

---

## Grouping modes

| mode | label | Behavior |
|------|-------|----------|
| by_checklist_item | Theo bước | Checklist groups → task level → unknown |
| task_level | Cấp task | Task-level group first, then checklist |
| ungrouped | Danh sách | Single flat list |

---

## API

```text
applyDossierFilterGrouping(aggregate, activeFilter, activeGrouping) → DossierFilteredAggregate
```

Read-only — does not mutate underlying `DossierAggregate`.

---

## Empty states

- all: Chưa có hồ sơ liên quan.
- attachments: Chưa có tài liệu.
- links: Chưa có liên kết.
- feedback: Chưa có phản hồi.

---

## Next

`PHASE_DOSSIER_04_CROSS_FOCUS_NAVIGATION`

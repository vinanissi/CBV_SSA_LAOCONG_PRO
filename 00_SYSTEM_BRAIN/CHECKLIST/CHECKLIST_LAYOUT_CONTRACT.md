# Checklist Layout Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_06_CRUD_AND_LAYOUT_RUNTIME`

---

## ChecklistLayoutState (per item, derived)

| Field | Type | Notes |
|-------|------|-------|
| `checklistItemId` | string | |
| `expanded` | boolean | Row expanded (panels + note editor) |
| `lastOpenedAt` | string \| null | Optional |
| `updatedAt` | string \| null | Optional |

---

## ChecklistListLayoutState (per task)

| Field | Type | Default |
|-------|------|---------|
| `taskId` | string | required |
| `expandedItemIds` | string[] | `[]` |
| `archivedVisible` | boolean | `false` |
| `updatedAt` | string \| null | null |

---

## Storage

`localStorage` key: `cbv-checklist-layout:v1:{taskId}`

Layout-only changes are not written to history (per phase notes).

---

## UI controls

- **Mở tất cả** — expand all active (non-archived) items
- **Thu gọn tất cả** — collapse all
- **Hiện/ẩn bước lưu trữ** — toggle `archivedVisible`
- **Thu nhỏ** — collapse single item row

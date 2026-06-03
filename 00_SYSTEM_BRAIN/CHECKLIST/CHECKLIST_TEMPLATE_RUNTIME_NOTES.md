# Checklist Template Runtime Notes

**Phase:** `PHASE_CHECKLIST_07_TEMPLATE_RUNTIME`

---

## Operator flow

1. Click **Áp dụng mẫu** in checklist toolbar.
2. Select a template chip (4 active seeds).
3. Review numbered preview.
4. Click **Áp dụng vào checklist** — steps append after current items.

---

## Seed templates

| ID | Name |
|----|------|
| `tpl-ho-so-xa-vien` | Hồ sơ xã viên (5 steps) |
| `tpl-lien-he-khach` | Liên hệ khách hàng |
| `tpl-kiem-tra-giay-to` | Kiểm tra giấy tờ |
| `tpl-ban-giao-noi-bo` | Bàn giao nội bộ |

---

## History

- Summary entry on first created item: `Áp dụng mẫu "…" (N bước)` with metadata `templateId`, `templateName`, `createdChecklistItemIds`
- Per-item: `Tạo bước từ mẫu "…"`

---

## Limitations

- Templates are code-seeded, not editable in UI
- No server template API or DB tables
- Replace mode not implemented (`replace_preview_only` reserved)

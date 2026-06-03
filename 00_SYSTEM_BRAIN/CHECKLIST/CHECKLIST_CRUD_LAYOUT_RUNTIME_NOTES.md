# Checklist CRUD & Layout Runtime Notes

**Phase:** `PHASE_CHECKLIST_06_CRUD_AND_LAYOUT_RUNTIME`

---

## Operator flows

1. **+ Thêm bước** — toolbar creates item via API; history entry appended.
2. **Sửa / Đổi tên bước** — inline title edit; API PATCH title.
3. **Ghi chú bước** — local overlay note (merged with API note when present).
4. **Mở tất cả / Thu gọn tất cả** — local layout state only.
5. **⋯ menu** — move up/down (API sortOrder), archive, restore.
6. **Archive** — hides item unless “Hiện bước lưu trữ”; does not delete feedback/attachments/links/history blobs.

---

## Limitations

- Note persistence is local-first unless backend already returns `note` on list.
- Reorder requires API `sortOrder` support (mock + client PATCH).
- Hard delete (×) removed from row; use archive instead.

---

## History

Meaningful CRUD events recorded via existing history runtime (create, edit title/note, move, archive, restore, status).

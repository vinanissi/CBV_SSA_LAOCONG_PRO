# Handoff — UI Action Bar Sticky Bottom

---

## Verify

1. Open Focus on a task — checklist scrolls; actions stick to bottom of center column.
2. **Mở chi tiết**, **Tạm dừng**, **Chuyển giao**, **Hoàn thành**, **Thao tác khác** behave as before.
3. Header **‹ Trước** / **Sau ›** still works.
4. Last checklist row not hidden behind bar when scrolled to end.

```bash
npx tsx 00_SYSTEM_BRAIN/UI/focusActionBarStickyBottomChecks.ts
cd apps/workboard && npm run build
```

## Rollback

`localStorage.setItem('cbv-focus-inline-action-bar:v1', 'true')`

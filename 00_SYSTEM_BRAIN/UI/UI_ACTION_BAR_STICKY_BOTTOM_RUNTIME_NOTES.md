# Sticky Bottom Action Bar — Runtime Notes

**Phase:** `PHASE_UI_ACTION_BAR_STICKY_BOTTOM`

---

## Default UX

Focus center: checklist + work only. Actions pinned at bottom of focus workspace:

**Mở chi tiết** · **Tạm dừng** · **Chuyển giao** · **Hoàn thành** · **Thao tác khác**

---

## Pilot

```bash
npx tsx 00_SYSTEM_BRAIN/UI/focusActionBarStickyBottomChecks.ts
```

---

## Rollback

`localStorage.setItem('cbv-focus-inline-action-bar:v1', 'true')` then reload.

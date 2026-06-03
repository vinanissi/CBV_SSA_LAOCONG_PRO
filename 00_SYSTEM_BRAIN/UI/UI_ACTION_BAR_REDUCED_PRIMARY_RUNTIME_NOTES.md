# Reduced Primary Action Bar — Runtime Notes

**Phase:** `PHASE_UI_ACTION_BAR_REDUCE_PRIMARY_ACTIONS`

---

## Default (sticky + three-region focus)

Bar: **Tạm dừng** · **Chuyển giao** · **Hoàn thành** · **Thao tác khác**

**Mở chi tiết** → **Thao tác khác** (or use right **Chi tiết** tab).

---

## Pilot

```bash
npx tsx 00_SYSTEM_BRAIN/UI/focusActionBarReducePrimaryChecks.ts
```

---

## Rollback full primary bar

`localStorage.setItem('cbv-focus-full-primary-action-bar:v1', 'true')`

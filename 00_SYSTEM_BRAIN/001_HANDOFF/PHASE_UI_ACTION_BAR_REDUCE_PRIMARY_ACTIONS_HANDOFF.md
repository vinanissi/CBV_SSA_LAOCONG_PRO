# Handoff — UI Action Bar Reduce Primary Actions

---

## Verify

1. Focus (three-region) — sticky bar shows 4 actions, no large blue **Mở chi tiết**.
2. **Thao tác khác** → **Mở chi tiết** still works.
3. Right **Chi tiết** tab still shows task detail.

```bash
npx tsx 00_SYSTEM_BRAIN/UI/focusActionBarReducePrimaryChecks.ts
cd apps/workboard && npm run build
```

## Rollback

`localStorage.setItem('cbv-focus-full-primary-action-bar:v1', 'true')`

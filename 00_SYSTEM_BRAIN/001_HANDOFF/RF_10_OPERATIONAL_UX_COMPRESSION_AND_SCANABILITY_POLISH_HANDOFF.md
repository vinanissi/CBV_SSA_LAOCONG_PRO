# Handoff — RF_10 Operational UX Compression and Scanability Polish

## Summary

Desktop operator UX polish in **`apps/workboard/`** only. Contracts RF_07/RF_09 unchanged.

## What changed for operators

1. **Focus Strip** — always visible above main content; click to jump to overdue / hồ sơ / finance / coordination.
2. **Task cards** — scan in ~1s: priority color, title, subtitle, SLA, action row.
3. **Right panel** — wider (400px), better timeline and file rows.
4. **Top status strip** — subtle OK / Chỉ xem / Thủ công indicators.
5. **Sidebar** — “Làm việc hôm nay” primary; config secondary.

## Run locally

```bash
cd workers/api && npm run dev
cd apps/workboard && npm run dev
```

## Verify

```bash
cd apps/workboard
npm run build
```

Check: Home, Tasks, Finance, HoSo, Coordination, Observation — no overflow, readable text.

## Do NOT

- Revert to pure-black panels without contrast
- Re-add technical labels (runtime, projection, stub) to UI
- Add write actions in this layer

## Next phase

**PHASE_RF_11_OPERATOR_WORKFLOW_ACCELERATION**

# PHASE_TASK_GS_08 — Handoff

**From:** Signal collapse runtime  
**Status:** GO

## Delivered

1. Dominant signal engine — 1 primary + optional secondary per card
2. Signal hierarchy collapse (8 levels)
3. Escalation saturation when queue >25% escalated
4. Metadata collapse on cards; full detail in panel
5. Pattern-first border colors (red/violet/amber/sky)
6. Denser card rows for throughput

## Verify

```bash
cd apps/workboard && npm run dev
```

- Task with escalation+overdue+stale → card shows only dominant (Escalation), secondary stale subtle
- Open task → escalation intensity fades on revisit
- Right panel → "Signals (collapsed on list)" shows suppressed signals
- Many escalations in queue → muted intensity

Checks: `runTaskGs08Checks()` in `taskGs08Checks.ts`

## Do NOT

- Add more badges/chips on cards
- Stack warnings on list layer

## Next

- Optional hover secondary reveal
- Precomputed dominant signal in GAS snapshot

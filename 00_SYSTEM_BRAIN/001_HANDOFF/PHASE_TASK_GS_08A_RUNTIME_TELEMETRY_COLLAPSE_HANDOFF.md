# PHASE_TASK_GS_08A — Handoff

**From:** Runtime telemetry collapse  
**Status:** GO

## Delivered

1. `RuntimeTelemetryStrip` — single compact line
2. Health tiers: healthy / warning / critical
3. `[Chi tiết]` expands full diagnostics + counters + warnings
4. Removed duplicate banners and counter strip from TasksPage
5. ~70% telemetry vertical space saved

## Verify

```bash
cd apps/workboard && npm run dev
```

- Healthy runtime → subtle strip, no amber banners
- Slow/degraded → amber strip + notice
- Click **Chi tiết** → latency, rows, sync, mode, full stats

Checks: `runTaskGs08aChecks()` in `taskGs08aChecks.ts`

## Do NOT

- Remove diagnostics (they live in Chi tiết)
- Add more telemetry fields to collapsed strip

## Next

- Share strip component with other task views if needed

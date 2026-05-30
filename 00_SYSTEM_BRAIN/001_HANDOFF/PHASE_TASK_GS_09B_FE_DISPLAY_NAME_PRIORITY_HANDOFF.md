# PHASE_TASK_GS_09B — Handoff

**From:** FE display name priority  
**Status:** GO

## Delivered

1. Unified `resolveUserLabel` / `formatUserDisplay` in `runtime/userDisplay.ts`
2. Full FE audit — cards, panel, timeline, handoff, queues, top bar, team pressure
3. Timeline message text resolves embedded `USR_*` and ASSIGN arrows
4. Technical ids moved to hover (`title`) only where needed
5. Safe fallback chain: displayName → … → userCode → id

## Verify

```bash
cd apps/workboard && npm run dev
```

- Task with mapped owner → card/panel show **Nguyễn Văn A**, not `USR_004`
- Hover owner row → see `USR_004` in tooltip
- Timeline handoff line `USR_001 → USR_002` → resolved names when map loaded
- Coordination queue assignee shows display name
- Top bar: name visible, userId on hover

```bash
cd apps/workboard && npm run build
```

## Do NOT

- Change DB or GAS schema in this phase
- Hardcode user names in components — use `userDisplay.ts` only
- Show raw USER_CODE in primary UI when displayName exists

## Prerequisite

GS_09A: GAS `ownerUser` enrichment + snapshot `userDisplayMap`.

## Next (optional)

- Directory picker for assign form (display name in UI, id on submit)
- Persist userDisplayMap in sessionStorage for detail-first navigation

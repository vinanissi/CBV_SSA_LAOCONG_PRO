# PHASE_TASK_GS_09A — Handoff

**From:** Display name mapping + theme mode  
**Status:** GO

## Delivered

1. GAS snapshot/detail enrich `ownerUser: { id, displayName }` from USER_DIRECTORY
2. Snapshot carries `userDisplayMap` for FE fallback
3. Timeline `actor` + `actorId` enriched server-side
4. FE `userDisplay.ts` — no hardcoded names; used in panel, cards, timeline, handoff, team pressure
5. Theme toggle (Sáng/Tối) in top bar, `cbv_theme_mode` in localStorage, default dark

## Verify

```bash
cd apps/workboard && npm run dev
```

- Open task with `OWNER_ID = USR_004` → panel shows DISPLAY_NAME (not raw id)
- Timeline actors show names when mapped
- Handoff chain shows resolved names on ASSIGN lines
- Click **☀ Sáng** → light shell; reload → theme retained
- Click **☾ Tối** → back to dark

```bash
cd apps/workboard && npm run build
```

## GAS deploy

```bash
cd gas-runtime-api && clasp push
```

Manual Web App deploy if clasp deploy blocked.

## Do NOT

- Rewrite task runtime or DB schema
- Redesign full UI for light theme
- Hardcode user names in FE components

## Next (optional)

- Invalidate user display cache when USER_DIRECTORY row changes
- Extend light theme tokens to remaining chip variants if operators request
- Add `userDisplayMap` to detail-only API response for offline-first fallback

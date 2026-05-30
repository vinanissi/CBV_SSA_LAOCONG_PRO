# PHASE_TASK_GS_02 — Handoff

**From:** PHASE_TASK_GS_02 implementation  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`

## Delivered

1. Real runtime binding — mock disabled for task workspace when Worker connected
2. Operational Context Panel (live timeline, SLA, files, next step)
3. Urgency layer on cards + detail
4. Quick actions + keyboard workflow
5. Operator observation append (optional sheet)
6. Runtime status bar with latency + cache

## Operator Setup

**Worker** (`workers/api/.dev.vars`):
```
GAS_TASK_API_URL=<same as GAS deploy URL>
CBV_TASK_RUNTIME_MODE=google_sheet_existing_db
CBV_TASK_SHEET_ID=1Jh3gQQKugazSvd24CKZremHjSmTNGrsnYczq4UzK5ZE
CBV_TASK_WRITE_MODE=gas
```

**Workboard** (`apps/workboard/.env`):
```
VITE_CBV_API_BASE_URL=http://localhost:8787
VITE_CBV_TASK_RUNTIME_MODE=google_sheet_existing_db
```

**Run:**
```bash
cd workers/api && npm run dev
cd apps/workboard && npm run dev
```

**GAS:** `clasp push` → `CBV_TCS_TASK_GS_02_runAll()`

## Key UX

- `/tasks` — snapshot + counts + urgency cards
- Select task → right panel (desktop) / bottom sheet (mobile)
- Quick: Nhận việc, Hoàn tất on card
- ESC closes panel

## Do NOT

- Re-enable mock fallback for task routes in production runtime
- Poll snapshot faster than cache TTL
- Redesign full UI / add AI automation

---

*Append-only handoff — PHASE_TASK_GS_02*

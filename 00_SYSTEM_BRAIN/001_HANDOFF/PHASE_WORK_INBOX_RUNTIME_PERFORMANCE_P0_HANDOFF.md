# PHASE_WORK_INBOX_RUNTIME_PERFORMANCE_P0 — Handoff

## Verdict

**GO_WITH_WARNINGS** — all P0 code complete; live benchmark pending GAS deploy.

## P0 fixes delivered

1. **Row index cache** — `taskDbRowIndex.js`, fast find, trace hit/miss.
2. **Selective refresh** — `WorkInboxRefreshPolicy`, no full snapshot after Start/Pause/Handoff.
3. **Combined action** — `wiOpRecordAction` + Worker route + FE client.

## Deploy steps

1. `clasp push` — include `taskDbRowIndex.js`, `workInboxCombinedAction.js`.
2. Redeploy GAS Web App.
3. Deploy Worker with `/api/work-inbox/record-action`.
4. Run manual benchmark checklist in report.

## Fallback behavior

If combined route missing, executor uses legacy 3-request path (still **no full snapshot** refresh).

## Next phase

- **PHASE_WORK_INBOX_RUNTIME_PILOT** — live benchmark, tune cache TTL, optional P1 delta bundle refresh.

## RCLA

All actions still via `WorkInboxRuntimeContextProvider` — no bypass.

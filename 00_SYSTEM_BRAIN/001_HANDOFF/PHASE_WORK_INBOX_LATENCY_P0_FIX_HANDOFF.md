# PHASE_WORK_INBOX_LATENCY_P0_FIX — Handoff

**Verdict:** GO_WITH_WARNINGS

## Deploy

1. `clasp push -f` — include new files: `workInboxMutationFast.js`, `workInboxAppendContext.js`
2. Deploy Worker API
3. Deploy workboard FE

## Manual benchmark

Capture `performanceTrace` after Pause + operational load:

| Action | Before | After | Target |
|--------|--------|-------|--------|
| Pause record-action | 7182ms | | ≤3500ms |
| Operational bundle | 3960ms | | ≤2500ms |

Check new trace fields: `mutationLookupMs`, `appendSharedContextUsed`, `timelineFastPathUsed`, `documentsFastPathUsed`, `workerFetchHeadersReceivedMs`.

## FE verification

- Pause → toast appears before right panel bundle refresh
- Status updates immediately from taskPatch
- `sessionStorage.cbv_work_inbox_latency_p0_fe` shows deferred refresh

## Do not rollback

- P0 row index (`taskDbRowIndex.js`)
- Combined action single round-trip
- Fetch loop hotfix (operational dedupe)

## Next if targets missed

- Profile `mutationLookupMs` vs `mutationSheetWriteMs` from new micro-timers
- Consider GAS execution API vs web app for cold start
- Indexed timeline sheet per task (future phase)

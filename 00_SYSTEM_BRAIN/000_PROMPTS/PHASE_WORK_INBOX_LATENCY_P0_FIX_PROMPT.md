# PHASE_WORK_INBOX_LATENCY_P0_FIX — Prompt

**Phase:** WORK_INBOX_LATENCY_P0_FIX  
**Mission:** Fix measured P0 latency bottlenecks before pilot. Optimize runtime internals only — no UI redesign, no workflow change, no TASK_MAIN schema change. RCLA v1.1 required.

## Measured baseline

- record-action PAUSE: 7182ms (mutation 3242ms, timeline+audit 1372ms, Worker/GAS gap ~2564ms)
- operational bundle: 3960ms (GAS 1732ms; timeline 1084ms, documents 626ms)

## Targets

- record-action: ≤3500ms
- operational: ≤2500ms
- perceived: ≤4s (FE optimistic + deferred bundle)

## Fix areas

1. Mutation micro-profiling + minimal taskPatch + combined-action fast path  
2. Shared append context for timeline + audit  
3. Operational timeline/documents tail-scan fast path  
4. FE optimistic patch + deferred bundle refresh (750ms)  
5. Worker fetch timing markers (gap analysis)

## Acceptance

GO / GO_WITH_WARNINGS (live benchmark pending) / FAIL per spec.

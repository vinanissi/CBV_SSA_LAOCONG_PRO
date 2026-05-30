# PHASE_WORK_INBOX_LATENCY_PROFILING — Prompt

**Phase:** WORK_INBOX_LATENCY_PROFILING  
**RCLA:** CBV-RCLA v1.1 — context via Runtime Context Registry / WorkInboxRuntimeContextProvider  
**Mission:** MEASURE · TRACE · PROFILE · IDENTIFY latency bottlenecks. No optimization. No redesign.

## Objectives

1. Locate where 5–7s (record-action) and 3–4s (operational) occur across FE / Worker / GAS / Sheet.
2. Profile 10 target actions with extended trace envelope.
3. Produce action timing table + P0/P1/P2 bottleneck ranking from **measured** traces (live deploy) or instrumentation readiness + manual checklist.

## Trace envelope

Per action: `traceId`, `action`, `taskId`, `actor`, `totalDurationMs`, `fe`, `worker`, `gas`, `sheet`, `requestCount`, `status`.

## Profile targets

OPEN_TASK · Start Processing · Pause · Handoff · Complete · Save Note · Create Appointment · Navigate Next/Previous · Search Open.

## Do NOT

Optimize · redesign · governance runtime · AI · workflow change · schema change · fake benchmarks.

## Acceptance

**GO** — breakdown exists, bottlenecks identified (from live or structural instrumentation), build pass, no regression.  
**GO_WITH_WARNINGS** — live benchmark pending post-deploy.  
**FAIL** — estimates only, no GAS/sheet timing, business logic changed.

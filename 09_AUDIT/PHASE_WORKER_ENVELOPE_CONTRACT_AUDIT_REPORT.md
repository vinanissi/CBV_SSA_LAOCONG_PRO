# PHASE_WORKER_ENVELOPE_CONTRACT — Worker Envelope Contract Audit Report

**Result:** GO  
**Date:** 2026-06-03  
**Branch:** `phase/data-relationship-refactor-prep`  
**Prerequisites:** `PHASE_DATA_REL_06B_WORKER_TYPECHECK_REPAIR`, `PHASE_DATA_REL_09_STATIC_AUDIT_FRAMEWORK`

---

## 1. Summary

Hardened Worker API response typing so **`ApiEnvelope<T>`** fields (`ok`, `status`, `data`, `warnings`, `errors`, `traceId`) are preserved when **`performanceTrace`** is attached. Centralized HTTP mapping in **`resolveHttpStatus`** + **`corsJsonResponse`**; removed **31** redundant `as ApiEnvelope<unknown>` casts in `router.ts`.

**Response JSON contract unchanged** — same fields on the wire; optional top-level `performanceTrace` on work-inbox routes only.

---

## 2. Files changed

| File | Change |
|------|--------|
| `workers/api/src/utils/envelope.ts` | `ApiEnvelopeWire`, `ApiEnvelopeWithPerf`, `resolveHttpStatus`, `corsJsonResponse`, `attachPerformanceTrace` |
| `workers/api/src/modules/workInboxPerformanceTrace.ts` | Re-export type; `envelopeWithRoutePerf` → `attachPerformanceTrace` |
| `workers/api/src/router.ts` | `ApiEnvelopeWire<unknown>`; `corsJsonResponse` (no wide casts) |
| `09_AUDIT/scripts/workerEnvelopePhase10Checks.mjs` | **NEW** static checks |
| `09_AUDIT/PHASE_WORKER_ENVELOPE_CONTRACT_AUDIT_REPORT.md` | **NEW** |

**Unchanged behavior:** `createEnvelope`, `jsonEnvelope` serialization shape, `resolveHttpStatus` rules (moved from router verbatim).

---

## 3. Contract model

```text
ApiEnvelope<T>
  ok, status, data, warnings, errors, traceId

ApiEnvelopeWire<T> = ApiEnvelope<T> & { performanceTrace?: WorkInboxPerformanceTraceEnvelope }

ApiEnvelopeWithPerf<T> = ApiEnvelope<T> & { performanceTrace: WorkInboxPerformanceTraceEnvelope }
```

| Function | Role |
|----------|------|
| `createEnvelope` | Build standard envelope |
| `attachPerformanceTrace` | Add perf block without dropping envelope fields |
| `envelopeWithRoutePerf` | Work-inbox routes (returns `ApiEnvelopeWithPerf`) |
| `corsJsonResponse` | CORS + JSON + status from envelope |

---

## 4. Findings fixed

| Finding | Action |
|---------|--------|
| `envelopeWithRoutePerf` spread lost explicit envelope typing in router | `ApiEnvelopeWire` union type |
| Router repeated unsafe casts | Single `corsJsonResponse` helper |
| `resolveStatus` duplicated in router | Moved to `envelope.ts` as `resolveHttpStatus` |

---

## 5. Findings deferred

| Finding | Notes |
|---------|--------|
| Full runtime JSON schema test | No jest in workers/api; static checks only |
| Add phase 10 to `runDataRelAuditSuite` | Optional Phase 15 |
| Circular import envelope ↔ perf | Mitigated via `import type`; tsc passes |

---

## 6. Tests run

```bash
npm run typecheck --prefix workers/api
npm run test:permissions --prefix workers/api
npm run typecheck --prefix apps/workboard
node 09_AUDIT/scripts/workerEnvelopePhase10Checks.mjs
```

| Command | Result |
|---------|--------|
| `workers/api` typecheck | **Pass** |
| `workers/api` test:permissions | **Pass** |
| `apps/workboard` typecheck | **Pass** |
| `workerEnvelopePhase10Checks.mjs` | **GO** (10/10) |

---

## 7. Risks / rollback

| Risk | Mitigation |
|------|------------|
| FE expects exact keys only | Wire shape unchanged |

**Rollback:** Revert `envelope.ts`, `router.ts`, `workInboxPerformanceTrace.ts`.

---

## 8. Next recommended phase

**PHASE_DATA_REL_11 — GAS Guard Coverage Audit**

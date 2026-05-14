# 107 — Milestone 04 — Decision log (append-only)

## D-107-01 — Execution aliases map to STAFF_TASK_DETAIL

**Decision:** `/workspace/execution/task` and `/execution/task` reuse `STAFF_TASK_DETAIL` page type and the same renderer path as staff task detail (query `taskId`), avoiding a duplicate page type while still giving bookmarkable “execution” URLs.

**Rationale:** Single cockpit implementation; fewer branches in `94_`; satisfies spec alias requirement without extra template dispatch.

## D-107-02 — Route URL frozen set expanded

**Decision:** Added four operational paths to `998H` frozen list so `CbvWebAppRouteUrl_validate` enforces canonical `?route=` coverage for focus and execution aliases.

**Rationale:** TCS and ROUTE_URL_VALIDATE require map/frozen parity; prevents silent drift.

## D-107-03 — No git tag until Drive GO

**Decision:** Do not create `milestone-04-operation-execution-flow` tag until a real GAS run produces a valid six-file Drive bundle with `envelopeOk=true`.

**Rationale:** Matches user “no fake GO” / append-only evidence policy.

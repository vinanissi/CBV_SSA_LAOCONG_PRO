# ADR — GAS Runtime API File Load Order

- **ID**: ADR_GAS_FILE_LOAD_ORDER
- **Date**: 2026-05-31
- **Status**: **ACCEPTED**
- **Context phase**: `PHASE_GAS_RUNTIME_API_FILE_LOAD_ORDER_REFACTOR`
- **Scope**: `gas-runtime-api/` (standalone clasp project, `.clasp.json` + `appsscript.json` unchanged)

---

## Context

Google Apps Script loads all project files in **lexicographic filename order**. The `gas-runtime-api` project grew organically (RF_12 legacy, TASK_GS_01, AUTH_01, HOME_ALERT, Work Inbox operational runtime) with unprefixed names (`Code.js`, `Utils.js`, `taskDbService.js`, …). Load order was implicit and fragile — e.g. `Code.js` loaded before `Config.js`, relying on lazy evaluation at call time rather than parse time.

Operator standard (CBV Operational Ecosystem V1): **runtime-first, append-only, manual-first**. File naming should make bootstrap order explicit without changing business logic.

---

## Decision

1. **All `.js` source files in `gas-runtime-api/` use numeric tier prefixes `00_`–`99_`.**
2. **Tier bands** (gaps reserved for future modules):

| Tier | Purpose | Files (2026-05-31) |
|------|---------|-------------------|
| `00`–`09` | Core constants / config / global guards | `00_Config`, `01_TaskDbConfig`, `02_AuthDbConfig`, `03_HomeAlertConfig`, `04_WorkInboxOperationalConfig` |
| `10`–`19` | Pure utilities (no business orchestration) | `10_Utils`, `11_Permissions`, `12_WorkInboxAppendContext`, `13_WorkInboxAppendFast`, `14_WorkInboxMutationFast` |
| `20`–`29` | Logging / audit / error / trace | `20_TaskDbAudit`, `21_TaskDbObservation`, `22_WorkInboxPerformanceTrace` |
| `30`–`39` | Sheet repositories / schema / index / cache | `30_Timeline`, `31_TaskDbSchemaMap`, `32_TaskDbRowIndex`, `33_TaskDbCache`, `34_TaskDbUserDisplay` |
| `40`–`49` | Domain services | `40_TaskDbService`, `41_Tasks`, `42_Finance`, `43_HoSo`, `44_AuthDbService`, `45_HomeAlertService`, `46_WorkInboxOperationalService`, `47_WorkInboxCombinedAction`, `48_WorkInboxCreateTask` |
| `50`–`59` | API contracts / response builders | *(reserved — builders inline in API handlers today)* |
| `60`–`69` | API handlers / action routers | `60_TaskDbApi`, `61_AuthDbApi`, `62_HomeAlertApi` |
| `70`–`79` | Runtime orchestration | *(reserved — routing lives in `90` + `60` today)* |
| `80`–`89` | Test consoles / manual tools | `80_AuthDbTestConsoleGs01a`, `81`–`84_TaskDbTestConsole*` |
| `90`–`99` | GAS entrypoints | `90_DoGetDoPost` (`doGet`, `doPost`) |

3. **`Code.js` → `90_DoGetDoPost.js`** — entrypoint loads last among application code so all handlers and globals exist before `doGet`/`doPost` are registered.
4. **No `onOpen` / custom menu** in this project — not required for Web App deployment.
5. **Clasp metadata unchanged**: `appsscript.json`, `.clasp.json` (`fileExtension: "js"`, `rootDir: "."`).
6. **Historical reports** referencing old filenames remain valid as audit artifacts; new work cites numbered names.

---

## Dependency rationale (summary)

```text
00–04 configs  →  10–14 utils  →  20–22 audit/trace
       →  30–34 repositories  →  40–48 domain services
       →  60–62 API routers  →  90 doGet/doPost
```

- **Dual timeline systems**: `30_Timeline.js` (RF_12 `TASK_TIMELINE`) and `46_WorkInboxOperationalService.js` (Work Inbox `TASK_TIMELINE` entity append) are independent; no parse-time cross-reference.
- **Lazy router guards** in `90_DoGetDoPost.js` (`typeof cbvIsTaskDbAction_ === 'function'`) remain for safe partial deploy; numbering does not remove them.

---

## Consequences

- **Positive**: Predictable GAS parse order; easier onboarding; aligns with `05_GAS_RUNTIME/` numbering convention elsewhere in repo.
- **Negative**: Workboard static check files that `readFileSync` GAS paths must track renames (updated in same phase).
- **Follow-up**: `clasp push` + new Web App version required for remote project to pick up renames (not done in refactor phase).

---

## Related

- `00_SYSTEM_BRAIN/000_REPORTS/PHASE_GAS_RUNTIME_API_FILE_LOAD_ORDER_REFACTOR_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/PHASE_GAS_RUNTIME_API_FILE_LOAD_ORDER_REFACTOR_HANDOFF.md`
- `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md`

---

*Append-only ADR. Amend via new addendum if tier assignment changes.*

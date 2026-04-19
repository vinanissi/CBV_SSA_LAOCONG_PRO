# Event-Driven Core — Audit & Migration Plan (CBV PRO)

**Status:** Active. **Tech stack:** Google Apps Script, Google Sheets, AppSheet (unchanged).

This document records the **repository audit**, the **target architecture** (MODULE → EVENT → CORE → RULE → ACTION), and the **phased rollout**. Implementation artifacts live in `05_GAS_RUNTIME/04_CORE_*.js` and sheets `EVENT_QUEUE`, `RULE_DEF`.

---

## 1. Executive summary

| Item | Finding |
|------|---------|
| **Current pattern** | Webhook `doPost` → `_routeWebhookAction` → `registerAction` handlers (`03_SHARED_ACTION_REGISTRY.js`) + small `switch` for `checklistDone` / `addLog`. Business rules live in module services as **hard-coded transition maps** and validators. |
| **Goal** | Centralize **decisions** in a core engine; modules keep **UI + persistence adapters**; rules become **data** (Sheet JSON rows) where possible. |
| **First deliverable** | `EVENT_QUEUE` + `RULE_DEF` in schema; `createCoreEvent` / `processCoreEvent` in GAS; optional **shadow** emission from FINANCE status changes. |

---

## 2. Audit — where logic lives today

### 2.1 Google Apps Script

| Location | Responsibility |
|----------|----------------|
| `61_UNIFIED_ROUTER.js` | Routes AppSheet webhooks vs HO_SO gateway. |
| `99_APPSHEET_WEBHOOK.js` | Registry dispatch + `switch` for checklist/log. Task/HO_SO actions registered here; finance in `30_FINANCE_SERVICE.js`. |
| `03_SHARED_PENDING_FEEDBACK.js` | UX: `PENDING_ACTION` during webhook execution. |
| `20_TASK_VALIDATION.js` | `TASK_VALID_TRANSITIONS`, `ensureTaskCanComplete`, etc. |
| `30_FINANCE_SERVICE.js` | `FIN_ALLOWED_TRANSITIONS`, `confirmTransaction` / `setFinanceStatus`. |
| `10_HOSO_VALIDATION.js` + `10_HOSO_CONSTANTS.js` | `HOSO_STATUS_TRANSITIONS`, `hosoValidateStatusTransition`. |
| `90_BOOTSTRAP_ON_EDIT.js` | Time trigger: `TASK_CODE` fill + “Task created” log — **parallel automation** outside webhook flow. |

### 2.2 AppSheet

| Location | Responsibility |
|----------|----------------|
| `04_APPSHEET/TASK_HINT_COLUMNS.md` | Virtual columns (`SWITCH`, `IF`, `IN`) for **UX hints** — must not be the only enforcement for compliance-critical rules. |
| Security filters / slices | Row visibility — policy, not workflow engine. |

### 2.3 Coupling

- `HOSO_RELATION_TABLE_TO_SHEET` (`10_HOSO_CONSTANTS.js`) ties HO_SO relations to concrete sheet keys.
- Two HTTP paths: AppSheet webhook vs `60_HOSO_API_GATEWAY.js` — same business concepts should eventually **emit the same event types** from both.

---

## 3. Classification by module

### TASK

- **UI:** AppSheet views, hint columns, `PENDING_ACTION` display.
- **Data:** `20_TASK_REPOSITORY.js`, logs, attachments.
- **Business (candidate to move to rules/core):** status transitions, checklist gate before DONE, progress sync rules.

### FINANCE

- **UI:** AppSheet operations guide, slices.
- **Data:** `FINANCE_TRANSACTION`, `FINANCE_LOG`, attachments.
- **Business:** `FIN_ALLOWED_TRANSITIONS`, confirm-only-from-NEW, draft edit rules.

### HO_SO

- **UI:** AppSheet + Lovable via gateway.
- **Data:** `10_HOSO_SERVICE.js`, logs, files.
- **Business:** `HOSO_STATUS_TRANSITIONS`, relation validation.

---

## 4. Target components (implemented / planned)

### 4.1 Event queue (`EVENT_QUEUE`)

| Column | Purpose |
|--------|---------|
| `ID` | Primary key (`EVT` prefix via `cbvMakeId`). |
| `EVENT_TYPE` | e.g. `FINANCE_STATUS_CHANGED`, `TASK_COMPLETED`. |
| `SOURCE_MODULE` | `FINANCE` \| `TASK` \| `HO_SO` \| … |
| `REF_ID` | Entity id in source module. |
| `ENTITY_TYPE` | Optional semantic type e.g. `FINANCE_TRANSACTION`. |
| `PAYLOAD_JSON` | JSON snapshot for rules (before/after, action name, etc.). |
| `STATUS` | `PENDING` → `DONE` / `FAILED`. |
| `CORRELATION_ID` | Trace across webhook + logs. |
| `ERROR_MESSAGE` | Processor or rule errors. |
| `CREATED_AT`, `CREATED_BY`, `PROCESSED_AT` | Audit. |

### 4.2 Rule definitions (`RULE_DEF`)

| Column | Purpose |
|--------|---------|
| `ID` | Row key. |
| `RULE_CODE` | Stable human code. |
| `PRIORITY` | Number; lower = earlier (convention TBD). |
| `ENABLED` | TRUE/FALSE. |
| `EVENT_TYPE` | Match `EVENT_QUEUE.EVENT_TYPE`. |
| `CONDITION_JSON` | Structured conditions (see §6). |
| `ACTIONS_JSON` | Array of actions (see §6). |
| `TARGET_MODULE` | Hint for routing / docs. |
| `NOTE`, `VERSION` | Docs and migration. |
| `CREATED_AT`, `UPDATED_AT` | Audit. |

### 4.3 GAS modules (`05_GAS_RUNTIME`)

| File | Role |
|------|------|
| `04_CORE_EVENT_TYPES.js` | Canonical `CBV_CORE_EVENT_TYPE_*` constants + `cbvCoreEventMode_()`. |
| `04_CORE_EVENT_QUEUE.js` | `createCoreEvent`, `cbvTryEmitCoreEvent_` (never throws). |
| `04_CORE_RULE_ENGINE.js` | Load rules, `evaluateCoreCondition_` (safe JSON DSL). |
| `04_CORE_EVENT_PROCESSOR.js` | `processCoreEvent`, `processCoreEventQueueBatch_`; stub `executeCoreAction_`. |

**Mode (Script Property `CBV_CORE_EVENT_MODE`):**

- `off` — no events appended.
- `shadow` (default) — append `EVENT_QUEUE` rows; processor runs **without** cross-module side effects until actions are implemented.
- `on` — full rule execution when action handlers are wired.

---

## 5. Event catalog (initial)

| EVENT_TYPE | When emitted (planned / done) |
|------------|-------------------------------|
| `FINANCE_STATUS_CHANGED` | After finance status transition + log (`30_FINANCE_SERVICE.js` — **wired in shadow**). |
| `TASK_STATUS_CHANGED` | Task workflow (future). |
| `HO_SO_STATUS_CHANGED` | HO_SO workflow (future). |
| `TASK_CHECKLIST_UPDATED` | `checklistDone` webhook (future). |

---

## 6. Rule JSON (DSL)

**Condition** (minimal interpreter in `04_CORE_RULE_ENGINE.js`):

```json
{
  "all": [
    { "field": "payload.newStatus", "op": "eq", "value": "CONFIRMED" }
  ]
}
```

**Actions** (extensible; stubs log only until handlers exist):

```json
[
  { "type": "SEND_ALERT", "params": { "message": "FIN_CONFIRMED" } },
  { "type": "UPDATE_STATUS", "params": { "entity": "TASK", "to": "IN_PROGRESS" } }
]
```

---

## 7. Migration phases

| Phase | Actions | Exit criteria |
|-------|---------|----------------|
| **P0** | Schema + core files + docs | `clasp push` clean; `ensureSchemas` / bootstrap creates new tabs. |
| **P1** | Shadow emission from FINANCE | Rows appear in `EVENT_QUEUE`; user-visible behavior unchanged. |
| **P2** | Add sample `RULE_DEF` rows; processor evaluates conditions | `processCoreEvent` marks `DONE`; actions remain stubs or logs. |
| **P3** | Move one real side effect into `executeCoreAction_` | Single automated test / manual checklist passes. |
| **P4** | TASK + HO_SO emit events; retire duplicate logic from validators | Transition tables reduced or generated from rules. |
| **P5** | Align `90_BOOTSTRAP_ON_EDIT.js` with events or explicit `TASK_SEEDED` rule | Single automation story documented. |

---

## 8. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Webhook timeout | Keep `cbvTryEmitCoreEvent_` O(1); heavy work in batch trigger. |
| Double processing | `STATUS` on `EVENT_QUEUE`; idempotent `processCoreEvent`. |
| Rule errors | `ERROR_MESSAGE` on row; never throw to AppSheet user from emitter. |
| Formula drift (AppSheet vs GAS) | Document: compliance gates in GAS/rules only. |

---

## 9. References (repo paths)

- Router: `05_GAS_RUNTIME/61_UNIFIED_ROUTER.js`, `99_APPSHEET_WEBHOOK.js`
- Registry: `05_GAS_RUNTIME/03_SHARED_ACTION_REGISTRY.js`
- Finance: `05_GAS_RUNTIME/30_FINANCE_SERVICE.js`
- Task validation: `05_GAS_RUNTIME/20_TASK_VALIDATION.js`
- HO_SO: `05_GAS_RUNTIME/10_HOSO_CONSTANTS.js`, `10_HOSO_VALIDATION.js`
- Schema source of truth: `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js`
- Clasp order: `.clasp.json`, `05_GAS_RUNTIME/CLASP_PUSH_ORDER.md`

---

## 10. RULE_DEF — dòng mẫu (copy / paste)

**File:** `00_OVERVIEW/RULE_DEF_SAMPLE_ROWS.tsv` — mở bằng VS Code / Notepad++, **chọn toàn bộ**, copy, vào Google Sheet tab `RULE_DEF` chọn ô **A1** (hoặc **A2** nếu hàng 1 đã là header trùng cột), **Paste**.

| RULE_CODE | EVENT_TYPE | Ý nghĩa |
|-----------|------------|---------|
| `FIN_ON_CONFIRM` | `FINANCE_STATUS_CHANGED` | `payload.newStatus = CONFIRMED` → `SEND_ALERT` (stub Logger) |
| `FIN_ON_CANCEL` | `FINANCE_STATUS_CHANGED` | `CANCELLED` |
| `FIN_ON_ARCHIVE` | `FINANCE_STATUS_CHANGED` | `ARCHIVED` |
| `FIN_ON_CREATE` | `FINANCE_CREATED` | `CONDITION_JSON` = `{"all":[]}` (luôn khớp) → alert tạo mới |

**Lưu ý:** `ENABLED` = `TRUE`; `PRIORITY` nhỏ hơn chạy trước. Sau khi dán, xử lý queue:

- **Menu:** `CBV PRO` → **Bootstrap & init** → **Process EVENT_QUEUE now (batch)** (chạy ngay tối đa 50 event).
- **Tự động:** cùng submenu → **Install EVENT_QUEUE trigger (every 5 min)** — cài time trigger gọi `coreEventQueueProcessMinutely` (batch 25 event/lần). **Remove EVENT_QUEUE trigger** để gỡ.

---

## 11. Changelog

| Date | Change |
|------|--------|
| 2026-04-19 | Initial audit, migration plan, `EVENT_QUEUE` / `RULE_DEF` schema, `04_CORE_*` GAS stubs, FINANCE shadow emit. |
| 2026-04-19 | `RULE_DEF_SAMPLE_ROWS.tsv` + §10 hướng dẫn dán. |

# Event-Driven Core — Audit & Migration Plan (CBV PRO)

**Status:** Active. **Tech stack:** Google Apps Script, Google Sheets, AppSheet (unchanged).

**Design narrative (target vs hybrid, REQUEST events, principles):** see [`CBV_EVENT_DRIVEN_ARCHITECTURE.md`](./CBV_EVENT_DRIVEN_ARCHITECTURE.md).

This document records the **repository audit**, the **target architecture** (MODULE → EVENT → CORE → RULE → ACTION), and the **phased rollout**. Implementation artifacts live in `05_GAS_RUNTIME/04_CORE_*.js` and sheets `EVENT_QUEUE`, `RULE_DEF`.

> **2026-04-21 — HO_SO closes the loop (Phase D).** RULE_DEF is now authoritative for HO_SO: 9 canonical rules seeded via `hosoSeedCoreRules_()`, handlers registered through `cbvRegisterCoreAction_` (`04_CORE_ACTION_REGISTRY.js`), and the processor dispatches via `INVOKE_SERVICE` (`04_CORE_EVENT_PROCESSOR.js`). Coverage audit `auditHosoRuleDefCoverage_()` fails the smoke test if any HO_SO event lacks an enabled rule or references an unregistered handler. This satisfies **W2** for HO_SO (non-STUB core action path exists + tested) and **P7** (second non-`SEND_ALERT` side-effect: `HOSO_RECHECK_COMPLETENESS` runs on file add/remove). FINANCE and TASK still follow the pre-Phase-D stub path pending their own rule wiring.

## Next steps (ưu tiên vận hành & code)

1. **Deploy & triggers** — `clasp push`; menu CBV PRO → **Bootstrap & init** → **Install ALL CBV triggers** (hoặc từng nhóm); đảm bảo `CBV_CORE_EVENT_MODE` ≠ `off` nếu cần ghi `EVENT_QUEUE`.
2. **Kiểm chứng queue** — Một luồng thật: webhook / thao tác → **EVENT_QUEUE** → **Process EVENT_QUEUE now** → `RULE_DEF` / `ADMIN_AUDIT_LOG`. Gửi kèm `correlationId` hoặc `requestId` trên POST để điền **CORRELATION_ID**.
3. **Test TASK** — Chạy `runTaskTests()` trong GAS (`99_DEBUG_TASK_TEST.js`, cần **DON_VI** ACTIVE + user). Đối chiếu kết quả `ok` / `details`.
4. **P6 tối thiểu** — Rà dòng `RULE_DEF` `ENABLED=TRUE` trên sheet production.
5. **REQUEST events** — Thiết kế payload + thứ tự (xem [`CBV_EVENT_DRIVEN_ARCHITECTURE.md`](./CBV_EVENT_DRIVEN_ARCHITECTURE.md)); chưa bật `UPDATE_STATUS` trong `executeCoreAction_` cho đến khi có idempotency + test.
6. **W1 / P9** — Sau pilot: quy ước một nguồn transition hoặc overlay; retry / quan sát `FAILED`.

---

## 1. Executive summary

| Item | Finding |
|------|---------|
| **Current pattern** | Webhook `doPost` → `_routeWebhookAction` → `registerAction` handlers (`03_SHARED_ACTION_REGISTRY.js`) + small `switch` for `checklistDone` / `addLog`. Business rules live in module services as **hard-coded transition maps** and validators. |
| **Goal** | Centralize **decisions** in a core engine; modules keep **UI + persistence adapters**; rules become **data** (Sheet JSON rows) where possible. |
| **First deliverable** | `EVENT_QUEUE` + `RULE_DEF` in schema; `createCoreEvent` / `processCoreEvent` in GAS; optional **shadow** emission from FINANCE status changes. |
| **Maturity (thực tế)** | **Pilot / repo đang xây:** luồng module + emit + xử lý queue **chạy được**; core **không** điều phối mutation — `executeCoreAction_` chỉ **`SEND_ALERT`** đầy đủ; transition vẫn trong validator. Chi tiết §10.6. |

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
| `90_BOOTSTRAP_ON_EDIT.js` | Time trigger ~1 phút: `_fillBlankTaskCodes` + `cbvTaskStatusSnapshotSyncFromSheet_` (`20_TASK_STATUS_SNAPSHOT.js`) — đồng bộ **TASK_STATUS_CHANGED** khi đổi STATUS trên sheet/AppSheet ngoài GAS (`payload.note`: `sheet_sync`). |
| `20_TASK_STATUS_SNAPSHOT.js` | Snapshot STATUS trong Properties; tránh emit trùng khi GAS vừa đổi trạng thái (`cbvTaskStatusSnapshotSet_` từ `20_TASK_SERVICE.js`). |
| `90_BOOTSTRAP_TRIGGERS_ALL.js` | Menu: cài / gỡ / cài lại **tất cả** trigger CBV (bootstrap + task sync + EVENT_QUEUE). |
| `99_APPSHEET_WEBHOOK.js` | Gồm `deleteAttachment` → `removeTaskAttachment` (`20_TASK_SERVICE.js`) — soft-delete `TASK_ATTACHMENT`. |

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
| `04_CORE_EVENT_PROCESSOR.js` | `processCoreEvent`, `processCoreEventQueueBatch_`; `executeCoreAction_` — **`SEND_ALERT`** → `logAdminAudit` (`ADMIN_AUDIT_LOG`); **`NOOP`** / **`NONE`** no-op; `CREATE_*` / `UPDATE_STATUS` still stubs. |
| `04_CORE_EVENT_QUEUE.js` | `createCoreEvent`, `cbvTryEmitCoreEvent_`; request-scoped **`CORRELATION_ID`** từ `correlationId` / `requestId` / `traceId` (webhook/gateway). |

**Mode (Script Property `CBV_CORE_EVENT_MODE`)** — trong `04_CORE_EVENT_QUEUE.js` chỉ có nhánh **`off`** là **không** ghi `EVENT_QUEUE`; `shadow` và `on` **đều append** bản ghi (hành vi persist giống nhau cho đến nay). **`SEND_ALERT`** qua `processCoreEvent` vẫn ghi **`ADMIN_AUDIT_LOG`** (actor `cbvSystemActor()`). Tên `shadow` gợi ý “thử nghiệm” nhưng **không** tắt ghi queue trong code hiện tại.

---

## 5. Event catalog (initial)

| EVENT_TYPE | When emitted |
|------------|----------------|
| `FINANCE_CREATED` | After `createTransaction` (`30_FINANCE_SERVICE.js`). |
| `FINANCE_STATUS_CHANGED` | After `setFinanceStatus` + `logFinance`. |
| `TASK_CREATED` | After `createTask` (`20_TASK_SERVICE.js`). **AppSheet thêm dòng TASK_MAIN** (không gọi GAS): emit khi `taskSyncMinutely` → `_fillBlankTaskCodes` ghi log *Task created* (cần **TASK_CODE** ban đầu trống để trigger chạy). |
| `TASK_STATUS_CHANGED` | After `setTaskStatus`, `assignTask` (when status changes), `taskStartAction`, `taskReopenAction`. |
| `TASK_CHECKLIST_UPDATED` | After `markChecklistDone` (includes AppSheet `checklistDone` webhook). |
| `TASK_LOG_ADDED` | After `addTaskUpdateLog` / `addLog` webhook. |
| `HO_SO_CREATED` | After `createHoSo` (`10_HOSO_SERVICE.js`). |
| `HO_SO_STATUS_CHANGED` | After `changeHosoStatus`. |

**Ghi chú §5 — lỗ hổng / tùy chọn:** `updateDraftTransaction` (FINANCE), cập nhật field `updateHoso` (không đổi STATUS), `addTaskAttachment` / `removeTaskAttachment` **chưa** emit vào core catalog (có thể bổ sung W3). Attachment remove đã có qua service + webhook.

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

**Actions:**

- **`SEND_ALERT`** — implemented: appends **`ADMIN_AUDIT_LOG`** via `logAdminAudit` (`AUDIT_TYPE`: `CORE_RULE`, `ACTOR_ID`: `cbvSystemActor()`).
- **`NOOP`** / **`NONE`** — implemented: no side effect (dùng để test rule hoặc placeholder).
- **`CREATE_TASK` / `CREATE_FINANCE` / `UPDATE_STATUS`** — still stubs (Logger) until wired.

```json
[
  { "type": "SEND_ALERT", "params": { "message": "FIN_CONFIRMED" } },
  { "type": "NOOP", "params": {} },
  { "type": "UPDATE_STATUS", "params": { "entity": "TASK", "to": "IN_PROGRESS" } }
]
```

**Correlation (W4 — request scope):** JSON POST tới Web App có thể gửi **`correlationId`** hoặc **`requestId`** hoặc **`traceId`** (top-level). `createCoreEvent` (`04_CORE_EVENT_QUEUE.js`) ghi vào **`EVENT_QUEUE.CORRELATION_ID`** nếu `cbvTryEmitCoreEvent_` không truyền `correlationId` trực tiếp. Được set trong `_webhookDoPost_` (`99_APPSHEET_WEBHOOK.js`) và `_gatewayDoPost_` (`60_HOSO_API_GATEWAY.js`).

---

## 7. Migration phases

| Phase | Actions | Exit criteria |
|-------|---------|----------------|
| **P0** | Schema + core files + docs | `clasp push` clean; `ensureSchemas` / bootstrap creates new tabs. |
| **P1** | Shadow emission from FINANCE | Rows appear in `EVENT_QUEUE`; user-visible behavior unchanged. |
| **P2** | Add sample `RULE_DEF` rows; processor evaluates conditions | `processCoreEvent` marks `DONE`; actions remain stubs or logs. |
| **P3** | Move one real side effect into `executeCoreAction_` | Single automated test / manual checklist passes. |
| **P4** | TASK + HO_SO emit events; retire duplicate logic from validators | **Emit:** `20_TASK_SERVICE`, `10_HOSO_SERVICE`. Validators unchanged until rules replace transition tables. |
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

## 10. Master refactor roadmap — “toàn bộ” hướng event-driven

Mục tiêu: từ **module-driven + queue phụ** → **chuỗi rõ ràng**: *intent (UI/API) → validation tập trung → ghi dữ liệu → emit `EVENT_QUEUE` → `processCoreEvent` áp `RULE_DEF` → side-effect có kiểm soát*. Các phase **P0–P5** (§7) là nền; mục này là **lớp trên**.

### 10.1 Nguyên tắc (không đổi stack)

| # | Nguyên tắc | Chi tiết thực tế |
|---|------------|-------------------|
| G1 | **Modules không “mất quyền” đột ngột** | `20_TASK_SERVICE.js`, `30_FINANCE_SERVICE.js`, `10_HOSO_SERVICE.js` vẫn **ghi sheet** và **enforce transition** cho đến khi rule engine được chứng minh tương đương. |
| G2 | **Không double-write side-effect** | Trước khi `executeCoreAction_` (`04_CORE_EVENT_PROCESSOR.js`) gọi lại service, cần **idempotency** (`EVENT_QUEUE.STATUS`, correlation, hoặc giai đoạn đầu **chỉ alert** qua rule). |
| G3 | **Hai đường HTTP một sự kiện** | `99_APPSHEET_WEBHOOK.js` và `60_HOSO_API_GATEWAY.js` cùng hành vi nghiệp vụ → cùng **EVENT_TYPE** (§2.3). |
| G4 | **Sheet/AppSheet ngoài webhook** | `90_BOOTSTRAP_ON_EDIT.js` + `20_TASK_STATUS_SNAPSHOT.js` là bổ sung; ghi rõ độ trễ (~phút). |

### 10.2 Workstream (song song)

| ID | Workstream | Việc chính | Done khi |
|----|------------|------------|----------|
| **W1** | **Single source — transitions** | Gom `TASK_VALID_TRANSITIONS` (`20_TASK_VALIDATION.js`), `FIN_ALLOWED_TRANSITIONS` (`30_FINANCE_SERVICE.js`), `HOSO_STATUS_TRANSITIONS` (`10_HOSO_CONSTANTS.js`) vào **một manifest** (sheet hoặc JSON + generator) **hoặc** quy ước: **validator = source**, `RULE_DEF` chỉ **overlay** (alert) — chốt một chiến lược. | Không còn hai nguồn transition mâu thuẫn không kiểm soát. |
| **W2** | **Core actions thật** | Mở rộng `executeCoreAction_`: bắt đầu từ hành vi **an toàn** (param cố định, một entity). | Ít nhất **một** action không còn `STUB` + kiểm thử. |
| **W3** | **Event catalog đầy đủ** | Bổ sung type + emit: draft finance, attachment add/remove, HO_SO field update — `04_CORE_EVENT_TYPES.js` + service tương ứng. | §5 được cập nhật; lỗ hổng đã chốt được đóng. |
| **W4** | **Correlation & audit** | `CORRELATION_ID` trên `EVENT_QUEUE`; webhook/API truyền id trace; log nối được. | Một luồng E2E truy vết AppSheet → queue → rule. |
| **W5** | **Router & registry** | `61_UNIFIED_ROUTER.js` + `registerAction` (`99_APPSHEET_WEBHOOK.js`, `30_FINANCE_SERVICE.js`): action public = handler tồn tại (`WEBHOOK_ACTIONS_` khớp). | Review định kỳ. |
| **W6** | **Vận hành** | `90_BOOTSTRAP_TRIGGERS_ALL.js`, `04_CORE_EVENT_TRIGGERS.js`, `90_BOOTSTRAP_ON_EDIT.js`; `CBV_CORE_EVENT_MODE`; runbook queue **FAILED**/kẹt. | Checklist ops một trang. |

### 10.3 Phase bổ sung (sau P5)

| Phase | Mục tiêu | Việc cụ thể | Tiêu chí thoát |
|-------|----------|-------------|----------------|
| **P6** | Chuẩn hóa **RULE_DEF** | Audit dòng rule + mẫu `00_OVERVIEW/RULE_DEF_SAMPLE_ROWS*.tsv` khớp `evaluateCoreCondition_` (`04_CORE_RULE_ENGINE.js`). | Rule không mâu thuẫn validator; doc vai trò rule. |
| **P7** | Side-effect **thứ hai** từ core | Ví dụ mở rộng `SEND_ALERT` hoặc một `UPDATE_STATUS` an toàn trong `executeCoreAction_`. | Nhánh non-stub thứ 2 có test. |
| **P8** | (Tuỳ chọn) Tách command / event | API nội bộ mỏng: validate + persist; emit tách — refactor **từng** module. | Một module có “thin command”. |
| **P9** | Hardening | Retry **FAILED**; dead-letter hoặc log; giới hạn batch `processCoreEventQueueBatch_`. | Lỗi partial không im lặng. |

### 10.4 Definition of Done — refactor trọng tâm

1. Luồng chính (webhook + gateway + sheet-sync) **emit** đúng catalog hoặc **miễn trừ có lý do** trong doc.  
2. Automation có rủi ro đi qua **`processCoreEvent`** + `RULE_DEF`; không nhân đôi cùng side-effect (trừ cờ chuyển tiếp).  
3. Transition: **một** nguồn hoặc quy ước overlay đã ký duyệt.  
4. Trigger + mode + runbook; không phụ thuộc chạy tay từng `processCoreEvent`.

### 10.5 Lộ trình đề xuất (lăn 3–6 tháng)

| Giai đoạn | Việc |
|-----------|------|
| **Tháng 1** | P6 + W5; cập nhật §5 (W3 một phần). |
| **Tháng 2** | W1 chiến lược + P7 (một action core thật). |
| **Tháng 3–4** | W3 + W4 + P9. |
| **Song song** | W6; cập nhật `02_MODULES/*/APPSHEET_*.md` khớp payload. |

### 10.6 Trạng thái thực tế (đánh giá ngắn)

| Khía cạnh | Trạng thái |
|-----------|------------|
| **Luồng chính** | Webhook + `registerAction` + service ghi sheet; **emit** từ TASK / FINANCE / HO_SO và sync TASK (sheet) — **ổn cho pilot**. |
| **Core / RULE_DEF** | `processCoreEvent` + `evaluateCoreCondition_` hoạt động; **side-effect nghiệp vụ** trong `executeCoreAction_` ngoài **`SEND_ALERT`** vẫn **stub** — **chưa** coi là “core điều phối”. |
| **Transition** | Vẫn **một lớp trong module** (`TASK_VALID_TRANSITIONS`, `FIN_ALLOWED_TRANSITIONS`, `HOSO_STATUS_TRANSITIONS`); RULE_DEF có thể **lặp** điều kiện cho alert — cần quy ước (W1). |
| **Vận hành** | Cần trigger (task 1 phút + EVENT_QUEUE 5 phút hoặc **Install ALL CBV triggers**); `CBV_CORE_EVENT_MODE` ≠ `off` nếu muốn có queue. |

### 10.7 Kế hoạch tiếp theo (ưu tiên đề xuất)

1. **Vận hành & kiểm chứng** — Bật đủ trigger; một vòng thật: webhook → `EVENT_QUEUE` → `DONE` / `ADMIN_AUDIT_LOG`; runbook ngắn khi `FAILED` / queue đầy.  
2. **P7 thu nhỏ** — Mở rộng `executeCoreAction_` theo hướng **an toàn** (ưu tiên **`SEND_ALERT`** / không đổi trạng thái nghiệp vụ) **trước** khi bật `UPDATE_STATUS`/`CREATE_*` thật. **Đã có:** type **`NOOP`** (không side effect).  
3. **P6 có phạm vi** — Audit các dòng `RULE_DEF` `ENABLED=TRUE` khớp payload; tránh rule thử nghiệm trên production.  
4. **W3 / W4** — W3: bổ sung event tùy nhu cầu. **W4 (correlation):** **Đã có** — body `correlationId` / `requestId` / `traceId` → cột `EVENT_QUEUE.CORRELATION_ID` khi emit trong cùng request (webhook / gateway).  
5. **Sau pilot ổn định** — **W1** (một nguồn transition hoặc quy ước overlay) rồi **P9** (retry / `FAILED` / quan sát).

**Repo đang xây:** ưu tiên **vertical slice theo module** (TASK → FINANCE → HO_SO) ổn + emit + vài rule **`SEND_ALERT`** trước khi refactor transition toàn hệ.

### 10.8 Sprint ngắn (3–5 ngày) — thứ tự tùy chọn

Có thể gom thành một spike nếu **mỗi mục là MVP** (không thay thế lộ trình 3–6 tháng đầy đủ):

`P7 → W3 → W4 → P6 → W5 → W6` → **dừng, test thực tế** → `W1 → P9`

**Điều kiện an toàn:**

- **P7 trước P6** chỉ chấp nhận được nếu P7 **không** mở side-effect nguy hiểm hoặc đã rà rule liên quan; nếu không, làm **P6 tối thiểu** (vài rule) trước P7 “đụng dữ liệu”.  
- **W3** trong sprint ngắn = **ít event**, không phải toàn bộ §5.  
- **W1** / **P9** để **sau** vòng test thực tế — đúng vì thay domain nặng và hardening.

---

## 11. RULE_DEF — dòng mẫu (copy / paste)

**File:** `00_OVERVIEW/RULE_DEF_SAMPLE_ROWS.tsv` — mở bằng VS Code / Notepad++, **chọn toàn bộ**, copy, vào Google Sheet tab `RULE_DEF` chọn ô **A1** (hoặc **A2** nếu hàng 1 đã là header trùng cột), **Paste**.

| RULE_CODE | EVENT_TYPE | Ý nghĩa |
|-----------|------------|---------|
| `FIN_ON_CONFIRM` | `FINANCE_STATUS_CHANGED` | `payload.newStatus = CONFIRMED` → `SEND_ALERT` → `ADMIN_AUDIT_LOG` |
| `FIN_ON_CANCEL` | `FINANCE_STATUS_CHANGED` | `CANCELLED` |
| `FIN_ON_ARCHIVE` | `FINANCE_STATUS_CHANGED` | `ARCHIVED` |
| `FIN_ON_CREATE` | `FINANCE_CREATED` | `CONDITION_JSON` = `{"all":[]}` (luôn khớp) → alert tạo mới |

**TASK / HO_SO (mẫu thêm):** `00_OVERVIEW/RULE_DEF_SAMPLE_ROWS_TASK_HOSO.tsv` — dán cùng cách vào `RULE_DEF` (có thể thêm dưới các dòng FINANCE).

**Lưu ý:** `ENABLED` = `TRUE`; `PRIORITY` nhỏ hơn chạy trước. Sau khi dán, xử lý queue:

- **Menu:** `CBV PRO` → **Bootstrap & init** → **Process EVENT_QUEUE now (batch)** (chạy ngay tối đa 50 event).
- **Tự động:** cùng submenu → **Install EVENT_QUEUE trigger (every 5 min)** — cài time trigger gọi `coreEventQueueProcessMinutely` (batch 25 event/lần). **Remove EVENT_QUEUE trigger** để gỡ.

---

## 12. Changelog

| Date | Change |
|------|--------|
| 2026-04-19 | Initial audit, migration plan, `EVENT_QUEUE` / `RULE_DEF` schema, `04_CORE_*` GAS stubs, FINANCE shadow emit. |
| 2026-04-19 | `RULE_DEF_SAMPLE_ROWS.tsv` + §11 hướng dẫn dán. |
| 2026-04-19 | TASK/HO_SO emit; `SEND_ALERT` → `ADMIN_AUDIT_LOG`; `RULE_DEF_SAMPLE_ROWS_TASK_HOSO.tsv`. |
| 2026-04-19 | §10 Master refactor roadmap (W1–W6, P6–P9, DoD, lộ trình); đánh số lại §11 RULE_DEF mẫu, §12 Changelog. |
| 2026-04-19 | Cập nhật: maturity exec summary; §2.1 snapshot/triggers/deleteAttachment; §5 gaps + `TASK_STATUS` sheet_sync; làm rõ `CBV_CORE_EVENT_MODE` (`off` vs shadow/on); §10.6–10.8 trạng thái thực tế, kế hoạch tiếp theo, sprint ngắn. |
| 2026-04-19 | Code: `CORRELATION_ID` từ request (`correlationId` / `requestId` / `traceId`) trong `04_CORE_EVENT_QUEUE.js` + `_webhookDoPost_` + `_gatewayDoPost_`; `NOOP`/`NONE` trong `executeCoreAction_`. §6 + §10.7 cập nhật. |
| 2026-04-19 | Thêm `CBV_EVENT_DRIVEN_ARCHITECTURE.md` (thiết kế tổng quan, REQUEST events, hybrid vs target); link từ đầu file này. |
| 2026-04-19 | Mục **Next steps** (đầu file); `99_DEBUG_TASK_TEST.js` chuyển HTX_ID → **DON_VI_ID**; `CBV_EVENT_DRIVEN_ARCHITECTURE` thêm Next steps tóm tắt. |

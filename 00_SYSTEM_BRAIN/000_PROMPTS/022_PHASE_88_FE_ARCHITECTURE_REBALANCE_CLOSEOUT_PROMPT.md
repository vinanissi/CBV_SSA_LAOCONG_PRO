# PHASE 88 — FE ARCHITECTURE REBALANCE CLOSEOUT — PROMPT

## Metadata

- **Repo**: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`
- **Branch**: `phase/from-v2.4.1-TASK-FIN`
- **Standards**: CBV Operational Ecosystem Standard V1; CBV Test Console Standard V1 (`CBV_TCS_V1`)
- **Status intent**: Architecture readiness **GO**; Pilot readiness **GO**; Production readiness **NOT YET**

---

## FINAL ARCHITECTURE DECISION (chốt)

Chốt kiến trúc FE vận hành:

- **Sheets/GAS = operational database + runtime**
- **WebApp = operational workspace**
- **AppSheet = lightweight operator shell**

Meaning:

- Sheets/GAS giữ **dữ liệu**, **runtime**, **audit**, **test**, **report**, **orchestration**.
- WebApp là FE chính cho **workspace vận hành** (WebApp-led).
- AppSheet chỉ là **shell nhẹ**: thao tác nhanh, mobile CRUD, fallback, field operation.
- Không AppSheet-centric.
- Không WebApp-only cực đoan.
- Hybrid nhưng **WebApp-led**.

---

## Mission

Ghi nhận quyết định kiến trúc này vào repo, docs, decision log, handoff và test console.

**Phase này không build runtime lớn mới.**  
**Phase này là architecture closeout + readiness gate cho hướng WebApp-led.**

---

## Core rules (không vi phạm)

- Runtime-first
- Memory-first
- Append-only
- Manual-first → Auto-later
- Audit-first
- Human-in-the-loop
- No destructive migration
- **No AppSheet Bot**
- **No auto assign / auto resolve / auto escalate**
- No ENV-A
- No AI runtime
- No queue intelligence
- **No production claim**

---

## Files to create

Docs:

1. `docs/architecture/PHASE_88_FE_ARCHITECTURE_REBALANCE_CLOSEOUT.md`
2. `docs/architecture/WEBAPP_LED_OPERATIONAL_WORKSPACE.md`
3. `docs/architecture/APPSHEET_LIGHTWEIGHT_OPERATOR_SHELL.md`
4. `docs/architecture/SHEETS_GAS_OPERATIONAL_DATABASE_RUNTIME.md`
5. `docs/architecture/FE_OWNERSHIP_MATRIX.md`

Decision:

6. `00_SYSTEM_BRAIN/002_DECISIONS/022_FE_ARCHITECTURE_REBALANCE_DECISION.md`

Brain artifacts:

7. `00_SYSTEM_BRAIN/000_REPORTS/022_PHASE_88_FE_ARCHITECTURE_REBALANCE_CLOSEOUT_REPORT.md`
8. `00_SYSTEM_BRAIN/001_HANDOFF/022_PHASE_88_FE_ARCHITECTURE_REBALANCE_CLOSEOUT_HANDOFF.md`

Runtime/test:

9. `05_GAS_RUNTIME/90_FE_ARCHITECTURE_REBALANCE_TEST_CONSOLE.js`

Update if appropriate:

- `.clasp.json` push order: add `90_FE_ARCHITECTURE_REBALANCE_TEST_CONSOLE.js` near other test console files, before menu/bootstrap files if needed.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js`: add submenu under **🧪 CBV Test Console** only.
- `05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js`: add wrappers.
- `05_GAS_RUNTIME/CLASP_PUSH_ORDER.md`.
- `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md`: add link to Phase 88 architecture decision.

Do not put this in business menus.

---

## Architecture content requirements (must state)

### Final FE split

- Sheets/GAS = operational database + runtime
- WebApp = operational workspace
- AppSheet = lightweight operator shell

### WebApp owns (primary)

- Home Workspace
- Dashboard
- Timeline
- Kanban
- SLA Monitor
- Escalation Center
- Runtime Health
- Test Console
- Report / Handoff Viewer
- Admin Workspace
- AI Review Center later
- Advanced search/filter
- Multi-panel workspace

### AppSheet owns (primary)

- Mobile quick CRUD
- Quick queue actions
- Field operation forms
- Simple upload/capture
- Lightweight My Queue
- Fallback operator path
- **No Bot**
- **No uncontrolled automation**

### Sheets/GAS owns

- operational database
- business runtime
- audit log
- append-only report
- test console standard
- runtime health
- data contract
- WebApp API
- AppSheet binding metadata

### Decision rationale

- WebApp gives code ownership and UI control.
- AppSheet gives speed/stability for simple mobile operations.
- Sheets/GAS remains the trusted operational runtime.
- This reduces AppSheet lock-in while keeping its practical benefits.

### Risks

- WebApp FE debt increases.
- More responsibility for routing, UI state, loading, permissions, responsiveness.
- Need WebApp route registry and FE test standard before large buildout.
- AppSheet remains useful but must not become the hidden main system.

### Rules (repeat)

- No AppSheet Bot.
- No auto assignment.
- No auto resolve.
- No auto escalation.
- No destructive migration.
- No production claim.
- Manual-first pilot remains required.

---

## FE ownership matrix (minimum rows)

- HOME / Today Workspace → WebApp primary
- My Queue → Both, AppSheet lightweight, WebApp advanced
- Unassigned Queue → AppSheet primary initially, WebApp optional
- Escalated Queue → Both
- Blocked Queue → Both
- SLA Dashboard → WebApp primary
- Timeline → WebApp only
- Kanban → WebApp only
- Runtime Health → WebApp only
- Test Console → WebApp/GAS dialog only
- Report Viewer → WebApp only
- Admin Reference Viewer → WebApp only
- Quick Mobile Form → AppSheet only
- Upload / Capture → AppSheet primary
- AI Review → WebApp later

---

## Local tests

- `git status --short`
- `node --check 05_GAS_RUNTIME/90_FE_ARCHITECTURE_REBALANCE_TEST_CONSOLE.js`
- `node -e "JSON.parse(require('fs').readFileSync('06_DATABASE/schema_manifest.json','utf8')); console.log('schema_manifest.json OK')"`

Search prohibitions (allowed only as warning/prohibition):

- AppSheet Bot
- auto assign
- auto resolve
- auto escalate
- production ready


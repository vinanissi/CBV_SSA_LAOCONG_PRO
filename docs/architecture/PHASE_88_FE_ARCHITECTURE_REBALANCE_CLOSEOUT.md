# PHASE 88 — FE Architecture Rebalance Closeout

## Final architecture (chốt)

**Sheets/GAS = operational database + runtime**  
**WebApp = operational workspace**  
**AppSheet = lightweight operator shell**

This is a **hybrid** approach, but **WebApp-led** (không AppSheet-centric, không WebApp-only cực đoan).

---

## Scope (phase 88)

- **Docs + decision closeout** cho hướng FE vận hành WebApp-led.
- **Readiness gate**: kiểm tra repo có đủ decision + ownership matrix + rules + test console.
- **No big new runtime** trong phase này.

---

## Ownership summary

### WebApp owns (primary)

- Home Workspace / Today Workspace
- Dashboard
- Timeline
- Kanban
- SLA Monitor
- Escalation Center
- Runtime Health
- Test Console (hub UI; hiện tại vẫn có Sheets menu để QA)
- Report / Handoff Viewer
- Admin Workspace
- Advanced search/filter
- Multi-panel workspace
- AI Review Center (**later**, not in this phase)

### AppSheet owns (primary)

- Mobile quick CRUD
- Quick queue actions
- Field operation forms
- Simple upload/capture
- Lightweight “My Queue”
- Fallback operator path

Constraints:

- **No AppSheet Bot**
- **No uncontrolled automation**

### Sheets/GAS owns (source of truth)

- Operational database (Sheets)
- Business runtime + orchestration (GAS)
- Audit log
- Append-only report/handoff artifacts
- Test Console standard (`CBV_TCS_V1`)
- Runtime health
- Data contract (UI contract + schema manifest)
- WebApp API surface (read-first, manual writes only)
- AppSheet binding metadata (matrices/hints)

---

## Rationale

- WebApp provides **code ownership + UI control** for advanced operational workspace.
- AppSheet provides **speed/stability** for simple mobile and field operations.
- Sheets/GAS remains the **trusted operational runtime**.
- Reduces AppSheet lock-in while keeping practical benefits.

---

## Risks (explicit)

- WebApp FE debt increases.
- WebApp must own routing/UI state/loading/permissions/responsiveness.
- Need **WebApp route registry** and **FE test standard** before large buildout.
- AppSheet must not become the hidden “main system”.

---

## Rules (must not violate)

- Runtime-first
- Memory-first
- Append-only
- Manual-first → Auto-later
- Audit-first
- Human-in-the-loop
- No destructive migration
- **No AppSheet Bot**
- **No auto assign / auto resolve / auto escalate**
- **No auto resolve**
- **No auto escalate**
- No ENV-A
- No AI runtime
- No queue intelligence
- **No production claim**

---

## Pointers

- `docs/architecture/WEBAPP_LED_OPERATIONAL_WORKSPACE.md`
- `docs/architecture/APPSHEET_LIGHTWEIGHT_OPERATOR_SHELL.md`
- `docs/architecture/SHEETS_GAS_OPERATIONAL_DATABASE_RUNTIME.md`
- `docs/architecture/FE_OWNERSHIP_MATRIX.md`
- Decision log: `00_SYSTEM_BRAIN/002_DECISIONS/022_FE_ARCHITECTURE_REBALANCE_DECISION.md`


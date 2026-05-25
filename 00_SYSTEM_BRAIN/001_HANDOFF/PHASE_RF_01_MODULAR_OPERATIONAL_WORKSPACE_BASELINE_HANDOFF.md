# Handoff — PHASE_RF_01 Modular Operational Workspace Baseline

## Summary

Phase RF_01 delivered a **documentation-first refactor baseline** in `docs/refactor/` (8 files) plus append-only prompt, report, and this handoff. No runtime, schema, or AppSheet changes were made on branch `phase/from-v2.4.1-TASK-FIN-runtime-freeze`.

The baseline maps today's production reality (Sheet + GAS + AppSheet + GAS-served WebApp) to the target **CBV Modular Operational Workspace** (Worker bridge + Workboard FE + module plugins) without rewriting the operational database or abandoning AppSheet.

---

## Architecture decisions

| Decision | Rationale |
|----------|-----------|
| **Google Sheet remains Operational Database** | Data in production; append-only discipline |
| **AppSheet remains Mobile Runtime** | Staff use daily; refactor standardizes permission/naming only |
| **GAS remains Automation Runtime** | Existing services (TASK, HO_SO, Finance, WebApp renderer) — wrap, don't rewrite |
| **Cloudflare Worker = future API bridge** | FE must not call Sheet/AppSheet directly at steady state; transitional GAS doGet OK for Mốc 1 |
| **Module plugins = logical boundary** | TASK / FINANCE / HO_SO plugins document contracts; physical plugin runtime is Mốc 4 |
| **6 roles are target** | Current ADMIN/OPERATOR/VIEWER preserved until migration phase |
| **Search = simple projection first** | No dedicated search engine in early milestones |

Key docs: `docs/refactor/TARGET_ARCHITECTURE.md`, `MODULE_MAPPING.md`, `PERMISSION_MATRIX.md`.

---

## Next phase

**Recommended:** `PHASE_RF_02_WORKBOARD_CORE_IMPLEMENTATION`

**Mốc 1 scope (from ROADMAP):**

- Login / session
- Permission runtime v1 (FE + GAS assert)
- Task list + detail (extend M06 workboard)
- Timeline read
- Operational search v1 (GAS stub)
- Notification center read
- File upload / preview (basic)

Each deliverable: deployable, pilot-usable, CBV_TCS test + report + handoff.

---

## Do NOT do list

- Rewrite GAS services or replace Sheet
- Remove or deprecate AppSheet
- Change production TASK_MAIN schema (SHARED_WITH, IS_PRIVATE baseline)
- Deploy Cloudflare Worker as full microservice platform in RF_02
- Add NocoDB, Plane, or Outline in RF_02
- Auto-migrate roles on ENUM_DICTIONARY without migration plan
- Auto assign / auto resolve / AppSheet Bot
- Delete or overwrite old prompts/reports/handoffs
- Claim production-ready without Drive TCS evidence

---

## Open questions

1. **Worker hosting timeline** — Mốc 1 optional stub vs Mốc 2 required gateway?
2. **Role migration** — Dual-read ADMIN/OPERATOR/VIEWER + new roles, or big-bang AppSheet account update?
3. **FINANCE workboard priority** — Same sprint as TASK search or defer to RF_03 (Mốc 2)?
4. **Session auth** — GAS Session.getActiveUser() sufficient for Mốc 1 pilot, or OAuth via Worker early?
5. **HO_SO search fields** — Confirm canonical phone column name across seed vs prod Sheet?

---

## Recommended Cursor prompt for next phase

```markdown
PROMPT — PHASE_RF_02_WORKBOARD_CORE_IMPLEMENTATION

Branch: phase/from-v2.4.1-TASK-FIN-runtime-freeze
Read first:
- docs/refactor/ROADMAP.md (Mốc 1)
- docs/refactor/PERMISSION_MATRIX.md
- docs/refactor/SEARCH_ARCHITECTURE.md
- docs/refactor/WORKBOARD_UI_PLAN.md
- 05_GAS_RUNTIME/998Y_WEBAPP_STAFF_WORKBOARD_PRODUCTION.js (baseline)

Mission: Implement Mốc 1 Workboard Core incrementally:
1. Permission v1 — FE action hide + GAS assertRoleAllowed alignment (no ENUM prod change yet)
2. Harden staff workboard task list/detail
3. Timeline read projection on task detail
4. GAS searchOperational(q) stub — task ID, hồ sơ mã, tên
5. Notification read bind HOME_ALERT
6. Basic file upload/preview hook

Rules: production-safe, append-only reports, CBV_TCS_V1 test console, no schema destructive change, no AppSheet removal, human-in-loop.

Deliver: code + PHASE_RF_02 report + handoff + test menu item.
```

---

## References

| Path | Content |
|------|---------|
| `docs/refactor/` | Full baseline pack |
| `docs/architecture/WEBAPP_LED_OPERATIONAL_WORKSPACE.md` | Prior FE decision |
| `docs/architecture/SHEETS_GAS_OPERATIONAL_DATABASE_RUNTIME.md` | Prior runtime decision |
| `00_SYSTEM_BRAIN/000_REPORTS/PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE_REPORT.md` | Phase report |

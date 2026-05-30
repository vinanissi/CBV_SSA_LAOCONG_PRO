# PHASE_RF_01 — MODULAR OPERATIONAL WORKSPACE BASELINE — PROMPT

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

## Metadata

- **Phase name:** PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE
- **Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`
- **Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`
- **Repo baseline:** LAOCONG_PRO_V2.4.1
- **Standard:** CBV Operational Ecosystem Standard V1
- **Test standard:** CBV_TCS_V1
- **Scope:** Documentation-first baseline only — no large runtime code

---

## Agent role

Cursor Agent acting as:

- CBV Operational Runtime Architect
- Incremental Refactor Lead

---

## Context

Branch này là **runtime-freeze branch**.

**Mục tiêu:** Ổn định runtime đang dùng thật và chuẩn bị refactor theo hướng mới.

**KHÔNG:**

- rewrite toàn hệ
- thay DB
- thay AppSheet
- microservice hóa
- phá workflow hiện tại
- đổi schema production
- xóa/sửa report cũ
- auto-migration destructive

**Đây là:** incremental operational refactor.

---

## Official direction

Refactor hệ hiện tại thành **CBV Modular Operational Workspace**:

- small-scale-first
- manual-first
- production-safe
- human-in-loop
- incremental-runtime
- append-only
- AI-assisted later

CBV là **Operational Workspace** cho đội vận hành nhỏ, HTX — không phải ERP/SaaS clone.

---

## Target architecture (summary)

```
CBV Workspace
├─ TASK / FINANCE / HO_SO → Google Sheet + AppSheet API
├─ MODULE PLUGIN (TASK, FINANCE, HO_SO)
├─ CLOUDFLARE (Worker: API/auth/sync/projection/plugin + FE Workboard)
└─ TOOLS (Cursor, Codex)
```

**Giữ nguyên:** Google Sheet (Operational DB), AppSheet (Mobile Runtime), Apps Script (Automation).

**Chuẩn hóa:** permission, workflow, naming, API consistency.

**FE:** Operational Workboard — gọi qua Worker/API bridge, không gọi thẳng Sheet/AppSheet.

---

## Mandatory capabilities (target)

1. Permission Runtime (ADMIN, MANAGER, STAFF, FINANCE, HO_SO, VIEW_ONLY)
2. Operational Search
3. Timeline Runtime (append-only)
4. Notification Center
5. File Runtime
6. Smart Filter
7. Assignment Runtime
8. Quick Actions

---

## Roadmap milestones

| Mốc | Focus |
|-----|-------|
| **1** | Workboard Core — login, permission, task, timeline, search, notification, file |
| **2** | Operational Coordination — assignment, manager dashboard, queue, overdue, workload |
| **3** | Observation Runtime — health, sync, audit, event (NocoDB optional) |
| **4** | Plugin Platform — OCR, Invoice, Zalo, CRM, AI |

---

## Phase RF_01 deliverables

### Create `docs/refactor/`

1. `CURRENT_ARCHITECTURE.md`
2. `TARGET_ARCHITECTURE.md`
3. `MODULE_MAPPING.md`
4. `WORKBOARD_UI_PLAN.md`
5. `PERMISSION_MATRIX.md`
6. `SEARCH_ARCHITECTURE.md`
7. `ROADMAP.md`
8. `RISK_REGISTER.md`

### Memory-first artifacts

- Prompt: `00_SYSTEM_BRAIN/000_PROMPTS/PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE_PROMPT.md` (this file)
- Report: `00_SYSTEM_BRAIN/000_REPORTS/PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE_REPORT.md`
- Handoff: `00_SYSTEM_BRAIN/001_HANDOFF/PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE_HANDOFF.md`

---

## Acceptance criteria

- All 8 refactor docs exist
- Prompt/report/handoff append-only
- No destructive changes
- No production schema change
- No runtime rewrite
- Git clean after commit

---

## Git requirements

**Before:** verify branch = `phase/from-v2.4.1-TASK-FIN-runtime-freeze`

**After:**

```bash
git add docs/refactor 00_SYSTEM_BRAIN/000_PROMPTS 00_SYSTEM_BRAIN/000_REPORTS 00_SYSTEM_BRAIN/001_HANDOFF
git commit -m "docs(refactor): establish modular operational workspace baseline"
```

**Do not push** unless requested.

---

## Mandatory rules

**PHẢI:** append-only, production-safe, human-in-loop, manual-first, incremental-refactor, documentation-first, không fake DONE

**KHÔNG:** rewrite-all, microservice-overkill, AI-auto-decision, big-bang-migration, đổi schema, xóa report cũ, ghi đè prompt/report/handoff cũ, backend mới, NocoDB/Plane/Outline ở phase này

---

## Final output expected

1. Branch hiện tại
2. Danh sách file đã tạo
3. Danh sách file đã sửa
4. Commit hash
5. Acceptance checklist
6. Verdict: GO / GO_WITH_WARNINGS / FAIL
7. Next recommended phase

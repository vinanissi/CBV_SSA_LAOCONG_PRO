# HOME_ALERT — Deployment Docs Index

**Phase:** DOCS-A — `OPERATIONAL_DEPLOYMENT_AND_APPSHEET_RUNTIME_GUIDE`  
**Date:** 2026-05-12  
**Status:** DOCS_READY (chờ thực thi deploy trên prod để chuyển sang DOCS_VALIDATED)  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Reference:** CBV Operational Ecosystem Standard V1

---

## File cho ai

| File | Audience chính | Audience phụ |
|------|----------------|--------------|
| `appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` | Admin AppSheet | Admin / Runtime Owner |
| `appsheet/APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` | Admin AppSheet | Supervisor (đọc hiểu) |
| `appsheet/APPSHEET_REFERENCE_BINDING_CHECKLIST.md` | Admin AppSheet | Admin (go-live binding) |
| `appsheet/CLICK_BY_CLICK_HOME_ALERT_SETUP.md` | Người mới / Pilot | Admin (hỗ trợ) |
| `appsheet/CLICK_BY_CLICK_TABLES_AND_COLUMNS.md` | Người mới / Pilot | Admin AppSheet |
| `appsheet/CLICK_BY_CLICK_SLICES.md` | Người mới / Pilot | Admin AppSheet |
| `appsheet/CLICK_BY_CLICK_VIEWS_AND_DASHBOARD.md` | Người mới / Pilot | Admin AppSheet |
| `appsheet/CLICK_BY_CLICK_ACTIONS_SECURITY.md` | Người mới / Pilot | Admin AppSheet |
| `appsheet/PHASE_87_APPSHEET_PILOT_SETUP_BINDING.md` | Admin AppSheet (pilot) | Runtime owner |
| `appsheet/APPSHEET_VIEW_SETUP_MATRIX.md` | Admin AppSheet (pilot) | Supervisor (read) |
| `appsheet/APPSHEET_SLICE_SETUP_MATRIX.md` | Admin AppSheet (pilot) | — |
| `appsheet/APPSHEET_MANUAL_ACTIONS_MATRIX.md` | Admin AppSheet (pilot) | Supervisor |
| `appsheet/APPSHEET_SECURITY_FILTER_MATRIX.md` | Admin AppSheet (pilot) | — |
| `appsheet/APPSHEET_PILOT_UAT_SCRIPT.md` | Pilot cohort | Admin |
| `appsheet/APPSHEET_PILOT_SIGNOFF_CHECKLIST.md` | Admin / Supervisor | Runtime owner |
| `operations/OPERATIONAL_REFERENCE_LAYER_DESIGN.md` | Admin / Runtime Owner | Admin AppSheet (context Ref layer) |
| `training/HOME_ALERT_OPERATOR_MANUAL.md` | Operator | Supervisor |
| `training/HOME_ALERT_SUPERVISOR_MANUAL.md` | Supervisor / Team Lead | Admin |
| `admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` | Admin / Runtime Owner | Supervisor (read-only) |
| `operations/HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` | Admin / Runtime Owner | Supervisor (phối hợp go-live) |

---

## Thứ tự đọc (lần đầu)

1. `admin/HOME_ALERT_ADMIN_RUNTIME_OWNER_GUIDE.md` — hiểu vai trò + cấm.
2. `operations/OPERATIONAL_REFERENCE_LAYER_DESIGN.md` — lớp reference/enum (REF-A) là gì, không lưu ENV ở đâu.
3. `appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` — cấu trúc tables/slices/views/actions (kèm §3A binding).
4. `appsheet/APPSHEET_REFERENCE_BINDING_CHECKLIST.md` — checklist binding từng bước.
5. `appsheet/APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` — công thức slice/security/Valid_If (kèm §6B).
6. `operations/HOME_ALERT_OPERATIONAL_DEPLOYMENT_RUNBOOK.md` — runbook deploy.
7. `training/HOME_ALERT_OPERATOR_MANUAL.md` — đào tạo operator.
8. `training/HOME_ALERT_SUPERVISOR_MANUAL.md` — đào tạo supervisor.

### Người chỉ cần thao tác (không rành kỹ thuật) — đọc theo thứ tự

1. `appsheet/CLICK_BY_CLICK_HOME_ALERT_SETUP.md`  
2. `appsheet/CLICK_BY_CLICK_TABLES_AND_COLUMNS.md`  
3. `appsheet/CLICK_BY_CLICK_SLICES.md`  
4. `appsheet/CLICK_BY_CLICK_VIEWS_AND_DASHBOARD.md`  
5. `appsheet/CLICK_BY_CLICK_ACTIONS_SECURITY.md`  

Sau đó nếu cần hiểu sâu: `APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` và `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md`.

---

## Thứ tự triển khai (deploy lần đầu)

| Bước | File guide chính | Trách nhiệm |
|------|------------------|-------------|
| 1. Pre-deploy + git state | `operations/...RUNBOOK.md` §1–§2 | Admin |
| 2. GAS deploy + bootstrap | `admin/...OWNER_GUIDE.md` §2–§3, `operations/...RUNBOOK.md` §3–§4 | Admin |
| 3. Test console (82/83/84) | `admin/...OWNER_GUIDE.md` §4, `operations/...RUNBOOK.md` §6 | Admin |
| 4. AppSheet setup | `appsheet/CLICK_BY_CLICK_*.md` (5 file) **hoặc** `appsheet/...INSTALL_GUIDE.md` + checklist + formula; **pilot:** `PHASE_87_APPSHEET_PILOT_SETUP_BINDING.md` + `APPSHEET_*_MATRIX.md` + GAS Phase 87 Test Console | Admin AppSheet / Pilot |
| 5. Pilot rollout | `operations/...RUNBOOK.md` §7 | Admin + Supervisor + Pilot operators |
| 6. Training | `training/HOME_ALERT_OPERATOR_MANUAL.md` + `training/HOME_ALERT_SUPERVISOR_MANUAL.md` | Supervisor |
| 7. Go-live | `operations/...RUNBOOK.md` §9 | Tất cả |
| 8. First-week monitoring | `operations/...RUNBOOK.md` §10 | Admin + Supervisor |
| 9. Cân nhắc bật safe trigger | `admin/...OWNER_GUIDE.md` §5–§6 | Admin (có phê duyệt) |
| 10. Rollback (nếu cần) | `operations/...RUNBOOK.md` §11 | Admin |

---

## Trạng thái phase docs

| Mục | Trạng thái |
|-----|-----------|
| Doc files cần | Đủ bộ HOME_ALERT appsheet + operations + index (đã bổ sung checklist REF-A) |
| Brain artifacts | `012_*`–`015_*` trong `00_SYSTEM_BRAIN/` (kèm prompt/report/handoff từng phase) |
| Code changes | KHÔNG (DOCS-A không sửa runtime) |
| Schema changes | KHÔNG |
| Trigger changes | KHÔNG |
| AppSheet changes | KHÔNG (chỉ tài liệu, admin sẽ tự áp dụng) |

---

## PHASE 87 — AppSheet pilot setup binding (GAS + docs)

**Trạng thái:** Pilot setup — **không** xác nhận production.  
**Mục tiêu:** Ma trận view/slice/action/security + UAT + signoff; Test Console **Phase 87 — AppSheet Pilot Setup** (`CbvAppSheetPilot_*`, envelope `CBV_TCS_V1`).

| Tài liệu / công cụ | Ghi chú |
|--------------------|---------|
| `docs/appsheet/PHASE_87_APPSHEET_PILOT_SETUP_BINDING.md` | Tổng quan phase |
| `docs/appsheet/APPSHEET_VIEW_SETUP_MATRIX.md` | Tên view + SCREEN_CODE |
| `docs/appsheet/APPSHEET_SLICE_SETUP_MATRIX.md` | Filter slice (không dùng `=` đầu dòng) |
| `docs/appsheet/APPSHEET_MANUAL_ACTIONS_MATRIX.md` | ACK … RELEASE, manual only |
| `docs/appsheet/APPSHEET_SECURITY_FILTER_MATRIX.md` | `USEREMAIL()` / `USERSETTINGS("Role")` |
| `docs/appsheet/APPSHEET_PILOT_UAT_SCRIPT.md` | UAT theo role |
| `docs/appsheet/APPSHEET_PILOT_SIGNOFF_CHECKLIST.md` | Signoff pilot (append-only) |
| `05_GAS_RUNTIME/88_APPSHEET_PILOT_SETUP_RUNTIME.js` | Ma trận + validate + health |
| `05_GAS_RUNTIME/89_APPSHEET_PILOT_SETUP_TEST_CONSOLE.js` | Menu Test Console |

**Artifacts:** `021_*` trong `00_SYSTEM_BRAIN/` (prompt, report, handoff).

---

## PHASE 88 — FE architecture rebalance closeout (docs + decision + Test Console)

**Trạng thái:** Architecture readiness **GO**; pilot readiness **GO**; **không** xác nhận production.  
**Mục tiêu:** Chốt kiến trúc FE vận hành **WebApp-led hybrid** (Sheets/GAS runtime + WebApp workspace + AppSheet shell) và thêm Test Console gate Phase 88.

| Tài liệu / quyết định / công cụ | Ghi chú |
|-------------------------------|--------|
| `docs/architecture/PHASE_88_FE_ARCHITECTURE_REBALANCE_CLOSEOUT.md` | Tổng quan phase 88 |
| `docs/architecture/FE_OWNERSHIP_MATRIX.md` | Matrix WebApp/AppSheet ownership |
| `00_SYSTEM_BRAIN/002_DECISIONS/022_FE_ARCHITECTURE_REBALANCE_DECISION.md` | Decision log |
| `05_GAS_RUNTIME/90_FE_ARCHITECTURE_REBALANCE_TEST_CONSOLE.js` | 🧪 Test Console menu Phase 88 |

**Artifacts:** `022_*` trong `00_SYSTEM_BRAIN/` (prompt, report, handoff).

---

## PHASE 89 — WebApp operational workspace skeleton (GAS + docs)

**Trạng thái:** skeleton — **read-first**, **không** xác nhận production.  
**Mục tiêu:** dựng nền WebApp-led operational workspace: route registry + dispatcher + HTML shell + read-first APIs + Test Console Phase 89.

| Tài liệu / công cụ | Ghi chú |
|--------------------|--------|
| `docs/webapp/PHASE_89_WEBAPP_OPERATIONAL_WORKSPACE_SKELETON.md` | Tổng quan phase 89 |
| `docs/webapp/WEBAPP_ROUTE_REGISTRY.md` | Route registry spec |
| `docs/webapp/WEBAPP_READ_FIRST_API.md` | Read-first API contract |
| `docs/webapp/WEBAPP_FE_TEST_BASELINE.md` | FE test baseline |
| `05_GAS_RUNTIME/91_..95_WEBAPP_WORKSPACE_*.js` | Runtime skeleton + Test Console |
| `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_*.html` | HTML templates |

**Artifacts:** `025_*` trong `00_SYSTEM_BRAIN/` (prompt, report, handoff).

---

## PHASE 90 — WebApp workspace pilot pages / data binding (GAS + docs)

**Trạng thái:** pilot pages — **read-first**, **không** xác nhận production.  
**Mục tiêu:** nâng Home/Queue/SLA thành pilot pages có data binding rõ ràng + FE state standard + Test Console Phase 90.

| Tài liệu / công cụ | Ghi chú |
|--------------------|--------|
| `docs/webapp/PHASE_90_WEBAPP_WORKSPACE_PILOT_PAGES_DATA_BINDING.md` | Tổng quan phase 90 |
| `docs/webapp/WEBAPP_HOME_WORKSPACE_DATA_BINDING.md` | Data binding Home |
| `docs/webapp/WEBAPP_QUEUE_DATA_BINDING.md` | Data binding Queue |
| `docs/webapp/WEBAPP_SLA_DASHBOARD_DATA_BINDING.md` | Data binding SLA |
| `docs/webapp/WEBAPP_FE_STATE_STANDARD.md` | FE state standard |
| `docs/webapp/WEBAPP_PILOT_UAT_CHECKLIST.md` | UAT checklist |
| `05_GAS_RUNTIME/97_..98_..990_*.js` | Pilot data/renderer/test console |
| `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_*_PILOT.html` | Pilot templates |

**Artifacts:** `028_*` trong `00_SYSTEM_BRAIN/` (prompt, report, handoff).

---

## PHASE 91 — WebApp Timeline / Kanban read-first pages (GAS + docs)

**Trạng thái:** read-first pages — **không** drag-drop save, **không** xác nhận production.  
**Mục tiêu:** thay placeholder Phase 90 cho `/home-alert/timeline` và `/home-alert/kanban` bằng renderer thật dựa trên HOME_ALERT; thêm Test Console Phase 91 (CBV_TCS_V1).

| Tài liệu / công cụ | Ghi chú |
|--------------------|--------|
| `docs/webapp/PHASE_91_WEBAPP_TIMELINE_KANBAN_READ_FIRST_PAGES.md` | Tổng quan phase 91 |
| `docs/webapp/WEBAPP_TIMELINE_DATA_BINDING.md` | Data binding Timeline (sort UPDATED_AT desc, fallback CREATED_AT) |
| `docs/webapp/WEBAPP_KANBAN_DATA_BINDING.md` | Data binding Kanban (group by STATUS, 50 cards/column) |
| `docs/webapp/WEBAPP_TIMELINE_KANBAN_UAT_CHECKLIST.md` | UAT checklist read-first |
| `05_GAS_RUNTIME/991_WEBAPP_TIMELINE_KANBAN_DATA.js` | Data layer |
| `05_GAS_RUNTIME/992_WEBAPP_TIMELINE_KANBAN_RENDERER.js` | Renderer + state handling |
| `05_GAS_RUNTIME/993_WEBAPP_TIMELINE_KANBAN_TEST_CONSOLE.js` | Test Console Phase 91 (CBV_TCS_V1) |
| `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_TIMELINE.html` | Timeline template |
| `05_GAS_RUNTIME/html/WEBAPP_WORKSPACE_KANBAN.html` | Kanban template |

**Routes affected:** `/home-alert/timeline`, `/home-alert/kanban` (Phase 90 placeholder fallback retained).  
**Artifacts:** `029_*` trong `00_SYSTEM_BRAIN/` (prompt, report, handoff).  
**Next:** Phase 92 — WebApp Runtime Health / Report Viewer Pages.

---

## PHASE 92 — WebApp Runtime Health / Report Viewer pages (GAS + docs)

**Trạng thái:** Operational Observability Layer — **read-first**, **không** auto-heal / auto resolve / auto escalate, **không** xác nhận production.  
**Mục tiêu:** thay placeholder `/runtime/health` và `/reports` bằng renderer thật dựa trên per-phase Test Console probe + `SYSTEM_HEALTH_LOG` + `CBV_TEST_REPORTS` (nếu có) + in-memory `PropertiesService`; thêm Test Console Phase 92 (CBV_TCS_V1).

| Tài liệu / công cụ | Ghi chú |
|--------------------|--------|
| `docs/webapp/PHASE_92_WEBAPP_RUNTIME_HEALTH_REPORT_VIEWER.md` | Tổng quan phase 92 |
| `docs/webapp/WEBAPP_RUNTIME_HEALTH_DATA_BINDING.md` | Data binding Runtime Health (per-phase catalog, source priority) |
| `docs/webapp/WEBAPP_REPORT_VIEWER_DATA_BINDING.md` | Data binding Report Viewer (sources, column adapter, detail behavior) |
| `docs/webapp/WEBAPP_OBSERVABILITY_UAT_CHECKLIST.md` | UAT checklist read-first observability |
| `05_GAS_RUNTIME/994_WEBAPP_OBSERVABILITY_DATA.js` | Data layer + per-phase catalog |
| `05_GAS_RUNTIME/995_WEBAPP_OBSERVABILITY_RENDERER.js` | Renderer + state handling |
| `05_GAS_RUNTIME/996_WEBAPP_OBSERVABILITY_TEST_CONSOLE.js` | Test Console Phase 92 (CBV_TCS_V1) |
| `05_GAS_RUNTIME/html/WEBAPP_RUNTIME_HEALTH.html` | Runtime Health template |
| `05_GAS_RUNTIME/html/WEBAPP_REPORT_VIEWER.html` | Report Viewer template |
| `05_GAS_RUNTIME/html/WEBAPP_OBSERVABILITY_COMPONENTS.html` | Shared component styles |

**Routes affected:** `/runtime/health`, `/reports` (Phase 89 placeholder fallback retained).  
**Artifacts:** `031_*` trong `00_SYSTEM_BRAIN/` (prompt, report, handoff).  
**Next:** Phase 93 — WebApp Admin Reference Viewer / Settings Read-First.

---

## PHASE 93 — WebApp Admin Reference Viewer / Settings Read-First (GAS + docs)

**Trạng thái:** Operational Governance Layer — **read-first**, **không** edit settings / toggle feature / delete user / permission change, secrets / tokens / API keys **masked**, **không** xác nhận production.  
**Mục tiêu:** thay placeholder `/admin/reference` bằng renderer thật hiển thị governance summary, enum dictionary, user/role/team summary, feature flags, system registry, UI contract registry, route registry; thêm Test Console Phase 93 (CBV_TCS_V1).

| Tài liệu / công cụ | Ghi chú |
|--------------------|--------|
| `docs/webapp/PHASE_93_WEBAPP_ADMIN_REFERENCE_VIEWER_SETTINGS_READ_FIRST.md` | Tổng quan phase 93 |
| `docs/webapp/WEBAPP_ADMIN_REFERENCE_DATA_BINDING.md` | Sheet sources, field mapping, masking rules |
| `docs/webapp/WEBAPP_ADMIN_REFERENCE_UAT_CHECKLIST.md` | UAT checklist read-first governance |
| `docs/webapp/WEBAPP_GOVERNANCE_LAYER_OVERVIEW.md` | Why governance + relation to Observability + AppSheet/WebApp split |
| `05_GAS_RUNTIME/997_WEBAPP_ADMIN_REFERENCE_DATA.js` | Data layer + governance probe + scoped mutation validator |
| `05_GAS_RUNTIME/998_WEBAPP_ADMIN_REFERENCE_RENDERER.js` | Renderer + per-section sub-renderers + state |
| `05_GAS_RUNTIME/998A_WEBAPP_ADMIN_REFERENCE_TEST_CONSOLE.js` | Test Console Phase 93 (CBV_TCS_V1) |
| `05_GAS_RUNTIME/html/WEBAPP_ADMIN_REFERENCE_VIEWER.html` | Admin Reference Viewer template |
| `05_GAS_RUNTIME/html/WEBAPP_ADMIN_REFERENCE_COMPONENTS.html` | Shared component styles |

**Routes affected:** `/admin/reference` (Phase 89 placeholder fallback retained).  
**Artifacts:** `032_*` trong `00_SYSTEM_BRAIN/` (prompt, report, handoff).  
**Next:** Phase 94 — WebApp UI Foundation Freeze / UAT Hardening.

---

## PHASE 94 — WebApp UI Foundation Freeze / UAT Hardening (GAS + docs)

**Trạng thái:** UI Foundation Freeze (pilot tier) — **không** thêm feature, **không** mở write/mutation, **không** xác nhận production.  
**Mục tiêu:** chuẩn hóa và đóng băng WebApp UI contract (route, FE state, safety footer, responsive/a11y) + master UAT checklist + Test Console Phase 94 (CBV_TCS_V1) trước khi staff trial.

| Tài liệu / công cụ | Ghi chú |
|--------------------|--------|
| `docs/webapp/PHASE_94_WEBAPP_UI_FOUNDATION_FREEZE_UAT_HARDENING.md` | Tổng quan phase 94 |
| `docs/webapp/WEBAPP_UI_FOUNDATION_STANDARD.md` | Page shell, nav, cards, badges, safety, states, read-first, responsive, accessibility |
| `docs/webapp/WEBAPP_ROUTE_FREEZE_MATRIX.md` | Frozen route matrix + support endpoints |
| `docs/webapp/WEBAPP_FE_STATE_FREEZE_STANDARD.md` | FE state vocabulary freeze |
| `docs/webapp/WEBAPP_SAFETY_FOOTER_STANDARD.md` | Exact safety phrases |
| `docs/webapp/WEBAPP_RESPONSIVE_ACCESSIBILITY_BASELINE.md` | Pilot responsive + a11y baseline |
| `docs/webapp/WEBAPP_UAT_MASTER_CHECKLIST.md` | Master UAT checklist |
| `docs/webapp/WEBAPP_ROUTE_SMOKE_TEST_MATRIX.md` | Per-route smoke matrix |
| `docs/webapp/WEBAPP_UI_CONSISTENCY_AUDIT.md` | Audit findings + future polish rules |
| `05_GAS_RUNTIME/998B_WEBAPP_UI_FREEZE_AUDIT.js` | Audit runtime + scoped mutation validator |
| `05_GAS_RUNTIME/998C_WEBAPP_UI_FREEZE_TEST_CONSOLE.js` | Test Console Phase 94 (CBV_TCS_V1) |
| `00_SYSTEM_BRAIN/002_DECISIONS/033_WEBAPP_UI_FOUNDATION_FREEZE_DECISION.md` | Freeze decision |

**Routes affected:** none added; freezes existing 8 operational routes + `?action=ping`.  
**Artifacts:** `033_*` trong `00_SYSTEM_BRAIN/` (prompt, report, handoff, decision).  
**Next:** Phase 95 — WebApp Pilot UAT Runbook / Staff Trial.

---

## Liên kết phase trước

- Phase 82 — SLA + Escalation Runtime: report `00_SYSTEM_BRAIN/000_REPORTS/009_*`, handoff
  `00_SYSTEM_BRAIN/001_HANDOFF/009_*`.
- Phase 83 — SLA Policy Registry: report `010_*`, handoff `010_*`.
- Phase 84 — Safe Automation Runtime: report `011_*`, handoff `011_*`.
- DOCS-A — file này + `012_*` prompt/report/handoff.
- Phase APPSHEET-REF-A — `014_*` prompt/report/handoff + `docs/appsheet/APPSHEET_REFERENCE_BINDING_CHECKLIST.md`.
- Phase APPSHEET-HAND-A — `015_*` prompt/report/handoff + `docs/appsheet/CLICK_BY_CLICK_*.md` (5 file).

---

## PHASE APPSHEET-HAND-A — Click-by-Click Setup

**Trạng thái:** **docs-only** — không thay runtime GAS, không đổi `.clasp.json` / `scriptId`.  
**Dành cho:** Người **chỉ biết thao tác cơ bản**, cần **cầm tay chỉ việc** trên AppSheet.com.

| File | Nội dung chính |
|------|----------------|
| `appsheet/CLICK_BY_CLICK_HOME_ALERT_SETUP.md` | Tạo app, Data/Tables, Preview, điện thoại |
| `appsheet/CLICK_BY_CLICK_TABLES_AND_COLUMNS.md` | Add table, Regenerate, Key/Label, Ref/Enum |
| `appsheet/CLICK_BY_CLICK_SLICES.md` | New Slice, công thức copy-paste |
| `appsheet/CLICK_BY_CLICK_VIEWS_AND_DASHBOARD.md` | UX/Views, Deck `OPERATOR_*`, format rule |
| `appsheet/CLICK_BY_CLICK_ACTIONS_SECURITY.md` | Actions, Security filter, cấm Bot/auto |

**Artifacts:** `015_*` trong `00_SYSTEM_BRAIN/`.

---

## PHASE APPSHEET-REF-A — Reference / Enum Binding

**Trạng thái:** **docs-only** — không đổi core runtime trong phase này; admin áp dụng trên AppSheet Designer.  
**Mục tiêu:** Bind đúng 8 bảng reference + enum tới `HOME_ALERT`, SLA policy, automation config, `TASK_MAIN`; giữ nguyên contract `OPERATOR_*`.

| Tài liệu | Ai đọc | Thứ tự (sau REF-A runtime) |
|----------|--------|----------------------------|
| `appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` (§3A) | Admin AppSheet | 1 |
| `appsheet/APPSHEET_REFERENCE_BINDING_CHECKLIST.md` | Admin AppSheet | 2 |
| `appsheet/APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` (§6B) | Admin AppSheet | 3 |
| `operations/OPERATIONAL_REFERENCE_LAYER_DESIGN.md` | Admin / Runtime Owner | 0 (context) hoặc song song mục 1 |

**Artifacts:** `014_*` prompt / report / handoff trong `00_SYSTEM_BRAIN/`.

---

## Ràng buộc (không được vi phạm khi đọc / áp dụng)

- Manual-first → Auto-later.
- No destructive migration.
- No overwrite report/handoff/prompt cũ.
- No fake GO.
- Không thêm core automation lớn trong DOCS-A.
- Không thay đổi `OPERATOR_*` contract.
- Không thêm AppSheet Bot.
- Không tự ý mở rộng allowlist Phase 84.
- APPSHEET-REF-A — chỉ tài liệu binding reference/enum; không mở ENV-A; không Phase 85 / AI / Queue Intelligence.
- APPSHEET-HAND-A — chỉ hướng dẫn thao tác AppSheet; không thay runtime.
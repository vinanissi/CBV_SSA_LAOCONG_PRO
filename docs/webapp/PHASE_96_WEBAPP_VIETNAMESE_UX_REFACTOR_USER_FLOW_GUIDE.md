# Phase 96 — WebApp Vietnamese UX Refactor / User Flow Guide

**Trạng thái:** Localization + guidance (không mutation, không đổi route).  
**Chuẩn:** CBV Operational Ecosystem V1 · `CBV_TCS_V1` (Test Console Phase 96).

## Mục tiêu đã chốt

- Việt hóa nhãn UI nội bộ; giữ **nguyên** đường dẫn route Phase 94.  
- Chuẩn hóa URL WebApp **`/exec`** trong docs và runtime (`998F`).  
- Bổ sung hướng dẫn luồng Operator / Supervisor / Admin (markdown).  
- Test Console: `🧪 CBV Test Console → Phase 96 — Vietnamese UX`.

## File runtime chính

| File | Mô tả |
|------|--------|
| `05_GAS_RUNTIME/998F_WEBAPP_VI_UX_COPY.js` | `CbvWebAppVi_*` — copy + link + footer + flow JSON |
| `05_GAS_RUNTIME/998G_WEBAPP_VI_UX_TEST_CONSOLE.js` | Health check + show guides + copy report |

## Tài liệu phase

| File |
|------|
| `docs/webapp/WEBAPP_USER_FLOW_GUIDE_VI.md` |
| `docs/webapp/WEBAPP_OPERATOR_QUICK_GUIDE_VI.md` |
| `docs/webapp/WEBAPP_SUPERVISOR_QUICK_GUIDE_VI.md` |
| `docs/webapp/WEBAPP_ADMIN_QUICK_GUIDE_VI.md` |
| `docs/webapp/WEBAPP_LINKS_AND_ROUTES_VI.md` |
| `docs/webapp/WEBAPP_VI_LABEL_DICTIONARY.md` |
| `docs/webapp/WEBAPP_UAT_VIETNAMESE_COPY_CHECKLIST.md` |

## Renderer đã tích hợp helper (fallback EN nếu thiếu `998F`)

- `94_WEBAPP_WORKSPACE_RENDERER.js` + shell HTML  
- `98_WEBAPP_WORKSPACE_PILOT_RENDERER.js`  
- `992_WEBAPP_TIMELINE_KANBAN_RENDERER.js`  
- `995_WEBAPP_OBSERVABILITY_RENDERER.js`  
- `998_WEBAPP_ADMIN_REFERENCE_RENDERER.js`

## Độ sẵn sàng

- **Vietnamese UX / pilot copy:** `GO_WITH_WARNINGS` cho đến khi có phản hồi nhân sự.  
- **Production:** NOT YET (không đổi so với Phase 95).

## Bước tiếp

- **Phase 97** — Staff trial execution / feedback capture.  
- Hoặc **Phase 96.1** nếu audit copy FAIL.

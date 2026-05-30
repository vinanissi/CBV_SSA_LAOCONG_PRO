# PHASE_UI_CBV_WORK_INBOX_V3_FINAL_FOCUS_RUNTIME_REDESIGN — Prompt

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Date:** 2026-05-29  
**Module:** Work Inbox V3 — see `00_SYSTEM_BRAIN/006_PHASES/MODULE_AUTHORITY_REGISTRY.md`  
**Standard:** CBV Operational Ecosystem Standard V1 · CBV_TCS_V1

## Objective

Cập nhật CBV Work Inbox V3: chuyển từ inbox dài / nhiều nút sang **Focus Runtime** gọn — một task, hành động rõ, phục vụ operator xử lý việc thật.

## Reference layout

- Topbar: CBV Control Console (existing `TopBar`)
- Compact sidebar: VẬN HÀNH · NGHIỆP VỤ · HỆ THỐNG · Quá hạn
- Main: Focus Task Workspace (counter, prev/next, metadata, AI summary, checklist, actions)
- Right: tabs Chi tiết · Timeline · Handoff · Tài liệu
- Bottom: existing `RuntimeStatusBar` (TASK_MAIN, sync, session)

## Constraints

- Không đổi DB/API contract
- Không auto resolve/escalate
- Giữ `/inbox` default; `/tasks` alias
- Legacy runtime panel vẫn tồn tại (collapsed)
- Append-only reports

## Deliverables

- React components under `apps/workboard/src/modules/task/inbox/focusRuntime/`
- `focusRuntimeRedesignChecks.ts` + test console README
- Report, handoff, test evidence

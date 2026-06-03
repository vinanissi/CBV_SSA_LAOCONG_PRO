# Operator Design Baseline V1 — Authority

**Status:** LOCKED (PHASE_OPERATOR_DESIGN_BASELINE_V1)  
**Reference:** Operator UX Golden Reference V1

---

## Scope

Official typography, spacing, and visual hierarchy for OCMS operator runtime (Work Inbox focus, checklist, right action panel, sidebar, footer).

Implementation anchor: `apps/workboard/src/styles/operator-design-baseline-v1.css` + `html.operator-design-baseline-v1` (via `themeRuntime.ts`).

---

## Typography scale (operator-facing)

| Surface | Target size |
|---------|-------------|
| App shell / navigation | 14–16px (`--op-font-nav` 15px) |
| Task title | 20–24px (`--op-font-task-title` 22px) |
| Checklist step title | 16–18px (`--op-font-checklist-title` 17px) |
| Checklist metadata / compact counters | 13–14px |
| Action buttons (right panel, footer primary) | 14–16px |
| Right panel section titles | 14–16px |
| Right panel body | minimum 14px |
| Footer runtime | 13–14px |
| Technical metadata (collapsed) | 12px max |

No micro-fonts (&lt;12px) for operator-primary content.

---

## Checklist

- Default row: checkbox + step title + **compact counters** (💬 📎 🔗 🕒 counts) when `densityMode` and row not expanded.
- Full inline chips only when row is focused, expanded, or has open inline panel (see `CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md`).
- Row click = focus; checkbox = complete.

---

## Right panel

Tabs: **Chi tiết | Timeline | Handoff | Hồ sơ | Kỹ thuật** (PHASE_OPERATOR_PANEL_INFORMATION_ARCHITECTURE_V1).

**Chi tiết** only: Tóm tắt → Thao tác → Cập nhật xử lý → Liên hệ / Hỗ trợ.

Timeline and technical content live in dedicated tabs — not in Chi tiết.

---

## Footer

Runtime/sync/worker/session/console remain in footer only — never center checklist or operator detail body.

Primary actions: **+ Tạo**, **Tìm kiếm**, **Thêm** (secondary menu).

---

## Layout preservation

Left navigation · center work · right detail · bottom footer — no structural redesign in this baseline.

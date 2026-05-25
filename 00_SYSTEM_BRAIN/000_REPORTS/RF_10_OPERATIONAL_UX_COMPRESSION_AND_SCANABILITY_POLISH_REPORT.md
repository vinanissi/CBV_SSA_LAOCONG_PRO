# RF_10 — Operational UX Compression and Scanability Polish — Report

## Phase metadata

| Field | Value |
|-------|-------|
| **Phase** | RF_10_OPERATIONAL_UX_COMPRESSION_AND_SCANABILITY_POLISH |
| **Branch** | `phase/from-v2.4.1-TASK-FIN-runtime-freeze` |
| **Scope** | `apps/workboard/` UX polish only |
| **Date** | 2026-05-25 |

---

## Summary

Compressed operational desktop UX for scan-first operator workflow: global Focus Strip (heartbeat layer), redesigned task cards with priority tags and inline actions, rebalanced slate palette (#0f172a / #111827 / #101828), wider detail panel (400px), subtle top status strip, simplified sidebar (primary vs secondary nav), enlarged quick bar, operator-friendly empty states, reduced technical UI wording.

No API/Worker/GAS changes. No write actions added.

---

## UX changes

| Area | Change |
|------|--------|
| Focus Strip | Global clickable chips: quá hạn, thiếu GPLX, chờ xác nhận, chưa phân công |
| Task cards | Priority tag, larger title, subtitle, SLA line, Mở/Timeline/Hồ sơ actions |
| Palette | Surface rebalance; main canvas elevation |
| Right panel | 360–420px; timeline + file list readability |
| Top strip | Kết nối / Dữ liệu / Tài chính / Đồng bộ — subtle |
| Sidebar | Primary nav + secondary “Cấu hình mô-đun” |
| Quick bar | Taller buttons, wider spacing |
| Empty states | Operator copy via `EMPTY_COPY` |
| Wording | Removed demoLabel/projection from visible UI |

---

## Files created

| File |
|------|
| `src/components/ui/FocusStrip.tsx` |
| `src/components/layout/TopRuntimeStrip.tsx` |
| `src/components/ui/FileList.tsx` |
| `src/components/ui/TaskDetailContent.tsx` |
| `src/shared/utils/taskDisplay.ts` |

---

## Files modified

| File |
|------|
| `tailwind.config.ts`, `src/styles/index.css` |
| `AppShell.tsx`, `TopBar.tsx`, `Sidebar.tsx`, `DetailPanel.tsx`, `QuickActionBar.tsx` |
| `TaskCard.tsx`, `TimelineList.tsx`, `EmptyState.tsx` |
| `shared/constants/index.ts` |
| `HomePage.tsx`, `TasksPage.tsx`, `SearchPage.tsx`, `ObservationPage.tsx`, `PluginsPage.tsx` |

---

## Build validation

| Check | Result |
|-------|--------|
| `npm run typecheck` | PASS |
| `npm run build` | PASS (76 modules) |

---

## Verdict

**GO_WITH_WARNINGS**

- Mobile not optimized (desktop-first by design)
- Mock data still limited for rich card subtitles

---

## Next recommended phase

**PHASE_RF_11_OPERATOR_WORKFLOW_ACCELERATION** — keyboard shortcuts, command palette, search acceleration.

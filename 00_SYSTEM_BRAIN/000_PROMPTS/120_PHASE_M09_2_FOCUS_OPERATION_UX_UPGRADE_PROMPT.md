# Phase M09.2 — Focus Operation UX Upgrade (within M09)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Goal:** Upgrade `/workspace/task-runtime` from link hub to operator-centric **Focus Operation Runtime** — no M10, no automation, no production writes.

## Delivered in code

- Hero block (`cbv-m09-focus-hero`): title, taskId, status, SLA, priority, source, updated, next step, row key line, READ_FIRST badge.
- Action bar (`cbv-m09-focus-action-bar`): AppSheet detail/form/list (M07.2 strict row key), SOP, quick note anchor, stuck/help, Daily, runtime refresh, next task.
- Session info (`cbv-m09-focus-session-info`): route, openedAt, openedBy, mode/focusMode, traceId, `safeWriteEnabled=false`.
- Task context (`cbv-m09-focus-task-context`): structured fields + “Chưa có dữ liệu” fallbacks.
- Next action (`cbv-m09-focus-next-action`): content or standard fallback copy.
- Quick log preview (`cbv-m09-focus-quick-log-preview`): empty session line only — no fake history.
- Quick note form (`cbv-m09-focus-quick-note-form` + existing quick-note markers): types, disabled fields, preview button, official AppSheet link when form URL ok.
- Workflow continuity (`cbv-m09-focus-workflow-continuity`): Daily, My Queue, Workboard, next task, AppSheet record link when detail/form ok.
- Safe copy (`cbv-m09-focus-safe-copy`): single friendly banner when AppSheet record actions unavailable; per-control short “—” + title tooltip (no repeated long technical line).
- Debug (`cbv-m09-focus-debug-hidden`): technical JSON off-screen.

## M09.1 preserved

- `buildTaskMainDetailUrl_` / `Form` + explicit row key; missing row → empty URL, `safeDisabled`, `TASK_ROW_KEY_MISSING`.
- `buildSopUrl_` with taskId, source, module, from, optional rowKey/returnRoute.

## Artifacts

- Markers: `CBV_M09_INTERACTIVE_TASK_MARKER_CONTRACT.json`, `WEBAPP_STAFF_WORKBOARD.html` probe, `999H` marker list + new checks.
- GAS verification: **NOT VERIFIED ON GAS** until `clasp push` + M09/M07/M08 consoles on deploy machine.

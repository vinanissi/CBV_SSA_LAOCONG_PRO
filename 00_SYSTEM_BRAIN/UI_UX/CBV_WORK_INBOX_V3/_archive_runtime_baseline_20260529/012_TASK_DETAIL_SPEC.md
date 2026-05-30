# CBV_WORK_INBOX_V3 — Task Detail Specification

**Version:** V3.0 · **Date:** 2026-05-29  
**Implementation:** `DetailPanel.tsx`, `OperationalContextPanel.tsx`, `TasksPage.tsx`, `useInlineExecution.ts`

---

## 1. Detail surfaces

| Surface | Breakpoint | Component |
|---------|------------|-----------|
| Right aside | ≥ xl (1280px) | `DetailPanel` aside |
| Bottom sheet | < xl | `DetailPanel` fixed overlay |
| Inline on card | all | `TaskCard` action zone |

Detail is **contextual** — not a separate route component. Route `/tasks/:taskId` syncs selection with panel.

---

## 2. Panel structure

### Header

| Element | Spec |
|---------|------|
| Title | Task title or "Ngữ cảnh vận hành" |
| Close | ESC button → `clearDetail()` |
| Mobile title | Fixed bottom sheet header |

### Body sections (order — GS_09H)

1. **Next action prompt** — `NextStepCompletionPrompt` / next action text
2. **Inline execution** — `InlineQuickActions`, handoff strip, micro-update
3. **SLA / urgency summary** — dominant signals, due date, stale days
4. **People** — owner, reporter (display names)
5. **Timeline** — append-only update log entries
6. **Files** — `FileList` attachments
7. **Debug** (admin, collapsed) — raw IDs, trace

Empty panel copy:
> Chọn việc để xem ngữ cảnh vận hành — SLA, timeline, tài liệu và bước tiếp theo.

---

## 3. Data loading

| Trigger | Behavior |
|---------|----------|
| Card click | Fetch detail if not cached |
| URL `/tasks/:id` | Load detail on mount |
| Cache | 45s TTL (`DETAIL_CACHE_TTL_MS`) |
| Soft refresh | Patch from snapshot if task updated |

### Detail fetch

Uses `api.getTaskDetail(taskId)` envelope.  
On unknown ID: error message in panel, list remains visible.

---

## 4. TaskDetail fields (display priority)

| Priority | Fields |
|----------|--------|
| P0 | title, status, nextAction |
| P1 | owner, reporter, dueDate, urgency |
| P2 | description, taskType, priority |
| P3 | createdAt, updatedAt, source |
| P4 | checklist summary, files |
| P5 | taskId, external refs (admin) |

Display names resolved via `usersById` — never show bare USER_CODE as primary.

---

## 5. Inline execution

### Hook: `useInlineExecution`

| Option | Purpose |
|--------|---------|
| `onTaskUpdated` | Patch snapshot + detail |
| `onRefresh` | Soft workspace reload |
| `operatorId` | Audit actor |

### States

| State | Card class | UX |
|-------|------------|-----|
| Idle | — | Actions visible per capability |
| Pending | `task-card-pending-exec` | Disable repeat click |
| Success | — | Feedback + memory record |
| Error | — | `RuntimeFeedbackMessage` + retry |

### Action types (`QuickActionId`)

Examples: ACCEPT, COMPLETE, HANDOFF, MICRO_UPDATE, ESCALATE (gated).

Filtered by `filterQuickActionsByIdentity(allActions, runtimeUser)`.

---

## 6. Handoff & micro-update

| Flow | Components |
|------|------------|
| Handoff | `InlineHandoffStrip`, `HandoffChain` |
| Micro-update | `MicroUpdateStrip` |

Rules:
- Explicit target selection
- Confirm before API call
- Append-only display in chain — no edit/delete of history

---

## 7. Timeline

Read-only display of task updates.

| Property | Spec |
|----------|------|
| Order | Newest first (unless utility specifies otherwise) |
| Actor | Display name via directory |
| Empty | "Chưa có cập nhật" fallback |
| Source | TASK_UPDATE_LOG via API |

---

## 8. Files

`FileList` component — read-only list with download/open links per API permissions.

No upload in WebApp V3 — direct to AppSheet if upload needed.

---

## 9. Keyboard & focus

| Key | Action (when implemented) |
|-----|---------------------------|
| ESC | Close detail panel |
| j / k | Next/prev task in list |
| Enter | Open detail for selected |

Minimum V3 requirement: ESC closes panel.

---

## 10. Mobile bottom sheet

| Property | Value |
|----------|-------|
| Position | `fixed inset-x-0 bottom-0` |
| Max height | 70vh |
| z-index | 40 |
| Scroll | overflow-y-auto |
| Close | Đóng button |

Must not obscure RuntimeStatusBar permanently — sheet sits above content, status bar remains at viewport bottom.

---

## 11. AppSheet escape hatch

When `ExecutionMode` is `NAVIGATE` or `NOT_CONFIGURED`:

- Show official AppSheet link button in detail
- Label clearly: open in AppSheet for full edit
- `safeWriteEnabled=false` in session info (M09 pattern for GAS WebApp; analogous for local FE)

---

## 12. Detail + focus queue

When focus queue mode ON:
- Detail remains fully readable for focused task
- Switching task in panel updates URL and focused card
- Non-focused tasks dimmed but detail switch allowed via keyboard

---

## 13. Feedback integration

Per-task feedback via `usePerTaskFeedback()`:
- Success/error copy from `FEEDBACK_COPY`
- `successFeedback()` / `errorFeedback()` helpers
- TraceId surfaced on API errors

---

## 14. Anti-patterns

- Duplicating full task form in detail (AppSheet owns CRUD form)
- Showing raw JSON debug to operators by default
- Auto-opening detail on every filter change
- Full page navigation away from inbox for detail-only view
- Blocking list interaction when detail open on desktop

---

## 15. Acceptance criteria

| # | Criterion |
|---|-----------|
| 1 | Click card opens detail within 45s cache window without refetch |
| 2 | `/tasks/:id` deep link opens detail on load |
| 3 | ESC closes panel and clears selection |
| 4 | Viewer sees detail but no write actions |
| 5 | Owner/reporter show display names |
| 6 | Inline pending state prevents double submit |
| 7 | Mobile bottom sheet usable at 375px width |
| 8 | Unknown taskId shows error, not crash |

# 001 — Current Runtime Truth (AS-IS)

**Authority level:** RUNTIME — describes what runs today  
**Code root:** `apps/workboard/`  
**Last verified:** 2026-05-29 (routes + TasksPage contract)  
**Status:** ACTIVE in production/dev local FE

> **Cảnh báo:** Đây là hiện trạng. **Không** phải thiết kế cuối CBV_WORK_INBOX_V3.

---

## 1. Entry & routing (thực tế)

| Route | Component | Ghi chú |
|-------|-----------|---------|
| `/` | `OperationalHome` | Launchpad — **không** phải inbox |
| `/tasks` | `TasksPage` | **Work queue thực tế** |
| `/tasks/:taskId` | `TasksPage` | Task selected + detail panel |
| `/search` | `SearchPage` | Global search |
| `/finance`, `/hoso`, `/coordination`, … | Module pages | Ngoài inbox |
| `/m/:moduleSlug` | `ModuleRuntimeContainer` | Module runtime |

**Không tồn tại** trong `routes.tsx` hôm nay: `/inbox`, `/task/:id`, `/ho-so/:id`, `/admin/*`.

Source: `apps/workboard/src/app/routes.tsx`

---

## 2. Inbox URL state (thực tế)

| Query | Values | Default |
|-------|--------|---------|
| `filter` | `mine` \| `pending` \| `overdue` \| `approval` | `mine` |
| `group` | `cognition` \| `status` | **`cognition`** |

Ví dụ:

```text
/tasks?filter=mine&group=cognition
/tasks/TSK_xxx?filter=overdue&group=status
```

Source: `TasksPage.tsx`, `taskFilterKeys.ts`

---

## 3. Shell layout (thực tế)

```text
TopBar → (Sidebar | Main scroll + FocusStrip* | DetailPanel xl+) → RuntimeStatusBar
```

| Property | Value |
|----------|-------|
| Min width | `1366px` (`AppShell`) |
| Detail | Aside ≥xl; bottom sheet <xl |
| FocusStrip | Hiện **ngoài** `/tasks`; ẩn logic trên task route |

Source: `AppShell.tsx`, `FocusStrip.tsx`

---

## 4. Control surface (thực tế)

`TaskControlSurface` gồm:

- 4 filter tabs (Tiếng Việt): Việc của tôi, Chờ xử lý, Quá hạn, Chờ duyệt
- `GroupModeSelect`: **cognition** | status
- `QuickFocusFilters`: all, actionable, blocked, team, resume (session)
- **Focus queue toggle** (`focusQueueMode`) — dim cards, không phải single-task UI

**Không có** trên runtime hôm nay:

- Status summary cards (Quá hạn / Cần làm / …) kiểu V3
- Inbox groups Need Action / Waiting / Follow Up
- Advanced filter panel V3
- Bottom mobile nav V3

---

## 5. Task card & grouping (thực tế)

- List: `TaskGroupedList` / `deriveVisibleTaskRuntime`
- Grouping mặc định: **cognition-oriented buckets** (operator cognition), không phải V3 IA labels
- Card: compact scan row, signal borders, inline execution
- Display names: `usersById` / GS_10 identity layer

---

## 6. Focus (thực tế) — tên dễ nhầm

| Khái niệm runtime | Hành vi |
|-------------------|---------|
| `focusQueueMode` | Session toggle; **nhiều** card, dim non-focused |
| `quickFocus` | Chip filter; lưu working context |
| `focusedTaskId` | Card + URL `/tasks/:id` |

**Không** có V3 Focus Mode (1 task, ẩn filter/nav).

Source: `focusQueueMode.ts`, `010` trong archive baseline

---

## 7. API & data (thực tế)

- Envelope: `{ ok, data, warnings, errors, traceId }`
- Workspace snapshot: `getTaskWorkspaceSnapshot` (limit 100)
- Detail cache TTL: 45s
- Write: inline execution + API — manual-first

GAS WebApp legacy routes (`/workspace/workboard/tasks`) — **khác** local Vite app; xem RF_02 reports.

---

## 8. Design tokens (thực tế)

- `tailwind.config.ts`: `surface`, `operational.*`, `priority.*`
- Light operational theme: `html.theme-light`, `operational-runtime`
- **Không** map 1:1 YAML tokens V3 (`#2563EB` primary) — chưa migrate

---

## 9. Doc snapshot (historical)

Mô tả chi tiết runtime-era docs (đã archive):

```text
../_archive_runtime_baseline_20260529/
```

Dùng khi cần **mô tả hành vi cũ đã document** — vẫn thua **code** nếu lệch.

---

## 10. Khi nào dùng file này

| Tình huống | Dùng 001 |
|------------|----------|
| Debug production/dev | ✓ |
| Viết test against current app | ✓ |
| Hotfix không đổi IA | ✓ |
| Thiết kế màn hình V3 mới | ✗ → dùng 002 |
| Quyết định "đã xong V3" | ✗ → so 002 + 013 |

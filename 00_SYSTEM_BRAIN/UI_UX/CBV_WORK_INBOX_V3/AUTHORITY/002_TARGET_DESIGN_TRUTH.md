# 002 — Target Design Truth (TO-BE)

**Authority level:** TARGET — normative for future implementation  
**Pack:** `CBV_WORK_INBOX_V3` root specs `001`–`013`  
**Status:** APPROVED DESIGN INTENT (not yet fully implemented in code)

> **Cảnh báo:** Đây là **đích**. Code `apps/workboard` **chưa** đạt đủ các mục dưới đây.

---

## 1. Định vị sản phẩm

**CBV_WORK_INBOX_V3** = **Work Inbox** vận hành — **không** phải Task Management System.

Operator trả lời trong **2 giây**:

1. Tôi cần làm gì?
2. Việc nào quan trọng nhất?
3. Tôi bấm ở đâu?

Source: `../001_UI_PRINCIPLES.md`

---

## 2. Entry & routing (đích)

| Route | Mục đích |
|-------|----------|
| `/` → redirect `/inbox` | Inbox là cửa trước |
| `/inbox` | Work Inbox chính |
| `/task/:id` | Task detail |
| `/ho-so/:id`, `/finance/:id`, `/docs/:id`, `/invoice/:id` | Deep link module |
| `/search` | Global search phụ |
| `/admin/*` | Admin only |

Source: `../008_ROUTING_CONTRACT.md`, `../003_SCREEN_MAP.md`

**Migration:** alias `/tasks` → `/inbox` trong phase FE — không big-bang.

---

## 3. Information architecture (đích)

Top nav (≤5):

```text
📥 Inbox | 👥 Hồ sơ | 💰 Tài chính | 📚 Tài liệu | ⚙️ Điều hành
```

Inbox groups (operator language):

| Group | Ý nghĩa |
|-------|---------|
| Need Action | Làm ngay |
| Waiting | Chờ xử lý |
| Follow Up | Theo dõi |
| Completed | Hoàn thành gần đây (collapsed) |

Source: `../002_INFORMATION_ARCHITECTURE.md`

**Không** đưa **Cognition** làm grouping mặc định cho Operator.

---

## 4. Layout (đích)

- Desktop: Left nav | Inbox (status cards + tabs + groups) | Right panel (advanced filter — optional)
- Tablet: stacked; filter drawer
- Mobile: header + search + summary + groups + **bottom nav**

Source: `../004_LAYOUT_SPEC.md`, `../wireframes/`

---

## 5. Components (đích)

Contract card: `TaskCardModel` (`../005_COMPONENT_LIBRARY.md`)

Primary action label: **Mở xử lý**

Status chips: Quá hạn, Cần làm hôm nay, Chờ xử lý, Theo dõi, Hoàn thành

---

## 6. Focus Mode (đích) — khác runtime

| V3 Focus Mode | Runtime `focusQueueMode` |
|---------------|--------------------------|
| **1 task** full UI | Nhiều card, dim |
| Ẩn dashboard, filter, nav phụ | Chỉ compress control strip |
| Progress `1 / N` | Không có |
| Nút Việc trước / Việc tiếp | Keyboard/card nav only |

Source: `../010_FOCUS_MODE_SPEC.md`, `../wireframes/focus-mode.md`

---

## 7. Operator visibility (đích)

**Không hiển thị mặc định** cho Operator:

- Cognition grouping
- SLA kỹ thuật / runtime internals
- Test console, audit debug, queue admin

Source: `../001`, `../009`, `../013`

---

## 8. Design tokens (đích)

YAML palette trong `../006_DESIGN_TOKENS.md` (`primary #2563EB`, …).

Implementation phase: merge vào Tailwind — không để hex rải rác.

---

## 9. Acceptance (đích)

`../013_ACCEPTANCE_CRITERIA.md` — including:

- ≤5 tabs/filters chính
- ≤3 click mở task
- Focus Mode bắt buộc
- Mobile responsive
- `/inbox` default

---

## 10. Canonical spec files (TO-BE)

| File | Topic |
|------|-------|
| `../001_UI_PRINCIPLES.md` | Philosophy |
| `../002_INFORMATION_ARCHITECTURE.md` | IA |
| `../003_SCREEN_MAP.md` | Screens |
| `../004_LAYOUT_SPEC.md` | Layout |
| `../005_COMPONENT_LIBRARY.md` | Components + TaskCardModel |
| `../006_DESIGN_TOKENS.md` | Tokens |
| `../007_USER_FLOW.md` | Flows |
| `../008_ROUTING_CONTRACT.md` | Routes |
| `../009_ROLE_PERMISSION.md` | Roles |
| `../010_FOCUS_MODE_SPEC.md` | Focus |
| `../011_SEARCH_SPEC.md` | Search |
| `../012_TASK_DETAIL_SPEC.md` | Detail |
| `../013_ACCEPTANCE_CRITERIA.md` | QA |
| `../AI_IMPLEMENTATION_CONTRACT.md` | Agent rules |
| `../AI_AUTHORITY_ADDENDUM.md` | Authority binding |

---

## 11. Khi nào dùng file này

| Tình huống | Dùng 002 |
|------------|----------|
| Phase FE implementation | ✓ |
| UI review "đã đúng V3 chưa" | ✓ |
| UAT checklist | ✓ |
| Debug bug trên code hiện tại | ✗ → dùng 001 |
| Mô tả hành vi đang chạy cho operator hôm nay | ✗ → dùng 001 |

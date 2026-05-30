# CBV_WORK_INBOX_V3 — Frontend Implementation Roadmap

## Purpose

Implement the target Work Inbox UI without breaking current runtime.

This roadmap must be executed **phase by phase**.

**No big-bang rewrite.**

---

## Phase A — Route Alias & Shell

**Goal:**

- Add `/inbox`
- Keep `/tasks` as compatibility alias
- Redirect `/` to `/inbox`

**Acceptance:**

- `/inbox` loads
- `/tasks` still works
- No runtime data loss

---

## Phase B — Data Adapter

**Goal:**

- Implement adapter from current task API/snapshot to `InboxItem`
- Do not render raw task fields directly

**Acceptance:**

- All visible task cards use `TaskCardModel`
- Missing fields have safe fallback

---

## Phase C — Inbox Groups

**Goal:**

- Render groups:
  - Need Action
  - Waiting
  - Follow Up
  - Completed

**Acceptance:**

- Operator sees urgent work first
- Cognition is not primary grouping

---

## Phase D — Task Card V3

**Goal:**

- Build new TaskCard UI
- Show title, due label, assignee, status chip, primary action

**Acceptance:**

- One primary action visible
- Card readable on desktop/tablet/mobile

---

## Phase E — Focus Mode

**Goal:**

- Show exactly one task
- Provide complete/forward/pause/prev/next

**Acceptance:**

- No multi-card display in Focus Mode
- User can exit back to Inbox

---

## Phase F — Deep Links

**Goal:**

- Task detail links to HO_SO, FINANCE, DOCS, INVOICE

**Acceptance:**

- Related module links visible when data exists
- No broken hardcoded routes

---

## Phase G — Search

**Goal:**

- Global search across Task, HO_SO, FINANCE, DOCS, INVOICE

**Acceptance:**

- Search results grouped by module
- Results deep-link correctly

---

## Phase H — Responsive Layout

**Goal:**

- Mobile and tablet friendly

**Acceptance:**

- Mobile view has bottom nav
- Main actions remain visible
- No horizontal overflow

---

## Phase I — Role Guard

**Goal:**

- Hide admin/runtime panels from Operator/User

**Acceptance:**

- Admin sees admin route
- Operator/User do not see runtime internals

---

## Phase J — UAT & Report

**Goal:**

- Run acceptance checklist
- Generate append-only report

**Acceptance:**

- `100_TARGET_DESIGN/013_ACCEPTANCE_CRITERIA.md` checked
- Report saved in `00_SYSTEM_BRAIN/000_REPORTS/`

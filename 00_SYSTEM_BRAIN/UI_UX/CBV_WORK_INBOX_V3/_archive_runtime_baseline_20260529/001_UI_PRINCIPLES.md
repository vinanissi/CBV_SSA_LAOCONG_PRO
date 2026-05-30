# CBV_WORK_INBOX_V3 — UI Principles

**Version:** V3.0  
**Date:** 2026-05-29  
**Standard:** CBV Operational Ecosystem Standard V1  
**Runtime target:** `apps/workboard` — route `/tasks` (Work Inbox / Task Workspace)  
**Status:** Design contract — implementation must not break existing runtime

---

## 1. Purpose

CBV_WORK_INBOX_V3 defines the operator-facing **Work Inbox** — the primary surface where staff scan, filter, focus, and execute tasks. V3 consolidates lessons from PHASE_RF_02 (workboard core), PHASE_TASK_GS_01–10 (operational runtime hardening), and GS_09 light operational theme into a single FE contract.

This pack is **normative for FE developers, Cursor agents, and AI implementers**. It documents what exists and what may evolve — not a greenfield redesign.

---

## 2. Non-negotiable ecosystem principles

| Principle | Work Inbox application |
|-----------|------------------------|
| **Runtime-first** | UI reads from GAS/API envelope (`ok`, `data`, `warnings`, `errors`, `traceId`). Never invent task state client-side. Degraded/stale data → keep view, show warning strip. |
| **Memory-first** | Session memory (`sessionStorage`, working context, recent tasks, execution memory, focus queue mode) persists operator rhythm across navigation. Append-only observation logs — no destructive client history. |
| **Append-only** | Task updates go through API write paths; UI patches snapshot optimistically only after confirmed write. Audit/timeline is read-only display. |
| **Manual-first → auto-later** | Inline actions require explicit operator click. No auto-assign, auto-resolve, auto-escalate, or silent state mutation. |
| **No runtime break** | AppShell, `/tasks` route, DetailPanel, RuntimeStatusBar, and existing filter keys must remain functional. Changes are additive or compressive — not structural rewrites. |
| **No scope creep** | Do not redesign finance, hoso, coordination, or module launchpad in this contract. Cross-link only. |

---

## 3. Operator cognition principles (3-second rule)

Derived from PHASE_80D and GS_05/09H:

1. **Scan in 3 seconds** — Operator must identify *what needs action* from the queue header + first visible card row without opening detail.
2. **One dominant signal per card** — Escalation, overdue, blocked compete by priority model (L1→L4). Secondary signals collapse to tooltip or detail panel.
3. **Execution-first hierarchy** — Primary action (accept, complete, handoff) outranks passive metadata on every card and in detail panel.
4. **Progressive disclosure** — Default compact card line; expanded on focus/hover/focus-queue-mode only.
5. **Stable scan rhythm** — Fixed min card height (`task-card-scan-row`), consistent group headers, no layout shift on filter change.

---

## 4. Visual principles (light operational theme)

| Rule | Spec |
|------|------|
| Theme default | Light operational (`html.theme-light`, `operational-runtime`) |
| Base text | 16px / `text-base`, slate-900 body |
| Contrast | WCAG AA minimum for operational text; signals use semantic colors (red/amber/slate/orange) not decorative gradients |
| Density | Information-dense but not cluttered — max 3 metadata parts on default card line |
| Motion | Transitions ≤ 150ms; no auto-scroll hijacking; filter feedback via `aria-live` |
| Dark mode | Theme toggle exists; light is operational default. Do not optimize exclusively for dark. |

---

## 5. Display identity principles

| Rule | Source |
|------|--------|
| Show **display name** from USER_DIRECTORY | Never raw USER_CODE as primary label on cards |
| OWNER / REPORTER resolve via `usersById` snapshot | GS_09D/10 identity layer |
| Fallback chain | `displayName` → `fullName` → `userCode` → em dash |
| Role badge | TopBar only; not repeated per card |

---

## 6. Channel split (WebApp vs AppSheet)

| Surface | Work Inbox role |
|---------|-----------------|
| **WebApp (`apps/workboard`)** | Primary desktop inbox: filter, group, focus queue, inline execution, detail panel, keyboard nav |
| **AppSheet** | Mobile/high-frequency CRUD, official write forms when inline exec locked |
| **GAS/Sheet** | Source of truth for TASK_MAIN, TASK_UPDATE_LOG, USER_DIRECTORY |

WebApp is **read-first with controlled inline writes** where API permits. Full schema edits remain AppSheet/manual.

---

## 7. What V3 explicitly does NOT include

- Virtual Columns, AppSheet Bot, production triggers
- TASK_MAIN schema changes (SHARED_WITH / IS_PRIVATE baseline preserved)
- Auto-assignment, auto-escalation, AI queue intelligence
- Mobile-first redesign (tablet/mobile wireframes document constraints only)
- Replacement of RuntimeStatusBar or module launchpad

---

## 8. Document map

| File | Scope |
|------|-------|
| `002_INFORMATION_ARCHITECTURE.md` | Data and nav hierarchy |
| `003_SCREEN_MAP.md` | Screen inventory |
| `004_LAYOUT_SPEC.md` | Spatial layout |
| `005_COMPONENT_LIBRARY.md` | Reusable components |
| `006_DESIGN_TOKENS.md` | Colors, type, spacing |
| `007_USER_FLOW.md` | Operator journeys |
| `008_ROUTING_CONTRACT.md` | URL contract |
| `009_ROLE_PERMISSION.md` | Access and actions |
| `010_FOCUS_MODE_SPEC.md` | Focus queue + quick focus |
| `011_SEARCH_SPEC.md` | Global search |
| `012_TASK_DETAIL_SPEC.md` | Detail panel + inline exec |
| `013_ACCEPTANCE_CRITERIA.md` | QA gates |
| `AI_IMPLEMENTATION_CONTRACT.md` | Agent rules |
| `wireframes/` | ASCII layout references |

---

## 9. Change control

- Append-only: new versions get suffix (`_v2`, `_20260529`) — never overwrite prior contract files.
- Implementation changes that affect markers/routes require Test Console evidence (CBV_TCS_V1).
- Pilot tag reference: workboard production MVP (Milestone 06).

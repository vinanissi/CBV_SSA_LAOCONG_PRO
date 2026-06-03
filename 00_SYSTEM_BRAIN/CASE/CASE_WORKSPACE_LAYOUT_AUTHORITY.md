# Case Workspace Layout Authority

**Version:** 1.0  
**Status:** ACCEPTED (layout spec — **not implemented** in phase 01)  
**Phase:** `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY`  
**ADR:** `ADR_CASE_CENTRIC_RUNTIME.md`  
**Extends:** `OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md` (strip → workspace evolution)

---

## 1. Purpose

Define **authoritative layout** for Case Workspace so phase 03 UI does not regress to Task Detail as the operational root.

---

## 2. Non-negotiables

| Rule | Detail |
|------|--------|
| Case is UX root | When `VITE_CASE_WORKSPACE_ENABLED` (future), Case Header leads |
| Work Inbox front door | `/inbox` list unchanged; selecting row opens Case Workspace in focus |
| No Task Detail root | `TaskDetailContent` must not be sole context when workspace flag on |
| Strip compatibility | `WorkInboxCaseContextStrip` ⊆ Case Header region |
| Read-first panels | Timeline/Documents may be read-only until write ADR |

---

## 3. Target layout

```text
┌──────────────────────────────────────────────────────────────────┐
│ ACTION BAR (complete, assign, module links, pause, forward)       │
├──────────────────────────────────────────────────────────────────┤
│ CASE HEADER — type, title, WorkflowState, Responsible, caseKey*  │
│ CASE CONTEXT — relations, anchors, module chips, diagnostics      │
│ AI SUMMARY — optional; read-only; empty if unavailable            │
├────────────────────────────┬─────────────────────────────────────┤
│ CHECKLIST                  │ TIMELINE (append-only feed)         │
│ (Case steps, promote task)  │ (incl. COMMENT entry type)         │
├────────────────────────────┼─────────────────────────────────────┤
│ TASKS (under Case)         │ DOCUMENTS                          │
│ inbox-style sub-list       │ Case + task-linked evidence        │
├────────────────────────────┴─────────────────────────────────────┤
│ HANDOFF — continuation summary (Case-level)                       │
└──────────────────────────────────────────────────────────────────┘
* caseKey never dominant — diagnostics/debug only
```

### Right panel (when viewport uses split)

| Zone | Content |
|------|---------|
| Primary column | Checklist + Tasks |
| Secondary column | Timeline + Documents |
| Full width bottom | Handoff |

Mobile: stack order = Header → Context → Checklist → Tasks → Timeline → Documents → Handoff → Action Bar (sticky bottom optional).

---

## 4. Region definitions

| Region | Authority |
|--------|-----------|
| **Case Header** | Title, caseType badge, WorkflowState, Responsible, priority signals |
| **Case Context** | Discovery source, related HO_SO/Finance links, relation chips |
| **AI Summary** | Optional narrative; **not** authoritative; hide if missing |
| **Checklist** | Case steps; promote-to-task action explicit |
| **Tasks** | Filtered tasks sharing `caseKey`; current task highlighted |
| **Documents** | Federated evidence list |
| **Timeline** | Federated append-only entries |
| **Handoff** | Structured Case continuation |
| **Action Bar** | Task mutations + module navigation — **does not** replace Case context |

---

## 5. Evolution from current UI

| AS-IS | TO-BE |
|-------|-------|
| `FocusTaskWorkspace` task-first | Case Header replaces compact task-only header |
| `WorkInboxCaseContextStrip` | Merged into Header + Context |
| Right tabs task-scoped | Tabs become regions above |
| `TaskDetailContent` on `/tasks` | Legacy route; deprecate when workspace 100% |

---

## 6. What must NOT be redesigned (without ADR)

- Work Inbox group taxonomy (V3 authority pack)  
- `/inbox` route registration  
- TASK_MAIN mutation semantics  
- AppSheet operator paths  
- Security / `SHARED_WITH` visibility  

---

## 7. Feature flags

| Flag | Phase | Effect |
|------|-------|--------|
| `VITE_OCMS_CASE_STRIP_ENABLED` | Now | Strip only (subset of Header+Context) |
| `VITE_CASE_WORKSPACE_ENABLED` | Phase 03+ | Full layout (reserved) |

Flags are **independent** — strip may ship before full workspace.

---

## 8. Empty and error states

| State | Behavior |
|-------|----------|
| Case discovery failed | Header shows task title + diagnostic banner |
| No checklist | Empty checklist with honest copy |
| No documents | Empty state — no placeholder files |
| No Responsible | “Chưa gán phụ trách” — no fake name |

---

*Layout authority for IMPLEMENT phase 03. Wireframes may be added in UI pack without changing regions.*

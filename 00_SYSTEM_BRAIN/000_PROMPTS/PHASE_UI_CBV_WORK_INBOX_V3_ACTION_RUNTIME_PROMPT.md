READ FIRST (MANDATORY)

`00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`

CBV-RCLA v1.1 — `00_SYSTEM_BRAIN/002_DECISIONS/ADR_RUNTIME_CONTEXT_LOADING_V1_1_ADDENDUM.md`

`00_SYSTEM_BRAIN/000_REPORTS/PHASE_CBV_RCLA_V1_1_HARDENING_REPORT.md`

`00_SYSTEM_BRAIN/001_HANDOFF/PHASE_CBV_RCLA_V1_1_HARDENING_HANDOFF.md`

`900_AUTHORITY/000_DESIGN_AUTHORITY.md`

`900_AUTHORITY/001_AUTHORITY_INDEX.md`

CBV Operational Ecosystem Standard V1

---

# PHASE_UI_CBV_WORK_INBOX_V3_ACTION_RUNTIME

**Action Runtime Activation** — Work Inbox V3 Focus

## Objective

Chuyển Work Inbox V3 Focus từ **UI Runtime** sang **Operational Action Runtime**: mọi nút có handler, state transition, timeline, audit, toast.

## RCLA

- Runtime Context Registry (`workInboxRuntimeContextRegistry`)
- Không hardcode routing / lookup ngoài registry

## Actions (summary)

| Action | UI | API / effect |
|--------|-----|----------------|
| Start | ▶ Bắt đầu xử lý | `IN_PROGRESS`, `TASK_STARTED`, `ACTION_START_PROCESSING` |
| Pause | ⏸ Tạm dừng + dialog | `ON_HOLD`/`WAITING`, `TASK_PAUSED`, `ACTION_PAUSE_TASK` |
| Handoff | ⇄ Chuyển giao + dialog | `assignTask`, `TASK_HANDOFF`, `ACTION_HANDOFF` |
| More menu | ⋯ | Copy link live; others toast chuẩn bị |
| Quick actions | Right panel | Call / message / appointment / guide / template |
| Nav | Trước / Sau / Xem tiếp | Load task + audit navigate |

## Deliverables

- FE action runtime under `apps/workboard/src/modules/task/inbox/actionRuntime/`
- `runWorkInboxActionRuntimeChecks()`
- REPORT / HANDOFF / TEST_EVIDENCE

## Acceptance

**GO:** no dead buttons, timeline + audit append, navigation loads task, tests GO, build pass.

**GO_WITH_WARNINGS:** guide/template placeholder OK.

**FAIL:** silent click, no audit/timeline, broken nav.

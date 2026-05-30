# CBV_WORK_INBOX_V3 — Design Authority

## Status

**Accepted Authority**

## This Document Overrides

If there is conflict between older design docs and this authority pack, **this document wins**.

## Final Product Direction

CBV_WORK_INBOX_V3 is a **Work Inbox** for operators.

It is **not**:

- a raw task table
- a cognition dashboard
- a developer issue tracker
- an admin runtime console

## Final Default Route

```text
/inbox
```

## Legacy Compatibility

```text
/tasks
```

`/tasks` may remain as alias or legacy route during migration.

But `/tasks` must **not** be the long-term default operator entry.

## Required Top-Level Navigation

```text
📥 Inbox
👥 Hồ sơ
💰 Tài chính
📚 Tài liệu
⚙️ Điều hành
```

**Maximum:** 5 top-level items.

## Required Inbox Groups

| Group | Label |
|-------|-------|
| Need Action | 🔥 Cần làm ngay |
| Waiting | 🟡 Chờ xử lý |
| Follow Up | 👀 Theo dõi |
| Completed | ✅ Hoàn thành |

## Required User Mental Model

**User thinks:**

> Hôm nay tôi cần làm gì?

**User must not be forced to think:**

- Task thuộc cognition nào?
- Runtime state nào?
- SLA technical bucket nào?

## Required Focus Mode

Focus Mode must show **exactly one task** at a time.

**Required actions:**

- Hoàn thành
- Chuyển tiếp
- Tạm dừng
- Việc trước
- Việc tiếp

## Required Deep Links

Task detail must deep-link to:

- HO_SO
- FINANCE
- DOCS
- INVOICE

## Operator UI Must Hide By Default

- Cognition
- Runtime internals
- Queue internals
- Test Console
- Debug health
- Technical SLA internals

## Admin UI May Show

- Queue
- Health
- Audit
- Test Console
- Runtime state
- System config

**Only** with admin role.

## AI/Cursor Rules

Cursor and AI agents **must not**:

- Revert `/inbox` to `/tasks` as default
- Promote cognition grouping to primary UI
- Add more than 5 top-level nav items
- Remove Focus Mode
- Remove deep-link capability
- Mix admin/runtime panels into operator UI
- Implement big-bang rewrite without phase roadmap
- Skip report generation

## Ecosystem alignment

CBV Operational Ecosystem Standard V1: runtime-first, memory-first, append-only, manual-first → auto-later.

See ADR: `00_SYSTEM_BRAIN/002_DECISIONS/ADR_001_CBV_WORK_INBOX_V3_WORK_INBOX_DECISION.md`

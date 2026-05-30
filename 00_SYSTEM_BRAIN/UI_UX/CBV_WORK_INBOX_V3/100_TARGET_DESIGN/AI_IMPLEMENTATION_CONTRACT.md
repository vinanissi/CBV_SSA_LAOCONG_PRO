# AI Implementation Contract

**Contract:** CBV_WORK_INBOX_V3

---

## Scope

Implement or refactor UI toward **CBV_WORK_INBOX_V3**.

This pack is **design-only** until `PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION` is explicitly run.

---

## Mandatory Rules

1. Không redesign Information Architecture nếu không có **decision note**.
2. Không đổi top-level navigation (📥 Inbox, 👥 Hồ sơ, 💰 Tài chính, 📚 Tài liệu, ⚙️ Điều hành).
3. Không đổi terminology chính (Need Action, Waiting, Focus Mode, Mở xử lý).
4. `/inbox` là **default screen**.
5. **Focus Mode** là bắt buộc (single-task surface).
6. **Deep-link module** là bắt buộc.
7. **Mobile responsive** là bắt buộc.
8. **Role-based visibility** là bắt buộc.
9. Operator không thấy runtime internals mặc định.
10. Advanced filter chỉ là optional/secondary.
11. **Cognition không được hiển thị mặc định** với Operator.
12. Không dùng automation-first.
13. Không phá runtime hiện hữu — dùng migration aliases (`/tasks` → `/inbox`).

---

## Required Execution Flow

1. Read existing repo/runtime/context
2. Analyze architecture boundaries
3. Save incoming prompt (append-only `000_PROMPTS/`)
4. Design impact + decision note if IA/route changes
5. Implement **minimally invasive** changes
6. Self-test (`npm run build`, acceptance checklist)
7. Runtime verification (GAS/Test Console when applicable)
8. Generate append-only report (`000_REPORTS/`)
9. Generate AI handoff summary (`001_HANDOFF/`)

---

## Required Output

Sau khi thực hiện implementation phase, tạo report tại:

```text
00_SYSTEM_BRAIN/000_REPORTS/
```

Tên gợi ý:

```text
PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION_REPORT.md
```

Report phải có:

- Changed files
- Created folders
- Design decisions
- Risks
- Acceptance check
- Next step

---

## Read order (agents)

1. `001_UI_PRINCIPLES.md`
2. `002_INFORMATION_ARCHITECTURE.md`
3. `008_ROUTING_CONTRACT.md`
4. `005_COMPONENT_LIBRARY.md` + `006_DESIGN_TOKENS.md`
5. `010_FOCUS_MODE_SPEC.md` + `012_TASK_DETAIL_SPEC.md`
6. `013_ACCEPTANCE_CRITERIA.md`

---

## Archive reference

Runtime-aligned contract (2026-05-29 earlier pass):

```text
00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/_archive_runtime_baseline_20260529/
```

Use when mapping existing `apps/workboard` behavior during migration.

---

## Hard NEVER list

- Auto-assign / auto-resolve / auto-escalate
- Cognition group default for Operator
- Overwrite files in `_archive_runtime_baseline_*`
- Overwrite historical `000_REPORTS` / `001_HANDOFF`
- Commit without user request

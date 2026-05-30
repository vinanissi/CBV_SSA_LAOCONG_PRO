# 004 — AI Read Order (Mandatory)

**Audience:** Cursor agents, Copilot, any automated implementer  
**Phase:** All CBV_WORK_INBOX_V3 work until authority pack superseded by `_v2`

---

## STOP — đọc trước khi sửa bất kỳ file nào

1. `AUTHORITY/006_COMMON_MISREAD_GUARDRAILS.md` (2 phút)
2. `AUTHORITY/000_AUTHORITY_INDEX.md`
3. Xác định task thuộc **AS-IS** hay **TO-BE** (xem bảng dưới)

---

## Read order — governance / planning (không code)

```text
1. AUTHORITY/000_AUTHORITY_INDEX.md
2. AUTHORITY/003_SOURCE_OF_TRUTH_MATRIX.md
3. AUTHORITY/001_CURRENT_RUNTIME_TRUTH.md
4. AUTHORITY/002_TARGET_DESIGN_TRUTH.md
5. AUTHORITY/005_MIGRATION_BOUNDARY.md
6. ../README.md
```

---

## Read order — hotfix / bugfix trên app hiện tại (AS-IS)

```text
1. AUTHORITY/006_COMMON_MISREAD_GUARDRAILS.md
2. AUTHORITY/001_CURRENT_RUNTIME_TRUTH.md
3. apps/workboard/src/modules/task/TasksPage.tsx (and related)
4. AUTHORITY/003 — confirm không đổi IA
5. ../AI_IMPLEMENTATION_CONTRACT.md — only "Hard NEVER" + AS-IS rules
```

**Không đọc** `002` để quyết định hành vi fix trừ khi user yêu cầu implement V3.

---

## Read order — V3 frontend implementation (TO-BE)

```text
1. AUTHORITY/006_COMMON_MISREAD_GUARDRAILS.md
2. AUTHORITY/002_TARGET_DESIGN_TRUTH.md
3. AUTHORITY/005_MIGRATION_BOUNDARY.md
4. ../001_UI_PRINCIPLES.md
5. ../008_ROUTING_CONTRACT.md
6. ../002_INFORMATION_ARCHITECTURE.md
7. ../004_LAYOUT_SPEC.md
8. ../005_COMPONENT_LIBRARY.md
9. ../010_FOCUS_MODE_SPEC.md
10. ../012_TASK_DETAIL_SPEC.md
11. ../013_ACCEPTANCE_CRITERIA.md
12. ../AI_IMPLEMENTATION_CONTRACT.md
13. ../AI_AUTHORITY_ADDENDUM.md
14. AUTHORITY/001 — chỉ để map migration
```

---

## Read order — UI copy / tokens only

```text
TARGET: ../006_DESIGN_TOKENS.md, ../001
AS-IS colors: apps/workboard/tailwind.config.ts
```

---

## Task classification (bắt buộc ghi trong đầu response)

| Class | Mô tả | Được đổi route/IA? |
|-------|-------|---------------------|
| `AS-IS-FIX` | Sửa lỗi runtime hiện tại | Không |
| `TO-BE-IMPL` | Triển khai V3 | Có (theo 008 + migration) |
| `DOC-ONLY` | Chỉ tài liệu | Không code |
| `AUTHORITY` | Governance pack | Không code |

Phase hiện tại user yêu cầu: **`DOC-ONLY` / `AUTHORITY`**

---

## Files agents must NOT treat as target

```text
_archive_runtime_baseline_20260529/**     # historical
000_REPORTS/CBV_WORK_INBOX_*_PACK_REPORT  # pass 1 history (runtime-era narrative)
```

---

## Files agents MUST treat as target (when TO-BE-IMPL)

```text
001_UI_PRINCIPLES.md … 013_ACCEPTANCE_CRITERIA.md
wireframes/**
AUTHORITY/002_TARGET_DESIGN_TRUTH.md
```

---

## Output checklist (mỗi lần hoàn thành task)

- [ ] Đã khai báo AS-IS vs TO-BE
- [ ] Không nhầm cognition = final design
- [ ] Không nhầm `/tasks` = final route
- [ ] Không sửa code nếu phase DOC-ONLY
- [ ] Report append-only nếu phase-sized

# 003 — Source of Truth Matrix

**Purpose:** Resolve conflicts — AI/FE must not guess.

---

## 1. Priority ladder

```text
Level 0 — LIVE CODE (behavior AS-IS)
Level 1 — AUTHORITY/001_CURRENT_RUNTIME_TRUTH.md
Level 2 — apps/workboard contracts (api/contracts.ts, routes.tsx)
Level 3 — AUTHORITY/002 + root 001–013 (TARGET)
Level 4 — _archive_runtime_baseline_20260529/ (historical doc snapshot)
Level 5 — 000_REPORTS/* (phase history, non-normative unless cited)
```

**Rule:** Higher level wins for **current behavior**.  
**Rule:** Level 3 wins for **planned changes** after explicit phase + decision note.

---

## 2. Matrix by question type

| Question | Source of truth | Không dùng |
|----------|-----------------|------------|
| Route nào đang mount? | `routes.tsx` → 001 | 008 target alone |
| Filter mặc định hôm nay? | `TasksPage` + 001 | 002 |
| Route đích sau V3? | 002 + `008` | 001 alone |
| Inbox grouping đích? | 002 + `002_IA` | `group=cognition` |
| Focus behavior hôm nay? | 001 + `focusQueueMode.ts` | `010` target alone |
| Focus behavior đích? | `010` + 002 | 001 |
| TASK visibility / PRIVATE? | GAS + `.cursor/rules` TASK_MAIN PRO | FE invention |
| API envelope shape? | `api/contracts.ts` | Wireframes |
| Màu primary đích V3? | `006` target | tailwind hiện tại (until merge) |
| Agent được sửa code? | Phase charter | Authority pack (this phase: NO) |

---

## 3. Matrix by file path

| Path | AS-IS | TO-BE | Ghi chú |
|------|-------|-------|---------|
| `apps/workboard/src/app/routes.tsx` | ✓ authoritative | | Chưa có /inbox |
| `UI_UX/.../001–013` (root) | | ✓ authoritative | Target specs |
| `UI_UX/.../AUTHORITY/001` | ✓ doc mirror | | Sync khi đổi routes lớn |
| `UI_UX/.../AUTHORITY/002` | | ✓ doc | |
| `UI_UX/.../_archive_runtime_baseline_*` | snapshot | | **Không** = target |
| `000_REPORTS/CBV_WORK_INBOX_V3_DESIGN_CONTRACT_PACK_REPORT.md` | history | | Mô tả pass 1 (runtime doc) |
| `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_DESIGN_CONTRACT_REPORT.md` | history | | Mô tả pass 2 (target doc) |
| `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_AUTHORITY_PACK_REPORT.md` | governance | | **Điều phối** hai pass |

---

## 4. Hai report cũ — cách hiểu

| Report | Mô tả đúng | Sai lầm thường gặp |
|--------|------------|-------------------|
| `CBV_WORK_INBOX_V3_DESIGN_CONTRACT_PACK_REPORT.md` | Pass 1: document **runtime** `/tasks` | Coi là V3 final |
| `PHASE_UI_CBV_WORK_INBOX_V3_DESIGN_CONTRACT_REPORT.md` | Pass 2: tạo **target** + archive pass 1 | Coi là đã implement |

**Authority pack** thống nhất: pass 1 = AS-IS era docs → archive; pass 2 = TO-BE specs ở root.

---

## 5. Decision note trigger

Cần **decision note** (`00_SYSTEM_BRAIN/002_DECISIONS/`) khi:

- Đổi default `/` redirect
- Bỏ `group=cognition` mặc định
- Thay `focusQueueMode` bằng V3 Focus Mode
- Đổi tên filter keys (`mine` → …) breaking URL
- Merge design tokens breaking theme

---

## 6. Ecosystem sources (ngoài pack)

| Topic | Source |
|-------|--------|
| TASK_MAIN SHARED_WITH / IS_PRIVATE | `.cursor/rules/task-main-pro-production-baseline.mdc` |
| User display | USER_DIRECTORY / GS_10 identity |
| UI contract sheet | `docs/ui-contract/CBV_UNIFIED_UI_CONTRACT.md` |
| Operational standard | CBV Operational Ecosystem Standard V1 (prompts/reports) |

Pack V3 **không** thay thế các nguồn trên — bổ sung lớp Work Inbox FE.

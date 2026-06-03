# Task Header Context Enrichment — Authority

**Status:** LOCKED (PHASE_TASK_HEADER_CONTEXT_ENRICHMENT_V1)  
**Scope:** Work Inbox focus task header — operator context block (no CASE, no DB migration)

---

## Header model

```text
Tên việc (title)
↓
MÔ TẢ / THÔNG TIN THÊM / KẾT QUẢ CẦN ĐẠT / TÓM TẮT AI (when data exists)
↓
TRẠNG THÁI / THỜI HẠN / SLA / ƯU TIÊN / PHỤ TRÁCH (semantic summary)
↓
CHECKLIST (below header — not in header)
```

---

## Config

| Config | File |
|--------|------|
| `TASK_HEADER_CONTEXT_SCHEMA` | `taskHeaderContextEnrichmentSchemas.ts` |
| Resolver | `resolveTaskHeaderContext.ts` |
| Field bag | `resolveTaskChecklistFieldValues.ts` |
| Renderer | `TaskHeaderContextBlock.tsx`, `CompactTaskHeader.tsx` |

---

## Mapping (UI-only)

| Key | Source |
|-----|--------|
| task_description | `TaskDetail.description` |
| task_context | `pendingAction`, `blockReason` (task detail / runtime) |
| task_expected_result | `TaskDetail.nextStep` |
| task_ai_summary | `aiSummaryText` prop (inbox summary field) |

Do **not** use task title as description/context/AI summary. Empty optional sections hidden.

---

## Preserved

Semantic status model (prior phase), checklist runtime, right-panel IA tabs, footer sync.

---

## Out of scope

CASE runtime, DB migration, AI generation engine.

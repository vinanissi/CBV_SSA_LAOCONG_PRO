# Phase Charter — CHECKLIST_01 Smart Checklist Foundation

## PHASE

`PHASE_CHECKLIST_01_SMART_CHECKLIST`

## LOAD

```text
READ FIRST:
00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
```

| Category | Path |
|----------|------|
| Case authority | `00_SYSTEM_BRAIN/CASE/CASE_RUNTIME_AUTHORITY_V1.md` |
| Checklist contract | `00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_SMART_ITEM_CONTRACT.md` |
| Dependency | Work Inbox checklist runtime (existing) |

## REPORTS

| Role | Path |
|------|------|
| Output report | `000_REPORTS/PHASE_CHECKLIST_01_SMART_CHECKLIST_REPORT.md` |
| Handoff | `001_HANDOFF/PHASE_CHECKLIST_01_SMART_CHECKLIST_HANDOFF.md` |
| Test evidence | `005_TEST_EVIDENCE/PHASE_CHECKLIST_01_SMART_CHECKLIST_TEST_EVIDENCE.md` |

## ADR

| Action | Path |
|--------|------|
| Required? | NO (foundation implements existing Task/Case boundaries) |

## MODE

`IMPLEMENT`

## OUTPUT

Smart Checklist UI foundation + adapter + governance docs. No persistence expansion.

## SUCCESS CRITERIA

- Legacy checklist rows render as Smart Checklist items
- Metadata placeholders visible (0 phản hồi / tài liệu / liên kết)
- No unauthorized tables or workflow engine
- Static checks GO or GO_WITH_WARNINGS

## FORBIDDEN NEXT (in same run)

`PHASE_CHECKLIST_02` … `06`, `PHASE_CASE_REFACTOR_05_PERSISTENCE_DECISION`

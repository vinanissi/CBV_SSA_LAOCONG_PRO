# PHASE_TASK_RELATED_ENTITY_INPUT_MODEL_V1 — Report

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-02

---

## Summary

Normalized **SĐT** / **Biển số** as related entity types (`PHONE`, `LICENSE_PLATE`) in create form, payload, GAS persistence, and task display.

---

## Field usage (before)

| Location | Issue |
|----------|-------|
| `WorkInboxCreateTaskDialog` | Standalone SĐT / Biển số fields |
| `wiOpBuildCreateDescription_` | Appended phone/plate to DESCRIPTION |
| `taskDbCreateTask_` | No RELATED_ENTITY columns on create |

---

## Deliverables

| Artifact | Path |
|----------|------|
| Schemas | `taskRelatedEntityInputSchemas.ts` |
| Resolver | `resolveTaskRelatedEntity.ts` |
| Create UI | `WorkInboxCreateTaskDialog.tsx` |
| Payload | `buildTaskCreationPayload.ts` |
| Display | `resolveTaskChecklistFieldValues.ts`, header/panel schemas |
| GAS | `48_WorkInboxCreateTask.js`, `40_TaskDbService.js` |

---

## Mapping

| UI | DB |
|----|-----|
| PHONE + value | RELATED_ENTITY_TYPE=PHONE, RELATED_ENTITY_ID |
| LICENSE_PLATE + value | LICENSE_PLATE / ID |
| DOSSIER | HO_SO |
| MEMBER | XA_VIEN |

---

## Warnings

- Legacy description tags still parsed for display.
- Browser smoke not run.

---

## Next

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`

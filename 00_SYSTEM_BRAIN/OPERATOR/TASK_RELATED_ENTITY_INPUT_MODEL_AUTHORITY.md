# Task Related Entity Input Model — Authority

**Status:** LOCKED (PHASE_TASK_RELATED_ENTITY_INPUT_MODEL_V1)  
**Scope:** Work Inbox create form + task display — no CASE, no new entity table

---

## Model

`SĐT` and `Biển số` are **related entity types**, not core task fields.

```text
RELATED_ENTITY_TYPE  ← catalog key (PHONE, LICENSE_PLATE, …)
RELATED_ENTITY_ID    ← operator-entered value
```

---

## Create form

Section **Đối tượng liên quan**:

- Loại đối tượng (select from `TASK_RELATED_ENTITY_TYPE_CATALOG`)
- Giá trị (required when type selected; type required when value entered)

No standalone top-level **SĐT** / **Biển số** inputs.

---

## Display

Friendly format: `SĐT: 0909123456` via `task_related_entity_display` in header context and Chi tiết panel.

Raw column names not shown to operators.

---

## Legacy

- Old `relatedPhone` / `relatedPlate` request fields mapped server-side (deprecated).
- Description tags `[SĐT: …]` / `[Biển số: …]` parsed for display only.

---

## Config

| Schema | File |
|--------|------|
| `TASK_RELATED_ENTITY_TYPE_CATALOG` | `taskRelatedEntityInputSchemas.ts` |
| Resolver | `resolveTaskRelatedEntity.ts` |

---

## Out of scope

CASE runtime, CRM, vehicle registry, AI extraction, DB migration.

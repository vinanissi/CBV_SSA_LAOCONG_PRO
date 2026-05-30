# Authority Index

## Read Order For Cursor / AI

1. `900_AUTHORITY/000_DESIGN_AUTHORITY.md`
2. `README.md`
3. `100_TARGET_DESIGN/001_UI_PRINCIPLES.md`
4. `100_TARGET_DESIGN/002_INFORMATION_ARCHITECTURE.md`
5. `100_TARGET_DESIGN/014_DATA_CONTRACT.md`
6. `200_IMPLEMENTATION/015_FRONTEND_IMPLEMENTATION_ROADMAP.md`
7. `100_TARGET_DESIGN/013_ACCEPTANCE_CRITERIA.md`
8. `100_TARGET_DESIGN/AI_IMPLEMENTATION_CONTRACT.md`
9. `000_CURRENT_RUNTIME/` — **only** for compatibility reference

## Important

`000_CURRENT_RUNTIME/` is **not** the product target.

It is only used to avoid breaking current runtime during migration.

## Misread guardrails (v1 — still valid)

Also read: `006_COMMON_MISREAD_GUARDRAILS.md` (in this folder, copied from legacy `AUTHORITY/`)

## Source matrix (v1)

`003_SOURCE_OF_TRUTH_MATRIX.md` — update priority: **this index + 000_DESIGN_AUTHORITY** supersede matrix section 1 when conflict.

## Task classification

| Class | Folder |
|-------|--------|
| AS-IS fix | `000_CURRENT_RUNTIME/` + code |
| TO-BE impl | `100_TARGET_DESIGN/` + `200_IMPLEMENTATION/` |
| Governance | `900_AUTHORITY/` |

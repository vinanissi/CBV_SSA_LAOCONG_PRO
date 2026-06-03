# PHASE_OCMS_01C_CASE_RELATION_MODEL — Handoff

**Status:** DOC-ONLY complete  
**Date:** 2026-05-31  
**Branch:** `phase/ocms-foundation-v1`  
**Verdict:** **GO**

---

## Delivered

- **Case Relation Model** — 12 target types, 10 roles, cardinality, per-type hints
- **ADR:** `ADR_OCMS_CASE_RELATION_ADDENDUM.md`
- Full OCMS frame includes **RELATION(S)**
- **phase_tmp:** prior files in `archive_002/`; 13 current files at root

---

## Key files

| Role | Path |
|------|------|
| Relation model | `OCMS/OCMS_CASE_RELATION_MODEL.md` |
| ADR | `002_DECISIONS/ADR_OCMS_CASE_RELATION_ADDENDUM.md` |
| Type hints | `OCMS/OCMS_CASE_TYPE_CATALOG.md` §8 |

---

## Four-layer rule

1. **Case Key** — identity  
2. **Case Relation** — entity link + role  
3. **Module Projection** — read display  
4. **Attachment** — Memory evidence  

---

## OCMS_02 contract sketch

```json
{
  "caseKey": "HO_SO:HS-2026-001",
  "caseType": "HO_SO",
  "lifecycle": "ACTIVE",
  "result": null,
  "relations": [
    { "targetType": "HO_SO", "targetId": "HS-2026-001", "role": "PRIMARY" },
    { "targetType": "XA_VIEN", "targetId": "XV-0001", "role": "TARGET" }
  ],
  "projections": { "hoSo": { } }
}
```

---

## Next phase

`PHASE_OCMS_02_READ_MODEL_CONTRACT` recommended — foundation doc set (00–01C) complete for read contract.

---

*Handoff — OCMS Case Relation.*

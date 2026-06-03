# PHASE_OCMS_02C_CASE_DISCOVERY_AUTHORITY — Handoff

**Status:** DOC-ONLY complete  
**Date:** 2026-05-31  
**Verdict:** **GO**

---

## Delivered

- `ADR_OCMS_CASE_DISCOVERY_AUTHORITY.md`
- `OCMS_CASE_DISCOVERY_AUTHORITY.md`
- Contract §14 discovery binding
- Roadmap + registry append

---

## OCMS_03 discovery checklist

1. [ ] Discovery runs on Focus + `taskId` only  
2. [ ] Precedence: MANUAL → HO_SO → FINANCE → ALERT → TASK  
3. [ ] One primary `CaseReadModel`; `discoveryCandidates[]` when multi-anchor  
4. [ ] `source: MIXED` when ≥2 anchors populated  
5. [ ] No silent fallback — warnings + missingProjections  
6. [ ] LOW/UNKNOWN → MINIMAL/HIDDEN per visibility ADR  
7. [ ] Flag off → skip strip surfacing  

---

## Docs

| Topic | Path |
|-------|------|
| Discovery | `OCMS/OCMS_CASE_DISCOVERY_AUTHORITY.md` |
| Contract | `OCMS/OCMS_READ_MODEL_CONTRACT.md` §14 |
| Mapping | `OCMS/OCMS_READ_MODEL_MAPPING.md` |
| Visibility | `OCMS/OCMS_CASE_STRIP_VISIBILITY_RULES.md` |

---

## Next

`PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP`

---

*Handoff bundle: `phase_tmp.zip`*

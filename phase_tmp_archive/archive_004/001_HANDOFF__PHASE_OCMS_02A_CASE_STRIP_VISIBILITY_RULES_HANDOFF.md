# PHASE_OCMS_02A_CASE_STRIP_VISIBILITY_RULES — Handoff

**Status:** DOC-ONLY complete  
**Date:** 2026-05-31  
**Verdict:** **GO**

---

## Delivered

- `ADR_OCMS_CASE_STRIP_VISIBILITY_RULES.md`
- `OCMS_CASE_STRIP_VISIBILITY_RULES.md` — full visibility spec
- Contract §12 strip usage
- Flag: **`OCMS_CASE_STRIP_ENABLED`**

---

## OCMS_03 checklist

1. [ ] Read ADR + visibility spec + contract §12  
2. [ ] Implement `resolveStripVisibility(CaseReadModel)`  
3. [ ] `WorkInboxCaseContextStrip` below task header  
4. [ ] Respect HIDDEN/MINIMAL/STANDARD/EXPANDED  
5. [ ] No fake data — use fallback warnings  
6. [ ] Private finance gate  
7. [ ] Flag off = no strip  

---

## Key paths

| Doc | Path |
|-----|------|
| Visibility | `OCMS/OCMS_CASE_STRIP_VISIBILITY_RULES.md` |
| Contract | `OCMS/OCMS_READ_MODEL_CONTRACT.md` |
| Examples | `OCMS/OCMS_READ_MODEL_EXAMPLES.md` |

---

## Next

`PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP`

---

*Handoff.*

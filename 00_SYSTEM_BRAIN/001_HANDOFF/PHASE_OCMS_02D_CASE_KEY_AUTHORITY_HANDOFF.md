# PHASE_OCMS_02D_CASE_KEY_AUTHORITY — Handoff

**Status:** DOC-ONLY complete  
**Date:** 2026-05-31  
**Verdict:** **GO**

---

## Delivered

- `ADR_OCMS_CASE_KEY_AUTHORITY.md`
- `OCMS_CASE_KEY_AUTHORITY.md`
- Contract §4.1 + discovery §16 bindings
- Domain model §7 update
- Roadmap + registry append

---

## OCMS_03 Case Key checklist

1. [ ] Compose key from namespace table after discovery winner  
2. [ ] Default derive; honor valid MANUAL override  
3. [ ] Never persist key; never show raw key in strip  
4. [ ] `CASE_KEY_*` diagnostics on failure / fallback  
5. [ ] Stable key within Focus session if anchors unchanged  

---

## Key patterns (P0)

| Source | caseKey |
|--------|---------|
| TASK_ANCHORED | `OPERATIONS:TASK:{taskId}` |
| HO_SO_ANCHORED | `HO_SO:{hoSoId}` |
| FINANCE_ANCHORED | `FINANCE:TX:{txId}` |
| ALERT_ANCHORED | `ALERT:{alertId}` |

---

## Docs

| Topic | Path |
|-------|------|
| Case Key | `OCMS/OCMS_CASE_KEY_AUTHORITY.md` |
| Discovery | `OCMS/OCMS_CASE_DISCOVERY_AUTHORITY.md` |
| Contract | `OCMS/OCMS_READ_MODEL_CONTRACT.md` §4.1 |

---

## Note on OCMS_01

`PHASE_OCMS_01_CASE_KEY_CONVENTION` deferred — **identity rules authoritative in 02D** for OCMS_03+.

---

## Next

`PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP`

---

*End of handoff.*

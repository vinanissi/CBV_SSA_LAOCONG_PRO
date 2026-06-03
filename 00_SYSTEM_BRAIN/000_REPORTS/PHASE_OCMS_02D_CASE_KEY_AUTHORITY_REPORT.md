# PHASE_OCMS_02D_CASE_KEY_AUTHORITY — Report

**Date:** 2026-05-31  
**Phase:** `PHASE_OCMS_02D_CASE_KEY_AUTHORITY`  
**Mode:** DOC-ONLY  
**Branch:** `phase/ocms-foundation-v1`  
**Status:** **GO**

---

## 1. Summary

Chốt **Case Key Authority** — định nghĩa identity logic cho OCMS: format namespaced, derivation vs manual, assignment rules, shared keys, diagnostics, ownership. Supersedes deferred `OCMS_01` cho mục đích implementation. Không persistence, API, runtime.

**RUNTIME_STATE:** `NOT_WIRED`

---

## 2. Phase objective — answers

| Question | Answer |
|----------|--------|
| What is a Case Key? | Logical read-session id on `CaseReadModel.caseKey` — namespaced string, not persisted |
| Purpose? | Correlate federated read data; session stability; future persistence eval |
| Human / machine? | Machine-canonical key; human via title/labels — raw key hidden from strip |
| When assigned? | At derive after discovery winner, RESOLVED/PARTIAL outcomes |
| When not assigned? | NONE outcome, unreadable sources, invalid manual, canView false |
| vs TASK/HO_SO/FINANCE/ALERT/MANUAL/MIXED | Pattern table §6; MIXED uses winner key only |
| Can be derived? | Yes — default; manual override exceptional |
| Can change? | Re-derive on task/anchor change — not operator-editable in V0 |
| Multiple records share key? | Yes — e.g. many tasks → same `HO_SO:{id}` |
| Unresolved diagnostics? | `CASE_KEY_*` warnings, confidence UNKNOWN/LOW, NONE outcome |
| Who owns generation? | Case Key Authority + discovery winner + derive (no id service) |

---

## 3. Files created / updated

### Created

| Path |
|------|
| `002_DECISIONS/ADR_OCMS_CASE_KEY_AUTHORITY.md` |
| `OCMS/OCMS_CASE_KEY_AUTHORITY.md` |
| `000_REPORTS/PHASE_OCMS_02D_CASE_KEY_AUTHORITY_REPORT.md` |
| `001_HANDOFF/PHASE_OCMS_02D_CASE_KEY_AUTHORITY_HANDOFF.md` |
| `005_TEST_EVIDENCE/PHASE_OCMS_02D_CASE_KEY_AUTHORITY_TEST_EVIDENCE.md` |

### Updated (append-only / binding cross-ref)

| Path |
|------|
| `OCMS/OCMS_READ_MODEL_CONTRACT.md` (§4.1) |
| `OCMS/OCMS_CASE_DISCOVERY_AUTHORITY.md` (§16) |
| `OCMS/OCMS_DOMAIN_MODEL.md` (§7 Case Key row) |
| `OCMS/OCMS_ROADMAP.md` |
| `006_PHASES/PHASE_REGISTRY.md` |

---

## 4. Boundaries respected

| Boundary | Status |
|----------|--------|
| No CASE_MAIN / schema / API / service | ✓ |
| No apps/workers/GAS | ✓ |
| No identifier / migration design | ✓ |

---

## 5. Success criteria

| Criterion | Status |
|-----------|--------|
| Identity model unambiguous | ✓ |
| Discovery can reference key authority | ✓ |
| OCMS_03 can derive without inventing rules | ✓ |
| No persistence/runtime deps | ✓ |

---

## 6. Recommended next phase

`PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP`

---

*End of report.*

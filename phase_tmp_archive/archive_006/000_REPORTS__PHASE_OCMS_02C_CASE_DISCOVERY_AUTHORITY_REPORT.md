# PHASE_OCMS_02C_CASE_DISCOVERY_AUTHORITY — Report

**Date:** 2026-05-31  
**Phase:** `PHASE_OCMS_02C_CASE_DISCOVERY_AUTHORITY`  
**Mode:** DOC-ONLY  
**Branch:** `phase/ocms-foundation-v1`  
**Status:** **GO**

---

## 1. Summary

Chốt **Case Discovery Authority** cho OCMS: entry point (Focus + taskId), anchor scan, winner precedence (MANUAL → HO_SO → FINANCE → ALERT → TASK), single primary model per view, MIXED labeling, diagnostics, low-confidence behavior. Không code, không persistence, không CASE_MAIN.

**RUNTIME_STATE:** `NOT_WIRED`

---

## 2. Phase objective — answers

| Question | Answer (authority) |
|----------|-------------------|
| Case context discovered from where? | Focus task + TASK_MAIN / operational bundle anchor fields + module read runtimes |
| When should Case Context exist? | Focus open, task readable, `canView`, outcome ≠ NONE |
| When must it not exist? | Flag off, `canView` false, no task, NONE outcome, unreadable task without valid manual key |
| Source resolution? | Scan all anchors; winner by precedence §6.2; `MIXED` when ≥2 populated |
| One task → multiple contexts? | Multiple **candidates**; one **primary** surfaced; rest in `discoveryCandidates[]` |
| Which source wins? | MANUAL_CASE_KEY > HO_SO > FINANCE > ALERT > TASK |
| Incomplete discovery diagnostics? | confidence, warnings, missingRelations/Projections, staleSources, discoveryCandidates |
| Low confidence? | MINIMAL/HIDDEN strip; warnings; no fake module data |

---

## 3. Files created / updated

### Created

| Path |
|------|
| `002_DECISIONS/ADR_OCMS_CASE_DISCOVERY_AUTHORITY.md` |
| `OCMS/OCMS_CASE_DISCOVERY_AUTHORITY.md` |
| `000_REPORTS/PHASE_OCMS_02C_CASE_DISCOVERY_AUTHORITY_REPORT.md` |
| `001_HANDOFF/PHASE_OCMS_02C_CASE_DISCOVERY_AUTHORITY_HANDOFF.md` |
| `005_TEST_EVIDENCE/PHASE_OCMS_02C_CASE_DISCOVERY_AUTHORITY_TEST_EVIDENCE.md` |
| `006_PHASES/PHASE_OCMS_02C_CASE_DISCOVERY_AUTHORITY.md` |

### Updated (append-only)

| Path |
|------|
| `OCMS/OCMS_READ_MODEL_CONTRACT.md` (§14) |
| `OCMS/OCMS_ROADMAP.md` (v0.9) |
| `006_PHASES/PHASE_REGISTRY.md` |

---

## 4. Boundaries respected

| Boundary | Status |
|----------|--------|
| No CASE_MAIN / tables | ✓ |
| No apps/workers/GAS changes | ✓ |
| No OCMS_03 implementation | ✓ |
| No fake data / silent fallback | ✓ documented |

---

## 5. Recommended next phase

`PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP` — implement derive + strip behind `OCMS_CASE_STRIP_ENABLED`.

---

*End of report.*

# PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP

**Mode:** IMPLEMENT  
**Branch:** `phase/ocms-foundation-v1`  
**RCLA:** CBV-RCLA v1.1

---

## LOAD

- `000_RUNTIME_ENTRYPOINT.md`
- `ADR_OCMS_FOUNDATION.md` (+ CRM, type, lifecycle, relation addenda)
- `ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md`
- `ADR_OCMS_CASE_STRIP_VISIBILITY_RULES.md`
- `ADR_OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md`
- `ADR_OCMS_CASE_DISCOVERY_AUTHORITY.md`
- `ADR_OCMS_CASE_KEY_AUTHORITY.md`
- `OCMS_READ_MODEL_CONTRACT.md`
- `OCMS_CASE_STRIP_VISIBILITY_RULES.md`
- `OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md`
- `OCMS_CASE_DISCOVERY_AUTHORITY.md`
- `OCMS_CASE_KEY_AUTHORITY.md`

---

## OBJECTIVE

First OCMS runtime surface: **Case Context Strip** in Work Inbox Focus — read-only projection behind `OCMS_CASE_STRIP_ENABLED`.

---

## REPORTS

- `000_REPORTS/PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP_REPORT.md`

---

## HANDOFF

- `001_HANDOFF/PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP_HANDOFF.md`

---

## ADR

No new ADR required — implements existing authorities.

---

## OUTPUT

- Runtime module `apps/workboard/src/modules/ocms/`
- Focus integration `FocusTaskWorkspace.tsx`
- Static checks `ocmsCaseContextStripChecks.ts`
- Test evidence + bundle

---

## SUCCESS CRITERIA

- [x] Strip renders from derived read model when flag ON
- [x] Visibility + layout + discovery + case key authorities respected
- [x] Flag OFF → zero DOM delta
- [x] No persistence / API / schema
- [x] Right Panel unchanged

---

## STATUS

**GO_WITH_WARNINGS** (2026-05-31)

---

*End of phase charter.*

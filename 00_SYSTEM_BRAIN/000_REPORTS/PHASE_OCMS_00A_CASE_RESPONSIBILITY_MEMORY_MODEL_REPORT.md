# PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL — Report

**Date:** 2026-05-31  
**Phase:** `PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL`  
**Mode:** DOC-ONLY  
**Branch:** `phase/ocms-foundation-v1`  
**Status:** **GO**

---

## 1. Summary

Loaded **CBV-RCLA v1.1**, audited OCMS foundation artifacts from `PHASE_OCMS_00_DESIGN_AUTHORITY`, and upgraded the design baseline with the **CRM strategic core** (**C**ase + **R**esponsibility + **M**emory — not Customer Relationship Management).

CBV is now explicitly positioned as an **Operational Case Management System** where operational matters carry structured accountability and federated memory — without changing Work Inbox V3, schema, API, UI, or runtime code.

**RUNTIME_STATE:** `NOT_WIRED` (per `003_RUNTIME_STATE.md`).

---

## 2. Audit of prior OCMS documents

| Document | Finding | Action |
|----------|---------|--------|
| `ADR_OCMS_FOUNDATION.md` | Solid runtime boundaries; Case/Episode thin on responsibility & memory | **Kept** — extended via addendum only |
| `OCMS_DOMAIN_MODEL.md` | Work Item + Episode model; owner ≈ assignee | **Kept V0.1** — append §10 CRM link |
| `OCMS_ROADMAP.md` | Jump from 00 → 01 without CRM gate | **Appended** OCMS_00A row + history |
| `PHASE_OCMS_00_DESIGN_AUTHORITY_REPORT.md` | GO; no CRM triad | **Unchanged** — superseded in scope by 00A report |

---

## 3. Files created / updated

### Created

| Path |
|------|
| `00_SYSTEM_BRAIN/002_DECISIONS/ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md` |
| `00_SYSTEM_BRAIN/OCMS/OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md` |
| `00_SYSTEM_BRAIN/000_REPORTS/PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL_REPORT.md` |
| `00_SYSTEM_BRAIN/001_HANDOFF/PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL_HANDOFF.md` |
| `00_SYSTEM_BRAIN/005_TEST_EVIDENCE/PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL_TEST_EVIDENCE.md` |
| `00_SYSTEM_BRAIN/006_PHASES/PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL.md` |

### Updated (append-only)

| Path | Change |
|------|--------|
| `00_SYSTEM_BRAIN/OCMS/OCMS_ROADMAP.md` | v0.2; OCMS_00A row; phase history section |
| `00_SYSTEM_BRAIN/OCMS/OCMS_DOMAIN_MODEL.md` | §10 CRM cross-reference |
| `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md` | Registry row + ADR index |

---

## 4. Key design decisions

1. **CRM triad** is binding for future OCMS phases: Case, Responsibility, Memory (+ Work/Steps, Result in model doc).
2. **Case ≠ Task** — task is often one step; case is operational matter (việc / hồ sơ / vấn đề).
3. **Responsibility ≠ assigned_to** — five roles: Responsible, Support, Reviewer, Escalation, Watcher.
4. **Memory ≠ timeline** — eight memory types including checklist activity, attachments, handoffs, evidence.
5. **ADR addendum only** — `ADR_OCMS_FOUNDATION.md` not modified.
6. **Work Inbox V3** — `/inbox` unchanged; no rebrand.

---

## 5. CRM model (reference)

```text
CASE
├── RESPONSIBILITY   (Responsible, Support, Reviewer, Escalation, Watcher)
├── WORK / STEPS     (TaskWorkItem, checklist, alerts, module actions)
├── MEMORY           (Timeline, Checklist Activity, Attachment, Comment,
│                     Update, Decision, Handoff, Evidence)
└── RESULT           (derived: Open, Done, Deferred, Escalated, …)
```

Full spec: `00_SYSTEM_BRAIN/OCMS/OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md`.

---

## 6. Non-goals (verified)

| Non-goal | Status |
|----------|--------|
| `CASE_MAIN` | Not created |
| Schema change | None |
| API change | None |
| UI / route change | None |
| Work Inbox V3 rebrand | None |
| Runtime code | None |
| Override `ADR_OCMS_FOUNDATION` | Addendum only |

---

## 7. Risks

| Risk | Mitigation |
|------|------------|
| "CRM" confused with Customer Relationship Management | Terminology notice in ADR + model doc |
| Role model ahead of persistence | OCMS_02+ read-first; OCMS_05 eval gate |
| Memory federation complexity | Phased types; checklist/attachments already shipping |
| Case vs Task operator confusion | Inbox stays task-queue; case strip secondary (OCMS_03+) |

---

## 8. Next recommended phase

**`PHASE_OCMS_01_CASE_KEY_CONVENTION`** (DOC-ONLY) — Case Key rules under CRM Case pillar, after operator review of CRM model.

---

## 9. Verification result

| # | Check | Result |
|---|-------|--------|
| 1 | No changes in `apps/` | **PASS** |
| 2 | No changes in `workers/` | **PASS** |
| 3 | No changes in `gas-runtime-api/` | **PASS** |
| 4 | No schema changes | **PASS** |
| 5 | ADR addendum does not override foundation ADR | **PASS** |
| 6 | Roadmap append-only (OCMS_00 row retained) | **PASS** |
| 7 | Domain model V0.1 retained + §10 link | **PASS** |
| 8 | CRM links to `OCMS_DOMAIN_MODEL.md` | **PASS** |
| 9 | No `CASE_MAIN` | **PASS** |
| 10 | No Work Inbox rebrand / `/inbox` change | **PASS** |
| 11 | Git diff limited to `00_SYSTEM_BRAIN` | **PASS** (see test evidence) |

---

## 10. Exit status

**GO** — CRM model chốt; no code/runtime/schema impact; roadmap updated; CBV OCMS positioning strengthened.

---

*Append-only report.*

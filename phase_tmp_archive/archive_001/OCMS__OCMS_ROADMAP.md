# OCMS Roadmap

**Version:** 0.6  
**Branch:** `phase/ocms-foundation-v1`  
**Status:** Planning (foundation + read contract complete for OCMS_03)  
**ADR:** `ADR_OCMS_FOUNDATION.md`, `ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md`, `ADR_OCMS_CASE_TYPE_RESULT_ADDENDUM.md`, `ADR_OCMS_CASE_LIFECYCLE_ADDENDUM.md`, `ADR_OCMS_CASE_RELATION_ADDENDUM.md`, `ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md`

---

## Principles

1. **Work Inbox V3 first** — no phase may regress inbox/focus/checklist/attachments work already in flight.
2. **Manual-first → auto-later** — prove operator flows before automation.
3. **Read before write** — case context appears as read model before any Case persistence.
4. **One phase = one charter** — register in `PHASE_REGISTRY.md` before execution.
5. **Schema changes** only with manifest + audit + explicit ADR.

---

## Phase map (proposed)

| Phase | Mode (suggested) | Goal | Schema | UI |
|-------|------------------|------|--------|-----|
| **OCMS_00** `PHASE_OCMS_00_DESIGN_AUTHORITY` | DOC-ONLY | ADR + domain model + roadmap | None | None |
| **OCMS_00A** `PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL` | DOC-ONLY | CRM triad: Case + Responsibility + Memory | None | None |
| **OCMS_01** `PHASE_OCMS_01_CASE_KEY_CONVENTION` | DOC-ONLY | Case Key rules, examples, mapping from TASK/HO_SO | None | None |
| **OCMS_01A** `PHASE_OCMS_01A_CASE_TYPE_AND_RESULT_MODEL` | DOC-ONLY | Case Type catalog + Result model | None | None |
| **OCMS_01B** `PHASE_OCMS_01B_CASE_LIFECYCLE_MODEL` | DOC-ONLY | Case Lifecycle model (≠ task status, ≠ result) | None | None |
| **OCMS_01C** `PHASE_OCMS_01C_CASE_RELATION_MODEL` | DOC-ONLY | Case Relation model (entity links, roles) | None | None |
| **OCMS_02** `PHASE_OCMS_02_READ_MODEL_CONTRACT` | DOC-ONLY | **CaseReadModel** contract + mapping + examples | None | Spec only |
| **OCMS_03** `PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP` | IMPLEMENT | Read-only case context in Focus (behind flag) | None | Minimal strip |
| **OCMS_04** `PHASE_OCMS_04_FEDERATED_TIMELINE_READ` | IMPLEMENT | Merge TASK_UPDATE_LOG + module logs in UI | None | Read-only viewer |
| **OCMS_05** `PHASE_OCMS_05_CASE_REGISTRY_EVAL` | AUDIT | Whether persisted Case table is justified | Eval only | None |
| **OCMS_06+** | TBD | Persisted Case, write model, automation | ADR required | TBD |

Phases **00A, 01, 01A, 01B, 01C, 02** can run as DOC-ONLY in parallel with Work Inbox runtime phases.

**Sequencing note:** `OCMS_01A` may run before `OCMS_01` (Case Key not yet defined). Case Key remains a **logical dependency** for implementation after `OCMS_02`. Recommended doc order: `01` → `01A` → `02`, or `01A` → `01` → `02` if operator prioritizes type/result vocabulary.

---

## Dependency graph

```text
PHASE_OCMS_00 (this foundation)
    │
    ├─▶ OCMS_01 Case Key Convention
    │         │
    │         └─▶ OCMS_02 Read Model Contract
    │                   │
    │                   └─▶ OCMS_03 Focus Case Context Strip
    │                             │
    │                             └─▶ OCMS_04 Federated Timeline
    │                                       │
    │                                       └─▶ OCMS_05 Registry Eval
    │                                                 │
    │                                                 └─▶ OCMS_06+ Persistence (ADR)
    │
    └── (parallel track) Work Inbox V3 runtime phases — no merge unless charter says so
```

**Hard dependencies (ecosystem):**

- Task writes: ratify / implement `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH` cutover before case writes reference tasks.
- Alerts: `ADR_HOME_ALERT_RUNTIME_BINDING` wired in target env before AlertWorkItem in case view.

---

## Work Inbox V3 — explicit non-interference

| Work Inbox area | OCMS stance |
|-----------------|-------------|
| `/inbox`, groups, Focus | No change in OCMS_00–02 |
| Checklist / attachments runtime | Continue on inbox branch; OCMS_03+ only **adds** optional context strip |
| Performance / GAS load order | Independent; do not block inbox fixes |

---

## Module registry (future)

When OCMS gains a UI authority pack:

1. Create `00_SYSTEM_BRAIN/UI_UX/CBV_OCMS/900_AUTHORITY/` (or `00_SYSTEM_BRAIN/OCMS/900_AUTHORITY/`).
2. Append Tier 4 section in `MODULE_AUTHORITY_REGISTRY.md`.
3. Do **not** override Work Inbox V3 for inbox IA conflicts.

---

## Success metrics (per phase, template)

| Metric | OCMS_00 |
|--------|---------|
| ADR accepted | Yes |
| Domain model versioned | V0.1 |
| Roadmap registered | This file |
| Production code diff | **None** |
| Work Inbox regression | **N/A** (no code) |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Case vs Task confusion in UI | Keep inbox labels; case strip secondary |
| Premature `CASE_MAIN` sheet | OCMS_05 audit gate |
| Dual task runtime divergence | GS_01 cutover before case mutations |
| Scope creep into redesign | Charter + MODE enforcement |

---

## Operator decision points

Before **OCMS_03** (first UI code):

1. Approve Case Key convention from OCMS_01.
2. Confirm Case context strip placement in Focus (module authority review).
3. Update `003_RUNTIME_STATE.md` when staging/prod paths are known.

---

## Phase history — OCMS_00A (2026-05-31)

| Metric | OCMS_00A |
|--------|----------|
| CRM model published | `OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md` |
| ADR addendum | `ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md` |
| Production code diff | **None** |
| Work Inbox regression | **N/A** |

**Dependency update:** `OCMS_01` should read CRM model before Case Key convention.

---

## Phase history — OCMS_01A (2026-05-31)

| Metric | OCMS_01A |
|--------|----------|
| Case Type catalog | `OCMS_CASE_TYPE_CATALOG.md` (10 types) |
| Result model | `OCMS_RESULT_MODEL.md` |
| ADR addendum | `ADR_OCMS_CASE_TYPE_RESULT_ADDENDUM.md` |
| Production code diff | **None** |
| Work Inbox regression | **N/A** |

**Sequencing:** Placed after OCMS_01 in roadmap table; may execute before OCMS_01 (DOC-ONLY). Case Key required before read-model **implementation**.

---

## Phase history — OCMS_01B (2026-05-31)

| Metric | OCMS_01B |
|--------|----------|
| Lifecycle model | `OCMS_CASE_LIFECYCLE_MODEL.md` (10 states) |
| ADR addendum | `ADR_OCMS_CASE_LIFECYCLE_ADDENDUM.md` |
| Production code diff | **None** |
| Work Inbox regression | **N/A** |

**Dependency:** `OCMS_02` read model should include `lifecycle` field separate from `result` and task status.

---

## Phase history — OCMS_01C (2026-05-31)

| Metric | OCMS_01C |
|--------|----------|
| Relation model | `OCMS_CASE_RELATION_MODEL.md` (12 types, 10 roles) |
| ADR addendum | `ADR_OCMS_CASE_RELATION_ADDENDUM.md` |
| Production code diff | **None** |
| Work Inbox regression | **N/A** |

**Dependency:** `OCMS_02` read model should include `relations[]` separate from projections and attachments.

---

## Phase history — OCMS_02 (2026-05-31)

| Metric | OCMS_02 |
|--------|---------|
| Read contract | `OCMS_READ_MODEL_CONTRACT.md` |
| Mapping | `OCMS_READ_MODEL_MAPPING.md` |
| Examples | `OCMS_READ_MODEL_EXAMPLES.md` (P0 ×3) |
| ADR addendum | `ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md` |
| Production code diff | **None** |
| Work Inbox regression | **N/A** |

**Ready for:** `PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP` — implement read derive behind feature flag.

---

*Append-only roadmap. Add rows; do not delete prior phase history.*

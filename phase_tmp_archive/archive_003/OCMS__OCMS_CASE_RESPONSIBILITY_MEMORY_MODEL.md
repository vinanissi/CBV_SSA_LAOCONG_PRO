# OCMS Case + Responsibility + Memory Model (CRM)

**Version:** 0.1  
**Status:** Design authority (conceptual extension)  
**Phase:** `PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL`  
**Branch:** `phase/ocms-foundation-v1`  
**ADR:** `ADR_OCMS_FOUNDATION.md` + `ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md`  
**Sibling:** `OCMS_DOMAIN_MODEL.md` (V0.1 — unchanged baseline)

---

## 1. Purpose

Define the **CRM strategic core** for CBV OCMS:

- **C**ase — operational matter to handle  
- **R**esponsibility — who owns, supports, reviews, escalates, watches  
- **M**emory — what was done, said, decided, attached, handed off, proven  

**CRM ≠ Customer Relationship Management.** Internal abbreviation only.

This document **extends** `OCMS_DOMAIN_MODEL.md`; it does not replace Work Item, Module Projection, or Episode definitions there.

---

## 2. Core model

```text
CASE
├── RESPONSIBILITY   (roles + actors)
├── WORK / STEPS     (execution units)
├── MEMORY           (durable record types)
└── RESULT           (outcome / terminal state)
```

| Pillar | Question answered |
|--------|-------------------|
| **Case** | *Việc / hồ sơ / vấn đề vận hành này là gì?* |
| **Responsibility** | *Ai chịu trách nhiệm cuối, ai hỗ trợ, ai duyệt, ai nhận escalation?* |
| **Work / Steps** | *Cần làm gì, theo thứ tự nào?* |
| **Memory** | *Đã xảy ra gì, quyết định gì, bằng chứng nào?* |
| **Result** | *Kết quả cuối là gì?* |

---

## 3. Entity definitions

### 3.1 Case

| Attribute | V0A rule |
|-----------|----------|
| **Definition** | Operational matter: việc, hồ sơ-linked problem, finance/doc issue, or cross-module coordination need |
| **Identity** | Logical; **Case Key** deferred to `PHASE_OCMS_01_CASE_KEY_CONVENTION` |
| **Scope** | May span multiple Work Items (`OCMS_DOMAIN_MODEL.md` §3.2) |
| **≠ Task** | One task may be only one step inside a Case; one Case may have zero tasks (alert-only) or many tasks |
| **Persistence** | None in V0A — no `CASE_MAIN` |

**Link to domain model:** Case in CRM = Case (logical) in `OCMS_DOMAIN_MODEL.md` §3.1, enriched with Responsibility + Memory pillars.

### 3.2 Responsibility

Structured accountability for a Case (or sub-scope Work Item).

| Attribute | V0A rule |
|-----------|----------|
| **Scope** | Per Case; may narrow to Work Item |
| **Cardinality** | Multiple roles; multiple actors per role allowed only if future ADR defines |
| **AS-IS mapping** | `OWNER_ID` → often Responsible; `ASSIGNEE_ID` → often Support — **mapping hints only** |

### 3.3 Work / Steps

Executable units inside a Case.

| Unit | AS-IS anchor |
|------|--------------|
| **TaskWorkItem** | `TASK_MAIN` + Work Inbox / Focus |
| **Checklist step** | `TASK_CHECKLIST` (Work Inbox runtime) |
| **Alert action** | `HOME_ALERT` claim/resolve |
| **Module action** | Plugin quick actions (future) |

**Link to domain model:** Work / Steps ⊃ Work Item (`OCMS_DOMAIN_MODEL.md` §3.2).

### 3.4 Memory

Append-oriented or versioned operational record attached to Case or Work Item.

See §5 for memory types. **Memory ≠ Timeline alone.**

**Link to domain model:** Memory ⊃ Episode (`OCMS_DOMAIN_MODEL.md` §3.4) plus non-timeline types.

### 3.5 Result

Terminal or milestone outcome for Case or Work Item.

| Result kind | Examples |
|-------------|----------|
| **Completed** | Task complete; checklist done; alert resolved |
| **Deferred** | Waiting group; paused |
| **Rejected / Returned** | Reviewer send-back |
| **Escalated** | Escalation role engaged |
| **Open** | Default inferred state |

V0A: Result is **derived** from Work Item + Memory — not stored in Case table.

---

## 4. Responsibility roles

| Role | Purpose | Operator question |
|------|---------|-------------------|
| **Responsible** | Ultimate accountability for case outcome | *Ai chịu trách nhiệm cuối cùng?* |
| **Support** | Executes tasks/steps under direction | *Ai đang làm thực tế?* |
| **Reviewer** | Validates, approves, signs off | *Ai duyệt / kiểm tra?* |
| **Escalation** | Receives blockers, SLA breach, dispute | *Ai nhận escalation?* |
| **Watcher** | Informed; optional visibility | *Ai cần theo dõi?* |

### 4.1 Responsibility ≠ assigned_to

| Field (TASK_MAIN) | CRM role (hint) | Gap |
|-------------------|-----------------|-----|
| `OWNER_ID` | Often **Responsible** | No Reviewer/Escalation/Watcher |
| `ASSIGNEE_ID` / assign | Often **Support** | One person ≠ full team model |
| `REPORTER_ID` | Sometimes **Watcher** or initiator | Not standardized in CRM V0A |
| `SHARED_WITH` | Visibility list | Not role semantics |

Future phases may bind roles to directory IDs without new schema (read model) before persisted role table.

---

## 5. Memory types

| Type | Description | AS-IS / near-term source |
|------|-------------|---------------------------|
| **Timeline** | Status/assign/system events in order | `TASK_UPDATE_LOG`, `TASK_TIMELINE` (legacy read), module logs |
| **Checklist Activity** | Item create/toggle/delete/done | `TASK_CHECKLIST` + Work Inbox checklist runtime |
| **Attachment** | Linked files / URLs / refs | Work Inbox attachments runtime |
| **Comment** | Operator narrative on work | Task comments API / update log text |
| **Update** | Field or state change record | `TASK_UPDATE_LOG`, audit rows |
| **Decision** | Explicit choice recorded | Future tagged log or comment convention |
| **Handoff** | Transfer of responsibility/context | Phase handoff pattern; future operator handoff log |
| **Evidence** | Proof artifact (photo, doc, signature) | Attachments + checklist done + module file refs |

### 5.1 Memory ≠ timeline

Timeline is **one channel** of Memory. A Case Memory view in future UI must federate:

- Timeline events  
- Checklist activity stream  
- Attachment index  
- Comments / decisions / handoffs  

No merged `MEMORY_MAIN` sheet in V0A.

---

## 6. Relationship diagram

```text
                         ┌──────────────────────────────────────┐
                         │                 CASE                  │
                         │  (việc / hồ sơ / vấn đề vận hành)     │
                         └───────────────────┬──────────────────┘
                                             │
           ┌─────────────────┬───────────────┼───────────────┬─────────────────┐
           │                 │               │               │                 │
           ▼                 ▼               ▼               ▼                 ▼
   ┌───────────────┐ ┌───────────────┐ ┌───────────┐ ┌───────────────┐ ┌─────────────┐
   │ RESPONSIBILITY│ │  WORK/STEPS   │ │  MEMORY   │ │    RESULT     │ │  Module     │
   │               │ │               │ │           │ │  (derived)    │ │  Projection │
   │ Responsible   │ │ TaskWorkItem  │ │ Timeline  │ │               │ │  (HO_SO,    │
   │ Support       │ │ Checklist step│ │ Checklist │ │ Open/Done/    │ │   FINANCE…) │
   │ Reviewer      │ │ Alert action  │ │ Attach…   │ │ Escalated…    │ │             │
   │ Escalation    │ │ Module action │ │ Comment…  │ │               │ │             │
   │ Watcher       │ │               │ │ Handoff…  │ │               │ │             │
   └───────────────┘ └───────────────┘ └───────────┘ └───────────────┘ └─────────────┘
           │                 │               │
           └─────────────────┴───────────────┘
                         Actor (USER_DIRECTORY)
```

---

## 7. Mapping to OCMS_DOMAIN_MODEL.md

| CRM entity | Domain model (V0.1) |
|------------|---------------------|
| Case | §3.1 Case (logical) |
| Work / Steps | §3.2 Work Item (+ checklist as sub-step) |
| Memory (Timeline) | §3.4 Episode |
| Memory (other types) | **New in CRM** — sourced from inbox runtimes |
| Responsibility | **New in CRM** — partial map to §3.5 Actor |
| Module Projection | §3.3 unchanged |
| Alert | §3.6 unchanged |

---

## 8. Work Inbox V3 boundary

| Surface | CRM exposure (future) |
|---------|------------------------|
| `/inbox` | Work / Steps queue — **not** renamed to Cases |
| Focus Mode | Task step + Memory types (checklist, attachments) already local |
| Case context strip (OCMS_03+) | Case + Responsibility summary — secondary |

---

## 9. Anti-patterns

| Pattern | Reject |
|---------|--------|
| `ASSIGNEE_ID` = full Responsibility | Loses Reviewer/Escalation |
| Timeline tab = complete Memory | Loses attachments, checklist, handoffs |
| Inbox row labeled "Case" | Violates ADR-001 |
| CRM as product acronym in operator UI | Use Vietnamese operator labels |

---

## 10. Document map

| Document | Role |
|----------|------|
| `ADR_OCMS_FOUNDATION.md` | Base OCMS decisions |
| `ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md` | CRM triad binding |
| `OCMS_DOMAIN_MODEL.md` | V0.1 baseline entities |
| `OCMS_ROADMAP.md` | Phase sequence |
| This file | CRM core model |

---

## 11. CASE TYPE + RESULT fit into CRM

Updated complete frame:

```text
CASE
├── CASE TYPE        ← classification (OCMS_CASE_TYPE_CATALOG.md)
├── RESPONSIBILITY
├── WORK / STEPS
├── MEMORY
├── RESULT           ← outcome (OCMS_RESULT_MODEL.md)
└── MODULE PROJECTION
```

| Pillar | CRM section | Extension |
|--------|-------------|-----------|
| **Case** | §3.1 | Typed by **Case Type** code |
| **Case Type** | **New** | Drives checklist, SLA intent, default roles, result vocabulary |
| **Responsibility** | §4 | Case Type supplies **default** role hints |
| **Work / Steps** | §3.3 | Checklist **pattern** per type |
| **Memory** | §5 | Type defines **emphasis** (e.g. Evidence for COMPLIANCE) |
| **Result** | §3.5 (derived) | Fully specified in `OCMS_RESULT_MODEL.md`; ≠ task status |
| **Module Projection** | Domain §3.3 | Type lists **module liên quan** |

**Case Type** answers *loại case gì*; **Result** answers *kết thúc thế nào* — together with Responsibility and Memory for audit closure (who + evidence + decision + timeline).

This section does not alter §1–§10 above.

---

## 12. CASE LIFECYCLE fit into CRM

Updated complete frame:

```text
CASE
├── CASE TYPE
├── LIFECYCLE        ← operational phase (OCMS_CASE_LIFECYCLE_MODEL.md)
├── RESPONSIBILITY
├── WORK / STEPS
├── MEMORY
├── RESULT
└── MODULE PROJECTION
```

| Pillar | Interaction with Lifecycle |
|--------|----------------------------|
| **Case Type** | Hints typical lifecycle path (HO_SO → REVIEW heavy) |
| **Lifecycle** | **New** — where case is in operations |
| **Responsibility** | Role emphasis per lifecycle state (§7 lifecycle model) |
| **Work / Steps** | Tasks may complete while Lifecycle = WAITING |
| **Memory** | Transitions produce Update, Decision, Handoff |
| **Result** | Set often at REVIEW → RESOLVED; ≠ Lifecycle |
| **Module Projection** | Unchanged |

**Lifecycle** answers *case đang ở giai đoạn vận hành nào*; **Result** answers *outcome nghiệp vụ*; **Task status** answers *task row state*.

This section does not alter §1–§11 above.

---

## 13. CASE RELATION fit into CRM

Updated complete frame:

```text
CASE
├── CASE TYPE
├── LIFECYCLE
├── RELATION(S)      ← entity links (OCMS_CASE_RELATION_MODEL.md)
├── RESPONSIBILITY
├── WORK / STEPS
├── MEMORY
├── RESULT
└── MODULE PROJECTION
```

| Pillar | Interaction with Relation |
|--------|---------------------------|
| **Case Key** | May encode PRIMARY target; ≠ full relation graph |
| **Relation** | **New** — who/what case is about |
| **Module Projection** | Reads data for related entities; ≠ link metadata |
| **Memory Attachment** | File evidence; may parallel DOCUMENT relation |
| **Work / Steps** | TASK relation points to tasks; Work Item executes |
| **Responsibility** | Informed by PRIMARY/TARGET relations |
| **Lifecycle** | TRIAGE fills relations; BLOCKED uses BLOCKED_BY |
| **Result** | Preconditions on PRIMARY / EVIDENCE_REF |

**Relation** answers *case gắn với thực thể nào*; **Projection** answers *module hiển thị gì*.

This section does not alter §1–§12 above.

---

*Append-only. Bump version when role persistence or Memory API contract is introduced.*

# Cursor / AI — Execution Contract

**Version:** 1.0  
**Status:** Accepted  
**Applies to:** All CBV phases (AUDIT, IMPLEMENT, FIX, VERIFY, TEST, DOC-ONLY).

---

## 1. Mandatory workflow

Every phase **must** follow these steps in order. Steps may be **skipped only** when MODE = `AUDIT` or `DOC-ONLY` and the phase charter explicitly waives implementation (document waiver in report).

| Step | Name | Deliverable |
|------|------|-------------|
| **1** | **Read Context** | Confirm Always Load + optional loads per `010_CURSOR_LOADING_STANDARD.md` |
| **2** | **Analyze** | Problem statement, scope, constraints, AS-IS vs TO-BE classification |
| **3** | **Design Impact** | Files/systems touched; ADR need yes/no; risk to prod baseline |
| **4** | **Implement** | Code/config/docs per scope; minimal diff |
| **5** | **Self Test** | Unit/smoke/local checks within agent capability |
| **6** | **Runtime Verify** | Deploy path, env flags, live API/sheet when applicable |
| **7** | **Generate Report** | `000_REPORTS/<PHASE>_REPORT.md` |
| **8** | **Generate Handoff** | `001_HANDOFF/<PHASE>_HANDOFF.md` |
| **9** | **Generate ADR** | `002_DECISIONS/ADR_*.md` **if** architectural decision new or changed |

---

## 2. Step requirements (detail)

### 1 — Read Context

- Start at `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`.
- Record phase ID, MODE, and SUCCESS CRITERIA from phase registry or prompt.

### 2 — Analyze

- State what is broken or missing (evidence: file paths, routes, logs).
- List **out of scope** explicitly (schema, FE, GAS, etc.).

### 3 — Design Impact

- Table: component → change type (none / read / write).
- Flag TASK_MAIN prod baseline (SHARED_WITH, IS_PRIVATE) if touching tasks.
- Propose ADR if decision is durable and cross-team.

### 4 — Implement

- Match repo conventions; no drive-by refactors.
- Governance-only phases: **no** `apps/`, `workers/`, `05_GAS_RUNTIME/` unless charter allows.

### 5 — Self Test

- Run applicable lint/build/tests.
- DOC-ONLY: validate links and load order only.

### 6 — Runtime Verify

- Document `GO` / `GO_WITH_WARNINGS` / `FAIL` prerequisites (e.g. `clasp push`, env vars).
- Never claim live verification without noting deploy gap.

### 7 — Generate Report

Path: `00_SYSTEM_BRAIN/000_REPORTS/<PHASE>_REPORT.md`

Required sections:

- Executive summary
- Scope / constraints
- Files changed (or “none — DOC-ONLY”)
- Verification performed
- **EXIT STATUS:** `GO` | `GO_WITH_WARNINGS` | `FAIL`

**Append-only:** New phases add new files. Corrections add `## Amendment YYYY-MM-DD` at end; do not delete prior sections.

### 8 — Generate Handoff

Path: `00_SYSTEM_BRAIN/001_HANDOFF/<PHASE>_HANDOFF.md`

Required sections:

- To / From / Date
- What was delivered (bullets)
- Read first (ordered, short)
- Deploy / operator actions
- Known warnings
- Suggested next phase

### 9 — Generate ADR (if needed)

Create when:

- New source-of-truth split or merge
- Breaking API or schema contract
- Irreversible operator workflow change

Path: `00_SYSTEM_BRAIN/002_DECISIONS/ADR_<TOPIC>.md`

Status: `PROPOSED` → `ACCEPTED` after operator sign-off when required.

**Append-only:** Amend via new section; never rewrite decision history.

---

## 3. MODE matrix

| MODE | Steps 4–6 | Report | Handoff | ADR |
|------|-----------|--------|---------|-----|
| `AUDIT` | Optional | Required | Required | If findings change architecture |
| `IMPLEMENT` | Required | Required | Required | If needed |
| `FIX` | Required | Required | Required | Rare |
| `VERIFY` | Verify focus | Required | Required | No |
| `TEST` | Test focus | Required + evidence | Required | No |
| `DOC-ONLY` | Skip code | Required | Required | If new governance decision |

---

## 4. Success criteria (exit status)

| Status | Meaning |
|--------|---------|
| **GO** | Acceptance criteria met; no known blockers |
| **GO_WITH_WARNINGS** | Delivered; deploy/config/manual steps remain |
| **FAIL** | Criteria not met; handoff must list blockers |

---

## 5. Prohibited behaviors

- Shipping IMPLEMENT without report + handoff.
- Editing prior phase reports in place (except append amendment).
- Silent mock fallback in production runtime modes.
- Committing unless user explicitly requests.

---

*Append-only governance document.*

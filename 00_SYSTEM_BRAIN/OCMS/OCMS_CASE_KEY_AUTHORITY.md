# OCMS Case Key Authority — V0

**Version:** 0.1  
**Status:** Design authority (identity spec)  
**Phase:** `PHASE_OCMS_02D_CASE_KEY_AUTHORITY`  
**Branch:** `phase/ocms-foundation-v1`  
**ADR:** `ADR_OCMS_CASE_KEY_AUTHORITY.md`  
**Related:** `OCMS_CASE_DISCOVERY_AUTHORITY.md`, `OCMS_READ_MODEL_CONTRACT.md`, `OCMS_READ_MODEL_MAPPING.md`

---

## 1. Purpose

Establish **authoritative rules for Case Identity** inside OCMS — what a Case Key is, when it exists, how it relates to discovery sources, and what happens when it cannot be resolved.

This phase defines **identity authority only**. No persistence, no API, no identifier service.

---

## 2. What is a Case Key?

| Property | Definition |
|----------|------------|
| **Name** | `caseKey` on `CaseReadModel` |
| **Nature** | Logical, **read-session** identifier correlating work items, relations, memory, and projections under one case context |
| **Persistence** | **None in V0** — not a sheet column, not CASE_MAIN |
| **Scope** | One primary key per Focus-derived primary `CaseReadModel` |
| **Display** | **Never** raw in operator Case Strip (visibility ADR) |

**Case Key ≠** task id, hồ sơ id, transaction id alone — it is a **namespaced composite** encoding which anchor won discovery.

---

## 3. Purpose of a Case Key

| # | Purpose |
|---|---------|
| 1 | **Correlate** federated read data (task + HO_SO + finance + alert) under one case view |
| 2 | **Stabilize** identity for the Focus session while operator works the task |
| 3 | **Deduplicate logically** — multiple tasks sharing `HO_SO:HS-001` are the same case identity |
| 4 | **Enable future** persistence evaluation (OCMS_05) without inventing keys at implementation time |
| 5 | **Support** manual override (`MANUAL_CASE_KEY`) for deep links / future operator tools |

Case Key does **not** authorize writes, replace PRIMARY relations, or appear as Cognition/inbox row id.

---

## 4. Human-readable, machine-readable, or both?

| Audience | Form |
|----------|------|
| **Machine (canonical)** | Structured string: `{NAMESPACE}:{KIND}:{SOURCE_ID}` — ASCII, case-sensitive ID segment as stored in source system |
| **Human (operator)** | **Not** the raw key — use `title`, `caseType` label, lifecycle, relation labels |
| **Human (implementer/debug)** | Key visible in dev telemetry / `discoveryCandidates[].caseKeyHint` — not production strip |

**Both** in the ecosystem: machine-canonical key + human-facing fields derived separately.

---

## 5. Canonical format

```text
{NAMESPACE}:{KIND}:{SOURCE_ID}
```

| Segment | Rule |
|---------|------|
| `NAMESPACE` | Uppercase catalog-aligned token — see §6 |
| `KIND` | Subtype within namespace — e.g. `TASK`, `TX` |
| `SOURCE_ID` | Opaque id from source runtime — **no** transformation except trim; preserve source casing |

**Separator:** colon `:`  
**Validation:** Three segments minimum; `SOURCE_ID` non-empty after trim  
**Invalid examples:** `HO_SO` (missing kind/id), `TASK:T-1` (missing namespace), empty id

---

## 6. Namespace table (P0)

| NAMESPACE | KIND | Pattern | caseType default | Discovery source |
|-----------|------|---------|------------------|------------------|
| `OPERATIONS` | `TASK` | `OPERATIONS:TASK:{taskId}` | OPERATIONS | TASK_ANCHORED |
| `HO_SO` | *(none)* | `HO_SO:{hoSoId}` | HO_SO | HO_SO_ANCHORED |
| `FINANCE` | `TX` | `FINANCE:TX:{txId}` | FINANCE | FINANCE_ANCHORED |
| `ALERT` | *(none)* | `ALERT:{alertId}` | From alert / OPERATIONS | ALERT_ANCHORED |

**Note:** `HO_SO` and `ALERT` use two-segment logical form `{NAMESPACE}:{SOURCE_ID}` — equivalent to `{NAMESPACE}:ENTITY:{SOURCE_ID}` with omitted default kind; implementers MUST use patterns in mapping exactly.

**Future namespaces** (catalog types not P0): require ADR addendum before use.

---

## 7. When is a Case Key assigned?

| # | Condition |
|---|-----------|
| 1 | Discovery produces a primary `CaseReadModel` (outcome `RESOLVED` or `PARTIAL`) |
| 2 | Winning anchor yields a valid `SOURCE_ID` from readable source **or** valid `MANUAL_CASE_KEY` |
| 3 | Derive step composes key **immediately after** discovery winner selection |

**Assignment actor:** derive logic (OCMS_03+) — **not** operator, **not** batch job, **not** identifier service.

**Timing:** On Focus open, task switch, or explicit re-fetch — once per successful derive pass.

---

## 8. When must a Case Key **not** be assigned?

| # | Condition | Result |
|---|-----------|--------|
| 1 | Discovery outcome `NONE` | No primary model; no `caseKey` |
| 2 | Task unreadable and no valid manual key | No invented `OPERATIONS:TASK:…` |
| 3 | Winner anchor field blank | Fall to next precedence; if none valid → NONE |
| 4 | `SOURCE_ID` would require fabrication (missing HO_SO read, empty id) | Do not assign HO_SO key; fall back or NONE per discovery matrix |
| 5 | Invalid `MANUAL_CASE_KEY` override | Ignore manual; derive from anchors or NONE |
| 6 | `permissions.canView === false` | No surfaced model / no key for operator context |

**Invariant:** Absence of key is valid — prefer NONE over fake key.

---

## 9. Case Key vs discovery sources

Discovery **source** (`CaseReadSource`) describes **how** context was found; **caseKey** is the **identity output** of the winning anchor.

| Source | caseKey rule | MIXED label |
|--------|--------------|-------------|
| **TASK_ANCHORED** | `OPERATIONS:TASK:{taskId}` | N/A (single anchor) |
| **HO_SO_ANCHORED** | `HO_SO:{hoSoId}` | N/A unless other anchors also populated → MIXED |
| **FINANCE_ANCHORED** | `FINANCE:TX:{txId}` | Same |
| **ALERT_ANCHORED** | `ALERT:{alertId}` | Same |
| **MANUAL_CASE_KEY** | Exact validated override string | N/A |
| **MIXED** | Key from **winner** per discovery precedence §6.2 | `source=MIXED`; key ≠ composite of all anchors |

**Precedence (unchanged from discovery):** MANUAL → HO_SO → FINANCE → ALERT → TASK.

Example: task has `HO_SO_ID=HS-001` and finance ref → `source=MIXED`, `caseKey=HO_SO:HS-001`.

---

## 10. Can Case Key be derived?

**Yes — default mode in V0.**

| Mode | When |
|------|------|
| **Derived** | Winner anchor + pattern table §6 |
| **Manual override** | Explicit `caseKey` in query/URL/future UI; must pass validation §11 |
| **Not derived** | When assignment forbidden §8 |

Derivation formula:

```text
caseKey = PATTERN[winnerSource].format(winnerSourceId)
```

No UUID generation. No hash of relation graph. No LLM inference.

---

## 11. Can Case Key change?

| Scenario | Behavior |
|----------|----------|
| Same Focus task, re-fetch | Key **should remain stable** if anchors unchanged |
| Operator switches Focus task | New derive → **new key expected** |
| Anchor field updated on task (HO_SO linked later) | Re-derive may change key (e.g. TASK → HO_SO) — emit warning on change if prior key cached |
| Manual override applied/removed | Key changes per override |
| Persisted case table (future) | **Out of scope** — requires OCMS_05+ ADR |

**V0 rule:** Case Key is **not mutable by operator edit**. Changes are **re-derivation events**, not migrations.

---

## 12. Can multiple source records share a Case Key?

**Yes — required for multi-task hồ sơ workflows.**

| Pattern | Example |
|---------|---------|
| Multiple tasks, same `HO_SO_ID` | All derive `HO_SO:HS-2026-001` |
| Task + alert on same alert id | `ALERT:{id}` when alert wins |
| Finance approval + follow-up task | Same `FINANCE:TX:{txId}` if both reference transaction |

**One Focus view still shows one primary model** — sharing is a **logical** property across tasks, not multi-strip.

**Not allowed:** Two different PRIMARY anchors forced into one key without shared `SOURCE_ID` — do not concatenate ids into synthetic key.

---

## 13. Diagnostics when Case Key cannot be resolved

Extend `CaseReadModel.diagnostics` (no new persistence):

| Signal | Population |
|--------|------------|
| `warnings[]` | Must include human-readable reason — e.g. `"CASE_KEY_UNRESOLVED: không xác định được mã case từ anchor"` |
| `confidence` | `UNKNOWN` when no key; cap `LOW` when fallback TASK key used after module read failure |
| `missingProjections[]` | When anchor present but id unreadable |
| `discoveryCandidates[].caseKeyHint` | Partial hints for debugging — may show would-be keys |
| Discovery outcome | `NONE` when no defensible key |

**Operator strip:** Show warning line if model exists with LOW confidence key; HIDDEN if NONE.

**Implementer codes (recommended warning prefix):**

| Code | Meaning |
|------|---------|
| `CASE_KEY_UNRESOLVED` | No valid key |
| `CASE_KEY_INVALID_MANUAL` | Manual override rejected |
| `CASE_KEY_FALLBACK_TASK` | Higher anchor failed; using OPERATIONS:TASK |
| `CASE_KEY_AMBIGUOUS` | MIXED anchors; winner chosen — informational |

---

## 14. Authority ownership — who generates Case Key?

| Layer | Responsibility |
|-------|----------------|
| **This document** | Namespace table, validation, immutability rules |
| **`OCMS_CASE_DISCOVERY_AUTHORITY.md`** | Winner anchor selection |
| **`OCMS_READ_MODEL_MAPPING.md`** | Field mapping after key known |
| **Derive implementation (OCMS_03)** | Compose string; populate diagnostics |
| **Explicitly NOT** | CASE_SERVICE, UUID service, GAS id generator, DB sequence |

Generation is **pure function**: `(winnerSource, winnerSourceId, manualOverride?) → caseKey | null`.

---

## 15. Validation algorithm (normative sketch)

```text
function resolveCaseKey(winner, manualOverride):
  if manualOverride present:
    if validateCanonical(manualOverride): return manualOverride
    else: warn CASE_KEY_INVALID_MANUAL; continue
  if winner.sourceId blank: return null
  pattern = NAMESPACE_TABLE[winner.source]
  if pattern missing: return null
  key = format(pattern, winner.sourceId)
  if not validateCanonical(key): return null
  return key
```

---

## 16. Examples (P0)

| Scenario | caseKey |
|----------|---------|
| Task-only Focus | `OPERATIONS:TASK:T-2026-0042` |
| Task linked hồ sơ | `HO_SO:HS-2026-001` |
| Finance task | `FINANCE:TX:TX-2026-088` |
| Alert-driven | `ALERT:AL-2026-014` |
| Manual deep link | `HO_SO:HS-2026-001` (validated) |

Full JSON examples: `OCMS_READ_MODEL_EXAMPLES.md`.

---

## 17. OCMS_03 checklist

1. [ ] Use namespace table §6 — no ad-hoc formats  
2. [ ] Assign only after discovery winner  
3. [ ] Never show raw key in strip  
4. [ ] Emit diagnostics §13 on failure  
5. [ ] No persistence write of key  

---

## 18. Cross-references

| Doc | Binding |
|-----|---------|
| `OCMS_READ_MODEL_CONTRACT.md` §4.1 | Contract field |
| `OCMS_CASE_DISCOVERY_AUTHORITY.md` §6 | Winner → pattern |
| `OCMS_CASE_RELATION_MODEL.md` §2 | Key vs relation graph |

---

*Append-only authority. Supersedes deferred OCMS_01 Case Key convention for implementation purposes.*

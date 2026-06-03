# OCMS Case Discovery Authority — V0

**Version:** 0.1  
**Status:** Design authority (discovery spec)  
**Phase:** `PHASE_OCMS_02C_CASE_DISCOVERY_AUTHORITY`  
**Branch:** `phase/ocms-foundation-v1`  
**ADR:** `ADR_OCMS_CASE_DISCOVERY_AUTHORITY.md`  
**Inputs:** `OCMS_READ_MODEL_CONTRACT.md`, `OCMS_READ_MODEL_MAPPING.md`, `OCMS_CASE_STRIP_VISIBILITY_RULES.md`  
**Feature flag:** `OCMS_CASE_STRIP_ENABLED` (surfacing gate for OCMS_03)

---

## 1. Purpose

Define **Case Discovery** — the read-only step that decides **whether** a Case Context exists for a Work Inbox Focus session, **from which anchor(s)**, **which source wins**, and **what diagnostics** operators and implementers must surface.

Discovery produces input to **derive** `CaseReadModel`. It does **not** persist, write, or invent data.

---

## 2. Discovery entry point

| Property | Rule |
|----------|------|
| **Where** | Work Inbox **Focus Mode** with active `taskId` |
| **Trigger** | Operator opens or switches Focus on a task row |
| **Inputs** | `TASK_MAIN` row (or operational bundle snapshot), auth context, optional explicit `caseKey` query (future) |
| **Not discovery entry** | Inbox list rows, Right Panel alone, dashboard cards without Focus task |

**Runtime path (AS-IS):** Focus host → operational bundle / task read → **discovery** → derive `CaseReadModel` → visibility → layout.

---

## 3. Where case context is discovered from

Discovery scans **anchor fields** on the Focus task and linked read runtimes:

| Anchor signal | Task / bundle field (AS-IS) | Read runtime | Source if sole winner |
|---------------|----------------------------|--------------|------------------------|
| Task-only | `TASK_ID` | `TASK_MAIN`, checklist, attachment, timeline | `TASK_ANCHORED` |
| Hồ sơ | `HO_SO_ID` (or equivalent link column) | `HO_SO_MASTER`, `HO_SO_FILE`, logs | `HO_SO_ANCHORED` |
| Finance | Finance ref column (e.g. transaction id on task) | `FINANCE_TRANSACTION`, `FINANCE_LOG` | `FINANCE_ANCHORED` |
| Alert | `ALERT_ID` | `HOME_ALERT` | `ALERT_ANCHORED` |
| Manual | Explicit `caseKey` override (URL/query/future UI) | Resolve by key convention | `MANUAL_CASE_KEY` |
| Multiple | Two or more populated anchors | Mixed reads | `MIXED` (label) + single winner |

Detail mapping: `OCMS_READ_MODEL_MAPPING.md` §3.

---

## 4. When a Case Context **should** exist

A **primary** `CaseReadModel` **should** be derived when **all** hold:

| # | Condition |
|---|-----------|
| 1 | Focus session active with valid `taskId` |
| 2 | Task row readable (operational bundle or TASK_MAIN read succeeds) |
| 3 | `permissions.canView === true` (TASK_MAIN visibility rules) |
| 4 | Discovery outcome ≠ `NONE` (see §8) |

**Minimum case:** task-only → `TASK_ANCHORED`, `caseType: OPERATIONS`, `caseKey: OPERATIONS:TASK:{taskId}`.

---

## 5. When a Case Context **must not** exist (operator surface)

Do **not** surface Case Context Strip / primary model to operator when:

| # | Condition | Behavior |
|---|-----------|----------|
| 1 | `OCMS_CASE_STRIP_ENABLED` is false | HIDDEN — no strip; discovery may be skipped in OCMS_03 |
| 2 | `permissions.canView === false` | HIDDEN — no strip, no fake title |
| 3 | No `taskId` / Focus not open | No discovery run |
| 4 | Discovery outcome `NONE` | No primary model; strip HIDDEN |
| 5 | Task row unreadable and no valid MANUAL_CASE_KEY | `NONE` + diagnostics only (no invented OPERATIONS case) |

**Invariant:** Never fabricate HO_SO / FINANCE / ALERT projections to fill an empty strip.

---

## 6. Source resolution — anchor scan

### 6.1 Scan order (detection)

For each Focus task, evaluate anchors **independently** (all may be present):

```text
1. MANUAL_CASE_KEY   — if explicit caseKey override provided and parseable
2. HO_SO_ID          — non-blank on task row
3. FINANCE_REF       — non-blank finance transaction / link field on task row
4. ALERT_ID          — non-blank on task row
5. TASK_ID           — always present when Focus task exists
```

### 6.2 Winner precedence (which source wins)

When multiple anchors are populated, **one winner** drives `caseKey`, `caseType`, and PRIMARY relation strategy:

| Rank | Source | Wins when |
|------|--------|-----------|
| 1 | `MANUAL_CASE_KEY` | Valid explicit `caseKey` resolves to a known prefix (`HO_SO:`, `FINANCE:`, `OPERATIONS:`, `ALERT:`) **and** target read succeeds or partial with documented confidence |
| 2 | `HO_SO_ANCHORED` | `HO_SO_ID` populated **and** HO_SO master read attempted |
| 3 | `FINANCE_ANCHORED` | Finance ref populated **and** no winning HO_SO (or HO_SO blank/unreadable with finance present) |
| 4 | `ALERT_ANCHORED` | `ALERT_ID` populated **and** no higher-rank winner |
| 5 | `TASK_ANCHORED` | Default when no higher anchor wins or higher anchor read failed with no partial policy |

**`MIXED` label:** Set `source: MIXED` when **two or more** anchor types were populated at scan time, even after winner selection. Single populated anchor → use that source enum (not MIXED).

**Visibility alignment:** Strip MIXED rules use winner anchor for HO_SO / FINANCE priority (`OCMS_CASE_STRIP_VISIBILITY_RULES.md` §4.6).

### 6.3 Per-source caseKey patterns

| Winner source | caseKey | caseType default |
|---------------|---------|------------------|
| TASK_ANCHORED | `OPERATIONS:TASK:{taskId}` | OPERATIONS |
| HO_SO_ANCHORED | `HO_SO:{hoSoId}` | HO_SO |
| FINANCE_ANCHORED | `FINANCE:TX:{txId}` | FINANCE |
| ALERT_ANCHORED | `ALERT:{alertId}` | From alert metadata or OPERATIONS fallback |
| MANUAL_CASE_KEY | As provided (validated) | From key prefix / catalog |
| MIXED | From **winner** row above | From **winner** |

---

## 7. One task → multiple case contexts?

| Question | Authority answer |
|----------|------------------|
| Can one task map to multiple case contexts? | **Candidates yes; surfaced primary no.** One task may carry HO_SO + FINANCE + ALERT fields simultaneously. |
| How many models per Focus view? | **Exactly one primary** `CaseReadModel` per Focus task session. |
| Where do alternates go? | `diagnostics.discoveryCandidates[]` — ranked list, non-operator by default (implementer / debug). |
| Switching case context | Future explicit operator action (out of OCMS_02C scope) — not automatic flip on every read. |

---

## 8. Discovery outcomes

| Outcome | Meaning | Strip (flag on) |
|---------|---------|-----------------|
| `RESOLVED` | Primary model derived; confidence MEDIUM+ | STANDARD / EXPANDED per visibility |
| `PARTIAL` | Primary model derived; confidence LOW or missing PRIMARY relation | MINIMAL + warnings |
| `NONE` | No defensible primary model | HIDDEN |

Mapping to `diagnostics.confidence`:

| Outcome | Typical confidence |
|---------|-------------------|
| RESOLVED | HIGH or MEDIUM |
| PARTIAL | LOW |
| NONE | UNKNOWN (no model) or N/A |

---

## 9. Diagnostics when discovery is incomplete

Mandatory diagnostic population (extend `DiagnosticsField` per contract §14):

| Field | When populated |
|-------|----------------|
| `confidence` | Always when model exists; UNKNOWN when NONE |
| `warnings[]` | Human-readable: unreadable anchor, loser anchors, NOT_WIRED, manual key invalid |
| `missingRelations[]` | Winner expects PRIMARY relation but read failed — e.g. `PRIMARY:HO_SO` |
| `missingProjections[]` | e.g. `hoSo`, `finance` when anchor present but projection read failed |
| `staleSources[]` | Snapshot age / runtime unreachable |
| `runtimeState` | `NOT_WIRED` until operator wires Worker/GAS reads |
| `discoveryCandidates[]` | When ≥2 anchors detected — see §10 |

### 9.1 Required operator-visible warnings (strip)

At least **one** line from `diagnostics.warnings[0..1]` when:

- Higher anchor present but read failed → e.g. `"Hồ sơ liên kết không đọc được — hiển thị theo công việc"`
- MIXED with finance privacy → per visibility FINANCE rules
- MANUAL_CASE_KEY invalid → `"Mã case không hợp lệ — bỏ qua override"`
- UNKNOWN confidence with orphan ALERT → `"Cảnh báo không có ngữ cảnh đầy đủ"`

---

## 10. discoveryCandidates (contract extension)

```typescript
interface DiscoveryCandidate {
  rank: number;                    // 1 = winner
  source: CaseReadSource;
  anchorField: string;             // e.g. "HO_SO_ID"
  anchorId: string | null;
  caseKeyHint: string;
  selected: boolean;               // true for winner
  excludedReason?: string;       // e.g. "LOWER_PRECEDENCE", "READ_FAILED"
}
```

Implementers populate on multi-anchor tasks. **Not** shown in operator strip (§12 visibility).

---

## 11. Low confidence — required behavior

When `diagnostics.confidence` is **LOW** or **UNKNOWN**:

| Rule | Action |
|------|--------|
| No silent fallback to fake HO_SO/FINANCE | Keep winner or downgrade to TASK_ANCHORED only if task readable |
| Strip visibility | **MINIMAL** or **HIDDEN** per `OCMS_CASE_STRIP_VISIBILITY_RULES.md` §3.1 |
| MANUAL_CASE_KEY + confidence &lt; MEDIUM | MINIMAL |
| UNKNOWN + ALERT_ANCHORED orphan | MINIMAL or HIDDEN |
| Derivation | Populate `warnings`; do not hide missing data inside projections |
| Deep links | Disable if `permissions.canOpenRelated` false or target unreadable |

**Never:** silently show STANDARD/EXPANDED with invented module data.

---

## 12. Read failure matrix (no silent fallback)

| Scenario | Discovery action |
|----------|------------------|
| HO_SO_ID set, HO_SO read fails | Winner may fall to FINANCE or TASK; warning required; `missingProjections: ["hoSo"]` |
| Finance ref set, read fails | Fall to TASK if task ok; warning; `missingProjections: ["finance"]` |
| All module reads fail, task ok | TASK_ANCHORED PARTIAL/RESOLVED with MEDIUM confidence max |
| Task unreadable | NONE |
| MANUAL_CASE_KEY invalid | Ignore override; re-run precedence without manual |
| Worker NOT_WIRED | Attempt bundle-only; confidence UNKNOWN cap; `runtimeState: NOT_WIRED` |

---

## 13. Discovery → derive → strip pipeline

```text
Focus(taskId)
  → load task / operational bundle
  → scan anchors (§6.1)
  → pick winner (§6.2)
  → set source (+ MIXED if multi)
  → derive CaseReadModel (mapping)
  → set diagnostics + discoveryCandidates
  → visibility level (02A)
  → layout slot (02B)
```

---

## 14. OCMS_03 implementation checklist

1. [ ] Run discovery only on Focus with `taskId`
2. [ ] Apply precedence table §6.2
3. [ ] Emit one primary model; populate `discoveryCandidates` when multi-anchor
4. [ ] Respect flag + `canView` before strip
5. [ ] No CASE_MAIN / no write API
6. [ ] Log discovery outcome for runtime telemetry (optional)

---

## 15. Cross-references

| Doc | Role |
|-----|------|
| `OCMS_READ_MODEL_CONTRACT.md` §14 | Contract binding |
| `OCMS_READ_MODEL_MAPPING.md` | Field derivation after winner |
| `OCMS_CASE_STRIP_VISIBILITY_RULES.md` | Confidence → level |
| `OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md` | Mount after discovery |
| `OCMS_CASE_KEY_AUTHORITY.md` | Winner → `caseKey` pattern (§6) |

---

## 16. Case Key binding

Case Key composition is **authoritative** in `OCMS_CASE_KEY_AUTHORITY.md`. Discovery selects winner; derive applies namespace table:

| Winner | caseKey |
|--------|---------|
| TASK_ANCHORED | `OPERATIONS:TASK:{taskId}` |
| HO_SO_ANCHORED | `HO_SO:{hoSoId}` |
| FINANCE_ANCHORED | `FINANCE:TX:{txId}` |
| ALERT_ANCHORED | `ALERT:{alertId}` |
| MANUAL_CASE_KEY | Validated override string |
| MIXED | Key from **winner** only |

Unresolved key → discovery `NONE` or `diagnostics` `CASE_KEY_*` per key authority §13.

---

*Append-only authority. Bump version when Worker discovery route ships.*

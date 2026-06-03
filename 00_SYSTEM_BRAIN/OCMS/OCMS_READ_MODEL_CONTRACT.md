# OCMS Read Model Contract — V0

**Version:** 0.1  
**Status:** Design authority (contract spec)  
**Phase:** `PHASE_OCMS_02_READ_MODEL_CONTRACT`  
**Branch:** `phase/ocms-foundation-v1`  
**ADR:** `ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md`  
**Mapping:** `OCMS_READ_MODEL_MAPPING.md`  
**Examples:** `OCMS_READ_MODEL_EXAMPLES.md`

---

## 1. Purpose

Define **`CaseReadModel`** — read-only JSON contract for OCMS Case Shell / Context Strip (OCMS_03+) — derived from AS-IS runtimes without Case persistence.

---

## 2. Contract principles

| # | Principle |
|---|-----------|
| 1 | **Read first, write later** — no Case store |
| 2 | **Derive, don't invent** — map from TASK_MAIN, HO_SO, FINANCE, etc. |
| 3 | **Orthogonal layers** — taskStatus ≠ lifecycle ≠ result |
| 4 | **Projections read-only** — modules display; CaseReadModel doesn't own lifecycle |
| 5 | **Memory summary only** — not full federated timeline in V0 contract |
| 6 | **Diagnostics mandatory** — confidence, warnings, missing sources |
| 7 | **No production mock** — null/empty + warnings when source missing |
| 8 | **Mutations elsewhere** — task/checklist/attachment POST unchanged |

---

## 3. CaseReadModel schema (top level)

```typescript
interface CaseReadModel {
  caseKey: string;
  caseType: CaseTypeCode;
  title: string;
  lifecycle: LifecycleField;
  result: ResultField | null;
  responsibility: ResponsibilityField;
  relations: RelationField[];
  workItems: WorkItemField[];
  memorySummary: MemorySummaryField;
  projections: ProjectionsField;
  permissions: PermissionsField;
  source: CaseReadSource;
  diagnostics: DiagnosticsField;
}
```

---

## 4. Field definitions

### 4.1 caseKey

| Property | Rule |
|----------|------|
| Type | `string` |
| Semantics | Logical case identity for read session |
| Derivation | **Authoritative:** `OCMS_CASE_KEY_AUTHORITY.md` — namespace table + discovery winner |
| Patterns (P0) | `OPERATIONS:TASK:{id}`, `HO_SO:{id}`, `FINANCE:TX:{id}`, `ALERT:{id}` |
| Persisted | **No** — logical identity only; no CASE_MAIN |
| Display | **Never** raw in operator strip |
| ADR | `ADR_OCMS_CASE_KEY_AUTHORITY.md` |
| Unresolved | No fake key — `NONE` or diagnostics `CASE_KEY_*` warnings |

### 4.2 caseType

| Property | Rule |
|----------|------|
| Type | Catalog code — `HO_SO` \| `OPERATIONS` \| `FINANCE` \| … |
| Source | `OCMS_CASE_TYPE_CATALOG.md` |
| P0 | HO_SO, OPERATIONS, FINANCE |
| Derivation | Anchor type + heuristics (mapping §3) |

### 4.3 title

| Property | Rule |
|----------|------|
| Type | `string` |
| Derivation | Task title, HO_SO display name, or PRIMARY relation label |
| Fallback | `"Case {caseKey}"` with `diagnostics.warnings` |

### 4.4 lifecycle

```typescript
interface LifecycleField {
  code: LifecycleCode;       // NEW | TRIAGE | ACTIVE | WAITING | REVIEW | BLOCKED | RESOLVED | CLOSED | ARCHIVED | REOPENED
  label: string;           // Vietnamese operator label
  since: string | null;      // ISO8601 — best effort from last transition log
  source: DeriveSource;      // e.g. TASK_MAIN_INFERRED | HO_SO_LOG | MANUAL_FUTURE
  confidence: Confidence;    // HIGH | MEDIUM | LOW | UNKNOWN
}
```

**Must not** copy `TASK_MAIN.STATUS` directly without inference rules (mapping §4).

### 4.5 result

```typescript
interface ResultField {
  code: string;              // type-specific — OCMS_RESULT_MODEL.md
  group: ResultGroup;        // OPEN | COMPLETED | APPROVED | …
  label: string;
  source: DeriveSource;
  confidence: Confidence;
}
```

Nullable when no business outcome declared. Task complete ≠ case Result.

### 4.6 responsibility

```typescript
interface ActorRef {
  actorId: string | null;
  displayName: string | null;
  roleSource: DeriveSource;
  confidence: Confidence;
}

interface ResponsibilityField {
  responsible: ActorRef | null;
  support: ActorRef[];
  reviewer: ActorRef[];
  escalation: ActorRef[];
  watcher: ActorRef[];
}
```

Map from `OWNER_ID`, `ASSIGNEE_ID`, `REPORTER_ID`, `SHARED_WITH` as hints — not full CRM role engine.

### 4.7 relations[]

```typescript
interface RelationField {
  targetType: RelationTargetType;
  targetId: string;
  role: RelationRole;
  label: string | null;
  source: DeriveSource;
  confidence: Confidence;
  projectionKey?: string;    // key in projections object
}
```

Per `OCMS_CASE_RELATION_MODEL.md`. Distinct from attachment rows.

### 4.8 workItems[]

```typescript
interface WorkItemField {
  workItemType: 'TASK' | 'ALERT' | 'MODULE';
  workItemId: string;
  title: string;
  status: string;              // taskStatus — source runtime
  owner: ActorRef | null;
  assignee: ActorRef | null;
  dueAt: string | null;
  sourceRuntime: SourceRuntime;
  deepLink: string;            // e.g. /inbox/{taskId}
}
```

TASK relation in `relations[]` may duplicate pointer — workItems carry execution status.

### 4.9 memorySummary

```typescript
interface MemoryCountField {
  timeline: number;
  checklist: number;
  attachments: number;
  comments: number;
  decisions: number;
  handoffs: number;
  evidence: number;
}

interface MemoryRecentItem {
  memoryType: MemoryType;
  label: string;
  at: string | null;
  actor: ActorRef | null;
  sourceRuntime: SourceRuntime;
  deepLink: string | null;
}

interface MemorySummaryField {
  lastActivityAt: string | null;
  lastActivityText: string | null;
  counts: MemoryCountField;
  recent: MemoryRecentItem[];  // max 5 in strip UI; contract allows up to 10
}
```

Not full Memory federation — summary for strip/panel.

### 4.10 projections

```typescript
interface ProjectionSlice {
  sourceRuntime: SourceRuntime;
  stale: boolean;
  lastReadAt: string | null;
  data: Record<string, unknown> | null;
  summary: string | null;
}

interface ProjectionsField {
  task?: ProjectionSlice;
  hoSo?: ProjectionSlice;
  finance?: ProjectionSlice;
  invoice?: ProjectionSlice;
  documents?: ProjectionSlice;
  alerts?: ProjectionSlice;
}
```

Projections **do not** set lifecycle/result.

### 4.11 permissions

```typescript
interface PermissionsField {
  canView: boolean;
  canOpenSource: boolean;
  canOpenRelated: boolean;
  canSeePrivateFields: boolean;
  canMutateTask: boolean;      // TASK_MAIN write path — not CaseReadModel
}
```

Derived from TASK_MAIN visibility (`IS_PRIVATE`, `SHARED_WITH`) + auth role.

### 4.12 source

```typescript
type CaseReadSource =
  | 'TASK_ANCHORED'
  | 'HO_SO_ANCHORED'
  | 'ALERT_ANCHORED'
  | 'FINANCE_ANCHORED'
  | 'MANUAL_CASE_KEY'
  | 'MIXED';
```

Primary anchor for derivation strategy.

### 4.13 diagnostics

```typescript
interface DiagnosticsField {
  confidence: Confidence;       // overall read model confidence
  missingRelations: string[];   // e.g. "PRIMARY:HO_SO"
  missingProjections: string[]; // e.g. "hoSo"
  staleSources: SourceRuntime[];
  warnings: string[];
  runtimeState: 'NOT_WIRED' | 'WIRED';  // from 003_RUNTIME_STATE.md — report NOT_WIRED until operator wires
}
```

---

## 5. Derivation sources (enum)

```typescript
type DeriveSource =
  | 'TASK_MAIN'
  | 'TASK_UPDATE_LOG'
  | 'TASK_CHECKLIST'
  | 'TASK_ATTACHMENT'
  | 'HOME_ALERT'
  | 'HO_SO_MASTER'
  | 'HO_SO_FILE'
  | 'HO_SO_UPDATE_LOG'
  | 'FINANCE_TRANSACTION'
  | 'FINANCE_LOG'
  | 'INFERRED'
  | 'UNAVAILABLE';

type SourceRuntime =
  | 'TASK_GS_01'
  | 'HOME_ALERT'
  | 'HO_SO_RF06'
  | 'FINANCE_RF06'
  | 'WORKER'
  | 'UNKNOWN';

type Confidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
```

---

## 6. Source-specific derivation (summary)

| source | caseType default | caseKey pattern | Primary relations |
|--------|------------------|-----------------|-------------------|
| TASK_ANCHORED | OPERATIONS | `OPERATIONS:TASK:{id}` | TASK PRIMARY |
| HO_SO_ANCHORED | HO_SO | `HO_SO:{hoSoId}` | HO_SO PRIMARY, XA_VIEN TARGET |
| FINANCE_ANCHORED | FINANCE | `FINANCE:TX:{id}` | FINANCE_TRANSACTION PRIMARY |
| ALERT_ANCHORED | type from alert | `ALERT:{id}` | ALERT SOURCE |
| MIXED | from PRIMARY relation | composite | multiple |

Detail: `OCMS_READ_MODEL_MAPPING.md`.

---

## 7. Confidence model

| Level | Meaning |
|-------|---------|
| HIGH | Primary source read succeeded; key fields present |
| MEDIUM | Inferred lifecycle/result; partial projections |
| LOW | Missing PRIMARY relation or stale projection |
| UNKNOWN | Runtime not wired; no live read attempted |

Overall `diagnostics.confidence` = min(component confidences) with documented exceptions in mapping.

---

## 8. Anti-patterns

| Pattern | Reject |
|---------|--------|
| `lifecycle.code` = task.status raw | Use inference rules |
| `result` = task done flag | Use Result model |
| Mock HO_SO when ID missing in prod | `missingProjections` + warning |
| CaseReadModel POST | Read-only contract |
| Inbox row = CaseReadModel | Separate strip |
| relations[] = projections.data | Separate arrays |

---

## 9. Non-goals (contract)

- Persistence tables
- Write API
- Full timeline in contract (OCMS_04)
- Case Key authority — **done:** `OCMS_CASE_KEY_AUTHORITY.md` (OCMS_02D)

---

## 10. Example JSON (minimal)

See `OCMS_READ_MODEL_EXAMPLES.md` for full P0 examples.

```json
{
  "caseKey": "OPERATIONS:TASK:T-2026-0042",
  "caseType": "OPERATIONS",
  "title": "Kiểm kê kho cuối tuần",
  "lifecycle": {
    "code": "ACTIVE",
    "label": "Đang xử lý",
    "since": "2026-05-30T09:00:00+07:00",
    "source": "INFERRED",
    "confidence": "MEDIUM"
  },
  "result": null,
  "responsibility": { "responsible": { "actorId": "USR_001", "displayName": "Nguyễn A", "roleSource": "TASK_MAIN", "confidence": "HIGH" }, "support": [], "reviewer": [], "escalation": [], "watcher": [] },
  "relations": [{ "targetType": "TASK", "targetId": "T-2026-0042", "role": "PRIMARY", "label": null, "source": "TASK_MAIN", "confidence": "HIGH", "projectionKey": "task" }],
  "workItems": [{ "workItemType": "TASK", "workItemId": "T-2026-0042", "title": "Kiểm kê kho cuối tuần", "status": "IN_PROGRESS", "owner": null, "assignee": null, "dueAt": null, "sourceRuntime": "TASK_GS_01", "deepLink": "/inbox/T-2026-0042" }],
  "memorySummary": { "lastActivityAt": null, "lastActivityText": null, "counts": { "timeline": 0, "checklist": 0, "attachments": 0, "comments": 0, "decisions": 0, "handoffs": 0, "evidence": 0 }, "recent": [] },
  "projections": { "task": { "sourceRuntime": "TASK_GS_01", "stale": false, "lastReadAt": null, "data": null, "summary": null } },
  "permissions": { "canView": true, "canOpenSource": true, "canOpenRelated": true, "canSeePrivateFields": true, "canMutateTask": true },
  "source": "TASK_ANCHORED",
  "diagnostics": { "confidence": "MEDIUM", "missingRelations": [], "missingProjections": [], "staleSources": [], "warnings": ["RUNTIME_STATE: NOT_WIRED — example is spec-only"], "runtimeState": "NOT_WIRED" }
}
```

---

## 11. Document map

| Document | Role |
|----------|------|
| `OCMS_READ_MODEL_MAPPING.md` | AS-IS → contract |
| `OCMS_READ_MODEL_EXAMPLES.md` | P0 JSON examples |
| Prior OCMS models | Field semantics |

---

## 12. Case Strip visibility usage

Focus **Case Context Strip** (OCMS_03) consumes a **subset** of `CaseReadModel`:

| Contract field | Strip usage |
|----------------|-------------|
| `caseType`, `lifecycle.label` | Always eligible (via visibility rules) |
| `title` | If not duplicate of task header |
| `relations[PRIMARY]` | STANDARD+ |
| `relations[TARGET]` | EXPANDED only |
| `result.label` | EXPANDED; FINANCE STANDARD if non-null |
| `responsibility` | EXPANDED only |
| `memorySummary.recent[0..2]` | STANDARD / EXPANDED |
| `permissions` | Gates HIDDEN, links, private fields |
| `diagnostics.warnings[0..1]` | Operator warnings |
| `projections.data` | **Never** in strip |
| `caseKey` | **Never** raw in operator strip |

**Authoritative spec:** `OCMS_CASE_STRIP_VISIBILITY_RULES.md`  
**ADR:** `ADR_OCMS_CASE_STRIP_VISIBILITY_RULES.md`  
**Flag:** `OCMS_CASE_STRIP_ENABLED`

This section does not alter §1–§11 above.

---

## 13. Case Strip layout usage

CaseReadModel fields feed **visibility** (§12); **layout** governs mount point and chrome:

| Concern | Authority |
|---------|-----------|
| Mount location | Main Area below `CompactTaskHeader` |
| Not in OCMS_03 | Right Panel |
| Height caps | MINIMAL 28–36px … EXPANDED 96–128px |
| Flag off | No layout delta |

**Layout spec:** `OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md`

This section does not alter §1–§12 above.

---

## 14. Case Discovery binding

Discovery (authority: `OCMS_CASE_DISCOVERY_AUTHORITY.md`, ADR: `ADR_OCMS_CASE_DISCOVERY_AUTHORITY.md`) runs **before** derivation of §3–§11:

| Concern | Rule |
|---------|------|
| Entry | Focus Mode + `taskId` |
| Output | Zero or one primary `CaseReadModel` |
| `source` | Winner anchor; `MIXED` when ≥2 anchors populated |
| Precedence | MANUAL_CASE_KEY → HO_SO → FINANCE → ALERT → TASK |
| Multi-anchor | Losers listed in `diagnostics.discoveryCandidates[]` |

### 14.1 diagnostics extension

```typescript
interface DiscoveryCandidate {
  rank: number;
  source: CaseReadSource;
  anchorField: string;
  anchorId: string | null;
  caseKeyHint: string;
  selected: boolean;
  excludedReason?: string;
}

interface DiagnosticsField {
  // ... §4.13 fields ...
  discoveryCandidates?: DiscoveryCandidate[];  // when multi-anchor scan
}
```

Low confidence behavior defers to visibility ADR — no silent module fallback.

This section does not alter §1–§13 above.

---

*Append-only. Bump version when Worker read route is implemented.*

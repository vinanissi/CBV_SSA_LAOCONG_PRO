# AI Implementation Contract — Authority Addendum

**Binding as of:** 2026-05-29  
**Supersedes confusion only** — does not replace `AI_IMPLEMENTATION_CONTRACT.md` body; extends it.

---

## Authority pack is mandatory

Before any CBV_WORK_INBOX_V3 work, read:

```text
AUTHORITY/000_AUTHORITY_INDEX.md
AUTHORITY/006_COMMON_MISREAD_GUARDRAILS.md
```

Entry point: `README.md`

---

## Dual truth model

| Model | When to apply |
|-------|---------------|
| **AS-IS** (`AUTHORITY/001`) | Bugfix, describe current app, tests against production |
| **TO-BE** (`AUTHORITY/002` + `001`–`013`) | V3 implementation, UAT, design review |

**Never** implement TO-BE routes while claiming AS-IS fix without user approval.

---

## Prohibited assumptions

1. `/tasks` + `group=cognition` = V3 final — **FALSE**
2. `_archive_runtime_baseline_*` = implementation spec — **FALSE**
3. Design contract reports = code already matches — **FALSE**
4. `focusQueueMode` = V3 Focus Mode — **FALSE**

---

## Phase charter override

| Phase | Code changes |
|-------|--------------|
| `PHASE_UI_CBV_WORK_INBOX_V3_AUTHORITY_PACK` | **NONE** |
| `PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION` | Allowed per migration doc |

---

## Report naming

| Phase | Report file |
|-------|-------------|
| Authority | `PHASE_UI_CBV_WORK_INBOX_V3_AUTHORITY_PACK_REPORT.md` |
| FE impl | `PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION_REPORT.md` |

---

## Conflict resolution

See `AUTHORITY/003_SOURCE_OF_TRUTH_MATRIX.md`

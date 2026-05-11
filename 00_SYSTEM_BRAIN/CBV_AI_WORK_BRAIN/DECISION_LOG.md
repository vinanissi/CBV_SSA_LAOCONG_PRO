---
doc: DECISION_LOG
module: CBV_AI_WORK_BRAIN
purpose: Record decisions affecting architecture, binding, or operations
doctrine: Append-only — each entry is immutable once written; add corrections as new entries
updated: 2026-05-11
---

# DECISION_LOG

## Template (copy for new entries)

```
### YYYY-MM-DD — <short title>
- **Context:**
- **Decision:**
- **Alternatives considered:**
- **Consequences:**
- **Links:**
```

## 2026-05-11 — Establish CBV_AI_WORK_BRAIN

- **Context:** Phase T0 requires a neutral brain workspace separate from production runtime.
- **Decision:** Create `00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/` with append-only logs and prompt/context folders.
- **Alternatives considered:** Relying solely on ad-hoc chat exports (rejected: poor traceability).
- **Consequences:** Operators maintain pointers in `MEMORY_INDEX.md`; secrets remain forbidden here.
- **Links:** `00_SYSTEM_BRAIN/PHASE_T0_TASK_BINDING_BRAIN_BOOTSTRAP/RUN_2026-05-11_185824/BRAIN_BOOTSTRAP_REPORT.md`

## 2026-05-11 — T0 TASK binding Git scope

- **Context:** T0_TASK_BINDING phase; working tree contained TASK_OBS sources, TASK docs, brain inventory, and audit tooling.
- **Decision:** Only **classified NHÓM 1** paths may be committed for this slice; no real `.clasp.json`, no PAT in remote, no push without operator confirmation.
- **Alternatives considered:** Single mega-commit including NHÓM 2 runtime (rejected for this phase).
- **Consequences:** Local tag `t0-task-binding-v0.1` documents the slice; mirror drift with `05_GAS_RUNTIME` remains a follow-up concern, not hidden by this commit.
- **Links:** `00_SYSTEM_BRAIN/000_REPORTS/011_T0_TASK_BINDING_GIT_COMMIT_TAG_PUSH_PREP_REPORT.md`

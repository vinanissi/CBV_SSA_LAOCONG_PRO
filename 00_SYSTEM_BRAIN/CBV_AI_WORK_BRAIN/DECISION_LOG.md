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

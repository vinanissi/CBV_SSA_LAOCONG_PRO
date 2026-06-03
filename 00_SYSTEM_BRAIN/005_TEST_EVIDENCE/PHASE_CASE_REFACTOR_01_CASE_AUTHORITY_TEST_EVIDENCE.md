# Test Evidence — CASE_REFACTOR_01 Case Authority

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY` |
| **Date** | 2026-06-01 |
| **Mode** | DOC-ONLY |

---

## Files inspected

- Phase 00 audit pack (`00_SYSTEM_BRAIN/CASE/*` maps)
- `ADR_OCMS_FOUNDATION.md`, `ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md`
- `OCMS_READ_MODEL_CONTRACT.md`, `OCMS_CASE_KEY_AUTHORITY.md`
- `PHASE_CASE_REFACTOR_00_*` report/handoff
- `apps/workboard/src/modules/ocms/deriveCaseReadModel.ts` (alignment reference only)

---

## Authority consistency checks

| Check | Pass? | Evidence |
|-------|-------|----------|
| What is / is not a Case? | Yes | `CASE_RUNTIME_AUTHORITY_V1.md` §1 |
| Case vs Task | Yes | Authority §2 + boundary contract |
| Checklist vs Task | Yes | Authority §3 + promotion rules |
| Document ownership | Yes | Authority §4 |
| Timeline + Comment | Yes | Comment = timeline entry type |
| Handoff ownership | Yes | Authority §7 |
| WorkflowState vs engine | Yes | Authority §8 + boundary contract |
| No CASE_MAIN | Yes | ADR + read model authority §3 |
| Workspace structure | Yes | `CASE_WORKSPACE_LAYOUT_AUTHORITY.md` |
| OCMS extension not conflict | Yes | Authority §15 |

---

## Forbidden artifact check

```text
grep CASE_MAIN|CaseService|CaseRepository|CaseAPI in *.js,*.ts,*.tsx
→ Only negative assertions in ocms*Checks.ts (pre-existing)
→ No new Case service files created by phase 01
```

| Forbidden | Created by phase 01? |
|-----------|----------------------|
| CASE_MAIN | No |
| Case Service/API/Store | No |
| Schema change | No |
| Runtime code change | No |

---

## No implementation check

- No edits under `apps/workboard/src` (except none from this phase)
- No edits under `workers/api`, `gas-runtime-api`, `05_GAS_RUNTIME`
- Only `00_SYSTEM_BRAIN/**` documentation + registries

---

## Registry / roadmap updates

| File | Updated |
|------|---------|
| `PHASE_REGISTRY.md` | Yes — phase 01 row |
| `CASE_PHASE_REGISTRY.md` | Yes — status GO_WITH_WARNINGS |
| `CASE_ROADMAP.md` | Yes — phase 01 complete note |
| `OCMS_ROADMAP.md` | Yes — Case refactor cross-link |

---

## Build / lint / test

| Command | Run? |
|---------|------|
| `npm run build` | No — authority-only |
| `npm run lint` | N/A |
| `npm run test` | N/A |

---

## Unresolved risks

1. Task-scoped checklist storage vs logical Case ownership — phase 02 must document adapter approach.
2. Federated timeline not specified at field level — phase 02/04.
3. AI Summary in workspace — content source undefined (acceptable deferral).

---

*Validation: authority phase complete; safe to proceed to read model phase.*

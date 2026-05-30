READ FIRST (MANDATORY)

`00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`

CBV-RCLA v1.1 — `ADR_RUNTIME_CONTEXT_LOADING_V1_1_ADDENDUM.md`

Previous: `PHASE_UI_CBV_WORK_INBOX_V3_ACTION_RUNTIME_*`

`900_AUTHORITY/000_DESIGN_AUTHORITY.md` · `900_AUTHORITY/001_AUTHORITY_INDEX.md`

---

# PHASE_UI_CBV_WORK_INBOX_V3_OPERATIONAL_RUNTIME

**Mission:** Action Runtime → **Operational Runtime** (vận hành được, không chỉ click được).

## Runtimes (10)

1. Server `ACTION_AUDIT_LOG` (append-only)
2. `TASK_TIMELINE` entity + tab
3. `TASK_APPOINTMENTS` + preview
4. `SOP_REGISTRY` lookup
5. `FORM_TEMPLATE_REGISTRY` lookup
6. `TASK_DOCUMENTS` + preview
7. `TASK_NOTES` + save
8. Focus progress (N / total, %)
9. Permission matrix (ADMIN/MANAGER/OPERATOR/VIEWER)
10. Operational preview cards (timeline×5, handoff, docs, appointment)

## RCLA

`WorkInboxRuntimeContextProvider` only — no ad-hoc context.

## Tests

`runWorkInboxOperationalRuntimeChecks()`

## Acceptance

**GO:** server audit, runtime timeline, entities persisted, permissions enforced, tests pass.

**GO_WITH_WARNINGS:** SOP/template seed URLs placeholder.

**FAIL:** FE-only audit, comment-only timeline, no persistence.

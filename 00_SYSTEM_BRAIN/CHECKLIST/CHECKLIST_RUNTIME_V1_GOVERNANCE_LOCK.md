# Checklist Runtime v1 — Governance Lock

**Runtime boundary:** Checklist operator UX in Work Inbox focus runtime (`WorkInboxChecklistSection`, `SmartChecklistItemRow`, dual-pane context, LINK deep-link consumer integration). Excludes unrelated task engine, workflow engine, and mobile-specific layouts unless unlocked.

**Lock status:** `CONDITIONAL_LOCK` (see `CHECKLIST_RUNTIME_V1_LOCK.md`)

---

## Authority references

- Per-phase authorities under `00_SYSTEM_BRAIN/CHECKLIST/CHECKLIST_*_AUTHORITY.md` (phases 01–10 UX)
- `PHASE_REGISTRY.md` rows for `PHASE_CHECKLIST_01_INTERACTION_FEEDBACK` … `PHASE_CHECKLIST_10_DUAL_PANE_RUNTIME`
- LINK: `00_SYSTEM_BRAIN/LINK/LINK_RUNTIME_V1_LOCK.md`

---

## Allowed modifications (after lock)

- Changes delivered through a **new named RCLA phase** with report, handoff, and test evidence.
- Updates to regression baseline and lock documents as part of that phase.
- Diagnostics-only additions that do not alter runtime behavior.

---

## Forbidden modifications (without unlock)

- Changing locked UX contracts in place (interaction, toast, focus, progress, copy, comment signal, polish, compact, workspace, dual pane).
- Schema, Sheet column, Drive folder, permission, or workflow changes bundled as checklist UI work.
- Changing deep link URL shape or step anchor attributes.
- Removing task-level dossier access.

---

## Required future phase process

1. New manifest phase ID (not silent edit to v1 lock).
2. `000_REPORTS/PHASE_<ID>_REPORT.md` + `001_HANDOFF/PHASE_<ID>_HANDOFF.md`.
3. `005_TEST_EVIDENCE/PHASE_<ID>_TEST_EVIDENCE.md`.
4. Contract/authority update if behavior boundary changes.
5. Re-run `checklistRuntimeLockChecks.ts` and update `CHECKLIST_RUNTIME_V1_REGRESSION_BASELINE.md` statuses.
6. Registry row in `PHASE_REGISTRY.md`.

---

## Regression requirements for future changes

- All affected static check suites from baseline RB-01–RB-17 must pass.
- `npm run build` (apps/workboard) when TS/TSX changes.
- Document skipped manual UAT with reason.

---

## Unlock conditions

| Trigger | Action |
|---------|--------|
| Checklist data model change | New phase + migration plan; unlock v1 |
| Task workflow / state machine change | Cross-runtime review |
| Sheet/Drive runtime change | Re-verify RB-14 + load/save paths |
| Dossier runtime contract change | Re-verify RB-12 |
| Deep link contract change | Coordinate with LINK runtime lock |
| Mobile runtime introduction | Separate mobile phase; do not assume desktop lock |
| Permission model change | Security review + filter regression |
| Operator UAT failure | Fix-forward phase or rollback |
| Production incident | Hotfix phase; post-incident baseline update |
| New persistence requirement | ADR + schema phase before UX lock restore |

---

## Ownership

- **Runtime owner (documentation):** System Brain / CHECKLIST governance pack  
- **Implementation surface:** `apps/workboard/src/modules/task/inbox/checklist/`  
- **Escalation:** New RCLA phase; do not bypass lock via drive-by edits

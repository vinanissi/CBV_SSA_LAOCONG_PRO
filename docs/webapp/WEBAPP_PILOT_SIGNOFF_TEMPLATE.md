# WebApp Pilot Signoff Template

Copy this template into `00_SYSTEM_BRAIN/001_HANDOFF/` (or the team's audit location) and fill it after the Phase 95 staff trial completes. Append-only: never edit a signed signoff retroactively.

---

## 1. Session info

- **Pilot label:** _____________________________________________ (e.g. `2026Q2-PILOT-01`)
- **Phase:** PHASE_95_WEBAPP_PILOT_UAT_STAFF_TRIAL_RUNBOOK
- **Branch / commit at trial:** ___________________________________
- **Deployment (Apps Script version):** ___________________________
- **Dates of trial:** ____________________________________________
- **UAT lead:** _________________________________________________
- **Phase 95 owner:** ___________________________________________

## 2. Participants

| Role | Name | Email | Session ID |
|------|------|-------|------------|
| Admin | | | |
| Supervisor | | | |
| Operator | | | |
| Operator | | | |
| Shadow observer | | | |

## 3. Routes tested

- [ ] `?action=ping`
- [ ] `/workspace`
- [ ] `/home-alert/my-queue` (Desktop / Tablet / Mobile)
- [ ] `/home-alert/sla`
- [ ] `/home-alert/timeline`
- [ ] `/home-alert/kanban`
- [ ] `/runtime/health`
- [ ] `/reports`
- [ ] `/admin/reference`

## 4. Test Console results

- **Phase 94 — UI Freeze / UAT** result: ___________________ (GO / GO_WITH_WARNINGS / FAIL)
- **Phase 95 — Pilot UAT** result: ________________________ (GO / GO_WITH_WARNINGS / FAIL)
- Latest report `traceId`s (for archive lookup): ____________________________________________

## 5. Final result

- [ ] **GO**
- [ ] **GO_WITH_WARNINGS**
- [ ] **NO_GO**

Reasoning summary (3–5 sentences):

```
<fill in>
```

## 6. Blockers

| # | Route | Scenario | Description | Owner | Target fix |
|---|-------|----------|-------------|-------|------------|
| 1 | | | | | |
| 2 | | | | | |

(If any BLOCKER row is filled, the result MUST be `NO_GO`.)

## 7. Accepted warnings (HIGH waivers)

Maximum 2 entries. Each must include operational mitigation and target fix window.

| # | Route | Scenario | Description | Mitigation | Target fix | UAT lead sign | Owner sign |
|---|-------|----------|-------------|------------|------------|---------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |

## 8. Tracked follow-ups (MEDIUM)

- [ ] _________________________________________________________
- [ ] _________________________________________________________
- [ ] _________________________________________________________

## 9. Backlog (LOW / OBSERVATION)

- [ ] _________________________________________________________
- [ ] _________________________________________________________
- [ ] _________________________________________________________

## 10. Next step

Choose **exactly one**:

- [ ] **Phase 96 — Controlled WebApp Action Design / Mutation Guard Blueprint** — selected when result is `GO` or `GO_WITH_WARNINGS`.
- [ ] **Phase 96 — UAT Fix Pack** — selected when result is `NO_GO`. Address BLOCKERs first; re-run relevant scripts; schedule another pilot.

## 11. Signatures

| Role | Name | Signature (typed) | Date |
|------|------|-------------------|------|
| UAT lead | | | |
| Phase 95 owner | | | |
| Admin participant | | | |
| Supervisor participant | | | |
| Operator participant | | | |
| Operator participant | | | |

## 12. Archive references

- Feedback log location (sheet name or doc URL): _______________________________________
- Phase 94 Test Console JSON archive: __________________________________________________
- Phase 95 Test Console JSON archive: __________________________________________________
- Screenshots / recordings (if any): ___________________________________________________

## 13. Audit notes

```
<append-only notes; never delete prior content>
```

---

**Forbidden in signoff:**

- Marking `GO` with any BLOCKER row filled.
- Marking `GO_WITH_WARNINGS` with more than 2 HIGH waivers, or any HIGH without a waiver.
- Editing a signed signoff retroactively. Use a successor signoff document and reference the prior one.
- Claiming "production ready" anywhere in this document.

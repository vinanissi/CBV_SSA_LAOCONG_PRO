# PHASE E — CBV Operational Workflow Runtime (archived prompt)

**Archived at:** 2026-05-11T22:11:25 (local filename stamp)  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`

## Role

CBV System Architect — evolve **CBV Verification Pipeline Runtime** into **CBV Operational Workflow Runtime**.

## CBV_AI_WORK_BRAIN — SHORT EXECUTION CONTEXT

- Memory-first, runtime-first, append-only  
- Persist: prompt, report, decision, trace, handoff, incident, approval, workflow transition  
- No overwrite/delete audit history; no fake DONE / PRODUCTION READY  

## REQUIRED FLOW

1. Read existing repo/runtime  
2. Save prompt archive → `00_SYSTEM_BRAIN/000_PROMPTS`  
3. Analyze impact/boundaries  
4. Implement  
5. Self-test + runtime verification  
6. Append-only report → `00_SYSTEM_BRAIN/000_REPORTS`  
7. Git add / commit / push / tag if possible  
8. AI handoff summary  

## PHASE GOAL

Manage: **state**, **workflow**, **incident**, **approval**, **timeline**, **escalation** (hooks), **rollback lifecycle** (explicit states), with governance: no auto-deploy, no auto-approve, no hidden destructive transitions.

## FILES (main-control `src/`)

| File | Purpose |
|------|---------|
| `334_CBV_OPERATIONAL_STATE_MACHINE.js` | `CBV_OPERATIONAL_STATES`, `CBV_OPERATIONAL_TRANSITIONS`, legality + self-test |
| `335_CBV_OPERATIONAL_INCIDENT_RUNTIME.js` | Sheet `CBV_OPERATIONAL_INCIDENTS`, `CBV_OperationalIncident_create_`, verification hook |
| `336_CBV_OPERATIONAL_APPROVAL_RUNTIME.js` | Sheet `CBV_OPERATIONAL_APPROVALS`, `CBV_OperationalApproval_request_` (PENDING) |
| `337_CBV_OPERATIONAL_TIMELINE.js` | Sheet `CBV_OPERATIONAL_TIMELINE`, `CBV_OperationalTimeline_appendEvent_` |
| `338_CBV_OPERATIONAL_WORKFLOW_ENGINE.js` | `CBV_OperationalWorkflow_transitionState_`, menus, bundled self-test |
| `339_CBV_OPERATIONAL_WORKFLOW_VIEWER.html` | Modal viewer (verification bundle + timeline table + states) |
| `340_CBV_OPERATIONAL_RUNTIME_CONSTANTS.js` | `CBV_OPERATIONAL_RUNTIME_VERSION`, deploy unlock property name (doc/compat) |

**Canonical sync:** mirror files under `apps-script/production-core/src/` (+ menu + verification hook).

## API CONTRACT (transition)

Input: `{ objectType, objectId, fromState, toState, traceId, requestedBy, reason, validateOnly? }`  
Output: `{ ok, transitionAllowed, transitionRecorded, transitionId, warnings, errors }`

## GOVERNANCE

- `READY_FOR_DEPLOY` → `DEPLOYED`: **ScriptProperties** `CBV_OPERATIONAL_DEPLOY_UNLOCK` must equal `I_UNDERSTAND` when **not** `validateOnly`.  
- `validateOnly: true`: checks state-machine legality only; does not record transition or require deploy unlock.  
- Timeline append on real (non–validate-only) transitions; incidents/approvals append-only sheets.

## MENU (🧪 CBV Test Console)

Submenu **Operational Workflow (Phase E)** — self-test, timeline, incidents, approvals, viewer, transition validation.

## REPORT

See paired append-only report: `00_SYSTEM_BRAIN/000_REPORTS/028_PHASE_E_OPERATIONAL_WORKFLOW_RUNTIME_REPORT_20260511_221125.md`.

# Handoff — CASE_REFACTOR_03 Case Workspace

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_03_CASE_WORKSPACE` |
| **Result** | GO_WITH_WARNINGS |
| **Next** | `PHASE_CASE_REFACTOR_04_OPERATOR_UAT` |

---

## Summary

Case Workspace renders in Focus when `VITE_CASE_WORKSPACE_ENABLED=true`. Case is visual root; Task actions and right panel unchanged. Flag OFF restores legacy layout.

---

## How to verify

1. Set in `apps/workboard/.env.local`: `VITE_CASE_WORKSPACE_ENABLED=true` (and API URL if needed).
2. `npm run dev` → Work Inbox → Focus a task.
3. Confirm Case header, context strip, checklist, tasks, docs, timeline/handoff previews.
4. Test complete/assign — FocusActionBar.
5. Open right panel tabs.
6. Remove flag → restart dev → legacy Focus layout.

Static: `npx tsx -e "import { runCaseWorkspaceChecks } from './src/modules/ocms/caseWorkspaceChecks.ts'; console.log(runCaseWorkspaceChecks());"`

---

## Do-not-do list

- No CASE_MAIN / Case API  
- No persistence phase until UAT + phase 05 decision  
- Do not remove right panel without ADR  

---

## Files to read

1. `ocms/CaseWorkspace.tsx`
2. `focusRuntime/FocusTaskWorkspace.tsx`
3. `CASE/CASE_WORKSPACE_LAYOUT_AUTHORITY.md`
4. `CASE/CASE_WORKSPACE_OPERATOR_UX_CHECKLIST.md`

---

*Bundle: phase_tmp/0001_PHASE_CASE_REFACTOR_03_CASE_WORKSPACE.zip*

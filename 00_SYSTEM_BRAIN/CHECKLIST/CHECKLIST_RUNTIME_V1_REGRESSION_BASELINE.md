# Checklist Runtime v1 — Regression Baseline

**Runtime:** Checklist Runtime v1  
**Lock phase:** `PHASE_CHECKLIST_RUNTIME_LOCK`  
**Gate command:** `npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistRuntimeLockChecks.ts`

| Test ID | Description | Expected result | Status | Evidence source | Risk if failed |
|---------|-------------|-----------------|--------|-----------------|----------------|
| RB-01 | Checklist section renders in focus workspace | `WorkInboxChecklistSection` mounted; list loads or shows hint | PASS (static) | `workInboxChecklistChecks.ts`, `smartChecklistChecks.ts` | Operators cannot execute task steps |
| RB-02 | Compact row mode | Compact row classes/attrs present | PASS (static) | `checklistCompactRowModeChecks.ts` | Wasted vertical space; focus lost |
| RB-03 | Interaction pending/saved/failed | Row `data-checklist-interaction-state` + feedback states | PASS (static) | `checklistInteractionFeedbackChecks.ts` | Silent failures on save |
| RB-04 | Toast success/error | Global toast provider; copy/save messages | PASS (static) | `checklistToastNotificationChecks.ts` | No operator confirmation |
| RB-05 | Focus step mode | Focus/dim rows; clear focus | PASS (static) | `checklistFocusStepModeChecks.ts` | Cannot isolate one step |
| RB-06 | Progress calculation | Progress bar from completed/total; safe % | PASS (static) | `checklistProgressVisualizationChecks.ts` | Wrong completion signal |
| RB-07 | Copy link generation | `?step=` param; clipboard messages | PASS (static) | `checklistCopyLinkUxChecks.ts`, `copyChecklistStepLink.ts` | Broken handoff links |
| RB-08 | Copied link resolution | Deferred resolution + row highlight | PASS (static) | `deferredStepResolutionChecks.ts`, `stepDeepLinkChecks.ts` | Deep links land wrong step |
| RB-09 | Comment signaling | Count-only signal attrs | PASS (static) | `checklistCommentSignalingChecks.ts` | False unread noise |
| RB-10 | Focus workspace | Enter/exit; prev/next; navigator | PASS (static) | `checklistFocusWorkspaceChecks.ts` | Single-step workflow broken |
| RB-11 | Dual pane sync | Provider + right panel + navigator rows | PASS (static) | `checklistDualPaneRuntimeChecks.ts` | Duplicate UI; lost step context |
| RB-12 | Right pane dossier/detail | `FocusedChecklistStepDetailPanel` + `DossierAggregatePanel` tab | PASS (static) | `checklistDualPaneRuntimeChecks.ts`, `dossierAggregateChecks.ts` | Evidence not reachable |
| RB-13 | Deep link scroll/highlight/focus | Anchor `data-checklist-step-id`; highlight | PASS (static) | `deferredStepResolutionChecks.ts` | Link opens wrong/missing row |
| RB-14 | Sheet latency warning compatibility | Request seq guard; non-blocking warning | PASS (static) | `sheetRuntimeLatencyWarningFixChecks.ts` | False alarms or blocked UI |
| RB-15 | Operator polish | Focus/hover/copy-link CSS hooks | PASS (static) | `checklistOperatorPolishChecks.ts` | Poor operability under load |
| RB-16 | No schema/persistence/workflow change in UX phases | Lock checks + contracts UI-only | PASS (static) | Phase contracts 01–10 | Governance violation |
| RB-17 | Production build | `npm run build` in apps/workboard | PASS (last lock run) | Build log in test evidence | Deploy blocker |
| RB-18 | Operator browser UAT | Full UAT steps in operator checklist | **SKIPPED (CI)** | `CHECKLIST_RUNTIME_V1_OPERATOR_UAT.md` | Production UX regressions undetected |

**Skipped:** RB-18 — requires manual operator session; not fabricated.

**Re-run after any unlock-affecting change:** RB-01 through RB-17 minimum; RB-18 before `PRODUCTION_LOCK`.

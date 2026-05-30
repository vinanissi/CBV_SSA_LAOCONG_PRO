# PHASE_UI_CBV_WORK_INBOX_V3_OPERATIONAL_RUNTIME — Test Evidence

**Date:** 2026-05-30

## Build

```bash
cd apps/workboard && npm run build          # PASS
cd workers/api && npm run typecheck         # PASS
```

## Static suite

```bash
cd apps/workboard
npx tsx -e "import { runWorkInboxOperationalRuntimeChecks } from './src/modules/task/inbox/operationalRuntime/workInboxOperationalRuntimeChecks.ts'; console.log(runWorkInboxOperationalRuntimeChecks().status);"
# GO — 19/19 checks
```

## Check IDs

SERVER_AUDIT_APPEND, TIMELINE_ENTITY_APPEND, TIMELINE_TAB_RUNTIME_SOURCE, APPOINTMENT_CREATE, APPOINTMENT_PREVIEW, SOP_REGISTRY_LOOKUP, FORM_TEMPLATE_LOOKUP, DOCUMENT_RUNTIME, DOCUMENT_PREVIEW, NOTE_RUNTIME, NOTE_APPEND, PERMISSION_MATRIX, ACTION_PERMISSION_ENFORCED, FOCUS_PROGRESS_RUNTIME, OPERATIONAL_PREVIEW_CARDS, RCLA_CONTEXT_PROVIDER, RCLA_RUNTIME_REGISTRY, NO_LAYOUT_REGRESSION, NO_DEAD_ACTION

## Not run

- Live spreadsheet write E2E (requires deployed GAS + sheets)
- Browser automation

# Handoff — PHASE_LINK_01_STEP_DEEP_LINK

## Result

`GO_WITH_WARNINGS`

## What shipped

- Module: `apps/workboard/src/modules/task/inbox/link/`
- Query: `?step=<checklistItemId>` on `/inbox/:taskId`
- Wires: `WorkInboxChecklistSection` consumer + row copy button
- Reuses: `useChecklistCrossFocusListener` / `requestDossierCrossFocus`

## Verify locally

1. Open focus task `/inbox/{id}`
2. Click **Copy link bước** on a row → paste URL in new tab
3. Expect scroll/highlight/expand on that row; URL loses `step` param

## Checks

```bash
npx tsx 00_SYSTEM_BRAIN/LINK/stepDeepLinkChecks.ts
cd apps/workboard && npm run build
```

## Follow-up

- Operator UAT for shared links across users
- Optional dossier panel **Copy link bước** for evidence rows

# Handoff — CHECKLIST_SYNC_STATUS_FOOTER_RUNTIME

## What moved

Checklist sync UI removed from CENTER `WorkInboxChecklistSection`. Footer `RuntimeStatusBar` shows `ChecklistSyncFooterIndicator`.

## Preserved

- `handleManualSync` / `refreshFromRemote`
- `checkWriteGuard` write blocking
- Sync error/conflict messages (footer, not hidden)

## Manual verification

1. Open focus task with checklist — no `Đồng bộ` bar in checklist body.
2. Footer shows checklist sync badge (OK time or `Chưa đồng bộ` / `Thử lại`).
3. Inline chips still work on a focused row.

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`

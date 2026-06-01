# PHASE_DSR_02_CONNECTION_CHECK

## PHASE

`PHASE_DSR_02_CONNECTION_CHECK`

## MODE

- [x] `IMPLEMENT`

## SUCCESS CRITERIA

- `cbvDsrConnectionCheck` reads config, opens SOURCE/DEST read-only, writes append-only trail
- Menu item 4 added; no sync/backup/triggers
- Missing IDs → `NEEDS_CONFIG` (non-destructive)

## NEXT

`PHASE_DSR_03_BACKUP_RUNTIME`

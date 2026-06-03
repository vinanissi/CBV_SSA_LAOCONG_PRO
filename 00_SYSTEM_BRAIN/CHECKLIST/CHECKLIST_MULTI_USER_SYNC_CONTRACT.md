# Checklist Multi-User Sync Contract

**Phase:** `PHASE_CHECKLIST_14_MULTI_USER_SYNC`  
**Status:** ACTIVE

---

## API

| Layer | Function |
|-------|----------|
| FE | `getChecklistSyncState`, `refreshChecklistFromRemote`, `compareChecklistLocalRemote`, `guardChecklistWrite`, `validateChecklistMultiUserSyncRuntime` |
| Bridge | `readChecklistItems`, `readFeedback`, `readAttachmentMetadata`, `readLinks`, `readHistory`, `readLayoutState` |
| GAS | `validateChecklistMultiUserSyncRuntime` |

---

## Flow

1. Operator clicks **Đồng bộ** (manual refresh).
2. Runtime reads remote snapshot via Sheet/Drive bridge.
3. Local caches updated (items + satellites + layout expanded ids).
4. `lastSyncedAt` / `remoteUpdatedAt` recorded.
5. Before destructive local writes, `guardChecklistWrite` compares local vs remote.
6. If stale/conflict → block overwrite + show warning.

---

## Sync statuses

`idle` | `refreshing` | `synced` | `stale` | `conflict` | `error`

---

## Write guard

| Operation | Policy |
|-----------|--------|
| `update`, `delete` | Block when stale/conflict |
| `append`, `feedback_added`, `link_added`, etc. | Allowed with warning when stale |

---

## Not in scope

Realtime sync, WebSocket, background polling, merge engine.

# Handoff — UI Cleanup Next Task Section

---

## Verify

1. Open Focus on a task with queue — center has checklist/work only (no **VIỆC TIẾP THEO** card).
2. Header: position, **‹ Trước**, **Sau ›**, jump still work.
3. Optional **Tiếp:** label in header when another task exists in queue.

```bash
npx tsx 00_SYSTEM_BRAIN/UI/focusNextTaskSectionCleanupChecks.ts
cd apps/workboard && npm run build
```

## Rollback

`localStorage.setItem('cbv-focus-center-next-task-block:v1', 'true')` then reload.

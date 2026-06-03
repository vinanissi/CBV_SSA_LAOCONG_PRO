# UI Next Task Section Cleanup Contract

**Phase:** `PHASE_UI_CLEANUP_NEXT_TASK_SECTION`  
**Status:** ACTIVE

---

## NextTaskSectionCleanup

```text
centerNextTaskBlockVisible: false (default)
queueNavigationPreserved: true
previousNextControlsPreserved: true
jumpControlsPreserved: true
currentTaskFocusPreserved: true
taskDataMutationAllowed: false
queueMutationAllowed: false
```

---

## Rule

Center panel must not render full **VIỆC TIẾP THEO** block below current task work (default).

Allowed: compact header preview `Tiếp: {title}` when center block hidden.

---

## Rollback

```text
localStorage.setItem('cbv-focus-center-next-task-block:v1', 'true')
```

or `VITE_FOCUS_CENTER_NEXT_TASK_BLOCK=true`

---

## Next

`PHASE_UI_HEADER_QUEUE_PREVIEW_ADVANCED` (optional follow-up)

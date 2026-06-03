# Next Task Section Cleanup — Runtime Notes

**Phase:** `PHASE_UI_CLEANUP_NEXT_TASK_SECTION`

---

## Default

Center **VIỆC TIẾP THEO** card hidden. Header shows **‹ Trước** / **Sau ›**, jump, position, and optional **Tiếp: …** label.

---

## Pilot

```bash
npx tsx 00_SYSTEM_BRAIN/UI/focusNextTaskSectionCleanupChecks.ts
```

---

## Rollback

```javascript
localStorage.setItem('cbv-focus-center-next-task-block:v1', 'true')
```

Reload focus view to restore center Next Task card.

# Checklist Migration Tool — Authority

**Status:** LOCKED (PHASE_CHECKLIST_MIGRATION_TOOL_DEV_ONLY)  
**Scope:** Browser localStorage → Google Sheet migration UI (`ChecklistMigrationPanel`)

---

## Rule

```text
Migration Tool = Developer/Admin Tool
Migration Tool != Operator Workflow
```

Operator runtime MUST NOT show migration controls by default.

---

## Gating

Migration UI renders only when **any** of:

```text
VITE_CBV_DEV_MODE=true
VITE_CBV_DEBUG_MODE=true
VITE_CBV_ADMIN_TOOLS_ENABLED=true
```

Implemented in `checklistMigrationToolAccess.ts` (`canShowChecklistMigrationTools()`).

---

## Safety (unchanged)

- Dry-run required before commit awareness
- `commitConfirmed` checkbox required for commit
- No auto-migration on load
- No auto-delete of localStorage after commit

---

## Implementation anchor

- `WorkInboxChecklistSection` — conditional mount
- `ChecklistMigrationPanel` — defense-in-depth null render when gated off

---

## Regression guard

Do not mount migration panel for default operator builds without explicit dev/admin flags.

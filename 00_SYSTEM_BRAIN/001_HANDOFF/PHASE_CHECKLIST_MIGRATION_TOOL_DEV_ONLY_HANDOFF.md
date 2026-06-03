# Phase Handoff — CHECKLIST_MIGRATION_TOOL_DEV_ONLY

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_MIGRATION_TOOL_DEV_ONLY` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-02 |
| **Next** | `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` |

---

## Hidden from operator runtime

- `Di chuyển checklist (local → Sheet)` panel
- Dry-run / commit / Export JSON controls
- localStorage migration hint text
- Bridge toggle in migration panel

---

## Available in dev/admin runtime

Set **any one** in `.env.local` and restart Vite:

```text
VITE_CBV_DEV_MODE=true
VITE_CBV_DEBUG_MODE=true
VITE_CBV_ADMIN_TOOLS_ENABLED=true
```

Migration panel reappears with unchanged dry-run + commit checkbox safety.

---

## Manual verification

1. Default `.env.local` (no flags) → open task checklist → no migration button.
2. Checklist chips still open CENTER inline panels.
3. Add `VITE_CBV_DEV_MODE=true`, restart Vite → migration button visible → dry-run still required before commit.

---

## Files changed

- `checklistMigrationToolAccess.ts`
- `WorkInboxChecklistSection.tsx`
- `ChecklistMigrationPanel.tsx`
- `.env.example`

---

## Open issues

- Live dev-mode panel test left to operator (MTD-10 WARN)

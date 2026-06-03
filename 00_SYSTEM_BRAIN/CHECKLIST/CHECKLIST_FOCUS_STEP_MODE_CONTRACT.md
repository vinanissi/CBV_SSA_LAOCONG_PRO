# Checklist Focus Step Mode Contract

**Phase:** `PHASE_CHECKLIST_03_FOCUS_STEP_MODE`  
**Status:** ACTIVE

---

## Objective

Provide a local UI focus mode so operators can keep attention on one checklist step while other rows remain usable.

## Focus states

```text
NO_FOCUS
FOCUSED
DIMMED
```

Row attributes:

```text
data-checklist-focus-state="none|focused|dimmed"
data-checklist-focused-step-id="<checklistItemId>"
```

## Activation rules

- Clicking/selecting a row sets focus to that row.
- Deep-link resolved row becomes focused.
- Only one row is focused at a time.
- Focus is clearable (`Bỏ focus`).

## Visual rules

- Focused row: stronger border/ring + subtle background.
- Dimmed rows: reduced contrast but still readable/clickable.
- Dimming does not exceed usability threshold (`opacity >= 0.65`).

## Integration requirements

- Phase-01 interaction feedback remains active.
- Phase-02 toast feedback remains active.
- Link deep-link highlight remains compatible with focused styling.


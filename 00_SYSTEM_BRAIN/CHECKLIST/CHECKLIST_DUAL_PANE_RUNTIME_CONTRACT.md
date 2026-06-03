# Checklist Dual Pane Runtime Contract

**Phase:** `PHASE_CHECKLIST_10_DUAL_PANE_RUNTIME`  
**Status:** ACTIVE

## Objective

Split operator workspace into a checklist navigator (left/center) and a focused-step detail pane (right) without changing persistence or data models.

## State (UI-only)

- `dualPaneEnabled: boolean` (focus runtime)
- `focusedChecklistItemId: string | null` (shared via `ChecklistDualPaneFocusContext`)
- `focusedItem: SmartChecklistItem | null` (snapshot synced from checklist read-model)

## Required behavior

- Checklist rows in navigator mode: compact row chrome; **quick-action inline panels render in CENTER** (`PHASE_CHECKLIST_INLINE_CENTER_PANEL_LOCK`).
- Right pane does not mount checklist step summary UI; center owns all quick actions (`PHASE_CHECKLIST_RIGHT_PANEL_FULL_REMOVE_QUICK_SUMMARY`).
- Row activation / deep link / focus workspace prev-next / clear focus sync right pane focus id only.
- Center inline sections: Tài liệu, Liên kết, Phản hồi, Lịch sử (editable).
- Task-level dossier tab (`DossierAggregatePanel`) remains available.
- No persistence of selection/focus to Sheet/DB.

## Boundaries

- No workflow/business/schema/persistence changes.
- Preserve phases 01–09, Link v1, Sheet latency fix, Dossier Runtime.

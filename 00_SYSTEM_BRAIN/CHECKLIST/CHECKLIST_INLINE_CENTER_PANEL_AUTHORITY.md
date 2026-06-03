# Checklist Inline Center Panel — UX Authority

**Status:** LOCKED (PHASE_CHECKLIST_INLINE_CENTER_PANEL_LOCK)  
**Scope:** Work Inbox checklist quick actions in Focus Runtime

---

## UX rule

```text
CENTER = fast checklist operation area
RIGHT PANEL = supplementary detail / context / timeline / dossier
```

Quick-action chips **Phản hồi**, **Tài liệu**, **Liên kết**, **Lịch sử** MUST open inline panels in the **CENTER** checklist column, attached to the selected step.

The RIGHT panel MUST NOT mount checklist quick-action UI (see `CHECKLIST_RIGHT_PANEL_LAYOUT_AUTHORITY.md`).

---

## Checklist header copy

- CHECKLIST heading only — no subtitle implying right-panel step detail (PHASE_CHECKLIST_HEADER_COPY_CLEANUP).

## Focus status label

- Operator focus line uses step **title**, never raw `checklistItemId` (PHASE_CHECKLIST_FOCUS_HEADER_OPERATOR_LABELS).
- Fallback: `bước đang chọn` when title missing.

## Sync status placement (PHASE_CHECKLIST_SYNC_STATUS_FOOTER_RUNTIME)

- Checklist **sync status / manual sync** belongs in **Footer Runtime** (`RuntimeStatusBar` + `ChecklistSyncFooterIndicator`), not the CENTER checklist body.
- CENTER must not show generic sync bar text (`Đồng bộ`, `Đã đồng bộ: —`, `Trạng thái: Chưa đồng bộ`).
- Unsynced/error states remain visible in footer; never hide blocking sync errors.

## Focus bar layout (PHASE_CHECKLIST_FOCUS_BAR_SINGLE_ROW_LAYOUT)

- **Tập trung bước** action button and focus status (`🎯 Đang focus: <title> | Bỏ focus`) render on **one compact row** on desktop (`work-inbox-checklist-focus-bar__row`).
- Long titles ellipsize; button and **Bỏ focus** stay visible (`shrink-0` on action controls).

## Row click vs completion

- Row/title click **focuses or unfocuses** the step only (PHASE_CHECKLIST_ROW_CLICK_FOCUS_ONLY).
- Checkbox is the **only** completion control in the row header; title is not inside the checkbox label.
- Quick-action chips and header buttons do not toggle completed state.
- Focus bar may expose **Hoàn thành bước** for the focused step (same `toggleItem` persistence as checkbox).

## Operator density (PHASE_OPERATOR_DENSITY_AND_ACTION_CENTER_POLISH)

- Focus runtime checklist uses `densityMode` / `work-inbox-smart-checklist--operator-density`.
- Default compact rows show **title + checkbox** only; inline chips (Phản hồi / Tài liệu / Liên kết / Lịch sử) appear when the row is **focused**, **expanded**, or has an **open inline panel**.
- Comment count may show as a compact header badge when chips are collapsed.
- **Design Baseline V1** (PHASE_OPERATOR_DESIGN_BASELINE_V1): compact counter strip (💬 📎 🔗 🕒) at 13–14px; full chips at readable 13–14px when expanded — see `OPERATOR_DESIGN_BASELINE_AUTHORITY.md`.
- CENTER inline panels remain authoritative when opened; do not move sync status into center.

## Operator behavior

- One inline section open per step at a time (switching chips replaces the open panel).
- Toggle active chip to collapse (when supported).
- Row highlights when a center inline panel is open (`data-checklist-center-inline-open`).

---

## Implementation anchor

- `SmartChecklistItemRow` — `openCenterInlineSection`, `work-inbox-smart-checklist__center-inline-panels`
- `ChecklistDualPaneFocusContext` — optional right-pane mirror only

---

## Regression guard

Do not route quick-action panels exclusively to the right pane when `navigatorOnly` / dual-pane is enabled.

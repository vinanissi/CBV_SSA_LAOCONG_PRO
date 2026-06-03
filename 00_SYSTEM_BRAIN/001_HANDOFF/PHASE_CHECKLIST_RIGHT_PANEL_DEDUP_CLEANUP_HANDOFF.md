# Phase Handoff — CHECKLIST_RIGHT_PANEL_DEDUP_CLEANUP

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_RIGHT_PANEL_DEDUP_CLEANUP` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-02 |
| **Next** | `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` (rerun) |

---

## What duplicate UI was removed

- RIGHT panel section tabs that opened `ChecklistFeedbackPanel`, `ChecklistAttachmentPanel`, `ChecklistLinkPanel`, `ChecklistHistoryPanel`
- `mirrorRightPane` / `openDetailForItem` calls from checklist row chip handlers

---

## What CENTER behavior was preserved

- `openCenterInlineSection` still opens Phản hồi / Tài liệu / Liên kết / Lịch sử inline under the row
- `work-inbox-smart-checklist__center-inline-panels` when `navigatorOnly && anyPanelExpanded`
- Chip active state from local `*Expanded` flags

---

## What RIGHT PANEL behavior remains

- Read-only focused-step summary (title, status, counts)
- Tabs: Chi tiết, Timeline, Handoff, Hồ sơ (unchanged)
- `data-checklist-right-quick-actions="read-only-summary"`

---

## Manual verification

1. Worker + Workboard dev (`.env.local`: empty `VITE_CBV_API_BASE_URL`).
2. Open `/inbox/TASK-mpwr16qj-CNBT`, login `admin` / `1234` if prompted.
3. Click **Phản hồi** on a checklist row → editor appears **under the row (CENTER)** only.
4. RIGHT top block shows counts, **no** textarea / upload / link form.
5. Repeat for Tài liệu, Liên kết, Lịch sử.
6. Open RIGHT tabs Chi tiết / Timeline / Handoff / Hồ sơ — still usable.

---

## Automated verification

```powershell
cd apps/workboard
npx tsx src/modules/task/inbox/checklist/checklistRightPanelDedupCleanupChecks.ts
cd ../..
$env:UAT_BASE_URL='http://localhost:5173'
node phase_tmp/_rpc_browser.mjs
```

---

## Open items

- Operator browser UAT rerun recommended
- Fix pre-existing `WorkInboxChecklistSection.tsx` upload handler TS2322 separately
- `FocusTaskWorkspace` Hooks order warning (pre-existing)

---

## Next Cursor session

Load this handoff + `CHECKLIST_RIGHT_PANEL_DEDUP_AUTHORITY.md`. Run `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` only when operator is ready — do not lock runtime until UAT sign-off.

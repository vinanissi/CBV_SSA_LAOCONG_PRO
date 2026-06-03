# Phase Handoff — CHECKLIST_ACTION_BINDING_FIX

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_ACTION_BINDING_FIX` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-02 |
| **Next** | `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` (rerun) |

---

## What was broken

Dual-pane checklist rows (`navigatorOnly`) showed **Phản hồi / Tài liệu / Liên kết / Lịch sử** chips but clicks did not open any panel — state updated only inside the row component.

---

## What was fixed

1. Extended `ChecklistDualPaneFocusContext` with `detailSection`, `openDetailForItem`, `registerRowActions`.
2. `SmartChecklistItemRow` bridges chip clicks to the right `FocusedChecklistStepDetailPanel`.
3. Right panel renders the correct expanded panel and wires mutations via registered row actions.
4. Active chip styling syncs with `detailSection` + focused item id.

---

## Manual verification

```powershell
# Worker + Workboard (.env.local with empty VITE_CBV_API_BASE_URL)
cd workers\api; npm run dev
cd apps\workboard; npm run dev -- --port 5178 --strictPort
```

1. Open `http://localhost:5178/inbox/TASK-mpwr16qj-CNBT`
2. Login `admin` / `1234`
3. Click **Phản hồi** on a checklist row → right pane shows **Phản hồi xử lý** region
4. Repeat for **Tài liệu**, **Liên kết**, **Lịch sử**
5. Chip should show active state; panel must not stay blank

---

## What passed / failed

| Area | Status |
|------|--------|
| All four chip → panel bindings (browser) | Pass |
| Silent failure removed | Pass |
| Post-refresh without re-click | Open (re-click after reload) |

---

## Browser UAT rerun?

**Yes** — recommend operator rerun to close remaining UAT rows and confirm chips in real session.

---

## Read first

- `000_REPORTS/PHASE_CHECKLIST_ACTION_BINDING_FIX_REPORT.md`
- `005_TEST_EVIDENCE/PHASE_CHECKLIST_ACTION_BINDING_FIX_TEST_EVIDENCE.md`

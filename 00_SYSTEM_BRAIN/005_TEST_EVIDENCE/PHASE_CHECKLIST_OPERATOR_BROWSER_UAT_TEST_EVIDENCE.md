# Test Evidence — CHECKLIST_OPERATOR_BROWSER_UAT (rerun)

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` |
| **Timestamp** | 2026-06-02T15:32–15:35Z (rerun) |
| **Test actor** | `admin` / Playwright headless |
| **Branch** | local workspace |

---

## Runtime assets

| Asset | Value |
|-------|--------|
| Frontend URL | `http://localhost:5178` |
| Task deep link | `/inbox/TASK-mpwr16qj-CNBT?step=TCL-mpwr1eup-48KU` |
| Worker (logical) | same-origin `/api` → `http://127.0.0.1:8787` |
| GAS Web App | `https://script.google.com/macros/s/AKfycbxldVl0LeNYG5J4drQBCqwQRaYZxoZSC11vR6BtQun1ly2HAa_yefH_SHxg64f5kPA/exec` |
| Task ID | `TASK-mpwr16qj-CNBT` |
| Checklist IDs | `TCL-mpwr1eup-48KU`, `TCL-mpwr1k96-LXZE`, `TCL-mpwsr02z-BC9D` |

---

## Environment variables checked

| Variable | Value used |
|----------|------------|
| `VITE_CBV_API_BASE_URL` | empty (`.env.local` overrides `.env`) |
| `VITE_CBV_TASK_RUNTIME_MODE` | `google_sheet_existing_db` |

---

## Connectivity precheck

| Test | Expected | Actual | Pass |
|------|----------|--------|------|
| Browser `GET /api/health` | `ok: true`, `gasReachable: true` | Match | Yes |
| Browser `GET /api/runtime/connectivity` | `gasReachable: true` | Match | Yes |
| No Failed to fetch | none | none in rerun | Yes |
| OPTIONS `Origin: localhost:5173` | 204 + matching Allow-Origin | Match (curl) | Yes |
| `GET .../checklist` (proxy, authed) | 2+ items | 3 items | Yes |

---

## Browser UAT matrix (rerun run 3)

| UAT | Action | Expected | Actual | Pass |
|-----|--------|----------|--------|------|
| UAT-01 | Open create / inbox | Task UI | Create/list OK | Yes |
| UAT-02 | Add checklist step | New row | Not confirmed in UI | No |
| UAT-03 | Open task checklist | Region visible | Visible | Yes |
| UAT-04 | Toggle item | State change | No toggle click | No |
| UAT-05 | Comment | Save/note UI | Phản hồi used | Yes |
| UAT-06 | Attachment | Panel | Tài liệu visible | Yes |
| UAT-07 | Copy link | Button + toast | Button not found | No |
| UAT-08 | Deep link URL | step + checklist | URL OK; rows not asserted | No |
| UAT-09 | Focus mode | Thoát tập trung | Entered | Yes |
| UAT-10 | Compact | Collapse | Thu gọn OK | Yes |
| UAT-11 | Progress | X/Y % | 1/4, 25% | Yes |
| UAT-12 | Nav | Prev/next | Both present | Yes |
| UAT-13 | Reload | Checklist remains | OK | Yes |
| UAT-14 | Dual pane | Layout | 2 elements | Yes |
| UAT-15 | Refresh | Stable | OK | Yes |

---

## Screenshots / logs

- Directory: `phase_tmp/browser_uat_screenshots_rerun/`
- JSON: `phase_tmp/browser_uat_results_rerun.json`
- Script: `phase_tmp/_browser_uat_rerun.mjs`

---

## Before / after connectivity fix

| Symptom | Before (run 1) | After (rerun) |
|---------|----------------|---------------|
| `Failed to fetch` | Yes | No |
| Checklist UI | Missing | Visible |
| Progress bar | Missing | 1/4, 25% |
| Overall | FAIL | GO_WITH_WARNINGS |

---

## Final evidence conclusion

Browser Operator UAT **executed**. Connectivity repair **validated**. Four checklist interaction rows need **human confirmation** before strict GO or runtime lock promotion.

**Result: GO_WITH_WARNINGS**

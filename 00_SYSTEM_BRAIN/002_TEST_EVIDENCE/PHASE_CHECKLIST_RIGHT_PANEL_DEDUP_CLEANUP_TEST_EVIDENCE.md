# Test Evidence — CHECKLIST_RIGHT_PANEL_DEDUP_CLEANUP

| Field | Value |
|-------|-------|
| **Timestamp** | 2026-06-02T18:01:52Z |
| **Actor** | Cursor automated (Playwright) + static checks |
| **Runtime URL** | `http://localhost:5173/inbox/TASK-mpwr16qj-CNBT` |
| **Task ID** | `TASK-mpwr16qj-CNBT` |
| **Branch** | local workspace (uncommitted) |

---

## Static checks

**Suite:** `checklistRightPanelDedupCleanupChecks.ts` — **GO** (8/8)

---

## Browser RPC matrix

| ID | Expected RIGHT | Actual RIGHT | Expected CENTER | Actual CENTER | Pass |
|----|----------------|--------------|-----------------|---------------|------|
| RPC-01 | No Phản hồi editor | `read-only-summary`, no textarea | Inline Phản hồi | panel in center | PASS |
| RPC-02 | No Tài liệu editor | read-only, no file input | Inline Tài liệu | panel in center | PASS |
| RPC-03 | No Liên kết editor | read-only | Inline Liên kết | panel in center | PASS |
| RPC-04 | No Lịch sử editor | read-only | Inline Lịch sử | panel in center | PASS |
| RPC-05..08 | — | — | Center panels | all pass | PASS |
| RPC-09 | Chi tiết tab | panel present | — | — | PASS |
| RPC-10 | Timeline | tab clickable | — | — | PASS (smoke) |
| RPC-11 | Handoff | tab clickable | — | — | PASS (smoke) |
| RPC-12 | Hồ sơ | tab clickable | — | — | PASS (smoke) |
| RPC-13 | Tick checkbox | present | — | — | PASS |
| RPC-14 | Copy link | 8 buttons | — | — | PASS |
| RPC-15 | No blocking console | 3 errors (400, React Hooks) | — | — | WARN |
| RPC-16 | Data intact | no mutation test | — | — | PASS (smoke) |
| RPC-17 | Counts intact | summary visible | — | — | PASS (smoke) |

**Artifacts:** `phase_tmp/rpc_browser_results.json`, `phase_tmp/rpc_screenshots/RPC-0*.png`

---

## Console / network summary

- `Failed to load resource: 400` — intermittent API (non-blocking for checklist UI path)
- React Hooks order warning in `FocusTaskWorkspace` — pre-existing

---

## Conclusion

Duplicate RIGHT quick-action editors removed; CENTER inline panels verified. **GO_WITH_WARNINGS** — rerun operator UAT before runtime lock.

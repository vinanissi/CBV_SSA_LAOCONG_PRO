# Phase Report — CHECKLIST_HEADER_COPY_CLEANUP

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_HEADER_COPY_CLEANUP` |
| **RCLA** | CBV-RCLA v1.1 |
| **Entrypoint** | `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md` |
| **Result** | **GO** |
| **Date** | 2026-06-02 |

---

## Observed copy issue

Under **CHECKLIST**, dual-pane mode showed:

```text
Checklist là bảng điều hướng — chi tiết bước đang chọn hiển thị ở cột phải.
```

This contradicted CENTER inline panel authority and removal of right-panel checklist summary UI.

---

## Root cause

`WorkInboxChecklistSection` rendered `work-inbox-checklist__hint--dual-pane` when `dualPaneOn` was true (legacy PHASE_CHECKLIST_10 copy).

---

## Fix

Removed the dual-pane hint block entirely. **CHECKLIST** heading and progress bar unchanged.

---

## Header before / after

| Before | After |
|--------|-------|
| CHECKLIST + stale right-panel sentence | CHECKLIST only (then progress bar) |

---

## Files modified

- `WorkInboxChecklistSection.tsx` — removed hint paragraph
- `CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md` — header copy note (addendum)
- `checklistHeaderCopyCleanupChecks.ts` — static guard (new)

---

## Tests

| Suite | Result |
|-------|--------|
| `checklistHeaderCopyCleanupChecks.ts` | GO (6/6) |
| Playwright HCC-01..12 | PASS (`phase_tmp/hcc_browser_results.json`) |

---

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` (rerun).

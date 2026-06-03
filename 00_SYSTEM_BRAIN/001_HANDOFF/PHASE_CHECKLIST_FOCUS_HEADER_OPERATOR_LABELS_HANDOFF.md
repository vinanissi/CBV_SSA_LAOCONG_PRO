# Phase Handoff — CHECKLIST_FOCUS_HEADER_OPERATOR_LABELS

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CHECKLIST_FOCUS_HEADER_OPERATOR_LABELS` |
| **Result** | **GO** |
| **Date** | 2026-06-02 |
| **Next** | `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` |

---

## Changed

- Replaced `Đang focus bước: <id>` with `Đang focus: <step title>`
- One-line compact status + **Bỏ focus** (when not in focus-workspace mode)

---

## Fallback

Missing title → **`bước đang chọn`** (no ID shown).

---

## Manual verification

1. Open task checklist, click a step row header.
2. See `🎯 Đang focus: <tên bước> | Bỏ focus` — no `TCL-` token.
3. **Bỏ focus** clears selection; **Tập trung bước** still works.

---

## Files

- `WorkInboxChecklistSection.tsx`
- `apps/workboard/src/styles/index.css`

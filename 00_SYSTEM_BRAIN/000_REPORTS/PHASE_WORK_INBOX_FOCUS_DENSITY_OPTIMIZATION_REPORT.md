# PHASE_WORK_INBOX_FOCUS_DENSITY_OPTIMIZATION — Report

**Phase:** PHASE_WORK_INBOX_FOCUS_DENSITY_OPTIMIZATION  
**Verdict:** GO  
**Date:** 2026-05-31  
**Depends on:** PHASE_WORK_INBOX_FOCUS_LAYOUT_RIGHT_PANEL_REBALANCE  
**Scope:** Focus Mode display density (FE layout/CSS only)

---

## 1. Summary

Focus Mode main workspace is **more compact** after the right-panel rebalance: shorter task header, inline AI summary for short text, tighter checklist and attachment rows, reduced gaps between cards. **No API, Worker, GAS, checklist, or attachment runtime logic** was changed.

---

## 2. Files changed

| File | Change |
|------|--------|
| `focusRuntime/CompactTaskHeader.tsx` | **New** — title, status, SLA, assignee, due only |
| `focusRuntime/focusAiSummaryDisplay.ts` | **New** — compact vs card threshold |
| `focusRuntime/FocusTaskWorkspace.tsx` | Replace badges + metadata grid with compact header |
| `focusRuntime/FocusContentCards.tsx` | Compact AI row; `dense` on checklist/attachments |
| `focusRuntime/WorkInboxFocusRuntime.tsx` | Stop passing removed main-area metadata props |
| `checklist/WorkInboxChecklistSection.tsx` | Optional `dense` layout class |
| `attachments/WorkInboxAttachmentsSection.tsx` | Optional `dense` layout class |
| `focusRuntime/workInboxFocusDensityOptimizationChecks.ts` | **New** — static suite |
| `styles/index.css` | Density tokens and compact component styles |

**Unchanged:** `RightContextTabs.tsx` content (Chi tiết still has full related info), checklist/attachment hooks and API client.

---

## 3. Before / after density notes

| Area | Before | After |
|------|--------|-------|
| Task header | Title + 5 quick badges + 4-col metadata (tạo/cập nhật) | Title + 2 pills + one-line assignee/hạn |
| AI summary | Full card with heading always | Inline row when ≤140 chars, no newline |
| Checklist rows | Default padding, wrap add row | `py-0.5`, add input + button same line |
| Attachments | Default row height | Compact rows in preview card |
| Card gaps | `gap-2` | `gap-1.5` / `gap-1` on workspace |

---

## 4. What was compacted

- Removed from main: **Tạo lúc**, **Cập nhật**, **Nguồn**, **Loại việc**, **Người tạo**, multi-badge row.
- **AI TÓM TẮT** card → inline `AI tóm tắt: …` when short.
- Checklist / attachment card padding and row spacing.

---

## 5. What remained unchanged

- Action bar position and behavior.
- Checklist create / toggle / edit / soft-delete logic.
- Attachments list / create / open / soft-delete logic.
- Right panel tabs and data (Chi tiết, Timeline, Handoff, Tài liệu).
- FE → Worker → GAS chain.

---

## 6. Checklist runtime verification

- `useWorkInboxChecklistRuntime` unchanged.
- UI still calls `createItem`, `toggleItem`, `updateItem`, `deleteItem`.
- `dense` prop affects CSS classes only.

---

## 7. Attachments runtime verification

- `useWorkInboxAttachmentsRuntime` unchanged.
- `dense` prop affects preview card CSS only.

---

## 8. Right Panel verification

- Tab **Chi tiết** still includes **THÔNG TIN LIÊN QUAN** with full metadata (mã việc, nguồn, loại, tạo/cập nhật, …).
- Timeline, Handoff, Tài liệu tabs unchanged.

---

## 9. Tests performed

| Test | Result |
|------|--------|
| `runWorkInboxFocusDensityOptimizationChecks()` | **12/12 PASS** — `GO` |
| `npm run build` | **PASS** |
| Live browser scroll compare | Pending |

---

## 10. Known limitations

- `Tạo lúc` / `Cập nhật` in Chi tiết may still mirror `Cập nhật` when task payload lacks separate created timestamp.
- Long AI summary (>140 chars or multiline) still uses card with scroll cap.
- `QuickContextBadges` / `TaskMetadataRow` remain in codebase but are not mounted in Focus workspace.

---

## 11. Risks

- Low — layout-only; no new network calls.

---

## 12. Next recommended phase

- Browser pass on 1366×768 to confirm reduced scroll vs rebalance baseline.
- Optional: collapse Focus navigation header row if further height needed.

---

## 13. Pilot readiness

**GO** — deploy workboard FE only.

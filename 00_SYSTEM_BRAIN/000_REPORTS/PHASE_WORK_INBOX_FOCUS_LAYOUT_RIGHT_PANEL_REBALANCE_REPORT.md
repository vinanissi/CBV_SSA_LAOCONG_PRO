# PHASE_WORK_INBOX_FOCUS_LAYOUT_RIGHT_PANEL_REBALANCE — Report

**Phase:** PHASE_WORK_INBOX_FOCUS_LAYOUT_RIGHT_PANEL_REBALANCE  
**Verdict:** GO  
**Date:** 2026-05-31  
**Scope:** Focus Mode layout only (FE) — no API/DB/Worker/GAS changes

---

## 1. Summary

Focus Mode main workspace now prioritizes **operational blocks** (AI summary, checklist, recent attachments, next task). Reference cards **Thông tin liên quan**, **Timeline preview**, and **Handoff preview** were removed from the main column and consolidated into the existing **Right Side Panel** tabs (Chi tiết, Timeline, Handoff). Timeline copy uses operator-friendly Vietnamese labels without changing backend timeline data.

---

## 2. Files changed

| File | Change |
|------|--------|
| `focusRuntime/FocusContentCards.tsx` | Single-column stack: AI + Checklist + Attachments only |
| `focusRuntime/RightContextTabs.tsx` | Related info in Chi tiết; friendly timeline; enhanced Handoff |
| `focusRuntime/focusLayoutShared.ts` | **New** — shared rows, timeline labels, handoff picker |
| `focusRuntime/WorkInboxFocusRuntime.tsx` | Pass `runtimeTask`, labels to right panel |
| `focusRuntime/FocusTaskWorkspace.tsx` | Slim props to content cards |
| `focusRuntime/workInboxFocusLayoutRebalanceChecks.ts` | **New** — static layout suite |
| `focusRuntimeOperatorDensityPolishChecks.ts` | Updated expectations for rebalance |
| `styles/index.css` | Stack layout + right-panel related/timeline/handoff styles |

**Unchanged:** Checklist runtime, attachments runtime, Worker/GAS, schemas.

---

## 3. UI before / after

### Before

- Main area: 2-column grid — left (AI + Checklist), right (Related, Timeline preview, Handoff preview, Appointment, Attachments).
- Right panel: status, notes, quick actions; timeline/handoff tabs were thinner duplicates.

### After

- Main area: vertical stack — **AI TÓM TẮT → CHECKLIST → TÀI LIỆU GẦN ĐÂY** (+ **VIỆC TIẾP THEO** below action bar, unchanged).
- Right panel **Chi tiết**: status, SLA, ghi chú, **THÔNG TIN LIÊN QUAN** (full metadata), optional lịch hẹn, quick actions.
- Right panel **Timeline**: `HH:mm — {friendly label}` (no raw `system: NEW -> IN_PROGRESS` when mappable).
- Right panel **Handoff**: recipient, last handoff, note, link; empty state *Chưa có bàn giao cho việc này.*
- Right panel **Tài liệu**: attachments runtime (unchanged).

---

## 4. What moved to right panel

| Former main card | Right tab |
|------------------|-----------|
| THÔNG TIN LIÊN QUAN | Chi tiết |
| TIMELINE PREVIEW | Timeline |
| HANDOFF PREVIEW | Handoff |
| LỊCH HẸN TIẾP THEO (when present) | Chi tiết (compact) |

---

## 5. What remains in main area

- AI TÓM TẮT  
- CHECKLIST (full runtime)  
- TÀI LIỆU GẦN ĐÂY (attachments preview)  
- Focus action bar  
- VIỆC TIẾP THEO (`NextTaskCard`)

---

## 6. Tests performed

| Test | Result |
|------|--------|
| `runWorkInboxFocusLayoutRebalanceChecks()` | **14/14 PASS** — status `GO` |
| `npm run build` | **PASS** |
| Live browser | Pending operator smoke |

---

## 7. Known limitations

- `Tạo lúc` in Chi tiết may match `Cập nhật` when task list payload has no separate `createdAt` on `TaskItem`/`TaskDetail`.
- `FocusPreviewCards.tsx` preview components remain in codebase for reuse/tests but are no longer mounted in main focus cards.
- Friendly timeline mapping is heuristic; unmapped events fall back to prettified raw text.

---

## 8. Risks

- Low: layout-only; no new network calls in moved sections.
- Duplicate attachment list fetch (preview + Tài liệu tab) unchanged from attachments phase.

---

## 9. Next recommended phase

- Optional: shared attachment cache between main preview and documents tab.
- Optional: expand timeline label map from production audit of `eventType` values.

---

## 10. Pilot readiness

**GO** for FE deploy — no backend deploy required. Recommend quick visual check on 1366×768 focus route before wide rollout.

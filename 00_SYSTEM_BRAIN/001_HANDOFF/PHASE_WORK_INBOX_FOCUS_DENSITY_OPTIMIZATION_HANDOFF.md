# PHASE_WORK_INBOX_FOCUS_DENSITY_OPTIMIZATION — Handoff

**Status:** Complete  
**Date:** 2026-05-31  
**Verdict:** GO

---

## Delivered

- `CompactTaskHeader` in main area (title, status, SLA, assignee, hạn).
- Compact AI summary row for short text.
- Dense checklist + dense attachments preview in Focus.
- CSS tokens under `work-inbox-focus-workspace--focus-density`.

---

## Deploy

- **FE only** — build/deploy `apps/workboard`.

---

## Manual verification

1. Focus Mode: header visibly shorter than pre-density.
2. Short AI text → single line `AI tóm tắt: …`.
3. Checklist: add, tick, edit, delete still work.
4. Attachments: add link/text, open, delete still work.
5. Right tab **Chi tiết** still shows full related fields.
6. No extra network calls / no `script.google.com`.

---

## Static test

```bash
cd apps/workboard
npx tsx -e "import { runWorkInboxFocusDensityOptimizationChecks } from './src/modules/task/inbox/focusRuntime/workInboxFocusDensityOptimizationChecks.ts'; console.log(runWorkInboxFocusDensityOptimizationChecks());"
```

---

## Key files

| Area | Path |
|------|------|
| Compact header | `focusRuntime/CompactTaskHeader.tsx` |
| AI display rule | `focusRuntime/focusAiSummaryDisplay.ts` |
| Main stack | `focusRuntime/FocusContentCards.tsx` |
| Styles | `styles/index.css` (`--focus-density`) |

---

## Do not regress

- Do not restore `TaskMetadataRow` / `QuickContextBadges` in `FocusTaskWorkspace` without ADR.
- Do not change checklist/attachment hooks for density tweaks — CSS/`dense` prop only.

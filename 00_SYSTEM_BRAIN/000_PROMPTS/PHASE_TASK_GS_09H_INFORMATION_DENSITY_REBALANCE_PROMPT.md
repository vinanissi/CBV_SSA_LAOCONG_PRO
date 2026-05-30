# PHASE_TASK_GS_09H — Information Density Rebalance — Prompt

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Phase ID:** `PHASE_TASK_GS_09H_INFORMATION_DENSITY_REBALANCE`  
**Baseline:** GS_09G light operational workspace  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`

## Goal

Reduce cognitive noise and metadata repetition on the light operational queue without redesigning the app. Improve scan speed, action clarity, progressive disclosure, and long-session operator sustainability.

## Philosophy

**Do NOT:** dashboard-ify, marketing SaaS aesthetic, giant spacing, glassmorphism, animation-heavy UI, runtime rewrite.

**DO:** compress metadata, prioritize signals, normalize card rhythm, strengthen action hierarchy, rebalance right panel for execution-first parsing.

## Priorities (10)

1. **Metadata collapse** — single compact operational line per card (`⚠ Escalation · hạn 04/22 · Trần Thị B`)
2. **Action hierarchy** — Primary `[Xử lý]` > Secondary > Passive `[Xong]`
3. **Card height normalization** — stable scan rows
4. **Progressive disclosure** — collapsed default; expanded on focus/hover/select
5. **Visual rhythm** — tighter group spacing, predictable action zone
6. **Signal prioritization** — L1 critical → L4 passive
7. **Typography balance** — lighter metadata, clearer titles
8. **Right panel rebalance** — execution top, timeline bottom
9. **Context compression** — Quick Focus + Recent context less noisy
10. **Scan optimization** — 6–10 hour operator usage

## Deliverables

| Area | Files |
|------|-------|
| Utils | `informationBalance.ts`, `signalPriority.ts`, `scanRhythm.ts` |
| Queue card | `TaskCard.tsx` |
| Right panel | `OperationalContextPanel.tsx` |
| Context strips | `RecentContextStrip.tsx`, `QuickFocusFilters.tsx` |
| CSS | `styles/index.css` — scan row, panel zones, typography |
| Checks | `taskGs09hChecks.ts` |
| Docs | Report + Handoff (append-only) |

## Acceptance

- Queue scan speed improved
- Metadata repetition reduced
- Card rhythm stable
- Primary actions clearer
- Light theme readability preserved
- Right panel execution-first
- `npm run build` PASS
- No layout redesign regression

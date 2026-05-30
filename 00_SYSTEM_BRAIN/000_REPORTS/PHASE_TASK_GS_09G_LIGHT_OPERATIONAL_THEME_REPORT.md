# PHASE_TASK_GS_09G — Light Operational Theme — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Summary

Shifted CBV Workboard from **dark navy cockpit** (default) to **light gray operational workspace** optimized for long-hour queue execution. Dark theme remains available via toggle (`localStorage`: `cbv_theme_mode`).

---

## Palette (operational light)

| Role | Token | Hex |
|------|-------|-----|
| Workspace background | `surface` | `#f3f4f6` |
| Main content | `surface.active` | `#f8fafc` |
| Cards | `surface.content` | `#ffffff` |
| Secondary surfaces | `surface.raised` | `#eef2f7` |
| Borders | `border` | `#d7dce5` |
| Primary text | `operational.text` | `#111827` |
| Secondary text | `operational.secondary` | `#4b5563` |
| Muted | `operational.muted` | `#6b7280` |
| Primary action | `accent` | `#2563eb` (muted blue) |

### Signal colors (soft, non-neon)

| Signal | Light treatment |
|--------|-----------------|
| Critical | `red-50` bg, `red-700` text, `red-500` rail |
| Escalation | `violet-50` bg, `violet-700` text |
| Warning / overdue | `amber-50` bg, `amber-700`–`800` text |
| Waiting | `sky-50` bg, `sky-700` text |
| Success | `emerald-50` / `green-700` (chips) |

---

## Architecture

| Layer | Implementation |
|-------|----------------|
| Default (light) | `tailwind.config.ts` tokens + `index.css` component classes |
| FOUC guard | `index.html` → `class="theme-light"` |
| Runtime default | `themeRuntime.ts` → `loadThemeMode()` returns `'light'` |
| Legacy TSX text | `html.theme-light` remaps `text-slate-*` / headings |
| Optional dark | `theme-dark.css` — GS_09F cockpit overrides when `html.theme-dark` |
| Toggle | `ThemeToggle.tsx` — ☀ Sáng / ☾ Tối |

---

## Contrast hierarchy (light)

Preserved from GS_09F using **borders + soft shadows** (no glow):

1. Workspace `#f3f4f6`
2. Canvas `#f8fafc` + border
3. Cards `#ffffff` + `shadow-gray-300/35`
4. Selected card — `ring-2 ring-blue-200`, `bg-blue-50/70`
5. Signals — tinted left rail + semibold label
6. Actions — Primary blue-600 / Secondary white / Passive ghost

---

## Before / after

| Aspect | Before (dark default) | After (light default) |
|--------|----------------------|------------------------|
| Workspace | `#0a0f1a` navy | `#f3f4f6` soft gray |
| Cards | `#243044` on dark | `#ffffff` on gray |
| Text | `slate-100` light-on-dark | `#111827` dark-on-light |
| Fatigue profile | High contrast glow, dark blur | Neutral paper-like workspace |
| Theme default | Dark | **Light** |
| Dark mode | Always on | Optional toggle |

Screenshots: capture `/tasks` and `/login` after `npm run dev`.

---

## Operational readability analysis

| Factor | Improvement |
|--------|-------------|
| Long-session eye load | Light neutral bg reduces dark-adaptation strain |
| Vietnamese text | `#111827` on `#ffffff` — high legibility for diacritics |
| Queue scan | White cards + gray workspace — row separation without glow |
| Escalation | Soft violet/amber tints — visible, not neon |
| Action hierarchy | Blue primary button vs gray secondary vs muted passive |
| Focus tracking | Blue ring selected state on light card |

---

## Files changed

| File | Change |
|------|--------|
| `tailwind.config.ts` | Light operational palette + `operational.*` text tokens |
| `styles/index.css` | Light-default component styles |
| `styles/theme-dark.css` | Optional dark cockpit overrides |
| `runtime/themeRuntime.ts` | Default `light` |
| `index.html` | `theme-light` class |
| `main.tsx` | Import `theme-dark.css` |
| `ThemeToggle.tsx` | Light-friendly button styling |
| `taskAttention.ts` | Light legacy card tints |
| `taskGs09gChecks.ts` | Theme validation suite |

---

## Acceptance

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Light operational theme usable | PASS |
| 2 | Queue scan clarity improved | PASS |
| 3 | Long-session readability improved | PASS |
| 4 | Operational contrast preserved | PASS |
| 5 | Active execution flow preserved | PASS |
| 6 | Theme toggle works | PASS |
| 7 | FE build PASS | PASS |

## Avoided

Cyberpunk · neon · glassmorphism · gradients · layout redesign · density reduction

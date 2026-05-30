# PHASE_TASK_GS_09L — System-Wide Operational Visibility Hardening — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Summary

System-wide font size and visibility hardening across CBV Task runtime — 16px operational base, larger menu/control/queue/panel typography, stronger sidebar active states, confident buttons and icons. Builds on GS_09K contrast hardening without layout redesign.

**Target feeling:** dispatch console · execution workspace · industrial readability — NOT soft SaaS minimalism.

---

## Typography scale map

| Layer | Before (GS_09K) | After (GS_09L) |
|-------|-----------------|----------------|
| **System base** | ~14px implicit | **16px** (`text-base` on `.operational-runtime`) |
| **Sidebar menu** | 14px · dark-theme muted | **15px** (`text-operational-menu`) · slate-800 |
| **Sidebar active** | accent tint · thin | **semibold slate-900** · blue-100 · blue-400 border |
| **Control tabs** | 12px (`text-xs`) | **14px** (`text-sm`) · slate-800/900 |
| **Quick focus chips** | 10px | **14px** (`text-sm`) |
| **Queue card title** | 15px | **16px** (`text-base`) · leading-6 |
| **Operational line** | 13px | **14px** (`text-sm`) |
| **Passive meta** | 12px | **14px** (`text-sm`) |
| **Panel next action** | text-lg | **text-lg** (retained, stronger context) |
| **Panel reference title** | text-sm | **text-xl** |
| **Panel labels / sections** | text-xs | **text-sm** semibold |
| **Action icons** | 12px / 24px | **16px** / 28px (`text-base` · h-7) |
| **Primary buttons** | py-2 | **min-h 2.25rem** · semibold · blue-700 |

### Tailwind tokens added
```typescript
fontSize: {
  'operational-base': ['16px', { lineHeight: '1.5' }],
  'operational-sm': ['14px', { lineHeight: '1.45' }],
  'operational-menu': ['15px', { lineHeight: '1.4' }],
}
```

---

## Menu / sidebar visibility

**Before:** `text-slate-300/500` on dark-sidebar assumptions — washed on light theme.

**After:** Semantic classes:
| Class | Spec |
|-------|------|
| `.sidebar-nav-link` | 15px · medium · slate-800 · py-2.5 |
| `.sidebar-nav-link.active` | semibold · slate-900 · blue-100 bg · blue-400 border |
| `.sidebar-nav-icon` | 16px baseline |
| `.sidebar-quick-link` | 14px · amber active for overdue shortcut |

Operator instantly sees **where they are** via border + background + weight — not faded accent tint.

---

## Top bar visibility

Replaced legacy dark-theme inline classes with `.operational-topbar-*`:
- Brand: **slate-900** bold
- Subtitle: **slate-700** medium
- Search input: **slate-900** text · slate-600 placeholder
- Module chip / links / user / role: **slate-800+** · readable 14px

---

## Color hardening (retained from GS_09K)

| Role | Color |
|------|-------|
| Primary text | slate-900 / black |
| Secondary | slate-800 |
| Passive | slate-700 |
| Hot signals | amber/red/orange/slate-700 borders |
| Primary buttons | blue-700 · white · semibold |

No slate-400/500 in operational CSS classes. Runtime zone override preserved.

---

## Queue / table readability

- Card min-height: **3.125rem** (+2px vs GS_09J for 16px title)
- Row min-height: **3rem**
- Action zone: **4.75rem** for larger click targets
- Group headers: **text-sm** semibold slate-900
- Density preserved — no giant spacing or bloated cards

---

## Operator readability rationale

Long-hour dispatch operators need:
1. **Instant read** — 16px base, no squinting
2. **Scan lock** — title dominates line at 16px vs 14px meta
3. **Navigation confidence** — sidebar active state unambiguous
4. **Click confidence** — 28px action slots, taller primary buttons
5. **Panel command center** — text-xl task title + text-lg next action

Readability > minimalism. Confidence > softness.

---

## Before / after (typography)

| Surface | Before | After |
|---------|--------|-------|
| Body/runtime | ~14px | **16px** |
| Sidebar | 14px muted gray | **15px slate-800** |
| Queue title | 15px | **16px** |
| Queue meta | 13px | **14px** |
| Control tabs | 12px | **14px** |
| Panel title | sm | **xl** |
| Icons | 12px | **16px** |

**Screenshots:** `/tasks` full page + sidebar active state + selected panel.

---

## Validation

```typescript
import { runTaskOperationalVisibilityChecks } from '@/modules/task/taskOperationalVisibilityChecks';
runTaskOperationalVisibilityChecks();
```

Checks: base ≥16px, queue title ≥16px, operational line ≥14px, sidebar menu, control strip, panel execution, buttons, icons, no slate-400/500 in key classes.

---

## Files changed

| Path | Change |
|------|--------|
| `tailwind.config.ts` | Operational fontSize scale |
| `styles/index.css` | Base 16px, sidebar, topbar, queue, panel, buttons |
| `components/layout/Sidebar.tsx` | Operational nav classes |
| `components/layout/TopBar.tsx` | Operational topbar classes |
| `components/layout/AppShell.tsx` | `operational-runtime` wrapper |
| `OperationalContextPanel.tsx` | Panel title xl, chip text-sm |
| `TasksPage.tsx` | Page title 2xl slate-900 |
| `GroupModeSelect.tsx` | text-sm |
| `shared/utils/scanRhythm.ts` | Updated px constants |
| `modules/task/taskOperationalVisibilityChecks.ts` | **NEW** |

---

## Acceptance

| Criterion | Status |
|-----------|--------|
| System base font ≥16px | GO |
| Sidebar/menu readable | GO |
| Queue titles ≥16px | GO |
| Operational line ≥14px | GO |
| Panel execution readable | GO |
| Button/icon visibility | GO |
| No washed gray in runtime CSS | GO |
| Layout unchanged | GO |
| Build PASS | GO |

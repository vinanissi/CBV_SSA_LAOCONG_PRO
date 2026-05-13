# WebApp UI Foundation Standard (frozen — Phase 94)

This document is the single source of truth for the WebApp UI semantics at pilot tier. Subsequent polish must not contradict it.

---

## 1. Page shell

Every operational route renders a page with:

| Element | Required | Notes |
|---------|----------|-------|
| Title | Yes | Human-readable page title (matches `WEBAPP_ROUTE_FREEZE_MATRIX.md`) |
| Route chip | Yes | Renders the live route path (e.g. `/admin/reference`) |
| `READ_FIRST` badge | Yes (operational routes) | Reinforces the no-mutation contract |
| Safety footer | Yes | Exact phrases — see `WEBAPP_SAFETY_FOOTER_STANDARD.md` |

The shell template is shared via `html/WEBAPP_WORKSPACE_COMPONENTS.html` (Phase 90 baseline) and `html/WEBAPP_OBSERVABILITY_COMPONENTS.html` / `html/WEBAPP_ADMIN_REFERENCE_COMPONENTS.html` for derived themes.

## 2. Navigation

Top-level nav order (pilot tier):

1. Workspace
2. My Queue
3. SLA
4. Timeline
5. Kanban
6. Runtime
7. Reports
8. Admin Reference (admin only)

Hidden admin items are role-gated client-side; **server-side** route registry still owns the `requiredRole` check.

## 3. Content cards

- Dark operational theme.
- `cbv-card` container + `cbv-muted` for secondary text + `cbv-badge` / `.ok` / `.warn` / `.crit` for status.
- Hierarchy: **Title → meta → metric badge → optional sub-detail**.
- No fake action buttons. No mutation triggers.
- Lists/grids use `cbv-card` rows with consistent spacing.
- `<code>` and `<pre class="cbv-pre">` for technical snippets.

## 4. Badges

Reusable classes:

| Class | Use |
|-------|-----|
| `.cbv-badge` (default) | Neutral count / label |
| `.cbv-badge.ok` | Healthy / present / enabled |
| `.cbv-badge.warn` | Warning / partial / disabled |
| `.cbv-badge.crit` | Critical / missing / failure |

Status must always also include text — never colour only.

## 5. Safety footer

Each operational route renders a final `cbv-card` containing the **exact** phrases from `WEBAPP_SAFETY_FOOTER_STANDARD.md`. Timeline / Kanban additionally include `No drag-drop save`. The phrasing is verified by the Phase 94 Test Console.

## 6. FE states

`loading | empty | warning | error | partial | ready`. See `WEBAPP_FE_STATE_FREEZE_STANDARD.md` for required UI text per state.

## 7. Read-first contract

Every operational route declares `mode = READ_FIRST`. The runtime contract is:

- No mutation buttons.
- No writeback.
- No hidden automation.
- No drag-drop save (Kanban).
- Secrets / tokens / API keys masked (Phase 93 carry-over).

If a future phase needs to mutate, it must:

1. Introduce a separate, explicit, audited writer namespace.
2. Update the route registry to declare the new mode (NOT `READ_FIRST`).
3. Update the Phase 94 mutation validator allowlist (or a successor validator).
4. Be reviewed against this document.

## 8. Responsive baseline

| Tier | Width | Expectation |
|------|-------|-------------|
| Desktop | ≥1024px | Cards in a comfortable grid; no horizontal scroll |
| Tablet | 768–1023px | Cards full-width or 2-col; readable |
| Mobile | <768px | Cards stacked; scroll vertical only; **no clipped critical text** |

## 9. Accessibility baseline

- WCAG-AA contrast on the dark theme cards.
- All interactive elements expose visible text (or aria-label).
- Status badges are text + colour (never colour alone).
- Warning / error / partial states always include human-readable copy.
- Focus order follows visual order; no focus traps.

## 10. Forbidden in Phase 94 namespace

`set | update | create | delete | save | mutate | assign | escalate | resolve | complete | toggle | enable | disable | grant | revoke | provision | deprovision | edit | reset | rotate | heal | repair` — when used as the start of an action portion of a `CbvWebAppUiFreeze_*` function name. Render helpers (`*State_$`, `*_render*`, `*TestConsole_*`) and `_get*` are allow-listed.

## 11. Pilot tag

After UAT sign-off, optional pilot tag: `v2.4.11-webapp-ui-foundation-freeze`. **No production tag.**

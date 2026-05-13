# WebApp FE State Freeze Standard (Phase 94)

Frozen FE state vocabulary for every WebApp page. Source of truth: `CbvWebAppUiFreeze_getUiStandard().data.states`.

---

## 1. State vocabulary

| State | When to use | Required UI text | Notes |
|-------|-------------|------------------|-------|
| `loading` | Page is fetching its primary data | "Loading…" or skeleton card | Optional in pure server-render; reserved for future client-side hydration |
| `empty` | Fetch succeeded, no rows visible | "No rows found." or page-specific equivalent | Distinguish from `warning` (which implies missing source) |
| `warning` | Source missing / partial / non-fatal | "Data not available (read-first)." or page-specific | Surface in `warnings[]` envelope as well |
| `error` | Renderer or fetch raised | "Renderer failed. Showing fallback." | Always include a stack-free human message; never leak raw exception details to operators |
| `partial` | Some sections OK, some missing | "Showing partial data; some sections unavailable." | Use when a page has multiple data sources |
| `ready` | All sections rendered successfully | (no banner; normal cards) | Default success state |

## 2. Mapping helper

Each phase exposes a state mapper:

- Phase 90: `CbvWebAppPilotRenderer_renderState_(state)` 
- Phase 91: `CbvWebAppTimelineKanban__mapState_(res, defaults)` (renamed in Hotfix 91.1 to avoid `resolve*` mutation pattern)
- Phase 92: `CbvWebAppObservability__mapState_(res, defaults)`
- Phase 93: `CbvWebAppAdminRef_renderState_(state)`
- Phase 94: validator-only (no new helper)

A future Phase 95+ may consolidate these into a single helper, but the **state vocabulary above is frozen** — no new state names without a successor freeze.

## 3. Rules per state

1. **No state may render a mutation button.** Even an `error` fallback never shows "Retry write" or similar.
2. **`warning`/`error`/`partial` always include text** — never colour or icon alone.
3. **`ready` does not echo the underlying data** in a free-form `JSON.stringify(row)`; data goes through an adapter (per-section in Phase 90/91/92/93).
4. **`empty` includes a hint** about why the list might be empty (e.g. filter, scope, no rows yet).

## 4. Test expectations

The Phase 94 Test Console asserts `data.states` contains all six names: `loading`, `empty`, `warning`, `error`, `partial`, `ready`. Adding or removing a state requires a new freeze decision in `00_SYSTEM_BRAIN/002_DECISIONS/`.

## 5. Accessibility cross-reference

States contribute to assistive-technology output. Per `WEBAPP_RESPONSIVE_ACCESSIBILITY_BASELINE.md`:

- State text must be programmatically associated with its section (heading + descriptive paragraph).
- Status badges that change colour also change text (e.g. `OK` → `WARNING` → `ERROR`).
- Live-region updates (if added in future) must use `aria-live="polite"` and never `assertive` for non-critical state changes.

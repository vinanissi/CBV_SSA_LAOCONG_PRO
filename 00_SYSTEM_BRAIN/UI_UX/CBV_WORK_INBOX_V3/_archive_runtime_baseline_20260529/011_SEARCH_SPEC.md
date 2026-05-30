# CBV_WORK_INBOX_V3 — Search Specification

**Version:** V3.0 · **Date:** 2026-05-29  
**Implementation:** `SearchPage.tsx`, `TopBar.tsx`, `api/client.ts`

---

## 1. Scope

Global operational search across modules from Work Inbox shell. Primary entry: **TopBar search field** on all AppShell routes.

Work Inbox list is **not** a search view — it uses filter/group semantics. Search is a separate route.

---

## 2. Routes

| Route | Behavior |
|-------|----------|
| `/search` | Empty state — hint to enter keyword in TopBar |
| `/search?q={encodedQuery}` | Execute search on mount/update |

---

## 3. Search input (TopBar)

| Property | Spec |
|----------|------|
| Location | TopBar right zone, before user chip |
| Submit | Form submit or Enter |
| Empty submit | Show inline hint (`emptyHint`), do not navigate |
| Clear | Clears input; if on `/search`, navigates to `/search` without q |
| Sync | When on `/search`, input syncs from URL `q` param |

### Navigation

```typescript
onSearchNavigate(q) → navigate(`/search?q=${encodeURIComponent(q)}`)
// empty q → '/search'
```

---

## 4. API contract

```typescript
api.search(query: string): Promise<ApiEnvelope<{ results: SearchResult[] }>>
```

### SearchResult shape

| Field | Type | Use |
|-------|------|-----|
| `module` | `'TASK' \| 'FINANCE' \| 'HO_SO' \| ...` | Badge label |
| `id` | string | Entity ID |
| `title` | string | Result primary line |
| `subtitle` | string | Secondary line |
| `href` | string | Navigation target |

### Module labels (VI)

| Module | Label |
|--------|-------|
| TASK | Việc |
| FINANCE | Tài chính |
| HO_SO | Hồ sơ |

---

## 5. Results UI

| State | Component |
|-------|-----------|
| Loading | `LoadingState` with `FEEDBACK_COPY.pending.search` |
| Error | `RuntimeFeedbackMessage` with retry |
| Empty (query, zero results) | `EmptyState` with `EMPTY_COPY.search` |
| Results | `WorkQueue` wrapping linked cards |

### Result card

- Link (`<Link to={r.href}>`)
- Panel styling with hover border
- Title + `StatusBadge` for module
- Subtitle muted

TASK results → `/tasks/:id`

---

## 6. Error handling

| Condition | UX |
|-----------|-----|
| `ok: false` | Show first error from envelope + traceId if available |
| Network error | `FEEDBACK_COPY.error.network` + retry |
| Empty query | No API call; clear results |

Retry re-invokes `runSearch()` callback.

---

## 7. Performance

- Debounce **not required** on submit-driven search (submit-only model in V3)
- Re-fetch on `query` param change via `useEffect`
- No infinite scroll — return full result set from API (stub may limit server-side)

---

## 8. Permissions

- Search available to all authenticated roles including VIEW_ONLY
- Results respect server-side visibility (TASK_MAIN SHARED_WITH / IS_PRIVATE)
- No write actions on search results page — navigate to target module

---

## 9. Work Inbox relationship

| Feature | Search | Inbox filter |
|---------|--------|--------------|
| Scope | Cross-module | TASK only |
| State in URL | `q` | `filter`, `group` |
| Full-text | yes | no (predefined slices) |
| Grouping | flat list | cognition/status groups |

Operators use **filters** for daily queue; **search** for lookup by keyword/ID.

---

## 10. Future enhancements (not V3)

- Search suggestions / recent queries
- Module-scoped search (`/search?module=TASK`)
- Keyboard shortcut `/` focus search
- In-inbox filter by text (client-side)

Document only — do not implement without phase prompt.

---

## 11. Acceptance criteria

| # | Test |
|---|------|
| 1 | Submit "TSK" navigates to `/search?q=TSK` |
| 2 | Empty submit shows hint, no navigation |
| 3 | TASK result click opens `/tasks/:id` |
| 4 | API error shows retry |
| 5 | Zero results shows EmptyState |
| 6 | TopBar input syncs when landing on search URL |

---

## 12. Copy reference

From `operatorFeedbackCopy.ts` / `EMPTY_COPY`:
- Pending: search loading message
- Error: search-specific + network fallback
- Empty: search empty state title/message

Use existing copy constants — do not hardcode duplicate strings.

# WebApp Responsive + Accessibility Baseline (Phase 94)

Pilot-tier baseline. Pages must meet this baseline before pilot tag; production tier is **not** in scope.

---

## 1. Responsive baseline

| Tier | Viewport width | Expectation |
|------|----------------|-------------|
| Desktop | ≥ 1024px | Cards in a comfortable grid; no horizontal scroll for reading; primary actions in the top quarter of the viewport |
| Tablet | 768px – 1023px | Cards full-width or two-column; readable without zoom; nav remains usable |
| Mobile | < 768px | Cards stacked; vertical scroll only; **no clipped critical text**; primary nav collapses or remains scrollable |

### 1.1 Required behaviours

- No fixed pixel widths that exceed 320px on mobile.
- No `overflow: hidden` on the main scroll container.
- Cards must wrap their content with `flex-wrap` or `display: block` on narrow widths.
- Tap targets are at least 32×32px on mobile.
- Long codes (`<code>`) wrap or get a horizontal scrollbar inside their own container — never pushing the page wider.

### 1.2 Allowed exceptions

- The JSON copy dialog (used by `Copy Latest Report` actions) may have a fixed 560×420px modal; this is acceptable because it is a temporary admin dialog, not a primary surface.

## 2. Accessibility baseline (WCAG-AA target)

| Aspect | Requirement |
|--------|-------------|
| Contrast | Body text and badges meet WCAG-AA contrast on the dark operational theme |
| Labels | Every interactive element exposes visible text or `aria-label` |
| Status encoding | Never colour-only — text + colour always |
| Warnings / errors | Always include human-readable copy |
| Focus order | Follows visual order; no focus traps |
| Headings | Use `<h3>` / `<h4>` consistently inside `cbv-card` |
| Live regions | Reserved for future client-side updates — not used in Phase 94 |

### 2.1 Forbidden

- Status communicated by colour alone (e.g. red dot with no text).
- Buttons without visible text or `aria-label`.
- Auto-focusing destructive controls (Phase 94 has none — keep it that way).

## 3. Tested breakpoints (manual)

The Phase 94 UAT verifies these breakpoints:

- Desktop 1280×800 (Chromium / Firefox).
- Tablet 1024×768 (rotated portrait simulator).
- Mobile 414×896 (iPhone 11 simulator).
- Mobile 360×800 (Android emulator).

For each breakpoint:

1. Visit every route in `WEBAPP_ROUTE_FREEZE_MATRIX.md`.
2. Confirm no horizontal scroll for reading the primary cards.
3. Confirm safety footer remains visible at the end of the page.
4. Confirm badges show **both** text and colour.

## 4. Known limitations

- The WebApp is rendered via Apps Script HTML Service; certain CSP / iframe constraints may limit advanced layout. The baseline above is pragmatic for Apps Script.
- Print stylesheet is **not** in scope for Phase 94.
- Right-to-left support is **not** in scope for Phase 94.

## 5. Future polish (out of Phase 94 scope)

Polish allowed in later phases (without touching runtime semantics):

- Better contrast tokens.
- Better spacing tokens.
- Larger tap targets on mobile.
- Focus ring colour standardisation.

Any of the above must keep the Phase 94 Test Console green.

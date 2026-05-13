# WebApp UI Consistency Audit (Phase 94)

Audit of the WebApp surface across Phase 90 – 93 renderers. Findings are advisory; **none of the recommended polish is allowed to alter runtime semantics or the freeze**.

---

## 1. Current findings

### 1.1 Consistent (PASS)

- Card primitive `cbv-card` shared across Phase 90/91/92/93 (via the three components partials).
- Badge primitives `.cbv-badge`, `.cbv-badge.ok`, `.cbv-badge.warn`, `.cbv-badge.crit` shared.
- Muted text class `cbv-muted` used uniformly.
- Code primitives `<code>` and `<pre class="cbv-pre">` used uniformly.
- Safety footer wording is consistent across Phase 91 (Timeline/Kanban), Phase 92 (Runtime/Reports), Phase 93 (Admin Reference).
- `READ_FIRST` is asserted on every operational route in `CbvWebAppWorkspace_routeRegistry()`.

### 1.2 Inconsistent (WARN — track but do not fix during freeze)

- The state mapping helper is named slightly differently per phase (`renderState_`, `__mapState_`, `_mapState_`). This is intentional historical churn (Phase 91.1 hotfix renamed to avoid mutation-name false positives). A future consolidation phase may unify the helper; until then, the **state vocabulary** is frozen (see `WEBAPP_FE_STATE_FREEZE_STANDARD.md`) and the helper names are not.
- Three separate `*_COMPONENTS.html` partials exist (`WEBAPP_WORKSPACE_COMPONENTS.html`, `WEBAPP_OBSERVABILITY_COMPONENTS.html`, `WEBAPP_ADMIN_REFERENCE_COMPONENTS.html`). They are near-identical and could be consolidated. Not in scope for Phase 94.
- Heading levels vary slightly (`<h3>` is most common but `<h4>` appears for nested sections). Acceptable for Phase 94; could be tightened later.

### 1.3 Known warnings (carry-overs from prior phases)

- Phase 92 `GO_WITH_WARNINGS` is expected when `CBV_TEST_REPORTS` is absent — by design (no auto-create).
- Phase 93 `GO_WITH_WARNINGS` is expected on tenants without all reference sheets — by design.
- Phase 94 validator emits a WARNING because Apps Script cannot read `.clasp.json` at runtime to confirm `999_*.js` is last. Verified locally and documented in `CLASP_PUSH_ORDER.md`.

## 2. Recommended future polish (out of Phase 94 scope)

The following items improve consistency **without** changing runtime semantics. They may be done in a later polish phase; until then they are **logged**, not applied.

1. Consolidate the three `*_COMPONENTS.html` partials into a single base + per-theme overrides.
2. Standardise heading levels (`<h2>` page-level, `<h3>` card titles, `<h4>` sub-sections).
3. Standardise state mapper naming under one umbrella helper (e.g. `CbvWebAppUi_mapState_`) consumed by every phase.
4. Add a shared `cbv-section-header` helper for the "Title · status badge · meta" rows.
5. Standardise the page title chip + route chip into a reusable component.
6. Add a "last refreshed at" chip per page (read-first; uses already-available `checkedAt`).

## 3. Polish rules (must follow during any future polish)

- **Do not** introduce mutation buttons or writeback paths.
- **Do not** rename functions whose name match the mutation validator allow patterns (`_get*`, `_render*`, `*State_$`, `*TestConsole_*`, `__private_`).
- **Do not** change the FE state vocabulary (frozen).
- **Do not** change the safety footer wording (frozen).
- **Do not** change the route paths or modes (frozen).
- **Always** re-run `🧪 CBV Test Console → Phase 94 — UI Freeze / UAT → Run UI Freeze Health Check` after polish — must remain GO or GO_WITH_WARNINGS.

## 4. Audit checklist

For any UI polish PR:

- [ ] Phase 94 Test Console still GO / GO_WITH_WARNINGS.
- [ ] Phase 91.1 / 92 / 93 mutation validators still clean.
- [ ] Safety footer phrases still verbatim on every operational route.
- [ ] Route freeze matrix unchanged.
- [ ] FE state vocabulary unchanged.
- [ ] No new file under `05_GAS_RUNTIME/999_*` (only the dispatcher is allowed there).
- [ ] `.clasp.json` filePushOrder still ends with `999_WEBAPP_DOGET_DISPATCHER_FINAL.js`.

## 5. Conclusion

The WebApp UI is consistent enough at pilot tier. The freeze is **valid**. Future polish is welcome but must obey the rules in §3 / §4.

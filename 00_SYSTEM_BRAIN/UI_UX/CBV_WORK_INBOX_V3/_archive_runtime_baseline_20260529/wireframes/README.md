# CBV_WORK_INBOX_V3 — Wireframes Index

**Version:** V3.0 · **Date:** 2026-05-29

---

## Purpose

ASCII wireframes document spatial intent for FE implementers. They are **not** pixel mocks — refer to `004_LAYOUT_SPEC.md` and `006_DESIGN_TOKENS.md` for exact values.

---

## Files

| File | Viewport | Description |
|------|----------|-------------|
| `desktop.md` | ≥ 1366px | Primary operational layout |
| `tablet.md` | 768–1365px | Constrained desktop / horizontal scroll |
| `mobile.md` | < 768px | Bottom sheet detail (best-effort) |
| `focus-mode.md` | all | Focus queue mode overlay behavior |

---

## How to use

1. Read wireframe for target breakpoint
2. Cross-check component names in `005_COMPONENT_LIBRARY.md`
3. Implement using existing AppShell — do not invent new shell geometry
4. Update wireframe file (versioned) if layout intentionally changes

---

## Conventions

```
[ Button ]     — interactive control
( label )      — static text
===            — section divider
>>>            — primary operator attention
...            — truncated content
```

---

## Change control

Append `_v2` or `_YYYYMMDD` suffix for wireframe revisions. Do not overwrite prior wireframe files.

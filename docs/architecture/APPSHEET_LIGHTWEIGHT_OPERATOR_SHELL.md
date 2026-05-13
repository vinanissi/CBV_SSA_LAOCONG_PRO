# AppSheet — Lightweight Operator Shell

## Statement

AppSheet is a **lightweight operator shell** for quick, stable, mobile-first operations. It is **not** the primary system owner of advanced operational UX.

This repo is **WebApp-led** while preserving AppSheet’s strengths for field operations.

---

## AppSheet owns (primary)

- Mobile quick CRUD
- Quick queue actions (manual taps)
- Field operation forms
- Simple upload/capture (camera/files)
- Lightweight “My Queue”
- Fallback operator path when WebApp is not available

---

## Constraints (strict)

- **No AppSheet Bot**
- **No uncontrolled automation**
- **No auto assign / auto resolve / auto escalate**
- Manual-first pilot remains required.

---

## Rationale

- Keeps mobile operations fast to ship and stable.
- Reduces coupling/lock-in by restricting AppSheet to shell duties.
- Preserves governance by routing complex UX to WebApp where code ownership is explicit.


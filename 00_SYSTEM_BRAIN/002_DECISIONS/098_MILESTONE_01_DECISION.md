# 098 — Milestone 01 — Decision Log

## Decision

**Adopt additive WebApp routes and a dedicated Milestone 01 test entry under 🧪 CBV Test Console** instead of extending the CBV PRO business menu.

## Rationale

- Preserves **test runtime separation** (CBV_TCS_V1).
- Keeps **canonical routing** (`?route=` / 998H) while extending the frozen route set in one coordinated change (VI copy, route URL helper, staff trial allowlist, UI freeze matrix).

## Alternatives considered

- **Role routing only in client JS:** rejected — Apps Script HTML templates cannot call server helpers inline; role URLs must be server-built.
- **Single `/workspace` rewrite by role:** rejected — would complicate caching and deep links; explicit routes are clearer for UAT.

## Status

Accepted for Milestone 01 closeout pending live Test Console run.

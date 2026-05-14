# DECISION — 105 Milestone 03 Daily Operation Flow

**Date:** 2026-05-14  
**Status:** Accepted (code-ready; runtime GO pending GAS + Drive)  

## Decision

Adopt **split navigation**: primary strip in `MODEL.actionBarHtml` (VI `cbv-primary-nav`) and **secondary quick links** in `MODEL.navHtml` (`cbv-secondary-quick-links`), removing overlap with the old single 6-button global bar that duplicated “menu-first” patterns.

## Rationale

- Satisfies Milestone 03 requirement “không hai lớp nav gần giống nhau” while keeping all legacy routes registered.
- Keeps **Milestone 01/02** routes intact; staff sees **Daily** early in primary order.

## Alternatives considered

- **Tabs only in Daily HTML:** rejected — global shell still needs cross-route navigation.
- **Hide secondary entirely for staff:** rejected — admin/ops links still required for parity with M01.

## Follow-up

After Drive GO, tag per user procedure (`milestone-03-daily-operation-flow`).

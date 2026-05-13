# Operator UAT Script

**Role:** Operator  
**Estimated time:** ~25 minutes  
**Routes covered:** `/workspace`, `/home-alert/my-queue`  
**Devices:** Desktop 1280×800 · Tablet 1024×768 · Mobile 414×896 · Mobile 360×800

Use alongside `WEBAPP_PILOT_UAT_RUNBOOK.md` and `WEBAPP_UAT_FEEDBACK_SCHEMA.md`. Source of truth: `CbvWebAppUat_getOperatorScript()`.

---

## Steps

| Step | Action | Expected result |
|------|--------|------------------|
| O1 | Open `?route=/workspace` on desktop | Home Workspace renders comfortably. Safety footer visible. |
| O2 | Open `?route=/home-alert/my-queue` on desktop | Queue cards visible. Status badges show text + colour, not colour alone. |
| O3 | Read each queue card | Operator can articulate the **next action** from the card without external help. |
| O4 | Open `?route=/home-alert/my-queue` on tablet | Cards full-width or 2-column; readable without zoom. |
| O5 | Open `?route=/home-alert/my-queue` on mobile (both breakpoints) | Cards stack vertically. **No horizontal overflow** for reading. Safety footer visible at bottom of the page. |
| O6 | Inspect each card for fake action buttons | No Save / Edit / Delete / Toggle / Assign / Resolve / Escalate buttons. No buttons that look like writes but do nothing. |
| O7 | Read the "next action" text on a queue card | Wording is understandable. No jargon that prevents the operator from acting. |
| O8 | Verify the safety footer on every visited route | Verbatim phrases: `No auto assign`, `No auto resolve`, `No auto escalate`, `No production claim`. |
| O9 | Record feedback per `WEBAPP_UAT_FEEDBACK_SCHEMA.md` | Use `TESTER_ROLE = Operator`. Capture `SPEED_RATING` and `USABILITY_RATING` per device segment. |

## Expected results summary

- Operator articulates the next action from at least **80%** of cards without coaching.
- Mobile breakpoints display all critical text without clipping.
- No drag-drop save anywhere (operators do not see Kanban in this script, but if they navigate there during the trial, the no-drag rule still holds).
- No fake mutation buttons — if a button looks clickable, it must do something useful and read-only.

## Pass / Warn / Fail criteria

- **PASS** — All 9 steps PASS. Operator articulates next action on ≥80% of cards. Mobile baseline holds.
- **WARN** — Up to 2 MEDIUM wording / spacing issues documented. No BLOCKER.
- **FAIL** — Any BLOCKER. Operator cannot use My Queue. Mobile critical text clipped. Any mutation button visible.

## Notes

- Pair the Operator session with a shadow observer (note-taker) so the operator can focus on the workflow.
- If the operator hesitates on a card, capture the moment as a CONFUSION_POINT row even if they eventually figure it out — speed of comprehension is the metric.
- Test both Mobile breakpoints (414 and 360); the smaller one is where clipping bugs typically surface.

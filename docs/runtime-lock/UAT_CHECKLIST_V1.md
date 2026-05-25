# Real Usage UAT Checklist v1

Use after `clasp push`. Mark PASS / FAIL / N/A per role.

## STAFF

| # | Check | Route / action |
|---|-------|----------------|
| 1 | Open WebApp workspace | `?route=/workspace/workboard/tasks` |
| 2 | Task list readable | cards, status, empty state |
| 3 | Search tasks | `/workspace/workboard/search` |
| 4 | Task detail + timeline | task-detail + timeline section |
| 5 | Own queue | `/workspace/coordination/queue` |
| 6 | Notifications | `/workspace/workboard/notifications` |
| 7 | Observation alerts (own scope) | `/workspace/observation/alerts` |
| 8 | Mobile: nav thumb targets | cbv-action-xl tappable |
| 9 | No finance/ho_so write actions visible | permission filter |
| 10 | Empty states clear | no fake data |

## MANAGER

| # | Check |
|---|-------|
| 1 | Coordination manager board |
| 2 | Team queue / overdue / workload |
| 3 | Observation dashboard |
| 4 | Plugin module list |
| 5 | Assignment page shows EXECUTION_LOCKED |
| 6 | Mobile layout on coordination pages |

## FINANCE

| # | Check |
|---|-------|
| 1 | Finance workboard `/workspace/plugins/finance` |
| 2 | Finance items list |
| 3 | Finance alerts |
| 4 | Finance search |
| 5 | Confirm payment NOT auto-executable |
| 6 | Unified search includes FINANCE group |

## HO_SO

| # | Check |
|---|-------|
| 1 | HO_SO workboard `/workspace/plugins/ho-so` |
| 2 | Missing documents visible |
| 3 | HO_SO alerts |
| 4 | HO_SO search (name/phone/plate) |
| 5 | Approval action locked |

## VIEW_ONLY

| # | Check |
|---|-------|
| 1 | Read routes only |
| 2 | No create/assign/confirm buttons |
| 3 | Search read-only results |
| 4 | Plugin pages read-only |

## Browser walkthrough (all roles)

Verify render, empty state, permission, navigation, no broken links for routes in `ROUTE_REGISTRY_V1.md`.

## Mobile UAT

- Touch targets ≥ 52px (`cbv-action-xl`)
- Single-column stack (`cbv-workboard-mobile-stack`)
- Readable card text
- Scroll nav wrap (`cbv-thumb-zone`)
- One-hand reach: primary actions top/middle

## GAS test menu (required)

Run under 🧪 CBV Test Console:

1. RF_02 Workboard Core Health — expect GO
2. RF_03 Operational Coordination — expect GO
3. RF_04 Observation Runtime — expect GO
4. RF_05 Plugin Runtime — expect GO_WITH_WARNINGS
5. RF_06 Finance/HO_SO — expect GO
6. **RF_07 Runtime Lock Verification** — expect GO / GO_WITH_WARNINGS

All: `Envelope OK = yes`

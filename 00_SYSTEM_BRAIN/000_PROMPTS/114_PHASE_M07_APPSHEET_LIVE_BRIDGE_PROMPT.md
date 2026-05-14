# PHASE M07 — AppSheet Live Bridge (Cursor execution prompt)

**Saved:** append-only registry `114_`.  
**Repo:** `CBV_SSA_LAOCONG_PRO` · **Branch:** `phase/from-v2.4.1-TASK-FIN`

## Scope (executed)

- AppSheet config remains Script Properties–driven (`998Y`); M07 adds `999B` live bridge (deep link + handoff + ribbon + health).
- Workboard, Focus, SOP embed ribbon / handoff UI; markers + HTML probe + dual marker contracts + Test Console `999C`.
- Menu: **🧪 CBV Test Console → M07 — Run AppSheet Live Bridge Test** (+ copy report).
- Pre-commit: `scripts/cbv-marker-contract-self-check.mjs` validates M06 + M07 contracts.

## Drive / GAS

Drive bundle export runs inside GAS when the menu test executes; local repo work is **NOT VERIFIED ON GAS** until the user runs the menu item in the bound spreadsheet.

## Original prompt reference

Full operational requirements (objectives, forbidden actions, report envelope, six-file bundle naming) are preserved in the Cursor chat that generated this implementation.

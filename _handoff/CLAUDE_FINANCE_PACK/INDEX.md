# Claude Finance handoff pack

Mirrored copies of Finance-related specs, shared architecture, schema, reference module docs, GAS, and AppSheet notes. Paths under each `tier*` folder mirror the main repo (e.g. `tier1_core_spec/02_MODULES/FINANCE/...`) so citations match the real tree.

## Generate or refresh `tier*` folders

From the repository root (PowerShell):

```powershell
.\scripts\export-claude-finance-pack.ps1
```

Export only some tiers (e.g. spec + architecture + schema):

```powershell
.\scripts\export-claude-finance-pack.ps1 -Tiers 1,2,3
```

Optional: `-RepoRoot` and `-PackDir` (see script).

## Git policy in this repo

- **Tracked:** this `INDEX.md`, `manifest.json`, and `scripts/export-claude-finance-pack.ps1`.
- **Not tracked:** contents of `tier1_core_spec/` through `tier6_appsheet/` (generated mirrors; avoids noisy diffs). Zip or attach the pack **after running the export** when sending to Claude or others.

## Schema note

- `tier3_schema/06_DATABASE/schema_manifest.json` currently lists **`FINANCE_TRANSACTION`** for bootstrap.
- `FINANCE_ATTACHMENT.csv` and `FINANCE_LOG.csv` under `_generated_schema` are still included in tier 3 so they can be reconciled with `02_MODULES/FINANCE/SHEET_DICTIONARY.md` — do not assume a single Finance table.

## Suggested reading order

1. `tier1_core_spec/00_META/CBV_MODULE_BUILD_PROTOCOL.md`
2. All of `tier1_core_spec/02_MODULES/FINANCE/*.md` (protocol order: descriptor, data model, workflow, business spec, service map, service contract, sheet dictionary, AppSheet UX)
3. `tier2_architecture/`
4. `tier3_schema/`
5. Optional: `tier4_reference_task_center/` (eight protocol files for TASK_CENTER, same layout style)
6. When editing GAS: `tier5_gas_runtime/`
7. When configuring AppSheet: `tier6_appsheet/`

## CBV rules (short)

Per `CBV_MODULE_BUILD_PROTOCOL`: finalize descriptor, data model, workflow, business spec, service contract, sheet dictionary, and AppSheet UX **before** coding GAS/AppSheet. Do not code first and fix docs later; do not add columns without updating specs.

## Tier guide

| Tier | Folder | Use when |
|------|--------|----------|
| 1 | `tier1_core_spec` | Finance module specs only |
| 2 | `tier2_architecture` | Align with USER_DIRECTORY, DON_VI, TASK, enums, module map |
| 3 | `tier3_schema` | Columns, manifest, CSV headers |
| 4 | `tier4_reference_task_center` | Match tone/structure of another module |
| 5 | `tier5_gas_runtime` | GAS / bootstrap alignment |
| 6 | `tier6_appsheet` | AppSheet build and policy |

## Prompt template (Vietnamese)

```text
Ban la kien truc su nghiep vu CBV. Lam viec trong _handoff/CLAUDE_FINANCE_PACK (da chay export-claude-finance-pack.ps1). Tuan thu CBV_MODULE_BUILD_PROTOCOL va CBV_FINAL_ARCHITECTURE. Doc tier1–3 truoc; tier4 de so format voi TASK_CENTER.

Nhiem vu: [mo ta].

Dau ra: cap nhat ro rang cac file trong 02_MODULES/FINANCE (liet ke tung file); neu doi schema thi neu cot thay doi va cap nhat schema_manifest / GAS / AppSheet. Khong de xuat code GAS cho den khi spec nhat quan.
```

## Prompt template (English)

```text
You are a CBV business/technical architect. Work from _handoff/CLAUDE_FINANCE_PACK after running export-claude-finance-pack.ps1. Obey CBV_MODULE_BUILD_PROTOCOL and CBV_FINAL_ARCHITECTURE. Read tier1–3 first; use tier4 to match style with TASK_CENTER.

Task: [describe].

Deliverables: list concrete updates under 02_MODULES/FINANCE; if schema changes, list columns and follow-on for schema_manifest, GAS, AppSheet. Do not propose GAS code until specs are consistent.
```

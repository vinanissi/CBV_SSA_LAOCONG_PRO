# Claude pack — full system export (CBV SSA LAOCONG PRO)

## Regenerate

From repository root:

```powershell
.\scripts\export-claude-full.ps1
```

Options:

- `-IncludeAllAppSheet` — include every `04_APPSHEET/**/*.md` except under `99_ARCHIVE`.
- `-IncludeTools` — also include `99_TOOLS/*` paths from `build_manifest.json`.

## Reading order

1. This file (`00_HUONG_DAN.md`).
2. Numbered files `01__...`: meta → overview → `02_MODULES` → `03_SHARED` → AppSheet → GAS `.md` in `05_GAS_RUNTIME` → all `.js` in **`.clasp.json` `filePushOrder` order** → `06_DATABASE` → automation / storage / audit / root docs.

Flat names: `NN__` encodes the repo-relative path (`/` → `__`). Original repo layout is unchanged.

## Notes

- GAS list comes from [`.clasp.json`](../.clasp.json) `filePushOrder` (deploy order).
- Default AppSheet set: paths under `04_APPSHEET` from `build_manifest.json` plus PRO essentials (`APPSHEET_SECURITY_FILTERS.md`, `APPSHEET_SLICE_MAP.md`, `TASK_MAIN_PRO_SPEC.md`).

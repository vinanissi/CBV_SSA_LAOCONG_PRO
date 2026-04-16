# Claude pack — per-module export

## Regenerate

```powershell
.\scripts\export-claude-module.ps1 -Module HO_SO
.\scripts\export-claude-module.ps1 -Module TASK_CENTER
.\scripts\export-claude-module.ps1 -Module FINANCE
```

Output directory: `claude_exports/module_<MODULE>/`.

## Reading order

1. `00_HUONG_DAN.md` (this file).
2. Numbered files: **common** (protocol, architecture, maps) → **module specs** → **schema files** → **GAS** (filtered from `.clasp.json`, same push order) → **AppSheet** (see [`scripts/claude-module-packs.json`](claude-module-packs.json)).

Edit [`scripts/claude-module-packs.json`](claude-module-packs.json) when you add tables, GAS, or docs for a module.

# Git hooks — CBV marker contract

## Enable (one-time per clone)

From repo root:

```bash
git config core.hooksPath .githooks
```

On Windows (Git Bash or PowerShell from repo root):

```powershell
git config core.hooksPath .githooks
```

## What runs on `git commit`

`.githooks/pre-commit` runs:

```bash
node scripts/cbv-marker-contract-self-check.mjs
```

If any **required marker** from `00_SYSTEM_BRAIN/000_TEST_CONSOLE/CBV_TCS_V1/contracts/CBV_WORKBOARD_MARKER_CONTRACT.json` is missing from:

- `05_GAS_RUNTIME/html/WEBAPP_STAFF_WORKBOARD.html` (probe), or  
- `05_GAS_RUNTIME/998Z_MILESTONE_06_STAFF_WORKBOARD_TEST_CONSOLE.js` (Test Console strings),

the commit **fails**.

## Manual run before push

```bash
node scripts/cbv-marker-contract-self-check.mjs
```

Requires **Node.js** on `PATH`.

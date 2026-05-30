# PHASE_RF_02 — WORKBOARD CORE IMPLEMENTATION — PROMPT

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

## Metadata

- **Phase name:** PHASE_RF_02_WORKBOARD_CORE_IMPLEMENTATION
- **Baseline:** PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE
- **Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`
- **Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`
- **Standard:** CBV Operational Ecosystem Standard V1 · CBV_TCS_V1

## Mission

Implement **Mốc 1 — Workboard Core** incrementally on existing GAS/WebApp runtime:

1. Permission Runtime v1
2. Workboard Shell
3. Task List v1
4. Task Detail v1
5. Timeline Read v1
6. Unified Search Stub v1
7. Notification Center Stub v1
8. File Runtime Stub v1
9. Test Console / Report / Handoff

## Constraints

- No production schema change
- No AppSheet removal
- No Cloudflare Worker implementation
- No rewrite of existing WebApp
- Test menu under 🧪 CBV Test Console only

## Deliverables

- `46_CBV_PERMISSION_RUNTIME.js`
- `999I_RF02_WORKBOARD_CORE_RUNTIME.js`
- `999J_RF02_WORKBOARD_CORE_RENDERER.js`
- `999K_RF02_WORKBOARD_CORE_TEST_CONSOLE.js`
- Route/registry/renderer/menu updates
- SYSTEM_BRAIN prompt/report/handoff/test evidence

## Git

```bash
git commit -m "feat(workboard): implement RF02 workboard core baseline"
```

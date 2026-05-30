# Phase 85.1 — UI Contract compile & audit fix (archived prompt)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Saved:** 2026-05-13  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Prior release:** commit `769a854`, tag `v2.4.2-ui-contract-pilot`

## Audit finding (pre-hotfix)

1. Git push / tag / file structure: PASS.  
2. GAS not executed in prior agent session.  
3. **Compile defect:** `CbvUiContract_healthCheck()` in `84_UNIFIED_UI_CONTRACT_RUNTIME.js` used invalid object literals in `checks.push` (bare expressions where `ok` / `severity` / `message` / `detail` keys were required).  
4. **Prompt archive:** `016_PHASE_85_UNIFIED_UI_CONTRACT_PROMPT.md` stored a summary only, not the full original Phase 85 user prompt verbatim.

## Mission (hotfix scope)

- Minimal fix: no Phase 85 redesign, no Phase 86.  
- Fix JS compile; ensure every check item is `{ code, ok, severity, message, detail }`.  
- Keep standard report envelope for `CbvUiContract_healthCheck()` and `CbvUiContract_TestConsole_run()`.  
- Append-only new brain artifacts (`017_*`); do not delete `016_*`.  
- Local checks: `git status`, `node --check` on 84/85, JSON parse `schema_manifest.json`, pattern review.  
- Commit message: `fix(ui-contract): repair phase 85 compile and audit artifacts`  
- Push branch; **no new pilot tag** until GAS Test Console passes (optional later: `v2.4.2-ui-contract-pilot-hotfix.1`).

## Core rules (unchanged)

CBV Operational Ecosystem Standard V1: runtime-first, memory-first, append-only, manual-first, audit-first, human-in-the-loop; no destructive migration; no overwrite of old reports/handoffs; no ENV-A / AI runtime / queue intelligence / AppSheet Bot; no auto assign / resolve / escalate.

## Appendix

See `017_PHASE_85_ORIGINAL_FULL_PROMPT_APPENDIX.md` for original Phase 85 prompt handling and reconstructed spec notes.

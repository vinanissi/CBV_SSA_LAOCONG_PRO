# CBV — Authority Index (Ecosystem)

## Purpose

Single index for **repo-root** governance. Cursor/AI loads this via `000_RUNTIME_ENTRYPOINT.md`.

## Ecosystem read order (always)

| # | Path |
|---|------|
| 1 | `900_AUTHORITY/000_DESIGN_AUTHORITY.md` |
| 2 | `900_AUTHORITY/001_AUTHORITY_INDEX.md` (this file) |
| 3 | `900_AUTHORITY/010_CURSOR_LOADING_STANDARD.md` |
| 4 | `900_AUTHORITY/011_CURSOR_EXECUTION_CONTRACT.md` |
| 5 | `00_SYSTEM_BRAIN/000_STANDARDS/CBV_OPERATIONAL_ECOSYSTEM_STANDARD_V1.md` |
| 6 | `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md` |
| 7 | `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md` |
| 8 | `00_SYSTEM_BRAIN/006_PHASES/MODULE_AUTHORITY_REGISTRY.md` |
| 9 | `00_SYSTEM_BRAIN/003_RUNTIME_STATE.md` |

## Phase execution (per task)

| # | Path | When |
|---|------|------|
| 8 | Related ADR in `00_SYSTEM_BRAIN/002_DECISIONS/` | Domain decision applies |
| 9 | Latest report `00_SYSTEM_BRAIN/000_REPORTS/<PHASE>_REPORT.md` | Continuing or auditing a phase |
| 10 | Latest handoff `00_SYSTEM_BRAIN/001_HANDOFF/<PHASE>_HANDOFF.md` | Handoff from prior agent |
| 11 | Runtime state `00_SYSTEM_BRAIN/003_RUNTIME_STATE.md` | Read if present; report NOT_WIRED when unmaintained |

## Module packs (conditional)

See **`00_SYSTEM_BRAIN/006_PHASES/MODULE_AUTHORITY_REGISTRY.md`** (Tier 4). Load registry before module paths.

| Module | Entry |
|--------|--------|
| CBV_WORK_INBOX_V3 | `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/001_AUTHORITY_INDEX.md` |

Load module index **only** when the phase MODE or scope references that module.

## Artifact locations

| Artifact | Folder |
|----------|--------|
| Reports | `00_SYSTEM_BRAIN/000_REPORTS/` |
| Handoffs | `00_SYSTEM_BRAIN/001_HANDOFF/` |
| ADRs | `00_SYSTEM_BRAIN/002_DECISIONS/` |
| Prompts (legacy) | `00_SYSTEM_BRAIN/000_PROMPTS/` |
| Phase registry | `00_SYSTEM_BRAIN/006_PHASES/` |
| Test evidence | `00_SYSTEM_BRAIN/005_TEST_EVIDENCE/` |
| Test console | `00_SYSTEM_BRAIN/000_TEST_CONSOLE/` |

## Task classification

| Class | Description | Code? |
|-------|-------------|-------|
| `AUDIT` | Read-only trace, inventory | No |
| `IMPLEMENT` | Build or extend runtime | Yes |
| `FIX` | Correct broken behavior | Yes |
| `VERIFY` | Runtime / deploy verification | Maybe |
| `TEST` | Evidence capture | Maybe |
| `DOC-ONLY` | Governance docs only | No |

---

*Append-only. Update index tables; do not delete prior rows without ADR.*

# Module Authority Registry

**Version:** 1.1 (CBV-RCLA)  
**Purpose:** Coordinate **ecosystem authority** (repo root) vs **module authority packs** (product surfaces).

---

## Tier 1 — Ecosystem Authority

Load **always** (via `000_RUNTIME_ENTRYPOINT.md`):

| File |
|------|
| `900_AUTHORITY/000_DESIGN_AUTHORITY.md` |
| `900_AUTHORITY/001_AUTHORITY_INDEX.md` |
| `900_AUTHORITY/010_CURSOR_LOADING_STANDARD.md` |
| `900_AUTHORITY/011_CURSOR_EXECUTION_CONTRACT.md` |

---

## Tier 2 — Ecosystem Standard

| File |
|------|
| `00_SYSTEM_BRAIN/000_STANDARDS/CBV_OPERATIONAL_ECOSYSTEM_STANDARD_V1.md` |

---

## Tier 3 — Phase System

| File |
|------|
| `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md` |
| `00_SYSTEM_BRAIN/006_PHASES/PHASE_TEMPLATE.md` |
| `00_SYSTEM_BRAIN/006_PHASES/MODULE_AUTHORITY_REGISTRY.md` (this file) |

---

## Tier 4 — Module Authority Packs

Load **only** when phase scope touches the module (after Tier 1–3 and `003_RUNTIME_STATE.md`).

### Work Inbox V3

| Role | Path |
|------|------|
| Design authority | `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/000_DESIGN_AUTHORITY.md` |
| Module index | `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/001_AUTHORITY_INDEX.md` |
| AI read order | `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/004_AI_READ_ORDER.md` |
| Misread guardrails | `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/006_COMMON_MISREAD_GUARDRAILS.md` |

**Phase family prefix:** `PHASE_UI_CBV_WORK_INBOX_V3_`

---

## Rules

1. **Load Tier 1–3 first** — never start from module authority alone.
2. **Load module authority** only when the phase charter, prompt, or registry row references that module.
3. **Module authority cannot override ecosystem authority** unless an **ACCEPTED ADR** explicitly says so.
4. **Conflicts:**
   - Loading order, reports, handoffs, entrypoint → ecosystem wins.
   - Inbox routes, operator IA, Focus Mode → Work Inbox V3 module wins.
5. **New modules:** append a Tier 4 section here before first phase uses the module.

---

## Related

- `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`
- `00_SYSTEM_BRAIN/002_DECISIONS/ADR_RUNTIME_CONTEXT_LOADING.md`
- `00_SYSTEM_BRAIN/002_DECISIONS/ADR_RUNTIME_CONTEXT_LOADING_V1_1_ADDENDUM.md`

---

*Append-only registry.*

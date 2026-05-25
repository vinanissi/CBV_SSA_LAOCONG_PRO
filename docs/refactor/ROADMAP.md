# Refactor Roadmap — CBV Modular Operational Workspace

**Phase:** PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Standard:** CBV Operational Ecosystem Standard V1 · CBV_TCS_V1

---

## Nguyên tắc mỗi mốc

Mỗi mốc **bắt buộc**:

1. **Deploy được** — `clasp push` + (khi có) Worker deploy; không breaking prod Sheet schema
2. **Dùng thật được** — ít nhất một nhóm nhân sự pilot hằng ngày
3. **Không phá runtime hiện tại** — AppSheet + Sheet + GAS song song; feature flag / safe-disabled
4. **Có test / report / handoff** — CBV_TCS_V1 envelope + append-only artifacts

---

## Mốc 0 — RF_01 Baseline (HIỆN TẠI)

| Item | Status |
|------|--------|
| `docs/refactor/*` architecture baseline | ✓ Phase này |
| Prompt / report / handoff | ✓ Phase này |
| Runtime code changes | ✗ Out of scope |

**Exit criteria:** 8 refactor docs + SYSTEM_BRAIN artifacts committed; git clean.

---

## Mốc 1 — Workboard Core

**Mục tiêu:** Nhân sự dùng Workboard thật hằng ngày cho TASK + cơ bản search/notification/file.

### Bắt buộc

| # | Deliverable |
|---|-------------|
| 1 | Login / session (GAS hoặc Worker stub) |
| 2 | Permission runtime v1 — FE hide + GAS assert (6 roles mapping plan) |
| 3 | Task list + task detail (workboard MVP harden) |
| 4 | Timeline read (append-only projection) |
| 5 | Operational search v1 — task ID, tên, mã hồ sơ (GAS unified) |
| 6 | Notification center read — HOME_ALERT bind |
| 7 | File upload / preview — task + HO_SO basic |

### Không làm ở Mốc 1

- Cloudflare Worker production (optional stub only)
- FINANCE / HO_SO full workboard pages
- Plugin platform
- NocoDB

### Test / handoff

- CBV_TCS milestone test console
- Report + handoff trong `00_SYSTEM_BRAIN/`
- Pilot signoff template (`docs/webapp/WEBAPP_PILOT_SIGNOFF_TEMPLATE.md`)

### Dependency

- RF_01 docs (this baseline)
- Existing M06 workboard code as starting point

---

## Mốc 2 — Operational Coordination

**Mục tiêu:** Manager điều phối team; queue và overdue visible.

### Bắt buộc

| # | Deliverable |
|---|-------------|
| 1 | Assignment runtime — giao việc, chuyển xử lý |
| 2 | Manager dashboard — team queue overview |
| 3 | Queue views — pending, unassigned pool |
| 4 | Overdue monitor — SLA integration |
| 5 | Staff workload — tasks per user (read-only aggregate) |
| 6 | FINANCE queue on workboard (cần thu/chi/thiếu CT) |
| 7 | HO_SO list + detail workboard pages |

### Test / handoff

- Manager role pilot UAT
- Cross-role permission spot checks
- Assignment audit trail verified

---

## Mốc 3 — Observation Runtime

**Mục tiêu:** Vận hành nhìn được sức khỏe hệ thống; audit và event rõ ràng.

### Bắt buộc

| # | Deliverable |
|---|-------------|
| 1 | Health monitor — GAS + sync status |
| 2 | Sync monitor — Sheet ↔ AppSheet drift hints |
| 3 | Audit runtime — unified audit read API |
| 4 | Event runtime — append-only event stream projection |

### Optional (có thể dùng)

- **NocoDB** — read-only observation layer (không thay Sheet DB)
- Không bắt buộc ở RF phases trước

### Test / handoff

- Runtime health page production-ready
- Alert on schema drift (manual review)

---

## Mốc 4 — Plugin Platform

**Mục tiêu:** Chuẩn bị mở rộng không rewrite core.

### Bắt buộc

| # | Deliverable |
|---|-------------|
| 1 | Plugin contract spec (TASK / FINANCE / HO_SO reference impl) |
| 2 | Cloudflare Worker plugin runtime loader |
| 3 | Auth + projection stable API versioning |

### Plugin candidates (sau Mốc 4)

| Plugin | Purpose |
|--------|---------|
| OCR | Scan giấy tờ → HO_SO_FILE |
| Invoice | Hóa đơn → FINANCE |
| Zalo | Notification channel |
| CRM | External contact sync (manual) |
| AI | Assisted review — **human-in-loop only** |

---

## Timeline gợi ý (không cam kết cứng)

| Mốc | Horizon | Risk level |
|-----|---------|------------|
| RF_01 | Now | Low — docs only |
| Mốc 1 | Next | Medium — FE + GAS |
| Mốc 2 | +1–2 phases | Medium |
| Mốc 3 | +1 phase | Low–Medium |
| Mốc 4 | Future | High — platform |

---

## Cloudflare Worker insertion point

| Phase | Worker role |
|-------|-------------|
| Mốc 1 | Optional auth stub; GAS remains primary API |
| Mốc 2 | `/task`, `/assignment` projection endpoints |
| Mốc 3 | `/health`, `/audit`, `/events` read |
| Mốc 4 | Full API gateway + plugin host |

FE rule: **không gọi thẳng Google Sheet/AppSheet** khi Worker production-ready.

---

## Recommended next phase after RF_01

**PHASE_RF_02_WORKBOARD_CORE_IMPLEMENTATION**

Scope: Mốc 1 deliverables với incremental code on runtime-freeze branch; permission v1 mapping doc → GAS assert; search GAS stub; notification bind.

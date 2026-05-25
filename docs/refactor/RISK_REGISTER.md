# Risk Register — Modular Operational Workspace Refactor

**Phase:** PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Last updated:** 2026-05-25

---

## Cách đọc

| Cột | Ý nghĩa |
|-----|---------|
| **ID** | Mã rủi ro |
| **Severity** | H (High) · M (Medium) · L (Low) |
| **Likelihood** | H · M · L |
| **Mitigation** | Hành động giảm thiểu |

---

## R01 — AppSheet mismatch

| Field | Value |
|-------|-------|
| **Severity** | H |
| **Likelihood** | M |
| **Description** | Slice filter, ref map, hoặc USERSETTINGS role lệch với GAS/Workboard → operator thấy dữ liệu sai hoặc không thấy việc cần làm |
| **Mitigation** | Duy trì `04_APPSHEET/` binding matrix; cross-account spot check mỗi milestone; document filter trong PERMISSION_MATRIX; không đổi AppSheet prod without pilot checklist (`docs/appsheet/APPSHEET_PILOT_BINDING_CHECKLIST.md`) |
| **Owner** | Operator + dev |
| **Phase** | Mọi mốc |

---

## R02 — Schema drift

| Field | Value |
|-------|-------|
| **Severity** | H |
| **Likelihood** | M |
| **Description** | Sửa Sheet thủ công, manifest (`90_BOOTSTRAP_SCHEMA.js`), AppSheet column, UI contract không đồng bộ |
| **Mitigation** | Schema change chỉ qua bootstrap có audit; TASK_MAIN prod baseline (SHARED_WITH, IS_PRIVATE) không hạ cấp; Mốc 3 sync monitor; CBV_TCS schema validation tests |
| **Owner** | ADMIN / dev |
| **Phase** | Mọi mốc |

---

## R03 — FE gọi thẳng DB

| Field | Value |
|-------|-------|
| **Severity** | H |
| **Likelihood** | M |
| **Description** | Workboard FE bind trực tiếp Sheet API hoặc AppSheet → bypass permission, lộ credential, khó đổi projection |
| **Mitigation** | Target rule: FE → Worker → GAS only; transitional GAS doGet documented; code review gate; RISK trong TARGET_ARCHITECTURE; không embed Sheet ID trong FE static |
| **Owner** | Dev |
| **Phase** | Mốc 1–2 |

---

## R04 — Quyền chỉ kiểm tra ở FE

| Field | Value |
|-------|-------|
| **Severity** | H |
| **Likelihood** | M |
| **Description** | Ẩn button FE nhưng API/GAS vẫn cho phép → leak hoặc sửa trái phép |
| **Mitigation** | PERMISSION_MATRIX enforcement layers; `assertRoleAllowed`, `canUserSeeTask` trên mọi write; Worker auth trước Mốc 2 production; penetration spot test |
| **Owner** | Dev |
| **Phase** | Mốc 1+ |

---

## R05 — Rewrite quá sớm

| Field | Value |
|-------|-------|
| **Severity** | H |
| **Likelihood** | L |
| **Description** | Thay GAS/Sheet/AppSheet bằng backend mới → downtime, mất dữ liệu vận hành |
| **Mitigation** | RF_01 docs + roadmap incremental; explicit DO NOT list trong handoff; runtime-freeze branch policy; mọi phase có deployable slice |
| **Owner** | Architect |
| **Phase** | RF_01+ |

---

## R06 — Automation-first

| Field | Value |
|-------|-------|
| **Severity** | M |
| **Likelihood** | M |
| **Description** | Auto assign, auto resolve, AppSheet Bot, queue intelligence → sai nghiệp vụ, mất human-in-loop |
| **Mitigation** | Manual-first → Auto-later principle; no AppSheet Bot policy; explicit non-goals in WEBAPP_LED_OPERATIONAL_WORKSPACE; audit mọi state change |
| **Owner** | Product / dev |
| **Phase** | Mọi mốc |

---

## R07 — Nhân sự khó dùng

| Field | Value |
|-------|-------|
| **Severity** | M |
| **Likelihood** | M |
| **Description** | Workboard quá kỹ thuật, nhiều màn hình → bỏ qua, quay lại Zalo/Excel |
| **Mitigation** | WORKBOARD_UI_PLAN mobile-first/action-first; tiếng Việt (`998F_*`); staff trial runbook; AppSheet fallback link; pilot feedback capture (Phase 97 pattern) |
| **Owner** | Operator |
| **Phase** | Mốc 1–2 |

---

## R08 — Role migration shock

| Field | Value |
|-------|-------|
| **Severity** | M |
| **Likelihood** | M |
| **Description** | Chuyển ADMIN/OPERATOR/VIEWER → 6 roles đột ngột → AppSheet account và GAS assert fail |
| **Mitigation** | RF_01 doc-only matrix; migration phase riêng với mapping table; dual-read old+new role during transition; không đổi ENUM production ở RF_01 |
| **Owner** | ADMIN |
| **Phase** | Mốc 1–2 |

---

## R09 — Cloudflare Worker scope creep

| Field | Value |
|-------|-------|
| **Severity** | M |
| **Likelihood** | L |
| **Description** | Worker trở thành microservice cluster → vận hành quá nặng cho team nhỏ |
| **Mitigation** | Worker = thin bridge (auth, projection, plugin host); business logic giữ GAS; small-scale-first; defer Worker to Mốc 2–4 |
| **Owner** | Architect |
| **Phase** | Mốc 2–4 |

---

## R10 — Search leak private data

| Field | Value |
|-------|-------|
| **Severity** | H |
| **Likelihood** | L |
| **Description** | Unified search trả về TASK IS_PRIVATE hoặc hồ sơ ngoài phạm vi |
| **Mitigation** | SEARCH_ARCHITECTURE permission filter server-side; test cases in CBV_TCS; `canUserSeeTask` mandatory |
| **Owner** | Dev |
| **Phase** | Mốc 1+ |

---

## R11 — Fake DONE / missing handoff

| Field | Value |
|-------|-------|
| **Severity** | M |
| **Likelihood** | M |
| **Description** | Commit doc hoặc code without test envelope → false production claim |
| **Mitigation** | Memory-first report/handoff mandatory; CBV_TCS_V1 gate; no production claim in phase docs; tag only after Drive evidence |
| **Owner** | Dev |
| **Phase** | Mọi mốc |

---

## R12 — Destructive migration

| Field | Value |
|-------|-------|
| **Severity** | H |
| **Likelihood** | L |
| **Description** | Auto-migration xóa/sửa cột prod, report cũ |
| **Mitigation** | Append-only policy; runtime-freeze branch rules; no schema change RF_01; bootstrap repair manual-only with ADMIN |
| **Owner** | ADMIN |
| **Phase** | Mọi mốc |

---

## Summary matrix

| ID | Risk | S | L | Status |
|----|------|---|---|--------|
| R01 | AppSheet mismatch | H | M | Open — monitor |
| R02 | Schema drift | H | M | Open — monitor |
| R03 | FE → DB direct | H | M | Open — design guard |
| R04 | FE-only permission | H | M | Open — Mốc 1 |
| R05 | Early rewrite | H | L | Mitigated by policy |
| R06 | Automation-first | M | M | Mitigated by policy |
| R07 | UX adoption | M | M | Open — UAT |
| R08 | Role migration | M | M | Open — defer |
| R09 | Worker creep | M | L | Open — defer |
| R10 | Search leak | H | L | Open — Mốc 1 test |
| R11 | Fake DONE | M | M | Mitigated by TCS |
| R12 | Destructive migration | H | L | Mitigated by freeze |

---

## Review cadence

- **Mỗi milestone closeout:** cập nhật risk status trong report mới (append-only)
- **Sau pilot UAT:** đánh giá lại R07, R01
- **Trước Worker prod:** đánh giá lại R03, R04, R09

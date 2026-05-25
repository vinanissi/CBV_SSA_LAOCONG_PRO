# Permission Matrix — CBV Modular Operational Workspace

**Phase:** PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`

---

## 1. Role model (target)

| Role | Mô tả | Mapping từ hiện tại |
|------|-------|---------------------|
| **ADMIN** | Toàn quyền cấu hình, audit, bootstrap | = ADMIN hiện tại |
| **MANAGER** | Điều phối, giao việc, xem workload team | ⊂ OPERATOR (mở rộng) |
| **STAFF** | Thao tác nghiệp vụ hằng ngày | = OPERATOR cơ bản |
| **FINANCE** | Thu/chi, xác nhận, chứng từ | Chuyên biệt từ OPERATOR |
| **HO_SO** | Quản lý hồ sơ, file, expiry | Chuyên biệt từ OPERATOR |
| **VIEW_ONLY** | Chỉ xem, không sửa | = VIEWER hiện tại |

**Lưu ý:** Hiện tại GAS/AppSheet dùng ADMIN / OPERATOR / VIEWER (`05_GAS_RUNTIME/USER_ROLE_PERMISSION_SPEC.md`). Migration sang 6 roles cần phase riêng — RF_01 chỉ định nghĩa target matrix.

---

## 2. Quy tắc enforcement

| # | Rule |
|---|------|
| 1 | **Không có quyền → không hiện action** trên FE Workboard |
| 2 | **FE ẩn action chưa đủ** — Worker/API và GAS service phải `assert` lại |
| 3 | **AppSheet permission đồng bộ role** — USERSETTINGS("Role") map cùng enum |
| 4 | **Quyền xem ≠ quyền sửa** — VIEW_ONLY và slice read-only |
| 5 | **Finance confirm** — bắt buộc audit CONFIRMED_BY |
| 6 | **TASK private** — `IS_PRIVATE=true` chỉ OWNER, REPORTER, SHARED_WITH, ADMIN |

---

## 3. Ma trận quyền theo module

Legend: **V** view, **C** create, **E** edit, **D** delete/archive, **A** admin/config, **—** no access

### 3.1 TASK

| Action | ADMIN | MANAGER | STAFF | FINANCE | HO_SO | VIEW_ONLY |
|--------|:-----:|:-------:|:-----:|:-------:|:-----:|:---------:|
| View all tasks | V | V* | V* | V* | V* | V* |
| View my/assigned tasks | V | V | V | V | V | V |
| Create task | C | C | C | — | C** | — |
| Assign / reassign | E | E | — | — | — | — |
| Update status (own) | E | E | E | — | — | — |
| Approve / reject | E | E | — | — | — | — |
| Set private / share | E | E | E*** | — | — | — |
| Archive / cancel | D | D | — | — | — | — |

\* Theo visibility: public, ownership, SHARED_WITH, IS_PRIVATE rules.  
\** HO_SO: create task gắn hồ sơ trong phạm vi phụ trách.  
\*** STAFF: share trong phạm vi task own.

### 3.2 FINANCE

| Action | ADMIN | MANAGER | STAFF | FINANCE | HO_SO | VIEW_ONLY |
|--------|:-----:|:-------:|:-----:|:-------:|:-----:|:---------:|
| View transactions | V | V* | V* | V | V* | V* |
| Create draft | C | C | C | C | — | — |
| Edit draft | E | E | E | E | — | — |
| Confirm thu/chi | E | — | — | E | — | — |
| Attach evidence | E | E | E | E | — | — |
| Cancel / archive | D | — | — | E | — | — |
| Finance summary report | V | V | — | V | — | V |

### 3.3 HO_SO

| Action | ADMIN | MANAGER | STAFF | FINANCE | HO_SO | VIEW_ONLY |
|--------|:-----:|:-------:|:-----:|:-------:|:-----:|:---------:|
| View hồ sơ | V | V | V* | V* | V | V* |
| Create hồ sơ | C | C | C | — | C | — |
| Edit hồ sơ | E | E | E* | — | E | — |
| Upload file | E | E | E | — | E | — |
| Archive hồ sơ | D | D | — | — | E | — |
| Manage relations | E | E | — | — | E | — |

\* Phạm vi đơn vị / MANAGER_USER_ID.

### 3.4 FILE (cross-module)

| Action | ADMIN | MANAGER | STAFF | FINANCE | HO_SO | VIEW_ONLY |
|--------|:-----:|:-------:|:-----:|:-------:|:-----:|:---------:|
| Upload | E | E | E | E | E | — |
| Preview / download | V | V | V* | V | V | V* |
| Delete file | D | — | — | — | E | — |

### 3.5 NOTIFICATION

| Action | ADMIN | MANAGER | STAFF | FINANCE | HO_SO | VIEW_ONLY |
|--------|:-----:|:-------:|:-----:|:-------:|:-----:|:---------:|
| View own notifications | V | V | V | V | V | V |
| View team alerts | V | V | — | V* | V* | — |
| Configure alert rules | A | — | — | — | — | — |
| Acknowledge / dismiss | E | E | E | E | E | — |

### 3.6 SEARCH

| Action | ADMIN | MANAGER | STAFF | FINANCE | HO_SO | VIEW_ONLY |
|--------|:-----:|:-------:|:-----:|:-------:|:-----:|:---------:|
| Global operational search | V | V | V | V | V | V* |
| Search finance detail | V | V | — | V | — | — |
| Search admin tables | V | — | — | — | — | — |

\* Kết quả filter theo visibility từng record — không leak private task.

### 3.7 REPORT

| Action | ADMIN | MANAGER | STAFF | FINANCE | HO_SO | VIEW_ONLY |
|--------|:-----:|:-------:|:-----:|:-------:|:-----:|:---------:|
| View operational reports | V | V | — | V | — | V |
| View audit / admin reports | V | — | — | — | — | — |
| Export (manual) | E | E | — | E | — | — |

---

## 4. Enforcement layers

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Workboard FE│ ──► │ CF Worker   │ ──► │ GAS service │ ──► │ Google Sheet│
│ hide action │     │ auth + RBAC │     │ assertRole  │     │ row data    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       ▲
       │ parallel
┌─────────────┐
│ AppSheet    │
│ slice filter│
└─────────────┘
```

| Layer | Responsibility |
|-------|----------------|
| **FE** | Ẩn button/menu; không gọi API forbidden |
| **Worker** | JWT/session; map role; filter DTO fields |
| **GAS** | `assertRoleAllowed`, `canUserSeeTask`, finance confirm audit |
| **AppSheet** | Security filter per table/view; Account role |

---

## 5. AppSheet sync checklist (target)

- [ ] Map 6 roles → AppSheet USERSETTINGS("Role") values
- [ ] Update slice filters per role (TASK, FINANCE, HO_SO)
- [ ] Admin tables: ADMIN only (separate app recommended)
- [ ] Document filter expressions in `04_APPSHEET/` matrix
- [ ] Cross-account spot check (operator A ≠ operator B private data)

---

## 6. Phase RF_01 scope

Matrix documented only. **Không** đổi ENUM_DICTIONARY ROLE trên production Sheet trong phase này.

Next phase đề xuất: `PHASE_RF_02_PERMISSION_RUNTIME_BASELINE` — implement role mapping + Worker auth stub + GAS assert alignment.

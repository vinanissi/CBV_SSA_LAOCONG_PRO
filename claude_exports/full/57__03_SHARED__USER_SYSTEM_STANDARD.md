# CBV User System Standard

**Design:** Dedicated USER_DIRECTORY layer. Operational users managed separately from business records. Small-scale, CBV-compliant.

---

## PART 1 — Design Principle

### USER_DIRECTORY vs HO_SO_MASTER vs MASTER_CODE

| Layer | Purpose | Identity Type |
|-------|---------|---------------|
| **USER_DIRECTORY** | Operational users (login, task assignment, finance confirmation) | System identity |
| **HO_SO_MASTER** | Business entities (HTX, XA_VIEN, XE, TAI_XE) | Business entity |
| **MASTER_CODE** | Dynamic lookup codes (provinces, districts, cost centers) | Reference data |

**Strict rules:**
- Do NOT use HO_SO_MASTER as user directory
- Do NOT overload MASTER_CODE with MASTER_GROUP=USER for operational users
- USER_DIRECTORY is the single source of truth for system-operational identity

---

## PART 2 — USER_DIRECTORY Column Roles

| Column | Role | Notes |
|--------|------|-------|
| ID | System key, stable, immutable | UD_YYYYMMDD_xxxxx format |
| USER_CODE | Business/user-facing code | Machine-safe; USER_001, USER_002 |
| FULL_NAME | Canonical human name | Full legal or display name |
| DISPLAY_NAME | UI-friendly display | Optional override; empty = use FULL_NAME |
| EMAIL | Main login / user identity reference | Primary lookup for USEREMAIL() mapping |
| PHONE | Contact phone | Optional |
| ROLE | Controlled by enum | ADMIN \| OPERATOR \| VIEWER (ENUM_DICTIONARY ROLE) |
| POSITION | Job title / position | Optional text; not enum |
| HTX_ID | Link to HTX business record | Ref HO_SO_MASTER; when user belongs to specific HTX |
| STATUS | Lifecycle state | ACTIVE \| INACTIVE \| ARCHIVED |
| IS_SYSTEM | System-seeded user | Yes/No; system users not admin-editable |
| ALLOW_LOGIN | Can sign in | Yes/No; gate for AppSheet login |
| NOTE | Admin note | Optional |
| CREATED_AT, CREATED_BY | Audit | Standard |
| UPDATED_AT, UPDATED_BY | Audit | Standard |
| IS_DELETED | Soft delete | Standard |

---

## PART 3 — Field Mapping to Business Tables

| Table | Field | Ref Target | Store | Display | Valid_If |
|-------|-------|------------|-------|---------|---------|
| TASK_MAIN | OWNER_ID | USER_DIRECTORY | USER_DIRECTORY.ID | DISPLAY_NAME or FULL_NAME | STATUS=ACTIVE, !IS_DELETED |
| TASK_MAIN | REPORTER_ID | USER_DIRECTORY | USER_DIRECTORY.ID | DISPLAY_NAME or FULL_NAME | STATUS=ACTIVE |
| HO_SO_MASTER | OWNER_ID | USER_DIRECTORY | USER_DIRECTORY.ID | DISPLAY_NAME or FULL_NAME | STATUS=ACTIVE |
| TASK_CHECKLIST | DONE_BY | USER_DIRECTORY | USER_DIRECTORY.ID | DISPLAY_NAME or FULL_NAME | STATUS=ACTIVE |
| FINANCE_TRANSACTION | CONFIRMED_BY | USER_DIRECTORY | USER_DIRECTORY.ID | DISPLAY_NAME or FULL_NAME | STATUS=ACTIVE |
| TASK_UPDATE_LOG | ACTOR_ID | Optional ref | USER_DIRECTORY.ID or email fallback | Resolve via getUserDisplay | When user not in USER_DIRECTORY, stores email |
| ADMIN_AUDIT_LOG | ACTOR_ID | Optional ref | USER_DIRECTORY.ID or email fallback | Resolve via getUserDisplay | Same |
| FINANCE_LOG | ACTOR_ID | Optional ref | USER_DIRECTORY.ID or email fallback | Resolve via getUserDisplay | Same |

**Note:** ACTOR_ID stores USER_DIRECTORY.ID when current user is in USER_DIRECTORY; otherwise stores email for audit traceability. Display: use getUserDisplay(ACTOR_ID) — works for both ID and email (getUserById accepts email).

---

## PART 4 — STATUS Values

| Value | Meaning |
|-------|---------|
| ACTIVE | Usable in dropdowns, can be assigned tasks, can confirm finance |
| INACTIVE | Hidden from new selections; existing refs remain valid |
| ARCHIVED | No longer used; historical only |

---

## PART 5 — ROLE (Enum-Controlled)

| Role | Source | Enforcement |
|------|--------|-------------|
| ADMIN | ADMIN_EMAILS + AppSheet | assertAdminAuthority(), AppSheet slice |
| OPERATOR | AppSheet | AppSheet slice |
| VIEWER | AppSheet | AppSheet slice |

ROLE column stores values from ENUM_DICTIONARY (ENUM_GROUP=ROLE). No free text.

---

## PART 6 — HTX_ID

- Optional ref to HO_SO_MASTER
- Use when user is tied to a specific HTX (e.g. HTX staff)
- Validation: when provided, must reference HO_SO_MASTER where HO_SO_TYPE=HTX

---

## PART 7 — Display Mapping

- **Stored:** USER_DIRECTORY.ID (for Ref fields)
- **Display:** DISPLAY_NAME or FULL_NAME (if DISPLAY_NAME empty)
- **Email lookup:** EMAIL column for USEREMAIL() mapping

---

## PART 8 — GAS Expectations

- `getActiveUsers()` — from USER_DIRECTORY, STATUS=ACTIVE
- `getUserByEmail(email)` — lookup by EMAIL
- `getUserById(userId)` — lookup by ID or USER_CODE
- `getUserDisplay(userId)` — DISPLAY_NAME or FULL_NAME
- `getUserRole(userId)` — ROLE
- `assertValidUserId(userId, fieldName)` — valid active user
- `assertRoleAllowed(userId, requiredRoleOrList)` — role check
- `mapCurrentUserEmailToInternalId()` — current user → USER_DIRECTORY.ID

---

## Audit Policy

- Do not overload HO_SO_MASTER to act as user system
- Do not store roles as uncontrolled free text
- Do not skip audit fields (CREATED_*, UPDATED_*, IS_DELETED)
- Keep USER_DIRECTORY small-scale CBV compliant

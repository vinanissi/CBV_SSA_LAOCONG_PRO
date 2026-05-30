# CBV_WORK_INBOX_V3 — Role & Permission

**Version:** V3.0 · **Date:** 2026-05-29  
**Sources:** `api/contracts.ts`, `runtime/runtimeIdentity.ts`, `runtime/modulePermissions.ts`, GAS `46_CBV_PERMISSION_RUNTIME.js`

---

## 1. Role model

### API roles (`UserRole`)

| Role | Label (VI) | Runtime mode |
|------|------------|--------------|
| `ADMIN` | Quản trị | `admin` |
| `MANAGER` | Quản lý | `supervisor` |
| `STAFF` | Nhân viên | `operator` |
| `FINANCE` | Tài chính | `operator` (domain scoped) |
| `HO_SO` | Hồ sơ | `operator` (domain scoped) |
| `VIEW_ONLY` | Chỉ xem | `viewer` |

### Directory roles (USER_DIRECTORY.ROLE)

Legacy mapping: `ADMIN` \| `OPERATOR` \| `VIEWER` → normalized via `deriveModeFromRecord()`.

---

## 2. Runtime capabilities (`RuntimeUserCapabilities`)

| Capability | admin | supervisor | operator | viewer |
|------------|-------|------------|----------|--------|
| `canAssign` | ✓ | ✓ | ✓ | ✗ |
| `canApprove` | ✓ | ✓ | ✗ | ✗ |
| `canEscalate` | ✓ | ✓ | ✗ | ✗ |
| `canResolve` | ✓ | ✓ | ✓ | ✗ |

Derived in `deriveCapabilities()` when not explicit in snapshot.

---

## 3. Permission strings

`UserContext.permissions` array — examples:

| Permission | Effect |
|------------|--------|
| `ADMIN_ALL` | Full module access |
| (module-specific) | Gates module launchpad entries |

Module access: `canAccessModule(user, mod)` in `modulePermissions.ts`.

---

## 4. Work Inbox action matrix

| Action | admin | supervisor | operator | viewer |
|--------|-------|------------|----------|--------|
| View task list | ✓ | ✓ | ✓ | ✓ |
| View task detail | ✓ | ✓ | ✓ | ✓ |
| Filter / group / focus | ✓ | ✓ | ✓ | ✓ |
| Inline accept | ✓ | ✓ | ✓* | ✗ |
| Inline complete | ✓ | ✓ | ✓* | ✗ |
| Handoff | ✓ | ✓ | ✓* | ✗ |
| Micro-update | ✓ | ✓ | ✓* | ✗ |
| Approve | ✓ | ✓ | ✗ | ✗ |
| Assign owner | ✓ | ✓ | ✓ | ✗ |
| Create task | ✓ | ✓ | ✓ | ✗ |

\*Operator: only when task ownership/rules permit (server-side validation final).

Implementation: `filterQuickActionsByIdentity()`, `canPerformInlineAction()`.

---

## 5. TASK_MAIN visibility (server)

Per TASK_MAIN PRO baseline (not FE-enforced alone):

| Condition | Visible to |
|-----------|------------|
| ADMIN | All tasks |
| IS_PRIVATE = false/blank | Per slice filter |
| IS_PRIVATE = true | OWNER_ID, REPORTER_ID, SHARED_WITH, ADMIN |

FE receives pre-filtered snapshot from API — **do not** reimplement full visibility logic client-side except for UI hints.

---

## 6. Execution modes

`ExecutionMode` on task/actions:

| Mode | UI behavior |
|------|-------------|
| `READ_ONLY` | No write buttons |
| `NAVIGATE` | Link to AppSheet only |
| `EXECUTION_LOCKED` | Disabled with explanation |
| `MANUAL_CONFIRM_REQUIRED` | Confirm dialog before write |
| `NOT_CONFIGURED` | AppSheet escape hatch |

---

## 7. Filter defaults by identity

From `getIdentityLandingDefaults()`:

| Mode | Default filter | Default quick focus |
|------|----------------|---------------------|
| operator | `mine` | `actionable` |
| supervisor | `pending` | `team` |
| admin | `mine` | `all` |
| viewer | `mine` | `all` |

Applied on first visit when no working context saved.

---

## 8. UI gating rules

1. **Hide, don't disable** write buttons for viewer (reduce clutter).
2. **Disable with tooltip** when capability exists but task state forbids action.
3. **Never show** raw permission errors in card — use `RuntimeFeedbackMessage` on action attempt.
4. Role badge in TopBar only — not on every task row.
5. Admin debug fields collapsed by default — never default-visible for operator.

---

## 9. Module sidebar gating

Modules with `roleRequired` array — user.role must match unless `ADMIN_ALL`.

Work Inbox (tasks) module must remain accessible to all authenticated roles including VIEW_ONLY.

---

## 10. Security constraints

- No permission elevation client-side
- API envelope is authority — FE gating is UX only
- Logout clears session storage auth keys
- Do not render EMAIL/PHONE in queue cards (detail only if needed)

---

## 11. Test references

`taskGs10Checks.ts` validates:
- Operator gets assign/resolve capabilities
- Viewer cannot handoff
- Identity landing defaults per role

Run as part of GS_10 identity runtime verification.

---

## 12. Change policy

New roles or capabilities require:
1. Update `api/contracts.ts`
2. Update `runtimeIdentity.ts` derivation
3. Update this matrix
4. GAS permission runtime alignment
5. Test console evidence

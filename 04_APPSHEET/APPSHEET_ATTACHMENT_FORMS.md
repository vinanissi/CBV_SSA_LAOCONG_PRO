# AppSheet Attachment Forms — Child Form Field Order

Quick reference for attachment child form UX. See APPSHEET_INLINE_ATTACHMENT_UX.md for full design.

---

## HO_SO_FILE Form (inline from HO_SO_DETAIL)

| Order | Field | Visible | Editable |
|-------|-------|---------|----------|
| 1 | FILE_GROUP | Yes | Yes |
| 2 | FILE_NAME | Yes | Yes |
| 3 | FILE_URL | Yes | Yes |
| 4 | NOTE | Yes | Yes |
| — | HO_SO_ID | No (inline) | No (auto-linked) |
| — | ID, DRIVE_FILE_ID, STATUS, CREATED_AT, CREATED_BY | No | No |

**Note:** HO_SO_FILE has no TITLE; use FILE_NAME.

---

## TASK_ATTACHMENT Form (inline from TASK_DETAIL)

| Order | Field | Visible | Editable |
|-------|-------|---------|----------|
| 1 | ATTACHMENT_TYPE | Yes | Yes |
| 2 | TITLE | Yes | Yes |
| 3 | FILE_URL | Yes | Yes |
| 4 | NOTE | Yes | Yes |
| — | TASK_ID | No (inline) | No (auto-linked) |
| — | ID, FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY | No | No |

---

## FINANCE_ATTACHMENT Form (inline from FIN_DETAIL)

| Order | Field | Visible | Editable |
|-------|-------|---------|----------|
| 1 | ATTACHMENT_TYPE | Yes | Yes |
| 2 | TITLE | Yes | Yes |
| 3 | FILE_URL | Yes | Yes |
| 4 | NOTE | Yes | Yes |
| — | FINANCE_ID | No (inline) | No (auto-linked) |
| — | ID, FILE_NAME, DRIVE_FILE_ID, CREATED_AT, CREATED_BY | No | No |

---

## Form Behavior

- **Parent ref:** Hidden when opened inline; auto-linked by IsPartOf
- **FILE_URL:** Type = File; user uploads; AppSheet stores URL
- **Type fields:** Dropdown; Valid_If from ENUM_DICTIONARY; do not allow other values

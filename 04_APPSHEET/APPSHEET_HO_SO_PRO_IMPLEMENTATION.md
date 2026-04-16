# HO_SO PRO — AppSheet implementation guide

**Purpose:** Step-by-step checklist with **copy-paste row filters** for Data → Slices, aligned with:

- `02_MODULES/HO_SO/DATA_MODEL.md` — canonical columns, refs, enums (source of truth)
- `06_DATABASE/schema_manifest.json` — sheet column order / presence
- `APPSHEET_HO_SO_PRO_SPEC.md` — AppSheet tables, views, UX
- `APPSHEET_SLICE_MAP.md` — shared slices (ACTIVE_HTX, HO_SO_ACTIVE, ACTIVE_USERS, …)
- `APPSHEET_SLICE_SPEC.md` — ACTIVE_DON_VI and related patterns

**Operators:** Data → Slices → **Add slice** → paste **Row filter** as a single expression. If AppSheet shows a validation error with a leading `=`, remove the extra `=` (some editors prepend one automatically).

---

## 0. Prerequisites

| Step | Action |
|------|--------|
| ☐ | Google Sheet tabs and headers match **`06_DATABASE/schema_manifest.json`** (and `DATA_MODEL.md`). If you deploy schema via GAS, match your project’s `CBV_SCHEMA_MANIFEST` / bootstrap file after `clasp push`. |
| ☐ | Shared tabs exist: `MASTER_CODE`, `DON_VI`, `USER_DIRECTORY` (and enum source tables / settings per your CBV setup). |
| ☐ | PRO model: **`HO_SO_TYPE_ID`** → `MASTER_CODE` as **Ref** (group `HO_SO_TYPE`). Required so slice formulas like `[HO_SO_TYPE_ID].[CODE] = "HTX"` (ACTIVE_HTX) validate. Do not rely on legacy text column `HO_SO_TYPE` after cutover — see `02_MODULES/HO_SO/HO_SO_SHEET_CUTOVER.md`. |
| ☐ | GAS `10_HOSO_*.js` deployed if you use automation (`closeHoso`, webhooks, etc.). |

---

## 1. Add AppSheet tables (Data → Tables)

| AppSheet table name | Worksheet | Key column |
|---------------------|-----------|------------|
| HO_SO_MASTER | HO_SO_MASTER | ID |
| HO_SO_FILE | HO_SO_FILE | ID |
| HO_SO_RELATION | HO_SO_RELATION | ID |
| HO_SO_UPDATE_LOG | HO_SO_UPDATE_LOG | ID |

---

## 2. Create slices — **recommended order** (HO_SO + dependencies)

Create shared slices first (used by Ref dropdowns and other modules), then HO_SO-only slices.

### 2.1 Shared (from `APPSHEET_SLICE_MAP.md` / `APPSHEET_SLICE_SPEC.md`)

**Slice: `ACTIVE_USERS`** — Source: `USER_DIRECTORY`

```
AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)
```

**Slice: `ACTIVE_DON_VI`** — Source: `DON_VI`

```
AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)
```

**Slice: `ACTIVE_MASTER_CODES`** — Source: `MASTER_CODE` (generic active codes)

```
AND([STATUS] = "ACTIVE", [IS_DELETED] = FALSE)
```

**Slice: `ACTIVE_HO_SO_TYPE`** — Source: `MASTER_CODE` — dropdown for **`HO_SO_MASTER.HO_SO_TYPE_ID`** (per `APPSHEET_HO_SO_PRO_SPEC.md`: `MASTER_GROUP = HO_SO_TYPE`)

```
AND([MASTER_GROUP] = "HO_SO_TYPE", [STATUS] = "ACTIVE", [IS_DELETED] = FALSE)
```

**Slice: `ACTIVE_HTX`** — Source: `HO_SO_MASTER`

Requires **`HO_SO_TYPE_ID`** to be **Type = Ref** → `MASTER_CODE`. If Ref is not set yet, use the **fallback** below (IDs only, no dereference).

```
AND([HO_SO_TYPE_ID].[CODE] = "HTX", [IS_DELETED] = FALSE)
```

**Fallback `ACTIVE_HTX` (when `HO_SO_TYPE_ID` is not a Ref yet)** — same source `HO_SO_MASTER`; `HO_SO_TYPE_ID` must store `MASTER_CODE` row IDs:

```
AND(
  [IS_DELETED] = FALSE,
  IN(
    [HO_SO_TYPE_ID],
    SELECT(MASTER_CODE[ID], AND([MASTER_GROUP] = "HO_SO_TYPE", [CODE] = "HTX", [IS_DELETED] = FALSE))
  )
)
```

**Slice: `HO_SO_ACTIVE`** — Source: `HO_SO_MASTER`

```
[IS_DELETED] = FALSE
```

---

### 2.2 HO_SO module slices (from `APPSHEET_HO_SO_PRO_SPEC.md`)

**Slice: `HO_SO_MASTER_Active`** — Source: `HO_SO_MASTER`

```
[IS_DELETED] = FALSE
```

*(Same condition as `HO_SO_ACTIVE`; keep both names only if you already use them in views/refs — otherwise one slice is enough.)*

**Slice: `HO_SO_MASTER_MyItems`** — Source: `HO_SO_MASTER` — rows owned by current signed-in user (ref `OWNER_ID` → `USER_DIRECTORY`)

```
AND(
  [IS_DELETED] = FALSE,
  [OWNER_ID] = ANY(SELECT(USER_DIRECTORY[ID], AND([STATUS] = "ACTIVE", LOWER([EMAIL]) = LOWER(USEREMAIL()))))
)
```

**Slice: `HO_SO_MASTER_Expiring`** — Source: `HO_SO_MASTER` — `END_DATE` in the next 30 days; exclude terminal statuses (values must match your **`HO_SO_STATUS`** enum / `ENUM_DICTIONARY`)

```
AND(
  [IS_DELETED] = FALSE,
  [END_DATE] >= TODAY(),
  [END_DATE] <= (TODAY() + 30),
  NOT(IN([STATUS], LIST("CLOSED", "ARCHIVED")))
)
```

**Slice: `HO_SO_MASTER_Expired`** — Source: `HO_SO_MASTER`

```
AND([END_DATE] < TODAY(), [IS_DELETED] = FALSE)
```

**Slice: `HO_SO_FILE_Active`** — Source: `HO_SO_FILE`

`HO_SO_FILE` has **no** `IS_DELETED` (`02_MODULES/HO_SO/DATA_MODEL.md`); use **`STATUS`** (`ACTIVE` / `ARCHIVED`).

```
[STATUS] = "ACTIVE"
```

**Slice: `HO_SO_RELATION_Active`** — Source: `HO_SO_RELATION`

```
[IS_DELETED] = FALSE
```

**Slice: `HO_SO_UPDATE_LOG_Active`** — Source: `HO_SO_UPDATE_LOG`

```
[IS_DELETED] = FALSE
```

---

## 3. Ref columns — attach slices (Data → Column → Type Ref)

| Column | Table | Ref target | Suggested slice (paste name in Ref config) |
|--------|-------|------------|-----------------------------------------------|
| HO_SO_TYPE_ID | HO_SO_MASTER | MASTER_CODE | `ACTIVE_HO_SO_TYPE` |
| DON_VI_ID | HO_SO_MASTER | DON_VI | `ACTIVE_DON_VI` |
| OWNER_ID, MANAGER_USER_ID | HO_SO_MASTER | USER_DIRECTORY | `ACTIVE_USERS` |
| HTX_ID | HO_SO_MASTER | HO_SO_MASTER | `ACTIVE_HTX` |
| HO_SO_ID | HO_SO_FILE, HO_SO_UPDATE_LOG | HO_SO_MASTER | `HO_SO_ACTIVE` or parent context / Related rows |
| FROM_HO_SO_ID, TO_HO_SO_ID | HO_SO_RELATION | HO_SO_MASTER | `HO_SO_ACTIVE` (or context slice) |
| ACTOR_ID | HO_SO_UPDATE_LOG | USER_DIRECTORY | `ACTIVE_USERS` (allow blank if optional) |

---

## 4. Enum columns — Valid_If / data validation

Bind enum groups per **`DATA_MODEL.md`** / `06_DATABASE/ENUM_USAGE_MAP.md` / `APPSHEET_HO_SO_PRO_SPEC.md`:

| Column | Table | Enum group / notes |
|--------|-------|---------------------|
| STATUS | HO_SO_MASTER | `HO_SO_STATUS` |
| HO_SO_TYPE_ID | HO_SO_MASTER | Ref → `MASTER_CODE` (`MASTER_GROUP = HO_SO_TYPE`); not a text enum |
| PRIORITY | HO_SO_MASTER | `PRIORITY` |
| RELATED_ENTITY_TYPE | HO_SO_MASTER | `RELATED_ENTITY_TYPE` |
| ID_TYPE | HO_SO_MASTER | `ID_TYPE` |
| SOURCE_CHANNEL | HO_SO_MASTER | `SOURCE_CHANNEL` |
| FILE_GROUP | HO_SO_FILE | `FILE_GROUP` |
| STATUS | HO_SO_FILE | `ACTIVE` / `ARCHIVED` (per DATA_MODEL; Valid_If or fixed list) |
| RELATION_TYPE | HO_SO_RELATION | `HO_SO_RELATION_TYPE` |
| STATUS | HO_SO_RELATION | `HO_SO_STATUS` |
| ACTION_TYPE | HO_SO_UPDATE_LOG | `HO_SO_ACTION_TYPE` |

Use your CBV enum / `ENUM_DICTIONARY` workflow; do not hand-type raw status values if policy forbids it.

---

## 5. Views checklist (UX)

| Step | View name | Type | Data / slice |
|------|-----------|------|--------------|
| ☐ | HO_SO_HOME | Menu | Links to list / my / expiring |
| ☐ | HO_SO_MASTER_Table | Table | `HO_SO_MASTER_Active` or `HO_SO_ACTIVE` |
| ☐ | HO_SO_MASTER_Detail | Detail | Full row + **inline** child views |
| ☐ | HO_SO_Form | Form | Create/edit; hide system fields (`ID`, `HO_SO_CODE` read-only or hidden on create) |
| ☐ | HO_SO_My_View | Deck/Gallery | `HO_SO_MASTER_MyItems` |
| ☐ | HO_SO_Expiring_View | Table | `HO_SO_MASTER_Expiring` |
| ☐ | HO_SO_Expired_View | Table | `HO_SO_MASTER_Expired` |
| ☐ | HO_SO_FILE_Inline | Inline under Detail | `HO_SO_ID` = parent; slice `HO_SO_FILE_Active` |
| ☐ | HO_SO_RELATION_Inline | Inline | `HO_SO_RELATION_Active` |
| ☐ | HO_SO_UPDATE_LOG_Inline | Inline (read-only) | `HO_SO_UPDATE_LOG_Active` |

**UX rules (quick):**

- **STATUS (master):** `Editable_If` = `FALSE` for normal operators; change via **Actions** / automation.
- **HO_SO_CODE:** read-only; not an input on create form.
- **`IS_STARRED`, `IS_PINNED`, `PENDING_ACTION`:** optional UX / bot columns on `HO_SO_MASTER` per DATA_MODEL; hide or restrict edit per policy.
- **RELATED_TABLE:** whitelist matches GAS: `TASK`, `DON_VI`, `FINANCE_TRANSACTION`, `USER_DIRECTORY`, `HO_SO`.

---

## 6. Optional actions (status transitions)

Suggested target values (align with `02_MODULES/HO_SO/` + GAS):

| Action label (UI) | Set STATUS to |
|-------------------|----------------|
| Submit for review | `IN_REVIEW` |
| Activate | `ACTIVE` |
| Close record | `CLOSED` |
| Archive | `ARCHIVED` |

Wire to **Grouped action** / webhook / Apps Script per `SERVICE_MAP` and production policy.

---

## 7. Verification

| Check | Expected |
|-------|----------|
| New HO_SO row | `HO_SO_CODE` populated by backend or policy; refs resolve. |
| HTX dropdown | Only rows where `[HO_SO_TYPE_ID].[CODE] = "HTX"`. |
| My items | Only current user’s `OWNER_ID`. |
| Inline children | `HO_SO_FILE` / `HO_SO_UPDATE_LOG`: parent `HO_SO_ID`. `HO_SO_RELATION`: `FROM_HO_SO_ID` hoặc `TO_HO_SO_ID` = parent. Log read-only if configured. |

---

## 8. Related docs

| Doc | Content |
|-----|---------|
| `APPSHEET_HO_SO_PRO_SPEC.md` | AppSheet tables, refs, views |
| `02_MODULES/HO_SO/DATA_MODEL.md` | Canonical HO_SO columns and semantics |
| `06_DATABASE/schema_manifest.json` | Column lists per sheet |
| `APPSHEET_SLICE_MAP.md` | Full slice catalog + TASK/FIN slices |
| `02_MODULES/HO_SO/APPSHEET_UX_SPEC.md` | UX principles |
| `02_MODULES/HO_SO/HO_SO_SHEET_CUTOVER.md` | Sheet migration / remove `HO_SO_TYPE` column |

---

*Aligned with `DATA_MODEL.md`, `schema_manifest.json`, `APPSHEET_HO_SO_PRO_SPEC.md`, and `APPSHEET_SLICE_MAP.md`. Adjust `HO_SO_STATUS` literals in filters to match your `ENUM_DICTIONARY`.*

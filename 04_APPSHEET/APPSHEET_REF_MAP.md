# AppSheet Reference Map (Final)

**Architecture:** Non-hybrid. See 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md.

---

## USER_DIRECTORY

- Operational users only. Slice **ACTIVE_USERS**: `STATUS=ACTIVE, IS_DELETED=FALSE`
- Display: FULL_NAME or DISPLAY_NAME (or virtual: `IF(ISNOTBLANK([DISPLAY_NAME]), [DISPLAY_NAME], [FULL_NAME])`)
- Users are global; no HTX/DON_VI dependency.

---

## DON_VI

- Sole organization table. Slice **ACTIVE_DON_VI**: `STATUS=ACTIVE, IS_DELETED=FALSE`
- Display: DISPLAY_TEXT or NAME
- MANAGER_USER_ID refs ACTIVE_USERS

---

## HO_SO_MASTER

**Slice `ACTIVE_HO_SO_TYPE`:** Source = `MASTER_CODE`; Filter = `AND([MASTER_GROUP]="HO_SO_TYPE", [STATUS]="ACTIVE", [IS_DELETED]=FALSE)` — dropdown cho `HO_SO_TYPE_ID`.

| Column   | Ref Target   | Display | Notes                    |
|----------|--------------|---------|--------------------------|
| HO_SO_TYPE_ID | MASTER_CODE (slice ACTIVE_HO_SO_TYPE) | DISPLAY_TEXT | Required PRO |
| HTX_ID   | ACTIVE_HTX   | NAME    | Slice of HO_SO_MASTER (HO_SO_TYPE=HTX) |
| OWNER_ID | ACTIVE_USERS | FULL_NAME | USER_DIRECTORY; store ID |

---

## HO_SO_FILE

| Column   | Ref Table    | Display |
|----------|--------------|---------|
| HO_SO_ID | HO_SO_MASTER | NAME    |

---

## HO_SO_RELATION

| Column        | Ref Table    | Display |
|---------------|--------------|---------|
| FROM_HO_SO_ID | HO_SO_MASTER | NAME    |
| TO_HO_SO_ID   | HO_SO_MASTER | NAME    |

---

## TASK_MAIN

| Column             | Ref Target       | Display       | Notes                         |
|--------------------|------------------|---------------|-------------------------------|
| DON_VI_ID          | ACTIVE_DON_VI    | DISPLAY_TEXT  | Organizational ownership      |
| TASK_TYPE_ID       | ACTIVE_TASK_TYPE | DISPLAY_TEXT  | MASTER_CODE MASTER_GROUP=TASK_TYPE |
| OWNER_ID           | ACTIVE_USERS     | FULL_NAME     | Store USER_DIRECTORY.ID       |
| REPORTER_ID        | ACTIVE_USERS     | FULL_NAME     | Default from USEREMAIL()      |
| RELATED_ENTITY_ID  | Polymorphic      | Varies        | By RELATED_ENTITY_TYPE        |

**Removed:** HTX_ID (use DON_VI_ID).

---

## TASK_CHECKLIST

| Column  | Ref Target   | Display       | Notes    |
|---------|--------------|---------------|----------|
| TASK_ID | TASK_MAIN    | TITLE         | IsPartOf |
| DONE_BY | ACTIVE_USERS | FULL_NAME     | GAS set  |

---

## TASK_UPDATE_LOG

| Column  | Ref Table    | Display | Notes    |
|---------|--------------|---------|----------|
| TASK_ID | TASK_MAIN    | TITLE   | Readonly |
| ACTOR_ID | — | getUserDisplay or raw | USER_DIRECTORY.ID or email fallback; no Ref slice |

---

## TASK_ATTACHMENT

| Column  | Ref Table | Display | Notes    |
|---------|-----------|---------|----------|
| TASK_ID | TASK_MAIN | TITLE   | IsPartOf |

---

## FINANCE_TRANSACTION

| Column             | Ref Target   | Display       | Notes    |
|--------------------|--------------|---------------|----------|
| DON_VI_ID          | ACTIVE_DON_VI| DISPLAY_TEXT  | Unit attribution |
| CONFIRMED_BY       | ACTIVE_USERS | FULL_NAME     | GAS set  |
| RELATED_ENTITY_ID  | Polymorphic  | Varies        | By type  |

---

## FINANCE_ATTACHMENT

| Column     | Ref Table           | Display    |
|------------|---------------------|------------|
| FINANCE_ID | FINANCE_TRANSACTION | TRANS_CODE |

---

## FINANCE_LOG

| Column   | Ref Table           | Display    | Notes    |
|----------|---------------------|------------|----------|
| FIN_ID   | FINANCE_TRANSACTION | TRANS_CODE |          |
| ACTOR_ID | —                  | getUserDisplay or raw | USER_DIRECTORY.ID or email fallback; no Ref slice |

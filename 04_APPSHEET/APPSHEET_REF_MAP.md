# AppSheet Reference Map

**Enforcement:** All identity refs use Ref + slice; display DISPLAY_NAME or FULL_NAME. See APPSHEET_REF_MAP.csv for full mapping.

## USER_DIRECTORY
- Operational users only. Slice ACTIVE_USERS: STATUS=ACTIVE, IS_DELETED=FALSE
- Display: FULL_NAME (or USER_DISPLAY virtual: IF(ISNOTBLANK([DISPLAY_NAME]), [DISPLAY_NAME], [FULL_NAME]))

## HO_SO_MASTER
| Column   | Ref Target   | Display | Notes                    |
|----------|--------------|---------|--------------------------|
| HTX_ID   | ACTIVE_HTX   | NAME    | Slice of HO_SO_MASTER    |
| OWNER_ID | ACTIVE_USERS | FULL_NAME | USER_DIRECTORY; store ID |

## HO_SO_FILE
| Column   | Ref Table    | Display |
|----------|--------------|---------|
| HO_SO_ID | HO_SO_MASTER | NAME    |

## HO_SO_RELATION
| Column        | Ref Table    | Display |
|---------------|--------------|---------|
| FROM_HO_SO_ID | HO_SO_MASTER | NAME    |
| TO_HO_SO_ID   | HO_SO_MASTER | NAME    |

## TASK_MAIN
| Column             | Ref Target   | Display       | Notes                    |
|--------------------|--------------|---------------|--------------------------|
| OWNER_ID           | ACTIVE_USERS | FULL_NAME  | Store USER_DIRECTORY.ID   |
| REPORTER_ID        | ACTIVE_USERS | FULL_NAME  | Default from USEREMAIL() |
| RELATED_ENTITY_ID  | Polymorphic  | Varies        | By RELATED_ENTITY_TYPE   |

## TASK_CHECKLIST
| Column  | Ref Target   | Display       | Notes    |
|---------|--------------|---------------|----------|
| TASK_ID | TASK_MAIN    | TITLE         | IsPartOf |
| DONE_BY | ACTIVE_USERS | FULL_NAME  | GAS set  |

## TASK_UPDATE_LOG
| Column  | Ref Table | Display | Notes    |
|---------|-----------|---------|----------|
| TASK_ID | TASK_MAIN | TITLE   | Readonly |
| ACTOR_ID | — | getUserDisplay or raw | USER_DIRECTORY.ID or email fallback; no Ref slice |

## TASK_ATTACHMENT
| Column  | Ref Table | Display | Notes    |
|---------|-----------|---------|----------|
| TASK_ID | TASK_MAIN | TITLE   | IsPartOf |

## FINANCE_TRANSACTION
| Column             | Ref Target   | Display       | Notes    |
|--------------------|--------------|---------------|----------|
| CONFIRMED_BY       | ACTIVE_USERS | FULL_NAME  | GAS set  |
| RELATED_ENTITY_ID  | Polymorphic  | Varies        | By type  |

## FINANCE_ATTACHMENT
| Column     | Ref Table           | Display    |
|------------|---------------------|------------|
| FINANCE_ID | FINANCE_TRANSACTION | TRANS_CODE |

## FINANCE_LOG
| Column | Ref Table           | Display    | Notes    |
|--------|---------------------|------------|----------|
| FIN_ID | FINANCE_TRANSACTION | TRANS_CODE |          |
| ACTOR_ID | — | getUserDisplay or raw | USER_DIRECTORY.ID or email fallback; no Ref slice |

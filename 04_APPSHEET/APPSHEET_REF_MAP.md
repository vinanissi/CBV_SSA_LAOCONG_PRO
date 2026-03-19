# AppSheet Reference Map

## HO_SO_MASTER
| Column   | Ref Table       | Filter / Notes              |
|----------|-----------------|-----------------------------|
| HTX_ID   | HO_SO_MASTER    | HO_SO_TYPE = "HTX"          |

## HO_SO_FILE
| Column   | Ref Table    |
|----------|--------------|
| HO_SO_ID | HO_SO_MASTER |

## HO_SO_RELATION
| Column        | Ref Table    |
|---------------|--------------|
| FROM_HO_SO_ID | HO_SO_MASTER |
| TO_HO_SO_ID   | HO_SO_MASTER |

## TASK_MAIN
| Column             | Ref Table              | Notes                    |
|--------------------|------------------------|--------------------------|
| RELATED_ENTITY_ID  | Polymorphic            | HO_SO_MASTER, TASK_MAIN, FINANCE_TRANSACTION by RELATED_ENTITY_TYPE |
| OWNER_ID           | User (email)           | Not a table ref          |
| REPORTER_ID        | User (email)           | Not a table ref          |

## TASK_CHECKLIST
| Column  | Ref Table |
|---------|-----------|
| TASK_ID | TASK_MAIN |

## TASK_UPDATE_LOG
| Column  | Ref Table |
|---------|-----------|
| TASK_ID | TASK_MAIN |

## TASK_ATTACHMENT
| Column  | Ref Table |
|---------|-----------|
| TASK_ID | TASK_MAIN |

## FINANCE_TRANSACTION
| Column             | Ref Table              | Notes                    |
|--------------------|------------------------|--------------------------|
| RELATED_ENTITY_ID  | Polymorphic            | HO_SO_MASTER, TASK_MAIN by RELATED_ENTITY_TYPE |
| CREATED_BY         | User (email)           | Not a table ref          |
| CONFIRMED_BY       | User (email)           | Not a table ref          |

## FINANCE_ATTACHMENT
| Column     | Ref Table           |
|------------|---------------------|
| FINANCE_ID | FINANCE_TRANSACTION |

## FINANCE_LOG
| Column | Ref Table           |
|--------|---------------------|
| FIN_ID | FINANCE_TRANSACTION |

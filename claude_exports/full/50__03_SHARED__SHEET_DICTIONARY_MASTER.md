# SHEET DICTIONARY MASTER

## USER_DIRECTORY
- ID: key (UD_YYYYMMDD_xxxxx)
- USER_CODE: text unique
- FULL_NAME: text canonical human name
- DISPLAY_NAME: text optional UI override
- EMAIL: text main login / identity reference
- PHONE: text optional
- ROLE: enum ADMIN | OPERATOR | VIEWER
- POSITION: text optional job title
- HTX_ID: ref HO_SO_MASTER (when user belongs to HTX)
- STATUS: enum ACTIVE | INACTIVE | ARCHIVED
- IS_SYSTEM: yes/no
- ALLOW_LOGIN: yes/no
- NOTE: long text
- CREATED_AT: datetime
- CREATED_BY: text
- UPDATED_AT: datetime
- UPDATED_BY: text
- IS_DELETED: yes/no

## MASTER_CODE
- ID: key
- MASTER_GROUP: text (family: PROVINCE, DISTRICT, etc.)
- CODE: text unique per MASTER_GROUP
- NAME: text full canonical name
- DISPLAY_TEXT: text optional UI override
- SHORT_NAME: text abbreviated label
- PARENT_CODE: text parent for hierarchy
- STATUS: enum ACTIVE | INACTIVE | ARCHIVED
- SORT_ORDER: number
- IS_SYSTEM: yes/no
- ALLOW_EDIT: yes/no
- NOTE: long text
- CREATED_AT: datetime
- CREATED_BY: text
- UPDATED_AT: datetime
- UPDATED_BY: text
- IS_DELETED: yes/no

## HO_SO_MASTER
- ID: key
- HO_SO_TYPE: enum HO_SO_TYPE
- CODE: text unique trong nhóm
- NAME: text
- STATUS: enum HO_SO_STATUS
- HTX_ID: ref HO_SO_MASTER
- OWNER_ID: ref USER_DIRECTORY
- PHONE: phone text
- EMAIL: email text
- ID_NO: text
- ADDRESS: long text
- START_DATE: date
- END_DATE: date
- NOTE: long text
- TAGS: text
- CREATED_AT: datetime
- CREATED_BY: text
- UPDATED_AT: datetime
- UPDATED_BY: text
- IS_DELETED: yes/no

## TASK_MAIN
- ID: key
- TASK_CODE: text unique
- TITLE: text
- DESCRIPTION: long text
- TASK_TYPE: enum TASK_TYPE
- STATUS: enum TASK_STATUS
- PRIORITY: enum PRIORITY
- OWNER_ID: ref USER_DIRECTORY
- REPORTER_ID: ref USER_DIRECTORY
- RELATED_ENTITY_TYPE: text
- RELATED_ENTITY_ID: text
- START_DATE: datetime
- DUE_DATE: datetime
- DONE_AT: datetime
- RESULT_NOTE: long text
- CREATED_AT: datetime
- CREATED_BY: text
- UPDATED_AT: datetime
- UPDATED_BY: text
- IS_DELETED: yes/no

## FINANCE_TRANSACTION
- ID: key
- TRANS_CODE: text unique
- TRANS_DATE: date
- TRANS_TYPE: enum FIN_TRANS_TYPE
- STATUS: enum FIN_STATUS
- CATEGORY: enum FIN_CATEGORY
- AMOUNT: number
- UNIT_ID: text
- COUNTERPARTY: text
- PAYMENT_METHOD: enum PAYMENT_METHOD
- REFERENCE_NO: text
- RELATED_ENTITY_TYPE: text
- RELATED_ENTITY_ID: text
- DESCRIPTION: long text
- EVIDENCE_URL: url
- CONFIRMED_AT: datetime
- CONFIRMED_BY: ref USER_DIRECTORY
- CREATED_AT: datetime
- CREATED_BY: text
- UPDATED_AT: datetime
- UPDATED_BY: text
- IS_DELETED: yes/no

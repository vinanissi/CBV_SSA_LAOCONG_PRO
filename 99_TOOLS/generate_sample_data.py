from __future__ import annotations
import csv
import sys
from pathlib import Path

SAMPLES = {
    'HO_SO_MASTER.csv': [
        ['ID','HO_SO_TYPE','CODE','NAME','STATUS','HTX_ID','OWNER_ID','PHONE','EMAIL','ID_NO','ADDRESS','START_DATE','END_DATE','NOTE','TAGS','CREATED_AT','CREATED_BY','UPDATED_AT','UPDATED_BY','IS_DELETED'],
        ['HTX_20260318_000001','HTX','HTX001','HTX Lao Cong','ACTIVE','','admin@local','','','','','','','Đơn vị mẫu','','2026-03-18 08:00:00','admin@local','2026-03-18 08:00:00','admin@local','FALSE'],
    ],
    'TASK_MAIN.csv': [
        ['ID','TASK_CODE','TITLE','DESCRIPTION','TASK_TYPE','STATUS','PRIORITY','OWNER_ID','REPORTER_ID','RELATED_ENTITY_TYPE','RELATED_ENTITY_ID','START_DATE','DUE_DATE','DONE_AT','RESULT_NOTE','CREATED_AT','CREATED_BY','UPDATED_AT','UPDATED_BY','IS_DELETED'],
        ['TASK_20260318_000001','TK001','Kiểm tra hồ sơ ban đầu','Task mẫu','HO_SO','NEW','HIGH','operator@local','admin@local','HO_SO','HTX_20260318_000001','2026-03-18 08:00:00','2026-03-19 17:00:00','','','2026-03-18 08:00:00','admin@local','2026-03-18 08:00:00','admin@local','FALSE'],
    ],
    'FINANCE_TRANSACTION.csv': [
        ['ID','TRANS_CODE','TRANS_DATE','TRANS_TYPE','STATUS','CATEGORY','AMOUNT','UNIT_ID','COUNTERPARTY','PAYMENT_METHOD','REFERENCE_NO','RELATED_ENTITY_TYPE','RELATED_ENTITY_ID','DESCRIPTION','EVIDENCE_URL','CONFIRMED_AT','CONFIRMED_BY','CREATED_AT','CREATED_BY','UPDATED_AT','UPDATED_BY','IS_DELETED'],
        ['FIN_20260318_000001','TR001','2026-03-18','EXPENSE','NEW','VAN_HANH','500000','HTX001','Nhà cung cấp A','BANK','','HO_SO','HTX_20260318_000001','Chi vận hành mẫu','','','','2026-03-18 08:00:00','admin@local','2026-03-18 08:00:00','admin@local','FALSE'],
    ]
}

def main() -> int:
    out_dir = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else Path('_sample_data')
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, rows in SAMPLES.items():
        with (out_dir / name).open('w', newline='', encoding='utf-8') as f:
            csv.writer(f).writerows(rows)
    print('Sample data exported to', out_dir)
    return 0

if __name__ == '__main__':
    raise SystemExit(main())

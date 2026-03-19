#!/usr/bin/env python3
"""Generate APPSHEET_FIELD_POLICY_MAP.csv and .json from policy rules.
Run from repo root: python 99_TOOLS/generate_field_policy_map.py
"""
from __future__ import annotations
import json
import csv
from pathlib import Path

PACK_ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = PACK_ROOT / "04_APPSHEET"

# Policy map: (table, column) -> policy row
# Defaults: SHOW=ON for visible, OFF for hidden; EDITABLE=OFF for readonly
POLICY = {
    # ENUM_DICTIONARY
    ("ENUM_DICTIONARY", "ID"): ("SYSTEM_KEY", "HIDDEN_READONLY", "OFF", "OFF", "", "", "SYSTEM", "", ""),
    ("ENUM_DICTIONARY", "ENUM_GROUP"): ("ADMIN_CONTROL_FIELD", "VISIBLE_READONLY", "ON", "OFF", "", "FALSE", "BUSINESS", "", ""),
    ("ENUM_DICTIONARY", "ENUM_VALUE"): ("ADMIN_CONTROL_FIELD", "VISIBLE_READONLY", "ON", "OFF", "", "FALSE", "BUSINESS", "", ""),
    ("ENUM_DICTIONARY", "DISPLAY_TEXT"): ("BUSINESS_INPUT", "VISIBLE_CONTROLLED", "ON", "OFF", "", "Via GAS only", "BUSINESS", "", ""),
    ("ENUM_DICTIONARY", "SORT_ORDER"): ("BUSINESS_INPUT", "VISIBLE_CONTROLLED", "ON", "OFF", "", "Via GAS only", "BUSINESS", "", ""),
    ("ENUM_DICTIONARY", "IS_ACTIVE"): ("WORKFLOW_FIELD", "VISIBLE_CONTROLLED", "ON", "OFF", "", "Via GAS only", "ENUM", "", ""),
    ("ENUM_DICTIONARY", "NOTE"): ("BUSINESS_INPUT", "VISIBLE_CONTROLLED", "ON", "OFF", "", "Via GAS only", "BUSINESS", "", ""),
    ("ENUM_DICTIONARY", "CREATED_AT"): ("AUDIT_FIELD", "HIDDEN_READONLY", "OFF", "OFF", "", "FALSE", "AUDIT", "", ""),
    ("ENUM_DICTIONARY", "CREATED_BY"): ("AUDIT_FIELD", "HIDDEN_READONLY", "OFF", "OFF", "", "FALSE", "AUDIT", "", ""),
    ("ENUM_DICTIONARY", "UPDATED_AT"): ("AUDIT_FIELD", "HIDDEN_READONLY", "OFF", "OFF", "", "FALSE", "AUDIT", "", ""),
    ("ENUM_DICTIONARY", "UPDATED_BY"): ("AUDIT_FIELD", "HIDDEN_READONLY", "OFF", "OFF", "", "FALSE", "AUDIT", "", ""),
}

def load_schema():
    with (PACK_ROOT / "06_DATABASE" / "schema_manifest.json").open(encoding="utf-8") as f:
        return json.load(f)

def default_policy(table: str, col: str) -> tuple:
    if col in ("ID", "CREATED_AT", "CREATED_BY", "UPDATED_AT", "UPDATED_BY"):
        return ("AUDIT_FIELD" if col != "ID" else "SYSTEM_KEY", "HIDDEN_READONLY", "OFF", "OFF", "", "FALSE", "AUDIT" if col != "ID" else "SYSTEM", "", "")
    if col == "IS_DELETED":
        return ("SYSTEM_INTERNAL", "HIDDEN_READONLY", "OFF", "OFF", "", "FALSE", "SYSTEM", "", "")
    if col in ("BEFORE_JSON", "AFTER_JSON"):
        return ("INTERNAL_LOG_FIELD", "HIDDEN_READONLY", "OFF", "OFF", "", "FALSE", "AUDIT", "", "")
    if col in ("CONFIRMED_AT", "CONFIRMED_BY"):
        return ("AUDIT_FIELD", "HIDDEN_READONLY", "OFF", "OFF", "", "FALSE", "AUDIT", "", "")
    return ("BUSINESS_INPUT", "VISIBLE_EDITABLE", "ON", "ON", "", "TRUE", "BUSINESS", "", "")

def build_full_policy():
    schema = load_schema()
    enum_cols = ["ID", "ENUM_GROUP", "ENUM_VALUE", "DISPLAY_TEXT", "SORT_ORDER", "IS_ACTIVE", "NOTE", "CREATED_AT", "CREATED_BY", "UPDATED_AT", "UPDATED_BY"]
    rows = []
    for table, cols in schema.items():
        for col in cols:
            key = (table, col)
            if key in POLICY:
                r = POLICY[key]
            elif table == "ENUM_DICTIONARY":
                r = default_policy(table, col)
            else:
                r = default_policy(table, col)
            rows.append({
                "TABLE_NAME": table,
                "COLUMN_NAME": col,
                "FIELD_ROLE": r[0],
                "POLICY_TYPE": r[1],
                "SHOW_DEFAULT": r[2],
                "EDITABLE_DEFAULT": r[3],
                "SHOW_IF_EXPRESSION": r[4],
                "EDITABLE_IF_EXPRESSION": r[5],
                "DATA_SOURCE_TYPE": r[6],
                "RISK_NOTE": r[7],
                "APPSHEET_NOTE": r[8],
            })
    if "ENUM_DICTIONARY" not in schema:
        for col in enum_cols:
            key = ("ENUM_DICTIONARY", col)
            r = POLICY.get(key, default_policy("ENUM_DICTIONARY", col))
            rows.append({
                "TABLE_NAME": "ENUM_DICTIONARY",
                "COLUMN_NAME": col,
                "FIELD_ROLE": r[0],
                "POLICY_TYPE": r[1],
                "SHOW_DEFAULT": r[2],
                "EDITABLE_DEFAULT": r[3],
                "SHOW_IF_EXPRESSION": r[4],
                "EDITABLE_IF_EXPRESSION": r[5],
                "DATA_SOURCE_TYPE": r[6],
                "RISK_NOTE": r[7],
                "APPSHEET_NOTE": r[8],
            })
    return rows

def main():
    rows = build_full_policy()
    headers = list(rows[0].keys()) if rows else []
    csv_path = OUT_DIR / "APPSHEET_FIELD_POLICY_MAP.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=headers)
        w.writeheader()
        w.writerows(rows)
    print("Wrote", csv_path)
    json_path = OUT_DIR / "APPSHEET_FIELD_POLICY_MAP.json"
    with json_path.open("w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)
    print("Wrote", json_path)

if __name__ == "__main__":
    main()

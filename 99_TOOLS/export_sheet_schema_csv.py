from __future__ import annotations
import json
import csv
import sys
from pathlib import Path

PACK_ROOT = Path(__file__).resolve().parents[1]
MANIFEST = PACK_ROOT / '06_DATABASE' / 'schema_manifest.json'

def main() -> int:
    out_dir = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else (PACK_ROOT / '06_DATABASE' / '_generated_schema')
    out_dir.mkdir(parents=True, exist_ok=True)

    schema = json.loads(MANIFEST.read_text(encoding='utf-8-sig'))
    for sheet_name, headers in schema.items():
        if not isinstance(headers, list):
            continue
        with (out_dir / f'{sheet_name}.csv').open('w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(headers)

    print('Exported schema CSV to:', out_dir)
    return 0

if __name__ == '__main__':
    raise SystemExit(main())

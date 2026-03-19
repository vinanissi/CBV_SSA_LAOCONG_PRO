from __future__ import annotations
import json
import sys
from pathlib import Path

PACK_ROOT = Path(__file__).resolve().parents[1]
RULES = json.loads((PACK_ROOT / '09_AUDIT' / 'audit_rules.json').read_text(encoding='utf-8'))

def main() -> int:
    errors = []

    for name in RULES['required_meta_files']:
        if not (PACK_ROOT / '00_META' / name).exists():
            errors.append(f'Missing meta file: {name}')

    for module_dir in (PACK_ROOT / '02_MODULES').iterdir():
        if module_dir.is_dir():
            for f in RULES['required_module_files']:
                if not (module_dir / f).exists():
                    errors.append(f'Module {module_dir.name} missing {f}')

    for sheet in RULES['required_sheets']:
        if not (PACK_ROOT / '06_DATABASE' / '_generated_schema' / f'{sheet}.csv').exists():
            errors.append(f'Missing schema csv: {sheet}.csv')

    if errors:
        print('AUDIT FAIL')
        for e in errors:
            print('-', e)
        return 1

    print('AUDIT OK')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())

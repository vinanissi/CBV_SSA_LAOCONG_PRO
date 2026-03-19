from __future__ import annotations
import hashlib
import json
from pathlib import Path

PACK_ROOT = Path(__file__).resolve().parents[1]
OUTPUT = PACK_ROOT / 'build_manifest.json'

def sha1_of_file(path: Path) -> str:
    h = hashlib.sha1()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

def main() -> int:
    manifest = []
    for p in sorted(PACK_ROOT.rglob('*')):
      if p.is_file() and p.name != OUTPUT.name:
        manifest.append({
            'path': str(p.relative_to(PACK_ROOT)).replace('\\', '/'),
            'size': p.stat().st_size,
            'sha1': sha1_of_file(p)
        })
    OUTPUT.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding='utf-8')
    print('Manifest written to', OUTPUT)
    return 0

if __name__ == '__main__':
    raise SystemExit(main())

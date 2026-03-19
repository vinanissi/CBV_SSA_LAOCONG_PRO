from __future__ import annotations
import shutil
import sys
from pathlib import Path

PACK_ROOT = Path(__file__).resolve().parents[1]

def copy_tree(src: Path, dst: Path) -> None:
    for item in src.rglob('*'):
        rel = item.relative_to(src)
        target = dst / rel
        if item.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, target)

def main() -> int:
    if len(sys.argv) < 2:
        print('Usage: python generate_cbv_ssa_laocong_pro.py "D:/Workspace/projects/CBV_SSA_LAOCONG_PRO"')
        return 1

    target = Path(sys.argv[1]).expanduser()
    target.mkdir(parents=True, exist_ok=True)

    exclude = {'99_TOOLS', '__pycache__'}
    for child in PACK_ROOT.iterdir():
        if child.name in exclude:
            continue
        dest = target / child.name
        if child.is_dir():
            copy_tree(child, dest)
        else:
            shutil.copy2(child, dest)

    (target / '99_TOOLS').mkdir(exist_ok=True)
    for tool in PACK_ROOT.joinpath('99_TOOLS').glob('*.py'):
        shutil.copy2(tool, target / '99_TOOLS' / tool.name)

    print('=' * 60)
    print('CBV_SSA LAOCONG PRO PACK GENERATED')
    print('TARGET:', target)
    print('DIRS:', len([p for p in target.rglob('*') if p.is_dir()]))
    print('FILES:', len([p for p in target.rglob('*') if p.is_file()]))
    print('=' * 60)
    return 0

if __name__ == '__main__':
    raise SystemExit(main())

# -*- coding: utf-8 -*-
import pathlib

root = pathlib.Path(r"d:/Workspace/projects/CBV_SSA_LAOCONG_PRO")

# --- SERVICE_CONTRACT ---
sc = root / "02_MODULES/FINANCE/SERVICE_CONTRACT.md"
text = sc.read_text(encoding="utf-8")
old_sc = "- category h��p lệ\n\n### Side effects"
new_sc = (
    "- category h��p lệ\n"
    "- Enum group thực tế: `assertValidEnumValue('FINANCE_TYPE', data.TRANS_TYPE)` "
    "(payload field `TRANS_TYPE`). Group `TRANS_TYPE�n tại trong seed — dùng `FINANCE_TYPE`.\n\n"
    "### Side effects"
)
if old_sc not in text:
    raise SystemExit("SERVICE_CONTRACT: pattern not found")
sc.write_text(text.replace(old_sc, new_sc), encoding="utf-8")
print("SERVICE_CONTRACT ok")

# --- ACTION MAP ---
am = root / "04_APPSHEET/APPSHEET_ACTION_MAP_MASTER.md"
a = am.read_text(encoding="utf-8")
old_am = (
    "## FINANCE\n"
    "- ACT_FIN_CONFIRM\n"
    "- ACT_FIN_CANCEL\n"
    "- ACT_FIN_ARCHIVE\n\n"
    "##�c"
)
new_am = """## FINANCE

| Action           | PENDING_ACTION      | Valid STATUS              | GAS Function            | Confirmation |
|------------------|---------------------|---------------------------|-------------------------|--------------|
| ACT_FIN_CONFIRM  | CMD:finConfirm      | NEW                       | confirmTransaction(id)  | ✅           |
| ACT_FIN_CANCEL   | CMD:finCancel       | NEW                       | cancelTransaction(id)   | ✅           |
| ACT_FIN_ARCHIVE  | CMD:finArchive      | CONFIRMED, CANCELLED      | archiveTransaction(id)  | ✅           |

### Quy t��c routing FINANCE (giống TASK_CENTER)
- AppSheet action ghi PENDING_ACTION = "CMD:finConfirm" / "CMD:finCancel" / "CMD:finArchive"
- Bot/webhook condition: LEFT([PENDING_ACTION], 4) = "CMD:"
- GAS strip prefix → route sang confirmTransaction / cancelTransaction / archiveTransaction
- setFinanceStatus KH��NG c�n tại — mọi ch�� gọi c�� phải dùng 3 hàm trên
- createFinanceAttachment KH��NG c�n tại — dùng attachEvidence(id, url)

## Quy t��c"""
if old_am not in a:
    raise SystemExit("ACTION_MAP: pattern not found")
am.write_text(a.replace(old_am, new_am), encoding="utf-8")
print("ACTION_MAP ok")

# --- CHANGELOG fix mojibake ---
cl = root / "CHANGELOG.md"
c = cl.read_text(encoding="utf-8")
c = c.replace("thay b\ufffd\ufffdng", "thay b��ng")
c = c.replace("đ\ufffd\ufffdng bộ�ng bộ")
c = c.replace("b\ufffd\ufffd sung", "b�� sung")
cl.write_text(c, encoding="utf-8")
print("CHANGELOG ok")

print("done")

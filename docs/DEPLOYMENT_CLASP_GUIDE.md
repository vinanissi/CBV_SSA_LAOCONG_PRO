# Hướng dẫn deploy bằng clasp — module CBV

## 1. Cài clasp

```powershell
npm install -g @google/clasp
```

Hoặc dùng `npx clasp` thay cho lệnh global.

## 2. Đăng nhập clasp

```powershell
clasp login
```

Đảm bảo tài khoản Google có quyền chỉnh sửa từng Apps Script project tương ứng.

## 3. Tạo `.clasp.json` từ example

Trong từng thư mục module:

- `apps-script/main-control/`
- `apps-script/hoso/`
- `apps-script/task/`
- `apps-script/finance/`

Chạy (ví dụ main-control):

```powershell
Copy-Item apps-script/main-control/.clasp.json.example apps-script/main-control/.clasp.json
```

Lặp lại cho từng module cần push.

**Lưu ý:** Không commit `scriptId` production nếu policy repo cấm; có thể gitignore `.clasp.json` local và chỉ commit `.example`.

## 4. Điền `scriptId` từng module

1. Mở [script.google.com](https://script.google.com), chọn project.
2. Project Settings → **Script ID**.
3. Dán vào `"scriptId"` trong `.clasp.json` của module đó (thay chuỗi `PASTE_*_HERE`).

## 5. Push từng module

Từ thư gốc repo:

```powershell
./scripts/push-main.ps1
./scripts/push-hoso.ps1
```

Task / finance khi đã có project GAS riêng và đã tạo `.clasp.json`:

```powershell
./scripts/push-task.ps1
./scripts/push-finance.ps1
```

## 6. Không dùng `push-all` nếu chưa setup đủ

`scripts/push-all.ps1` gọi lần lượt cả bốn script. Nếu một module chưa có `.clasp.json` hoặc `scriptId` sai, `clasp push` sẽ lỗi. Chỉ dùng `push-all` khi cả bốn project đã cấu hình xong.

Kiểm tra nhanh:

```powershell
./scripts/check-clasp-projects.ps1
```

## 7. Sau khi push — smoke gợi ý

- **MAIN_CONTROL:** trong editor GAS, chạy các hàm self-test đã có trong project (theo menu / tên đã triển khai), ví dụ hướng: `CBV_CoreV2_selfTest`, `CBV_L6_hardeningSelfTest` (đúng tên trong mã nguồn của bạn).
- **HOSO:** chạy test/menu HOSO V2 theo entry point hiện có (ví dụ menu **HOSO** hoặc runner test trong `120_HO_SO_V2_TESTS.js`).

## Monolith hiện tại

Deploy production hiện có thể vẫn dùng `.clasp.json` ở root với `rootDir`: `05_GAS_RUNTIME`. Tách module là **bổ sung** song song; chuyển hẳn sang multi-project sau khi xác minh theo `MIGRATION_PLAN_05_GAS_RUNTIME_TO_MODULES.md`.

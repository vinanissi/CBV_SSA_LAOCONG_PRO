/** Vietnamese operational copy — runtime feedback layer (GS_10A). */

export const FEEDBACK_COPY = {
  pending: {
    generic: 'Đang xử lý lệnh...',
    loading: 'Đang tải dữ liệu...',
    updating: 'Đang cập nhật...',
    accept: 'Đang nhận việc...',
    complete: 'Đang hoàn tất...',
    search: 'Đang tìm kiếm...',
    alert: 'Đang tải cảnh báo vận hành…',
  },
  success: {
    generic: 'Đã cập nhật.',
    accept: 'Đã chuyển sang đang xử lý.',
    complete: 'Đã hoàn thành.',
    command: 'Đã nhận lệnh.',
    localAction: 'Đã ghi nhận thao tác tạm thời trên giao diện.',
  },
  error: {
    generic: 'Lệnh chưa hoàn tất. Vui lòng thử lại.',
    update: 'Không thể cập nhật. Thử lại.',
    accept: 'Không thể nhận việc. Thử lại.',
    complete: 'Không thể hoàn tất. Thử lại.',
    load: 'Không tải được dữ liệu. Kiểm tra kết nối.',
    search: 'Không thể tải kết quả tìm kiếm. Thử lại.',
    network: 'Không kết nối được. Kiểm tra mạng.',
  },
  degraded: {
    alert: 'Không xác minh được cảnh báo vận hành · Dữ liệu có thể chưa đồng bộ',
    runtime: 'Dữ liệu runtime có thể cũ.',
    sync: 'Dữ liệu có thể chưa đồng bộ.',
  },
  disabled: {
    featureLocked: 'Chức năng này chưa mở.',
    noFile: 'Chưa có tệp để mở.',
    fileUnlinked: 'Tệp chưa được liên kết.',
    selectTask: 'Cần chọn một việc trước.',
  },
  hint: {
    searchEmpty: 'Nhập từ khóa để tìm kiếm',
    searchPlaceholder: 'Tìm theo tên, SĐT, biển số, mã việc,...',
  },
  localOnly: {
    callFollow: 'Đã ghi nhận thao tác tạm thời trên giao diện — chưa lưu hệ thống.',
  },
} as const;

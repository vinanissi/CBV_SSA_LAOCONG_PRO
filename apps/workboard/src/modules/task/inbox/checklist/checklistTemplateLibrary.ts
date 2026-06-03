/**
 * PHASE_CHECKLIST_07 — static template library (read-model first; no DB).
 */

import type { ChecklistTemplate, ChecklistTemplateItem } from './checklistTemplateTypes';

function item(
  id: string,
  title: string,
  extra?: Partial<ChecklistTemplateItem>,
): ChecklistTemplateItem {
  return {
    id,
    title,
    defaultStatus: extra?.defaultStatus ?? 'todo',
    sortOrder: extra?.sortOrder,
    note: extra?.note ?? null,
    required: extra?.required ?? false,
    tags: extra?.tags ?? [],
  };
}

const SEED_AT = '2026-06-01T00:00:00.000Z';

export const CHECKLIST_TEMPLATE_LIBRARY: ChecklistTemplate[] = [
  {
    id: 'tpl-ho-so-xa-vien',
    name: 'Hồ sơ xã viên',
    description: 'Quy trình thu và kiểm tra hồ sơ xã viên cơ bản.',
    category: 'Hồ sơ xã viên',
    version: '1.0',
    isActive: true,
    createdBy: 'CBV_SEED',
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
    items: [
      item('tpl-hsxv-1', 'Thu CCCD', { required: true }),
      item('tpl-hsxv-2', 'Thu GPLX', { required: true }),
      item('tpl-hsxv-3', 'Kiểm tra số điện thoại'),
      item('tpl-hsxv-4', 'Gửi hợp đồng'),
      item('tpl-hsxv-5', 'Bàn giao hồ sơ'),
    ],
  },
  {
    id: 'tpl-lien-he-khach',
    name: 'Liên hệ khách hàng',
    description: 'Các bước liên hệ và xác nhận với khách.',
    category: 'Liên hệ',
    version: '1.0',
    isActive: true,
    createdBy: 'CBV_SEED',
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
    items: [
      item('tpl-lhk-1', 'Gọi xác nhận lịch hẹn'),
      item('tpl-lhk-2', 'Gửi tin nhắn / Zalo nhắc'),
      item('tpl-lhk-3', 'Ghi nhận phản hồi khách', { note: 'Dùng phản hồi checklist nếu cần chi tiết.' }),
      item('tpl-lhk-4', 'Cập nhật trạng thái liên hệ'),
    ],
  },
  {
    id: 'tpl-kiem-tra-giay-to',
    name: 'Kiểm tra giấy tờ',
    description: 'Rà soát giấy tờ bắt buộc trước khi xử lý.',
    category: 'Giấy tờ',
    version: '1.0',
    isActive: true,
    createdBy: 'CBV_SEED',
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
    items: [
      item('tpl-kgt-1', 'Đối chiếu CCCD / CMND', { required: true }),
      item('tpl-kgt-2', 'Đối chiếu GPLX / bằng lái', { required: true }),
      item('tpl-kgt-3', 'Kiểm tra ảnh và chữ ký'),
      item('tpl-kgt-4', 'Đánh dấu thiếu / cần bổ sung'),
    ],
  },
  {
    id: 'tpl-ban-giao-noi-bo',
    name: 'Bàn giao nội bộ',
    description: 'Bàn giao hồ sơ và tài liệu trong nội bộ.',
    category: 'Nội bộ',
    version: '1.0',
    isActive: true,
    createdBy: 'CBV_SEED',
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
    items: [
      item('tpl-bgnb-1', 'Tổng hợp checklist đã xong'),
      item('tpl-bgnb-2', 'Đính kèm tài liệu bàn giao'),
      item('tpl-bgnb-3', 'Gửi handoff cho người nhận'),
      item('tpl-bgnb-4', 'Xác nhận đã nhận', { defaultStatus: 'todo' }),
    ],
  },
  {
    id: 'tpl-inactive-demo',
    name: 'Mẫu ngừng dùng (demo)',
    description: 'Không hiển thị cho operator.',
    category: 'Demo',
    version: '0.1',
    isActive: false,
    items: [item('tpl-in-1', 'Bước demo')],
  },
];

export function listActiveChecklistTemplates(): ChecklistTemplate[] {
  return CHECKLIST_TEMPLATE_LIBRARY.filter((t) => t.isActive !== false).map((t) => ({
    ...t,
    items: Array.isArray(t.items) ? t.items : [],
  }));
}

export function getChecklistTemplateById(templateId: string): ChecklistTemplate | null {
  const id = templateId?.trim();
  if (!id) return null;
  const found = CHECKLIST_TEMPLATE_LIBRARY.find((t) => t.id === id);
  if (!found || found.isActive === false) return null;
  return { ...found, items: Array.isArray(found.items) ? found.items : [] };
}

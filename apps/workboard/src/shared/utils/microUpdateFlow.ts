import type { QuickActionId } from './quickActionRuntime';

export interface MicroUpdateOption {
  id: string;
  label: string;
  note: string;
  resultCode?: string;
}

const CALL_RESULTS: MicroUpdateOption[] = [
  { id: 'contacted', label: 'Đã liên hệ', note: 'Gọi khách — đã liên hệ', resultCode: 'CONTACTED' },
  { id: 'no_answer', label: 'Không nghe máy', note: 'Gọi khách — không nghe máy', resultCode: 'NO_ANSWER' },
  { id: 'callback', label: 'Hẹn gọi lại', note: 'Gọi khách — hẹn gọi lại', resultCode: 'CALLBACK' },
  { id: 'missing_doc', label: 'Thiếu hồ sơ', note: 'Gọi khách — thiếu hồ sơ', resultCode: 'MISSING_DOC' },
  { id: 'follow_up', label: 'Cần follow-up', note: 'Gọi khách — cần follow-up', resultCode: 'FOLLOW_UP' },
];

const FOLLOW_RESULTS: MicroUpdateOption[] = [
  { id: 'done', label: 'Đã xử lý', note: 'Follow-up — đã xử lý', resultCode: 'DONE' },
  { id: 'waiting', label: 'Chờ phản hồi', note: 'Follow-up — chờ phản hồi', resultCode: 'WAITING' },
  { id: 'escalate', label: 'Cần escalate', note: 'Follow-up — cần escalate', resultCode: 'ESCALATE' },
];

const CONFIRM_RESULTS: MicroUpdateOption[] = [
  { id: 'confirmed', label: 'Đã xác nhận', note: 'Xác nhận — hoàn tất bước', resultCode: 'CONFIRMED' },
  { id: 'pending', label: 'Chưa xong', note: 'Xác nhận — chưa xong', resultCode: 'PENDING' },
];

const COMPLETE_RESULTS: MicroUpdateOption[] = [
  { id: 'done', label: '✔ Hoàn tất', note: '[INLINE_ACTION] COMPLETE', resultCode: 'DONE' },
  { id: 'not_done', label: '↺ Chưa xong', note: '', resultCode: 'NOT_DONE' },
];

export function getMicroUpdateOptions(actionId: QuickActionId | string): MicroUpdateOption[] {
  switch (actionId) {
    case 'CALL':
    case 'CALL_CUSTOMER':
      return CALL_RESULTS;
    case 'FOLLOW':
    case 'FOLLOW_UP':
      return FOLLOW_RESULTS;
    case 'CONFIRM':
    case 'UPDATE_PROGRESS':
      return CONFIRM_RESULTS;
    case 'COMPLETE':
      return COMPLETE_RESULTS;
    default:
      return [];
  }
}

export function formatMicroUpdateNote(action: string, option: MicroUpdateOption): string {
  if (option.resultCode) {
    return `[INLINE_ACTION] ${action} RESULT=${option.resultCode}`;
  }
  return option.note || `[INLINE_ACTION] ${action}`;
}

export function actionNeedsMicroUpdate(actionId: QuickActionId): boolean {
  return ['CALL', 'FOLLOW', 'CONFIRM', 'COMPLETE'].includes(actionId);
}

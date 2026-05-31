import type { WorkInboxAttachmentItem, WorkInboxAttachmentType } from './workInboxAttachmentsTypes';

export function upsertAttachmentItem(
  items: WorkInboxAttachmentItem[],
  item: WorkInboxAttachmentItem,
): WorkInboxAttachmentItem[] {
  const idx = items.findIndex((i) => i.attachmentId === item.attachmentId);
  if (idx < 0) return [item, ...items];
  const next = items.slice();
  next[idx] = item;
  return next;
}

export function removeAttachmentItem(
  items: WorkInboxAttachmentItem[],
  attachmentId: string,
): WorkInboxAttachmentItem[] {
  return items.filter((i) => i.attachmentId !== attachmentId);
}

export function attachmentOpenHref(item: WorkInboxAttachmentItem): string | null {
  if (item.type === 'LINK' && item.url?.trim()) return item.url.trim();
  return null;
}

export function attachmentTypeIcon(type: WorkInboxAttachmentType): string {
  return type === 'LINK' ? '🔗' : '📝';
}

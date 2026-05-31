export type WorkInboxAttachmentType = 'LINK' | 'TEXT';

export interface WorkInboxAttachmentItem {
  attachmentId: string;
  taskId: string;
  type: WorkInboxAttachmentType;
  title: string;
  url?: string;
  textContent?: string;
  createdAt?: string;
  createdBy?: string;
  note?: string;
}

export interface WorkInboxAttachmentForm {
  type: WorkInboxAttachmentType;
  title: string;
  url: string;
  textContent: string;
  note: string;
}

export const DEFAULT_ATTACHMENT_FORM: WorkInboxAttachmentForm = {
  type: 'LINK',
  title: '',
  url: '',
  textContent: '',
  note: '',
};

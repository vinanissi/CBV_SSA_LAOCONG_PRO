/**
 * PHASE_DOSSIER_02 — task-level attach dialog without center preview block.
 */

import type { UserContext } from '@/api/contracts';
import { WorkInboxAddAttachmentDialog } from './WorkInboxAddAttachmentDialog';
import { useWorkInboxAttachmentsRuntime } from './useWorkInboxAttachmentsRuntime';

interface WorkInboxTaskAttachmentDialogHostProps {
  taskId: string;
  operator: UserContext;
  canMutate?: boolean;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
}

export function WorkInboxTaskAttachmentDialogHost({
  taskId,
  operator,
  canMutate = true,
  dialogOpen,
  onDialogOpenChange,
}: WorkInboxTaskAttachmentDialogHostProps) {
  const { mutatingId, canMutate: allowMutate, createAttachment, pasteFromClipboard } =
    useWorkInboxAttachmentsRuntime({ taskId, operator, canMutate });

  if (!dialogOpen) return null;

  return (
    <WorkInboxAddAttachmentDialog
      open={dialogOpen}
      loading={mutatingId === '__create__'}
      onClose={() => onDialogOpenChange(false)}
      onSubmit={async (form) => {
        const res = await createAttachment(form);
        if (res.ok) onDialogOpenChange(false);
        return res;
      }}
      onPasteClipboard={allowMutate ? pasteFromClipboard : undefined}
    />
  );
}

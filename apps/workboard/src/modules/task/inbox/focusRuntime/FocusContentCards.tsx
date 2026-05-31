import type { UserContext, UserRole } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { WorkInboxChecklistSection } from '@/modules/task/inbox/checklist/WorkInboxChecklistSection';
import { resolveRuntimeUser } from '@/runtime/runtimeIdentity';
import { WorkInboxAttachmentsSection } from '@/modules/task/inbox/attachments/WorkInboxAttachmentsSection';
import { isCompactAiSummary } from './focusAiSummaryDisplay';
import type { WorkInboxOperationalOp } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalPermissions';

interface FocusContentCardsProps {
  item: WorkInboxFocusItem;
  summaryText?: string;
  operator?: UserContext;
  opPermissions?: Record<WorkInboxOperationalOp, boolean>;
  attachDialogOpen?: boolean;
  onAttachDialogOpenChange?: (open: boolean) => void;
}

export function FocusContentCards({
  item,
  summaryText,
  operator,
  opPermissions,
  attachDialogOpen,
  onAttachDialogOpenChange,
}: FocusContentCardsProps) {
  const runtimeUser = resolveRuntimeUser(operator);
  const checklistOperator: UserContext =
    operator ??
    (runtimeUser
      ? {
          userId: runtimeUser.id,
          displayName: runtimeUser.displayName,
          role: (runtimeUser.role as UserRole) ?? 'STAFF',
          permissions: [],
        }
      : { userId: 'OPERATOR', displayName: 'Operator', role: 'STAFF', permissions: [] });

  const aiSummary = summaryText?.trim() || 'Chưa có tóm tắt AI cho việc này.';
  const aiCompact = isCompactAiSummary(aiSummary);

  return (
    <div
      className="work-inbox-focus-content-cards work-inbox-focus-content-cards--stack work-inbox-focus-content-cards--density work-inbox-focus-content-cards--focus-density"
      data-cbv-panel="work-inbox-focus-content-cards"
    >
      {aiCompact ? (
        <p className="work-inbox-ai-summary work-inbox-ai-summary--compact" aria-label="AI Tóm tắt">
          <span className="work-inbox-ai-summary__label">AI tóm tắt:</span>{' '}
          <span className="work-inbox-ai-summary__text">{aiSummary}</span>
        </p>
      ) : (
        <section
          className="work-inbox-focus-card work-inbox-focus-card--summary work-inbox-focus-card--summary-tall"
          aria-label="AI Tóm tắt"
        >
          <h3 className="work-inbox-focus-card__title">AI TÓM TẮT</h3>
          <p className="work-inbox-focus-card__body">{aiSummary}</p>
        </section>
      )}

      <WorkInboxChecklistSection
        taskId={item.id}
        operator={checklistOperator}
        canMutate={opPermissions?.NOTES !== false}
        dense
      />

      <WorkInboxAttachmentsSection
        taskId={item.id}
        operator={checklistOperator}
        canMutate={opPermissions?.DOCUMENT !== false}
        variant="preview"
        dense
        dialogOpen={attachDialogOpen}
        onDialogOpenChange={onAttachDialogOpenChange}
      />
    </div>
  );
}

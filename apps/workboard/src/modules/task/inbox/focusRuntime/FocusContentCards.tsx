import type { UserContext, UserRole } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { WorkInboxChecklistSection } from '@/modules/task/inbox/checklist/WorkInboxChecklistSection';
import { WorkInboxAttachmentsSection } from '@/modules/task/inbox/attachments/WorkInboxAttachmentsSection';
import { WorkInboxTaskAttachmentDialogHost } from '@/modules/task/inbox/attachments/WorkInboxTaskAttachmentDialogHost';
import { isCenterRecentDocumentsVisible } from '@/modules/task/inbox/dossier/dossierCenterLayoutConfig';
import { resolveRuntimeUser } from '@/runtime/runtimeIdentity';
import { taskHeaderShowsAiSummary } from './CompactTaskHeader';
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
  attachDialogOpen = false,
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

  const aiSummary = summaryText?.trim();
  const headerShowsAi = taskHeaderShowsAiSummary(summaryText);
  const showAiInCenter = Boolean(aiSummary) && !headerShowsAi;
  const aiCompact = aiSummary ? isCompactAiSummary(aiSummary) : false;
  const showCenterAttachments = isCenterRecentDocumentsVisible();

  return (
    <div
      className="work-inbox-focus-content-cards work-inbox-focus-content-cards--stack work-inbox-focus-content-cards--density work-inbox-focus-content-cards--focus-density"
      data-cbv-panel="work-inbox-focus-content-cards"
      data-cbv-center-recent-documents={showCenterAttachments ? 'visible' : 'hidden'}
    >
      {showAiInCenter ? (
        aiCompact ? (
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
        )
      ) : null}

      <WorkInboxChecklistSection
        taskId={item.id}
        operator={checklistOperator}
        canMutate={opPermissions?.NOTES !== false}
        dense
      />

      {!showCenterAttachments ? (
        <p className="work-inbox-dossier-layout-hint" role="note">
          Tài liệu, liên kết và phản hồi: xem tab <strong>Hồ sơ</strong> ở cột phải.
        </p>
      ) : (
        <WorkInboxAttachmentsSection
          taskId={item.id}
          operator={checklistOperator}
          canMutate={opPermissions?.DOCUMENT !== false}
          variant="preview"
          dense
          dialogOpen={attachDialogOpen}
          onDialogOpenChange={onAttachDialogOpenChange}
        />
      )}

      {!showCenterAttachments && onAttachDialogOpenChange ? (
        <WorkInboxTaskAttachmentDialogHost
          taskId={item.id}
          operator={checklistOperator}
          canMutate={opPermissions?.DOCUMENT !== false}
          dialogOpen={attachDialogOpen}
          onDialogOpenChange={onAttachDialogOpenChange}
        />
      ) : null}
    </div>
  );
}

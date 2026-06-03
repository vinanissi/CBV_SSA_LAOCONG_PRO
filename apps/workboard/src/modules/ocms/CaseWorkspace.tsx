/**
 * Case Workspace — Case-centric focus surface (CASE_REFACTOR_03).
 * Read-model driven; Task actions/checklist/attachments unchanged underneath.
 */

import { useEffect } from 'react';
import type { UserContext, UserRole } from '@/api/contracts';
import type { WorkInboxFocusItem } from '@/modules/task/types/workInboxTypes';
import { WorkInboxChecklistSection } from '@/modules/task/inbox/checklist/WorkInboxChecklistSection';
import { WorkInboxAttachmentsSection } from '@/modules/task/inbox/attachments/WorkInboxAttachmentsSection';
import { resolveRuntimeUser } from '@/runtime/runtimeIdentity';
import type { WorkInboxOperationalOp } from '@/modules/task/inbox/operationalRuntime/workInboxOperationalPermissions';
import { caseTypeLabel } from './caseLifecycle';
import type { CaseContextStripView } from './caseReadModelTypes';
import type { CaseRuntimeReadModel } from './caseRuntimeReadModelTypes';
import { WorkInboxCaseContextStrip } from './WorkInboxCaseContextStrip';
import {
  attachCaseWorkspaceUatConsoleExport,
  recordCaseWorkspaceImpression,
} from './caseWorkspaceUatTelemetry';
import { CaseWorkspaceUatRecorder } from './CaseWorkspaceUatRecorder';
import { isCompactAiSummary } from '@/modules/task/inbox/focusRuntime/focusAiSummaryDisplay';

export interface CaseWorkspaceProps {
  item: WorkInboxFocusItem;
  runtimeReadModel: CaseRuntimeReadModel | null;
  stripView: CaseContextStripView | null;
  summaryText?: string;
  operator?: UserContext;
  opPermissions?: Record<WorkInboxOperationalOp, boolean>;
  attachDialogOpen?: boolean;
  onAttachDialogOpenChange?: (open: boolean) => void;
  onStripCollapse?: () => void;
  discoveryOutcome?: string;
}

function formatClock(at: string | null): string {
  if (!at?.trim()) return '—';
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return at;
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

export function CaseWorkspace({
  item,
  runtimeReadModel,
  stripView,
  summaryText,
  operator,
  opPermissions,
  attachDialogOpen,
  onAttachDialogOpenChange,
  onStripCollapse,
  discoveryOutcome,
}: CaseWorkspaceProps) {
  const model = runtimeReadModel;
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

  const aiSummary =
    summaryText?.trim() ||
    model?.context.summary?.trim() ||
    'Chưa có tóm tắt AI cho case này.';
  const aiCompact = isCompactAiSummary(aiSummary);

  const responsible =
    model?.responsibility.responsible?.displayName?.trim() ||
    model?.responsibility.responsible?.actorId?.trim() ||
    'Chưa gán phụ trách';

  const warningDiagnostics =
    model?.diagnostics.codes.filter((c) => c.severity === 'WARNING' || c.severity === 'ERROR') ?? [];

  useEffect(() => {
    attachCaseWorkspaceUatConsoleExport();
    recordCaseWorkspaceImpression();
  }, [item.id]);

  return (
    <div
      className="case-workspace"
      data-cbv-panel="case-workspace"
      role="region"
      aria-label="Case Workspace"
    >
      <header className="case-workspace__header" data-cbv-panel="case-workspace-header">
        <p className="case-workspace__eyebrow">Case đang xử lý</p>
        <h2 className="case-workspace__title">{model?.title ?? item.title}</h2>
        <div className="case-workspace__badges">
          {model ? (
            <>
              <span className="case-workspace__badge">{caseTypeLabel(model.caseType)}</span>
              <span className="case-workspace__badge case-workspace__badge--state">
                {model.workflowState.label}
              </span>
              {model.displayKey ? (
                <span className="case-workspace__badge case-workspace__badge--key" title={model.caseKey}>
                  {model.displayKey}
                </span>
              ) : null}
            </>
          ) : null}
        </div>
        <p className="case-workspace__responsible">
          Phụ trách case: <strong>{responsible}</strong>
        </p>
      </header>

      {stripView ? (
        <div className="case-workspace__context" data-cbv-panel="case-workspace-context">
          <WorkInboxCaseContextStrip
            view={stripView}
            discoveryOutcome={discoveryOutcome}
            onCollapse={onStripCollapse}
          />
        </div>
      ) : model ? (
        <p className="case-workspace__context-fallback text-xs text-operational-muted">
          {model.context.discoveryLine ?? model.source}
        </p>
      ) : null}

      {warningDiagnostics.length > 0 ? (
        <ul className="case-workspace__diagnostics" aria-label="Cảnh báo case">
          {warningDiagnostics.map((d) => (
            <li key={d.code}>{d.message}</li>
          ))}
        </ul>
      ) : null}

      <section className="case-workspace__ai" aria-label="AI Tóm tắt case">
        {aiCompact ? (
          <p className="work-inbox-ai-summary work-inbox-ai-summary--compact">
            <span className="work-inbox-ai-summary__label">AI tóm tắt (case):</span>{' '}
            <span className="work-inbox-ai-summary__text">{aiSummary}</span>
          </p>
        ) : (
          <>
            <h3 className="case-workspace__section-title">AI TÓM TẮT</h3>
            <p className="case-workspace__section-body">{aiSummary}</p>
          </>
        )}
      </section>

      <div className="case-workspace__grid">
        <div className="case-workspace__column">
          <section className="case-workspace__section" aria-labelledby="case-ws-checklist">
            <h3 id="case-ws-checklist" className="case-workspace__section-title">
              Checklist (Case)
            </h3>
            <WorkInboxChecklistSection
              taskId={item.id}
              operator={checklistOperator}
              canMutate={opPermissions?.NOTES !== false}
              dense
            />
          </section>

          <section className="case-workspace__section" aria-labelledby="case-ws-tasks">
            <h3 id="case-ws-tasks" className="case-workspace__section-title">
              Công việc trong Case
            </h3>
            {model?.tasks.length ? (
              <ul className="case-workspace__task-list">
                {model.tasks.map((t) => (
                  <li
                    key={t.taskId}
                    className={
                      t.isFocusTask
                        ? 'case-workspace__task-item case-workspace__task-item--current'
                        : 'case-workspace__task-item'
                    }
                  >
                    <span className="case-workspace__task-title">{t.title}</span>
                    <span className="case-workspace__task-meta">
                      {t.status}
                      {t.owner ? ` · ${t.owner}` : ''}
                      {t.dueDate ? ` · hạn ${t.dueDate}` : ''}
                    </span>
                    {t.isFocusTask ? (
                      <span className="case-workspace__task-current">Đang thực hiện</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="case-workspace__empty">Chưa có công việc trong case.</p>
            )}
            {model?.diagnostics.codes.some((c) => c.code === 'MULTI_TASK_GROUPING_DEFERRED') ? (
              <p className="case-workspace__hint text-xs text-operational-muted">
                Hiện chỉ hiển thị công việc đang focus — nhóm nhiều việc/case sẽ có ở phase sau.
              </p>
            ) : null}
          </section>
        </div>

        <div className="case-workspace__column">
          <section className="case-workspace__section" aria-labelledby="case-ws-docs">
            <h3 id="case-ws-docs" className="case-workspace__section-title">
              Tài liệu (Case)
            </h3>
            {model?.documents.length ? (
              <ul className="case-workspace__doc-list">
                {model.documents.map((d) => (
                  <li key={d.documentId}>
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noreferrer" className="case-workspace__doc-link">
                        {d.title}
                      </a>
                    ) : (
                      <span>{d.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="case-workspace__empty text-xs">Chưa có tài liệu trong read model.</p>
            )}
            <WorkInboxAttachmentsSection
              taskId={item.id}
              operator={checklistOperator}
              canMutate={opPermissions?.DOCUMENT !== false}
              variant="preview"
              dense
              dialogOpen={attachDialogOpen}
              onDialogOpenChange={onAttachDialogOpenChange}
            />
          </section>

          <section className="case-workspace__section" aria-labelledby="case-ws-timeline">
            <h3 id="case-ws-timeline" className="case-workspace__section-title">
              Timeline (Case)
            </h3>
            {model?.timeline.length ? (
              <ul className="case-workspace__timeline-list">
                {model.timeline.slice(0, 6).map((e) => (
                  <li key={e.entryId} className="case-workspace__timeline-item">
                    <span className="case-workspace__timeline-time">{formatClock(e.at)}</span>
                    <span className="case-workspace__timeline-label">
                      {e.label}
                      {e.entryType === 'COMMENT' ? ' · Ghi chú' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="case-workspace__empty">Chưa có timeline.</p>
            )}
            <p className="case-workspace__hint text-xs text-operational-muted">
              Timeline đầy đủ → tab Timeline ở panel phải.
            </p>
          </section>

          <section className="case-workspace__section" aria-labelledby="case-ws-handoff">
            <h3 id="case-ws-handoff" className="case-workspace__section-title">
              Handoff (Case)
            </h3>
            {model?.handoff ? (
              <div className="case-workspace__handoff">
                {model.handoff.currentState ? (
                  <p>
                    <strong>Trạng thái:</strong> {model.handoff.currentState}
                  </p>
                ) : null}
                {model.handoff.responsiblePerson ? (
                  <p>
                    <strong>Người nhận:</strong> {model.handoff.responsiblePerson}
                  </p>
                ) : null}
                {model.handoff.nextAction ? (
                  <p>
                    <strong>Ghi chú:</strong> {model.handoff.nextAction}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="case-workspace__empty">Chưa có bàn giao case.</p>
            )}
            <p className="case-workspace__hint text-xs text-operational-muted">
              Chi tiết handoff → tab Handoff ở panel phải.
            </p>
          </section>
        </div>
      </div>

      <CaseWorkspaceUatRecorder />
    </div>
  );
}

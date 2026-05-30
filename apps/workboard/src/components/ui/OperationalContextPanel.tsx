import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import type { TaskDetail } from '@/api/contracts';
import { useRenderCount } from '@/shared/utils/renderPerf';
import { TimelineList } from '@/components/ui/TimelineList';
import { FileList } from '@/components/ui/FileList';
import { TaskUpdateForm } from '@/modules/task/TaskUpdateForm';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { NextStepCompletionPrompt } from '@/components/ui/NextStepCompletionPrompt';
import { HandoffChain } from '@/components/ui/HandoffChain';
import { getAttentionLevel, getAttentionStyle } from '@/shared/utils/taskAttention';
import { getTaskNextAction } from '@/shared/utils/taskNextAction';
import { getFilteredCriticalSignal } from '@/shared/utils/taskSignalFiltering';
import { getExpandedSignalDetail } from '@/shared/utils/signalCollapse';
import { buildPanelExecutionMeta } from '@/shared/utils/informationBalance';
import { getTaskDependencies, getDependencyChipClass } from '@/shared/utils/dependencyRuntime';
import { getWaitingDependency, getWaitingChipClass } from '@/shared/utils/coordinationRuntime';
import { buildHandoffChain } from '@/shared/utils/handoffRuntime';
import { getEscalationSignals, getEscalationChipClass } from '@/shared/utils/escalationRuntime';
import { getInterruptionMessage, needsCompletionPrompt, markActionStarted } from '@/shared/utils/taskContinuation';
import { saveCoordinationMemory, getCoordinationMemory } from '@/shared/utils/coordinationMemory';
import { getStatusLabel } from '@/shared/utils/taskDisplay';
import { InlineQuickActions } from '@/components/ui/InlineQuickActions';
import { MicroUpdateStrip } from '@/components/ui/MicroUpdateStrip';
import { InlineHandoffStrip } from '@/components/ui/InlineHandoffStrip';
import { getTaskExecutionReminder } from '@/shared/utils/executionMemory';
import { getWaitingOwnerDisplay, resolveHandoffLabel } from '@/runtime/userDisplay';
import type { InlineExecHandlers, InlineExecState } from '@/components/ui/TaskGroupSection';
import type { RuntimeFeedback } from '@/shared/utils/runtimeFeedback';
import { RuntimeFeedbackMessage } from '@/components/ui/RuntimeFeedbackMessage';
import { RuntimeInlineStatus } from '@/components/ui/RuntimeInlineStatus';
import { FEEDBACK_COPY } from '@/shared/utils/operatorFeedbackCopy';
import { errorFeedback, successFeedback } from '@/shared/utils/runtimeFeedback';

interface OperationalContextPanelProps {
  detail: TaskDetail | null;
  loading?: boolean;
  error?: string;
  degraded?: boolean;
  onUpdated?: (task: TaskDetail) => void;
  onAccept?: (task: TaskDetail) => void;
  onComplete?: (task: TaskDetail) => void;
  inlineHandlers?: InlineExecHandlers;
  inlineExec?: InlineExecState | null;
  onRefreshWorkspace?: () => void;
  actionFeedback?: RuntimeFeedback;
}

const TIMELINE_DEFAULT = 8;

function slaBadgeClass(sla?: string) {
  if (sla === 'OVERDUE') return 'border-red-300 bg-red-50 text-red-700';
  if (sla === 'AT_RISK') return 'border-amber-300 bg-amber-50 text-amber-800';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

export function OperationalContextPanel({
  detail,
  loading,
  error,
  degraded,
  onUpdated,
  onAccept,
  onComplete,
  inlineHandlers,
  inlineExec,
  actionFeedback,
}: OperationalContextPanelProps) {
  useRenderCount('OperationalContextPanel');
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showCompletion, setShowCompletion] = useState(true);
  const [localActionMsg, setLocalActionMsg] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  useEffect(() => {
    if (detail && !loading) {
      saveCoordinationMemory(detail, detail.timeline);
    }
  }, [detail?.taskId, loading]);

  if (loading) {
    return (
      <div className={`space-y-3 ${degraded ? '' : 'animate-pulse'}`} aria-busy="true">
        <div className="h-6 w-full rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-100" />
      </div>
    );
  }

  if (error && !detail) return <p className="text-sm text-amber-700">{error}</p>;
  if (!detail) {
    return <p className="task-meta-passive text-sm">Chọn việc — coordination context.</p>;
  }

  const nextAction = getTaskNextAction(detail);
  const attentionStyle = getAttentionStyle(getAttentionLevel(detail));
  const criticalSignal = getFilteredCriticalSignal(detail);
  const executionMeta = buildPanelExecutionMeta(detail);
  const signalDetail = getExpandedSignalDetail(detail);
  const dependencies = getTaskDependencies(detail);
  const waiting = getWaitingDependency(detail);
  const handoffChain = buildHandoffChain(detail, detail.timeline);
  const escalations = getEscalationSignals(detail);
  const mem = getCoordinationMemory(detail.taskId);
  const interruptionMsg = getInterruptionMessage(detail);
  const showPrompt = showCompletion && needsCompletionPrompt(detail);
  const execReminder = getTaskExecutionReminder(detail.taskId);
  const timelineLimit = showAllTimeline ? detail.timeline.length : TIMELINE_DEFAULT;

  async function handleCompletionNote(note: string) {
    setShowCompletion(false);
    setCompletionError(null);
    const res = await api.addTaskComment(detail!.taskId, note);
    if (res.ok && res.data?.task) {
      onUpdated?.(res.data.task as TaskDetail);
    } else {
      setCompletionError(res.errors[0] ?? FEEDBACK_COPY.error.update);
      setShowCompletion(true);
    }
  }

  function handleLocalActionStart() {
    if (!detail) return;
    markActionStarted(detail);
    setLocalActionMsg(FEEDBACK_COPY.localOnly.callFollow);
  }

  return (
    <div className="flex flex-col gap-0 pb-16 operational-panel-zone">
      {error && (
        <div className="mb-2 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800">
          {error}
        </div>
      )}

      <div className="detail-panel-sticky-bar sticky top-0 z-20 -mx-1 mb-3 flex flex-wrap gap-1.5 py-2 backdrop-blur-sm">
        {nextAction.type === 'ACCEPT' && onAccept && (
          <button type="button" className="btn-primary !px-2 !py-1 text-xs" onClick={() => onAccept(detail)}>
            {nextAction.label}
          </button>
        )}
        {(nextAction.type === 'CALL_CUSTOMER' || nextAction.type === 'FOLLOW_UP') && (
          <button type="button" className="btn-primary !px-2 !py-1 text-xs" onClick={handleLocalActionStart}>
            {nextAction.label}
          </button>
        )}
        {detail.status !== 'DONE' && onComplete && (
          <button type="button" className="btn-ghost !px-2 !py-1 text-xs" onClick={() => onComplete(detail)}>
            Hoàn tất
          </button>
        )}
        <button type="button" className="btn-ghost !px-2 !py-1 text-xs" onClick={() => setShowUpdateForm((v) => !v)}>
          {showUpdateForm ? 'Ẩn form' : 'Cập nhật'}
        </button>
      </div>

      {localActionMsg && (
        <RuntimeFeedbackMessage
          feedback={successFeedback(localActionMsg, 'local-action')}
          className="mb-2"
          compact
        />
      )}

      <RuntimeInlineStatus feedback={actionFeedback} />

      {completionError && (
        <RuntimeFeedbackMessage feedback={errorFeedback(completionError)} className="mb-2" compact />
      )}

      {interruptionMsg && (
        <div className="mb-2 rounded border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
          ⚠ {interruptionMsg}
        </div>
      )}

      {execReminder && !interruptionMsg && (
        <div className="mb-2 rounded border border-amber-200 bg-amber-50/80 px-2 py-1 text-[10px] text-amber-700">
          ⚠ {execReminder}
        </div>
      )}

      <section className="panel-execution-gravity">
        <p className="panel-zone-label">Làm ngay</p>
        <p className="panel-next-action-primary">{nextAction.label}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {criticalSignal && (
            <span className={`rounded border px-2 py-0.5 text-sm font-medium ${attentionStyle.signal}`}>{criticalSignal}</span>
          )}
          <span className={`rounded border px-2 py-0.5 text-sm font-medium ${slaBadgeClass(detail.slaStatus)}`}>
            SLA: {detail.slaStatus === 'OVERDUE' ? 'Quá hạn' : detail.slaStatus === 'AT_RISK' ? 'Rủi ro' : 'OK'}
          </span>
        </div>
        {executionMeta && <p className="panel-execution-meta mt-1.5">{executionMeta}</p>}
        <div className="mt-2.5">
          {inlineHandlers ? (
            <InlineQuickActions task={detail} visible compact={false} onAction={inlineHandlers.onQuickAction} />
          ) : null}
        </div>
        {inlineExec?.mode === 'micro' && inlineHandlers && (
          <MicroUpdateStrip
            actionId={inlineExec.actionId}
            onSelect={(opt) => inlineHandlers.onMicroUpdate(detail, inlineExec.actionId, opt)}
            onDismiss={() => inlineHandlers.onExecDismiss(detail)}
          />
        )}
        {inlineExec?.mode === 'handoff' && inlineHandlers && (
          <InlineHandoffStrip
            onSelect={(t) => inlineHandlers.onHandoff(detail, t)}
            onDismiss={() => inlineHandlers.onExecDismiss(detail)}
          />
        )}
        {waiting && (
          <div className="mt-2.5 border-t border-blue-200/60 pt-2">
            <span className={`inline-flex ${getWaitingChipClass(waiting.waitingType)}`}>{waiting.waitingLabel}</span>
            <p className="task-meta-passive mt-0.5">
              {waiting.waitingOwner && <>Chờ: {getWaitingOwnerDisplay(waiting.waitingOwner)} · </>}
              {waiting.waitingDurationHours != null && <>Đã {waiting.waitingDurationHours}h</>}
            </p>
          </div>
        )}
      </section>

      {(handoffChain.length > 0 || escalations.length > 0 || dependencies.length > 1) && (
        <section className="panel-coordination-zone">
          {handoffChain.length > 0 && (
            <div className="coordination-section">
              <p className="panel-zone-label">Handoff</p>
              <div className="mt-1">
                <HandoffChain steps={handoffChain} compact />
              </div>
              {mem?.lastHandoff && mem.lastHandoff !== handoffChain.find((s) => s.kind === 'HANDOFF')?.label && (
                <p className="task-meta-passive mt-1">Last: {resolveHandoffLabel(mem.lastHandoff)}</p>
              )}
            </div>
          )}
          {escalations.length > 0 && (
            <div className="coordination-section">
              <p className="panel-zone-label">Escalation</p>
              <ul className="mt-1 space-y-1">
                {escalations.slice(0, 3).map((e, i) => (
                  <li key={i} className={`text-xs ${getEscalationChipClass(e.level)} inline-flex flex-col gap-0.5 px-2 py-1`}>
                    <span>⚠ {e.label}</span>
                    <span className="text-[10px] opacity-80">→ {e.suggestAction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {dependencies.length > 1 && (
            <div className="coordination-section">
              <p className="panel-zone-label">Phụ thuộc</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {dependencies.map((d, i) => (
                  <span key={i} className={getDependencyChipClass(d.kind)}>
                    {d.waiting ? '⏳' : '↗'} {d.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {signalDetail.collapsed.suppressed.length > 0 && (
        <p className="task-meta-passive mb-2">
          Ẩn trên queue: {signalDetail.collapsed.suppressed.map((s) => s.label).filter(Boolean).join(' · ')}
        </p>
      )}

      <section className="panel-reference-zone">
        <h2 className="panel-reference-title line-clamp-2">{detail.title}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={getStatusLabel(detail.status)} />
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h4 className="context-section-title">Timeline</h4>
            {detail.timeline.length > TIMELINE_DEFAULT && (
              <button type="button" className="text-[10px] text-accent hover:underline" onClick={() => setShowAllTimeline((v) => !v)}>
                {showAllTimeline ? 'Thu gọn' : `+${detail.timeline.length - TIMELINE_DEFAULT}`}
              </button>
            )}
          </div>
          <TimelineList items={detail.timeline} compact limit={timelineLimit} highlightCoordination />
        </div>

        {showPrompt && (
          <div className="mt-3">
            <NextStepCompletionPrompt task={detail} onComplete={handleCompletionNote} onDismiss={() => setShowCompletion(false)} />
          </div>
        )}

        {detail.files.length > 0 && (
          <div className="mt-3">
            <h4 className="context-section-title">Tài liệu ({detail.files.length})</h4>
            <FileList files={detail.files} compact />
          </div>
        )}

        {showUpdateForm && (
          <div className="mt-3">
            <TaskUpdateForm task={detail} onUpdated={onUpdated} />
          </div>
        )}
      </section>
    </div>
  );
}

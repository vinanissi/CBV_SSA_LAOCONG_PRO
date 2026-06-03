/**
 * Case Workspace UAT — in-app operator self-report (telemetry flag only).
 * Records to sessionStorage; not production UI.
 */

import { useState } from 'react';
import { isCaseWorkspaceUatTelemetryEnabled } from './ocmsFeature';
import {
  exportCaseWorkspaceUatMetricsJson,
  recordCaseWorkspaceOperatorEvent,
  resetCaseWorkspaceUatMetrics,
} from './caseWorkspaceUatTelemetry';

export function CaseWorkspaceUatRecorder() {
  const [frictionDraft, setFrictionDraft] = useState('');
  const [exportHint, setExportHint] = useState<string | null>(null);

  if (!isCaseWorkspaceUatTelemetryEnabled()) return null;

  const mark = (
    event:
      | 'understanding_yes'
      | 'checklist_used'
      | 'document_access'
      | 'timeline_viewed'
      | 'handoff_viewed',
  ) => {
    recordCaseWorkspaceOperatorEvent(event);
    setExportHint('Đã ghi nhận — cuối phiên chạy __CASE_WORKSPACE_UAT_EXPORT__()');
  };

  const saveFriction = () => {
    const note = frictionDraft.trim();
    if (!note) return;
    recordCaseWorkspaceOperatorEvent('friction', note);
    setFrictionDraft('');
    setExportHint('Đã ghi ma sát — export JSON cuối phiên.');
  };

  const copyExport = async () => {
    const json = exportCaseWorkspaceUatMetricsJson();
    try {
      await navigator.clipboard.writeText(json);
      setExportHint('Đã copy JSON vào clipboard — dán vào Evidence Log.');
    } catch {
      setExportHint('Copy thủ công từ console: __CASE_WORKSPACE_UAT_EXPORT__()');
    }
  };

  return (
    <aside
      className="case-workspace__uat-recorder"
      data-cbv-panel="case-workspace-uat-recorder"
      aria-label="Ghi nhận UAT (staging)"
    >
      <p className="case-workspace__uat-recorder-title">UAT — ghi nhận operator (staging)</p>
      <div className="case-workspace__uat-recorder-actions">
        <button type="button" className="case-workspace__uat-btn" onClick={() => mark('understanding_yes')}>
          Hiểu case
        </button>
        <button type="button" className="case-workspace__uat-btn" onClick={() => mark('checklist_used')}>
          Đã dùng checklist
        </button>
        <button type="button" className="case-workspace__uat-btn" onClick={() => mark('document_access')}>
          Đã xem tài liệu
        </button>
        <button type="button" className="case-workspace__uat-btn" onClick={() => mark('timeline_viewed')}>
          Đã xem timeline
        </button>
        <button type="button" className="case-workspace__uat-btn" onClick={() => mark('handoff_viewed')}>
          Đã xem handoff
        </button>
        <button
          type="button"
          className="case-workspace__uat-btn"
          onClick={() => {
            recordCaseWorkspaceOperatorEvent('action_bar_attempt');
            recordCaseWorkspaceOperatorEvent('action_bar_success');
            setExportHint('Đã ghi action bar OK — chỉ khi thực sự dùng được thanh lệnh.');
          }}
        >
          Action bar OK
        </button>
        <button
          type="button"
          className="case-workspace__uat-btn case-workspace__uat-btn--secondary"
          onClick={() => {
            recordCaseWorkspaceOperatorEvent('operator_confusion');
            setExportHint('Đã ghi confusion — mô tả thêm ở ma sát nếu cần.');
          }}
        >
          Bối rối
        </button>
      </div>
      <div className="case-workspace__uat-recorder-friction">
        <input
          type="text"
          className="case-workspace__uat-input"
          placeholder="Ma sát / khó khăn (ngắn)"
          value={frictionDraft}
          onChange={(e) => setFrictionDraft(e.target.value)}
          maxLength={200}
        />
        <button type="button" className="case-workspace__uat-btn case-workspace__uat-btn--secondary" onClick={saveFriction}>
          Ghi ma sát
        </button>
      </div>
      <div className="case-workspace__uat-recorder-footer">
        <button type="button" className="case-workspace__uat-btn case-workspace__uat-btn--secondary" onClick={copyExport}>
          Copy metrics JSON
        </button>
        <button
          type="button"
          className="case-workspace__uat-btn case-workspace__uat-btn--ghost"
          onClick={() => {
            resetCaseWorkspaceUatMetrics();
            setExportHint('Đã reset counters phiên.');
          }}
        >
          Reset phiên
        </button>
      </div>
      {exportHint ? <p className="case-workspace__uat-hint">{exportHint}</p> : null}
      <p className="case-workspace__uat-hint text-xs">
        Task actions: ghi nhận tự động khi dùng checklist/đính kèm; export cuối phiên vào Evidence Log.
      </p>
    </aside>
  );
}

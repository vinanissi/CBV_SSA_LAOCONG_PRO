import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OperationalAlertSummary } from '@/shared/utils/operationalAlertSummary';

interface OperationalAlertStripProps {
  summary: OperationalAlertSummary;
  loading?: boolean;
  onRetry?: () => void;
}

export function OperationalAlertStrip({ summary, loading, onRetry }: OperationalAlertStripProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="operational-alert-strip operational-alert-strip-loading" aria-busy="true">
        <span className="operational-alert-summary">Đang tải cảnh báo vận hành…</span>
      </div>
    );
  }

  if (summary.degraded) {
    return (
      <div className="operational-alert-strip-wrap">
        <div
          className="operational-alert-strip operational-alert-strip-degraded"
          role="alert"
          aria-live="assertive"
        >
          <span className="operational-alert-summary">{summary.summaryText}</span>
          {onRetry && (
            <button type="button" className="operational-alert-detail-link" onClick={onRetry}>
              Thử lại
            </button>
          )}
        </div>
        {summary.errorDetail && expanded && (
          <p className="operational-alert-degraded-detail">{summary.errorDetail}</p>
        )}
        {summary.errorDetail && (
          <button
            type="button"
            className="operational-alert-degraded-toggle"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Thu gọn' : 'Chi tiết lỗi'}
          </button>
        )}
      </div>
    );
  }

  const riskItems = summary.items.filter((i) => i.severity === 'risk' && i.count > 0);
  const passiveItems = summary.items.filter((i) => i.severity === 'passive');
  const stripClass = summary.allClear
    ? 'operational-alert-strip operational-alert-strip-ok'
    : 'operational-alert-strip operational-alert-strip-risk';

  function toggleExpanded() {
    setExpanded((v) => !v);
  }

  return (
    <div className="operational-alert-strip-wrap">
      <button
        type="button"
        className={stripClass}
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-label="Cảnh báo vận hành"
      >
        <span className="operational-alert-summary">{summary.summaryText}</span>
        <span className="operational-alert-detail-link">{expanded ? 'Thu gọn' : 'Chi tiết'}</span>
      </button>

      {expanded && (
        <ul className="operational-alert-detail-list" role="list">
          {riskItems.map((item) => (
            <li key={item.code}>
              <button
                type="button"
                className="operational-alert-detail-item operational-alert-detail-risk"
                onClick={() => item.href && navigate(item.href)}
              >
                <span aria-hidden>⚠</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
          {passiveItems.map((item) => (
            <li key={item.code}>
              <button
                type="button"
                className="operational-alert-detail-item operational-alert-detail-passive"
                onClick={() => item.href && navigate(item.href)}
                disabled={item.count === 0}
                title={item.count === 0 ? 'Trạng thái thông tin — không phải cảnh báo' : undefined}
              >
                <span aria-hidden>○</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
          {summary.allClear && passiveItems.length === 0 && (
            <li className="operational-alert-detail-item operational-alert-detail-passive">
              Không có mục chi tiết
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

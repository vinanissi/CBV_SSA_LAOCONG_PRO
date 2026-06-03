import { useEffect, type ReactNode } from 'react';
import type { CaseContextStripView } from './caseReadModelTypes';
import { isOcmsUatTelemetryEnabled } from './ocmsFeature';
import { attachOcmsUatConsoleExport, recordRelationLinkClick, recordStripCollapseClick, recordStripImpression } from './ocmsStripUatTelemetry';

interface WorkInboxCaseContextStripProps {
  view: CaseContextStripView;
  discoveryOutcome?: string;
  onCollapse?: () => void;
}

function ContextPill({
  icon,
  children,
  title,
  tone,
}: {
  icon?: string;
  children: ReactNode;
  title?: string;
  tone?: 'ok' | 'warn' | 'neutral';
}) {
  const toneClass =
    tone === 'ok'
      ? 'work-inbox-case-context-strip__pill--ok'
      : tone === 'warn'
        ? 'work-inbox-case-context-strip__pill--warn'
        : '';
  return (
    <span className={`work-inbox-case-context-strip__pill ${toneClass}`.trim()} title={title}>
      {icon ? <span className="work-inbox-case-context-strip__pill-icon" aria-hidden>{icon}</span> : null}
      {children}
    </span>
  );
}

export function WorkInboxCaseContextStrip({ view, discoveryOutcome, onCollapse }: WorkInboxCaseContextStripProps) {
  useEffect(() => {
    attachOcmsUatConsoleExport();
  }, []);

  useEffect(() => {
    if (!isOcmsUatTelemetryEnabled()) return;
    recordStripImpression({
      level: view.level,
      discoveryOutcome,
      warningCount: view.warnings.length,
    });
  }, [view.level, discoveryOutcome, view.warnings.length]);

  if (view.level === 'HIDDEN') return null;

  const handleCollapse = () => {
    if (isOcmsUatTelemetryEnabled()) recordStripCollapseClick();
    onCollapse?.();
  };

  const handleRelationClick = () => {
    if (isOcmsUatTelemetryEnabled()) recordRelationLinkClick();
  };

  const isMinimal = view.level === 'MINIMAL';
  const isExpanded = view.level === 'EXPANDED';
  const diagnosticsOk = view.diagnosticsStatus === 'OK';
  const diagnosticsWarn = view.diagnosticsStatus && !diagnosticsOk;

  const title = view.caseTitle ?? view.titleLine;

  return (
    <section
      className={`work-inbox-case-context-strip work-inbox-case-context-strip--${view.level.toLowerCase()}`}
      data-cbv-panel="work-inbox-case-context-strip"
      data-ocms-visibility={view.visibilityLabel ?? view.level}
      role="region"
      aria-label="Ngữ cảnh case"
    >
      <div className="work-inbox-case-context-strip__header">
        <span className="work-inbox-case-context-strip__section-label">CASE</span>
        <div className="work-inbox-case-context-strip__row">
          <span className="work-inbox-case-context-strip__chip work-inbox-case-context-strip__chip--type">
            {view.caseTypeLabel}
          </span>
          <span className="work-inbox-case-context-strip__chip work-inbox-case-context-strip__chip--lifecycle">
            {view.lifecycleLabel}
          </span>
          {view.resultLabel ? (
            <span className="work-inbox-case-context-strip__chip">{view.resultLabel}</span>
          ) : null}
        </div>
      </div>

      {!isMinimal && title ? <p className="work-inbox-case-context-strip__title">{title}</p> : null}

      {!isMinimal ? (
        <div className="work-inbox-case-context-strip__context-line">
          {view.responsibleDisplay ? (
            <ContextPill icon="👤" title="Phụ trách">
              {view.responsibleDisplay}
            </ContextPill>
          ) : null}

          {view.relationsActionLabel ? (
            <ContextPill icon="🔗" title="Liên quan">
              {view.relationsActionLabel}
            </ContextPill>
          ) : null}

          {view.discoverySourceLabel ? (
            <ContextPill icon="📍" title={view.discoverySourceCode ?? view.discoveryLine}>
              {view.discoverySourceLabel}
            </ContextPill>
          ) : null}

          {diagnosticsOk ? (
            <ContextPill icon="✓" tone="ok" title="Diagnostics OK">
              OK
            </ContextPill>
          ) : null}

          {diagnosticsWarn ? (
            <ContextPill icon="⚠" tone="warn" title="Diagnostics">
              {view.diagnosticsStatus}
            </ContextPill>
          ) : null}
        </div>
      ) : null}

      {isMinimal && diagnosticsWarn ? (
        <p className="work-inbox-case-context-strip__warning" aria-live="polite">
          ⚠ {view.diagnosticsStatus}
        </p>
      ) : null}

      {isMinimal
        ? view.warnings.map((warning) => (
            <p key={warning} className="work-inbox-case-context-strip__warning" aria-live="polite">
              ⚠ {warning}
            </p>
          ))
        : null}

      {isExpanded && view.safeKeyLabel ? (
        <p className="work-inbox-case-context-strip__key-hint" title={view.discoveryLine}>
          Mã ngữ cảnh: {view.safeKeyLabel}
        </p>
      ) : null}

      {isExpanded && view.primaryRelation ? (
        <p className="work-inbox-case-context-strip__relation">
          {view.primaryRelation.link ? (
            <a
              href={view.primaryRelation.link.href}
              className="work-inbox-case-context-strip__link"
              onClick={handleRelationClick}
            >
              {view.primaryRelation.label}
            </a>
          ) : (
            view.primaryRelation.label
          )}
          {view.targetRelation ? (
            <>
              <span className="work-inbox-case-context-strip__sep" aria-hidden>
                {' '}
                ·{' '}
              </span>
              {view.targetRelation.link ? (
                <a
                  href={view.targetRelation.link.href}
                  className="work-inbox-case-context-strip__link"
                  onClick={handleRelationClick}
                >
                  {view.targetRelation.label}
                </a>
              ) : (
                view.targetRelation.label
              )}
            </>
          ) : null}
        </p>
      ) : null}

      {isExpanded && view.reviewerLabel ? (
        <p className="work-inbox-case-context-strip__meta">{view.reviewerLabel}</p>
      ) : null}

      {isExpanded
        ? view.recentLines.map((line) => (
            <p key={line} className="work-inbox-case-context-strip__recent">
              {line}
            </p>
          ))
        : null}

      {!isMinimal
        ? view.warnings.map((warning) => (
            <p key={warning} className="work-inbox-case-context-strip__warning" aria-live="polite">
              ⚠ {warning}
            </p>
          ))
        : null}

      {isExpanded && !view.collapsed && onCollapse ? (
        <button
          type="button"
          className="work-inbox-case-context-strip__collapse"
          aria-expanded
          onClick={handleCollapse}
        >
          Thu gọn
        </button>
      ) : null}
    </section>
  );
}

import type { CaseContextStripView } from './caseReadModelTypes';

const LEVEL_MAX_HEIGHT: Record<CaseContextStripView['level'], string> = {
  HIDDEN: '0',
  MINIMAL: 'var(--ocms-strip-max-minimal, 2.25rem)',
  STANDARD: 'var(--ocms-strip-max-standard, 4.5rem)',
  EXPANDED: 'var(--ocms-strip-max-expanded, 8rem)',
};

interface WorkInboxCaseContextStripProps {
  view: CaseContextStripView;
  onCollapse?: () => void;
}

export function WorkInboxCaseContextStrip({ view, onCollapse }: WorkInboxCaseContextStripProps) {
  if (view.level === 'HIDDEN') return null;

  return (
    <section
      className={`work-inbox-case-context-strip work-inbox-case-context-strip--${view.level.toLowerCase()}`}
      data-cbv-panel="work-inbox-case-context-strip"
      role="region"
      aria-label="Ngữ cảnh case"
      style={{ maxHeight: LEVEL_MAX_HEIGHT[view.level] }}
    >
      {view.titleLine ? (
        <p className="work-inbox-case-context-strip__title">{view.titleLine}</p>
      ) : null}

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

      {view.primaryRelation ? (
        <p className="work-inbox-case-context-strip__relation">
          {view.primaryRelation.link ? (
            <a href={view.primaryRelation.link.href} className="work-inbox-case-context-strip__link">
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
                <a href={view.targetRelation.link.href} className="work-inbox-case-context-strip__link">
                  {view.targetRelation.label}
                </a>
              ) : (
                view.targetRelation.label
              )}
            </>
          ) : null}
        </p>
      ) : null}

      {view.responsibleLabel ? (
        <p className="work-inbox-case-context-strip__meta">{view.responsibleLabel}</p>
      ) : null}
      {view.reviewerLabel ? (
        <p className="work-inbox-case-context-strip__meta">{view.reviewerLabel}</p>
      ) : null}

      {view.recentLines.map((line) => (
        <p key={line} className="work-inbox-case-context-strip__recent">
          {line}
        </p>
      ))}

      {view.warnings.map((warning) => (
        <p key={warning} className="work-inbox-case-context-strip__warning" aria-live="polite">
          {warning}
        </p>
      ))}

      {view.level === 'EXPANDED' && !view.collapsed && onCollapse ? (
        <button
          type="button"
          className="work-inbox-case-context-strip__collapse"
          aria-expanded
          onClick={onCollapse}
        >
          Thu gọn
        </button>
      ) : null}
    </section>
  );
}

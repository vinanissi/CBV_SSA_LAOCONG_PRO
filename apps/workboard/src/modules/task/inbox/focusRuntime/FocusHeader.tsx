import { WorkInboxJumpToPosition } from '@/modules/task/inbox/search/WorkInboxJumpToPosition';

interface FocusHeaderProps {
  onBackToInbox: () => void;
  progressLabel: string;
  currentPosition?: number;
  queueTotal?: number;
  progressSubLabel?: string;
  progressPercent?: number;
  atStart: boolean;
  atEnd: boolean;
  onPrev: () => void;
  onNext: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
}

export function FocusHeader({
  onBackToInbox,
  progressLabel,
  currentPosition = 0,
  queueTotal = 0,
  progressSubLabel,
  progressPercent,
  atStart,
  atEnd,
  onPrev,
  onNext,
  onNavigatePrev,
  onNavigateNext,
}: FocusHeaderProps) {
  return (
    <header className="work-inbox-focus-header" data-cbv-panel="work-inbox-focus-header">
      <button type="button" className="work-inbox-focus-header__back" onClick={onBackToInbox}>
        ← Quay lại inbox
      </button>
      <div className="work-inbox-focus-header__center">
        <span className="work-inbox-focus-header__center-pill" aria-label="Focus Mode">
          <span className="work-inbox-focus-header__mode" aria-hidden>
            🎯
          </span>
          <span className="work-inbox-focus-header__title">FOCUS MODE</span>
        </span>
      </div>
      <div className="work-inbox-focus-header__pager">
        <WorkInboxJumpToPosition currentPosition={currentPosition} total={queueTotal} />
        <div className="work-inbox-focus-header__progress text-right">
          <span className="work-inbox-focus-header__counter tabular-nums">{progressLabel}</span>
          {progressSubLabel && (
            <span className="block text-[10px] text-operational-muted">{progressSubLabel}</span>
          )}
          {typeof progressPercent === 'number' && (
            <span className="block text-[10px] font-medium text-operational-text">{progressPercent}%</span>
          )}
        </div>
        <button
          type="button"
          className="btn-secondary text-xs"
          disabled={atStart}
          onClick={() => (onNavigatePrev ? onNavigatePrev() : onPrev())}
        >
          ‹ Trước
        </button>
        <button
          type="button"
          className="btn-secondary text-xs"
          disabled={atEnd}
          onClick={() => (onNavigateNext ? onNavigateNext() : onNext())}
        >
          Sau ›
        </button>
      </div>
    </header>
  );
}

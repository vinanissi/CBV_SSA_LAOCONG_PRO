import { useState } from 'react';
import { getWorkInboxSearchBridge } from './workInboxSearchBridgeRegistry';

interface WorkInboxJumpToPositionProps {
  currentPosition: number;
  total: number;
}

export function WorkInboxJumpToPosition({ currentPosition, total }: WorkInboxJumpToPositionProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (total <= 0) return null;

  function handleGo() {
    const bridge = getWorkInboxSearchBridge();
    if (!bridge) {
      setError('Search runtime chưa sẵn sàng');
      return;
    }
    const n = Number.parseInt(value.trim(), 10);
    if (!Number.isFinite(n) || n < 1 || n > total) {
      setError(`Nhập số từ 1 đến ${total}`);
      return;
    }
    const res = bridge.jumpToPosition(n);
    if (!res.ok) {
      setError(res.error ?? 'Không thể nhảy');
      return;
    }
    setError(null);
    setValue('');
  }

  return (
    <div className="work-inbox-jump-to" data-cbv-panel="work-inbox-jump-to-position">
      <span className="work-inbox-jump-to__label tabular-nums">
        {currentPosition} / {total}
      </span>
      <label className="work-inbox-jump-to__field">
        <span className="sr-only">Jump to task number</span>
        <input
          type="number"
          min={1}
          max={total}
          className="work-inbox-jump-to__input"
          placeholder="Jump"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleGo();
          }}
        />
      </label>
      <button type="button" className="btn-secondary text-xs" onClick={handleGo}>
        Go
      </button>
      {error && (
        <span className="work-inbox-jump-to__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

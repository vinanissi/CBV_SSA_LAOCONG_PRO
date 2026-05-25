import { api } from '@/api/client';

export function TopRuntimeStrip() {
  const connected = !api.isMockMode();

  const indicators = [
    { label: 'Kết nối', value: connected ? 'OK' : 'Đang chuẩn bị', ok: connected },
    { label: 'Dữ liệu', value: 'OK', ok: true },
    { label: 'Tài chính', value: 'Chỉ xem', ok: true },
    { label: 'Đồng bộ', value: 'Thủ công', ok: true },
  ];

  return (
    <div className="flex shrink-0 items-center gap-4 border-b border-border/60 bg-surface-raised/80 px-4 py-1.5 text-[11px] text-slate-500">
      {indicators.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${item.ok ? 'bg-status-ok/80' : 'bg-status-warn/80'}`}
            aria-hidden
          />
          <span className="text-slate-500">{item.label}:</span>
          <span className={item.ok ? 'text-slate-400' : 'text-status-warn'}>{item.value}</span>
        </span>
      ))}
    </div>
  );
}

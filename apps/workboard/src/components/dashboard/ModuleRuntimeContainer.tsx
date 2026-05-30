import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '@/api/client';
import type { ModuleRegistryEntry } from '@/api/contracts';
import { LOCAL_MODULE_REGISTRY } from '@/runtime/moduleRegistry';
import { getOperationalContext } from '@/runtime/operationalLinkMemory';

interface ModuleRuntimeContainerProps {
  modules?: ModuleRegistryEntry[];
}

export function ModuleRuntimeContainer({ modules = LOCAL_MODULE_REGISTRY }: ModuleRuntimeContainerProps) {
  const { moduleSlug } = useParams();
  const navigate = useNavigate();
  const [mod, setMod] = useState<ModuleRegistryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ctx = getOperationalContext();

  useEffect(() => {
    const id = moduleSlug?.toUpperCase().replace(/-/g, '_') ?? '';
    api.getModule(id).then((res) => {
      if (res.ok && res.data) {
        setMod(res.data);
        return;
      }
      const local = modules.find((m) => m.moduleId === id);
      if (local) setMod(local);
      else setError('Không tìm thấy mô-đun');
    });
  }, [moduleSlug, modules]);

  if (error) {
    return (
      <div className="panel p-4">
        <p className="text-sm text-amber-200">{error}</p>
        <button type="button" className="btn-ghost mt-2 text-xs" onClick={() => navigate('/')}>
          ← Về bàn điều phối
        </button>
      </div>
    );
  }

  if (!mod) {
    return <div className="panel p-4 animate-pulse text-sm text-slate-500">Đang tải runtime…</div>;
  }

  const embedUrl = mod.primaryUrl || mod.mobileUrl || '';
  const returnPath = ctx?.returnPath ?? '/';

  if (!embedUrl) {
    return (
      <div className="panel p-4">
        <p className="text-sm text-amber-200">Runtime chưa cấu hình URL — thêm biến môi trường.</p>
        <p className="mt-1 text-xs text-slate-500">{mod.notes ?? mod.moduleId}</p>
        <Link to={returnPath} className="btn-ghost mt-3 inline-block text-xs">
          ← Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex flex-wrap items-center gap-2 border-b border-border/50 pb-2">
        <Link to={returnPath} className="btn-ghost !px-2 !py-1 text-xs">
          ← Quay lại
        </Link>
        <span className="text-sm font-medium text-slate-200">
          {mod.icon} {mod.moduleName}
        </span>
        <span className="rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-slate-500">
          {mod.runtimeType}
        </span>
        {ctx?.taskId && (
          <span className="text-[10px] text-slate-500">Task: {ctx.taskId}</span>
        )}
        {ctx?.hoSoId && (
          <span className="text-[10px] text-slate-500">HS: {ctx.hoSoId}</span>
        )}
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[10px] text-accent hover:underline"
        >
          Mở tab mới
        </a>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-border/60 bg-surface-content">
        <iframe
          title={mod.moduleName}
          src={embedUrl}
          className="h-full w-full min-h-[480px] border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}

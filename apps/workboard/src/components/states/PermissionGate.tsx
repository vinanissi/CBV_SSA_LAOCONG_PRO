import type { ReactNode } from 'react';
import { hasPermission } from '@/shared/utils';

interface PermissionGateProps {
  permission: string;
  permissions: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({ permission, permissions, fallback, children }: PermissionGateProps) {
  if (!hasPermission(permissions, permission)) {
    return (
      fallback ?? (
        <div className="rounded-md border border-border bg-surface-overlay px-3 py-2 text-sm text-slate-500">
          Không có quyền
        </div>
      )
    );
  }
  return <>{children}</>;
}

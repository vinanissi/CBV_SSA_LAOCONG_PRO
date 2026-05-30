import { useState } from 'react';
import { api } from '@/api/client';
import { setStoredAuthSession } from '@/auth/sessionStorage';
import type { UserContext } from '@/api/contracts';

interface LoginPageProps {
  onLoggedIn: (user: UserContext) => void;
}

export function LoginPage({ onLoggedIn }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMustChangePassword(false);

    try {
      const res = await api.login(identifier.trim(), password);
      if (!res.ok || !res.data) {
        setError(res.errors[0] ?? 'Đăng nhập thất bại');
        return;
      }

      setStoredAuthSession({
        token: res.data.token,
        userId: res.data.user.userId,
        displayName: res.data.user.displayName,
        role: res.data.user.role,
        mustChangePassword: res.data.mustChangePassword,
        savedAt: new Date().toISOString(),
      });

      if (res.data.mustChangePassword) setMustChangePassword(true);
      onLoggedIn(res.data.user);
    } catch {
      setError('Không kết nối được API — kiểm tra Worker (port 8787) đang chạy');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface-content p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-white">CBV Workboard</h1>
        <p className="mt-1 text-sm text-slate-400">Đăng nhập — USER_DIRECTORY</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Mã / Email / Tên hiển thị</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-slate-100"
              placeholder="DISPLAY_NAME hoặc EMAIL"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-slate-100"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}
          {mustChangePassword && (
            <p className="text-xs text-amber-200">Mật khẩu mặc định — nên đổi sau khi đăng nhập.</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500">
          DEV: mật khẩu mặc định 1234 nếu chưa đặt PASSWORD trên sheet.
        </p>
      </div>
    </div>
  );
}

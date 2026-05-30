import { useState } from 'react';
import { loadThemeMode, toggleThemeMode, type ThemeMode } from '@/runtime/themeRuntime';

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => loadThemeMode());

  function handleToggle() {
    setMode(toggleThemeMode());
  }

  const isDark = mode === 'dark';

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="rounded-md border border-border bg-surface-content px-2.5 py-1.5 text-xs text-operational-secondary hover:bg-surface-overlay hover:text-operational-text"
      title={isDark ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
      aria-label={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
    >
      {isDark ? '☀ Sáng' : '☾ Tối'}
    </button>
  );
}

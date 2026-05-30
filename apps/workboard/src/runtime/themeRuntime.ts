export type ThemeMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'cbv_theme_mode';

export function loadThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyThemeMode(mode: ThemeMode): void {
  const root = document.documentElement;
  root.classList.remove('theme-dark', 'theme-light');
  root.classList.add(mode === 'light' ? 'theme-light' : 'theme-dark');
}

export function setThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore quota / private mode */
  }
  applyThemeMode(mode);
}

export function toggleThemeMode(): ThemeMode {
  const next: ThemeMode = loadThemeMode() === 'dark' ? 'light' : 'dark';
  setThemeMode(next);
  return next;
}

export function initThemeRuntime(): void {
  applyThemeMode(loadThemeMode());
}

import { useState } from 'react';
import { applyTheme, currentTheme } from '../lib/theme';
import type { ThemePreference } from '../lib/storage';

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>(() => currentTheme());

  function toggle() {
    const next: ThemePreference = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

import { loadTheme, saveTheme, type ThemePreference } from './storage';

export function currentTheme(): ThemePreference {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return loadTheme() ?? 'light';
}

export function applyTheme(theme: ThemePreference): void {
  document.documentElement.setAttribute('data-theme', theme);
  saveTheme(theme);
}

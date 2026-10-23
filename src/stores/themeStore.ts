import { create } from 'zustand';

export type Theme = 'cream' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'cream' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'yoyo_theme';

function getSystemTheme(): 'cream' | 'dark' {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'cream';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'cream';
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'cream';
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === 'cream' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
}

function applyThemeToDOM(resolved: 'cream' | 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  if (resolved === 'dark') {
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
  } else {
    root.setAttribute('data-theme', 'cream');
    root.classList.remove('dark');
  }
}

const initialTheme = getInitialTheme();
const initialResolved = initialTheme === 'system' ? getSystemTheme() : initialTheme;
applyThemeToDOM(initialResolved);

export const useThemeStore = create<ThemeState>((set, get) => {
  // Listen for system theme changes if set to 'system'
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', () => {
        if (get().theme === 'system') {
          const newResolved = getSystemTheme();
          applyThemeToDOM(newResolved);
          set({ resolvedTheme: newResolved });
        }
      });
    }
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,

    setTheme: (theme: Theme) => {
      const resolved = theme === 'system' ? getSystemTheme() : theme;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, theme);
      }
      applyThemeToDOM(resolved);
      set({ theme, resolvedTheme: resolved });
    },

    toggleTheme: () => {
      const current = get().resolvedTheme;
      const nextTheme = current === 'dark' ? 'cream' : 'dark';
      get().setTheme(nextTheme);
    },
  };
});

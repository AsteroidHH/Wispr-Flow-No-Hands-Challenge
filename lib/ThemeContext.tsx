'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isLight: boolean;
}

export const THEME_STORAGE_KEY = 'shipspeak_theme';

/**
 * Safe localStorage reader that guards against SSR environments,
 * security exceptions, restricted iframe sandboxes, and Safari private browsing DOMExceptions.
 */
export function safeGetStorage(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Restricted storage environment (e.g. private browsing, disabled cookies)
  }
  return null;
}

/**
 * Safe localStorage writer that gracefully absorbs QuotaExceededError or security exceptions.
 */
export function safeSetStorage(key: string, value: string): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch {
    // Restricted storage environment
  }
  return false;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  isLight: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to 'light' (Stitch Editorial Cockpit) as requested
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = safeGetStorage(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    safeSetStorage(THEME_STORAGE_KEY, theme);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
        if (document.body) {
          document.body.style.backgroundColor = '#0d0e0f';
          document.body.style.color = '#e3e2e3';
        }
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
        if (document.body) {
          document.body.style.backgroundColor = '#FBFBFA';
          document.body.style.color = '#18181B';
        }
      }
    }
  }, [theme, mounted]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isLight: theme === 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

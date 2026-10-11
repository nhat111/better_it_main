import { useEffect } from 'react';
import type { Theme } from '../storage/progress';

const COLORS = { light: '#1f6f8b', dark: '#17212a' };

/** Applies the chosen theme to <html> and the browser toolbar colour. */
export function useApplyTheme(theme: Theme): void {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') delete root.dataset.theme;
    else root.dataset.theme = theme;
    // With an explicit choice, pin both theme-color metas to it; 'auto' restores the media pair.
    const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
    metas.forEach((m) => {
      const media = m.getAttribute('data-media') ?? m.media;
      m.setAttribute('data-media', media);
      if (theme === 'auto') {
        m.media = media;
        m.content = media.includes('dark') ? COLORS.dark : COLORS.light;
      } else {
        m.media = '';
        m.content = COLORS[theme];
      }
    });
  }, [theme]);
}

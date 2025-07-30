import { ThemeConfig } from './interfaces';

function toKebab(s: string) {
  return s.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
}

/**
 * Apply CSS variables and classes for the theme.
 */
export function applyTheme(
  container: HTMLElement,
  theme: 'light' | 'dark' | ThemeConfig | undefined
) {
  // remove any old theme classes
  container.classList.remove('tl-theme-light', 'tl-theme-dark');
  // clear any inline vars
  Array.from(container.style).forEach(name => {
    if (name.startsWith('--tl-')) container.style.removeProperty(name);
  });

  if (!theme) return;

  if (theme === 'light' || theme === 'dark') {
    // just add a class: user can supply CSS for .tl-theme-light, .tl-theme-dark
    container.classList.add(`tl-theme-${theme}`);
  } else {
    // theme is an object: set each prop as --tl-*
    for (const [key, val] of Object.entries(theme)) {
      if (val == null) continue;
      const varName = `--tl-${toKebab(key)}`;
      container.style.setProperty(varName, val);
    }
  }
}

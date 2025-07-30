export * from './core/interfaces';
export { Timeline } from './core/timeline';

const GLOBAL_STYLE_ID = 'chrono-leaf-default-themes';
if (!document.getElementById(GLOBAL_STYLE_ID)) {
  const s = document.createElement('style');
  s.id = GLOBAL_STYLE_ID;
  s.textContent = `
    /* Theme classes just set variables */
    .tl-theme-light { 
      --tl-primary-color: #4285f4;
      --tl-background-color: #fff;
      --tl-font: system-ui, sans-serif;
      --tl-border-radius: 4px;
      --tl-tooltip-bg: rgba(0,0,0,0.7);
      --tl-tooltip-color: #fff;
    }
    .tl-theme-dark {
      --tl-primary-color: #8ab4f8;
      --tl-background-color: #222;
      --tl-font: system-ui, sans-serif;
      --tl-border-radius: 4px;
      --tl-tooltip-bg: rgba(255,255,255,0.85);
      --tl-tooltip-color: #000;
    }

    /* Base container styles */
    .tl-container, .tl-grid {
      background: var(--tl-background-color);
      font-family: var(--tl-font);
      border-radius: var(--tl-border-radius);
      color: inherit;
    }

    /* Tooltip */
    .tl-tooltip {
      background: var(--tl-tooltip-bg);
      color: var(--tl-tooltip-color);
      font-family: var(--tl-font);
    }
  `;
  document.head.appendChild(s);
}

export * from './core/interfaces';
export { Timeline } from './core/timeline';

const GLOBAL_STYLE_ID = 'chrono-leaf-default-themes';
if (typeof document !== 'undefined' && !document.getElementById(GLOBAL_STYLE_ID)) {
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
       --tl-card-bg: rgba(0,0,0,0.04);
       --tl-card-border: rgba(0,0,0,0.15);
       --tl-card-radius: 10px;
       --tl-card-shadow: 0 2px 8px rgba(0,0,0,0.12);
         --tl-overlay-text-color: #fff;
  --tl-overlay-text-opacity: 0.72;
  --tl-overlay-text-weight: 600;
  --tl-overlay-text-shadow: 0 1px 2px rgba(0,0,0,0.35);
       }
       .tl-theme-dark {
        --tl-primary-color: #8ab4f8;
        --tl-background-color: #222;
        --tl-font: system-ui, sans-serif;
        --tl-border-radius: 4px;
        --tl-tooltip-bg: rgba(255,255,255,0.85);
        --tl-tooltip-color: #000;
        --tl-card-bg: rgba(255,255,255,0.06);
        --tl-card-border: rgba(255,255,255,0.18);
        --tl-card-radius: 10px;
        --tl-card-shadow: 0 2px 10px rgba(0,0,0,0.35);
          --tl-overlay-text-color: #fff;
  --tl-overlay-text-opacity: 0.72;
  --tl-overlay-text-weight: 600;
  --tl-overlay-text-shadow: 0 1px 2px rgba(0,0,0,0.35);
      }

     /* Base container styles */
     .tl-container, .tl-grid {
       background: var(--tl-background-color);
       font-family: var(--tl-font);
       border-radius: var(--tl-border-radius);
      color: inherit;
       color: var(--tl-text-color, inherit);
     }
  .tl-container svg foreignObject.tl-label-video {
    overflow: visible;
  }
  .tl-container svg .tl-label-text {
    user-select: none;
  }

     /* Axis & SVG text defaults (renderer reads these vars) */
     .tl-container svg .domain,
     .tl-container svg .tick line {
       stroke: var(--tl-axis-color, var(--tl-primary-color, #4285f4));
     }
     .tl-container svg .tick text {
       fill: var(--tl-tick-color, var(--tl-primary-color, #4285f4));
       font-family: var(--tl-font);
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

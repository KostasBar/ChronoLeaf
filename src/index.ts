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
+      /* new: fine-grained colors with sensible fallbacks */
+      --tl-axis-color: var(--tl-primary-color);
+      --tl-tick-color: var(--tl-primary-color);
+      --tl-text-color: #1f2937; /* slate-800 */
+      --tl-accent-color: var(--tl-primary-color);
     }
     .tl-theme-dark {
       --tl-primary-color: #8ab4f8;
       --tl-background-color: #222;
       --tl-font: system-ui, sans-serif;
       --tl-border-radius: 4px;
       --tl-tooltip-bg: rgba(255,255,255,0.85);
       --tl-tooltip-color: #000;
+      /* new */
+      --tl-axis-color: var(--tl-primary-color);
+      --tl-tick-color: var(--tl-primary-color);
+      --tl-text-color: #e5e7eb; /* gray-200 */
+      --tl-accent-color: var(--tl-primary-color);
     }

     /* Base container styles */
     .tl-container, .tl-grid {
       background: var(--tl-background-color);
       font-family: var(--tl-font);
       border-radius: var(--tl-border-radius);
-      color: inherit;
+      color: var(--tl-text-color, inherit);
     }

+    /* Axis & SVG text defaults (renderer reads these vars) */
+    .tl-container svg .domain,
+    .tl-container svg .tick line {
+      stroke: var(--tl-axis-color, var(--tl-primary-color, #4285f4));
+    }
+    .tl-container svg .tick text {
+      fill: var(--tl-tick-color, var(--tl-primary-color, #4285f4));
+      font-family: var(--tl-font);
+    }
+
     /* Tooltip */
     .tl-tooltip {
       background: var(--tl-tooltip-bg);
       color: var(--tl-tooltip-color);
       font-family: var(--tl-font);
     }
   `;

  document.head.appendChild(s);
}

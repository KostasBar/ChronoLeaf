// src/renderers/GridRenderer.ts
import { ITimeline, TimelineItem, ITimelineConfig } from '../core/interfaces';

export class GridRenderer {
  /** Render events as a responsive, themeable CSS grid of cards. */
  static render(
    timeline: ITimeline,
    container: HTMLElement,
    config: ITimelineConfig
  ): void {
    container.innerHTML = '';

    // inject grid styles once
    const styleId = 'chrono-leaf-grid-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .tl-grid {
          display: grid;
          gap: var(--grid-gap, 16px);
          grid-template-columns: repeat(auto-fit, minmax(var(--grid-item-min, 150px), 1fr));
          padding: var(--grid-padding, 16px);
          background: var(--tl-background-color);
          font-family: var(--tl-font);
          border-radius: var(--tl-border-radius);
        }
        .tl-grid-item {
          position: relative;
          background: var(--card-bg, #fff);
          color: var(--card-color, inherit);
          border-radius: var(--tl-border-radius);
          box-shadow: var(--card-shadow, 0 1px 4px rgba(0,0,0,0.1));
          padding: var(--card-padding, 12px);
          overflow: hidden;
          cursor: pointer;
        }
        .tl-grid-item h4 {
          margin: 0 0 var(--card-title-gap, 4px) 0;
          font-size: var(--card-title-size, 1em);
        }
        .tl-grid-item time {
          display: block;
          font-size: var(--card-date-size, 0.85em);
          color: var(--card-date-color, #555);
        }
        .tl-grid-item p {
          margin-top: var(--card-desc-gap, 8px);
          font-size: var(--card-desc-size, 0.9em);
          color: var(--card-desc-color, #333);
        }
      `;
      document.head.appendChild(style);
    }

    // build the grid wrapper
    const grid = document.createElement('div');
    grid.className = 'tl-grid';

    // create a card for each event
    timeline.items.forEach((item: TimelineItem) => {
      const card = document.createElement('div');
      card.className = 'tl-grid-item';

      // background support
      if (item.background?.type === 'color') {
        card.style.backgroundColor = item.background.source;
      }
      // image / video backgrounds omitted for brevity

      // wire up hooks
      if (config.onItemClick) {
        card.addEventListener('click', e => config.onItemClick!(item, e));
      }
      if (config.onItemHover) {
        card.addEventListener('mouseenter', e => config.onItemHover!(item, e));
      }

      // title
      const title = document.createElement('h4');
      title.textContent = item.title;
      card.appendChild(title);

      // date
      const date = document.createElement('time');
      date.textContent =
        item.start.toLocaleDateString() +
        (item.end ? ` – ${item.end.toLocaleDateString()}` : '');
      card.appendChild(date);

      // description
      if (item.description) {
        const desc = document.createElement('p');
        desc.textContent = item.description;
        card.appendChild(desc);
      }

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }
}

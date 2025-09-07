import { TimelineItem, LabelContent } from '../core/interfaces';

export class TEIParser {
  static parse(teiXml: string): TimelineItem[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(teiXml, 'application/xml');
    const items: TimelineItem[] = [];

    doc.querySelectorAll('listEvent event').forEach(node => {
      const get = (sel: string) => node.querySelector(sel)?.textContent?.trim() || '';

      const whenAttr = node.getAttribute('when')
        || node.querySelector('date')?.getAttribute('when')
        || '';
      const start = whenAttr ? new Date(whenAttr) : new Date(get('date'));

      let label: LabelContent | undefined;
      const labelEl = node.querySelector('label');
      if (labelEl) {
        const kind = (labelEl.getAttribute('kind') || '').toLowerCase();
        if (kind === 'text') {
          label = { kind: 'text', text: labelEl.textContent?.trim() || undefined };
        } else if (kind === 'image') {
          label = { kind: 'image', src: labelEl.getAttribute('src') || '' };
        } else if (kind === 'video') {
          label = { kind: 'video', src: labelEl.getAttribute('src') || '' };
        }
      } else {
        const txt = get('title') || get('desc');
        if (txt) label = { kind: 'text', text: txt };
      }

      items.push({
        title: get('title') || get('desc'),
        start,
        description: get('desc'),
        label,
        metadata: {
          when: whenAttr || undefined,
          type: node.getAttribute('type') || undefined,
        }
      });
    });

    return items;
  }
}

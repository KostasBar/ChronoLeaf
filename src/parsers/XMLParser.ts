import { TimelineItem, LabelContent } from '../core/interfaces';

export class XMLParser {
  static parse(xml: string): TimelineItem[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const items: TimelineItem[] = [];

    doc.querySelectorAll('item').forEach(node => {
      const get = (tag: string) => node.querySelector(tag)?.textContent?.trim() || '';
      const labelEl = node.querySelector('label');
      let label: LabelContent | undefined;

      if (labelEl) {
        const kind = (labelEl.getAttribute('kind') || '').toLowerCase();
        if (kind === 'text') {
          label = { kind: 'text', text: labelEl.textContent?.trim() || undefined };
        } else if (kind === 'image') {
          label = {
            kind: 'image',
            src: labelEl.getAttribute('src') || '',
            width: labelEl.getAttribute('width') ? Number(labelEl.getAttribute('width')) : undefined,
            height: labelEl.getAttribute('height') ? Number(labelEl.getAttribute('height')) : undefined,
            fit: (labelEl.getAttribute('fit') as any) || undefined,
            zoom: labelEl.getAttribute('zoom') ? Number(labelEl.getAttribute('zoom')) : undefined
          };
        } else if (kind === 'video') {
          label = {
            kind: 'video',
            src: labelEl.getAttribute('src') || '',
            width: labelEl.getAttribute('width') ? Number(labelEl.getAttribute('width')) : undefined,
            height: labelEl.getAttribute('height') ? Number(labelEl.getAttribute('height')) : undefined,
            fit: (labelEl.getAttribute('fit') as any) || undefined,
            zoom: labelEl.getAttribute('zoom') ? Number(labelEl.getAttribute('zoom')) : undefined
          };
        }
      }

      const overlayColor = get('overlayColor') || labelEl?.getAttribute('overlayColor') || undefined;

      items.push({
        title: get('title'),
        start: new Date(get('start')),
        end: node.querySelector('end') ? new Date(get('end')) : undefined,
        description: get('description'),
        overlayColor,
        label
      });
    });

    return items;
  }
}

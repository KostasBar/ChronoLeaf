import { TimelineItem } from '../core/interfaces';

export class XMLParser {
  static parse(xml: string): TimelineItem[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const items: TimelineItem[] = [];

    doc.querySelectorAll('item').forEach(node => {
      const get = (tag: string) =>
        node.querySelector(tag)?.textContent || '';

      items.push({
        title: get('title'),
        start: new Date(get('start')),
        end: node.querySelector('end') ? new Date(get('end')) : undefined,
        description: get('description'),
        // προσαρμόζεις selectors για background & metadata αν χρειάζεται
      });
    });

    return items;
  }
}

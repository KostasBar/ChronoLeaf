import { TimelineItem } from '../core/interfaces';

export class TEIParser {
  static parse(teiXml: string): TimelineItem[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(teiXml, 'application/xml');
    const items: TimelineItem[] = [];

    // Παράδειγμα: ψάχνουμε τα <event> μέσα σε <listEvent>
    doc.querySelectorAll('listEvent event').forEach(node => {
      const get = (sel: string) =>
        node.querySelector(sel)?.textContent?.trim() || '';

      items.push({
        title: get('title') || get('desc'),            // π.χ. <title> ή <desc>
        start: new Date(get('date')),                  // π.χ. <date when="YYYY-MM-DD"/>
        end: undefined,                                // αν χρειάζεται, μπορείς να τυπώσεις άλλη ημερομηνία
        description: get('desc'),
        metadata: {
          // Αν το TEI έχει attributes, π.χ. @when
          when: node.getAttribute('when'),
          type: node.getAttribute('type'),
        }
      });
    });

    return items;
  }
}

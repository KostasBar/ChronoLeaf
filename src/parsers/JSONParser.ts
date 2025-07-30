import { TimelineItem } from '../core/interfaces';

export class JSONParser {
  static parse(json: string | object): TimelineItem[] {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    return (obj as any).items.map((i: any) => ({
      title: i.title,
      start: new Date(i.start),
      end: i.end ? new Date(i.end) : undefined,
      description: i.description,
      background: i.background,
      metadata: i.metadata
    }));
  }
}

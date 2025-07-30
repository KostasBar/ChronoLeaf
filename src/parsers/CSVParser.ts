import Papa from 'papaparse';
import { TimelineItem } from '../core/interfaces';

export class CSVParser {
  static parse(csv: string): TimelineItem[] {
    const result = Papa.parse<Record<string, string>>(csv, {
      header: true,
      skipEmptyLines: true
    });

    return result.data.map(row => ({
      title: row.title,
      start: new Date(row.start),
      end: row.end ? new Date(row.end) : undefined,
      description: row.description,
      background: row.backgroundType ? {
        type: row.backgroundType as any,
        source: row.backgroundSource,
        overlayColor: row.overlayColor
      } : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }));
  }
}

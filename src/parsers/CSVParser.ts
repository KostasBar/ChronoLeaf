import Papa from 'papaparse';
import { TimelineItem, LabelContent } from '../core/interfaces';

function toNum(v?: string) { const n = Number(v); return Number.isFinite(n) ? n : undefined; }

export class CSVParser {
  static parse(csv: string): TimelineItem[] {
    const result = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });

    return result.data.map(row => {
      // 1) label από "νέα" columns
      let label: LabelContent | undefined;
      const kind = (row.labelKind ?? '').trim().toLowerCase();
      if (kind === 'text') {
        label = { kind: 'text', text: row.labelText };
      } else if (kind === 'image') {
        label = {
          kind: 'image',
          src: row.labelSrc || '',
          width: toNum(row.labelWidth),
          height: toNum(row.labelHeight),
          fit: (row.labelFit as any) || undefined,
          zoom: toNum(row.labelZoom)
        };
      } else if (kind === 'video') {
        label = {
          kind: 'video',
          src: row.labelSrc || '',
          width: toNum(row.labelWidth),
          height: toNum(row.labelHeight),
          fit: (row.labelFit as any) || undefined,
          zoom: toNum(row.labelZoom)
        };
      }

      // 2) Συμβατότητα με παλιά columns backgroundType/backgroundSource
      if (!label && row.backgroundType) {
        const t = row.backgroundType.trim().toLowerCase();
        if (t === 'image' && row.backgroundSource) {
          label = { kind: 'image', src: row.backgroundSource };
        } else if (t === 'video' && row.backgroundSource) {
          label = { kind: 'video', src: row.backgroundSource };
        } else if (t === 'text') {
          label = { kind: 'text', text: row.description || row.title };
        }
      }

      // 3) metadata parsing
      let metadata: Record<string, any> | undefined;
      if (row.metadata) {
        try { metadata = JSON.parse(row.metadata); } catch {}
      }

      return {
        title: row.title,
        start: new Date(row.start),
        end: row.end ? new Date(row.end) : undefined,
        description: row.description,
        overlayColor: row.overlayColor ?? row.overlayColor ?? undefined,
        label,
        metadata
      };
    });
  }
}

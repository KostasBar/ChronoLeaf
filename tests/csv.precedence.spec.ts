import { describe, it, expect } from 'vitest';
import { CSVParser } from '../src/parsers/CSVParser';

describe('CSVParser – νέο schema έχει προτεραιότητα έναντι legacy', () => {
  it('labelKind/labelSrc υπερισχύει του backgroundType/backgroundSource', () => {
    const csv = [
      'title,start,description,labelKind,labelSrc,labelWidth,backgroundType,backgroundSource,overlayColor,metadata',
      'Row,2020-01-01,Desc,image,https://new/img.jpg,200,image,https://legacy/legacy.jpg,"rgba(0,0,0,0.35)","{""a"":1}"'
    ].join('\n');

    const out = CSVParser.parse(csv);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Row');
    // overlay
    expect(out[0].overlayColor).toBe('rgba(0,0,0,0.35)');
    // label από ΝΕΟ schema (image + src + width)
    const lab: any = out[0].label;
    expect(lab.kind).toBe('image');
    expect(lab.src).toBe('https://new/img.jpg');
    expect(lab.width).toBe(200);
    // metadata parsed
    expect(out[0].metadata?.a).toBe(1);
  });
});

import { describe, it, expect } from 'vitest';
import { JSONParser } from '../src/parsers/JSONParser';
import { XMLParser } from '../src/parsers/XMLParser';
import { CSVParser } from '../src/parsers/CSVParser';
import { TEIParser } from '../src/parsers/TEIParser';

describe('Parsers – edge cases', () => {
  it('JSON: overlayColor top-level έχει προτεραιότητα έναντι background.overlayColor', () => {
    const json = {
      items: [
        {
          title: 'E1',
          start: '2021-01-01',
          overlayColor: 'rgba(0,0,0,0.25)',
          background: {
            type: 'image',
            source: 'https://example.com/i.jpg',
            overlayColor: 'rgba(255,0,0,0.5)'
          },
          label: { kind: 'video', src: 'https://example.com/v.mp4', fit: 'contain', zoom: 1.2 }
        }
      ]
    };
    const out = JSONParser.parse(json);
    expect(out[0].overlayColor).toBe('rgba(0,0,0,0.25)'); // top-level wins
    expect(out[0].label && out[0].label.kind).toBe('video');
    const lab: any = out[0].label;
    expect(lab.fit).toBe('contain');
    expect(lab.zoom).toBe(1.2);
  });

  it('XML: διαβάζει video label attributes (width/height/fit/zoom) και overlayColor', () => {
    const xml = `
      <root>
        <item>
          <title>Video item</title>
          <start>2022-05-01</start>
          <overlayColor>#00000080</overlayColor>
          <label kind="video" src="https://example.com/v.mp4" width="300" height="200" fit="contain" zoom="1.1"/>
        </item>
      </root>`;
    const out = XMLParser.parse(xml);
    expect(out).toHaveLength(1);
    expect(out[0].overlayColor).toBe('#00000080');
    const lab: any = out[0].label;
    expect(lab.kind).toBe('video');
    expect(lab.src).toBe('https://example.com/v.mp4');
    expect(lab.width).toBe(300);
    expect(lab.height).toBe(200);
    expect(lab.fit).toBe('contain');
    expect(lab.zoom).toBe(1.1);
  });

  it('CSV: back-compat backgroundType/backgroundSource → label', () => {
    const csv = [
      'title,start,description,backgroundType,backgroundSource,overlayColor,metadata',
      'Legacy,2020-01-01,Desc,image,https://example.com/i.jpg,"rgba(0,0,0,0.35)",{"a":1}'
    ].join('\n');
    const out = CSVParser.parse(csv);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Legacy');
    expect(out[0].overlayColor).toBe('rgba(0,0,0,0.35)');
    const lab: any = out[0].label;
    expect(lab.kind).toBe('image');
    expect(lab.src).toBe('https://example.com/i.jpg');
    expect(out[0].metadata?.a).toBe(1);
  });

  it('TEI: fallback σε title/desc όταν δεν υπάρχει <label>', () => {
    const tei = `
      <TEI>
        <text>
          <body>
            <listEvent>
              <event when="2023-03-10" type="note">
                <title>TEI Title</title>
                <desc>TEI Description</desc>
              </event>
            </listEvent>
          </body>
        </text>
      </TEI>`;
    const out = TEIParser.parse(tei);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('TEI Title');
    expect(out[0].description).toBe('TEI Description');
    expect(out[0].label && (out[0].label as any).kind).toBe('text');
  });
});

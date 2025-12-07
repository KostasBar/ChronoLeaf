import { describe, expect, it } from "vitest";
import { CSVParser } from "../src/parsers/CSVParser";
import { JSONParser } from "../src/parsers/JSONParser";
import { ParserFactory } from "../src/core/ParserFactory";
import { TEIParser } from "../src/parsers/TEIParser";

describe("CSVParser", () => {
  it("normalizes Windows-style asset paths and metadata", () => {
    const csv = [
      "title,start,labelKind,labelSrc,labelWidth,labelHeight,labelFit,labelZoom,metadata",
      'Image Test,2022-01-01,image,.\\assets\\logo.png,200,160,contain,1.2,"{\\"foo\\":1}"',
    ].join("\n");
    const [item] = CSVParser.parse(csv);
    expect(item.title).toBe("Image Test");
    expect(item.start).toBeInstanceOf(Date);
    expect(item.label).toBeTruthy();
    expect(item.label?.kind).toBe("image");
    expect(item.label && "src" in item.label && item.label.src).toContain(
      "/assets/logo.png"
    );
    expect(item.metadata).toEqual({ foo: 1 });
  });
});

describe("JSONParser", () => {
  it("falls back to legacy background definitions", () => {
    const json = {
      items: [
        {
          title: "Legacy",
          start: "2020-05-01",
          background: { type: "image", source: ".\\assets\\logo.png" },
        },
      ],
    };
    const [item] = JSONParser.parse(json);
    expect(item.label?.kind).toBe("image");
    expect(item.label && "src" in item.label && item.label.src).toContain(
      "/assets/logo.png"
    );
  });
});

describe("ParserFactory", () => {
  it("throws for unsupported formats", () => {
    expect(() =>
      ParserFactory.parse("foo", "unknown" as any)
    ).toThrowError(/Unsupported data type/);
  });
});

describe("TEIParser", () => {
  it("parses TEI events with label fallbacks", () => {
    const xml = `
      <TEI>
        <text>
          <body>
            <listEvent>
              <event when="2022-06-01" type="test">
                <title>TEI Event</title>
                <desc>Demo</desc>
              </event>
            </listEvent>
          </body>
        </text>
      </TEI>`;
    const [item] = TEIParser.parse(xml);
    expect(item.title).toBe("TEI Event");
    expect(item.start).toBeInstanceOf(Date);
    expect(item.label?.kind).toBe("text");
    expect(item.label && "text" in item.label && item.label.text).toBe(
      "TEI Event"
    );
    expect(item.metadata).toEqual({ when: "2022-06-01", type: "test" });
  });
});

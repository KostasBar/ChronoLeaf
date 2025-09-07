import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

import { CSVParser } from "../src/parsers/CSVParser";
import { JSONParser } from "../src/parsers/JSONParser";
import { XMLParser } from "../src/parsers/XMLParser";
import { TEIParser } from "../src/parsers/TEIParser";

const fx = (p: string) => fs.readFileSync(path.resolve(__dirname, "..", "fixtures", p), "utf8");

describe("CSV (new schema): image label + overlay + metadata", () => {
  it("parses image label, overlayColor and JSON metadata", () => {
    const csv = fx("a_image.csv");
    const out = CSVParser.parse(csv);
    expect(out).toHaveLength(1);

    const it = out[0];
    expect(it.title).toBe("Release");
    expect(it.overlayColor).toBe("#00000080"); // Black 50% alpha
    expect(it.label?.kind).toBe("image");
    if (it.label?.kind === "image") {
      expect(it.label.src).toBe("https://example.com/p1.jpg");
      expect(it.label.width).toBe(160);
      expect(it.label.height).toBe(120);
      expect(it.label.fit).toBe("contain");
      expect(it.label.zoom).toBe(1.2);
    }
    expect(it.metadata).toEqual({ source: "press", score: 88 });
  });
});

describe("CSV (back-compat): backgroundType/backgroundSource → label", () => {
  it("maps legacy background fields to an image label", () => {
    const csv = fx("b_legacy_bg.csv");
    const out = CSVParser.parse(csv);
    expect(out).toHaveLength(1);
    const it = out[0];
    expect(it.title).toBe("Legacy Item");
    expect(it.label?.kind).toBe("image");
    if (it.label?.kind === "image") {
      expect(it.label.src).toBe("https://example.com/legacy.jpg");
    }
  });
});

describe("JSON: video label + overlay", () => {
  it("keeps label.video settings and overlayColor", () => {
    const json = fx("c_video.json");
    const out = JSONParser.parse(json);
    expect(out).toHaveLength(1);
    const it = out[0];
    expect(it.overlayColor).toBe("rgba(0,0,0,0.25)");
    expect(it.label?.kind).toBe("video");
    if (it.label?.kind === "video") {
      expect(it.label.src).toBe("https://example.com/v1.mp4");
      expect(it.label.width).toBe(200);
      expect(it.label.height).toBe(120);
      expect(it.label.fit).toBe("cover");
      expect(it.label.zoom).toBe(1);
    }
    expect(it.metadata).toEqual({ poster: "https://example.com/v1.jpg" });
  });
});

describe("XML: image label attributes + overlayColor", () => {
  it("reads label attributes and overlayColor", () => {
    const xml = fx("d_image.xml");
    const out = XMLParser.parse(xml);
    expect(out).toHaveLength(1);
    const it = out[0];
    expect(it.title).toBe("XML Image Card");
    expect(it.overlayColor).toBe("#FF000080"); // Red 50% alpha
    expect(it.label?.kind).toBe("image");
    if (it.label?.kind === "image") {
      expect(it.label.src).toBe("https://example.com/img.png");
      expect(it.label.width).toBe(180);
      expect(it.label.height).toBe(140);
      expect(it.label.fit).toBe("contain");
      expect(it.label.zoom).toBe(1.1);
    }
  });
});

describe("TEI: <listEvent><event> with @when and label text", () => {
  it("parses title/desc/date/label", () => {
    const tei = fx("e_text.tei.xml");
    const out = TEIParser.parse(tei);
    expect(out).toHaveLength(1);
    const it = out[0];
    expect(it.title).toBe("Battle of Example");
    expect(it.description).toBe("Key turning point");
    expect(it.start.toISOString().startsWith("1066-10-14")).toBe(true);
    expect(it.label?.kind).toBe("text");
    if (it.label?.kind === "text") {
      expect(it.label.text).toBe("Bayeux");
    }
  });
});

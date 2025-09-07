import { describe, it, expect } from "vitest";
import { JSONParser } from "../src/parsers/JSONParser";
import { CSVParser } from "../src/parsers/CSVParser";
import { XMLParser } from "../src/parsers/XMLParser";
import { TEIParser } from "../src/parsers/TEIParser";

describe("Parsers basic equivalence", () => {
  const json = { items: [{ id: "a1", title: "Launch", start: "2021-06-15" }] };
  const csv = "title,start\nLaunch,2021-06-15";
  const xml = "<items><item><title>Launch</title><start>2021-06-15</start></item></items>";
  const tei = `<TEI><text><body><listEvent><event xml:id="a1"><title>Launch</title><date when="2021-06-15"/></event></listEvent></body></text></TEI>`;

  it("JSON parser", () => {
    const items = JSONParser.parse(json);
    expect(items[0].title).toBe("Launch");
  });

  it("CSV parser", () => {
    const items = CSVParser.parse(csv);
    expect(items[0].title).toBe("Launch");
  });

  it("XML parser", () => {
    const items = XMLParser.parse(xml);
    expect(items[0].title).toBe("Launch");
  });

  it("TEI parser", () => {
    const items = TEIParser.parse(tei);
    expect(items[0].title).toBe("Launch");
  });
});

import { TimelineItem } from "./interfaces";
import { CSVParser } from "../parsers/CSVParser";
import { JSONParser } from "../parsers/JSONParser";
import { XMLParser } from "../parsers/XMLParser";
import { TEIParser } from "../parsers/TEIParser";

export interface ITimelineParser {
  readonly name: string;
  parse(data: string | object): TimelineItem[];
}

const customParsers = new Map<string, ITimelineParser>();

export type DataType = "csv" | "json" | "xml" | "tei" | (string & {});

export class ParserFactory {
  static register(parser: ITimelineParser): void {
    customParsers.set(parser.name.toLowerCase(), parser);
  }

  static supportedFormats(): string[] {
    return Array.from(new Set(["csv", "json", "xml", "tei", ...customParsers.keys()]));
  }

  static parse(data: string | object, type: DataType): TimelineItem[] {
    const normalizedType = String(type).toLowerCase();
    const custom = customParsers.get(normalizedType);
    if (custom) return custom.parse(data);

    switch (normalizedType) {
      case "csv":
        if (typeof data !== "string") {
          throw new Error("CSV parser expects a string input.");
        }
        return CSVParser.parse(data);
      case "json":
        return JSONParser.parse(data);
      case "xml":
        if (typeof data !== "string") {
          throw new Error("XML parser expects a string input.");
        }
        return XMLParser.parse(data);
      case "tei":
        if (typeof data !== "string") {
          throw new Error("TEI parser expects a string input.");
        }
        return TEIParser.parse(data);
      default:
        throw new Error(`Unsupported data type: ${type}`);
    }
  }
}

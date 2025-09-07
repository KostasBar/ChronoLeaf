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

    const custom = customParsers.get(String(type).toLowerCase());
    if (custom) return custom.parse(data);

    switch (type) {
      case "csv": return CSVParser.parse(data as string);
      case "json": return JSONParser.parse(data);
      case "xml": return XMLParser.parse(data as string);
      case "tei": return TEIParser.parse(data as string);
      default:
        throw new Error(`Unsupported data type: ${type}`);
    }
  }
}

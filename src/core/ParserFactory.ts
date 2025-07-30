import { TimelineItem } from "./interfaces";
import { CSVParser } from "../parsers/CSVParser";
import { JSONParser } from "../parsers/JSONParser";
import { XMLParser } from "../parsers/XMLParser";
import { TEIParser } from "../parsers/TEIParser";

export type DataType = "csv" | "json" | "xml" | "tei";

export class ParserFactory {
  static parse(data: string | object, type: DataType): TimelineItem[] {
    switch (type) {
      case "csv":
        return CSVParser.parse(data as string);
      case "json":
        return JSONParser.parse(data);
      case "xml":
        return XMLParser.parse(data as string);
      case "tei":
        return TEIParser.parse(data as string);
      default:
        throw new Error(`Unsupported data type: ${type}`);
    }
  }
}

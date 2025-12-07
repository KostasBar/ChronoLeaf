import Papa from "papaparse";
import { TimelineItem, LabelContent } from "../core/interfaces";
import {
  normalizeAssetPath,
  parseMetadataField,
  stripBom,
  toDate,
  toMediaFit,
  toNumber,
  toOptionalDate,
  warnParse,
} from "./utils";

type CsvRow = Record<string, string>;

export class CSVParser {
  static parse(csv: string): TimelineItem[] {
    const result = Papa.parse<CsvRow>(stripBom(csv), {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length) {
      const firstError = result.errors[0];
      warnParse(
        "CSV",
        `Parser reported an error at row ${firstError.row ?? "unknown"}: ${
          firstError.message
        }`
      );
    }

    const items: TimelineItem[] = [];
    result.data.forEach((row, index) => {
      if (isRowEmpty(row)) return;
      const item = rowToItem(row, index);
      if (item) items.push(item);
    });
    return items;
  }
}

function rowToItem(row: CsvRow, index: number): TimelineItem | null {
  const start = toDate(row.start, "CSV", "start");
  if (!start) return null;
  const end = toOptionalDate(row.end, "CSV", "end");

  const fallbackText =
    row.labelText?.trim() || row.description?.trim() || row.title?.trim();

  const label = buildLabel(row, fallbackText);

  const overlayColor =
    firstNonEmpty(row.overlayColor, row.backgroundOverlayColor) ?? undefined;

  const metadataField =
    (row.metadata && row.metadata.trim()) ||
    (row.meta && row.meta.trim()) ||
    undefined;

  return {
    title: row.title?.trim() || `Item ${index + 1}`,
    start,
    end,
    description: row.description?.trim() || undefined,
    overlayColor,
    label,
    metadata: parseMetadataField(metadataField, "CSV"),
  };
}

function isRowEmpty(row: CsvRow): boolean {
  return Object.values(row).every(
    (value) => value == null || value.trim() === ""
  );
}

function buildLabel(
  row: CsvRow,
  fallbackText?: string
): LabelContent | undefined {
  const rawKind = (row.labelKind ?? row.labelType ?? "").trim().toLowerCase();
  const normalizedKind =
    rawKind || (row.labelText ? "text" : row.labelSrc ? "image" : "");

  if (normalizedKind === "text") {
    const text = row.labelText?.trim() || fallbackText;
    if (text) {
      return { kind: "text", text };
    }
  } else if (normalizedKind === "image" && row.labelSrc) {
    const src = normalizeAssetPath(row.labelSrc) ?? row.labelSrc.trim();
    if (src) {
      return {
        kind: "image",
        src,
        width: toNumber(row.labelWidth),
        height: toNumber(row.labelHeight),
        fit: toMediaFit(row.labelFit),
        zoom: toNumber(row.labelZoom),
        alt: row.labelAlt?.trim() || undefined,
      };
    }
  } else if (normalizedKind === "video" && row.labelSrc) {
    const src = normalizeAssetPath(row.labelSrc) ?? row.labelSrc.trim();
    if (src) {
      return {
        kind: "video",
        src,
        width: toNumber(row.labelWidth),
        height: toNumber(row.labelHeight),
        fit: toMediaFit(row.labelFit),
        zoom: toNumber(row.labelZoom),
        poster:
          normalizeAssetPath(row.labelPoster) ??
          (row.labelPoster?.trim() || undefined),
      };
    }
  }

  // Legacy columns (backgroundType/backgroundSource/backgroundText)
  const legacyType = (row.backgroundType ?? "").trim().toLowerCase();
  if (legacyType === "text") {
    return { kind: "text", text: row.backgroundText || fallbackText };
  }
  if ((legacyType === "image" || legacyType === "video") && row.backgroundSource) {
    const src =
      normalizeAssetPath(row.backgroundSource) ?? row.backgroundSource.trim();
    if (!src) return undefined;
    if (legacyType === "image") return { kind: "image", src };
    return { kind: "video", src };
  }

  return undefined;
}

function firstNonEmpty(
  ...values: Array<string | undefined>
): string | undefined {
  for (const value of values) {
    if (value && value.trim()) {
      return value;
    }
  }
  return undefined;
}

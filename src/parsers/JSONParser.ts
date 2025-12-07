import { TimelineItem, LabelContent } from "../core/interfaces";
import {
  normalizeAssetPath,
  normalizeLabelObject,
  parseMetadataField,
  stripBom,
  toDate,
  toOptionalDate,
  warnParse,
} from "./utils";

type JsonInput =
  | {
      items?: unknown;
    }
  | TimelineItem[]
  | unknown;

export class JSONParser {
  static parse(json: string | object): TimelineItem[] {
    const payload: JsonInput =
      typeof json === "string"
        ? JSON.parse(stripBom(json).trim() || '{"items":[]}')
        : json;

    const rawItems = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as any)?.items)
      ? ((payload as any).items as unknown[])
      : null;

    if (!rawItems) {
      throw new Error(
        "JSON parser expects an array of items or an object with an `items` array."
      );
    }

    const items: TimelineItem[] = [];
    rawItems.forEach((entry, index) => {
      if (!entry || typeof entry !== "object") {
        warnParse("JSON", `Skipping entry at index ${index}.`);
        return;
      }
      const raw = entry as Record<string, unknown>;
      const start = toDate(raw.start, "JSON", "start");
      if (!start) return;
      const end = toOptionalDate(raw.end, "JSON", "end");

      const fallbackText =
        (typeof raw.description === "string" && raw.description) ||
        (typeof raw.title === "string" && raw.title) ||
        undefined;

      const label =
        normalizeLabelObject(raw.label, fallbackText) ??
        legacyLabel(raw, fallbackText);

      const overlay =
        typeof raw.overlayColor === "string" && raw.overlayColor.trim()
          ? raw.overlayColor
          : undefined;

      items.push({
        title:
          typeof raw.title === "string" && raw.title.trim()
            ? raw.title
            : `Item ${index + 1}`,
        start,
        end,
        description:
          typeof raw.description === "string" ? raw.description : undefined,
        overlayColor: overlay ?? legacyOverlay(raw),
        label,
        metadata: parseMetadataField(raw.metadata, "JSON"),
      });
    });

    return items;
  }
}

function legacyLabel(
  raw: Record<string, unknown>,
  fallbackText?: string
): LabelContent | undefined {
  const background = raw.background;
  if (!background || typeof background !== "object") return undefined;
  const kind = typeof (background as any).type === "string"
    ? (background as any).type.toLowerCase()
    : "";
  const src =
    typeof (background as any).source === "string"
      ? normalizeAssetPath((background as any).source) ??
        ((background as any).source as string)
      : undefined;

  if (kind === "text") {
    const text =
      typeof (background as any).text === "string"
        ? (background as any).text
        : fallbackText;
    return { kind: "text", text };
  }
  if (kind === "image" && src) {
    return { kind: "image", src };
  }
  if (kind === "video" && src) {
    return { kind: "video", src };
  }
  return undefined;
}

function legacyOverlay(raw: Record<string, unknown>): string | undefined {
  const background = raw.background;
  if (!background || typeof background !== "object") return undefined;
  const overlay = (background as any).overlayColor;
  return typeof overlay === "string" ? overlay : undefined;
}

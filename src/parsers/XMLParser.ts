import { TimelineItem, LabelContent } from "../core/interfaces";
import {
  ensureDomParser,
  normalizeAssetPath,
  stripBom,
  toDate,
  toMediaFit,
  toNumber,
  toOptionalDate,
  warnParse,
} from "./utils";

export class XMLParser {
  static parse(xml: string): TimelineItem[] {
    const parser = ensureDomParser("XML");
    const doc = parser.parseFromString(stripBom(xml), "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      throw new Error(
        `XML parser error: ${parseError.textContent?.trim() || "Invalid XML."}`
      );
    }

    const items: TimelineItem[] = [];

    doc.querySelectorAll("item").forEach((node, index) => {
      const getText = (tag: string) =>
        node.querySelector(tag)?.textContent?.trim() || "";

      const start = toDate(getText("start"), "XML", "start");
      if (!start) return;
      const end = node.querySelector("end")
        ? toOptionalDate(getText("end"), "XML", "end")
        : undefined;

      const fallback =
        getText("description") || getText("title") || `Item ${index + 1}`;

      const labelEl = node.querySelector("label");
      const label = labelEl ? parseLabel(labelEl, fallback) : undefined;

      const overlayColor =
        getText("overlayColor") ||
        labelEl?.getAttribute("overlayColor") ||
        undefined;

      items.push({
        title: getText("title") || `Item ${index + 1}`,
        start,
        end,
        description: getText("description") || undefined,
        overlayColor,
        label,
      });
    });

    return items;
  }
}

function parseLabel(
  labelEl: Element,
  fallbackText?: string
): LabelContent | undefined {
  const kind = (labelEl.getAttribute("kind") || "").toLowerCase();
  if (kind === "text") {
    return {
      kind: "text",
      text: labelEl.textContent?.trim() || fallbackText,
    };
  }

  if (kind === "image") {
    const src =
      normalizeAssetPath(labelEl.getAttribute("src")) ||
      labelEl.getAttribute("src") ||
      undefined;
    if (!src) {
      warnParse("XML", 'Skipping <label kind="image"> without src attribute.');
      return undefined;
    }
    return {
      kind: "image",
      src,
      width: toNumber(labelEl.getAttribute("width")),
      height: toNumber(labelEl.getAttribute("height")),
      fit: toMediaFit(labelEl.getAttribute("fit")),
      zoom: toNumber(labelEl.getAttribute("zoom")),
      alt: labelEl.getAttribute("alt") || undefined,
    };
  }

  if (kind === "video") {
    const src =
      normalizeAssetPath(labelEl.getAttribute("src")) ||
      labelEl.getAttribute("src") ||
      undefined;
    if (!src) {
      warnParse("XML", 'Skipping <label kind="video"> without src attribute.');
      return undefined;
    }
    return {
      kind: "video",
      src,
      width: toNumber(labelEl.getAttribute("width")),
      height: toNumber(labelEl.getAttribute("height")),
      fit: toMediaFit(labelEl.getAttribute("fit")),
      zoom: toNumber(labelEl.getAttribute("zoom")),
      poster:
        normalizeAssetPath(labelEl.getAttribute("poster")) ||
        labelEl.getAttribute("poster") ||
        undefined,
    };
  }

  return undefined;
}

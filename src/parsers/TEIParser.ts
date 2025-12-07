import { TimelineItem, LabelContent } from "../core/interfaces";
import {
  ensureDomParser,
  normalizeAssetPath,
  stripBom,
  toDate,
  warnParse,
} from "./utils";

export class TEIParser {
  static parse(teiXml: string): TimelineItem[] {
    const parser = ensureDomParser("TEI");
    const doc = parser.parseFromString(stripBom(teiXml), "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      throw new Error(
        `TEI parser error: ${parseError.textContent?.trim() || "Invalid XML."}`
      );
    }

    const items: TimelineItem[] = [];

    doc.querySelectorAll("listEvent event").forEach((node, index) => {
      const text = (sel: string) =>
        node.querySelector(sel)?.textContent?.trim() || "";

      const whenAttr =
        node.getAttribute("when") ||
        node.querySelector("date")?.getAttribute("when") ||
        node.querySelector("date")?.textContent ||
        "";
      const start = toDate(whenAttr || text("date"), "TEI", "date");
      if (!start) return;

      const label = parseTeiLabel(node, text("title") || text("desc"));

      items.push({
        title: text("title") || text("desc") || `Event ${index + 1}`,
        start,
        description: text("desc") || undefined,
        label,
        metadata: {
          when: whenAttr || undefined,
          type: node.getAttribute("type") || undefined,
        },
      });
    });

    return items;
  }
}

function parseTeiLabel(
  node: Element,
  fallbackText?: string
): LabelContent | undefined {
  const labelEl = node.querySelector("label");
  if (!labelEl) {
    return fallbackText ? { kind: "text", text: fallbackText } : undefined;
  }

  const kind = (labelEl.getAttribute("kind") || "").toLowerCase();
  if (kind === "text") {
    return {
      kind: "text",
      text: labelEl.textContent?.trim() || fallbackText,
    };
  }

  if (kind === "image" || kind === "video") {
    const src =
      normalizeAssetPath(labelEl.getAttribute("src")) ||
      labelEl.getAttribute("src") ||
      undefined;
    if (!src) {
      warnParse(
        "TEI",
        `Skipping <label kind="${kind}"> without a src attribute.`
      );
      return undefined;
    }
    return { kind, src } as LabelContent;
  }

  return fallbackText ? { kind: "text", text: fallbackText } : undefined;
}

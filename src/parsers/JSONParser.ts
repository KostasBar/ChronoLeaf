import { TimelineItem, LabelContent } from "../core/interfaces";

export class JSONParser {
  static parse(json: string | object): TimelineItem[] {
    const obj =
      typeof json === "string"
        ? JSON.parse(json.replace(/^\uFEFF/, "").trim())
        : json;
    return (obj as any).items.map((i: any) => {
      let label: LabelContent | undefined = i.label;

      // Back-compat: background -> label/overlayColor
      if (!label && i.background) {
        const t = (i.background.type ?? "").toLowerCase();
        if (t === "image" && i.background.source) {
          label = { kind: "image", src: i.background.source };
        } else if (t === "video" && i.background.source) {
          label = { kind: "video", src: i.background.source };
        } else if (t === "text") {
          label = { kind: "text", text: i.description ?? i.title };
        }
      }

      return {
        title: i.title,
        start: new Date(i.start),
        end: i.end ? new Date(i.end) : undefined,
        description: i.description,
        overlayColor: i.overlayColor ?? i.background?.overlayColor,
        label,
        metadata: i.metadata,
      } as TimelineItem;
    });
  }
}

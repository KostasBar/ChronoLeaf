import {
  ITimeline,
  TimelineItem,
  ITimelineConfig
} from './interfaces';
import { ParserFactory, DataType, ITimelineParser } from './ParserFactory';
import { SliderRenderer } from '../renderers/SliderRenderer';
import { VerticalRenderer } from '../renderers/VerticalRenderer';
import { GridRenderer } from '../renderers/GridRenderer';
import { applyTheme } from './theme';

export class Timeline implements ITimeline {
  title?: string;
  items: TimelineItem[];
  config: ITimelineConfig;

  constructor(items: TimelineItem[], config?: Partial<ITimelineConfig>) {
    this.items = Array.isArray(items) ? [...items] : [];
    this.config = {
      mode: config?.mode ?? "slider",
      showTodayLine: config?.showTodayLine ?? true,
      interactive: config?.interactive ?? true,
      theme: config?.theme ?? "light",
      language: config?.language ?? "en",
      ...config,
    } as ITimelineConfig;
  }

  render(container: HTMLElement): void {
    if (!container) {
      throw new Error("Timeline.render requires a valid container element.");
    }

    container.innerHTML = "";

    applyTheme(container, this.config.theme);

    if (
      typeof this.config.customRenderer === "function" &&
      (this.config.mode as string) === "custom"
    ) {
      this.renderCustom(container);
      return;
    }

    switch (this.config.mode) {
      case "slider":
        SliderRenderer.render(this, container, this.config);
        break;
      case "vertical":
        VerticalRenderer.render(this, container, this.config);
        break;
      case "grid":
        GridRenderer.render(this, container, this.config);
        break;
      default:
        if (
          typeof this.config.customRenderer === "function" &&
          this.renderCustom(container)
        ) {
          break;
        }
        container.innerHTML = this.toHTML();
    }
  }

  toHTML(): string {
    const lines = this.items.map(i =>
      `<div class="tl-item">
         <strong>${i.title}</strong>
         <time>${i.start.toLocaleDateString()}</time>
       </div>`
    );
    return `<div class="tl-container">${lines.join('')}</div>`;
  }

  /*____________________________
    ----------Parsers-----------
    ____________________________
  */

   static fromCSV(csv: string): Timeline {
    const items = ParserFactory.parse(csv, 'csv');
    return new Timeline(items);
  }

  static fromJSON(json: string | object): Timeline {
    const items = ParserFactory.parse(json, 'json');
    return new Timeline(items);
  }

  static fromXML(xml: string): Timeline {
    const items = ParserFactory.parse(xml, 'xml');
    return new Timeline(items);
  }

    static fromTEI(teiXml: string): Timeline {
    const items = ParserFactory.parse(teiXml, 'tei');
    return new Timeline(items);
  }

  //generic import
  static from(data: string | object, format: DataType): Timeline {
    const items = ParserFactory.parse(data, format);
    return new Timeline(items);
  }

  //registration sugar
  static registerParser(parser: ITimelineParser): void {
    ParserFactory.register(parser);
  }

  // introspection
  static supportedFormats(): string[] {
    return ParserFactory.supportedFormats();
  }

  private renderCustom(container: HTMLElement): boolean {
    if (typeof this.config.customRenderer !== "function") return false;
    const renderer = this.config.customRenderer;
    const fragment = document.createDocumentFragment();
    for (const item of this.items) {
      const result = renderer(item);
      if (!result) continue;
      appendCustomNode(fragment, result);
    }
    container.appendChild(fragment);
    return true;
  }
}

function appendCustomNode(
  target: DocumentFragment,
  node: HTMLElement | SVGElement | DocumentFragment | string
): void {
  if (typeof document === "undefined") {
    throw new Error("Custom renderers require a DOM environment.");
  }
  if (typeof node === "string") {
    const wrap = document.createElement("div");
    wrap.innerHTML = node;
    while (wrap.firstChild) {
      target.appendChild(wrap.firstChild);
    }
    return;
  }
  target.appendChild(node);
}

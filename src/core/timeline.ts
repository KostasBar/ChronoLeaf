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
    this.items = items;
    // Default config values
    this.config = {
    theme: 'light',     // ← default!
    mode: 'slider',
    showTodayLine: true,
    interactive: true,
    language: 'en',
    ...config
    } as ITimelineConfig;
    
  }

render(container: HTMLElement): void {
    
    container.innerHTML = '';

     applyTheme(container, this.config.theme);
    switch (this.config.mode) {
      case 'slider':
        SliderRenderer.render(this, container, this.config);
        break;
      case 'vertical':
        VerticalRenderer.render(this, container, this.config);
        break;
      case 'grid':
        GridRenderer.render(this, container,this.config);
        break;
      default:
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
}

export interface ITimeline {
  title?: string;
  items: TimelineItem[];
  config: ITimelineConfig;
  render(container: HTMLElement): void;
  toHTML(): string;
}

export interface ITimelineConfig {
  mode: TimelineMode;
  showTodayLine?: boolean;
  theme?: 'light' | 'dark' | Record<string, any>;
  interactive?: boolean;
  language?: string;
  customRenderer?: (item: TimelineItem) =>
    HTMLElement | SVGElement | DocumentFragment | string;

  /** Called when the user clicks on an event. */
  onItemClick?: (item: TimelineItem, event: MouseEvent) => void;

  /** Called when the user hovers over an event. */
  onItemHover?: (item: TimelineItem, event: MouseEvent) => void;

  /** Called whenever the zoom/pan transform changes. */
  onRangeChange?: (domain: [Date, Date]) => void;
}

export type TimelineItem = {
  title: string;
  start: Date;
  end?: Date;
  description?: string;
  background?: Background;
  metadata?: Record<string, any>;
};

export type Background = {
  type: 'image' | 'video' | 'color';
  source: string;
  overlayColor?: string;
};

export interface ThemeConfig {
  name?: string;
  primaryColor?: string;
  backgroundColor?: string;
  font?: string;
  borderRadius?: string;
  // add any other CSS vars you want to expose…
}

export type TimelineMode = 'slider' | 'vertical' | 'grid';
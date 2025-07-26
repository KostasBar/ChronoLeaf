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

export type TimelineMode = 'slider' | 'vertical' | 'grid';
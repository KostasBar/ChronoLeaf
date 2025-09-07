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
  theme?: "light" | "dark" | Record<string, any>;
  interactive?: boolean;
  language?: string;
  customRenderer?: (
    item: TimelineItem
  ) => HTMLElement | SVGElement | DocumentFragment | string;

  /** Called when the user clicks on an event. */
  onItemClick?: (item: TimelineItem, event: MouseEvent) => void;

  /** Called when the user hovers over an event. */
  onItemHover?: (item: TimelineItem, event: MouseEvent) => void;

  /** Called whenever the zoom/pan transform changes. */
  onRangeChange?: (domain: [Date, Date]) => void;

  /** Vertical offset in px for labels (text/images/videos) relative to baseline. Default: -10 */
  labelYOffset?: number;

  /** Max height in px for image/video labels when per-item height is not specified. Default: 28 */
  mediaLabelMaxHeight?: number;

  /** Axis strategy for slider: 'time' (default) or 'point' (equal spacing). */
  axisStrategy?: "time" | "point";

  /** Minimum horizontal gap (px) between labels/ticks to avoid overlaps. Default: 40 */
  minLabelGap?: number;

  /** Default width for image/video card labels (px). */
  cardWidth?: number;

  /** Default height for image/video card labels (px). */
  cardHeight?: number;

  /** If true (default), ignore per-item label width/height to keep cards uniform. */
  enforceUniformCardSize?: boolean;

  /** If true (default), hide overlapping label-cards to keep the view readable. */
  hideOverlappingLabels?: boolean;

  /** Extra horizontal gap (px) to keep between cards when culling. Default: 8. */
  labelCardGap?: number;

  /** How media should fit inside cards: 'cover' (default, no empty space) or 'contain' */
  mediaObjectFit?: "cover" | "contain";

  /** Vertical position of baseline (0 = top, height = bottom). Default: height/2. */
  baselineY?: number;

  /** Optional full-canvas background (color / image / video). */
  canvasBackground?: CanvasBackground;

  zoom?: { minScale?: number; maxScale?: number; initialScale?: number };
}

export type CanvasBackground =
  | { kind: "color"; value: string } // any CSS color
  | {
      kind: "image";
      src: string; // URL/path
      fit?: "cover" | "contain"; // default 'cover'
      opacity?: number; // 0..1 (default 1)
    }
  | {
      kind: "video";
      src: string; // URL/path
      fit?: "cover" | "contain"; // default 'cover'
      opacity?: number; // 0..1 (default 1)
      loop?: boolean; // default true
      autoplay?: boolean; // default true
      muted?: boolean; // default true
      controls?: boolean; // default false
      poster?: string;
    };

export type TimelineItem = {
  title: string;
  start: Date;
  end?: Date;
  description?: string;

  /** Optional color (any CSS color) drawn ON TOP of the card; use rgba/hsla for transparency. */
  overlayColor?: string;

  /** Optional media/text label to render near the baseline */
  label?: LabelContent;

  metadata?: Record<string, any>;
};

/** Rich label content displayed at the event's x-position. */
export type LabelContent =
  | {
      kind: "text";
      text?: string;
    }
  | {
      kind: "image";
      src: string;
      width?: number;
      height?: number;
      alt?: string;

      /** 'cover' (default) fills card; 'contain' fits without cropping */
      fit?: "cover" | "contain";

      /** Extra zoom for the media inside the card (1 = off). */
      zoom?: number;
    }
  | {
      kind: "video";
      src: string;
      width?: number;
      height?: number;
      poster?: string;
      loop?: boolean;
      autoplay?: boolean;
      muted?: boolean;
      controls?: boolean;

      /** 'cover' (default) fills card; 'contain' fits without cropping */
      fit?: "cover" | "contain";

      /** Extra zoom for the media inside the card (1 = off). */
      zoom?: number;
    };

export interface ThemeConfig {
  name?: string;
  primaryColor?: string;
  backgroundColor?: string;
  font?: string;
  borderRadius?: string;
}

export type TimelineMode = "slider" | "vertical" | "grid";

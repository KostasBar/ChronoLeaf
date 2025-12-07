import {
  select,
  scaleTime,
  scalePoint,
  axisLeft,
  extent,
  timeFormat,
} from "d3";
import { zoom, zoomIdentity, ZoomBehavior, ZoomTransform } from "d3-zoom";
import {
  ITimeline,
  TimelineItem,
  ITimelineConfig,
  LabelContent,
} from "../core/interfaces";
import type { Selection } from "d3-selection";

const DEFAULT_WIDTH = 720;
const DEFAULT_HEIGHT = 520;

function measureDimension(
  element: HTMLElement,
  dimension: "width" | "height"
): number {
  const clientValue =
    dimension === "width" ? element.clientWidth : element.clientHeight;
  if (clientValue > 0) return clientValue;
  const rect = element.getBoundingClientRect();
  if (rect[dimension] > 0) return rect[dimension];
  return dimension === "width" ? DEFAULT_WIDTH : DEFAULT_HEIGHT;
}

type LocalConfig = ITimelineConfig & {
  axisStrategy: "time" | "point";
  minLabelGap: number;
  labelYOffset: number; 
  cardWidth: number;
  cardHeight: number;
  enforceUniformCardSize: boolean;
  hideOverlappingLabels: boolean;
  labelCardGap: number;
  mediaObjectFit: "cover" | "contain";
  baselineX?: number;
  hoverScale: number;
  hoverDotRadius: number;
  showTooltip?: boolean;
};

export class VerticalRenderer {
  static render(
    timeline: ITimeline,
    container: HTMLElement,
    rawConfig: ITimelineConfig
  ): void {
    // ------------------------------------------------------------------
    // Setup & defaults
    // ------------------------------------------------------------------
    const config: LocalConfig = {
      axisStrategy: rawConfig.axisStrategy ?? "time",
      minLabelGap: rawConfig.minLabelGap ?? 40,
      labelYOffset:
        (rawConfig as any).labelXOffset ?? rawConfig.labelYOffset ?? 16,
      cardWidth: rawConfig.cardWidth ?? 140,
      cardHeight: rawConfig.cardHeight ?? 200,
      enforceUniformCardSize: rawConfig.enforceUniformCardSize ?? true,
      hideOverlappingLabels: rawConfig.hideOverlappingLabels ?? true,
      labelCardGap: rawConfig.labelCardGap ?? 8,
      mediaObjectFit: rawConfig.mediaObjectFit ?? "cover",
      baselineX: (rawConfig as any).baselineX,
      hoverScale: (rawConfig as any).hoverScale ?? 1.08,
      hoverDotRadius: (rawConfig as any).hoverDotRadius ?? 8,
      showTooltip: (rawConfig as any).showTooltip ?? true,
      ...rawConfig,
    } as LocalConfig;

    container.innerHTML = "";

    const margin = { top: 10, right: 80, bottom: 50, left: 80 };
    const measuredWidth = measureDimension(container, "width");
    const measuredHeight = measureDimension(container, "height");
    const width = Math.max(160, measuredWidth - margin.left - margin.right);
    const height = Math.max(200, measuredHeight - margin.top - margin.bottom);
    const minScale = (rawConfig as any).zoom?.minScale ?? 1;
    const maxScale = (rawConfig as any).zoom?.maxScale ?? 80;
    const allowInteraction = rawConfig.interactive !== false;
    const containerSel = select<HTMLElement, unknown>(container);
    const zoomSurface = containerSel;
    const zoomEventFilter = (event: any) => {
      if (!allowInteraction) return false;
      if (!event) return true;
      if (event.type === "wheel") return true;
      const target = event.target as Element | null;
      if (!target) return true;
      if (target.closest(".tl-vertical-card")) return false;
      if (target.closest(".tl-nav button")) return false;
      return true;
    };

    // Root & SVG
    const root = containerSel;
    root.style("position", "relative");
    root.style("touch-action", allowInteraction ? "none" : "auto");
    const svg = root
      .append<SVGSVGElement>("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
      .attr("xmlns:xhtml", "http://www.w3.org/1999/xhtml")
      .style("background", "var(--tl-background-color, #fff)");

    const fullW = width + margin.left + margin.right;
    const fullH = height + margin.top + margin.bottom;

    const bg = svg.append("g").attr("class", "tl-canvas-bg");
    const bgCfg = rawConfig.canvasBackground;
    if (!bgCfg) {
      svg.style("background", "var(--tl-background-color, #fff)");
    } else if (bgCfg.kind === "color") {
      svg.style(
        "background",
        bgCfg.value ?? "var(--tl-background-color, #fff)"
      );
    } else if (bgCfg.kind === "image") {
      const fit = bgCfg.fit ?? "cover";
      const fo = bg
        .append("foreignObject")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", fullW)
        .attr("height", fullH);

      fo.append("xhtml:div")
        .style("width", `${fullW}px`)
        .style("height", `${fullH}px`)
        .style("opacity", String(bgCfg.opacity ?? 1))
        .style("backgroundImage", `url("${bgCfg.src}")`)
        .style("backgroundRepeat", "no-repeat")
        .style("backgroundPosition", "center")
        .style("backgroundSize", fit === "contain" ? "contain" : "cover");
    } else if (bgCfg.kind === "video") {
      const fit = bgCfg.fit ?? "cover";
      const wrap = bg
        .append("foreignObject")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", fullW)
        .attr("height", fullH)
        .append("xhtml:div")
        .style("width", `${fullW}px`)
        .style("height", `${fullH}px`)
        .style("overflow", "hidden")
        .style("opacity", String(bgCfg.opacity ?? 1));

      const vid = wrap.append("xhtml:video");
      vid
        .style("width", "100%")
        .style("height", "100%")
        .style("object-fit", fit === "contain" ? "contain" : "cover")
        .style("object-position", "center")
        .attr("src", bgCfg.src)
        .attr("playsinline", "true")
        .attr("muted", (bgCfg.muted ?? true) ? "" : null)
        .attr("loop", (bgCfg.loop ?? true) ? "" : null)
        .attr("autoplay", (bgCfg.autoplay ?? true) ? "" : null)
        .attr("controls", (bgCfg.controls ?? false) ? "" : null);
      if (bgCfg.poster) vid.attr("poster", bgCfg.poster);
      try {
        (vid.node() as HTMLVideoElement | null)?.play?.().catch(() => {});
      } catch {}
    }

    const g = svg
      .append<SVGGElement>("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // ------------------------------------------------------------------
    // Data prep
    // ------------------------------------------------------------------
    const validItems = timeline.items.filter(
      (item) =>
        item.start instanceof Date && !Number.isNaN(item.start.getTime())
    );
    if (!validItems.length) {
      container.textContent = "No timeline items to display.";
      return;
    }
    const items = [...validItems].sort((a, b) => +a.start - +b.start);
    const dates = items.map((i) => i.start);
    const baselineX = (config.baselineX ?? Math.round(width / 2)) as number;

    // ------------------------------------------------------------------
    // Scales
    // ------------------------------------------------------------------
    const dateExtent = extent(dates) as [Date | undefined, Date | undefined];
    let [minDate, maxDate] = dateExtent;
    if (!minDate || !maxDate) {
      container.textContent = "No timeline items with valid dates.";
      return;
    }
    if (minDate.getTime() === maxDate.getTime()) {
      const padding = 24 * 60 * 60 * 1000;
      minDate = new Date(minDate.getTime() - padding);
      maxDate = new Date(maxDate.getTime() + padding);
    }

    const timeY = scaleTime<number>()
      .domain([minDate, maxDate])
      .range([0, height]);

    const domPoint = items.map((_, i) => i.toString());
    const pointY = scalePoint<string>()
      .domain(domPoint)
      .range([0, height])
      .padding(0.5);

    const timeRescaled = (t: ZoomTransform) =>
      t.rescaleY(timeY) as any as (d: Date) => number;

    const getY = (d: TimelineItem, i: number, t: ZoomTransform) => {
      if (config.axisStrategy === "point") {
        const base = pointY(i.toString()) ?? 0;
        return t.applyY(base);
      } else {
        const zy = timeRescaled(t);
        return zy(d.start);
      }
    };

    // ------------------------------------------------------------------
    // Baseline (vertical)
    // ------------------------------------------------------------------
    g.append("line")
      .attr("x1", baselineX)
      .attr("x2", baselineX)
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "var(--tl-axis-color, var(--tl-primary-color, #4285f4))")
      .attr("stroke-width", 2);

    // ------------------------------------------------------------------
    // Axis (time mode ONLY)
    // ------------------------------------------------------------------
    const axisG = g.append<SVGGElement>("g");
    const styleAxis = () => {
      axisG.attr("fill", null);
      axisG
        .select<SVGPathElement>(".domain")
        .attr(
          "stroke",
          "var(--tl-axis-color, var(--tl-primary-color, #4285f4))"
        )
        .attr("fill", "none");
      axisG
        .selectAll<SVGLineElement, unknown>(".tick line")
        .attr(
          "stroke",
          "var(--tl-axis-color, var(--tl-primary-color, #4285f4))"
        );
      axisG
        .selectAll<SVGTextElement, unknown>(".tick text")
        .attr("fill", "var(--tl-tick-color, var(--tl-primary-color, #4285f4))")
        .attr("font-family", "var(--tl-font, system-ui)")
        .attr("font-size", "10px");
    };

    if (config.axisStrategy === "time") {
      axisG.call(
        axisLeft(timeY as any)
          .ticks(10)
          .tickFormat(timeFormat("%Y-%m-%d") as any)
      );
      styleAxis();
    }

    // ------------------------------------------------------------------
    // Content groups
    // ------------------------------------------------------------------
    const contentG = g.append<SVGGElement>("g");
    const dotsG = contentG.append<SVGGElement>("g");
    const cardLayer = select(container)
      .append("div")
      .attr("class", "tl-vertical-label-layer")
      .style("position", "absolute")
      .style("left", `${margin.left}px`)
      .style("top", `${margin.top}px`)
      .style("width", `${width}px`)
      .style("height", `${height}px`)
      .style("pointer-events", "none")
      .style("font-family", "var(--tl-font, system-ui)")
      .style("z-index", "2");

    // Point-axis layer (custom tick-per-item)
    const pointAxisG = contentG
      .append<SVGGElement>("g")
      .attr("class", "tl-point-axis")
      .style("display", config.axisStrategy === "point" ? "" : "none");

    // Dots
    const dots = dotsG
      .selectAll<SVGCircleElement, TimelineItem>("circle")
      .data(items)
      .enter()
      .append("circle")
      .attr("cx", baselineX)
      .attr("r", 6)
      .attr("fill", "var(--tl-accent-color, var(--tl-primary-color, #4285f4))")
      .style("cursor", (d) => (config.onItemClick ? "pointer" : "default"))
      .on("click", (event, d) => config.onItemClick?.(d, event as MouseEvent))
      .on("mouseover", (event, d) =>
        config.onItemHover?.(d, event as MouseEvent)
      );

    // Labels
    const labelNodes = cardLayer
      .selectAll<HTMLDivElement, TimelineItem>("div.tl-vertical-card")
      .data(items)
      .enter()
      .append("div")
      .attr("class", "tl-vertical-card")
      .style("position", "absolute")
      .style("cursor", (d) => (config.onItemClick ? "pointer" : "default"))
      .style("border-radius", "var(--tl-card-radius, 10px)")
      .style("box-shadow", "var(--tl-card-shadow, none)")
      .style("overflow", "hidden")
      .style("background", "var(--tl-card-bg, rgba(12, 19, 33, 0.85))")
      .style(
        "border",
        "1px solid var(--tl-card-border, rgba(255,255,255,0.08))"
      )
      .style("pointer-events", allowInteraction ? "auto" : "none");

    labelNodes.on("click", (event, d) => config.onItemClick?.(d, event as MouseEvent));
    labelNodes.on("mouseover", (event, d) =>
      config.onItemHover?.(d, event as MouseEvent)
    );

    labelNodes.each(function (d) {
      const label = d.label as LabelContent | undefined;
      const el = this as HTMLDivElement;
      el.innerHTML = "";

      const requestedWidth = config.enforceUniformCardSize
        ? config.cardWidth
        : (label as any)?.width ?? config.cardWidth;
      const clampedWidth = Math.max(
        40,
        Math.min(width, requestedWidth || config.cardWidth)
      );
      const w = clampedWidth;
      const h = config.enforceUniformCardSize
        ? config.cardHeight
        : (label as any)?.height ?? config.cardHeight;
      el.dataset.cardWidth = String(w);
      el.dataset.cardHeight = String(h);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;

      const content = document.createElement("div");
      content.style.width = "100%";
      content.style.height = "100%";
      content.style.display = "flex";
      content.style.alignItems = "center";
      content.style.justifyContent = "center";
      content.style.pointerEvents = "none";
      content.style.padding = "8px 12px 8px 10px";
      el.appendChild(content);

      if (!label || label.kind === "text") {
        content.style.color = "var(--tl-text-color, #e6eefc)";
        content.textContent = (label && (label as any).text) || d.title;
      } else if (label.kind === "image") {
        const img = document.createElement("img");
        img.src = label.src;
        img.alt = label.alt ?? d.title;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit =
          (label.fit ?? config.mediaObjectFit ?? "cover") === "contain"
            ? "contain"
            : "cover";
        img.style.objectPosition = "center";
        content.appendChild(img);
      } else if (label.kind === "video") {
        const video = document.createElement("video");
        video.src = label.src;
        video.muted = label.muted ?? true;
        video.loop = label.loop ?? true;
        video.autoplay = label.autoplay ?? false;
        video.controls = label.controls ?? false;
        video.playsInline = true;
        if (label.poster) video.poster = label.poster;
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit =
          (label.fit ?? config.mediaObjectFit ?? "cover") === "contain"
            ? "contain"
            : "cover";
        video.style.objectPosition = "center";
        content.appendChild(video);
      }

      if (d.overlayColor) {
        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.inset = "0";
        overlay.style.background = d.overlayColor;
        overlay.style.opacity = "0.4";
        overlay.style.pointerEvents = "none";
        el.appendChild(overlay);
      }
    });


    dots
      .style("transition", "r 120ms ease")
      .on("mouseenter", function (_, d) {
        const curr = select(this).attr("r");
        select(this).attr("data-prev-r", curr).attr("r", config.hoverDotRadius);
        const i = items.indexOf(d);
        const node = labelNodes.nodes()[i] as HTMLDivElement;
        node.style.transform += " scale(1.06)";
      })
      .on("mouseleave", function (_, d) {
        const prev = select(this).attr("data-prev-r") || 6;
        select(this).attr("r", prev);
        const i = items.indexOf(d);
        const node = labelNodes.nodes()[i] as HTMLDivElement;
        node.style.transform = node.dataset.lastTransform || node.style.transform;
      });

    labelNodes
      .on("mouseenter", function () {
        const node = this as HTMLDivElement;
        node.dataset.lastTransform = node.style.transform;
        node.style.transform += " scale(1.06)";
      })
      .on("mouseleave", function () {
        const node = this as HTMLDivElement;
        node.style.transform = node.dataset.lastTransform || node.style.transform;
      });

    // ------------------------------------------------------------------
    // Tooltip
    // ------------------------------------------------------------------
    type DivSel = Selection<HTMLDivElement, unknown, any, any>;
    let tooltip: DivSel | null = null;

    if (config.showTooltip !== false) {
      tooltip = root
        .append<HTMLDivElement>("div")
        .attr("class", "tl-tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("padding", "6px 10px")
        .style("width", "250px")
        .style("border-radius", "4px")
        .style("background", "var(--tl-tooltip-bg, rgba(0,0,0,0.7))")
        .style("color", "var(--tl-tooltip-color, #fff)")
        .style("font-family", "var(--tl-font, system-ui)")
        .style("font-size", "12px")
        .style("opacity", "0");
    }

    function tooltipHTML(item: TimelineItem): string {
      const s = item.start.toLocaleDateString();
      const e = item.end ? ` – ${item.end.toLocaleDateString()}` : "";
      const d = item.description ? `<div>${item.description}</div>` : "";
      return `<strong>${item.title}</strong><div>${s}${e}</div>${d}`;
    }

    const wireTooltip = (sel: any) => {
      if (!tooltip) return;
      sel
        .on("mouseover", (_: MouseEvent, d: TimelineItem) =>
          tooltip!.html(tooltipHTML(d)).style("opacity", "1")
        )
        .on("mousemove", (event: MouseEvent) =>
          tooltip!
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`)
        )
        .on("mouseout", () => tooltip!.style("opacity", "0"));
    };

    wireTooltip(dots);
    wireTooltip(labelNodes);

    // ------------------------------------------------------------------
    // Point-axis (custom) elements
    // ------------------------------------------------------------------
    const fmt = timeFormat("%Y-%m-%d");
    const tickWidth = 6;
    const textDx = 10;

    const pointTicks = pointAxisG
      .selectAll<SVGGElement, TimelineItem>("g.tl-date-tick")
      .data(items)
      .enter()
      .append("g")
      .attr("class", "tl-date-tick");

    pointTicks
      .append("line")
      .attr("x1", baselineX)
      .attr("x2", baselineX - tickWidth)
      .attr("stroke", "var(--tl-axis-color, var(--tl-primary-color, #4285f4))")
      .attr("stroke-width", 1);

    pointTicks
      .append("text")
      .attr("class", "tl-date-text")
      .attr("x", baselineX - tickWidth - textDx)
      .attr("text-anchor", "end")
      .attr("font-family", "var(--tl-font, system-ui)")
      .attr("font-size", "10px")
      .attr("fill", "var(--tl-tick-color, var(--tl-primary-color, #4285f4))")
      .text((d) => fmt(d.start));

    // ------------------------------------------------------------------
    // Nav arrows (UP/DOWN) with smooth roll — visible only in time mode
    // ------------------------------------------------------------------
    type ButtonSel = Selection<HTMLButtonElement, unknown, any, unknown>;
    const canNavigate =
      allowInteraction && config.axisStrategy === "time" && items.length > 1;
    let prevBtn: ButtonSel | null = null;
    let nextBtn: ButtonSel | null = null;
    if (canNavigate) {
      const navWrap = root
        .append("div")
        .attr("class", "tl-nav")
        .style("position", "absolute")
        .style("inset", "0")
        .style("pointer-events", "none");

      function makeBtn(pos: "top" | "bottom", label: string) {
        const btn = navWrap
          .append("button")
          .attr("type", "button")
          .attr("class", `tl-nav-${pos}`)
          .style("position", "absolute")
          .style(pos, "8px")
          .style("left", "50%")
          .style("transform", "translateX(-50%)")
          .style("width", "40px")
          .style("height", "40px")
          .style("border", "none")
          .style("borderRadius", "999px")
          .style("background", "rgba(0,0,0,0.35)")
          .style("backdropFilter", "blur(2px)")
          .style("color", "#fff")
          .style("fontSize", "20px")
          .style("lineHeight", "40px")
          .style("display", "flex")
          .style("alignItems", "center")
          .style("justifyContent", "center")
          .style("cursor", "pointer")
          .style("opacity", "0.85")
          .style("pointer-events", "auto")
          .style("user-select", "none")
          .style("transition", "opacity 120ms ease, transform 120ms ease")
          .text(label)
          .on("mouseenter", () => btn.style("opacity", "1"))
          .on("mouseleave", () =>
            btn.style(
              "opacity",
              btn.attr("data-disabled") === "true" ? "0.35" : "0.85"
            )
          );
        return btn;
      }

      prevBtn = makeBtn("top", "▲");
      nextBtn = makeBtn("bottom", "▼");
    }

    // smooth animator for zoom/pan
    function animateTo(tNew: ZoomTransform, ms = 600) {
      if (!allowInteraction) return;
      (zoomSurface as any)
        .transition()
        .duration(ms)
        .call((zb as any).transform, tNew);
    }

    // track current transform
    let currTransform = zoomIdentity;
    let navIndex = 0;

    // which item is closest to vertical center
    function nearestIndex(t: ZoomTransform): number {
      let bestI = 0,
        bestDy = Infinity;
      for (let i = 0; i < items.length; i++) {
        const y = getY(items[i], i, t);
        const dy = Math.abs(y - height / 2);
        if (dy < bestDy) {
          bestDy = dy;
          bestI = i;
        }
      }
      return bestI;
    }

    // center viewport on item i (keep scale), with animation
    function centerOnIndex(i: number) {
      i = Math.max(0, Math.min(items.length - 1, i));
      const base =
        config.axisStrategy === "point"
          ? pointY(i.toString()) ?? 0
          : timeY(items[i].start);
      const k = currTransform.k;
      const newY = height / 2 - k * base; // applyY(base)=k*base + y
      const tNew = zoomIdentity.translate(0, newY).scale(k);
      animateTo(tNew, 600);
    }

    function updateNavDisabled(t: ZoomTransform) {
      if (!prevBtn || !nextBtn) return;
      const i = nearestIndex(t);
      navIndex = i;
      const atStart = i <= 0;
      const atEnd = i >= items.length - 1;

      prevBtn
        .attr("data-disabled", atStart ? "true" : "false")
        .style("opacity", atStart ? "0.35" : "0.85")
        .style("cursor", atStart ? "default" : "pointer");

      nextBtn
        .attr("data-disabled", atEnd ? "true" : "false")
        .style("opacity", atEnd ? "0.35" : "0.85")
        .style("cursor", atEnd ? "default" : "pointer");
    }

    if (prevBtn && nextBtn) {
      prevBtn.on("click", () => {
        if (navIndex <= 0) return;
        centerOnIndex(navIndex - 1);
      });
      nextBtn.on("click", () => {
        if (navIndex >= items.length - 1) return;
        centerOnIndex(navIndex + 1);
      });
    }

    // ------------------------------------------------------------------
    // Overlap helpers (cards)
    // ------------------------------------------------------------------
    function cullOverlappingCardsVertical(t: ZoomTransform) {
      const data = labelNodes
        .nodes()
        .map((node, idx) => {
          const htmlNode = node as HTMLDivElement & {
            __data__?: TimelineItem;
          };
          if (htmlNode.dataset.outOfBounds === "true") {
            return null;
          }
          const d = (htmlNode.__data__ as TimelineItem) ?? items[idx];
          const y = getY(d, idx, t);
          const h = Number(htmlNode.dataset.cardHeight) || config.cardHeight;
          return { node: htmlNode, y, h };
        })
        .filter(
          (v): v is { node: HTMLDivElement; y: number; h: number } => v !== null
        );

      data.sort((a, b) => a.y - b.y);

      let lastBottom = -Infinity;
      const pad = config.labelCardGap;
      for (const { node, y, h } of data) {
        const top = y - h / 2;
        const bottom = y + h / 2;
        if (top < lastBottom + pad) {
          node.style.display = "none";
        } else {
          node.style.display = "";
          lastBottom = bottom;
        }
      }
    }
    function cullPointDateTexts(minGap: number, t: ZoomTransform) {
      let lastY = -Infinity;
      pointTicks.each(function (d, i) {
        const y = getY(d, i, t);
        const g = select(this);
        const txt = g.select<SVGTextElement>("text.tl-date-text");
        const ln = g.select<SVGLineElement>("line");
        if (y - lastY < minGap) {
          txt.style("display", "none");
          ln.style("display", "none");
        } else {
          txt.style("display", "");
          ln.style("display", "");
          lastY = y;
        }
      });
    }

    // ------------------------------------------------------------------
    // Draw (with zoom transform)
    // ------------------------------------------------------------------
    const draw = (t: ZoomTransform) => {
      currTransform = t;
      updateNavDisabled(t);

      // dots
      dots.attr("cy", (d, i) => getY(d, i, t));

      // labels
      labelNodes.each(function (d, i) {
        const node = this as HTMLDivElement;
        const y = getY(d, i, t);
        const w = Math.min(
          Number(node.dataset.cardWidth) || config.cardWidth,
          width
        );
        const h = Number(node.dataset.cardHeight) || config.cardHeight;
        const tx = baselineX + config.labelYOffset;
        const maxLeft = Math.max(0, width - w);
        const left = Math.min(Math.max(0, tx), maxLeft);
        const top = y - h / 2;
        const outOfBounds = top + h < 0 || top > height;
        node.dataset.outOfBounds = outOfBounds ? "true" : "false";
        if (outOfBounds) {
          node.style.display = "none";
          return;
        }
        node.style.transform = `translate(${left}px, ${top}px)`;
        node.dataset.lastTransform = node.style.transform;
        node.style.display = "";
      });

      if (config.axisStrategy === "time") {
        const zy = timeRescaled(t);
        axisG.style("display", "");
        axisG.call(
          axisLeft(zy as any)
            .ticks(10)
            .tickFormat(timeFormat("%Y-%m-%d") as any)
        );
        pointAxisG.style("display", "none");
      } else {
        axisG.style("display", "none");
        pointAxisG.style("display", "");

        pointTicks.each(function (d, i) {
          const y = getY(d, i, t);
          select(this).attr("transform", `translate(0, ${y})`);
        });

        if (config.hideOverlappingLabels) {
          cullPointDateTexts(config.minLabelGap ?? 40, t);
        }
      }

      if (config.hideOverlappingLabels) cullOverlappingCardsVertical(t);

      if (config.onRangeChange) {
        if (config.axisStrategy === "time") {
          const zyAny = t.rescaleY(timeY) as any;
          config.onRangeChange(zyAny.domain() as [Date, Date]);
        } else {
          const step = (pointY.step?.() ?? 1) * t.k;
          const topIndex = Math.max(
            0,
            Math.floor((0 - t.y) / Math.max(1, step))
          );
          const bottomIndex = Math.min(
            items.length - 1,
            Math.ceil((height - t.y) / Math.max(1, step))
          );
          const from = items[topIndex]?.start ?? items[0].start;
          const to = items[bottomIndex]?.start ?? items[items.length - 1].start;
          config.onRangeChange([from, to]);
        }
      }
    };

    // ------------------------------------------------------------------
    // Zoom/Pan
    // ------------------------------------------------------------------
    const zb: ZoomBehavior<HTMLElement, unknown> = zoom<
      HTMLElement,
      unknown
    >()
      .filter((event) => zoomEventFilter(event))
      .scaleExtent([minScale, maxScale])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (e) => {
        const t = e.transform as ZoomTransform;
        contentG.attr("transform", null);
        draw(t);
      });

    if (allowInteraction) {
      zoomSurface.call(zb as any);
    }

    // ------------------------------------------------------------------
    // Initial auto-zoom
    // ------------------------------------------------------------------
    function computeInitialTransform(): ZoomTransform {
      if (items.length <= 1) return zoomIdentity;

      const init = (rawConfig as any).zoom?.initialScale;
      if (init && isFinite(init)) return zoomIdentity.scale(init);

      if (config.axisStrategy === "point") {
        const step = pointY.step?.() ?? height / Math.max(1, items.length - 1);
        const target = Math.max(
          1,
          (config.minLabelGap ?? 40) / Math.max(1, step)
        );
        return zoomIdentity.scale(
          Math.min(maxScale, Math.max(minScale, target))
        );
      } else {
        let minDy = Infinity;
        for (let i = 1; i < items.length; i++) {
          const dy = Math.abs(
            timeY(items[i].start) - timeY(items[i - 1].start)
          );
          if (dy > 0 && dy < minDy) minDy = dy;
        }
        if (!isFinite(minDy) || minDy === 0) return zoomIdentity;
        const targetGap = Math.max(
          config.cardHeight + (config.labelCardGap ?? 8),
          config.minLabelGap ?? 40
        );
        const desired = targetGap / minDy;
        return zoomIdentity.scale(
          Math.min(maxScale, Math.max(minScale, desired))
        );
      }
    }

    const initial = computeInitialTransform();
    if (allowInteraction) {
      (zb as any).transform(zoomSurface, initial);
    }
    draw(initial);
  }
}

import {
  select,
  scaleTime,
  scalePoint,
  axisBottom,
  extent,
  timeFormat,
  timeYear,
} from "d3";
import { zoom, zoomIdentity, ZoomBehavior, ZoomTransform } from "d3-zoom";
import {
  ITimeline,
  TimelineItem,
  ITimelineConfig,
} from "../core/interfaces";
import type { Selection } from "d3-selection";

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
  showTooltip?: boolean;
};

const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 420;

function measureDimension(
  element: HTMLElement,
  dimension: "width" | "height"
): number {
  const clientValue =
    dimension === "width" ? element.clientWidth : element.clientHeight;
  if (clientValue > 0) return clientValue;
  const rect = element.getBoundingClientRect();
  if (rect[dimension] > 0) {
    return rect[dimension];
  }
  return dimension === "width" ? DEFAULT_WIDTH : DEFAULT_HEIGHT;
}

export class SliderRenderer {
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
      labelYOffset: rawConfig.labelYOffset ?? -16,
      cardWidth: rawConfig.cardWidth ?? 140,
      cardHeight: rawConfig.cardHeight ?? 200,
      enforceUniformCardSize: rawConfig.enforceUniformCardSize ?? true,
      hideOverlappingLabels: rawConfig.hideOverlappingLabels ?? true,
      labelCardGap: rawConfig.labelCardGap ?? 8,
      mediaObjectFit: rawConfig.mediaObjectFit ?? "cover",
      showTooltip: (rawConfig as any).showTooltip ?? true,
      ...rawConfig,
    } as LocalConfig;

    const timeTickEveryYears = (rawConfig as any).timeTickEveryYears as
      | number
      | undefined;
    const pointTickStride = (rawConfig as any).pointTickStride as
      | number
      | undefined;

    const allowInteraction = rawConfig.interactive !== false;
    const containerSel = select<HTMLElement, unknown>(container);
    const zoomSurface = containerSel;
    const zoomEventFilter = (event: any) => {
      if (!allowInteraction) return false;
      if (!event) return true;
      if (event.type === "wheel") return true;
      const target = event.target as Element | null;
      if (!target) return true;
      if (target.closest(".tl-html-card")) return false;
      return !target.closest(".tl-nav button");

    };

    container.innerHTML = "";

    if (!timeline.items.length) {
      container.textContent = "No timeline items to display.";
      return;
    }

    const margin = { top: 10, right: 80, bottom: 50, left: 80 };
    const measuredWidth = measureDimension(container, "width");
    const measuredHeight = measureDimension(container, "height");
    const width = Math.max(120, measuredWidth - margin.left - margin.right);
    const height = Math.max(160, measuredHeight - margin.top - margin.bottom);
    const minScale = (rawConfig as any).zoom?.minScale ?? 1;
    const maxScale = (rawConfig as any).zoom?.maxScale ?? 80;

    // Root & SVG
    const root = containerSel;
    const svg = root
      .append<SVGSVGElement>("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
      .attr("xmlns:xhtml", "http://www.w3.org/1999/xhtml")
      .style("background", "var(--tl-background-color, #fff)");

    root.style("position", "relative");
    root.style("touch-action", allowInteraction ? "none" : "auto");

    function animateTo(tNew: ZoomTransform, ms = 600) {
      if (!allowInteraction) return;
      (zoomSurface as any)
        .transition()
        .duration(ms)
        .call((zb as any).transform, tNew);
    }

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
      (item) => !Number.isNaN(item.start.getTime())
    );
    if (!validItems.length) {
      container.textContent = "No timeline items with valid dates.";
      return;
    }

    const items = [...validItems].sort((a, b) => +a.start - +b.start);
    const dates = items.map((i) => i.start);
    const baselineY = rawConfig.baselineY ?? height / 2;

    // ------------------------------------------------------------------
    // Scales
    // ------------------------------------------------------------------
    const dateExtent = extent(dates) as [Date | undefined, Date | undefined];
    if (!dateExtent[0] || !dateExtent[1]) {
      throw new Error("Timeline requires at least one valid date.");
    }
    let [minDate, maxDate] = dateExtent as [Date, Date];
    if (minDate.getTime() === maxDate.getTime()) {
      const padding = 24 * 60 * 60 * 1000;
      minDate = new Date(minDate.getTime() - padding);
      maxDate = new Date(maxDate.getTime() + padding);
    }

    const timeX = scaleTime<number>()
      .domain([minDate, maxDate])
      .range([0, width]);

    const domPoint = items.map((_, i) => i.toString());
    const pointX = scalePoint<string>()
      .domain(domPoint)
      .range([0, width])
      .padding(0.5);

    const timeRescaled = (t: ZoomTransform) =>
      t.rescaleX(timeX) as any as (x: Date) => number;

    const getX = (d: TimelineItem, i: number, t: ZoomTransform) => {
      if (config.axisStrategy === "point") {
        const base = pointX(i.toString()) ?? 0;
        return t.applyX(base);
      } else {
        const zx = timeRescaled(t);
        return zx(d.start);
      }
    };

    // ------------------------------------------------------------------
    // Baseline
    // ------------------------------------------------------------------
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", baselineY)
      .attr("y2", baselineY)
      .attr("stroke", "var(--tl-axis-color, var(--tl-primary-color, #4285f4))")
      .attr("stroke-width", 2);

    const today = new Date();
    const todayMarker =
      config.showTodayLine !== false && config.axisStrategy === "time"
        ? g
            .append<SVGGElement>("g")
            .attr("class", "tl-today-line")
            .style("pointer-events", "none")
        : null;
    if (todayMarker) {
      todayMarker
        .append("line")
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "var(--tl-primary-color, #4285f4)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 4");
      todayMarker
        .append("text")
        .text("Today")
        .attr("y", 12)
        .attr("text-anchor", "middle")
        .attr("font-family", "var(--tl-font, system-ui)")
        .attr("font-size", "11px")
        .attr("fill", "var(--tl-primary-color, #4285f4)");
    }

    // ------------------------------------------------------------------
    // Axis (keeps working for time mode; we won't use it in point mode)
    // ------------------------------------------------------------------
    const axisG = g
      .append<SVGGElement>("g")
      .attr("transform", `translate(0,${height + 5})`);

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

    const updateTodayLinePosition = (t: ZoomTransform) => {
      if (!todayMarker) return;
      const zx = timeRescaled(t);
      const todayX = zx(today);
      todayMarker.attr("transform", `translate(${todayX},0)`);
    };

    // ------------------------------------------------------------------
    // Content groups (dots + labels + custom date ticks)
    // ------------------------------------------------------------------
    const contentG = g.append<SVGGElement>("g");
    const dotsG = contentG.append<SVGGElement>("g");
    const datesG = contentG
      .append<SVGGElement>("g")
      .attr("class", "tl-date-ticks");
    const cardLayer = select(container)
      .append("div")
      .attr("class", "tl-label-layer")
      .style("position", "absolute")
      .style("left", `${margin.left}px`)
      .style("top", `${margin.top}px`)
      .style("width", `${width}px`)
      .style("height", `${height}px`)
      .style("pointer-events", "none")
      .style("z-index", "2");

    // Dots
    const dots = dotsG
      .selectAll<SVGCircleElement, TimelineItem>("circle")
      .data(items)
      .enter()
      .append("circle")
      .attr("cy", baselineY)
      .attr("r", 6)
      .attr("fill", "var(--tl-accent-color, var(--tl-primary-color, #4285f4))")
      .style("cursor", (d) => (config.onItemClick ? "pointer" : "default"))
      .on("click", (event, d) => config.onItemClick?.(d, event as MouseEvent))
      .on("mouseover", (event, d) =>
        config.onItemHover?.(d, event as MouseEvent)
      );

    const labelNodes = cardLayer
      .selectAll<HTMLDivElement, TimelineItem>("div.tl-html-card")
      .data(items)
      .enter()
      .append("div")
      .attr("class", "tl-html-card")
      .style("position", "absolute")
      .style("pointer-events", allowInteraction ? "auto" : "none")
      .style("cursor", (d) => (config.onItemClick ? "pointer" : "default"))
      .style("border-radius", "var(--tl-card-radius, 10px)")
      .style("box-shadow", "var(--tl-card-shadow, none)")
      .style("overflow", "hidden")
      .style("background", "var(--tl-card-bg, transparent)")
      .style("border", "1px solid var(--tl-card-border, transparent)")
      .style("transition", "transform 120ms ease");

    labelNodes.on("click", (event, d) => config.onItemClick?.(d, event as MouseEvent));
    labelNodes.on("mouseover", (event, d) =>
      config.onItemHover?.(d, event as MouseEvent)
    );

    labelNodes.each(function (d) {
      const label = d.label;
      const el = this as HTMLDivElement;
      el.innerHTML = "";
      const w = config.enforceUniformCardSize
        ? config.cardWidth
        : (label as any)?.width ?? config.cardWidth;
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
      el.appendChild(content);

      if (!label || label.kind === "text") {
        content.style.padding = "8px 12px 8px 10px";
        content.style.textAlign = "center";
        content.style.fontFamily = "var(--tl-font, system-ui)";
        content.style.color = "var(--tl-text-color, #e6eefc)";
        content.style.lineHeight = "1.25";
        content.style.pointerEvents = "none";
        content.textContent = (label && label.text) || d.title;
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
        img.style.pointerEvents = "none";
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
        video.style.pointerEvents = "auto";
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

        const overlayTxtRaw =
          (d as any).overlayText ?? (d.overlayColor ? d.title : null);
        if (overlayTxtRaw) {
          const overlayText = document.createElement("div");
          overlayText.style.position = "absolute";
          overlayText.style.inset = "0";
          overlayText.style.display = "flex";
          overlayText.style.alignItems = "center";
          overlayText.style.justifyContent = "center";
          overlayText.style.padding = "10px";
          overlayText.style.textAlign = "center";
          overlayText.style.fontFamily = "var(--tl-font, system-ui)";
          overlayText.style.fontWeight = "var(--tl-overlay-text-weight, 600)";
          overlayText.style.letterSpacing = "0.2px";
          overlayText.style.lineHeight = "1.15";
          overlayText.style.color = "var(--tl-overlay-text-color, #fff)";
          overlayText.style.opacity = "var(--tl-overlay-text-opacity, 0.72)";
          overlayText.style.textShadow =
            "var(--tl-overlay-text-shadow, 0 1px 2px rgba(0,0,0,0.35))";
          overlayText.style.pointerEvents = "none";
          overlayText.textContent = String(overlayTxtRaw);
          el.appendChild(overlayText);
        }
      }
    });

    // ------------------------------------------------------------------
    // Custom Date Ticks (for point mode) — 1–1 with items/dots
    // ------------------------------------------------------------------
    const fmt = timeFormat("%Y-%m-%d");
    const tickHeight = 6;

    const dateTicks = datesG
      .selectAll<SVGGElement, TimelineItem>("g.tl-date-tick")
      .data(items)
      .enter()
      .append("g")
      .attr("class", "tl-date-tick");

    dateTicks
      .append("line")
      .attr("y1", baselineY)
      .attr("y2", baselineY + tickHeight)
      .attr("stroke", "var(--tl-axis-color, var(--tl-primary-color, #4285f4))")
      .attr("stroke-width", 1);

    dateTicks
      .append("text")
      .attr("class", "tl-date-text")
      .attr("y", baselineY + tickHeight + 11)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--tl-font, system-ui)")
      .attr("font-size", "10px")
      .attr("fill", "var(--tl-tick-color, var(--tl-primary-color, #4285f4))")
      .text((d) => fmt(d.start));

    // ------------------------------------------------------------------
    // Tooltip
    // ------------------------------------------------------------------
    type DivSel = Selection<HTMLDivElement, unknown, any, any>;
    let tooltip: DivSel | null = null;

    if (config.showTooltip !== false) {
      tooltip = root
        .append("div")
        .attr("class", "tl-tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("padding", "6px 10px")
        .style("border-radius", "4px")
        .style("width", "250px")
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
        .on("mouseover", (event: MouseEvent, d: TimelineItem) =>
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
    wireTooltip(dateTicks);

    // ------------------------------------------------------------------
    // Overlap helpers (ticks/labels)
    // ------------------------------------------------------------------
    function cullAxisTicks(minGap: number) {
      const ticks = axisG
        .selectAll<SVGGElement, unknown>(".tick")
        .nodes() as SVGGElement[];
      let lastX = -Infinity;
      ticks.forEach((t) => {
        const x =
          (t as any).transform?.baseVal?.[0]?.matrix?.e ??
          (t as any).getCTM?.()?.e ??
          0;
        if (x - lastX < minGap) {
          t.style.display = "none";
        } else {
          t.style.display = "";
          lastX = x;
        }
      });
    }

    function avoidDateOverlap(minGap: number, t: ZoomTransform) {
      let lastX = -Infinity;
      dateTicks.each(function (d, i) {
        const x = getX(d, i, t);
        const g = select(this);
        const txt = g.select<SVGTextElement>("text.tl-date-text");
        const ln = g.select<SVGLineElement>("line");
        if (x - lastX < minGap) {
          txt.style("display", "none");
          ln.style("display", "none");
        } else {
          txt.style("display", "");
          ln.style("display", "");
          lastX = x;
        }
      });
    }

    // ------------------------------------------------------------------
    // Nav arrows (prev/next event)
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

      const makeBtn = (side: "left" | "right") => {
        const btn = navWrap
          .append("button")
          .attr("type", "button")
          .attr("class", `tl-nav-${side}`)
          .style("position", "absolute")
          .style("top", "50%")
          .style(side, "8px")
          .style("transform", "translateY(-50%)")
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
          .text(side === "left" ? "‹" : "›");
        btn
          .on("mouseenter", () => btn.style("opacity", "1"))
          .on("mouseleave", () =>
            btn.style(
              "opacity",
              btn.attr("data-disabled") === "true" ? "0.35" : "0.85"
            )
          );
        return btn;
      };

      prevBtn = makeBtn("left");
      nextBtn = makeBtn("right");
      if (prevBtn && nextBtn) {
        prevBtn.on("click", () => {
          if (prevBtn && prevBtn.attr("data-disabled") !== "true") {
            centerOnIndex(nearestIndex(currTransform) - 1);
          }
        });
        nextBtn.on("click", () => {
          if (nextBtn && nextBtn.attr("data-disabled") !== "true") {
            centerOnIndex(nearestIndex(currTransform) + 1);
          }
        });
      }
    }

    let currTransform = zoomIdentity;

    function nearestIndex(t: ZoomTransform): number {
      let bestI = 0,
        bestDx = Infinity;
      for (let i = 0; i < items.length; i++) {
        const x = getX(items[i], i, t);
        const dx = Math.abs(x - width / 2);
        if (dx < bestDx) {
          bestDx = dx;
          bestI = i;
        }
      }
      return bestI;
    }

    function centerOnIndex(i: number) {
      i = Math.max(0, Math.min(items.length - 1, i));
      const base =
        config.axisStrategy === "point"
          ? pointX(i.toString()) ?? 0
          : timeX(items[i].start);

      const k = currTransform.k;
      const newX = width / 2 - k * base;
      const tNew = zoomIdentity.translate(newX, 0).scale(k);

      animateTo(tNew, 600);
    }

    function updateNavDisabled(t: ZoomTransform) {
      if (!prevBtn || !nextBtn) return;
      const i = nearestIndex(t);
      const atStart = i <= 0;
      const atEnd = i >= items.length - 1;

      prevBtn
        .attr("data-disabled", atStart ? "true" : "false")
        .style("opacity", atStart ? "0.35" : "0.85")
        .style("cursor", atStart ? "default" : "pointer")
        .style("display", rawConfig.axisStrategy === "time" ? "" : "none");

      nextBtn
        .attr("data-disabled", atEnd ? "true" : "false")
        .style("opacity", atEnd ? "0.35" : "0.85")
        .style("cursor", atEnd ? "default" : "pointer")
        .style("display", rawConfig.axisStrategy === "time" ? "" : "none");
    }

    // ------------------------------------------------------------------
    // Draw (with zoom transform)
    // ------------------------------------------------------------------
    const draw = (t: ZoomTransform) => {
      currTransform = t;
      updateNavDisabled(t);
      updateTodayLinePosition(t);
      dots.attr("cx", (d, i) => getX(d, i, t));

      labelNodes.each(function (d, i) {
        const el = this as HTMLDivElement;
        const w = Number(el.dataset.cardWidth) || config.cardWidth;
        const h = Number(el.dataset.cardHeight) || config.cardHeight;
        const x = getX(d, i, t) - w / 2;
        const y = baselineY + config.labelYOffset - h;
        const outOfBounds =
          x + w < 0 || x > width || y + h < 0 || y > height;
        el.dataset.outOfBounds = outOfBounds ? "true" : "false";
        if (outOfBounds) {
          el.style.display = "none";
          return;
        }
        select(el).style("transform", `translate(${x}px, ${y}px)`).style("display", "");
      });

      if (config.axisStrategy === "point") {
        axisG.style("display", "none");

        dateTicks.each(function (d, i) {
          const x = getX(d, i, t);
          select(this).attr("transform", `translate(${x},0)`);
        });

        if (config.hideOverlappingLabels) {
          if (pointTickStride && pointTickStride > 1) {
            dateTicks.each(function (_d, i) {
              const show = i % pointTickStride === 0;
              const g = select(this);
              g.select("text").style("display", show ? "" : "none");
              g.select("line").style("display", show ? "" : "none");
            });
          } else {
            avoidDateOverlap(config.minLabelGap, t);
          }
        } else {
          dateTicks.selectAll("text,line").style("display", "");
        }
      } else {
        dateTicks.selectAll("text,line").style("display", "none");
        axisG.style("display", "");
        const zx = timeRescaled(t);
        const ax = axisBottom(zx as any).tickFormat(
          timeFormat("%Y-%m-%d") as any
        );
        if (timeTickEveryYears && Number.isFinite(timeTickEveryYears)) {
          ax.ticks(timeYear.every(timeTickEveryYears));
        } else {
          ax.ticks(10);
        }
        axisG.call(ax as any);
        styleAxis();
        cullAxisTicks(config.minLabelGap);
      }

      if (config.hideOverlappingLabels) cullOverlappingCards(t);

      if (config.onRangeChange) {
        if (config.axisStrategy === "time") {
          const zxAny = t.rescaleX(timeX) as any;
          config.onRangeChange(zxAny.domain() as [Date, Date]);
        } else {
          const step = (pointX.step?.() ?? 1) * t.k;
          const leftIndex = Math.max(
            0,
            Math.floor((0 - t.x) / Math.max(1, step))
          );
          const rightIndex = Math.min(
            items.length - 1,
            Math.ceil((width - t.x) / Math.max(1, step))
          );
          const from = items[leftIndex]?.start ?? items[0].start;
          const to = items[rightIndex]?.start ?? items[items.length - 1].start;
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
    // Initial auto-zoom for readability
    // ------------------------------------------------------------------
    function computeInitialTransform(): ZoomTransform {
      if (items.length <= 1) return zoomIdentity;

      const init = (rawConfig as any).zoom?.initialScale;
      if (init && isFinite(init)) return zoomIdentity.scale(init);
      if (config.axisStrategy === "point") {
        const step = pointX.step?.() ?? width / Math.max(1, items.length - 1);
        const desired = Math.max(
          1,
          (config.minLabelGap ?? 40) / Math.max(1, step)
        );
        return zoomIdentity.scale(
          Math.min(maxScale, Math.max(minScale, desired))
        );
      } else {
        let minDx = Infinity;
        for (let i = 1; i < items.length; i++) {
          const dx = Math.abs(
            timeX(items[i].start) - timeX(items[i - 1].start)
          );
          if (dx > 0 && dx < minDx) minDx = dx;
        }
        if (!isFinite(minDx) || minDx === 0) return zoomIdentity;

        const targetGap = Math.max(
          config.cardWidth + (config.labelCardGap ?? 8),
          config.minLabelGap ?? 40
        );
        const desired = targetGap / minDx;
        return zoomIdentity.scale(
          Math.min(maxScale, Math.max(minScale, desired))
        );
      }
    }

    function cullOverlappingCards(t: ZoomTransform) {
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
          const x = getX(d, idx, t);
          const w =
            Number(htmlNode.dataset.cardWidth) || config.cardWidth;
          return { node: htmlNode, x, w };
        })
        .filter((v): v is { node: HTMLDivElement; x: number; w: number } => v !== null);

      data.sort((a, b) => a.x - b.x);
      let lastRight = -Infinity;
      const pad = config.labelCardGap;
      for (const { node, x, w } of data) {
        const left = x - w / 2;
        const right = x + w / 2;
        if (left < lastRight + pad) {
          node.style.display = "none";
        } else {
          node.style.display = "";
          lastRight = right;
        }
      }
    }

    const initial = computeInitialTransform();
    if (allowInteraction) {
      (zb as any).transform(zoomSurface, initial);
    } else {
      draw(initial);
    }
  }
}

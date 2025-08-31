import {
  select,
  scaleTime,
  scalePoint,
  axisBottom,
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

type AxisStrategy = "time" | "point";

type LocalConfig = ITimelineConfig & {
  axisStrategy: "time" | "point";
  minLabelGap: number;
  labelYOffset: number;
  cardWidth: number;
  cardHeight: number;
  enforceUniformCardSize: boolean;
  hideOverlappingLabels: boolean;
  labelCardGap: number;
};

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
      cardHeight: rawConfig.cardHeight ?? 200, // portrait (taller)
      enforceUniformCardSize: rawConfig.enforceUniformCardSize ?? true,
      hideOverlappingLabels: rawConfig.hideOverlappingLabels ?? true,
      labelCardGap: rawConfig.labelCardGap ?? 8,
      mediaObjectFit: rawConfig.mediaObjectFit ?? "cover",
      ...rawConfig,
    } as LocalConfig;

    container.innerHTML = "";

    const margin = { top: 10, right: 80, bottom: 50, left: 80 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    // Root & SVG
    const root = select<HTMLElement, unknown>(container);
    const svg = root
      .append<SVGSVGElement>("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "var(--tl-background-color, #fff)");

    // after creating `svg`
    const fullW = width + margin.left + margin.right;
    const fullH = height + margin.top + margin.bottom;

    // a group that sits behind all content
    const bg = svg.append("g").attr("class", "tl-canvas-bg");

    // apply background
    const bgCfg = rawConfig.canvasBackground;
    if (!bgCfg) {
      // default to theme background color variable
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
        .style("objectFit", fit === "contain" ? "contain" : "cover")
        .style("objectPosition", "center")
        .attr("src", bgCfg.src)
        .attr("playsinline", "true")
        .attr("muted", bgCfg.muted ?? true ? "" : null)
        .attr("loop", bgCfg.loop ?? true ? "" : null)
        .attr("autoplay", bgCfg.autoplay ?? true ? "" : null)
        .attr("controls", bgCfg.controls ?? false ? "" : null);
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
    const items = [...timeline.items].sort((a, b) => +a.start - +b.start);
    const dates = items.map((i) => i.start);
    const baselineY = rawConfig.baselineY ?? height / 2;

    // ------------------------------------------------------------------
    // Scales
    // ------------------------------------------------------------------
    const [minDate, maxDate] = extent(dates) as [Date, Date];

    // time scale (range is number)
    const timeX = scaleTime<number>()
      .domain([minDate, maxDate])
      .range([0, width]);

    // point scale for equal spacing
    const domPoint = items.map((_, i) => i.toString());
    const pointX = scalePoint<string>()
      .domain(domPoint)
      .range([0, width])
      .padding(0.5);

    // helper for using rescaleX in TS
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

    // ------------------------------------------------------------------
    // Axis
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

    // ------------------------------------------------------------------
    // Content groups (dots + labels)
    // ------------------------------------------------------------------
    const contentG = g.append<SVGGElement>("g");
    const dotsG = contentG.append<SVGGElement>("g");
    const labelsG = contentG.append<SVGGElement>("g");

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

    // Labels: create one <g> per item and fill with text/image/video
    const labelNodes = labelsG
      .selectAll<SVGGElement, TimelineItem>("g.tl-label")
      .data(items)
      .enter()
      .append("g")
      .attr("class", "tl-label")
      .style("cursor", (d) => (config.onItemClick ? "pointer" : "default"))
      .on("click", (event, d) => config.onItemClick?.(d, event as MouseEvent))
      .on("mouseover", (event, d) =>
        config.onItemHover?.(d, event as MouseEvent)
      );

    // For each label <g>, render the appropriate content
    labelNodes.each(function (d) {
      const label = d.label;
      const gThis = select(this);
      gThis.selectAll("*").remove();

      const w = config.enforceUniformCardSize
        ? config.cardWidth
        : (label as any)?.width ?? config.cardWidth;
      const h = config.enforceUniformCardSize
        ? config.cardHeight
        : (label as any)?.height ?? config.cardHeight;
      const yTop = baselineY + config.labelYOffset;

      // card wrapper, centered in draw() (translate(x,0))
      const cardG = gThis
        .append("g")
        .attr("class", "tl-card")
        .attr("transform", `translate(${-w / 2}, ${yTop - h})`);

      // card background shape (optional – keep if you like a base bg)
      cardG
        .append("rect")
        .attr("class", "tl-card-bg")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", h)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("fill", "var(--tl-card-bg, transparent)")
        .attr("stroke", "var(--tl-card-border, transparent)");

      // CONTENT (text / image / video) — your existing branches:
      if (!label || label.kind === "text") {
        const fo = cardG
          .append("foreignObject")
          .attr("class", "tl-label-text-card")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", w)
          .attr("height", h);

        fo.append("xhtml:div")
          .style("width", `${w}px`)
          .style("height", `${h}px`)
          .style("display", "flex")
          .style("align-items", "center") // ← kebab-case
          .style("justify-content", "center") // ← kebab-case
          .style("padding", "8px")
          .style("text-align", "center")
          .style("font-family", "var(--tl-font, system-ui)")
          .style("color", "var(--tl-text-color, #e6eefc)") // brighter default for dark bg
          .style("line-height", "1.25")
          .style("overflow", "hidden")
          .text((label && label.text) || d.title);
      } else if (label.kind === "image") {
        const perItemFit =
          label.fit ?? (config as any).mediaObjectFit ?? "cover";
        const preserve =
          perItemFit === "contain" ? "xMidYMid meet" : "xMidYMid slice";
        const zoom = label.zoom ?? 1;

        const mediaG = cardG
          .append("g")
          .attr("class", "tl-media")
          .attr(
            "transform",
            zoom !== 1
              ? `translate(${w / 2}, ${h / 2}) scale(${zoom}) translate(${
                  -w / 2
                }, ${-h / 2})`
              : null
          );

        mediaG
          .append("image")
          .attr("class", "tl-label-image")
          .attr("href", label.src)
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", w)
          .attr("height", h)
          .attr("preserveAspectRatio", preserve);
        if (label.alt) cardG.append("title").text(label.alt);
      } else if (label.kind === "video") {
        const perItemFit =
          label.fit ?? (config as any).mediaObjectFit ?? "cover";
        const zoom = label.zoom ?? 1;

        const fo = cardG
          .append("foreignObject")
          .attr("class", "tl-label-video")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", w)
          .attr("height", h);

        const wrap = fo
          .append("xhtml:div")
          .style("width", `${w}px`)
          .style("height", `${h}px`)
          .style("overflow", "hidden")
          .style("borderRadius", "var(--tl-card-radius, 10px)")
          .style("boxShadow", "var(--tl-card-shadow, none)")
          .style("pointerEvents", "auto")
          .style("transformOrigin", "center")
          .style("transform", zoom !== 1 ? `scale(${zoom})` : "none");

        const vid = wrap.append("xhtml:video");
        vid
          .style("width", "100%")
          .style("height", "100%")
          .style("objectFit", perItemFit === "contain" ? "contain" : "cover")
          .style("objectPosition", "center")
          .attr("src", label.src)
          .attr("playsinline", "true")
          .attr("muted", "")
          .attr("loop", "")
          .attr("autoplay", "")
          .attr("controls", null);
        if (label.poster) vid.attr("poster", label.poster);
        try {
          (vid.node() as HTMLVideoElement | null)?.play?.().catch(() => {});
        } catch {}
      }

      // 🔶 OVERLAY: draw LAST so it tints everything underneath
      if (d.overlayColor) {
        cardG
          .append("rect")
          .attr("class", "tl-card-overlay")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", w)
          .attr("height", h)
          .attr("rx", 10)
          .attr("ry", 10)
          .attr("fill", d.overlayColor) // e.g. 'rgba(0,0,0,0.35)' or '#00000080'
          .style("opacity", "0.4")
          .style("pointer-events", "none"); // don't block clicks/hover
      }

      // base transform used for this card
      const baseCardTransform = `translate(${-w / 2}, ${yTop - h})`;
      cardG.attr("transform", baseCardTransform);

      // helper to scale around the card's center
      const scaleUp = () =>
        cardG
          .transition()
          .duration(120)
          .attr(
            "transform",
            `${baseCardTransform} translate(${w / 2},${
              h / 2
            }) scale(1.07) translate(${-w / 2},${-h / 2})`
          );

      const scaleDown = () =>
        cardG.transition().duration(120).attr("transform", baseCardTransform);

      // attach to the label group (so the whole card reacts)
      gThis.on("mouseenter", scaleUp).on("mouseleave", scaleDown);
    });

    // ------------------------------------------------------------------
    // Tooltip (unchanged)
    // ------------------------------------------------------------------
    const tooltip = root
      .append("div")
      .attr("class", "tl-tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("padding", "6px 10px")
      .style("border-radius", "4px")
      .style("background", "var(--tl-tooltip-bg, rgba(0,0,0,0.7))")
      .style("color", "var(--tl-tooltip-color, #fff)")
      .style("font-family", "var(--tl-font, system-ui)")
      .style("font-size", "12px")
      .style("opacity", "0");

    function tooltipHTML(item: TimelineItem): string {
      const s = item.start.toLocaleDateString();
      const e = item.end ? ` – ${item.end.toLocaleDateString()}` : "";
      const d = item.description ? `<div>${item.description}</div>` : "";
      return `<strong>${item.title}</strong><div>${s}${e}</div>${d}`;
    }

    // Attach tooltip to dots and labels
    const hoverSel = (sel: any) => {
      sel
        .on("mouseover", (event: MouseEvent, d: TimelineItem) =>
          tooltip.html(tooltipHTML(d)).style("opacity", "1")
        )
        .on("mousemove", (event: MouseEvent) =>
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`)
        )
        .on("mouseout", () => tooltip.style("opacity", "0"));
    };
    hoverSel(dots);
    hoverSel(labelNodes);

    // ------------------------------------------------------------------
    // Overlap helpers (ticks/labels)
    // ------------------------------------------------------------------
    function cullAxisTicks(minGap: number) {
      const ticks = axisG
        .selectAll<SVGGElement, unknown>(".tick")
        .nodes() as SVGGElement[];
      let lastX = -Infinity;
      ticks.forEach((t) => {
        const x = t.transform?.baseVal?.[0]?.matrix?.e ?? t.getCTM()?.e ?? 0;
        if (x - lastX < minGap) {
          t.style.display = "none";
        } else {
          t.style.display = "";
          lastX = x;
        }
      });
    }

    function avoidLabelOverlap(minGap: number, t: ZoomTransform) {
      let lastX = -Infinity;
      labelNodes.each(function (d, i) {
        const node = select(this);
        const isText = !node
          .select<SVGTextElement>("text.tl-label-text")
          .empty();
        if (!isText) return;
        const x = getX(d, i, t);
        const el = node.select<SVGTextElement>("text.tl-label-text");
        if (x - lastX < minGap) el.style("display", "none");
        else {
          el.style("display", "");
          lastX = x;
        }
      });
    }

    // ------------------------------------------------------------------
    // Draw (with zoom transform)
    // ------------------------------------------------------------------
    const draw = (t: ZoomTransform) => {
      // dots
      dots.attr("cx", (d, i) => getX(d, i, t));

      // move label-groups to their x; children already centered inside
      labelNodes.each(function (d, i) {
        const x = getX(d, i, t);
        select(this)
          .attr("transform", `translate(${x},0)`)
          .style("display", ""); // reset visibility
      });

      // axis
      if (config.axisStrategy === "point") {
        const step =
          (pointX.step?.() ?? width / Math.max(1, items.length - 1)) * t.k;
        const stride = Math.max(
          1,
          Math.ceil(config.minLabelGap / Math.max(1, step))
        );
        const tickIdx = items
          .map((_, i) => i)
          .filter((i) => i % stride === 0)
          .map((i) => i.toString());
        axisG.call(
          axisBottom(
            scalePoint<string>()
              .domain(tickIdx)
              .range([t.applyX(0), t.applyX(width)])
          ).tickFormat((v: any) => {
            const i = Number(v);
            const d = items[i]?.start;
            return d ? timeFormat("%Y-%m-%d")(d as any) : "";
          }) as any
        );
      } else {
        const zx = timeRescaled(t);
        axisG.call(
          axisBottom(zx as any)
            .ticks(10)
            .tickFormat(timeFormat("%Y-%m-%d") as any)
        );
      }

      styleAxis();
      cullAxisTicks(config.minLabelGap);

      // NEW: card-level overlap culling
      if (config.hideOverlappingLabels) cullOverlappingCards(t);

      // range callback (unchanged)
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
    const zb: ZoomBehavior<SVGSVGElement, unknown> = zoom<
      SVGSVGElement,
      unknown
    >()
      .scaleExtent([1, 20])
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
        if (config.axisStrategy === "point") {
          contentG.attr("transform", `translate(${t.x},0) scale(${t.k},1)`);
          draw(t);
        } else {
          contentG.attr("transform", null);
          draw(t);
        }
      });

    svg.call(zb as any);

    // ------------------------------------------------------------------
    // Initial auto-zoom for readability
    // ------------------------------------------------------------------
    function computeInitialTransform(): ZoomTransform {
      if (items.length <= 1) return zoomIdentity;

      if (config.axisStrategy === "point") {
        const step = pointX.step?.() ?? width / Math.max(1, items.length - 1);
        const k = Math.max(
          1,
          Math.min(20, config.minLabelGap / Math.max(1, step))
        );
        return zoomIdentity.scale(k);
      } else {
        let minDx = Infinity;
        for (let i = 1; i < items.length; i++) {
          const x1 = timeX(items[i].start);
          const x0 = timeX(items[i - 1].start);
          const dx = Math.abs(x1 - x0);
          if (dx > 0 && dx < minDx) minDx = dx;
        }
        if (!isFinite(minDx) || minDx === 0) return zoomIdentity;
        const k = Math.max(1, Math.min(20, config.minLabelGap / minDx));
        return zoomIdentity.scale(k);
      }
    }

    function cullOverlappingCards(t: ZoomTransform) {
      // Collect {node, x, w} for each label group
      const data = labelNodes.nodes().map((node, idx) => {
        const sel = select(node);
        const d = sel.datum() as TimelineItem;
        const x = getX(d, idx, t);
        // width from our stored data-attr (uniform for all unless user opted out)
        const card = sel.select<SVGGElement>("g.tl-card");
        const wAttr = card.attr("data-card-width");
        const w = Number(wAttr) || config.cardWidth;
        return { node, x, w };
      });

      // Sort by center x
      data.sort((a, b) => a.x - b.x);

      // Sweep left->right, hide those that overlap previous visible card
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
    if (config.axisStrategy === "point") {
      contentG.attr("transform", `scale(${initial.k},1)`);
      (zb as any).transform(svg, initial);
      draw(initial);
    } else {
      (zb as any).transform(svg, initial);
      draw(initial);
    }
  }
}

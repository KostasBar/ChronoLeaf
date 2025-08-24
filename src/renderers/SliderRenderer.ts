// src/renderers/SliderRenderer.ts
import {
  select,
  scaleTime,
  scalePoint,
  axisBottom,
  extent,
  timeFormat,
  selectAll,
  ScaleTime,
} from "d3";
import { zoom, zoomIdentity, ZoomBehavior, ZoomTransform } from "d3-zoom";
import { ITimeline, TimelineItem, ITimelineConfig } from "../core/interfaces";

type AxisStrategy = "time" | "point";

type LocalConfig = ITimelineConfig & {
  /** 'time' = αναλογικά στον χρόνο (προεπιλογή), 'point' = ίσα βήματα */
  axisStrategy?: AxisStrategy;
  /** ελάχιστο κενό (px) ανάμεσα σε labels/ticks για να αποφεύγεται overlap */
  minLabelGap?: number;
};

export class SliderRenderer {
  static render(
    timeline: ITimeline,
    container: HTMLElement,
    rawConfig: ITimelineConfig
  ): void {
    // -------------------------------------------------------
    // Setup
    // -------------------------------------------------------
    const config = {
      axisStrategy: "time",
      minLabelGap: 40,
      ...rawConfig,
    } as LocalConfig;

    container.innerHTML = "";

    const margin = { top: 10, right: 30, bottom: 30, left: 10 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;
    const BASELINE_COLOR = timeline

    // Root selection
    const root = select<HTMLElement, unknown>(container);
    const svg = root
      .append<SVGSVGElement>("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
       .style('background', 'var(--tl-background-color, #fff)');

    // Main group
    const g = svg
      .append<SVGGElement>("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // -------------------------------------------------------
    // Data prep
    // -------------------------------------------------------
    const items = [...timeline.items].sort((a, b) => +a.start - +b.start);
    const dates = items.map((i) => i.start);

    // -------------------------------------------------------
    // Scales
    // -------------------------------------------------------
    const [minDate, maxDate] = extent(dates) as [Date, Date];

    // continuous time scale (πάντα διαθέσιμη)
    const timeX = scaleTime<number>()
      .domain([minDate, maxDate])
      .range([0, width]);

    // ordinal point scale (ίσα βήματα)
    const domPoint = items.map((_, i) => i.toString()); // indices ως domain
    const pointX = scalePoint<string>()
      .domain(domPoint)
      .range([0, width])
      .padding(0.5);

    // helper: το rescaleX γυρίζει τύπο χωρίς call signature στα typings.
    // Εμείς το κάνουμε “callable” (Date) => number.
    const timeRescaled = (t: ZoomTransform, s: ScaleTime<number, number>) =>
      t.rescaleX(s as any) as unknown as (x: Date) => number;

    // helper για X ανάλογα με το mode
    const getX = (d: TimelineItem, i: number, t: ZoomTransform) => {
      if (config.axisStrategy === "point") {
        const base = pointX(i.toString()) ?? 0;
        return t.applyX(base);
      } else {
        const zx = timeRescaled(t, timeX); // ⟵ αντί για t.rescaleX(timeX)
        return zx(d.start);
      }
    };

    // -------------------------------------------------------
    // Baseline
    // -------------------------------------------------------
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", height / 2)
      .attr("y2", height / 2)
      .attr('stroke', 'var(--tl-axis-color, var(--tl-primary-color, #4285f4))')
      .attr("stroke-width", 2);

    // -------------------------------------------------------
    // Axis
    // -------------------------------------------------------
    const axisG = g
      .append<SVGGElement>("g")
      .attr("transform", `translate(0,${height + 5})`);

    // κοινά styles
    const styleAxis = () => {
      axisG.attr("fill", null);
      axisG
        .select<SVGPathElement>(".domain")
        .attr('stroke', 'var(--tl-axis-color, var(--tl-primary-color, #4285f4))')
        .attr("fill", "none");
      axisG
        .selectAll<SVGLineElement, unknown>(".tick line")
        .attr('stroke', 'var(--tl-axis-color, var(--tl-primary-color, #4285f4))')
      axisG
        .selectAll<SVGTextElement, unknown>(".tick text")
        .attr('fill',   'var(--tl-tick-color, var(--tl-primary-color, #4285f4))')
        .attr("font-family", "var(--tl-font, system-ui)")
        .attr("font-size", "10px");
    };

    // -------------------------------------------------------
    // Dots & Labels (σε δικό τους group για εύκολο transform)
    // -------------------------------------------------------
    const contentG = g.append<SVGGElement>("g");
    const dotsG = contentG.append<SVGGElement>("g");
    const labelsG = contentG.append<SVGGElement>("g");

    const dots = dotsG
      .selectAll<SVGCircleElement, TimelineItem>("circle")
      .data(items)
      .enter()
      .append("circle")
      .attr("cy", height / 2)
      .attr("r", 6)
      .attr('fill', 'var(--tl-accent-color, var(--tl-primary-color, #4285f4))')
      .on("click", (event, d) => config.onItemClick?.(d, event as MouseEvent))
      .on("mouseover", (event, d) =>
        config.onItemHover?.(d, event as MouseEvent)
      );

    const labels = labelsG
      .selectAll<SVGTextElement, TimelineItem>("text")
      .data(items)
      .enter()
      .append("text")
      .attr("y", (_, i) => height / 2 - 10 - (i % 2) * 12) // εναλλάξ πάνω-κάτω λίγο
      .attr("text-anchor", "middle")
      .text((d) => d.title)
      .attr('fill', 'var(--tl-text-color, var(--tl-primary-color, #4285f4))')
      .attr("font-family", "var(--tl-font, system-ui)")
      .attr("font-size", "12px");

    // -------------------------------------------------------
    // Tooltip
    // -------------------------------------------------------
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

    dots
      .on("mouseover", (event, d) =>
        tooltip.html(tooltipHTML(d)).style("opacity", "1")
      )
      .on("mousemove", (event) =>
        tooltip
          .style("left", `${(event as MouseEvent).pageX + 10}px`)
          .style("top", `${(event as MouseEvent).pageY + 10}px`)
      )
      .on("mouseout", () => tooltip.style("opacity", "0"));

    // -------------------------------------------------------
    // Helpers για overlap/culling
    // -------------------------------------------------------
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

    function avoidLabelOverlap(minGap: number) {
      const nodes = labels.nodes();
      // παίρνουμε x από το attribute (που έχουμε ήδη θέσει)
      let lastX = -Infinity;
      for (const el of nodes) {
        const x = Number(el.getAttribute("x") || "0");
        if (x - lastX < minGap) {
          el.style.display = "none";
        } else {
          el.style.display = "";
          lastX = x;
        }
      }
    }

    // -------------------------------------------------------
    // Draw (με/χωρίς zoom transform)
    // -------------------------------------------------------
    const draw = (t: ZoomTransform) => {
      // θέση dots & labels
      dots.attr("cx", (d, i) => getX(d, i, t));
      labels.attr("x", (d, i) => getX(d, i, t));

      // axis update
      if (config.axisStrategy === "point") {
        // υπολογισμός “visible step” για ticks
        // πόσο απέχουν σε pixels τα points μετά το zoom;
        const step =
          (pointX.step?.() ?? width / Math.max(1, items.length - 1)) * t.k;

        // stride ώστε να πετυχαίνουμε min gap
        const stride = Math.max(1, Math.ceil(config.minLabelGap! / step));
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
        const zx = timeRescaled(t, timeX); // (Date) => number
        axisG.call(
          axisBottom(zx as any) // cast γιατί axisBottom θέλει AxisScale
            .ticks(10)
            .tickFormat(timeFormat("%Y-%m-%d") as any)
        );
      }

      styleAxis();
      cullAxisTicks(config.minLabelGap!);
      avoidLabelOverlap(config.minLabelGap!);

      // ενημέρωση range στον caller (best‑effort)
      if (config.onRangeChange) {
        if (config.axisStrategy === "time") {
          const zx = t.rescaleX(timeX) as any;
          config.onRangeChange(zx.domain() as [Date, Date]);
        } else {
          // εκτίμηση ορατών indices και map σε ημερομηνίες
          const leftIndex = Math.max(
            0,
            Math.floor((0 - t.x) / ((pointX.step?.() ?? 1) * t.k))
          );
          const rightIndex = Math.min(
            items.length - 1,
            Math.ceil((width - t.x) / ((pointX.step?.() ?? 1) * t.k))
          );
          const from = items[leftIndex]?.start ?? items[0].start;
          const to = items[rightIndex]?.start ?? items[items.length - 1].start;
          config.onRangeChange([from, to]);
        }
      }
    };

    // -------------------------------------------------------
    // Zoom/Pan
    // -------------------------------------------------------
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
        // στο 'point' δεν rescaleX—απλά μετακινούμε/μεγεθύνουμε το contentG
        if (config.axisStrategy === "point") {
          contentG.attr("transform", `translate(${t.x},0) scale(${t.k},1)`);
          draw(t);
        } else {
          contentG.attr("transform", null);
          draw(t);
        }
      });

    svg.call(zb as any);

    // -------------------------------------------------------
    // Auto‑zoom για αναγνωσιμότητα (min gap)
    // -------------------------------------------------------
    function computeInitialTransform(): ZoomTransform {
      if (items.length <= 1) return zoomIdentity;

      if (config.axisStrategy === "point") {
        const step = pointX.step?.() ?? width / Math.max(1, items.length - 1);
        const k = Math.max(1, Math.min(20, config.minLabelGap! / step));
        return zoomIdentity.scale(k);
      } else {
        let minDx = Infinity;
        for (let i = 1; i < items.length; i++) {
          const x1 = timeX(items[i].start); // number
          const x0 = timeX(items[i - 1].start); // number
          const dx = Math.abs(x1 - x0);
          if (dx > 0 && dx < minDx) minDx = dx;
        }
        if (!isFinite(minDx) || minDx === 0) return zoomIdentity;
        const k = Math.max(1, Math.min(20, config.minLabelGap! / minDx));
        return zoomIdentity.scale(k);
      }
    }

    const initial = computeInitialTransform();
    if (config.axisStrategy === "point") {
      // εφαρμόζουμε manual γιατί το contentG κάνει το οπτικό scaling
      contentG.attr("transform", `scale(${initial.k},1)`);
      (zb as any).transform(svg, initial);
      draw(initial);
    } else {
      (zb as any).transform(svg, initial);
      draw(initial);
    }
  }
}

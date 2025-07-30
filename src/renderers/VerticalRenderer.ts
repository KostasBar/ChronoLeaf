// src/renderers/VerticalRenderer.ts
import {
  select,
  scaleTime,
  axisLeft,
  extent,
  timeFormat
} from "d3";
import {
  zoom,
  zoomIdentity,
  ZoomBehavior,
  ZoomTransform
} from "d3-zoom";
import { ITimeline, TimelineItem, ITimelineConfig } from "../core/interfaces";

export class VerticalRenderer {
  /**
   * Render a zoomable vertical timeline: axis + baseline + dots + labels.
   */
  static render(
    timeline: ITimeline,
    container: HTMLElement,
    config: ITimelineConfig
  ): void {
    // 1. clear out any old content
    container.innerHTML = "";

    // 2. margins + inner-dimensions
    const margin = { top: 20, right: 10, bottom: 20, left: 60 };
    const innerWidth  = container.clientWidth  - margin.left - margin.right;
    const innerHeight = container.clientHeight - margin.top  - margin.bottom;

    // 3. build the <svg>
    const root = select<HTMLElement, unknown>(container);
    const svg = root
      .append<SVGSVGElement>("svg")
      .attr("width",  margin.left + innerWidth  + margin.right)
      .attr("height", margin.top  + innerHeight + margin.bottom);

    // 4. catch-all rectangle for zoom events (optional, you can attach zoom to svg directly)
    svg.append("rect")
      .attr("width",  margin.left + innerWidth  + margin.right)
      .attr("height", margin.top  + innerHeight + margin.bottom)
      .style("fill", "none")
      .style("pointer-events", "all");

    // 5. group shifted by margins
    const g = svg.append<SVGGElement>("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 6. time domain from your items
    const dates = timeline.items.map(i => i.start);
    const [minDate, maxDate] = extent(dates) as [Date, Date];
    const yScale = scaleTime()
      .domain([minDate, maxDate])
      .range([0, innerHeight]);

    // 7. optional today-line
    if (config.showTodayLine) {
      const ty = yScale(new Date());
      g.append("line")
        .attr("x1", 0).attr("x2", innerWidth)
        .attr("y1", ty).attr("y2", ty)
        .attr("stroke", "var(--tl-primary-color, steelblue)")
        .attr("stroke-dasharray", "4 2");
    }

    // 8. central baseline
    g.append("line")
      .attr("x1", innerWidth/2).attr("x2", innerWidth/2)
      .attr("y1", 0).            attr("y2", innerHeight)
      .attr("stroke", "var(--tl-primary-color, steelblue)")
      .attr("stroke-width", 2);

    // 9. left axis, showing every date
    const axisG = g.append<SVGGElement>("g")
      .call(
        axisLeft(yScale)
          .tickValues(dates)
          .tickFormat(timeFormat("%Y-%m-%d") as any)
      );

    // 10. clear the generated fill="none" and style your axis
    axisG.attr("fill", null);
    axisG.select<SVGPathElement>(".domain")
      .attr("stroke", "var(--tl-primary-color, steelblue)")
      .attr("fill",   "none");
    axisG.selectAll<SVGLineElement, TimelineItem>(".tick line")
      .attr("stroke", "var(--tl-primary-color, steelblue)");
    axisG.selectAll<SVGTextElement, TimelineItem>(".tick text")
      .attr("fill",        "var(--tl-primary-color, steelblue)")
      .attr("font-family", "var(--tl-font, sans-serif)")
      .attr("font-size",   "10px")
      .attr("dx",          "-8");  // nudge left so it sits in the 60px margin

    // 11. tooltip container
    const tooltip = root.append<HTMLDivElement>("div")
      .attr("class","tl-tooltip")
      .style("position","absolute")
      .style("pointer-events","none")
      .style("padding","6px 10px")
      .style("border-radius","4px")
      .style("background","var(--tl-tooltip-bg, rgba(0,0,0,0.7))")
      .style("color","var(--tl-tooltip-color, #fff)")
      .style("font-family","var(--tl-font, sans-serif)")
      .style("font-size","12px")
      .style("opacity","0");

    function tooltipHTML(item: TimelineItem) {
      const s = item.start.toLocaleDateString();
      const e = item.end ? ` – ${item.end.toLocaleDateString()}` : "";
      const d = item.description ? `<div>${item.description}</div>` : "";
      return `<strong>${item.title}</strong><div>${s}${e}</div>${d}`;
    }

    // 12. draw your events
    const eventsG = g.append<SVGGElement>("g")
      .selectAll<SVGGElement, TimelineItem>("g.event")
      .data(timeline.items)
      .enter()
      .append("g")
      .attr("class","event");

    eventsG.append("circle")
      .attr("cx", innerWidth/2)
      .attr("cy", d => yScale(d.start))
      .attr("r", 6)
      .attr("fill","var(--tl-primary-color, steelblue)")
      .on("click",   (e,d)=>config.onItemClick?.(d,e))
      .on("mouseover",(e,d)=>{
        config.onItemHover?.(d,e);
        tooltip.html(tooltipHTML(d)).style("opacity","1");
      })
      .on("mousemove", e=>tooltip
        .style("left",`${e.pageX+10}px`)
        .style("top", `${e.pageY+10}px`))
      .on("mouseout", ()=>tooltip.style("opacity","0"));

    eventsG.append("text")
      .attr("x", innerWidth/2 + 12)
      .attr("y", d => yScale(d.start)+4)
      .text(d => d.title)
      .attr("fill","var(--tl-primary-color, steelblue)")
      .attr("font-family","var(--tl-font, sans-serif)")
      .attr("font-size","12px");

    // 13. draw/redraw on zoom
    const draw = (t: ZoomTransform) => {
      const sy = t.rescaleY(yScale);

      // re‐render axis
      axisG.call(
        axisLeft(sy)
          .tickValues(dates)
          .tickFormat(timeFormat("%Y-%m-%d") as any)
      );
      axisG.selectAll<SVGTextElement, unknown>(".tick text")
        .attr("fill","var(--tl-primary-color, steelblue)");

      // re‐position circles + labels
      eventsG.selectAll<SVGCircleElement, TimelineItem>("circle")
        .attr("cy", d => sy(d.start));
      eventsG.selectAll<SVGTextElement, TimelineItem>("text")
        .attr("y",  d => sy(d.start)+4);

      // notify range-change
      config.onRangeChange?.(sy.domain() as [Date,Date]);
    };

    // 14. create zoom behavior (let TS infer its correct type)
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1,10])
      .translateExtent([[0,0],[innerWidth,innerHeight]])
      .extent([[0,0],[innerWidth,innerHeight]])
      .on("zoom", e => draw(e.transform));

    // 15. attach zoom to SVG
    svg.call(zoomBehavior);

    // 16. initialize at identity
    zoomBehavior.transform(svg, zoomIdentity);
    draw(zoomIdentity);
  }
}

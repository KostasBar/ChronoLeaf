// src/renderers/SliderRenderer.ts
import {
  select,
  scaleTime,
  axisBottom,
  extent,
  timeFormat
} from 'd3';
import { zoom, zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { ITimeline, TimelineItem, ITimelineConfig } from '../core/interfaces';

export class SliderRenderer {
  /**
   * Render a zoomable horizontal timeline with baseline, full-axis, and interactive dots.
   */
  static render(
    timeline: ITimeline,
    container: HTMLElement,
    config: ITimelineConfig
  ): void {
    // Clear container
    container.innerHTML = '';

    // Dimensions
    const margin = { top: 10, right: 10, bottom: 20, left: 10 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    // Root selection
    const root = select<HTMLElement, unknown>(container);
    const svg = root
      .append<SVGSVGElement>('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    // Main group
    const g = svg
      .append<SVGGElement>('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Compute domain from item starts
    const dates = timeline.items.map(item => item.start);
    const [minDate, maxDate] = extent(dates) as [Date, Date];
    const xScale = scaleTime().domain([minDate, maxDate]).range([0, width]);

    // Draw baseline
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', height / 2)
      .attr('y2', height / 2)
      .attr('stroke', 'var(--tl-primary-color, #4285f4)')
      .attr('stroke-width', 2);

    // Append axis group and render axis
    const axisG = g.append<SVGGElement>('g')
      .attr('transform', `translate(0,${height + 5})`)
      .call(
        axisBottom(xScale)
          .tickValues(dates)
          .tickFormat(timeFormat('%Y-%m-%d') as any)
      );

    // Remove inherited fill="none"
    axisG.attr('fill', null);

    // Style domain path
    axisG.select<SVGPathElement>('.domain')
      .attr('stroke', 'var(--tl-primary-color, #4285f4)')
      .attr('fill', 'none');

    // Style tick lines
    axisG.selectAll<SVGLineElement, unknown>('.tick line')
      .attr('stroke', 'var(--tl-primary-color, #4285f4)');

    // Style tick text
    axisG.selectAll<SVGTextElement, unknown>('.tick text')
      .attr('fill', 'var(--tl-primary-color, #4285f4)')
      .attr('font-family', 'var(--tl-font, system-ui)')
      .attr('font-size', '10px');

    // Draw event dots
    const dotsG = g.append<SVGGElement>('g');
    dotsG.selectAll<SVGCircleElement, TimelineItem>('circle')
      .data(timeline.items)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.start))
      .attr('cy', height / 2)
      .attr('r', 6)
      .attr('fill', 'var(--tl-primary-color, #4285f4)')
      .on('click', (event, d) => config.onItemClick?.(d, event))
      .on('mouseover', (event, d) => config.onItemHover?.(d, event));

    // Draw event labels
    const labelsG = g.append<SVGGElement>('g');
    labelsG.selectAll<SVGTextElement, TimelineItem>('text')
      .data(timeline.items)
      .enter()
      .append('text')
      .attr('x', d => xScale(d.start))
      .attr('y', height / 2 - 10)
      .attr('text-anchor', 'middle')
      .text(d => d.title)
      .attr('fill', 'var(--tl-primary-color, #4285f4)')
      .attr('font-family', 'var(--tl-font, system-ui)')
      .attr('font-size', '12px');

    // Tooltip container
    const tooltip = root.append('div')
      .attr('class', 'tl-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('padding', '6px 10px')
      .style('border-radius', '4px')
      .style('background', 'var(--tl-tooltip-bg, rgba(0,0,0,0.7))')
      .style('color', 'var(--tl-tooltip-color, #fff)')
      .style('font-family', 'var(--tl-font, system-ui)')
      .style('font-size', '12px')
      .style('opacity', '0');

    function tooltipHTML(item: TimelineItem): string {
      const s = item.start.toLocaleDateString();
      const e = item.end ? ` – ${item.end.toLocaleDateString()}` : '';
      const d = item.description ? `<div>${item.description}</div>` : '';
      return `<strong>${item.title}</strong><div>${s}${e}</div>${d}`;
    }

    dotsG.selectAll<SVGCircleElement, TimelineItem>('circle')
      .on('mouseover', (event, d) => tooltip.html(tooltipHTML(d)).style('opacity', '1'))
      .on('mousemove', event => tooltip.style('left', `${event.pageX+10}px`).style('top', `${event.pageY+10}px`))
      .on('mouseout', () => tooltip.style('opacity', '0'));

    // Zoom / redraw
    const draw = (transform: any) => {
      const zx = transform.rescaleX(xScale);
      axisG.call(
        axisBottom(zx)
          .tickValues(dates)
          .tickFormat(timeFormat('%Y-%m-%d') as any)
      );
      axisG.selectAll<SVGTextElement, unknown>('.tick text')
        .attr('fill', 'var(--tl-primary-color, #4285f4)');
      dotsG.selectAll<SVGCircleElement, unknown>('circle')
        .attr('cx', d => zx((d as TimelineItem).start));
      labelsG.selectAll<SVGTextElement, unknown>('text')
        .attr('x', d => zx((d as TimelineItem).start));
      config.onRangeChange?.(zx.domain() as [Date, Date]);
    };

    const zb: ZoomBehavior<SVGSVGElement, unknown> = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', e => draw(e.transform));

    svg.call(zb as any);
    zb.transform(svg as any, zoomIdentity);
    draw(zoomIdentity);
  }
}

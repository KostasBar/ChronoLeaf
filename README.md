# ChronoLeaf
ChronoLeaf turns CSV, JSON, XML, and TEI datasets into embeddable timelines backed by TypeScript contracts and pluggable parsers. It targets frontend engineers, data-visualization developers, and digital humanists who need reliable slider, vertical, or grid renderers without framework lock-in. Install the npm package, point it at your data, and ship a themeable timeline in minutes.

## Why ChronoLeaf
- **Parse anything** – Built-in CSV/JSON/XML/TEI parsers normalize media, metadata, and legacy fields, while `ParserFactory.register` lets you add custom formats.
- **Render anywhere** – Slider, Vertical, and Grid renderers share consistent config, CSS variables, and media handling so timelines feel native to your site.
- **Typed orchestration** – `Timeline`, `TimelineItem`, and `ITimelineConfig` typings keep IDEs honest and make it easy to wire callbacks or custom renderers.
- **Production-ready bundles** – Distributed as ESM, CJS, and UMD with `.d.ts` files, ready for Vite, Webpack, or direct `<script>` usage.

## Key Features
- Parser factory with `Timeline.fromCSV | fromJSON | fromXML | fromTEI | from`.
- D3-powered slider and vertical timelines plus a CSS-driven grid layout.
- Canvas backgrounds that accept solid colors, images, or looping videos with opacity, fit, and playback controls.
- Zoom, pan, overlap culling, today-line support, nav buttons, and HTML label cards with text/image/video content.
- Theme helpers that toggle light/dark presets or custom `ThemeConfig` objects via CSS variables.

## Installation
```bash
npm install chrono-leaf
# or
yarn add chrono-leaf
```

Import everything from the root:

```ts
import { Timeline, TimelineItem, ITimelineConfig } from 'chrono-leaf';
```

## Quick Start
```ts
import { Timeline } from 'chrono-leaf';
import events from './events.json'; // TimelineItem[] or compatible data

const timeline = Timeline.fromJSON(events, {
  mode: 'slider',         // 'slider' | 'vertical' | 'grid'
  axisStrategy: 'time',   // or 'point' for equally spaced events
  canvasBackground: {
    kind: 'video',
    src: '/media/nebula.mp4',
    fit: 'cover',
    autoplay: true,
    loop: true,
  },
  showTodayLine: true,
  onItemClick: (item) => console.log('Selected', item.title),
});

timeline.render(document.getElementById('timeline-root')!);
```

Need another format? Swap in `Timeline.fromCSV`, `fromXML`, `fromTEI`, or `Timeline.from(data, 'customFormat')` after registering a parser with `ParserFactory`.

## Data Formats & Parsing
- **CSV** – Uses PapaParse under the hood, supports label media columns, legacy background fields, and optional JSON metadata per row.
- **JSON** – Accepts plain objects/arrays and coerces date strings into `Date` instances with validation.
- **XML** – Expects `<item>` nodes with child fields, automatically resolving start/end dates and labels.
- **TEI** – Reads `<listEvent><event>` structures commonly found in digital humanities corpora.
- **Custom** – Implement the parser interface, call `ParserFactory.register('myFormat', parser)`, then load via `Timeline.from(data, 'myFormat')`.

Every parser returns a normalized `TimelineItem[]` with real `Date` objects, label descriptors (`text | image | video`), overlay colors, and metadata so renderers can behave consistently.

## Configuration & Theming
`ITimelineConfig` drives every renderer. Common options include:

- `mode`: `'slider' | 'vertical' | 'grid' | 'custom'`
- `axisStrategy`: `'time' | 'point'`
- Card options: `cardWidth`, `cardHeight`, `labelYOffset`, `labelCardGap`, `mediaObjectFit`, `enforceUniformCardSize`
- `canvasBackground`: `{ kind: 'color' | 'image' | 'video', ... }`
- `theme`: `'light' | 'dark' | ThemeConfig` (applies CSS variables like `--tl-primary-color`)
- `interactive`: `false` turns off zoom/pan but keeps layout responsive

See `src/core/interfaces.ts` for inline documentation on every field and ThemeConfig variable.

## Interactivity & Callbacks
- Zoom/pan powered by `d3-zoom`, with configurable min/max scale and automatic initial fit.
- Overlap culling keeps label cards legible, and optional today-line + nav buttons guide users along dense datasets.
- HTML label cards support hover scaling, tooltips, and media playback controls.
- Hooks: `onItemClick`, `onItemHover`, and `onRangeChange` let you sync analytics, selection state, or external UI.

## Development & Testing
```bash
npm install            # install dependencies
npm run dev            # Vite dev server using the examples playground
npm run build          # bundle to dist/ (ES/CJS/UMD + declarations)
npm run build:tsc      # type-check
npx vitest run         # jsdom-based specs, coverage ready
```

Edit `examples/` when iterating on datasets or renderer knobs, and run `npm run build` before publishing to refresh the bundles.

## Roadmap / Status
ChronoLeaf is approaching its first public release. Active work focuses on parser coverage, renderer polish, and documentation. Expect API additions to remain backward compatible—the `Timeline` orchestrator, parser factory, and renderer entry points are considered stable.

## Contributing
Issues and pull requests are welcome. Please:
- Follow Conventional Commits (`feat(renderer): add zoom easing`).
- Add or update Vitest specs for parser/renderer changes.
- Document new config flags or parser behaviors in `README.md` and `src/core/interfaces.ts`.

Open a discussion if you plan a large feature so we can keep the parser → timeline → renderer pipeline cohesive.

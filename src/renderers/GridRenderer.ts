// src/renderers/GridRenderer.ts
import { ITimeline, ITimelineConfig, TimelineItem } from "../core/interfaces";

/**
 * Premium, responsive, animated grid of timeline cards.
 * - Γυάλινο look, gradient hairline, hover lift
 * - Reveal-on-scroll (IntersectionObserver)
 * - Lazy εικόνες, αυτόματο play/pause video όταν είναι ορατά
 * - Keyboard navigation (←/→/↑/↓ + Enter)
 * - Year chip: πάνω στο media όταν υπάρχει, αλλιώς κρατάει χώρο στο header
 * - Overlay tint + optional overlayText
 * - Όλα themeable μέσω --tl-* CSS variables
 */
export class GridRenderer {
  static render(
    timeline: ITimeline,
    container: HTMLElement,
    config: ITimelineConfig
  ): void {
    container.innerHTML = "";

    // ---------------------------------------------
    // 1) Inject CSS μία φορά (scoped σε .tl-grid)
    // ---------------------------------------------
    const STYLE_ID = "tl-grid-modern-styles";
    if (!document.getElementById(STYLE_ID)) {
      const css = document.createElement("style");
      css.id = STYLE_ID;
      css.textContent = `
        /* ---------- Grid Container ---------- */
        .tl-grid {
          --grid-gap: 16px;
          --grid-pad: 16px;
          --grid-min: 220px;

          --card-radius: var(--tl-card-radius, 16px);
          --card-shadow: var(--tl-card-shadow, 0 10px 30px rgba(0,0,0,0.18));
          --card-bg: color-mix(in oklab, var(--tl-background-color, #0b1020) 75%, white 0%);
          --card-fg: var(--tl-text-color, #e6eefc);

          --glass-bg: color-mix(in oklab, var(--card-bg) 85%, white 0%);
          --accent: var(--tl-primary-color, #4f7fff);

          --chip-bg: color-mix(in oklab, var(--accent) 20%, black 80%);
          --chip-fg: color-mix(in oklab, var(--accent) 95%, white 0%);

          --lift-translate: -4px;
          --lift-scale: 1.02;

          display: grid;
          gap: var(--grid-gap);
          grid-template-columns: repeat(auto-fill, minmax(var(--grid-min), 1fr));
          padding: var(--grid-pad);
          background: var(--tl-background-color, #0b1020);
          border-radius: var(--tl-border-radius, 16px);
          font-family: var(--tl-font, system-ui);
          position: relative;
          overflow: hidden;
        }

        /* ---------- Card ---------- */
        .tl-card {
          position: relative;
          border-radius: var(--card-radius);
          background: var(--glass-bg);
          color: var(--card-fg);
          box-shadow: var(--card-shadow);
          overflow: clip;
          cursor: default;
          transform: translateY(8px);
          opacity: 0;
          transition: transform 420ms cubic-bezier(.2, .8, .2, 1), opacity 420ms ease, box-shadow 200ms ease, filter 200ms ease;
          outline: none;
          border: 1px solid rgba(255,255,255,0.08);
          position: relative;
          isolation: isolate;
        }
        .tl-card::before {
          content: "";
          position: absolute; inset: 0;
          border-radius: inherit;
          padding: 1px; /* gradient stroke */
          background: linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0));
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          pointer-events: none;
          z-index: 1;
        }
        .tl-card[data-revealed="true"] {
          transform: translateY(0);
          opacity: 1;
        }
        .tl-card:hover {
          transform: translateY(var(--lift-translate)) scale(var(--lift-scale));
          box-shadow: 0 14px 40px rgba(0,0,0,0.35);
          filter: saturate(1.05);
        }
        .tl-card:focus-visible {
          box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent) 50%, white 0%), var(--card-shadow);
        }
        .tl-card.clickable { cursor: pointer; }

        /* ---------- Media ---------- */
        .tl-media {
          position: relative;
          aspect-ratio: 16 / 9;
          width: 100%;
          overflow: clip;
        }
        .tl-media > img,
        .tl-media > video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transform-origin: center;
        }

        /* ---------- Overlay & Overlay text ---------- */
        .tl-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          mix-blend-mode: normal;
        }
        .tl-overlay-text {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 10px;
          text-align: center;
          font-weight: 600;
          letter-spacing: 0.2px;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.4);
          opacity: .85;
          pointer-events: none;
        }

        /* ---------- Year Chip ---------- */
        .tl-chip {
          position: absolute;
          top: 10px; left: 10px; /* αλλάζει εύκολα σε right: 10px αν θέλεις πάνω δεξιά */
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 12px;
          background: var(--chip-bg);
          color: var(--chip-fg);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.12);
          z-index: 2;
          pointer-events: none; /* να μην μπλοκάρει click στο media/header */
        }

        /* ---------- Header ---------- */
        .tl-head {
          padding: 12px 14px 8px;
          position: relative;
          z-index: 3;
        }
        .tl-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: .2px;
        }
        .tl-date {
          margin-top: 4px;
          font-size: 12px;
          opacity: .8;
        }

        /* Όταν ΔΕΝ υπάρχει media και το chip κάθεται στο card,
           κρατάμε χώρο στο header για να μη σκεπάζει τον τίτλο. */
        .tl-card[data-has-chip="true"] .tl-head {
          padding-left: 72px;
          min-height: 46px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* ---------- Body ---------- */
        .tl-body {
          padding: 12px 14px;
          font-size: 14px;
          line-height: 1.35;
          color: color-mix(in oklab, var(--card-fg) 90%, white 0%);
        }

        /* ---------- Subtle shine on hover ---------- */
        .tl-card::after {
          content: "";
          position: absolute;
          inset: -100% -50%;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.06) 45%, transparent 60%);
          transform: translateX(-30%) rotate(0.001deg);
          transition: transform 600ms ease;
          pointer-events: none;
        }
        .tl-card:hover::after {
          transform: translateX(30%) rotate(0.001deg);
        }
      `;
      document.head.appendChild(css);
    }

    // ---------------------------------------------
    // 2) Χτίσιμο Grid
    // ---------------------------------------------
    const grid = document.createElement("div");
    grid.className = "tl-grid";
    container.appendChild(grid);

    // Κατάσταση για keyboard navigation (focusable cards)
    const cards: HTMLElement[] = [];

    // Observer για reveal + autoplay/pause videos
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const card = e.target as HTMLElement;
          if (e.isIntersecting) {
            card.dataset.revealed = "true";
            const vid = card.querySelector("video") as HTMLVideoElement | null;
            if (vid) {
              try { vid.play().catch(() => {}); } catch {}
            }
          } else {
            const vid = card.querySelector("video") as HTMLVideoElement | null;
            if (vid) {
              try { vid.pause(); } catch {}
            }
          }
        }
      },
      { root: container, threshold: 0.15 }
    );

    // ---------------------------------------------
    // 3) Κάρτες
    // ---------------------------------------------
    for (const item of timeline.items) {
      const card = document.createElement("article");
      card.className = "tl-card";
      card.tabIndex = 0;
      if (config.onItemClick) card.classList.add("clickable");
      const head = document.createElement("header");
      head.className = "tl-head";
      head.innerHTML =
        `<h4 class="tl-title">${escapeHtml(item.title)}</h4>` +
        `<div class="tl-date">${escapeHtml(formatDateRange(item))}</div>`;
      card.appendChild(head);

      // Media / label
      let mediaWrap: HTMLDivElement | null = null;
      if (item.label) {
        mediaWrap = document.createElement("div");
        mediaWrap.className = "tl-media";

        if (item.label.kind === "image") {
          const img = document.createElement("img");
          img.loading = "lazy";
          img.decoding = "async";
          img.src = item.label.src;
          img.alt = item.label.alt ?? item.title;
          if (item.label.fit === "contain") img.style.objectFit = "contain";
          if (item.label.zoom && item.label.zoom !== 1) {
            img.style.transform = `scale(${item.label.zoom})`;
          }
          mediaWrap.appendChild(img);
        } else if (item.label.kind === "video") {
          const vid = document.createElement("video");
          vid.src = item.label.src;
          if (item.label.poster) vid.poster = item.label.poster;
          vid.muted = true;
          vid.loop = true;
          (vid as any).playsInline = true;
          vid.autoplay = false; 
          if (item.label.fit === "contain") vid.style.objectFit = "contain";
          if (item.label.zoom && item.label.zoom !== 1) {
            vid.style.transform = `scale(${item.label.zoom})`;
          }
          mediaWrap.appendChild(vid);
        } else if (item.label.kind === "text") {
          const textBlock = document.createElement("div");
          textBlock.style.display = "grid";
          textBlock.style.placeItems = "center";
          textBlock.style.padding = "18px";
          textBlock.style.textAlign = "center";
          textBlock.style.height = "100%";
          textBlock.style.fontWeight = "600";
          textBlock.textContent = item.label.text ?? item.title;
          mediaWrap.appendChild(textBlock);
        }

        // Overlay & overlay text
        if (item.overlayColor) {
          const ov = document.createElement("div");
          ov.className = "tl-overlay";
          ov.style.background = item.overlayColor;
          mediaWrap.appendChild(ov);

          const txtRaw = (item as any).overlayText ?? null;
          if (txtRaw) {
            const ovTxt = document.createElement("div");
            ovTxt.className = "tl-overlay-text";
            ovTxt.textContent = String(txtRaw);
            mediaWrap.appendChild(ovTxt);
          }
        }

        const chip = document.createElement("div");
        chip.className = "tl-chip";
        chip.textContent = String(item.start.getFullYear());
        mediaWrap.appendChild(chip);

        card.appendChild(mediaWrap);
      } else {
        const chip = document.createElement("div");
        chip.className = "tl-chip";
        chip.textContent = String(item.start.getFullYear());
        card.appendChild(chip);
        card.dataset.hasChip = "true";
      }

      // Περιγραφή (προαιρετικά)
      if (item.description) {
        const body = document.createElement("div");
        body.className = "tl-body";
        body.textContent = item.description;
        card.appendChild(body);
      }

      // Hooks
      if (config.onItemClick) {
        card.addEventListener("click", (ev) => config.onItemClick!(item, ev));
        card.style.cursor = "pointer";
      }
      if (config.onItemHover) {
        card.addEventListener("mouseenter", (ev) =>
          config.onItemHover!(item, ev)
        );
      }

      io.observe(card);
      cards.push(card);
      grid.appendChild(card);
    }

    // ---------------------------------------------
    // 4) Keyboard Navigation
    // ---------------------------------------------
    grid.addEventListener("keydown", (ev) => {
      const target = ev.target as HTMLElement;
      const idx = cards.indexOf(target);
      if (idx < 0) return;

      const cols = computeColumnCount(grid, cards);
      const key = ev.key;

      let nextIdx = idx;
      if (key === "ArrowRight") nextIdx = Math.min(cards.length - 1, idx + 1);
      else if (key === "ArrowLeft") nextIdx = Math.max(0, idx - 1);
      else if (key === "ArrowDown") nextIdx = Math.min(cards.length - 1, idx + cols);
      else if (key === "ArrowUp") nextIdx = Math.max(0, idx - cols);
      else if (key === "Enter") {
        target.click();
        return;
      } else {
        return;
      }

      const next = cards[nextIdx];
      if (next) {
        next.focus();
        next.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        ev.preventDefault();
      }
    });
  }
}

/* ------------------------------- utilities ------------------------------- */

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[m]!));
}

function formatDateRange(item: TimelineItem) {
  const s = item.start.toLocaleDateString();
  return item.end ? `${s} – ${item.end.toLocaleDateString()}` : s;
}

function computeColumnCount(grid: HTMLElement, items: HTMLElement[]) {
  if (items.length <= 1) return 1;
  const top = items[0].offsetTop;
  let count = 0;
  for (const el of items) {
    if (el.offsetTop !== top) break;
    count++;
  }
  return Math.max(1, count);
}

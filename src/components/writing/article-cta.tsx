"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ContactMe from "@/components/home/contact-me";

/**
 * Pixels scrolled from the top of the page before the floating bar slides in,
 * per kind of page. Project pages open with a long intro and screenshots, so
 * they wait longer.
 */
const SHOW_AFTER_PX = { article: 270, project: 280 } as const;

/**
 * How far along (0-1) the green progress line is at the moment the bar first
 * appears, per kind of page. From there it fills linearly and reaches 100% at
 * the end of the page body.
 */
const START_FILL = { article: 0.2, project: 0.15 } as const;

/**
 * Space above the bottom section's text, per kind of page (on top of the page's
 * own gap). Articles sit closer to their last paragraph than project pages.
 */
const SECTION_SPACING = { article: "mt-0 pt-12", project: "mt-6 pt-20" } as const;

/**
 * Call to action for long pages (articles and project pages), in two forms:
 *  - a floating bar that slides in once the reader has scrolled a set number
 *    of pixels, with a progress line along its top edge that tracks
 *    `targetId` (the page body);
 *  - a full section after the article that the bar hands off to: the bar
 *    slides away as the section scrolls into view.
 */
export default function ArticleCta({
  targetId,
  source = "article",
}: {
  /** Id of the element whose height defines "the page" for progress. */
  targetId: string;
  /** Prefix for click-tracking locations (`<source>_floating_bar`, `<source>_footer`). */
  source?: "article" | "project";
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [pastThreshold, setPastThreshold] = useState(false); // drives when the bar appears
  const [fill, setFill] = useState(0); // what the green line shows
  const [sectionInView, setSectionInView] = useState(false);
  // In-memory only: nothing is saved, so a reload or new visit shows the bar again.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        const showAt = SHOW_AFTER_PX[source];
        setPastThreshold(window.scrollY >= showAt);
        // The line starts at START_FILL when the bar appears and fills
        // linearly to 100% when the end of the body reaches mid-viewport.
        const endAt = window.scrollY + rect.bottom - window.innerHeight / 2;
        const span = Math.max(1, endAt - showAt);
        const t = Math.min(1, Math.max(0, (window.scrollY - showAt) / span));
        const startFill = START_FILL[source];
        setFill(startFill + (1 - startFill) * t);
      }
      const section = sectionRef.current;
      if (section) {
        // The bar yields as the section's top edge nears the bar.
        setSectionInView(
          section.getBoundingClientRect().top < window.innerHeight - 100
        );
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId, source]);

  const barVisible = !dismissed && pastThreshold && !sectionInView;

  return (
    <>
      <div
        data-no-index
        aria-hidden={!barVisible}
        className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 lg:left-[260px]"
      >
        <div
          className={`relative w-full max-w-[720px] overflow-hidden rounded-[28px] border border-white/[.12] bg-[#161616]/90 shadow-2xl shadow-black/50 backdrop-blur-md transition-all duration-300 ${
            barVisible
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          {/* Progress line: a top-only border that follows the bar's corner
              radius (it tapers off around the curves). The green one is
              clipped from the right to show progress. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[27px] border-t-2 border-white/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[27px] border-t-2 border-emerald-400/80"
            style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
          />
          <div className="flex items-center gap-3 pb-3 pl-6 pr-5 pt-4 sm:gap-6 sm:pb-4 sm:pl-8 sm:pr-8 sm:pt-5">
            <div className="min-w-0 flex-1 truncate text-sm font-medium text-white/80 sm:text-[15px]">
              Build with Gaurav
            </div>
            <ContactMe location={`${source}_floating_bar`} iconOnlyOnMobile />
            <button
              type="button"
              aria-label="Dismiss"
              tabIndex={barVisible ? 0 : -1}
              onClick={() => {
                setDismissed(true);
              }}
              className="ml-1 cursor-default rounded-md p-1 text-white/40 transition-colors duration-150 hover:text-white/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* No box: a green glow rising from the bottom edge of the page, with
          the text sitting on it. The negative margins cancel the page's side
          and bottom padding (px-5 md:px-10 lg:px-12, pb-18) so the glow runs to
          the edges; the radial fade keeps it from showing a hard side edge. */}
      <section
        ref={sectionRef}
        data-no-index
        className={`-mb-18 -mx-5 flex flex-col gap-6 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.2),transparent_65%)] px-5 pb-18 md:-mx-10 md:px-10 lg:-mx-12 lg:px-12 ${SECTION_SPACING[source]}`}
      >
        <div className="flex max-w-md flex-col gap-3">
          <h2 className="font-mono text-base font-medium uppercase tracking-[0.15em] text-emerald-400">
            Work with me
          </h2>
          <p className="text-sm leading-6 text-white/60">
            I build AI software products from zero to one.  Book a call or send me
            a message and tell me what you&apos;re working on.
          </p>
        </div>
        <ContactMe location={`${source}_footer`} />
      </section>
    </>
  );
}

"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ContactMe from "@/components/home/contact-me";

/** Reading progress (0-1) at which the floating bar slides in. */
const SHOW_AT = 0.01;
const HEADLINE = "Interested in building with Gaurav?";

/**
 * Article call to action in two forms:
 *  - a floating bar that slides in once the reader is 15% of the way through
 *    `targetId` (the article body), with a progress line along its top edge;
 *  - a full section after the article that the bar hands off to: the bar
 *    slides away as the section scrolls into view.
 */
export default function ArticleCta({ targetId }: { targetId: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0); // drives when the bar appears
  const [fill, setFill] = useState(0); // what the green line shows
  const [sectionInView, setSectionInView] = useState(false);
  // In-memory only: nothing is saved, so a reload or new visit shows the bar again.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Progress is measured at the middle of the viewport.
        const p = (window.innerHeight / 2 - rect.top) / rect.height;
        setProgress(Math.min(1, Math.max(0, p)));
        // The line counts the whole page above the end of the article, measured
        // at the bottom of the viewport, so it is already well along when the
        // bar appears and fills completely as the article ends.
        const pageY = window.scrollY + window.innerHeight;
        const endY = window.scrollY + rect.bottom;
        setFill(Math.min(1, Math.max(0, pageY / endY)));
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
  }, [targetId]);

  const barVisible = !dismissed && progress >= SHOW_AT && !sectionInView;

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
          <div className="absolute inset-x-0 top-0 h-0.5 bg-white/10">
            <div
              className="h-full bg-emerald-400/80"
              style={{ width: `${fill * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-3 pb-3 pl-6 pr-5 pt-4 sm:gap-6 sm:pb-4 sm:pl-8 sm:pr-8 sm:pt-5">
            <div className="min-w-0 flex-1 truncate text-sm font-medium text-white/80 sm:text-[15px]">
              Build with Gaurav
            </div>
            <ContactMe location="article_floating_bar" iconOnlyOnMobile />
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

      <section
        ref={sectionRef}
        data-no-index
        className="flex flex-col gap-6 rounded-2xl border border-emerald-400/25 bg-gradient-to-b from-emerald-600/10 to-ds-gray-100 p-6 sm:p-8"
      >
        <div className="flex flex-col gap-3">
          <div className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
            Work with me
          </div>
          <h2 className="font-[Inter] text-[28px] font-medium leading-9 -tracking-[0.4px] text-white">
            {HEADLINE}
          </h2>
          <p className="text-[15px] leading-6 text-white/60">
            I build AI software products from zero to one. Book a call or send me
            a message and tell me what you&apos;re working on.
          </p>
        </div>
        <ContactMe location="article_footer" />
      </section>
    </>
  );
}

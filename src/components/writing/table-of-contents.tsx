"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/headings";
import ShareButtons from "./share-buttons";

/** Offset (px) from the top of the viewport at which a heading counts as "current". */
const ACTIVE_OFFSET = 140;

/**
 * Floating "On this page" nav pinned to the right of the article. Only shown
 * when the viewport has room for it beside the article column.
 */
export default function TableOfContents({
  headings,
  url,
  title,
}: {
  headings: Heading[];
  url: string;
  title: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(
    headings[0]?.id ?? null
  );

  useEffect(() => {
    if (headings.length === 0) return;

    const update = () => {
      let current = headings[0].id;
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) current = id;
      }
      // At the very bottom the last section may never reach the offset.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) current = headings[headings.length - 1].id;
      setActiveId(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    // Absolutely positioned against the article's right edge (the parent must be
    // `relative`), with a sticky inner panel so it follows the reader.
    <aside
      aria-label="Table of contents"
      className="absolute bottom-0 left-full top-0 ml-2 hidden w-48 min-[1500px]:block"
    >
      <div className="sticky top-24 flex max-h-[calc(100vh-8rem)] flex-col gap-6 overflow-y-auto">
      <nav className="flex flex-col gap-3">
        <div className="text-xs font-medium uppercase tracking-wider text-white/40">
          On this page
        </div>
        <ul className="flex flex-col gap-0.5 border-l border-white/10">
          {headings.map((heading) => {
            const active = heading.id === activeId;
            return (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(heading.id)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    history.replaceState(null, "", `#${heading.id}`);
                  }}
                  className={`-ml-px block border-l py-1 outline-none focus-visible:text-white text-[13px] leading-[18px] transition-colors duration-150 ${
                    heading.level === 3 ? "pl-6" : "pl-3"
                  } ${
                    active
                      ? "border-white text-white"
                      : "border-transparent text-white/50 hover:text-white/90"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex flex-col gap-3">
        <div className="text-xs font-medium uppercase tracking-wider text-white/40">
          Share
        </div>
        <ShareButtons url={url} title={title} />
      </div>
      </div>
    </aside>
  );
}

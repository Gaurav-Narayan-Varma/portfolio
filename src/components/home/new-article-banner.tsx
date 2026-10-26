import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SHOW_WRITING } from "@/lib/site";
import {
  formatArticleDate,
  getInternalArticles,
  stripInlineMarkdown,
} from "@/lib/writing";

/** How long after publishing the newest article keeps its banner. */
const BANNER_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Slim announcement bar at the top of the home page for the newest article.
 * It's automatic: it appears for BANNER_DAYS after the article's `date` and
 * then disappears. The home page revalidates hourly (`revalidate` in
 * app/page.tsx), so it clears within about an hour of the window ending,
 * with no deploy needed.
 */
export default function NewArticleBanner() {
  if (!SHOW_WRITING) return null;

  const latest = getInternalArticles()[0];
  if (!latest) return null;

  const ageMs = Date.now() - new Date(`${latest.date}T00:00:00Z`).getTime();
  if (ageMs > BANNER_DAYS * DAY_MS) return null;

  const title = stripInlineMarkdown(latest.title);

  return (
    <Link
      data-no-index // temporary announcement, not something GauravGPT should learn
      href={`/writing/${latest.slug}`}
      className="cursor-default group flex w-full items-center justify-start gap-2.5 border-b border-emerald-400/20 bg-gradient-to-r from-emerald-600/15 via-teal-600/12 to-emerald-600/15 px-5 py-2.5 text-[13px] font-medium text-white/80 transition-colors duration-150 hover:from-emerald-600/25 hover:via-teal-600/20 hover:to-emerald-600/25 hover:text-white sm:justify-center sm:gap-3 sm:py-2.5 sm:text-sm"
    >
      <span className="shrink-0 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-xs font-medium text-white">
        New article
      </span>
      {/* Phones: one line, scrolling so the whole title can be read */}
      <span className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6px,black_calc(100%-14px),transparent)] sm:hidden">
        <span
          className="animate-banner-marquee flex w-max whitespace-nowrap"
          style={{ animationDuration: `${Math.max(8, title.length * 0.28)}s` }}
        >
          <span className="pr-10">{title}</span>
          <span aria-hidden className="pr-10">
            {title}
          </span>
        </span>
      </span>
      <span className="hidden min-w-0 truncate sm:block">{title}</span>
      {/* Absolute date, not "3 days ago": the page is cached and only
          refreshed hourly, so a relative age would be stale. */}
      <time
        dateTime={latest.date}
        className="hidden shrink-0 text-white/60 sm:inline"
      >
        <span aria-hidden className="mr-3">·</span>
        {formatArticleDate(latest.date)}
      </time>
      <ArrowRight className="h-4 w-4 shrink-0 text-white/70 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-white" />
    </Link>
  );
}

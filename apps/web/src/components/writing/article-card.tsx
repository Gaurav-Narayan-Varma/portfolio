import Link from "next/link";
import { formatArticleDate, type ArticleMeta } from "@/lib/writing";

/** Shown when an article has no `image` in its frontmatter. */
function CoverPlaceholder({ title }: { title: string }) {
  return (
    <div className="relative flex h-full w-full items-end bg-gradient-to-br from-ds-gray-400 via-ds-gray-200 to-ds-gray-100 p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.08),transparent_55%)]" />
      <span className="relative line-clamp-2 text-xl font-medium leading-7 text-white/25 -tracking-[0.3px] font-[Inter]">
        {title}
      </span>
    </div>
  );
}

export default function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <Link
      href={`/writing/${article.slug}`}
      className="cursor-default flex flex-col rounded-lg border border-ds-gray-900 overflow-hidden group"
    >
      <div className="aspect-video overflow-hidden">
        <div className="h-full w-full origin-center scale-105 transition-transform duration-300 group-hover:scale-110">
          {article.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <CoverPlaceholder title={article.title} />
          )}
        </div>
      </div>
      <div className="flex flex-1 items-start justify-between gap-4 bg-ds-gray-100 px-4 py-4.5 transition-colors duration-150 group-hover:bg-ds-gray-800">
        <div className="min-w-0">
          <div className="text-[15px] font-medium leading-[26.25px] -tracking-[0.15px] text-white">
            {article.title}
          </div>
          <div className="text-sm font-medium leading-[21px] -tracking-[0.14px] text-white/40">
            {formatArticleDate(article.date)}
          </div>
        </div>
        <span className="mt-0.5 shrink-0 rounded-md border border-ds-gray-900 bg-ds-gray-500/60 px-2 py-0.5 text-xs font-medium text-white/50">
          {article.category}
        </span>
      </div>
    </Link>
  );
}

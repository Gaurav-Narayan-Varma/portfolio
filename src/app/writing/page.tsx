import ArticleCard from "@/components/writing/article-card";
import { notFound } from "next/navigation";
import { SHOW_WRITING, pageMetadata } from "@/lib/site";
import { getAllArticles } from "@/lib/writing";

export const metadata = pageMetadata({
  title: "Writing",
  description:
    "Articles and thoughts from Gaurav Varma on building products, engineering and working with AI.",
  path: "/writing",
});

export default function Writing() {
  if (!SHOW_WRITING) notFound();
  const articles = getAllArticles();

  return (
    <div className="animate-fade-in px-5 md:px-10 lg:px-12 pt-[58px] lg:pt-18 pb-18 flex flex-col w-full max-w-[1200px] gap-14">
      <div className="flex flex-col gap-3">
        <h1 className="page-title">Writing</h1>
        <p className="page-subtitle">
          Written 100% by me.
        </p>
      </div>

      {articles.length === 0 ? (
        <p className="description-text">Nothing published yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

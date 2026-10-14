import { ArrowLeft, Play } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleMarkdown, { InlineMarkdown } from "@/components/writing/article-markdown";
import HorizontalRule from "@/components/projects/horizontal-rule";
import { SITE_NAME, SITE_URL, pageMetadata } from "@/lib/site";
import {
  SHOW_CATEGORIES,
  formatArticleDate,
  getArticle,
  getInternalArticles,
  stripInlineMarkdown,
} from "@/lib/writing";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getInternalArticles().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const base = pageMetadata({
    title: article.title,
    description: stripInlineMarkdown(article.description),
    path: `/writing/${slug}`,
  });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: article.date,
      authors: [SITE_NAME],
    },
  };
}

export default async function Article({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: stripInlineMarkdown(article.description),
    datePublished: article.date,
    url: `${SITE_URL}/writing/${slug}`,
    author: { "@type": "Person", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <article className="animate-fade-in px-5 md:px-10 lg:px-12 pt-[58px] lg:pt-18 pb-18 flex flex-col w-full max-w-[800px] gap-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link
        href="/writing"
        className="cursor-default flex w-fit items-center gap-2 text-sm font-medium text-white/50 hover:text-white/90 transition-colors duration-150"
      >
        <ArrowLeft className="w-4 h-4" />
        All writing
      </Link>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-white/40">
          {SHOW_CATEGORIES && (
            <span className="rounded-md border border-ds-gray-900 bg-ds-gray-100 px-2 py-0.5 text-xs text-white/60">
              {article.category}
            </span>
          )}
          <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
          <span>·</span>
          <span>{article.readingTimeMinutes} min read</span>
          {article.proof && (
            <a
              href={article.proof}
              target="_blank"
              rel="noopener noreferrer"
              title="Watch the unedited recording of this article being written"
              className="cursor-default flex items-center gap-1.5 rounded-full border border-ds-gray-900 bg-ds-gray-100 py-0.5 pl-2 pr-2.5 text-xs text-white/70 transition-colors duration-150 hover:bg-ds-gray-800 hover:text-white"
            >
              <Play className="h-2.5 w-2.5 fill-current" />
              Written live
            </a>
          )}
        </div>
        <h1 className="page-title !text-[34px] !leading-[42px]">
          {article.title}
        </h1>
        <p className="page-subtitle">
          <InlineMarkdown>{article.description}</InlineMarkdown>
        </p>
      </header>

      {article.image && (
        <figure className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image}
            alt={article.imageCaption ?? article.title}
            className="w-full rounded-lg border border-ds-gray-900 object-cover aspect-video"
          />
          {article.imageCaption && (
            <figcaption className="caption-text">
              {article.imageCaption}
            </figcaption>
          )}
        </figure>
      )}

      <HorizontalRule />

      <ArticleMarkdown>{article.content}</ArticleMarkdown>
    </article>
  );
}

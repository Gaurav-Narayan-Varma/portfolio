import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/** Long-form typography for articles (server component, no client JS). */
const components: Components = {
  h1: ({ children }) => (
    <h2 className="mb-4 mt-12 text-2xl font-medium text-white -tracking-[0.5px] font-[Inter] first:mt-0">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="mb-4 mt-12 text-2xl font-medium text-white -tracking-[0.5px] font-[Inter] first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-3 mt-9 text-lg font-medium text-white -tracking-[0.2px] font-[Inter] first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="my-5 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-5 list-disc space-y-2 pl-6 marker:text-white/40">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-5 list-decimal space-y-2 pl-6 marker:text-white/40">
      {children}
    </ol>
  ),
  a: ({ children, href }) => {
    const className = "hyperlink";
    if (href?.startsWith("/")) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  },
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-white/20 pl-5 italic text-white/70">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-white/[.08]" />,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : undefined}
      alt={alt ?? ""}
      className="my-8 w-full rounded-lg border border-ds-gray-900"
    />
  ),
  code: ({ children, className }) => (
    <code
      className={`rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-white/90 ${className ?? ""}`}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-lg border border-ds-gray-900 bg-ds-gray-100 p-4 text-sm leading-6 [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-white/10 bg-white/5 px-3 py-2 font-medium text-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-white/5 px-3 py-2">{children}</td>
  ),
};

export default function ArticleMarkdown({ children }: { children: string }) {
  return (
    <div className="description-text !text-[17px] !leading-8 !text-white/70">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

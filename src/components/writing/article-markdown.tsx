import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { extractHeadings } from "@/lib/headings";
import ZoomableImage from "./zoomable-image";

/** Long-form typography for articles (server component; images are client-side for zoom). */
const components: Components = {
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
    <ZoomableImage
      src={typeof src === "string" ? src : undefined}
      alt={alt ?? ""}
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

type MdNode = { type: string; value?: string; children?: MdNode[] };

/**
 * HTML collapses runs of spaces, so "Hello.   World" renders with one space.
 * This turns every extra space in a run into a non-breaking space (the first
 * stays a normal space so lines can still wrap). Code is left untouched.
 */
function remarkPreserveSpaces() {
  const walk = (node: MdNode) => {
    if (node.type === "code" || node.type === "inlineCode") return;
    if (node.type === "text" && node.value) {
      node.value = node.value.replace(
        / {2,}/g,
        (spaces) => " " + "\u00a0".repeat(spaces.length - 1)
      );
    }
    node.children?.forEach(walk);
  };
  return (tree: MdNode) => walk(tree);
}

/** Inline-only markdown (italic, bold, code) for short text like the description. */
export function InlineMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkPreserveSpaces]}
      allowedElements={["p", "em", "strong", "code"]}
      unwrapDisallowed
      components={{
        p: ({ children }) => <>{children}</>,
        em: ({ children }) => <em className="italic">{children}</em>,
        strong: ({ children }) => (
          <strong className="font-semibold text-white/80">{children}</strong>
        ),
        code: ({ children }) => (
          <code className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em]">
            {children}
          </code>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

/**
 * Headings get ids from `extractHeadings` so the table of contents can link to
 * them. They render in document order, so we hand the ids out in that order.
 */
function headingComponents(ids: string[]): Components {
  let index = 0;
  const nextId = () => ids[index++];
  const h2 = ({ children }: { children?: React.ReactNode }) => (
    <h2
      id={nextId()}
      className="mb-4 mt-12 scroll-mt-24 text-2xl font-medium text-white -tracking-[0.5px] font-[Inter] first:mt-0"
    >
      {children}
    </h2>
  );
  return {
    h1: h2,
    h2,
    h3: ({ children }) => (
      <h3
        id={nextId()}
        className="mb-3 mt-9 scroll-mt-24 text-lg font-medium text-white -tracking-[0.2px] font-[Inter] first:mt-0"
      >
        {children}
      </h3>
    ),
  };
}

export default function ArticleMarkdown({ children }: { children: string }) {
  const ids = extractHeadings(children).map((heading) => heading.id);
  return (
    <div className="description-text !text-[17px] !leading-8 !text-white/70">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkPreserveSpaces]}
        components={{ ...components, ...headingComponents(ids) }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

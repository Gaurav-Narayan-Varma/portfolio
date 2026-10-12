"use client";

import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => (
    <h1 className="mb-3 mt-6 text-xl font-semibold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-6 text-lg font-semibold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 text-base font-semibold first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-white/40">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1.5 pl-6 marker:text-white/40">
      {children}
    </ol>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#8ab4f8] underline-offset-2 hover:underline"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-white/20 pl-4 text-white/70">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-5 border-white/10" />,
  code: ({ children, className }) => (
    <code
      className={`rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] ${className ?? ""}`}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-2xl bg-[#1e1f20] p-4 text-sm leading-6 [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-white/10 bg-white/5 px-3 py-2 font-medium">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-white/5 px-3 py-2 last:border-b-0">
      {children}
    </td>
  ),
};

export const Markdown = memo(function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
});

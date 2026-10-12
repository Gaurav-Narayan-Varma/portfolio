import { RESUME_PATH } from "@/constants/resume";
import { cn } from "@/lib/utils";
import { FileText, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** Tells visitors exactly what GauravGPT knows: the site and the resume PDF. */
export function ContextSources({
  className,
  align = "center",
}: {
  className?: string;
  align?: "center" | "start";
}) {
  const chip =
    "flex items-center gap-1 sm:gap-1.5 rounded-full px-1.5 sm:px-2.5 py-1 whitespace-nowrap text-white/70 transition-colors hover:bg-white/10 hover:text-white";

  return (
    <div
      className={cn(
        "flex flex-col gap-1 text-xs text-white/40",
        align === "center" ? "items-center" : "items-start",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-nowrap sm:flex-wrap items-center gap-0.5 sm:gap-1",
          align === "center" ? "justify-center" : "justify-start"
        )}
      >
        <span className="whitespace-nowrap">
          <span className="sm:hidden">Based on</span>
          <span className="hidden sm:inline">Answers are based on</span>
        </span>
        <Link href="/" className={chip}>
          <Globe className="size-3.5" />
          Portfolio<span className="hidden sm:inline"> site</span>
        </Link>
        <a
          href={RESUME_PATH}
          target="_blank"
          rel="noopener noreferrer"
          className={chip}
          data-track="resume_downloaded"
          data-track-location="chat_sources"
        >
          <FileText className="size-3.5" />
          Resume<span className="hidden sm:inline"> (PDF)</span>
        </a>
        <span aria-hidden className="hidden sm:inline px-1">
          ·
        </span>
        <a
          href="https://www.pinecone.io"
          target="_blank"
          rel="noopener noreferrer"
          title="Relevant passages are retrieved with Pinecone vector search"
          className={chip}
        >
          <Image
            src="/logos/pinecone-logo.png"
            alt=""
            width={16}
            height={16}
            className="size-4 rounded-[4px]"
          />
          <span className="hidden sm:inline">Using </span>Pinecone
        </a>
      </div>
    </div>
  );
}

import { ExternalLink } from "lucide-react";

export default function SectionOverview({
  title,
  subTitle1,
  subTitle2,
  paragraph1,
  paragraph2,
  paragraph3,
  link,
  linkLabel = "View codebase",
}: {
  title: string;
  subTitle1?: string;
  subTitle2?: string;
  paragraph1: string;
  paragraph2?: string;
  paragraph3?: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-2.5">
      <div className="flex items-end md:items-start md:flex-col gap-3 md:w-1/2 justify-between">
        <div className="flex flex-col gap-3">
          <div className="page-title">{title}</div>
          {subTitle1 && (
            <div className="text-white/60 text-sm font-medium -tracking-[0.14] leading-[24.5px]">
              {subTitle1} <br /> {subTitle2}
            </div>
          )}
        </div>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-white/60 text-sm font-medium -tracking-[0.14] leading-[24.5px] flex items-center gap-1 hover:text-white transition-all duration-300"
          >
            {linkLabel}
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
      <div className="md:w-1/2 description-text">
        {paragraph1}
        {paragraph2 && (
          <>
            <br />
            <br />
            {paragraph2}
          </>
        )}
        {paragraph3 && (
          <>
            <br />
            <br />
            {paragraph3}
          </>
        )}
      </div>
    </div>
  );
}

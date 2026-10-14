import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Project } from "@/types/projectTypes";
import cx from "clsx";
import Link from "next/link";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="cursor-default flex flex-col rounded-lg border border-ds-gray-900 overflow-hidden group"
    >
      <div className="aspect-auto overflow-hidden">
        <div className="transition-transform duration-300 scale-105 group-hover:scale-110 h-full w-full origin-center">
          <img
            src={project.overviewImage}
            alt={`${project.name} Overview`}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="bg-ds-gray-100 group-hover:bg-ds-gray-800 transition-colors duration-150 flex-1">
        <div className="px-4 py-4.5 h-[83.25px] flex items-center gap-4">
          <img
            src={project.logoImage}
            alt={`${project.name} Logo`}
            className="w-10.5 h-10.5 rounded-lg"
          />
          <div>
            <div className="leading-[26.25px] -tracking-[0.15px] text-[15px] font-medium text-white">
              {project.name}
            </div>
            <div className="leading-[21px] -tracking-[0.14px] text-sm font-medium text-white/40">
              {project.description}
            </div>
          </div>
        </div>
        {project.stack.length > 0 && (
          <TooltipProvider delayDuration={0}>
            <div className="px-4 pb-4.5 flex flex-nowrap gap-1.5 sm:gap-2">
              {project.stack.map((tool) => (
                <Tooltip key={tool.name}>
                  <TooltipTrigger asChild>
                    <img
                      src={tool.image}
                      alt={tool.name}
                      className={cx(
                        "size-6 h-auto min-w-0 shrink aspect-square rounded-md opacity-60 hover:opacity-100 transition-opacity duration-150",
                        tool.bgWhite && "bg-white"
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-white text-black font-medium"
                  >
                    {tool.name}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        )}
      </div>
    </Link>
  );
}

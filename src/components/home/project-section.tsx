import ProjectCard from "@/components/project-card";
import { projects } from "@/constants/projectConstants";
import Link from "next/link";

/** How many projects get a full card on the home page; the rest roll up into one "more" card. */
const FEATURED_COUNT = 3;

/** Alternating tilts so the stacked logos feel playful; hovering straightens and enlarges one. */
const LOGO_TILTS = ["-rotate-6", "rotate-6", "-rotate-3", "rotate-3"];

export default function ProjectSection() {
  const featured = projects.slice(0, FEATURED_COUNT);
  const rest = projects.slice(FEATURED_COUNT);

  return (
    <div className="flex flex-col py-12 px-5 md:px-10 lg:px-12 gap-8">
      <div className="flex justify-between">
        <div className="description-text">My Projects</div>
        <Link
          href="/projects"
          className="flex items-center gap-x-1.5 group opacity-60 hover:opacity-100 transition-opacity duration-150 cursor-default"
        >
          <div className="leading-7 -tracking-[0.16px]">All projects</div>
          <img
            src="/icons/external.svg"
            alt="Projects Page"
            className="w-4.5 h-4.5 group-hover:rotate-45 transition-transform duration-150"
          />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {featured.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
        {rest.length > 0 && <MoreProjectsCard hidden={rest} />}
      </div>
    </div>
  );
}

function MoreProjectsCard({ hidden }: { hidden: typeof projects }) {
  return (
    <Link
      href="/projects"
      className="cursor-default group flex min-h-48 flex-col items-center justify-center gap-5 rounded-lg border border-ds-gray-900 bg-ds-gray-100 px-6 py-10 text-center transition-colors duration-150 hover:bg-ds-gray-800"
    >
      <div className="flex items-center">
        {hidden.map((project, i) => (
          <img
            key={project.name}
            src={project.logoImage}
            alt=""
            aria-hidden="true"
            className={`relative size-12 rounded-xl ring-2 ring-ds-gray-100 transition-all duration-300 ease-out hover:z-10 hover:rotate-0 hover:scale-115 group-hover:ring-ds-gray-800 ${
              i > 0 ? "-ml-3 group-hover:ml-1.5" : ""
            } ${LOGO_TILTS[i % LOGO_TILTS.length]}`}
          />
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-[15px] font-medium leading-[26.25px] -tracking-[0.15px] text-white">
          and {hidden.length} more
        </div>
        <div className="flex items-center justify-center gap-1.5 text-sm font-medium leading-[21px] -tracking-[0.14px] text-white/40 transition-colors duration-150 group-hover:text-white/80">
          {hidden.map((p) => p.name).join(" · ")}
          <img
            src="/icons/external.svg"
            alt=""
            aria-hidden="true"
            className="size-4 opacity-60 transition-transform duration-150 group-hover:rotate-45"
          />
        </div>
      </div>
    </Link>
  );
}

import ProjectCard from "@/components/project-card";
import { projects } from "@/constants/projectConstants";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Case studies of products Gaurav Varma has built, including Deepground, Inkeep, Clarity, Feast and Yhangry.",
  path: "/projects",
});

export default function Projects() {
  return (
    <div className="animate-fade-in px-12 py-18 flex flex-col w-full max-w-[1200px] gap-14">
      <div className="flex flex-col gap-3">
        <div className="page-title">
          Projects
        </div>
        <div className="page-subtitle">
          Explore some of my projects.
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </div>
  );
}

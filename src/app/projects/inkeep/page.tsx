import ArticleCta from "@/components/writing/article-cta";
import { projectMetadata } from "@/lib/site";
import HorizontalRule from "@/components/projects/horizontal-rule";
import InkeepCommunity from "@/components/projects/inkeep/inkeep-community";
import InkeepDocs from "@/components/projects/inkeep/inkeep-docs";
import InkeepEngineering from "@/components/projects/inkeep/inkeep-engineering";
import InkeepForwardDeployed from "@/components/projects/inkeep/inkeep-forward-deployed";
import InkeepIntro from "@/components/projects/inkeep/inkeep-intro";
import InkeepSpinoffLogo from "@/components/projects/inkeep/inkeep-spinoff-logo";

export const metadata = projectMetadata("inkeep");

export default function Inkeep() {
  return (
    <div className="flex flex-col gap-16 w-full max-w-[1200px] px-5 md:px-10 lg:px-12 pt-[58px] lg:pt-18 pb-18 animate-fade-in h-fit">
      <div id="project-body" className="flex flex-col gap-16">
        <InkeepIntro />

        <HorizontalRule />

        <InkeepCommunity />

        <HorizontalRule />

        <InkeepDocs />

        <HorizontalRule />

        <InkeepEngineering />

        <HorizontalRule />

        <InkeepForwardDeployed />

        <HorizontalRule />

        <InkeepSpinoffLogo />
      </div>

      <ArticleCta targetId="project-body" source="project" />
    </div>
  );
}

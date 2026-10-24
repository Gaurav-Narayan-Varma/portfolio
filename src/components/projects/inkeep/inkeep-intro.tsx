import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function InkeepIntro() {
  return (
    <>
      <MediaDisplay src="/projects/inkeep/inkeep-ov.png" video={false} />

      <SectionOverview
        title="Inkeep"
        subTitle1="Developer Experience Engineer"
        subTitle2="Open Source AI Agent Framework"
        link="https://github.com/inkeep/agents"
        paragraph1="I joined Inkeep as its founding Developer Experience Engineer during the pre-seed stage, working on a new open source, full-stack TypeScript framework for building AI agents. The role spanned developer product marketing, software engineering, and forward deployed engineering."
        paragraph2="During my time there, the team and revenue doubled and Inkeep raised a $13M seed round."
      />
    </>
  );
}

import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function InkeepDocs() {
  return (
    <>
      <SectionOverview
        title="Docs and Templates"
        paragraph1="I created much of the framework's documentation at docs.inkeep.com, along with real-world agent and MCP templates and customer case studies. Docs are the first thing a developer evaluating a framework touches, so I treated them as part of the product."
      />

      <MediaDisplay
        src="/inkeep-project/inkeep-docs.png"
        caption="docs.inkeep.com"
        video={false}
      />
    </>
  );
}

import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function DeepgroundIntro() {
  return (
    <>
      <MediaDisplay src="/projects/deepground/deepground-ov.png" video={false} />

      <SectionOverview
        title="Deepground"
        subTitle1="Prototype"
        subTitle2="AI Taskforce Platform"
        link="https://deepground.app"
        linkLabel="Visit deepground.app"
        paragraph1="I'm prototyping Deepground, an AI taskforce for brick-and-mortar small businesses. Owners get a team of specialist agents that answer their calls, book their jobs, and help them show up better online."
        paragraph2="I'm building it end to end, from the marketing site and free grader to the dashboard, agent platform, and integrations."
      />
    </>
  );
}

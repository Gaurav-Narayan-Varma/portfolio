import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function InkeepSpinoffLogo() {
  return (
    <>
      <SectionOverview
        title="Open Knowledge"
        paragraph1="I also helped launch Open Knowledge, a spinoff from Inkeep, and I was responsible for its logo. I prompted the team and iterated with the design agency that created it."
      />

      <MediaDisplay
        src="/inkeep-project/inkeep-spinoff-logo.png"
        caption="The Open Knowledge logo"
        video={false}
      />
    </>
  );
}

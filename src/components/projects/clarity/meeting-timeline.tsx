import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function MeetingTimeline() {
  return (
    <>
      <SectionOverview
        title="Meeting Timeline"
        paragraph1="When I joined, users had to constantly switch between their calendars and Clarity to manage meetings. I solved this by building an integrated calendar view, consolidating all meeting management capabilities directly into the platform."
        paragraph2="Based on user feedback showing redundancy between calendar and list views, I redesigned the experience into a unified timeline that offered the best of both interfaces."
      />

      <MediaDisplay
        src="/clarity-project/clarity-calendar.mp4"
        caption="Integrated calendar view"
        video={true}
      />

      <MediaDisplay
        src="/clarity-project/home-page-redesign.mp4"
        caption="Single unified meeting timeline"
        video={true}
      />
    </>
  );
}

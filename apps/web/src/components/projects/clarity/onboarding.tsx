import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function Onboarding() {
  return (
    <>
      <SectionOverview
        title="Onboarding"
        paragraph1="After launching Clarity calendar, we discovered a critical issue: users weren't using it because the Google Calendar setup was buried in settings. I tackled this by building an interactive onboarding flow that guides users through essential product features."
        paragraph2="Through continuous user feedback, I refined the experience into a streamlined three-step process. This improved approach laid the groundwork for Clarity's successful public launch."
      />

      <MediaDisplay
        src="/clarity-project/clarity-onboarding.mp4"
        caption="Onboarding flow"
        video={true}
      />
    </>
  );
}

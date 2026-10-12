import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function ClarityIntro() {
  return (
    <>
      <MediaDisplay src="/clarity-project/clarity-ov.png" video={false} />

      <SectionOverview
        title="Clarity"
        subTitle1="Software Engineer"
        subTitle2="Desktop Web App"
        paragraph1="I've spent the past year building the future of meeting intelligence at Clarity in SF. We're focused on helping high-performance operators capture and leverage every detail from their meetings through AI-powered transcription, actionable insights, and seamless integrations."
      />
    </>
  );
}

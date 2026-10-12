import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function YhangrySolution() {
  return (
    <>
      <SectionOverview
        title="Solution"
        paragraph1="I led the development of Yhangry's gift card system, building a secure payment infrastructure with Stripe's API and webhooks and integrating with Segment for purchase analytics."
        paragraph2="Key features included EU-compliant embedded checkout with Stripe Elements and automated digital gift card delivery via email."
      />

      <MediaDisplay
        src="/yhangry-project/yhangry-giftcard-flow.mp4"
        caption="Gift card purchase flow"
        video={true}
      />
    </>
  );
}

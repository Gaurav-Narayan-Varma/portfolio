import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function YhangryImpact() {
  return (
    <>
      <SectionOverview
        title="Impact"
        paragraph1="The gift card feature launch saw immediate success, with significant user engagement and purchase rates exceeding expectations."
        paragraph2="Strong customer adoption validated the demand for gifting options, leading to plans for expanding gift card functionality across more products and services."
      />

      <MediaDisplay
        src="/yhangry-project/yhangry-impact.png"
        caption="Launch metrics!"
        video={false}
      />
    </>
  );
}

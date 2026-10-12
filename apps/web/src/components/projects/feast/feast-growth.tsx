import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function FeastGrowth() {
  return (
    <>
      <SectionOverview
        title="Multi-Product Platform"
        paragraph1="My proudest achievement at Feast was scaling the product from a prototype for onboarding chefs, to an end-to-end platform for booking chefs - all within two weeks."
      />

      <MediaDisplay
        src="/feast-project/feast-growth.png"
        caption="Product expansion led by my efforts"
        video={false}
      />
    </>
  );
}

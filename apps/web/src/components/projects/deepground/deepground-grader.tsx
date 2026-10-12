import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function DeepgroundGrader() {
  return (
    <>
      <SectionOverview
        title="Free Grader"
        paragraph1="Every owner starts by searching for their business. The grader scans their Google Business Profile and website, scores their online health out of 100, and estimates the monthly revenue they're missing. No signup required."
        paragraph2="The estimate is a transparent model with stated assumptions, shown as a range instead of a single number, so owners can see exactly where the money is leaking."
      />

      <MediaDisplay
        src="/deepground-project/deepground-grader.png"
        caption="A report built from a sample business"
        video={false}
      />
    </>
  );
}

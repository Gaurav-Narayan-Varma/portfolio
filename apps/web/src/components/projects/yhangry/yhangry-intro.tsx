import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function YhangryIntro() {
  return (
    <>
      <MediaDisplay src="/yhangry-project/yhangry-intro.png" video={false} />

      <SectionOverview
        title="Yhangry Gift Cards"
        subTitle1="Full Stack Engineer"
        subTitle2="Private Chef Marketplace"
        paragraph1="I led the development of Yhangry's gift card feature, creating a seamless experience for customers to purchase and redeem dining experiences."
        paragraph2="As a Full Stack Engineer, I architected both the frontend user experience and backend payment infrastructure to ensure secure and reliable gift card transactions."
      />
    </>
  );
}

import MediaDisplay from "../media-display";
import SectionOverview from "../section-overview";

export default function FeastIntro() {
  return (
    <>
      <MediaDisplay src="/feast-project/feast-ov.png" video={false} />

      <SectionOverview
        title="Feast"
        subTitle1="Software Engineer"
        subTitle2="Chef Booking Platform"
        link="https://github.com/Gaurav-Narayan-Varma/feast"
        paragraph1="Building on my experience at Yhangry, a UK luxury chef marketplace, I partnered with Feast to create an affordable private chef platform for NYC, making healthy home dining accessible to everyday Americans."
        paragraph2="Through Feast, we're revolutionizing the culinary industry by enabling chefs to build thriving, independent careers while bringing the private dining experience to a broader audience."
      />
    </>
  );
}

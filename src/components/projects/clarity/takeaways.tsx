import MediaDisplay from "../media-display";
import SectionOverview from "../section-overview";

export default function Takeaways() {
  return (
    <>
      <SectionOverview
        title="The Journey"
        paragraph1="My time at Clarity has been an incredible journey of growth and collaboration with exceptional colleagues. In this short period, we've made remarkable strides, pioneering new approaches to revolutionize how people capture and manage meeting notes."
        paragraph2="Through my experience at Clarity, I've gained invaluable insights into creating user-centric products. The company's methodical approach to product development and design iteration has been enlightening."
        paragraph3="A heartfelt thank you to our dedicated users – the Claritons. Your innovative spirit and confidence in our platform motivates us to push boundaries and strive for excellence."
      />
      <MediaDisplay
        src="/clarity-project/bird-rock.png"
        caption="The Clarity team conquering Bird Rock during our San Diego offsite, 2024"
        video={false}
      />
    </>
  );
}

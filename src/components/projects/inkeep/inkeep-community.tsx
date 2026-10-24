import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function InkeepCommunity() {
  return (
    <>
      <SectionOverview
        title="Community Growth"
        paragraph1="I grew the open source agent framework to 1,000+ GitHub stars through developer community growth marketing: educational video content, launch weeks, tutorials, devtool partnerships, and product marketing for every new feature across Hacker News, X, and YouTube."
        paragraph2="I also organized events, from hackathons and panels to demo nights and webinars, and wrote blog articles on AI devtool trends and comparisons."
      />

      <MediaDisplay
        src="/projects/inkeep/inkeep-github.png"
        caption="The open source agent framework on GitHub"
        video={false}
      />
    </>
  );
}

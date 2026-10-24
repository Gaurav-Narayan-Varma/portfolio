import IntroSection from "@/components/home/intro-section";
import ProjectSection from "@/components/home/project-section";
import JourneySection from "@/components/home/journey-section";
import ContactSection from "@/components/home/contact-section";
import NewArticleBanner from "@/components/home/new-article-banner";

/**
 * Re-render at most hourly so the "New article" banner disappears once it's
 * older than its window (see new-article-banner.tsx) without needing a deploy.
 */
export const revalidate = 3600;

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <NewArticleBanner />
      <div className="max-w-[1200px] w-full h-screen ">
        <IntroSection />
        <ProjectSection />
        <JourneySection />
        <ContactSection />
      </div>
    </div>
  );
}

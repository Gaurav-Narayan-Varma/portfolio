import IntroSection from "@/components/home/intro-section";
import ProjectSection from "@/components/home/project-section";
import JourneySection from "@/components/home/journey-section";
import ContactSection from "@/components/home/contact-section";

export default function Home() {
  return (
    <div className="w-full flex justify-center animate-fade-in">
      <div className="max-w-[1200px] w-full h-screen ">
        <IntroSection />
        <ProjectSection />
        <JourneySection />
        <ContactSection />
      </div>
    </div>
  );
}

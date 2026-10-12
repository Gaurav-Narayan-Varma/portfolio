import { projectMetadata } from "@/lib/site";
import FeastAdmin from "@/components/projects/feast/feast-admin";
import FeastAuth from "@/components/projects/feast/feast-auth";
import FeastBackground from "@/components/projects/feast/feast-background";
import FeastBookingFlow from "@/components/projects/feast/feast-booking-flow";
import FeastIntro from "@/components/projects/feast/feast-intro";
import FeastOnboarding from "@/components/projects/feast/feast-onboarding";
import FeastTechStack from "@/components/projects/feast/feast-techstack";
import HorizontalRule from "@/components/projects/horizontal-rule";

export const metadata = projectMetadata("feast");

export default function Feast() {
  return (
    <div className="flex flex-col gap-16 w-full max-w-[1200px] px-5 md:px-10 lg:px-12 pt-[58px] lg:pt-18 pb-18 animate-fade-in h-fit">
      <FeastIntro />

      <HorizontalRule />

      <FeastBackground />

      <HorizontalRule />

      <FeastTechStack />

      <HorizontalRule />

      <FeastAuth />

      <HorizontalRule />

      <FeastOnboarding />

      <HorizontalRule />

      <FeastAdmin />

      <HorizontalRule />

      <FeastBookingFlow />
    </div>
  );
}

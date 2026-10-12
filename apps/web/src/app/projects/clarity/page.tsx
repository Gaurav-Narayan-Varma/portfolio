import { projectMetadata } from "@/lib/site";
import ClarityIntro from "@/components/projects/clarity/clarity-intro";
import EmailIntegration from "@/components/projects/clarity/email-integration";
import MeetingTimeline from "@/components/projects/clarity/meeting-timeline";
import Onboarding from "@/components/projects/clarity/onboarding";
import Takeaways from "@/components/projects/clarity/takeaways";
import TemplateManager from "@/components/projects/clarity/template-manager";
import HorizontalRule from "@/components/projects/horizontal-rule";

export const metadata = projectMetadata("clarity");

export default function Clarity() {
  return (
    <div className="flex flex-col gap-16 w-full max-w-[1200px] px-5 md:px-10 lg:px-12 pt-[58px] lg:pt-18 pb-18 animate-fade-in">
      <ClarityIntro />

      <HorizontalRule />

      <MeetingTimeline />

      <HorizontalRule />

      <Onboarding />

      <HorizontalRule />

      <EmailIntegration />

      <HorizontalRule />

      <TemplateManager />

      <HorizontalRule />

      <Takeaways />
    </div>
  );
}

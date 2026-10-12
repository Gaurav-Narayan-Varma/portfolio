import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function FeastOnboarding() {
  return (
    <>
      <SectionOverview
        title="Onboarding"
        paragraph1="The chef onboarding process consists of three critical steps: identity verification through Stripe's verification API, Stripe Connect account setup, and 1099 contract signing. Previously, chefs had to manually refresh their browser to track their progress through these steps, resulting in a disjointed user experience."
        paragraph2="I enhanced the process in two ways: First, I integrated Stripe webhooks to monitor ID verification status and update the onboarding flow in real-time. Second, I implemented a confirmation screen that captures the session ID from the callback URL after users complete their Stripe account setup, allowing for a seamless return to the updated onboarding flow."
      />

      <MediaDisplay
        src="/feast-project/feast-onboarding.mp4"
        caption="Feast Onboarding Flow"
        video={true}
      />
    </>
  );
}

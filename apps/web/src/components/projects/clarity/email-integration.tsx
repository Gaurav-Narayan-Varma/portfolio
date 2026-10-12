import MediaDisplay from "../media-display";
import SectionOverview from "../section-overview";

export default function EmailIntegration() {
  return (
    <>
      <SectionOverview
        title="Clarity Emails"
        paragraph1="I built Clarity's automated post-meeting email system from scratch. After each meeting, users receive a summary with action items and key takeaways. I implemented the full infrastructure using Resend, including retry mechanisms and email templating."
        paragraph2="The feature significantly improved user engagement by making meeting outcomes easily shareable and actionable. Given its success, we leveraged the email infrastructure to power workspace invitations as well."
      />

      <MediaDisplay
        src="/clarity-project/clarity-emails.png"
        caption="Emails that write themselves"
        video={false}
      />
    </>
  );
}

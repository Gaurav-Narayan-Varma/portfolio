import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function FeastAdmin() {
  return (
    <>
      <SectionOverview
        title="Admin Dashboard"
        paragraph1="Previously, Feast was tracking chef applications and approvals manually through spreadsheets, leading to a slow and frustrating process for chefs. I built the admin dashboard to automate this workflow, allowing the Feast team to efficiently monitor chef progress and streamline the approval process."
      />

      <MediaDisplay
        src="/feast-project/feast-admin.png"
        caption="Feast Admin Dashboard"
        video={false}
      />
    </>
  );
}

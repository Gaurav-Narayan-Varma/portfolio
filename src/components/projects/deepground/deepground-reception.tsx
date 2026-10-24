import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function DeepgroundReception() {
  return (
    <>
      <SectionOverview
        title="Reception Agent"
        paragraph1="The first live agent is a voice receptionist built on Retell. It answers inbound calls, collects the caller's details, checks real availability in Jobber, and books the job while the caller is still on the line."
        paragraph2="Every call is transcribed and logged in the dashboard with its outcome, and owners can invite their team to the workspace."
      />

      <MediaDisplay
        src="/projects/deepground/deepground-reception.png"
        caption="Reception Agent booking a job (product preview)"
        video={false}
      />
    </>
  );
}

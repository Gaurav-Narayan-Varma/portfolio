import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function DeepgroundTaskforce() {
  return (
    <>
      <SectionOverview
        title="The Taskforce"
        paragraph1="Each report ends with a recommended taskforce: specialist agents for reception, scheduling, follow-up, invoicing, reviews, and analytics, matched to the gaps the grader found. Signing up turns those recommendations into real agents in the owner's workspace."
        paragraph2="Agents can be grouped into teams, where a lead routes each request to the right specialist. They run on Claude, GPT, and Gemini models, and connect to Gmail and Google Calendar to take real action. The orchestration is built on Mastra."
      />

      <MediaDisplay
        src="/deepground-project/deepground-taskforce.png"
        caption="Meet the team that would work for you"
        video={false}
      />
    </>
  );
}

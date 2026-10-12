import MediaDisplay from "../media-display";
import SectionOverview from "../section-overview";

export default function TemplateManager() {
  return (
    <>
      <SectionOverview
        title="Clarity Template Library"
        paragraph1="I extended Clarity's call template system to support platform-wide templates. This new feature allows administrators to create and manage templates that are available to all users, complete with a tagging system for better organization and discoverability."
        paragraph2="The tagging system enables efficient template discovery and filtering, improving the platform's usability and scalability."
      />

      <MediaDisplay
        src="/clarity-project/clarity-template-manager.mp4"
        caption="Create and categorize cross-workspace templates"
        video={true}
      />
    </>
  );
}

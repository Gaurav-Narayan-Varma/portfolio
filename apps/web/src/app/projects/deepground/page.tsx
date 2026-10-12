import { projectMetadata } from "@/lib/site";
import DeepgroundGrader from "@/components/projects/deepground/deepground-grader";
import DeepgroundIntro from "@/components/projects/deepground/deepground-intro";
import DeepgroundProblem from "@/components/projects/deepground/deepground-problem";
import DeepgroundReception from "@/components/projects/deepground/deepground-reception";
import DeepgroundSiteBuilder from "@/components/projects/deepground/deepground-site-builder";
import DeepgroundTaskforce from "@/components/projects/deepground/deepground-taskforce";
import HorizontalRule from "@/components/projects/horizontal-rule";

export const metadata = projectMetadata("deepground");

export default function Deepground() {
  return (
    <div className="flex flex-col gap-16 w-full max-w-[1200px] px-5 md:px-10 lg:px-12 pt-[58px] lg:pt-18 pb-18 animate-fade-in h-fit">
      <DeepgroundIntro />

      <HorizontalRule />

      <DeepgroundProblem />

      <HorizontalRule />

      <DeepgroundGrader />

      <HorizontalRule />

      <DeepgroundTaskforce />

      <HorizontalRule />

      <DeepgroundReception />

      <HorizontalRule />

      <DeepgroundSiteBuilder />
    </div>
  );
}

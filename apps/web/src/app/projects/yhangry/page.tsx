import { projectMetadata } from "@/lib/site";
import HorizontalRule from "@/components/projects/horizontal-rule";
import YhangryIntro from "@/components/projects/yhangry/yhangry-intro";
import YhangryProblem from "@/components/projects/yhangry/yhangry-problem";
import YhangrySolution from "@/components/projects/yhangry/yhangry-solution";

export const metadata = projectMetadata("yhangry");

export default function Yhangry() {
  return (
    <div className="flex flex-col gap-16 w-full max-w-[1200px] px-5 md:px-10 lg:px-12 pt-[58px] lg:pt-18 pb-18 animate-fade-in h-fit">
      <YhangryIntro />

      <HorizontalRule />

      <YhangryProblem />

      <HorizontalRule />

      <YhangrySolution />
    </div>
  );
}

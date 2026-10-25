import { ContextSources } from "@/components/chat/context-sources";
import AskGauravGPT from "./ask-gauravgpt";
import ContactMe from "./contact-me";
import RotatingQuestions from "./rotating-questions";
export default function IntroSection() {
  return (
    <div className="flex flex-col pt-16 lg:pt-18 px-5 md:px-10 lg:px-12 pb-12 gap-8">
      <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
        <figure className="hidden lg:flex flex-col gap-2 w-60 shrink-0 lg:order-2 m-0">
          <div className="relative w-full aspect-21/34 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 z-10 rounded-2xl border border-white/20" />
            <img
              src="/walking.jpg"
              alt="Gaurav Varma walking"
              width={864}
              height={1400}
              className="h-full w-full object-cover"
            />
          </div>
          <figcaption className="text-xs text-white/40">Carmel, CA</figcaption>
        </figure>
        <div className="flex flex-col gap-5 lg:flex-1 lg:order-1">
          <div className="font-[Inter] text-4xl font-medium flex flex-col gap-1 -tracking-[0.72px] leading-[45px]">
            I build software products from zero to one.
          </div>
          <div className="description-text">
            I&apos;m Gaurav, a full stack AI engineer in San Francisco. At Clarity
            I was a founding engineer on an AI meeting notes app that Cursor
            went on to acquire. At Inkeep I grew an open source agent framework
            past 1,000 GitHub stars. Today I&apos;m prototyping Deepground, an
            AI taskforce for small businesses.
          </div>
          {/* GauravGPT's composer, suggestion and sources read as one unit
              (tight spacing); the contact buttons sit apart below it. */}
          <div className="flex flex-col gap-3">
            <div className="w-full max-w-md">
              <AskGauravGPT />
            </div>
            <RotatingQuestions />
            <ContextSources align="start" />
          </div>
          <div className="pt-3">
            <ContactMe location="hero" showRepo />
          </div>
        </div>
      </div>
    </div>
  );
}

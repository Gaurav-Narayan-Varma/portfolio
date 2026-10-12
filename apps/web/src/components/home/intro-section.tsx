import { ContextSources } from "@/components/chat/context-sources";
import AskGauravGPT from "./ask-gauravgpt";
import ContactMe from "./contact-me";
export default function IntroSection() {
  return (
    <div className="flex flex-col pt-16 lg:pt-18 px-5 md:px-10 lg:px-12 pb-12 gap-8">
      <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
        <div className="relative hidden lg:block w-full max-w-60 lg:w-60 lg:shrink-0 lg:order-2 aspect-21/34 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 z-10 rounded-2xl border border-white/20" />
          <img
            src="/walking.jpg"
            alt="Gaurav Varma walking"
            width={864}
            height={1400}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-5 lg:flex-1 lg:order-1">
          <div className="font-[Inter] text-4xl font-medium flex flex-col gap-1 -tracking-[0.72px] leading-[45px]">
            I build software products from zero to one.
          </div>
          <div className="description-text">
            I&apos;m Gaurav, a full stack engineer in San Francisco. At Clarity
            I was a founding engineer on an AI meeting notes app that Cursor
            went on to acquire. At Inkeep I grew an open source agent framework
            past 1,000 GitHub stars. Today I&apos;m prototyping Deepground, an
            AI taskforce for small businesses.
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <AskGauravGPT />
            <ContactMe location="hero" />
          </div>
          <ContextSources align="start" />
        </div>
      </div>
    </div>
  );
}

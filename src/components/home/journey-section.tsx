type Milestone =
  | {
      image: string;
      company: string;
      role: string;
      duration: string;
      type: "single";
    }
  | {
      image: string[];
      company: string;
      role: string;
      duration: string;
      type: "multiple";
    };

const milestones: Milestone[] = [
  {
    image: "/logos/inkeep-logo.png",
    company: "Inkeep",
    role: "Developer Experience Engineer",
    duration: "2025 - 2026",
    type: "single",
  },
  {
    image: "/logos/clarity-logo.jpeg",
    company: "Clarity",
    role: "Software Engineer",
    duration: "2024 - 2025",
    type: "single",
  },
  {
    image: [
      "/logos/yhangry-logo.jpeg",
      "/logos/fleek-logo.jpeg",
      "/logos/dgcl-logo.png",
      "/logos/flatiron-logo.jpeg",
    ],
    company: "Yhangry, Fleek, DGCL, Flatiron",
    role: "Freelance Engineer",
    duration: "2021 - 2024",
    type: "multiple",
  },
  {
    image: "/logos/liberty-logo.jpeg",
    company: "Liberty Mutual",
    role: "Associate Consultant",
    duration: "2020 - 2021",
    type: "single",
  },
  {
    image: "/logos/dartmouth-logo.jpeg",
    company: "Dartmouth College",
    role: "Economics",
    duration: "2016 - 2020",
    type: "single",
  },
];

export default function JourneySection() {
  return (
    <div className="flex flex-col gap-12 py-12 px-5 md:px-10 lg:px-12">
      <div className="flex flex-col gap-8">
        <div className="text-white/60 font-medium text-base -tracking-[0.16] leading-7">
          My Journey
        </div>
        <div className="text-white text-base leading-7 -tracking-[0.16] font-medium">
          I started in economics at{" "}
          <a
            className="hyperlink"
            href="https://home.dartmouth.edu"
            target="_blank"
          >
            Dartmouth College
          </a>
          , drawn to how people make decisions and how technology can help them
          make better ones. My first job was in corporate strategy at{" "}
          <a
            className="hyperlink"
            href="https://www.libertymutual.com/"
            target="_blank"
          >
            Liberty Mutual
          </a>
          , where I led a group of MIT AI researchers building AI solutions and
          presented the results to the C-suite.
          <br />
          <br />
          From there I moved into engineering, freelancing for startups such as{" "}
          <a className="hyperlink" href="https://yhangry.com/" target="_blank">
            Yhangry
          </a>{" "}
          and{" "}
          <a
            href="https://www.joinfleek.com/home"
            className="hyperlink"
            target="_blank"
          >
            Fleek
          </a>
          , where I led the gift card system end-to-end. Then I joined{" "}
          <a
            href="https://www.adoptclarity.com/"
            className="hyperlink"
            target="_blank"
          >
            Clarity
          </a>{" "}
          as a founding engineer, building AI meeting notes until Cursor
          acquired the company, and became the founding Developer Experience
          Engineer at{" "}
          <a href="https://inkeep.com" className="hyperlink" target="_blank">
            Inkeep
          </a>
          , an open source AI agent framework.
          <br />
          <br />
          Now I&apos;m prototyping{" "}
          <a
            href="https://deepground.app"
            className="hyperlink"
            target="_blank"
          >
            Deepground
          </a>
          , an AI taskforce for small businesses. Across all of it, the part I
          enjoy most is the product side: working out what users need and
          getting it in front of them.
        </div>
      </div>
      <div>
        {milestones.map((milestone, i) => (
          <Milestone key={i} milestone={milestone} />
        ))}
      </div>
    </div>
  );
}

function Milestone({ milestone }: { milestone: Milestone }) {
  return (
    <div className="flex py-3 gap-4">
      <div className="flex gap-2.5 items-center">
        {milestone.type === "multiple" ? (
          <div className="flex -space-x-2.5">
            {milestone.image.map((img, i) => (
              <CompanyLogo
                key={i}
                index={i}
                company={
                  Array.isArray(milestone.company)
                    ? milestone.company[i]
                    : milestone.company
                }
                image={img}
              />
            ))}
          </div>
        ) : (
          <CompanyLogo
            index={0}
            company={milestone.company}
            image={milestone.image}
          />
        )}
        <div>{milestone.company}</div>
      </div>
      <div className="border-b border-dashed border-white/[.12] flex-grow self-center" />
      <div className="flex flex-col gap-1 items-end md:flex-row md:gap-4">
        <div className="text-white/70 text-[15px] leading-[26.25px] -tracking-[0.15px] font-medium max-[400px]:w-32 truncate text-end">
          {milestone.role}
        </div>
        <div className="text-white/40 text-[15px] leading-[26.25px] -tracking-[0.15px] font-medium">
          {milestone.duration}
        </div>
      </div>
    </div>
  );
}

function CompanyLogo({
  index,
  company,
  image,
}: {
  index: number;
  company: string;
  image: string;
}) {
  return (
    <img
      src={image}
      alt={company}
      className="w-6.5 h-6.5 rounded-full bg-white ring-ds-gray-500 ring-1"
      style={{
        zIndex: -index,
      }}
    />
  );
}

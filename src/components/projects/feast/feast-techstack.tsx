"use client";
import { FloatingDock } from "@/components/ui/floating-dock";
import { useState } from "react";

const feastFrontendStack = [
  {
    title: "Next.js",
    icon: <img src="/logos/nextjs-logo.png" alt="Next.js" />,
    href: "",
    description:
      "Next.js provides essential server-side rendering capabilities that power Feast's SEO strategy, ensuring our chef profiles and menus are highly discoverable through search engines.",
    description2:
      "Beyond SEO, Next.js brings significant UX improvements through fast page loads and its intuitive file-system based routing system.",
  },

  {
    title: "React",
    icon: (
      <img src="/logos/react-logo.svg" alt="React" className="scale-[90%]" />
    ),
    href: "",
    description:
      "React's widespread adoption and extensive ecosystem made it the ideal choice for Feast's frontend. As we planned to scale Feast's engineering team globally, I chose React for its widespread adoption and extensive talent pool.",
  },
  {
    title: "TanStack Query",
    icon: <img src="/logos/tanstack-logo.jpeg" alt="TanStack Query" />,
    href: "",
    description:
      "TanStack Query enhances Feast's performance by intelligently managing cached data and providing instant visual feedback.",
    description2:
      "Through optimistic updates and background data synchronization, users experience seamless interactions without waiting for server responses.",
  },
  {
    title: "Tailwind CSS",
    icon: <img src="/logos/tailwind-logo-sm.png" alt="Tailwind CSS" />,
    href: "",
    description:
      "As the sole engineer at Feast, I prioritized long-term developer productivity. Tailwind's co-located styling approach reduces the complexity of managing separate CSS files, allowing engineers to iterate faster and maintain consistency across the application as our team scales.",
  },
];

const feastBackendStack = [
  {
    title: "Node.js",
    icon: <img src="/logos/nodejs-logo.png" alt="Node.js" />,
    href: "",
    description:
      "Just as React's widespread adoption influenced my decision for Feast's frontend, Node.js' popularity significantly expands our talent pool, giving us access to skilled developers both locally and globally.",
    description2:
      "While Node.js operates on a single thread, implementing a robust queue system like RabbitMQ or BullMQ effectively addresses this limitation.",
  },
  {
    title: "Express",
    icon: <img src="/logos/expressjs-logo-sm.png" alt="Express" />,
    href: "",
    description:
      "Like our Node.js selection, Express was chosen for its market dominance as a lightweight, high-performance web framework that doesn't enforce opinionated structures. ",
  },
  {
    title: "PostgreSQL",
    icon: <img src="/logos/postgresql-logo-sm.png" alt="PostgreSQL" />,
    href: "",
    description:
      "When building Feast, I knew I'd be working with complex relational data structures—menus containing recipes, recipes containing ingredients, and ingredients linked to allergens. PostgreSQL was the natural choice for handling these interconnected relationships efficiently.",
  },
  {
    title: "Prisma",
    icon: <img src="/logos/prisma-logo.jpg" alt="Prisma" />,
    href: "",
    description:
      "When building a product like Feast from 0 to 1, speed is everything, which makes Prisma an excellent choice for database ORM.",
    description2:
      "Prisma allows you to write SQL rapidly in practically natural language, while its type safety empowers developers to catch bugs earlier and focus more on building rather than debugging",
  },
];

const feastFullStack = [
  {
    title: "TypeScript",
    icon: <img src="/logos/ts-logo-sm.png" alt="TypeScript" />,
    href: "",
    description:
      "I see TypeScript as fundamental to building robust, maintainable code quickly—two qualities I'm committed to developing as Feast's engineering team grows. Simply put, writing JavaScript without TypeScript is like using a quill to write emails.",
  },
  {
    title: "tRPC",
    icon: <img src="/logos/trpc-logo.png" alt="tRPC" />,
    href: "",
    description:
      "Just as Feast benefits from TypeScript's reliability, tRPC extends that same compile-time safety to your entire API layer—no more runtime surprises from typos or type mismatches.",
  },
  {
    title: "Zod",
    icon: <img src="/logos/zod-logo-sm.png" alt="Zod" />,
    href: "",
    description:
      "Data integrity is critical at Feast. We use Zod schemas shared across our frontend and backend to validate data twice—once on each end—ensuring our chefs and customers always work with accurate, reliable information.",
  },
  {
    title: "Turborepo",
    icon: <img src="/logos/turborepo-logo-sm.png" alt="Turborepo" />,
    href: "",
    description:
      "I implemented a monorepo to set up future Feast engineers for success—minimizing the time lost to repository juggling so teams can focus their energy on building impactful features.",
  },
];

const feastInfrastructureStack = [
  {
    title: "Render",
    icon: <img src="/logos/render-logo.jpg" alt="Render" />,
    href: "",
    description:
      "We chose Render as our deployment platform because it aligns with Feast's need for rapid development and deployment.",
    description2:
      "Unlike traditional cloud platforms such as AWS EC2, which require significant infrastructure expertise, Render offers a streamlined deployment experience that allows our team to focus on product development rather than infrastructure management.",
  },
  {
    title: "Stripe",
    icon: <img src="/logos/stripe-logo.png" alt="Stripe" />,
    href: "",
    description:
      "Feast leverages Stripe's payment infrastructure as the backbone of our private chef marketplace. We specifically utilize Stripe Connect, which streamlines our payment processing by enabling direct transfers to chefs' bank accounts.",
    description2:
      "The integration is straightforward: once a chef creates their Stripe Connect account, we can automatically route customer payments to their designated account using their unique Account ID",
  },
  {
    title: "Resend",
    icon: <img src="/logos/resend-logo.png" alt="Resend" />,
    href: "",
    description:
      "Email communication, powered by Resend, is central to Feast's user experience. While it handles essential functions like account verification, Resend truly excels in orchestrating our booking workflow.",
    description2:
      "The platform facilitates a seamless chain of notifications: alerting chefs to new booking requests, confirming acceptances to users, and notifying chefs of completed payments.",
  },
  {
    title: "Docker",
    icon: <img src="/logos/docker-logo-sm.png" alt="Docker" />,
    href: "",
    description:
      "With Feast, I'm building an app that needs to scale, which means scaling the engineering team as well.",
    description2:
      "Docker enables this by letting teammates easily deploy a Postgres database locally, eliminating the classic 'it works on my machine' problem.",
  },
  {
    title: "Amazon S3",
    icon: <img src="/logos/s3-logo-sm.png" alt="AWS" />,
    href: "",
    description:
      "In the culinary industry, where presentation is paramount, Amazon S3 provides robust image storage solutions. This enabled Feast to securely host chef profiles and their culinary creations.",
  },
];

export default function FeastTechStack() {
  const [selected, setSelected] = useState<Record<string, React.ReactNode>>(
    feastFrontendStack[0]
  );

  return (
    <div className="w-full flex flex-col md:flex-row gap-2 md:gap-14 xl:gap-18">
      <div className="flex flex-col gap-5 h-full">
        <div className="page-title whitespace-nowrap">Tech Stack</div>

        {/* Floating Docks */}
        <div className="ml-6.5 flex flex-col gap-6 h-full justify-between">
          <div className="w-fit flex relative">
            <div className="text-white/50 text-xs font-[Inter] -rotate-90 absolute top-3 md:top-6 -left-8">
              Front
            </div>
            <FloatingDock items={feastFrontendStack} onSelect={setSelected} />
          </div>
          <div className="w-fit flex relative">
            <div className="text-white/50 text-xs font-[Inter] -rotate-90 absolute top-3 md:top-6 -left-8">
              Back
            </div>
            <FloatingDock items={feastBackendStack} onSelect={setSelected} />
          </div>
          <div className="w-fit flex relative">
            <div className="text-white/50 text-xs font-[Inter] -rotate-90 absolute top-3 md:top-6 -left-7">
              Full
            </div>
            <FloatingDock items={feastFullStack} onSelect={setSelected} />
          </div>
          <div className="w-fit flex relative">
            <div className="text-white/50 text-xs font-[Inter] -rotate-90 absolute top-3 md:top-6 -left-8">
              Infra
            </div>
            <FloatingDock
              items={feastInfrastructureStack}
              onSelect={setSelected}
            />
          </div>
        </div>
      </div>

      {/* Selected Tech Stack */}
      <div
        className="flex flex-col gap-2 flex-1 justify-center animate-fade-in"
        key={selected.title?.toString()}
      >
        <div className="flex items-center justify-center rounded-full overflow-hidden w-full">
          <div className="w-28 overflow-hidden rounded-full">
            {selected.icon}
          </div>
        </div>
        <div className="text-white/60 text-xs font-medium -tracking-[0.14] leading-[24.5px] text-center">
          {selected.title}
        </div>
        <div className="description-text text-start mt-2">
          {selected.description}
          {selected.description2 && (
            <div className="mt-2">{selected.description2}</div>
          )}
        </div>
      </div>
    </div>
  );
}

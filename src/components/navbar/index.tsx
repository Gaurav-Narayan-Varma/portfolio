"use client";

import { MessageCircle, PenLine } from "lucide-react";
import { usePathname } from "next/navigation";
import NavItem from "./nav-item";
import UserProfileCard from "./profile-chip";
import FooterLinks from "@/components/footer-links";
import { RESUME_FILENAME, RESUME_PATH } from "@/constants/resume";
import { REPO_URL, SHOW_WRITING } from "@/lib/site";

export const mainNavItems = [
  {
    href: "/",
    icon: "/home.svg",
    label: "Home",
  },
  {
    href: "/projects",
    icon: "/projects.svg",
    label: "Projects",
  },
  ...(SHOW_WRITING
    ? [
        {
          href: "/writing",
          icon: <PenLine className="w-4 h-4 opacity-80" />,
          label: "Writing",
        },
      ]
    : []),
  {
    href: "/chat",
    icon: <MessageCircle className="w-4 h-4 opacity-80" />,
    label: "GauravGPT",
  },
];

export const connectNavItems = [
  {
    href: "/contact",
    icon: "/contact.svg",
    label: "Contact",
  },
  {
    href: "https://www.linkedin.com/in/gaurav-varma",
    icon: "/linkedin.svg",
    label: "LinkedIn",
    track: "linkedin_clicked",
  },
  {
    href: REPO_URL,
    icon: "/github.svg",
    label: "GitHub",
    track: "see_repo_clicked",
  },
];

/** Highlights a nav item on its page and on nested pages (e.g. /writing/my-post). */
function isActivePath(pathname: string, href: string) {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex top-0 flex-col h-screen fixed justify-between min-w-[260px] border-r border-ds-gray-300 pt-6 pb-5 px-4.5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-9">
          <UserProfileCard />

          {/* Main Navigation */}
          <div className="flex flex-col gap-1">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={isActivePath(pathname, item.href)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 px-3">
          <div className="text-xs font-medium text-white/40 leading-none">
            Socials
          </div>
          <div className="h-px flex-1 bg-ds-gray-300" />
        </div>

        {/* Connect Navigation */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            {connectNavItems.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={pathname === item.href}
                isExternalLink={item.href.startsWith("http")}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Creates and triggers a temporary download link */}
      {/* This approach prevents the download URL from showing in the browser's status bar on hover */}
      <div className="flex flex-col gap-3">
        <button
          data-track="resume_downloaded"
          data-track-location="sidebar"
          onClick={() => {
            const link = document.createElement("a");
            link.href = RESUME_PATH;
            link.download = RESUME_FILENAME;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="bg-ds-gray-500 cursor-default border border-white/[15%] rounded-[5px] h-10.5 flex items-center justify-center gap-2 opacity-80 hover:opacity-100 hover:bg-ds-gray-600 transition-all duration-150 shadow-[inset_0px_0.557334px_1.672px_-1.125px_rgba(255,255,255,0.07),_inset_0px_1.69015px_5.07046px_-2.25px_rgba(255,255,255,0.063),_inset_0px_4.46786px_13.4036px_-3.375px_rgba(255,255,255,0.05),_inset_0px_14px_42px_-4.5px_rgba(255,255,255,0.008)] active:bg-ds-gray-200"
        >
          <img src="/icons/download.svg" alt="Download" className="h-5 w-5" />
          <div className="-tracking-[0.14px] leading-[21px] font-medium text-sm">
            Resume
          </div>
        </button>
        <FooterLinks />
      </div>
    </div>
  );
}

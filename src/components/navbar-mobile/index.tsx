"use client";
import { connectNavItems, mainNavItems } from "@/components/navbar";
import NavItem from "@/components/navbar/nav-item";
import UserProfileCard from "@/components/navbar/profile-chip";
import FooterLinks from "@/components/footer-links";
import { RESUME_FILENAME, RESUME_PATH } from "@/constants/resume";
import cx from "clsx";
import { MenuIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function NavbarMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const navbarMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        navbarMobileRef.current &&
        !navbarMobileRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={cx("fixed w-full px-5 py-3.5 lg:hidden bg-ds-gray-500 z-50", {
        "border-b rounded-b-xl border-b-ds-gray-600": isOpen,
      })}
      ref={navbarMobileRef}
    >
      <div className="flex justify-between items-center">
        <UserProfileCard setIsOpen={setIsOpen} />
        {isOpen ? (
          <X onClick={() => setIsOpen(false)} />
        ) : (
          <MenuIcon onClick={() => setIsOpen(true)} />
        )}
      </div>

      <div
        className={cx(
          "flex flex-col gap-1 bg-ds-gray-500 overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"
        )}
      >
        {" "}
        {/* Main Navigation */}
        <div className="flex flex-col gap-1">
          {mainNavItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={false}
              onClick={() => setIsOpen(false)}
              isMobile={true}
            />
          ))}

          {connectNavItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={false}
              isExternalLink={item.href.startsWith("http")}
              onClick={() => setIsOpen(false)}
              isMobile={true}
            />
          ))}
        </div>
        {/* Creates and triggers a temporary download link */}
        {/* This approach prevents the download URL from showing in the browser's status bar on hover */}
        <div className="flex flex-col">
          <button
            data-track="resume_downloaded"
            data-track-location="mobile_menu"
            onClick={() => {
              const link = document.createElement("a");
              link.href = RESUME_PATH;
              link.download = RESUME_FILENAME;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="bg-ds-gray-500 cursor-default border border-white/[15%] rounded-[5px] h-[50px] flex items-center justify-center gap-2 opacity-80 hover:opacity-100 hover:bg-ds-gray-600 transition-all duration-150 shadow-[inset_0px_0.557334px_1.672px_-1.125px_rgba(255,255,255,0.07),_inset_0px_1.69015px_5.07046px_-2.25px_rgba(255,255,255,0.063),_inset_0px_4.46786px_13.4036px_-3.375px_rgba(255,255,255,0.05),_inset_0px_14px_42px_-4.5px_rgba(255,255,255,0.008)] active:bg-ds-gray-200 mt-6"
          >
            <img src="/icons/download.svg" alt="Download" className="h-5 w-5" />
            <div className="-tracking-[0.14px] leading-[21px] font-medium text-sm">
              Resume
            </div>
          </button>
          <FooterLinks className="mt-3" onNavigate={() => setIsOpen(false)} />
        </div>
      </div>
    </div>
  );
}

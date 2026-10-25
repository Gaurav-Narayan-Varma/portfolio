import { CAL_URL, REPO_URL } from "@/lib/site";
import { CalendarDays, Github, MessageSquare } from "lucide-react";
import Link from "next/link";

const buttonClass =
  "flex gap-1.5 items-center py-2 px-4 rounded-md bg-ds-gray-100 max-w-fit border border-white/[.12] hover:bg-ds-gray-800 transition-colors duration-150 group";
const labelClass =
  "text-[15px] font-medium text-white/80 group-hover:text-white transition-colors duration-150 leading-[26.25px] -tracking-[0.15px]";

/**
 * Cal.com booking link + contact form, side by side. `showRepo` adds a
 * "See repo" link to this site's source (used in the hero).
 */
export default function ContactMe({
  location,
  showRepo = false,
  iconOnlyOnMobile = false,
  className = "",
}: {
  location: string;
  showRepo?: boolean;
  /** Below the `sm` breakpoint, show only the icons (labels stay for screen readers). */
  iconOnlyOnMobile?: boolean;
  /** Extra classes for the wrapper, e.g. `justify-center`. */
  className?: string;
}) {
  const btn = iconOnlyOnMobile
    ? `${buttonClass} !px-2.5 sm:!px-4`
    : buttonClass;
  const label = iconOnlyOnMobile ? `${labelClass} hidden sm:block` : labelClass;
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={CAL_URL}
        aria-label="Book a call"
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-default max-w-fit"
        data-track="book_call_clicked"
        data-track-location={location}
      >
        <div className={btn}>
          <CalendarDays className="w-5 h-5 text-white opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
          <div className={label}>Book a call</div>
        </div>
      </a>
      <Link
        href="/contact"
        aria-label="Message me"
        className="cursor-default max-w-fit"
        data-track="message_me_clicked"
        data-track-location={location}
      >
        <div className={btn}>
          <MessageSquare className="w-5 h-5 text-white opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
          <div className={label}>Message me</div>
        </div>
      </Link>
      {showRepo && (
        <a
          href={REPO_URL}
          aria-label="See repo"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-default max-w-fit"
          data-track="see_repo_clicked"
          data-track-location={location}
        >
          <div className={btn}>
            <Github className="w-5 h-5 text-white opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
            <div className={label}>See repo</div>
          </div>
        </a>
      )}
    </div>
  );
}

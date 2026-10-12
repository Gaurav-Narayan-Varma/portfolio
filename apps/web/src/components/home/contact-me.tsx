import { CAL_URL } from "@/lib/site";
import { CalendarDays, MessageSquare } from "lucide-react";
import Link from "next/link";

const buttonClass =
  "flex gap-1.5 items-center py-2 px-4 rounded-md bg-ds-gray-100 max-w-fit border border-white/[.12] hover:bg-ds-gray-800 transition-colors duration-150 group";
const labelClass =
  "text-[15px] font-medium text-white/80 group-hover:text-white transition-colors duration-150 leading-[26.25px] -tracking-[0.15px]";

/** Cal.com booking link + contact form, side by side. */
export default function ContactMe({ location }: { location: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={CAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-default max-w-fit"
        data-track="book_call_clicked"
        data-track-location={location}
      >
        <div className={buttonClass}>
          <CalendarDays className="w-5 h-5 text-white opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
          <div className={labelClass}>Book a call</div>
        </div>
      </a>
      <Link
        href="/contact"
        className="cursor-default max-w-fit"
        data-track="message_me_clicked"
        data-track-location={location}
      >
        <div className={buttonClass}>
          <MessageSquare className="w-5 h-5 text-white opacity-60 group-hover:opacity-100 transition-opacity duration-150" />
          <div className={labelClass}>Message me</div>
        </div>
      </Link>
    </div>
  );
}

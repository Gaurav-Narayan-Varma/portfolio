import cx from "clsx";
import Link from "next/link";

export default function NavItem({
  href,
  icon,
  label,
  isActive,
  isExternalLink,
  onClick,
  isMobile,
  track,
}: {
  href: string;
  icon: string | React.ReactNode;
  label: string;
  isActive: boolean;
  isExternalLink?: boolean;
  onClick?: () => void;
  isMobile?: boolean;
  /** PostHog event name reported on click (see src/instrumentation-client.ts) */
  track?: string;
}) {
  return (
    <Link
      href={href}
      target={isExternalLink ? "_blank" : undefined}
      data-track={track}
      data-track-location={track ? (isMobile ? "mobile_menu" : "sidebar") : undefined}
      className={cx(
        "flex gap-2 p-2 cursor-default rounded-md  border border-transparent h-10 group items-center",
        isActive
          ? "bg-ds-gray-200 border !border-ds-gray-400 opacity-90 transition-all duration-150"
          : !isMobile && "opacity-60 hover:bg-ds-gray-100 hover:opacity-90",
        {
          "hover:bg-ds-gray-100 active:bg-ds-gray-200": isMobile,
        }
      )}
      onClick={onClick}
    >
      {typeof icon === "string" ? (
        <img
          src={`/icons/${icon}`}
          alt={label}
          width={16}
          height={16}
          className={cx({ "opacity-60": isMobile })}
        />
      ) : (
        icon
      )}
      <div
        className={cx(
          "font-medium -tracking-[0.14px] leading-[21px] text-sm text-white",
          {
            "!text-base": isMobile,
            "opacity-90": isMobile,
          }
        )}
      >
        {label}
      </div>
      {isExternalLink && (
        <img
          src="/icons/external.svg"
          alt="External Link"
          className="ml-auto invisible group-hover:visible"
          width={16}
          height={16}
        />
      )}
    </Link>
  );
}

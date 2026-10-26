import DesignCredit from "@/components/design-credit";
import Link from "next/link";

/** Small print at the bottom of the sidebar and the mobile menu. */
export default function FooterLinks({
  className,
  onNavigate,
}: {
  className?: string;
  /** Lets the mobile menu close itself when a link is followed. */
  onNavigate?: () => void;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <DesignCredit />
      <p className="text-xs text-white/40 leading-4 text-center">
        <Link
          href="/privacy"
          onClick={onNavigate}
          className="underline hover:text-white/80 transition-colors duration-150"
        >
          Privacy
        </Link>
      </p>
    </div>
  );
}

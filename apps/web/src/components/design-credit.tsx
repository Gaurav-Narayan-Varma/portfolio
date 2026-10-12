export default function DesignCredit({ className }: { className?: string }) {
  return (
    <p
      className={`text-xs text-white/40 leading-4 text-center ${className ?? ""}`}
    >
      Design inspired by{" "}
      <a
        href="https://www.framer.com/marketplace/templates/dashfolio-neo/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-white/80 transition-colors duration-150"
      >
        Dashfolio Neo
      </a>
    </p>
  );
}

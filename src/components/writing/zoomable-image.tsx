"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Article image that opens a full-screen lightbox when clicked. */
export default function ZoomableImage({
  src,
  alt,
  caption,
  invert = false,
  cover = false,
}: {
  src?: string;
  alt: string;
  caption?: string;
  /** Inverts a light image (keeping hues) so it suits the dark site. */
  invert?: boolean;
  /**
   * Article header image: cropped to 16:9 with no outer margin (the page lays
   * it out). The lightbox still shows the full, uncropped image.
   */
  cover?: boolean;
}) {
  const invertClass = invert ? "[filter:invert(1)_hue-rotate(180deg)]" : "";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!src) return null;

  return (
    <>
      {/* Spans (not <figure>) because markdown wraps images in a <p>. */}
      <span className={cover ? "block" : "my-8 block"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onClick={() => setOpen(true)}
          className={`w-full cursor-zoom-in rounded-lg border border-ds-gray-900 ${cover ? "aspect-video object-cover" : ""} ${invertClass}`}
        />
        {caption && (
          <span className="caption-text mt-3 block">{caption}</span>
        )}
      </span>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt || "Enlarged image"}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[1000] flex cursor-zoom-out items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          >
            <button
              type="button"
              aria-label="Close image"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-white/20"
            >
              ×
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className={`max-h-full max-w-full rounded-lg object-contain ${invertClass}`}
            />
          </div>,
          document.body
        )}
    </>
  );
}

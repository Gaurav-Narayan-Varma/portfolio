"use client";

import {
  IconBrandLinkedin,
  IconBrandReddit,
  IconBrandX,
  IconCheck,
  IconLink,
} from "@tabler/icons-react";
import { useState } from "react";
import toast from "react-hot-toast";

const buttonClass =
  "cursor-default flex h-9 w-9 items-center justify-center rounded-full border border-ds-gray-900 bg-ds-gray-100 text-white/60 transition-colors duration-150 hover:bg-ds-gray-800 hover:text-white";

export default function ShareButtons({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const targets = [
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      Icon: IconBrandX,
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      Icon: IconBrandLinkedin,
    },
    {
      label: "Share on Reddit",
      href: `https://www.reddit.com/submit?url=${u}&title=${t}`,
      Icon: IconBrandReddit,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <div className="flex items-center gap-2">
      {targets.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={buttonClass}
        >
          <Icon className="h-[18px] w-[18px]" stroke={1.75} />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link"
        title="Copy link"
        className={buttonClass}
      >
        {copied ? (
          <IconCheck className="h-[18px] w-[18px]" stroke={1.75} />
        ) : (
          <IconLink className="h-[18px] w-[18px]" stroke={1.75} />
        )}
      </button>
    </div>
  );
}

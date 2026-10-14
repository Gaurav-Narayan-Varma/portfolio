"use client";

import { DEFAULT_CHAT_MODEL_ID } from "@/lib/chat-models";
import { STARTER_QUESTIONS } from "@/lib/starter-questions";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ROTATE_MS = 4000;

/**
 * Cycles through the starter questions. By default clicking one opens it in
 * /chat; pass `onSelect` to handle the click in place (used on /chat itself).
 */
export default function RotatingQuestions({
  onSelect,
  align = "start",
  showLabel = true,
}: {
  onSelect?: (question: string) => void;
  align?: "start" | "center";
  showLabel?: boolean;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % STARTER_QUESTIONS.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [paused, index]);

  const question = STARTER_QUESTIONS[index];

  const ask = () => {
    if (onSelect) {
      onSelect(question);
      return;
    }
    const params = new URLSearchParams({
      q: question,
      model: DEFAULT_CHAT_MODEL_ID,
    });
    router.push(`/chat?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2 text-sm",
        align === "center" && "w-full justify-center"
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {showLabel && <span className="shrink-0 text-white/40">Try asking</span>}
      <div className="relative h-9 min-w-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.button
            key={question}
            type="button"
            onClick={ask}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "group absolute top-1/2 flex max-w-full -translate-y-1/2 items-center gap-1.5 rounded-full bg-[#1e1f20] px-4 py-1.5 text-white/80 transition-colors hover:bg-[#2a2b2d] hover:text-white",
              align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
            )}
          >
            <span className="truncate">{question}</span>
            <ArrowUpRight className="size-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  );
}

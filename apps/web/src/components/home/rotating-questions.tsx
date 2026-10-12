"use client";

import { DEFAULT_CHAT_MODEL_ID } from "@/lib/chat-models";
import { STARTER_QUESTIONS } from "@/lib/starter-questions";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ROTATE_MS = 4000;

/** Cycles through the starter questions; clicking one opens it in /chat. */
export default function RotatingQuestions() {
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
    const params = new URLSearchParams({
      q: question,
      model: DEFAULT_CHAT_MODEL_ID,
    });
    router.push(`/chat?${params.toString()}`);
  };

  return (
    <div
      className="flex h-9 items-center gap-2 text-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="shrink-0 text-white/40">Try asking</span>
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
            className="group absolute left-0 top-1/2 flex max-w-full -translate-y-1/2 items-center gap-1.5 rounded-full bg-[#1e1f20] px-4 py-1.5 text-white/80 transition-colors hover:bg-[#2a2b2d] hover:text-white"
          >
            <span className="truncate">{question}</span>
            <ArrowUpRight className="size-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  );
}

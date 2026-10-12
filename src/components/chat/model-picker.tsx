"use client";

import { CHAT_MODELS, findChatModel } from "@/lib/chat-models";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ModelPicker({
  value,
  onChange,
  side,
}: {
  value: string;
  onChange: (id: string) => void;
  side: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = findChatModel(value) ?? CHAT_MODELS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Choose model"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-white/80 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10"
      >
        <span className="max-w-[7.5rem] truncate">{selected.shortName}</span>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Model"
          className={cn(
            "absolute right-0 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#2a2b2d] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          <p className="px-3 pb-1 pt-2 text-xs text-white/40">
            Choose a model, via Vercel AI Gateway
          </p>
          {CHAT_MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              role="option"
              aria-selected={model.id === value}
              onClick={() => {
                onChange(model.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/10"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-white">{model.name}</span>
                <span className="block text-xs text-white/50">
                  {model.description}
                </span>
              </span>
              {model.id === value && (
                <Check className="size-4 shrink-0 text-[#8ab4f8]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

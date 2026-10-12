"use client";

import { ModelPicker } from "@/components/chat/model-picker";
import { DEFAULT_CHAT_MODEL_ID } from "@/lib/chat-models";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, type KeyboardEvent, useState } from "react";

/** A compact GauravGPT composer: type, hit enter, and continue on /chat. */
export default function AskGauravGPT() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [modelId, setModelId] = useState(DEFAULT_CHAT_MODEL_ID);

  const submit = () => {
    const question = input.trim();
    if (!question) {
      router.push("/chat");
      return;
    }
    const params = new URLSearchParams({ q: question, model: modelId });
    router.push(`/chat?${params.toString()}`);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex h-12 w-full max-w-md items-center gap-1 rounded-full bg-[#1e1f20] pl-5 pr-1.5 transition-colors focus-within:bg-[#242527]"
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        maxLength={1000}
        placeholder="Ask GauravGPT"
        aria-label="Ask GauravGPT"
        className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/50"
      />
      <ModelPicker value={modelId} onChange={setModelId} side="bottom" />
      <button
        type="submit"
        aria-label="Send message"
        disabled={!input.trim()}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-200",
          input.trim()
            ? "bg-[#3347c9] text-white hover:bg-[#4259e0]"
            : "pointer-events-none scale-90 opacity-0"
        )}
      >
        <ArrowUp className="size-5" />
      </button>
    </form>
  );
}

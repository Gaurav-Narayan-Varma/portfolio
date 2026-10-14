"use client";

import { ContextSources } from "@/components/chat/context-sources";
import RotatingQuestions from "@/components/home/rotating-questions";
import { Markdown } from "@/components/chat/markdown";
import { ModelPicker } from "@/components/chat/model-picker";
import { DEFAULT_CHAT_MODEL_ID, findChatModel } from "@/lib/chat-models";
import { cn } from "@/lib/utils";
import { ArrowUp, Check, Copy, Sparkles, Square } from "lucide-react";
import { motion } from "motion/react";
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  error?: boolean;
};

/** Matches the server, which only reads the most recent messages. */
const MAX_HISTORY = 6;

class ChatError extends Error {}

const newId = () => Math.random().toString(36).slice(2);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelId, setModelId] = useState(DEFAULT_CHAT_MODEL_ID);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);

  const empty = messages.length === 0;

  // Auto-grow the textarea with its content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  // Keep the latest message in view while streaming (unless the user scrolled up)
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const send = useCallback(
    async (raw: string, model: string = modelId) => {
      const text = raw.trim();
      if (!text || loading) return;

      const userMessage: Message = { id: newId(), role: "user", text };
      const assistantId = newId();
      const history = [...messages, userMessage].filter((m) => !m.error);

      stickToBottom.current = true;
      setInput("");
      setLoading(true);
      setMessages([
        ...messages,
        userMessage,
        { id: assistantId, role: "assistant", text: "" },
      ]);

      const patchAssistant = (patch: Partial<Message>) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
        );

      // Let Gaurav know what people are asking
      fetch("/api/send", {
        method: "POST",
        body: JSON.stringify({
          name: "GauravGPT",
          email: "N/A",
          message: text,
        }),
      }).catch(() => {});

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: history.slice(-MAX_HISTORY).map((m) => ({
              role: m.role,
              content: [{ type: "text", text: m.text }],
            })),
          }),
        });

        if (!response.ok || !response.body) {
          // The server explains rate limits and budget caps in `error`
          const data = await response.json().catch(() => null);
          throw new ChatError(
            typeof data?.error === "string"
              ? data.error
              : "Something went wrong. Please try again.",
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6).trim());
              if (data?.message) {
                accumulated += data.message;
                patchAssistant({ text: accumulated.trim() });
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          patchAssistant({
            text:
              error instanceof ChatError
                ? error.message
                : "Something went wrong. Please try again.",
            error: true,
          });
        }
      } finally {
        abortRef.current = null;
        setLoading(false);
        // Drop an assistant bubble that was stopped before any text arrived
        setMessages((prev) =>
          prev.filter((m) => !(m.id === assistantId && !m.text)),
        );
        textareaRef.current?.focus();
      }
    },
    [loading, messages, modelId],
  );

  // The home page composer hands off its prompt as /chat?q=...&model=...
  const handoffStarted = useRef(false);
  useEffect(() => {
    if (handoffStarted.current) return;
    handoffStarted.current = true;

    const params = new URLSearchParams(window.location.search);
    const question = params.get("q")?.slice(0, 1000);
    if (!question?.trim()) return;

    const chosen =
      findChatModel(params.get("model"))?.id ?? DEFAULT_CHAT_MODEL_ID;
    window.history.replaceState(null, "", "/chat");
    setModelId(chosen);
    send(question, chosen);
    // Runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (loading) {
      abortRef.current?.abort();
      return;
    }
    send(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="relative flex h-[calc(100dvh-71.05px)] w-full flex-col overflow-hidden animate-fade-in lg:h-screen">
      {/* Soft Gemini-style glow behind the composer */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-700",
          empty ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 50% 50%, rgba(37, 66, 170, 0.28), transparent 70%), radial-gradient(ellipse 80% 60% at 50% 50%, rgba(20, 30, 80, 0.25), transparent 75%)",
        }}
      />

      {!empty && (
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="relative flex-1 overflow-y-auto"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
            {messages.map((message, i) => (
              <MessageRow
                key={message.id}
                message={message}
                streaming={
                  loading && i === messages.length - 1 && !message.error
                }
              />
            ))}
          </div>
        </div>
      )}

      <motion.div
        layout="position"
        transition={{ type: "spring", stiffness: 260, damping: 32 }}
        className={cn(
          "relative z-10 mx-auto w-full max-w-3xl px-4",
          empty ? "my-auto" : "pb-4 pt-2",
        )}
      >
        {empty && (
          <h1 className="absolute bottom-full left-0 right-0 mb-8 px-4 text-center text-3xl font-light tracking-tight text-white/95 sm:text-4xl">
            Ask anything about Gaurav
          </h1>
        )}

        <form
          onSubmit={onSubmit}
          className="flex items-end gap-1 rounded-[28px] bg-[#1e1f20] p-2 pl-6 shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-colors focus-within:bg-[#242527]"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={1000}
            autoFocus
            placeholder="Ask GauravGPT"
            aria-label="Message"
            className="max-h-[200px] flex-1 resize-none bg-transparent py-2 text-base leading-6 text-white outline-none placeholder:text-white/50"
          />
          <ModelPicker
            value={modelId}
            onChange={setModelId}
            side={empty ? "bottom" : "top"}
          />
          <button
            type="submit"
            aria-label={loading ? "Stop generating" : "Send message"}
            disabled={!loading && !input.trim()}
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-200",
              loading || input.trim()
                ? "bg-[#3347c9] text-white hover:bg-[#4259e0]"
                : "pointer-events-none scale-90 opacity-0",
            )}
          >
            {loading ? (
              <Square className="size-3.5" fill="currentColor" />
            ) : (
              <ArrowUp className="size-5" />
            )}
          </button>
        </form>

        {empty ? (
          <div className="absolute left-0 right-0 top-full mt-5">
            <RotatingQuestions
              align="center"
              showLabel={false}
              onSelect={(question) => send(question)}
            />
          </div>
        ) : (
          <ContextSources className="mt-3" />
        )}
      </motion.div>

      {empty && (
        <ContextSources className="absolute inset-x-0 bottom-6 z-10 px-4" />
      )}
    </div>
  );
}

function MessageRow({
  message,
  streaming,
}: {
  message: Message;
  streaming: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl bg-[#1e1f20] px-5 py-3 text-base leading-6 text-white">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex gap-4">
      <Sparkles
        className={cn(
          "mt-1 size-5 shrink-0 text-[#8ab4f8]",
          streaming && "animate-pulse",
        )}
      />
      <div className="min-w-0 flex-1">
        {message.text ? (
          <div
            className={cn(
              "break-words text-base leading-7",
              message.error ? "text-red-300" : "text-white/90",
            )}
          >
            <Markdown>{message.text}</Markdown>
          </div>
        ) : (
          <div className="flex h-7 items-center gap-1.5" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 animate-dot-wave rounded-full bg-white"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}
        {!streaming && !message.error && message.text && (
          <CopyButton text={message.text} />
        )}
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label="Copy response"
      title="Copy"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="mt-2 flex size-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

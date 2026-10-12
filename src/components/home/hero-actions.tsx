"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "react-hot-toast";
import AskGauravGPT from "./ask-gauravgpt";

const EMPTY_FORM = { name: "", email: "", message: "" };

/**
 * Hero call-to-actions: "Contact me" opens the contact form right in the hero
 * (same /api/send endpoint as the contact page), next to the GauravGPT composer.
 */
export default function HeroActions() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("send failed");
      setForm(EMPTY_FORM);
      setOpen(false);
      toast.success("Message sent successfully!");
    } catch {
      toast.error("Couldn't send your message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="hero-contact-form"
          className={cn(
            "group flex max-w-fit cursor-default items-center gap-1.5 rounded-md border border-white/[.12] px-4 py-2 transition-colors duration-150 hover:bg-ds-gray-800",
            open ? "bg-ds-gray-800" : "bg-ds-gray-100"
          )}
        >
          <img
            src="/icons/mail.svg"
            alt=""
            className={cn(
              "h-5 w-5 transition-opacity duration-150 group-hover:opacity-100",
              open ? "opacity-100" : "opacity-60"
            )}
          />
          <span
            className={cn(
              "text-[15px] font-medium leading-[26.25px] -tracking-[0.15px] transition-colors duration-150 group-hover:text-white",
              open ? "text-white" : "text-white/80"
            )}
          >
            Contact me
          </span>
        </button>
        <AskGauravGPT />
      </div>

      {open && (
        <form
          id="hero-contact-form"
          onSubmit={onSubmit}
          className="animate-fade-in flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-[#1e1f20] p-4"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-white/80">
              Send me a message
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close contact form"
              className="rounded-md p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="text"
              placeholder="Your Name"
              required
              autoFocus
              className="h-11 w-full border-0 bg-[#242424] focus-visible:ring-0"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Your Email"
              required
              className="h-11 w-full border-0 bg-[#242424] focus-visible:ring-0"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <Textarea
            placeholder="Your Message"
            required
            className="h-28 w-full border-0 bg-[#242424] focus-visible:ring-0"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <Button
            type="submit"
            variant="default"
            className="h-11 w-full bg-[#e0e0e0] text-sm font-semibold text-black transition-all duration-150 active:opacity-50"
            label="Send Message"
            isLoading={isLoading}
          />
        </form>
      )}
    </>
  );
}

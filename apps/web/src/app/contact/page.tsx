"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trackEvent } from "@/lib/analytics";
import { CAL_URL } from "@/lib/site";
import { CalendarDays, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const contactInfoItems = [
  {
    icon: "/icons/linkedin.svg",
    label: "LinkedIn",
    value: "/gaurav-varma",
    href: "https://www.linkedin.com/in/gaurav-varma",
  },
  {
    icon: "/icons/location.svg",
    label: "Location",
    value: "San Francisco",
    href: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgIG0iG1SNA7RsryE2G6ucTL4zbNsEolujOulgOwkehZTraTMyiNN0E9Dr3peWGtOxw4r5jgdgiBoP-OWY8DgFG8FcY7wlz_zVaxBE0RSvTtEOeCQ5YhScu-4bwyw1fXZED6hyphenhyphenxwaUoGXOz/s900/Edit-San-Francisco-German-Tour-0132.JPG",
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoading(true);

    fetch("/api/send", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    setFormData({
      name: "",
      email: "",
      message: "",
    });

    trackEvent("contact_form_submitted", { location: "contact_page" });
    toast.success("Message sent successfully!");

    setIsLoading(false);
  }

  return (
    <div className="animate-fade-in flex flex-col justify-start w-full items-center">
      <div className="px-5 md:px-10 lg:px-12 pb-18 pt-[58px] lg:pt-40 flex flex-col gap-12 w-full max-w-[800px] items-start">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="page-title">Let&apos;s create together</div>
          <div className="flex gap-1 items-center">
            <div className="page-subtitle">
              Open for exciting opportunities and innovative collaborations.
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 page-subtitle stroke-[1.5]" />
                </TooltipTrigger>
                <TooltipContent className="bg-white text-black font-medium">
                  Built with Resend
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <a
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track="book_call_clicked"
            data-track-location="contact_page"
            className="group mt-2 flex max-w-fit cursor-default items-center gap-1.5 rounded-md border border-white/[.12] bg-ds-gray-100 px-4 py-2 transition-colors duration-150 hover:bg-ds-gray-800"
          >
            <CalendarDays className="h-5 w-5 text-white opacity-60 transition-opacity duration-150 group-hover:opacity-100" />
            <span className="text-[15px] font-medium leading-[26.25px] -tracking-[0.15px] text-white/80 transition-colors duration-150 group-hover:text-white">
              Prefer a chat? Book a call
            </span>
          </a>
        </div>
        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                type="text"
                placeholder="Your Name"
                required
                className="w-full bg-[#242424] border-0 h-11 focus-visible:ring-0"
                value={formData?.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                type="text"
                placeholder="Your Email"
                required
                className="w-full bg-[#242424] border-0 h-11 focus-visible:ring-0"
                value={formData?.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Textarea
              placeholder="Your Message"
              required
              className="w-full bg-[#242424] border-0 h-40 focus-visible:ring-0"
              value={formData?.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </div>
          <Button
            type="submit"
            variant="default"
            className="w-full bg-[#e0e0e0] text-black font-semibold transition-all duration-150 text-sm h-11 active:opacity-50"
            label={"Send Message"}
            isLoading={isLoading}
          />
        </form>
        {/* Footer */}
        <div className="flex flex-col gap-6 w-full">
          <div>Connect With Me</div>
          <div className="flex flex-col gap-4">
            {contactInfoItems.map((contactInfoItem) => (
              <ContactInfoItem
                key={contactInfoItem.label}
                contactInfoItem={contactInfoItem}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactInfoItem({
  contactInfoItem,
}: {
  contactInfoItem: (typeof contactInfoItems)[number];
}) {
  return (
    <div className="flex gap-4 w-full">
      <div className="flex gap-2">
        <img
          src={contactInfoItem.icon}
          alt={contactInfoItem.label}
          width={16}
          height={16}
        />
        <div>{contactInfoItem.label}</div>
      </div>
      <div className="border-.5 border-b border-white/12 border-dashed self-center flex-1" />
      <a
        href={contactInfoItem.href}
        target="_blank"
        className="text-white/60 cursor-pointer hover:text-white hover:underline decoration-transparent hover:decoration-white transition-all duration-500 truncate"
      >
        {contactInfoItem.value}
      </a>
    </div>
  );
}

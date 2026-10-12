import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "GauravGPT",
  description:
    "Ask GauravGPT anything about Gaurav Varma's work, projects and background.",
  path: "/chat",
  noIndex: true,
});

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

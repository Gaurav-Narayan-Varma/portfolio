import MediaDisplay from "@/components/projects/media-display";
import SectionOverview from "@/components/projects/section-overview";

export default function FeastAuth() {
  return (
    <>
      <SectionOverview
        title="Authentication"
        paragraph1="Previously, our authentication system lacked email verification during account creation, leaving the platform vulnerable to potential abuse. This security gap made it possible for malicious actors to create fake accounts, potentially preventing legitimate users from registering."
        paragraph2="I implemented email verification using Resend's service, generating time-bound tokens and including them in secure verification links. The enhanced system now validates user identities during registration and manages sessions through secure cookie-based authentication."
      />

      <MediaDisplay
        src="/feast-project/feast-auth.mp4"
        caption="Feast Authentication Flow"
        video={true}
      />
    </>
  );
}

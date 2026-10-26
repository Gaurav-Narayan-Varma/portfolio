import { pageMetadata } from "@/lib/site";
import type { ReactNode } from "react";

export const metadata = pageMetadata({
  title: "Privacy",
  description:
    "What Gaurav Varma's portfolio site collects, why, who processes it, how long it is kept, and how to ask for deletion.",
  path: "/privacy",
});

const CONTACT_EMAIL = "gaurav.narayan.varma@gmail.com";
const LAST_UPDATED = "October 25, 2026";
/** Keep in sync with the retention settings in PostHog. */
const RETENTION = "12 months";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-[Inter] text-xl font-medium text-white -tracking-[0.4px]">
        {title}
      </h2>
      <div className="description-text flex flex-col gap-3">{children}</div>
    </section>
  );
}

function List({ children }: { children: ReactNode }) {
  return <ul className="flex list-disc flex-col gap-2 pl-5">{children}</ul>;
}

export default function Privacy() {
  return (
    <div className="animate-fade-in px-5 md:px-10 lg:px-12 pt-[58px] lg:pt-18 pb-18 flex flex-col w-full max-w-[1200px] gap-12">
      <div className="flex flex-col gap-3">
        <h1 className="page-title">Privacy</h1>
        <p className="page-subtitle">
          This is a personal portfolio site run by Gaurav Varma. This page
          explains what it collects about visitors and what happens to it.
          Last updated {LAST_UPDATED}.
        </p>
      </div>

      <div className="flex max-w-3xl flex-col gap-10">
        <Section title="What I collect">
          <List>
            <li>
              <strong className="text-white/90">Visit analytics.</strong> Pages
              you view, the site you came from, any UTM tags on the link, your
              device type, browser and operating system, and your approximate
              country (worked out from your IP address). Clicks on a few links
              and buttons, such as the resume download, are also counted. This
              is tied to a random session ID that PostHog stores in a cookie or
              your browser&apos;s local storage. It is not linked to your name
              or email.
            </li>
            <li>
              <strong className="text-white/90">GauravGPT chats.</strong> The
              text of each question you ask, the answer, which model replied,
              and basic usage numbers (tokens, cost, response time). If you
              type personal details into the chat, those are stored too, so
              please don&apos;t. These events carry that same session ID and a
              daily anonymous ID made from a salted hash of your IP address.
              The hash changes every day, so it can&apos;t be used to follow
              you across days.
            </li>
            <li>
              <strong className="text-white/90">Contact form.</strong> If you
              send me a message, I receive your name, email address and message.
            </li>
            <li>
              <strong className="text-white/90">Abuse limits.</strong> To keep
              GauravGPT and the contact form from being overused, your IP
              address is used as a key for short-lived rate-limit counters.
              These expire within about a day.
            </li>
          </List>
          <p>
            The site doesn&apos;t use advertising trackers, doesn&apos;t sell
            data, and doesn&apos;t build profiles of individual visitors.
          </p>
        </Section>

        <Section title="Why I collect it">
          <List>
            <li>
              To see how people find and use the site, and which parts are
              useful.
            </li>
            <li>
              To improve GauravGPT by reading the questions people ask and
              fixing the gaps in its answers.
            </li>
            <li>
              To get an email summary of each visit (the pages viewed, clicks,
              and GauravGPT questions and answers), sent only to me.
            </li>
            <li>To reply to messages you send me.</li>
            <li>To keep the chat available and its costs under control.</li>
          </List>
          <p>
            Where privacy law asks for a legal basis, mine is legitimate
            interest in running and improving my own website, plus your consent
            when you send me a message.
          </p>
        </Section>

        <Section title="Who processes it">
          <p>
            These services handle data on my behalf. Each one receives only
            what it needs for its job:
          </p>
          <List>
            <li>
              <strong className="text-white/90">PostHog</strong> stores visit
              analytics and GauravGPT chat logs.
            </li>
            <li>
              <strong className="text-white/90">Resend</strong> delivers the
              contact form messages and the visit summary emails to my inbox.
            </li>
            <li>
              <strong className="text-white/90">Inngest</strong> runs the
              scheduled job that builds the visit summaries. It triggers the
              job, and the summary contents are not stored there.
            </li>
            <li>
              <strong className="text-white/90">
                Vercel and the Vercel AI Gateway
              </strong>{" "}
              host the site and route your chat messages to the AI model you
              pick. Vercel also keeps standard server logs.
            </li>
            <li>
              <strong className="text-white/90">AI model providers</strong>{" "}
              (Google, Anthropic, OpenAI or DeepSeek, depending on the model
              selected in the chat) receive your question, the recent
              conversation, and relevant passages from this site and my resume,
              so they can write an answer.
            </li>
            <li>
              <strong className="text-white/90">Pinecone</strong> receives your
              question to find the passages of this site that are relevant to
              it.
            </li>
            <li>
              <strong className="text-white/90">Upstash</strong> stores the
              rate-limit counters and a short-lived marker that stops a visit
              summary from being sent twice.
            </li>
          </List>
          <p>
            Some of these providers are based in the United States, so your
            data may be processed outside your country. Each has its own
            privacy policy.
          </p>
        </Section>

        <Section title="How long I keep it">
          <List>
            <li>
              Analytics and GauravGPT chat logs: up to {RETENTION}, then they
              are deleted.
            </li>
            <li>
              Visit summary emails and contact messages: until I delete them
              from my inbox, which is usually sooner than {RETENTION}.
            </li>
            <li>Rate-limit counters: about a day.</li>
            <li>The &quot;already sent&quot; marker for a summary: 14 days.</li>
          </List>
        </Section>

        <Section title="Your choices and deletion requests">
          <p>
            You can ask me what I have about you, ask me to delete it, or ask me
            to correct it. Email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Privacy%20request`}
              className="text-white underline underline-offset-2 hover:text-white/80"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            and I&apos;ll reply and act on it, normally within 30 days.
          </p>
          <p>
            Analytics and chat logs are anonymous, so I can&apos;t tell which
            ones are yours unless you help. Send me the wording of a question
            you asked and roughly when you asked it, and I&apos;ll find and
            delete it. For contact messages, email me from the address you used.
          </p>
          <p>
            To limit analytics, you can block cookies and local storage for this
            site, or use a browser or extension that blocks analytics. The site
            works the same without them. The simplest way to keep something out
            of the logs is not to type it into GauravGPT.
          </p>
          <p>
            <strong className="text-white/90">Do Not Track.</strong> This site
            doesn&apos;t currently respond to Do Not Track browser signals.
            Analytics run whether or not the signal is on, but you can block
            them as described above.
          </p>
          <p>
            <strong className="text-white/90">Tracking across sites.</strong> I
            don&apos;t allow advertisers or other third parties to collect
            data about you on this site for tracking you across other websites
            or online services over time. The services listed above only
            process data to provide the features described here.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If what the site collects changes, I&apos;ll update this page and
            the date at the top.
          </p>
        </Section>
      </div>
    </div>
  );
}

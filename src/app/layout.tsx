import Provider from "@/app/_trpc/provider";
import Navbar from "@/components/navbar";
import NavbarMobile from "@/components/navbar-mobile";
import {
  LINKEDIN_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  ogImagePath,
} from "@/lib/site";
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

/**
 * Call Manrope and Inter here to self host fonts, must be assigned to a variable
 */
const manrope = Manrope({
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
});

console.log("Printing inter to pass ci cd", inter);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [
      { url: ogImagePath(), width: 1200, height: 630, alt: SITE_TITLE },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [ogImagePath()],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  url: SITE_URL,
  jobTitle: "Full Stack AI Engineer",
  description: SITE_DESCRIPTION,
  image: `${SITE_URL}/profile.jpg`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    addressCountry: "US",
  },
  sameAs: [LINKEDIN_URL],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} antialiased cursor-default`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Provider>
          <Toaster
            position="bottom-center"
            toastOptions={{
              className: "text-sm text-foreground cursor-default",
              duration: 3000,
            }}
          />
          <div className="flex">
            <Navbar />
            <NavbarMobile />
            {/* <main> is also what scripts/indexSite.ts extracts when crawling */}
            <main className="w-full flex justify-center pt-[76px] lg:pt-0 lg:pl-[260px]">
              {children}
            </main>
          </div>
        </Provider>
      </body>
    </html>
  );
}

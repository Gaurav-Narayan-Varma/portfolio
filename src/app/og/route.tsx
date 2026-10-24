import { projects } from "@/constants/projectConstants";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

/**
 * Social share card (1200x630). Only accepts a project `slug` that exists in
 * `projectConstants`, never free text, so the endpoint can't be used to render
 * arbitrary content on this domain.
 */
export function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const project = projects.find((p) => p.slug === slug);

  const eyebrow = project ? "Case study" : "Portfolio";
  const title = project ? project.name : "Gaurav Varma";
  const subtitle = project
    ? project.description
    : "Full stack AI engineer creating software that matters.";
  const chips = project
    ? project.stack.slice(0, 5).map((t) => t.name)
    : ["San Francisco", "Full Stack", "AI products"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#141414",
          backgroundImage:
            "radial-gradient(circle at 85% 0%, rgba(51,71,201,0.45) 0%, rgba(20,20,20,0) 55%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 28,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#4259e0",
            }}
          />
          {eyebrow}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: title.length > 14 ? 96 : 120,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 44,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.25,
              maxWidth: 960,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {chips.map((chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  padding: "10px 20px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.06)",
                  fontSize: 24,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {chip}
              </div>
            ))}
          </div>
          {project && (
            <div
              style={{
                display: "flex",
                flexShrink: 0,
                whiteSpace: "nowrap",
                fontSize: 26,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Gaurav Varma
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    }
  );
}

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Token Calculator — Budget Planner, Token Counter & ROI Calculator",
  description:
    "Free AI token cost calculator. Compare GPT-4, Claude, Gemini pricing. Budget planner, token counter, and ROI calculator for businesses.",
  keywords: "AI token calculator, GPT-4 pricing, Claude cost, LLM pricing, token counter, AI budget calculator",
  openGraph: {
    title: "AI Token Calculator — Free Budget & Cost Tool",
    description:
      "Compare AI model pricing, count tokens, calculate ROI. Free tool for GPT-4, Claude, Gemini.",
    type: "website",
    url: "https://aicalc.tools",
    siteName: "AICalc.tools",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Token Calculator — Free Budget & Cost Tool",
    description:
      "Compare AI model pricing, count tokens, calculate ROI. Free tool for GPT-4, Claude, Gemini.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7914295455016301"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-dark text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

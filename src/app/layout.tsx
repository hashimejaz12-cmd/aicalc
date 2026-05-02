import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Token Calculator — Free GPT-4, Claude & Gemini Cost Calculator",
  description:
    "Free AI token cost calculator. Instantly compare GPT-4o, Claude, Gemini pricing. Budget planner, token counter, and ROI calculator. No signup required.",
  keywords: "AI token calculator, GPT-4 cost calculator, Claude pricing, Gemini token cost, LLM pricing calculator, token counter, AI budget planner, ChatGPT cost, AI ROI calculator",
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
        <meta name="google-site-verification" content="o0c2VU9EAP7xqQquOi0XObZIWldj_oEKVMWC1cAqPUw" />
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

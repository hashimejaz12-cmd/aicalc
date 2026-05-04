"use client";

import dynamic from "next/dynamic";

// Lazy load the calculator to improve initial page load
const Calculator = dynamic(() => import("./Calculator"), { ssr: false });

export default function Home() {
  return (
    <div className="relative">
      {/* Top Ad Banner */}
      <div className="bg-dark border-b border-white/10 py-3">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card p-3 text-center text-xs text-gray-500">
            <ins className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-7914295455016301"
              data-ad-format="auto"
              data-full-width-responsive="true" />
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Recommended Tools */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 gradient-text">Recommended AI Tools</h3>
              <div className="space-y-4">
                {[
                  { name: "Claude Pro", desc: "Best for long documents", url: "https://anthropic.com", price: "$20/mo" },
                  { name: "GPT-4 API", desc: "Most versatile model", url: "https://platform.openai.com", price: "Pay as you go" },
                  { name: "OpenRouter", desc: "Access all models", url: "https://openrouter.ai", price: "Usage-based" },
                ].map(tool => (
                  <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
                    className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-blue/50 transition">
                    <div className="font-semibold text-white mb-1">{tool.name}</div>
                    <div className="text-sm text-gray-400 mb-2">{tool.desc}</div>
                    <div className="text-xs text-accent-blue">{tool.price} →</div>
                  </a>
                ))}
              </div>
            </div>

            {/* CTA to UnfoldAI */}
            <div className="glass-card p-6 neon-border text-center">
              <h3 className="text-lg font-bold mb-3 gradient-text">Need AI Implementation?</h3>
              <p className="text-sm text-gray-400 mb-4">We build custom AI systems for businesses</p>
              <a href="https://unfoldai.net" target="_blank" rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple font-semibold hover:opacity-90 transition text-sm">
                Get Started →
              </a>
            </div>

            {/* Sidebar Ad */}
            <div className="glass-card p-4">
              <ins className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-7914295455016301"
                data-ad-format="auto"
                data-full-width-responsive="true" />
            </div>
          </aside>

          {/* Calculator */}
          <div>
            <Calculator />
          </div>
        </div>
      </div>

      {/* Bottom Ad */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="glass-card p-4 text-center">
          <ins className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-7914295455016301"
            data-ad-format="auto"
            data-full-width-responsive="true" />
        </div>
      </div>

      {/* SEO Content Block */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-300">Free AI Token Calculator & Prompt Optimizer</h2>
          <p className="text-gray-400 mb-4">
            AICalc.tools is the most comprehensive free AI cost calculator for developers and businesses. 
            Compare pricing across GPT-4, GPT-4o, Claude Sonnet, Claude Haiku, Gemini Pro, and Gemini Flash. 
            Calculate your AI API costs, optimize prompts to save 50% on tokens, and measure ROI for AI automation.
          </p>
          <p className="text-gray-400">
            Perfect for: OpenAI API users, Anthropic Claude developers, Google Gemini implementations, 
            AI startups managing costs, and businesses automating with ChatGPT. No signup required, 
            completely free, with instant AI-powered prompt optimization using Claude Haiku.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-white/10 text-center text-sm text-gray-500">
        <p>&copy; 2026 AICalc.tools. Free AI tools for developers.</p>
        <p className="mt-2">
          <a href="/" className="text-accent-blue hover:underline">Calculator</a>
          {" · "}
          <a href="/prompt-optimizer" className="text-accent-blue hover:underline">Prompt Optimizer</a>
        </p>
        <p className="mt-2">
          Built by{" "}
          <a href="https://unfoldai.net" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">
            UnfoldAI
          </a>
        </p>
      </footer>
    </div>
  );
}

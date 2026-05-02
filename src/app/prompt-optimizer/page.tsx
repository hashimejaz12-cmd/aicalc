"use client";

import { useState, useMemo } from "react";

// ── Optimization Rules ──────────────────────────────────────────────────────

const FILLER_WORDS = [
  "please", "kindly", "I would like", "I want", "I need", "could you",
  "would you", "can you", "if possible", "if you don't mind",
  "I was wondering", "I think that", "I believe that", "in my opinion",
  "basically", "actually", "honestly", "literally", "just",
  "very", "really", "quite", "rather", "somewhat"
];

const REDUNDANT_PHRASES = [
  ["in order to", "to"],
  ["due to the fact that", "because"],
  ["at this point in time", "now"],
  ["for the purpose of", "to"],
  ["in the event that", "if"],
  ["with regard to", "about"],
  ["in spite of the fact that", "although"],
  ["until such time as", "until"],
  ["during the course of", "during"],
  ["in a timely manner", "promptly"],
];

function optimizePrompt(text: string): { optimized: string; changes: string[] } {
  let result = text;
  const changes: string[] = [];
  let originalTokenCount = estimateTokens(text);

  // Remove multiple spaces
  result = result.replace(/\s+/g, " ");

  // Remove trailing/leading spaces
  result = result.trim();

  // Replace redundant phrases
  REDUNDANT_PHRASES.forEach(([long, short]) => {
    const regex = new RegExp(long, "gi");
    if (regex.test(result)) {
      result = result.replace(regex, short);
      changes.push(`Simplified: "${long}" → "${short}"`);
    }
  });

  // Remove filler words (case-insensitive, whole word only)
  let fillerCount = 0;
  FILLER_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = result.match(regex);
    if (matches) {
      fillerCount += matches.length;
      result = result.replace(regex, "");
    }
  });
  if (fillerCount > 0) {
    changes.push(`Removed ${fillerCount} filler word${fillerCount > 1 ? "s" : ""}`);
  }

  // Clean up double spaces again after removals
  result = result.replace(/\s+/g, " ").trim();

  // Remove excessive punctuation
  result = result.replace(/[!]{2,}/g, "!");
  result = result.replace(/[?]{2,}/g, "?");
  result = result.replace(/\.{4,}/g, "...");

  // Remove empty lines
  result = result.replace(/\n\s*\n\s*\n/g, "\n\n");

  // Count changes
  const tokensSaved = originalTokenCount - estimateTokens(result);
  if (tokensSaved > 0 && changes.length === 0) {
    changes.push("Cleaned up formatting and whitespace");
  }

  return { optimized: result, changes };
}

function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 0.75 words (GPT tokenizer approximation)
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 0.75);
}

// ── Model Pricing ────────────────────────────────────────────────────────────

const MODELS = [
  { name: "GPT-4o", inputPer1M: 2.50 },
  { name: "GPT-4o mini", inputPer1M: 0.15 },
  { name: "Claude Sonnet 4.6", inputPer1M: 3.00 },
  { name: "Claude Haiku 4.5", inputPer1M: 0.80 },
  { name: "Gemini 1.5 Pro", inputPer1M: 1.25 },
  { name: "Gemini 1.5 Flash", inputPer1M: 0.075 },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function PromptOptimizer() {
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("GPT-4o");
  const [frequency, setFrequency] = useState(100); // requests per day

  const result = useMemo(() => {
    if (!originalPrompt.trim()) return null;

    const { optimized, changes } = optimizePrompt(originalPrompt);
    const originalTokens = estimateTokens(originalPrompt);
    const optimizedTokens = estimateTokens(optimized);
    const tokensSaved = originalTokens - optimizedTokens;
    const percentSaved = originalTokens > 0 ? ((tokensSaved / originalTokens) * 100).toFixed(1) : "0";

    const model = MODELS.find(m => m.name === selectedModel)!;
    const costPerRequest = (tokensSaved / 1_000_000) * model.inputPer1M;
    const costPerThousand = costPerRequest * 1000;
    const costPerMonth = costPerRequest * frequency * 30;

    return {
      optimized,
      changes,
      originalTokens,
      optimizedTokens,
      tokensSaved,
      percentSaved,
      costPerRequest,
      costPerThousand,
      costPerMonth,
    };
  }, [originalPrompt, selectedModel, frequency]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <main className="relative overflow-hidden min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="absolute inset-0 grid-bg" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            <span className="gradient-text glow-text">AI Prompt Optimizer</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Reduce your AI costs instantly. Optimize prompts by removing filler words and redundancy — no quality loss.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            <a href="/" className="text-accent-blue hover:underline">← Back to Calculator</a>
          </p>
        </div>

        {/* Settings */}
        <div className="glass-card p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">Select Model</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50"
              >
                {MODELS.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-gray-300">Requests per day</label>
                <span className="text-accent-blue font-bold">{frequency}</span>
              </div>
              <input
                type="range"
                min="1"
                max="1000"
                value={frequency}
                onChange={e => setFrequency(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-blue"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>1000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="glass-card p-6 mb-8">
          <label className="block text-sm font-semibold mb-3 text-gray-300">
            Paste your prompt below
          </label>
          <textarea
            value={originalPrompt}
            onChange={e => setOriginalPrompt(e.target.value)}
            placeholder="Example: Please help me write a detailed blog post about artificial intelligence. I would like it to be very informative and quite engaging for readers who are interested in this topic..."
            rows={10}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent-blue/50 resize-none font-mono text-sm"
          />
        </div>

        {/* Results */}
        {result && result.tokensSaved > 0 ? (
          <>
            {/* Savings Summary */}
            <div className="glass-card p-8 mb-8 neon-border">
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-extrabold gradient-text glow-text mb-2">
                    {result.tokensSaved}
                  </div>
                  <div className="text-sm text-gray-400">Tokens Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-extrabold gradient-text glow-text mb-2">
                    {result.percentSaved}%
                  </div>
                  <div className="text-sm text-gray-400">Reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-green-400 mb-2">
                    ${result.costPerMonth.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Saved per Month</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-green-400 mb-2">
                    ${(result.costPerMonth * 12).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Saved per Year</div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold mb-3 gradient-text">What we changed:</h3>
                <ul className="space-y-2">
                  {result.changes.map((change, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Before/After */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-300">Original</h3>
                  <span className="text-sm text-gray-500">{result.originalTokens} tokens</span>
                </div>
                <div className="bg-white/5 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {originalPrompt}
                </div>
              </div>

              <div className="glass-card p-6 neon-border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold gradient-text">Optimized</h3>
                  <span className="text-sm text-green-400">{result.optimizedTokens} tokens</span>
                </div>
                <div className="bg-white/5 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto mb-4">
                  {result.optimized}
                </div>
                <button
                  onClick={() => copyToClipboard(result.optimized)}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple font-semibold hover:opacity-90 transition"
                >
                  Copy Optimized Prompt
                </button>
              </div>
            </div>
          </>
        ) : result && result.tokensSaved === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-2xl font-bold mb-3 gradient-text">Already Optimized!</h3>
            <p className="text-gray-400">Your prompt is already concise. No improvements needed.</p>
          </div>
        ) : null}

        {/* CTA */}
        {result && (
          <div className="glass-card p-8 mt-8 text-center neon-border">
            <h3 className="text-2xl font-bold mb-3 gradient-text">Need Custom AI Optimization?</h3>
            <p className="text-gray-300 mb-6">We build custom AI systems that reduce costs and scale operations.</p>
            <a
              href="https://unfoldai.net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple font-bold hover:opacity-90 transition"
            >
              Talk to Our Team →
            </a>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
          <p>&copy; 2026 AICalc.tools. Free AI tools for developers.</p>
          <p className="mt-2">
            <a href="/" className="text-accent-blue hover:underline">Calculator</a>
            {" · "}
            <a href="/prompt-optimizer" className="text-accent-blue hover:underline">Prompt Optimizer</a>
          </p>
        </footer>
      </div>
    </main>
  );
}

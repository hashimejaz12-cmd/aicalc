"use client";

import { useState, useMemo } from "react";

// ── Data ────────────────────────────────────────────────────────────────────

interface ModelData {
  name: string;
  provider: string;
  inputPer1M: number;
  outputPer1M: number;
  contextWindow: number; // in tokens
  bestFor: string;
}

const MODELS: ModelData[] = [
  { name: "GPT-4o",          provider: "OpenAI",    inputPer1M: 2.50,  outputPer1M: 10.00, contextWindow: 128000,   bestFor: "Complex reasoning" },
  { name: "GPT-4o mini",     provider: "OpenAI",    inputPer1M: 0.15,  outputPer1M: 0.60,  contextWindow: 128000,   bestFor: "High volume tasks" },
  { name: "Claude Sonnet 4.6", provider: "Anthropic", inputPer1M: 3.00, outputPer1M: 15.00, contextWindow: 200000, bestFor: "Long documents" },
  { name: "Claude Haiku 4.5",  provider: "Anthropic", inputPer1M: 0.80, outputPer1M: 4.00,  contextWindow: 200000, bestFor: "Fast & cheap" },
  { name: "Gemini 1.5 Pro",  provider: "Google",    inputPer1M: 1.25,  outputPer1M: 5.00,  contextWindow: 1000000,  bestFor: "Massive context" },
  { name: "Gemini 1.5 Flash",provider: "Google",    inputPer1M: 0.075, outputPer1M: 0.30,  contextWindow: 1000000,  bestFor: "Ultra budget" },
];

const USE_CASES: Record<string, { label: string; avgInputTokens: number; avgOutputTokens: number }> = {
  support:  { label: "Customer Support",  avgInputTokens: 200,  avgOutputTokens: 150 },
  email:    { label: "Email Replies",     avgInputTokens: 300,  avgOutputTokens: 200 },
  content:  { label: "Content Creation",  avgInputTokens: 400,  avgOutputTokens: 600 },
  analysis: { label: "Data Analysis",     avgInputTokens: 800,  avgOutputTokens: 400 },
  sales:    { label: "Sales Outreach",    avgInputTokens: 250,  avgOutputTokens: 200 },
};

const MESSAGE_LENGTHS: Record<string, { label: string; inputTokens: number; outputTokens: number }> = {
  short:  { label: "Short (~50 words)",   inputTokens: 70,  outputTokens: 50  },
  medium: { label: "Medium (~150 words)", inputTokens: 200, outputTokens: 150 },
  long:   { label: "Long (~400 words)",   inputTokens: 530, outputTokens: 300 },
};

function fmtContext(tokens: number): string {
  if (tokens >= 1_000_000) return `${tokens / 1_000_000}M`;
  return `${tokens / 1000}k`;
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── Prompt Optimization ─────────────────────────────────────────────────────

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
  let originalTokenCount = Math.ceil(text.trim().split(/\s+/).length / 0.75);

  result = result.replace(/\s+/g, " ").trim();

  REDUNDANT_PHRASES.forEach(([long, short]) => {
    const regex = new RegExp(long, "gi");
    if (regex.test(result)) {
      result = result.replace(regex, short);
      changes.push(`Simplified: "${long}" → "${short}"`);
    }
  });

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

  result = result.replace(/\s+/g, " ").trim();
  result = result.replace(/[!]{2,}/g, "!");
  result = result.replace(/[?]{2,}/g, "?");
  result = result.replace(/\.{4,}/g, "...");
  result = result.replace(/\n\s*\n\s*\n/g, "\n\n");

  const tokensSaved = originalTokenCount - Math.ceil(result.trim().split(/\s+/).length / 0.75);
  if (tokensSaved > 0 && changes.length === 0) {
    changes.push("Cleaned up formatting and whitespace");
  }

  return { optimized: result, changes };
}

// ── Component ────────────────────────────────────────────────────────────────

type Tab = "budget" | "counter" | "optimizer" | "roi";

export default function TokenCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>("budget");

  // Budget Planner state
  const [useCase, setUseCase] = useState("support");
  const [messagesPerDay, setMessagesPerDay] = useState(50);
  const [messageLength, setMessageLength] = useState("medium");
  const [selectedModels, setSelectedModels] = useState<string[]>(["GPT-4o", "Claude Haiku 4.5", "Gemini 1.5 Flash"]);
  const [isAnnual, setIsAnnual] = useState(false);

  // Token Counter state
  const [counterText, setCounterText] = useState("");

  // ROI Calculator state
  const [roiUseCase, setRoiUseCase] = useState("support");
  const [hoursPerMonth, setHoursPerMonth] = useState(80);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [roiMessagesPerDay, setRoiMessagesPerDay] = useState(100);

  // Prompt Optimizer state
  const [optimizerPrompt, setOptimizerPrompt] = useState("");
  const [optimizerModel, setOptimizerModel] = useState("GPT-4o");
  const [optimizerFreq, setOptimizerFreq] = useState(100);
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [aiOptimized, setAiOptimized] = useState<string | null>(null);

  // ── Budget calculations ──────────────────────────────────────────────────

  const budgetTokensPerMonth = useMemo(() => {
    const { inputTokens, outputTokens } = MESSAGE_LENGTHS[messageLength];
    const total = (inputTokens + outputTokens) * messagesPerDay * 30;
    return total;
  }, [messageLength, messagesPerDay]);

  const costBreakdown = useMemo(() => {
    return MODELS.filter(m => selectedModels.includes(m.name)).map(model => {
      const { inputTokens, outputTokens } = MESSAGE_LENGTHS[messageLength];
      const totalMessages = messagesPerDay * 30;
      const inputCost  = (inputTokens  * totalMessages / 1_000_000) * model.inputPer1M;
      const outputCost = (outputTokens * totalMessages / 1_000_000) * model.outputPer1M;
      const monthly = inputCost + outputCost;
      return { model, monthly, annual: monthly * 12 };
    }).sort((a, b) => a.monthly - b.monthly);
  }, [selectedModels, messageLength, messagesPerDay]);

  const bestValue = costBreakdown[0] ?? null;

  const toggleModel = (name: string) =>
    setSelectedModels(prev => prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]);

  // ── Token counter calculations ───────────────────────────────────────────

  const counterStats = useMemo(() => {
    const text = counterText.trim();
    if (!text) return null;
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.replace(/\s/g, "").length;
    const totalChars = text.length;
    const tokens = Math.ceil(words / 0.75);
    return { words, chars, totalChars, tokens };
  }, [counterText]);

  // ── ROI calculations ─────────────────────────────────────────────────────

  const roiCalc = useMemo(() => {
    const humanCost = hoursPerMonth * hourlyRate;
    const { avgInputTokens, avgOutputTokens } = USE_CASES[roiUseCase];
    const totalMsgs = roiMessagesPerDay * 30;
    // use cheapest model for AI cost estimate
    const cheapModel = MODELS.reduce((a, b) =>
      (a.inputPer1M + a.outputPer1M) < (b.inputPer1M + b.outputPer1M) ? a : b
    );
    const aiCost =
      (avgInputTokens  * totalMsgs / 1_000_000) * cheapModel.inputPer1M +
      (avgOutputTokens * totalMsgs / 1_000_000) * cheapModel.outputPer1M;
    const setupCost = 149;
    const savings = humanCost - aiCost;
    const annualSavings = savings * 12;
    const roi = savings > 0 ? ((savings / (aiCost + setupCost / 12)) * 100) : 0;
    const paybackMonths = savings > 0 ? Math.ceil(setupCost / savings) : null;
    return { humanCost, aiCost, savings, annualSavings, roi, paybackMonths, cheapModel };
  }, [roiUseCase, hoursPerMonth, hourlyRate, roiMessagesPerDay]);

  // ── Optimizer calculations ─────────────────────────────────────────

  const optimizerResult = useMemo(() => {
    if (!optimizerPrompt.trim()) return null;

    const { optimized, changes } = optimizePrompt(optimizerPrompt);
    const originalTokens = Math.ceil(optimizerPrompt.trim().split(/\s+/).length / 0.75);
    const optimizedTokens = Math.ceil(optimized.trim().split(/\s+/).length / 0.75);
    const tokensSaved = originalTokens - optimizedTokens;
    const percentSaved = originalTokens > 0 ? ((tokensSaved / originalTokens) * 100).toFixed(1) : "0";

    const model = MODELS.find(m => m.name === optimizerModel)!;
    const costPerRequest = (tokensSaved / 1_000_000) * model.inputPer1M;
    const costPerThousand = costPerRequest * 1000;
    const costPerMonth = costPerRequest * optimizerFreq * 30;

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
  }, [optimizerPrompt, optimizerModel, optimizerFreq]);

  const aiOptimizerResult = useMemo(() => {
    if (!aiOptimized || !optimizerPrompt.trim()) return null;

    const originalTokens = Math.ceil(optimizerPrompt.trim().split(/\s+/).length / 0.75);
    const optimizedTokens = Math.ceil(aiOptimized.trim().split(/\s+/).length / 0.75);
    const tokensSaved = originalTokens - optimizedTokens;
    const percentSaved = originalTokens > 0 ? ((tokensSaved / originalTokens) * 100).toFixed(1) : "0";

    const model = MODELS.find(m => m.name === optimizerModel)!;
    const costPerRequest = (tokensSaved / 1_000_000) * model.inputPer1M;
    const costPerMonth = costPerRequest * optimizerFreq * 30;

    return {
      optimized: aiOptimized,
      originalTokens,
      optimizedTokens,
      tokensSaved,
      percentSaved,
      costPerMonth,
    };
  }, [aiOptimized, optimizerPrompt, optimizerModel, optimizerFreq]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const aiOptimize = async () => {
    if (!optimizerPrompt.trim() || aiOptimizing) return;

    setAiOptimizing(true);
    setAiOptimized(null);

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: optimizerPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Optimization failed");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setAiOptimized(data.optimized);
    } catch (error: any) {
      console.error("AI optimization error:", error);
      alert(`Failed to optimize: ${error.message || "Unknown error"}. Check console for details.`);
    } finally {
      setAiOptimizing(false);
    }
  };

  // ── Tab button ───────────────────────────────────────────────────────────

  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-6 py-3 text-sm font-semibold transition-colors ${
        activeTab === id ? "text-white" : "text-gray-400 hover:text-gray-200"
      }`}
    >
      {label}
      {activeTab === id && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-blue to-accent-purple rounded-full" />
      )}
    </button>
  );

  // ── Render ───────────────────────────────────────────────────────────────

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
            <span className="gradient-text glow-text">AI Token Calculator</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Budget planner, token counter, and ROI calculator — everything you need to plan your AI costs.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            <TabBtn id="budget"    label="📊 Budget Planner" />
            <TabBtn id="counter"   label="🔢 Token Counter" />
            <TabBtn id="optimizer" label="✨ Prompt Optimizer" />
            <TabBtn id="roi"       label="💰 ROI Calculator" />
          </div>
        </div>

        {/* ── BUDGET PLANNER ──────────────────────────────────────────────── */}
        {activeTab === "budget" && (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Inputs */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-300">Use case</label>
                    <div className="space-y-2">
                      {Object.entries(USE_CASES).map(([key, { label }]) => (
                        <button key={key} onClick={() => setUseCase(key)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition ${
                            useCase === key
                              ? "bg-gradient-to-r from-accent-blue/30 to-accent-purple/30 border border-accent-blue/50 text-white"
                              : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/20"
                          }`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-semibold text-gray-300">Messages per day</label>
                      <span className="text-lg font-bold text-accent-blue">{messagesPerDay}</span>
                    </div>
                    <input type="range" min="1" max="1000" value={messagesPerDay}
                      onChange={e => setMessagesPerDay(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-blue" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1"><span>1</span><span>1000</span></div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3 text-gray-300">Message length</label>
                    <div className="space-y-2">
                      {Object.entries(MESSAGE_LENGTHS).map(([key, { label }]) => (
                        <button key={key} onClick={() => setMessageLength(key)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition ${
                            messageLength === key
                              ? "bg-gradient-to-r from-accent-cyan/30 to-accent-blue/30 border border-accent-cyan/50 text-white"
                              : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/20"
                          }`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-300">Compare models</label>
                  <div className="space-y-3">
                    {MODELS.map(m => (
                      <label key={m.name} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={selectedModels.includes(m.name)}
                          onChange={() => toggleModel(m.name)}
                          className="w-5 h-5 rounded accent-accent-blue cursor-pointer" />
                        <span className="text-sm text-gray-300 group-hover:text-white transition">{m.name}</span>
                        <span className="ml-auto text-xs text-gray-500">{m.provider}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outputs */}
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-6 neon-border">
                  <p className="text-sm text-gray-400 mb-1">Estimated tokens per month</p>
                  <p className="text-5xl font-extrabold gradient-text glow-text">{fmtTokens(budgetTokensPerMonth)}</p>
                  <p className="text-xs text-gray-500 mt-3">
                    {messagesPerDay} msg/day × {MESSAGE_LENGTHS[messageLength].inputTokens + MESSAGE_LENGTHS[messageLength].outputTokens} avg tokens × 30 days
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="inline-flex gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
                    {(["Monthly", "Annual"] as const).map(period => (
                      <button key={period} onClick={() => setIsAnnual(period === "Annual")}
                        className={`px-4 py-2 rounded-md text-sm transition ${
                          (period === "Annual") === isAnnual
                            ? "bg-gradient-to-r from-accent-blue/30 to-accent-purple/30 text-white"
                            : "text-gray-400 hover:text-white"
                        }`}>
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedModels.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {costBreakdown.map(({ model, monthly, annual }) => (
                      <div key={model.name}
                        className={`rounded-xl p-6 transition ${
                          bestValue?.model.name === model.name
                            ? "popular-card neon-border border-accent-blue/60"
                            : "glass-card hover:border-white/20"
                        }`}>
                        {bestValue?.model.name === model.name && (
                          <div className="inline-block text-xs font-semibold uppercase tracking-wider gradient-text mb-3 px-3 py-1 rounded-full neon-border">
                            Best Value
                          </div>
                        )}
                        <h3 className="text-sm font-semibold text-gray-300 mb-1">{model.provider}</h3>
                        <h2 className="text-base font-bold mb-4">{model.name}</h2>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-3xl font-extrabold">
                            ${isAnnual ? annual.toFixed(0) : monthly.toFixed(2)}
                          </span>
                          <span className="text-gray-400 text-sm">/{isAnnual ? "yr" : "mo"}</span>
                        </div>
                        {isAnnual && <p className="text-xs text-gray-400">${(annual / 12).toFixed(2)}/month</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <p className="text-gray-400">Select at least one model to see pricing</p>
                  </div>
                )}
              </div>
            </div>

            {/* Model comparison table */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4 gradient-text">Model Comparison Table</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-gray-400">
                      <th className="pb-3 pr-4 font-semibold">Model</th>
                      <th className="pb-3 pr-4 font-semibold">Provider</th>
                      <th className="pb-3 pr-4 font-semibold">Input /1M</th>
                      <th className="pb-3 pr-4 font-semibold">Output /1M</th>
                      <th className="pb-3 pr-4 font-semibold">Context</th>
                      <th className="pb-3 font-semibold">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODELS.map((m, i) => (
                      <tr key={m.name} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                        <td className="py-3 pr-4 font-medium text-white">{m.name}</td>
                        <td className="py-3 pr-4 text-gray-400">{m.provider}</td>
                        <td className="py-3 pr-4 text-green-400">${m.inputPer1M.toFixed(3)}</td>
                        <td className="py-3 pr-4 text-yellow-400">${m.outputPer1M.toFixed(2)}</td>
                        <td className="py-3 pr-4 text-accent-blue">{fmtContext(m.contextWindow)}</td>
                        <td className="py-3 text-gray-300">{m.bestFor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA */}
            <div className="glass-card p-8 text-center neon-border">
              <p className="text-lg font-semibold mb-2">Ready to deploy your AI?</p>
              <p className="text-gray-400 mb-6">We set up and manage your AI assistant end-to-end.</p>
              <a href="https://unfoldai.net" target="_blank" rel="noopener noreferrer"
                className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple font-semibold hover:opacity-90 transition neon-border">
                Set Up Your AI →
              </a>
            </div>
          </div>
        )}

        {/* ── TOKEN COUNTER ───────────────────────────────────────────────── */}
        {activeTab === "counter" && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <label className="block text-sm font-semibold mb-3 text-gray-300">
                Paste your text or prompt below
              </label>
              <textarea
                value={counterText}
                onChange={e => setCounterText(e.target.value)}
                placeholder="Paste any text, system prompt, or document here…"
                rows={10}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent-blue/50 resize-none font-mono text-sm"
              />
            </div>

            {counterStats ? (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Tokens (est.)", value: fmtTokens(counterStats.tokens), color: "gradient-text glow-text" },
                    { label: "Words",          value: counterStats.words.toLocaleString(), color: "text-white" },
                    { label: "Characters",     value: counterStats.chars.toLocaleString(), color: "text-white" },
                    { label: "Total chars",    value: counterStats.totalChars.toLocaleString(), color: "text-white" },
                  ].map(stat => (
                    <div key={stat.label} className="glass-card p-5 text-center">
                      <p className={`text-3xl font-extrabold mb-1 ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Model fit table */}
                <div className="glass-card p-6">
                  <h2 className="text-base font-bold mb-4 text-gray-300">Context Window & Cost per Request</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-gray-400">
                          <th className="pb-3 pr-4 font-semibold">Model</th>
                          <th className="pb-3 pr-4 font-semibold">Context</th>
                          <th className="pb-3 pr-4 font-semibold">Fits?</th>
                          <th className="pb-3 font-semibold">Cost (this text)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MODELS.map((m, i) => {
                          const fits = counterStats.tokens <= m.contextWindow;
                          const costOnce = (counterStats.tokens / 1_000_000) * m.inputPer1M;
                          return (
                            <tr key={m.name} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                              <td className="py-3 pr-4 font-medium text-white">{m.name}</td>
                              <td className="py-3 pr-4 text-accent-blue">{fmtContext(m.contextWindow)}</td>
                              <td className="py-3 pr-4">
                                {fits
                                  ? <span className="text-green-400 font-bold">✓ Fits</span>
                                  : <span className="text-red-400 font-bold">✗ Too large</span>
                                }
                              </td>
                              <td className="py-3 text-gray-300">${costOnce < 0.001 ? costOnce.toFixed(6) : costOnce.toFixed(4)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">* Token count is estimated at 1 token ≈ 0.75 words. Actual counts may vary slightly by model tokenizer.</p>
                </div>
              </>
            ) : (
              <div className="glass-card p-16 text-center">
                <p className="text-4xl mb-4">🔢</p>
                <p className="text-gray-400">Paste some text above to see token count and model compatibility</p>
              </div>
            )}
          </div>
        )}

        {/* ── PROMPT OPTIMIZER ──────────────────────────────────────────────── */}
        {activeTab === "optimizer" && (
          <div className="space-y-6">
            {/* Settings */}
            <div className="glass-card p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">Select Model</label>
                  <select
                    value={optimizerModel}
                    onChange={e => setOptimizerModel(e.target.value)}
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
                    <span className="text-accent-blue font-bold">{optimizerFreq}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="1000"
                    value={optimizerFreq}
                    onChange={e => setOptimizerFreq(Number(e.target.value))}
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
            <div className="glass-card p-6">
              <label className="block text-sm font-semibold mb-3 text-gray-300">
                Paste your prompt below
              </label>
              <textarea
                value={optimizerPrompt}
                onChange={e => { setOptimizerPrompt(e.target.value); setAiOptimized(null); }}
                placeholder="Example: Please help me write a detailed blog post about artificial intelligence. I would like it to be very informative and quite engaging for readers..."
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent-blue/50 resize-none font-mono text-sm"
              />
              {optimizerResult && optimizerResult.tokensSaved > 0 && (
                <button
                  onClick={aiOptimize}
                  disabled={aiOptimizing}
                  className="mt-4 w-full px-6 py-3 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiOptimizing ? "Optimizing with AI..." : "✨ AI-Optimize (Even Better Results)"}
                </button>
              )}
            </div>

            {/* Results */}
            {aiOptimizerResult ? (
              <>
                {/* AI Results Header */}
                <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 neon-border text-center">
                  <div className="text-3xl mb-2">✨</div>
                  <h3 className="text-2xl font-bold gradient-text mb-2">AI-Optimized Results</h3>
                  <p className="text-gray-300">Claude Haiku analyzed and rewrote your prompt for maximum efficiency</p>
                </div>

                {/* AI Savings Summary */}
                <div className="glass-card p-8 neon-border">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-extrabold gradient-text glow-text mb-2">
                        {aiOptimizerResult.tokensSaved}
                      </div>
                      <div className="text-sm text-gray-400">Tokens Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-extrabold gradient-text glow-text mb-2">
                        {aiOptimizerResult.percentSaved}%
                      </div>
                      <div className="text-sm text-gray-400">Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-green-400 mb-2">
                        ${aiOptimizerResult.costPerMonth.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">Saved per Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-green-400 mb-2">
                        ${(aiOptimizerResult.costPerMonth * 12).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">Saved per Year</div>
                    </div>
                  </div>
                </div>

                {/* AI Before/After */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="glass-card p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-300">Original</h3>
                      <span className="text-sm text-gray-500">{aiOptimizerResult.originalTokens} tokens</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {optimizerPrompt}
                    </div>
                  </div>

                  <div className="glass-card p-6 neon-border bg-gradient-to-br from-accent-purple/10 to-accent-blue/10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold gradient-text">✨ AI-Optimized</h3>
                      <span className="text-sm text-green-400">{aiOptimizerResult.optimizedTokens} tokens</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto mb-4">
                      {aiOptimizerResult.optimized}
                    </div>
                    <button
                      onClick={() => copyToClipboard(aiOptimizerResult.optimized)}
                      className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple font-semibold hover:opacity-90 transition"
                    >
                      Copy AI-Optimized Prompt
                    </button>
                  </div>
                </div>
              </>
            ) : optimizerResult && optimizerResult.tokensSaved > 0 ? (
              <>
                {/* Savings Summary */}
                <div className="glass-card p-8 neon-border">
                  <div className="grid md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-extrabold gradient-text glow-text mb-2">
                        {optimizerResult.tokensSaved}
                      </div>
                      <div className="text-sm text-gray-400">Tokens Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-extrabold gradient-text glow-text mb-2">
                        {optimizerResult.percentSaved}%
                      </div>
                      <div className="text-sm text-gray-400">Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-green-400 mb-2">
                        ${optimizerResult.costPerMonth.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">Saved per Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-green-400 mb-2">
                        ${(optimizerResult.costPerMonth * 12).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">Saved per Year</div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-bold mb-3 gradient-text">What we changed:</h3>
                    <ul className="space-y-2">
                      {optimizerResult.changes.map((change, i) => (
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
                      <span className="text-sm text-gray-500">{optimizerResult.originalTokens} tokens</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {optimizerPrompt}
                    </div>
                  </div>

                  <div className="glass-card p-6 neon-border">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold gradient-text">Optimized</h3>
                      <span className="text-sm text-green-400">{optimizerResult.optimizedTokens} tokens</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto mb-4">
                      {optimizerResult.optimized}
                    </div>
                    <button
                      onClick={() => copyToClipboard(optimizerResult.optimized)}
                      className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple font-semibold hover:opacity-90 transition"
                    >
                      Copy Optimized Prompt
                    </button>
                  </div>
                </div>
              </>
            ) : optimizerResult && optimizerResult.tokensSaved === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-2xl font-bold mb-3 gradient-text">Already Optimized!</h3>
                <p className="text-gray-400">Your prompt is already concise. No improvements needed.</p>
              </div>
            ) : null}
          </div>
        )}

        {/* ── ROI CALCULATOR ──────────────────────────────────────────────── */}
        {activeTab === "roi" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-base font-bold text-gray-300">Your current setup</h2>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-300">Task / use case</label>
                  <div className="space-y-2">
                    {Object.entries(USE_CASES).map(([key, { label }]) => (
                      <button key={key} onClick={() => setRoiUseCase(key)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition ${
                          roiUseCase === key
                            ? "bg-gradient-to-r from-accent-blue/30 to-accent-purple/30 border border-accent-blue/50 text-white"
                            : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/20"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-300">Hours spent per month</label>
                    <span className="text-accent-blue font-bold">{hoursPerMonth}h</span>
                  </div>
                  <input type="range" min="1" max="500" value={hoursPerMonth}
                    onChange={e => setHoursPerMonth(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-blue" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1"><span>1h</span><span>500h</span></div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-300">Hourly rate / cost</label>
                    <span className="text-accent-blue font-bold">${hourlyRate}/hr</span>
                  </div>
                  <input type="range" min="10" max="500" value={hourlyRate}
                    onChange={e => setHourlyRate(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-blue" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1"><span>$10</span><span>$500</span></div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-300">Volume (messages/requests per day)</label>
                    <span className="text-accent-blue font-bold">{roiMessagesPerDay}/day</span>
                  </div>
                  <input type="range" min="1" max="1000" value={roiMessagesPerDay}
                    onChange={e => setRoiMessagesPerDay(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-blue" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1"><span>1</span><span>1000</span></div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-5">
              {/* Big savings number */}
              {roiCalc.savings > 0 ? (
                <div className="glass-card p-8 text-center neon-border">
                  <p className="text-sm text-gray-400 mb-2 uppercase tracking-widest font-semibold">Monthly Savings</p>
                  <p className="text-6xl md:text-7xl font-extrabold gradient-text glow-text">
                    ${roiCalc.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-gray-400 mt-2 text-sm">
                    ${roiCalc.annualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })} saved per year
                  </p>
                </div>
              ) : (
                <div className="glass-card p-8 text-center">
                  <p className="text-gray-400">Adjust the sliders — AI may not save money at this volume</p>
                </div>
              )}

              {/* Breakdown */}
              <div className="glass-card p-6 space-y-4">
                <h2 className="text-base font-bold text-gray-300">Cost Breakdown</h2>
                {[
                  { label: "Current monthly cost (human)", value: `$${roiCalc.humanCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-red-400" },
                  { label: `AI cost (${roiCalc.cheapModel.name})`, value: `$${roiCalc.aiCost.toFixed(2)}`, color: "text-green-400" },
                  { label: "Monthly savings", value: `$${roiCalc.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: roiCalc.savings > 0 ? "text-green-400 font-bold" : "text-red-400" },
                  { label: "ROI", value: `${roiCalc.roi.toFixed(0)}%`, color: "text-accent-blue" },
                  { label: "Payback period", value: roiCalc.paybackMonths ? `${roiCalc.paybackMonths} month${roiCalc.paybackMonths !== 1 ? "s" : ""}` : "N/A", color: "text-gray-300" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-gray-400">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a href="https://unfoldai.net" target="_blank" rel="noopener noreferrer"
                className="block w-full text-center px-8 py-4 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple font-bold text-lg hover:opacity-90 transition neon-border">
                {roiCalc.savings > 0
                  ? `Save $${roiCalc.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo — Let us set this up →`
                  : "Explore AI Setup Options →"
                }
              </a>

              <p className="text-center text-xs text-gray-500">
                Setup from $149 · Uses {roiCalc.cheapModel.name} at ${roiCalc.cheapModel.inputPer1M}/1M input tokens
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

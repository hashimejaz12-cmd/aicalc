"use client";

import { useState, useEffect } from "react";

export function EmailCaptureBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("unfold_email_bar_dismissed");
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email,
          source: "email_bar",
          businessType: "",
          message: "",
        }),
      });
      setEmail("");
      setIsVisible(false);
      localStorage.setItem("unfold_email_bar_dismissed", "true");
    } catch (error) {
      console.error("Error submitting email:", error);
    }
    setLoading(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("unfold_email_bar_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="sticky top-0 z-40 w-full" style={{ background: "linear-gradient(90deg, rgba(14,165,233,0.1), rgba(139,92,246,0.1))", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm sm:text-base whitespace-nowrap">🔥 Limited spots this month — Get your AI assistant set up in 24 hours</span>
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 min-w-[250px]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent-blue/50 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-purple text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "..." : "Get Started"}
            </button>
          </form>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white text-xl transition flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

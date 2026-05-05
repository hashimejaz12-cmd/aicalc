"use client";

import { useState } from "react";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: "cta_button" | "chat" | "pricing" | "exit_intent";
}

export function LeadCaptureModal({ isOpen, onClose, source }: LeadCaptureModalProps) {
  const [step, setStep] = useState<"form" | "thanks">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem("unfold_leads") || "[]");
      existing.push({
        name,
        email,
        source,
        businessType,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("unfold_leads", JSON.stringify(existing));

      // Send to API
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          source,
          businessType,
          message: "",
        }),
      });

      setStep("thanks");
      setTimeout(() => {
        onClose();
        setStep("form");
        setName("");
        setEmail("");
        setBusinessType("");
      }, 3000);
    } catch (error) {
      console.error("Error submitting lead:", error);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl neon-border p-8" style={{ background: "rgba(5,5,16,0.95)", backdropFilter: "blur(20px)" }}>
        {step === "form" ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Get Your AI Assistant Set Up</h2>
              <p className="text-gray-400">We'll contact you within 24 hours</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-accent-blue/50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-accent-blue/50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What's your biggest time waster at work?</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-accent-blue/50 transition text-white"
                >
                  <option value="">Select one...</option>
                  <option value="Email management">Email management</option>
                  <option value="Scheduling">Scheduling</option>
                  <option value="Research">Research</option>
                  <option value="Customer support">Customer support</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Claim My Spot →"}
              </button>
            </form>

            <button
              onClick={onClose}
              className="mt-4 w-full py-2 text-gray-400 hover:text-white transition"
            >
              Maybe later
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
            <p className="text-gray-400 mb-6">
              We'll contact you within 24 hours to get started.
            </p>
            <p className="text-sm text-gray-500">Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface ExitIntentPopupProps {
  onClose: () => void;
}

export function ExitIntentPopup({ onClose }: ExitIntentPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("unfold_exit_intent_shown");
    if (shown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsOpen(true);
        sessionStorage.setItem("unfold_exit_intent_shown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          source: "exit_intent",
          businessType: "demo_request",
          message: "Requested 15-min demo call",
        }),
      });

      // Show success and close
      const btn = document.querySelector("[data-exit-submit]");
      if (btn) {
        btn.textContent = "Demo booked! 🎉";
        btn.setAttribute("disabled", "true");
      }

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting demo request:", error);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl neon-border p-8 relative" style={{ background: "rgba(5,5,16,0.95)", backdropFilter: "blur(20px)" }}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl transition"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Wait! Before you go...</h2>
          <p className="text-gray-400">
            Get a FREE 15-min demo call — see exactly what your AI assistant would do for YOUR business
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-accent-blue/50 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            data-exit-submit
            className="w-full py-3 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Booking..." : "Book My Free Demo →"}
          </button>
        </form>

        <button
          onClick={handleClose}
          className="mt-4 w-full py-2 text-gray-400 hover:text-white transition text-sm"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}

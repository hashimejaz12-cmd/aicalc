import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Use OpenRouter with Gemini Flash (cheapest option)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://aicalc.tools",
        "X-Title": "AICalc Prompt Optimizer",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          {
            role: "user",
            content: `You are an expert prompt optimizer. Rewrite the following prompt to be 40-60% shorter while maintaining EXACT functionality and meaning. Remove:
- Filler words and redundancy
- Verbose explanations
- Unnecessary politeness
- Repetitive examples

Keep:
- All key instructions
- Required context
- Specific constraints
- Technical details

Output ONLY the optimized prompt, no explanations.

Original prompt:
${prompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      throw new Error("Optimization failed");
    }

    const data = await response.json();
    const optimized = data.choices[0]?.message?.content || "";

    return NextResponse.json({
      optimized,
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
      },
    });
  } catch (error: any) {
    console.error("Optimization error:", error);
    return NextResponse.json(
      { error: error.message || "Optimization failed" },
      { status: 500 }
    );
  }
}

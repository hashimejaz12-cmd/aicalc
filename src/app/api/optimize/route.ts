import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key not found in environment variables" }, { status: 500 });
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
      const errorText = await response.text();
      console.error("OpenRouter error:", response.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter API error (${response.status}): ${errorText.substring(0, 200)}` },
        { status: response.status }
      );
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
      { 
        error: error.message || "Optimization failed",
        details: error.toString().substring(0, 200)
      },
      { status: 500 }
    );
  }
}

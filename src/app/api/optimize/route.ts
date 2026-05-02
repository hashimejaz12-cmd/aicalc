import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20250514",
      max_tokens: 2048,
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
    });

    const optimized = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      optimized,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
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

// Simplified SDK-first route with HTTP fallback for diagnostics.
"use server";

import { NextRequest, NextResponse } from "next/server";

// Accept either GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY for flexibility
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GOOGLE_GEMINI_MODEL || "gemini-2.5-flash";

function buildPrompt(task: string, text: string, tone?: string) {
  switch (task) {
    case "summarize":
      return `Summarize this text in 2-3 concise lines:\n\n${text}`;
    
    case "getTags":
      return `Analyze the following text and suggest 3-5 relevant tags or keywords that categorize this content. Return only the tags as a comma-separated list without explanations.\n\nText:\n${text}`;
    
    case "grammarCheck":
      return `Check the following text for grammar, spelling, and punctuation errors. Provide corrections and suggestions in a clear, concise format. If there are no errors, say "No grammar issues found."\n\nText:\n${text}`;
    
    case "glossaryHighlight":
      return `Identify and list important technical terms, concepts, or glossary-worthy words in the following text. Return only the terms as a comma-separated list without explanations.\n\nText:\n${text}`;
    
    case "readabilityCheck":
      return `Analyze the readability of the following text. Provide feedback on:\n1. Reading level and complexity\n2. Sentence structure\n3. Suggestions for improvement\n\nText:\n${text}`;
    
    case "rewrite":
      const toneInstruction = tone === 'formal' ? 'formal and professional' : 'concise and clear';
      return `Rewrite the following text in a ${toneInstruction} tone while maintaining the original meaning:\n\nText:\n${text}`;
    
    default:
      return text;
  }
}

function bodiesForGenerateContent(promptText: string) {
  const baseConfig = { temperature: 0.3, maxOutputTokens: 512 };
  // Use the correct Gemini API structure with parts array
  return [
    { contents: [{ parts: [{ text: promptText }] }], generationConfig: baseConfig },
    { contents: [{ parts: [{ text: promptText }] }] },
  ];
}

const GEMINI_BASES = [
  `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}`,
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}`,
];

export async function POST(req: NextRequest) {
  try {
    const { task = "summarize", text, tone, model: requestedModel } = await req.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing 'text' in request body" }, { status: 400 });
    }

    const prompt = buildPrompt(task, text, tone);
    const modelToUse = requestedModel || GEMINI_MODEL;

    // Try SDK via runtime require (uses local wrapper to avoid build-time bundling)
    try {
      // `route.ts` is at `src/app/api/ai/route.ts` so `src/lib` is three levels up
      const { getGeminiSDK } = await import("../../../lib/getGeminiSdk");
      const SDK = getGeminiSDK();
      if (SDK) {
        try {
          const client = new SDK({ apiKey: GEMINI_API_KEY });
          const sdkResp = await client.models.generateContent({ 
            model: modelToUse, 
            contents: [{ parts: [{ text: prompt }] }]
          });
          const out = sdkResp?.text ?? sdkResp?.output?.[0]?.content?.[0]?.text ?? sdkResp?.output?.[0]?.text ?? null;
          if (out) return NextResponse.json({ result: out, modelUsed: modelToUse });
        } catch (e: any) {
          console.error("GenAI SDK call failed, falling back to HTTP:", e?.message ?? String(e));
        }
      }
    } catch (e) {
      // wrapper import failed; fall back to HTTP
    }

    // HTTP fallback: try v1 and v1beta endpoints with canonical bodies
    const attemptedEndpoints: Array<any> = [];
    for (const base of GEMINI_BASES) {
      const url = `${base}:generateContent?key=${GEMINI_API_KEY}`;
      const candidateBodies = bodiesForGenerateContent(prompt);
      for (const triedBody of candidateBodies) {
        try {
          const bodyStr = JSON.stringify(triedBody);
          if (bodyStr.length > 19000) {
            attemptedEndpoints.push({ url, triedBody, skipped: true, reason: 'payload too large' });
            continue;
          }
          const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: bodyStr });
          const textBody = await resp.text().catch(() => "");
          let jsonBody: any = null;
          try { jsonBody = textBody ? JSON.parse(textBody) : null; } catch (_) { jsonBody = null; }
          const errorMessage = jsonBody?.error?.message ?? null;
          attemptedEndpoints.push({ url, status: resp.status, triedBody, body: jsonBody ?? textBody, errorMessage });
          if (!resp.ok) continue;
          const candidateOutput = jsonBody?.candidates?.[0]?.content?.parts?.[0]?.text ?? jsonBody?.text ?? null;
          if (candidateOutput) return NextResponse.json({ result: candidateOutput, modelUsed: GEMINI_MODEL, attemptedEndpoints });
        } catch (e: any) {
          attemptedEndpoints.push({ url, error: String(e) });
        }
      }
    }

    // All attempts failed: return a short fallback and diagnostics
    const fallback = text.split(/[\.\n]/)[0].slice(0, 180) || text.slice(0, 180);
    return NextResponse.json({ result: fallback, fallbackUsed: true, attemptedEndpoints });
  } catch (err: any) {
    console.error('AI SERVER ERROR:', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

// Correct File Location: src/app/api/ai/route.ts
"use server"
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Define the structure of the request body
interface GroqApiRequestBody {
  task: string;
  text: string;
  tone?: 'concise' | 'formal' | 'casual' | 'professional';
}

// Enhanced task prompts with better instructions
const taskPrompts: { [key: string]: (text: string, tone?: any) => string } = {
  summarize: (text) => `Summarize the following text in 1-2 concise lines, capturing the main points:\n\n${text}`,
  
  getTags: (text) => `Analyze the following text and generate 3-5 relevant keyword tags that best represent the content. Focus on main topics, concepts, and themes. Respond with only a comma-separated list without numbering or additional text.\n\nText: "${text}"`,
  
  glossaryHighlight: (text) => `Identify 5-8 key terms, concepts, or technical words from the following text that would be valuable in a glossary. These should be terms that readers might want to look up or understand better. Respond with only a comma-separated list of the terms.\n\nText: "${text}"`,
  
  grammarCheck: (text) => `Analyze the following text for grammar, spelling, punctuation, and readability issues. For each error found, provide the correction in this format: "ERROR: [original text] → CORRECTION: [corrected text]". If no errors are found, respond with "No errors detected." Focus on common issues like subject-verb agreement, tense consistency, punctuation, and spelling.\n\nText: "${text}"`,
  
  readabilityCheck: (text) => `Analyze the readability of the following text. Identify any sentences that are too long, complex, or hard to understand. For each readability issue, suggest a simpler alternative. Also provide a brief readability score (1-10, where 10 is very easy to read). Respond in this format: "READABILITY SCORE: [score]/10. ISSUES: [list issues with suggestions]".\n\nText: "${text}"`,
  
  rewrite: (text, tone) => `Rewrite the following text in a ${tone} tone while maintaining the original meaning and key information. Respond with only the rewritten text.\n\nText: "${text}"`,
};

// This function handles POST requests to /api/ai
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { task, text, tone } = (await request.json()) as GroqApiRequestBody;

    // Validate the input
    if (!task || !text || !taskPrompts[task]) {
      return NextResponse.json({ error: 'Invalid task or missing text.' }, { status: 400 });
    }

    // Generate the prompt based on the task
    const promptContent = taskPrompts[task](text, tone);

    // Call the Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: promptContent }],
      model: 'llama3-8b-8192',
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 1000,
    });

    const result = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    // Send the successful response back to the client
    return NextResponse.json({ result });

  } catch (error) {
    console.error('Groq API Error:', error);
    // Return an error response
    return NextResponse.json({ error: 'Failed to communicate with Groq API.' }, { status: 500 });
  }
}

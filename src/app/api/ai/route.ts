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

// A map of tasks to their corresponding system prompts
const taskPrompts: { [key: string]: (text: string, tone?: any) => string } = {
  summarize: (text) => `Summarize the following text concisely:\n\n${text}`,
  getTags: (text) => `Generate a list of 3-5 relevant keyword tags for the following text. Respond with only a comma-separated list.\n\nText: "${text}"`,
  glossaryHighlight: (text) => `Identify key terms from the following text that would belong in a glossary. Respond with only a comma-separated list of the terms.\n\nText: "${text}"`,
  grammarCheck: (text) => `Correct any grammar and spelling mistakes in the following text. Respond with only the corrected text.\n\nText: "${text}"`,
  rewrite: (text, tone) => `Rewrite the following text in a ${tone} tone. Respond with only the rewritten text.\n\nText: "${text}"`,
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

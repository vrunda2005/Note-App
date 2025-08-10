// File: utils/api.ts

// A single, reusable function to call our secure backend endpoint.
async function callMyBackend(task: string, text: string, tone?: 'concise' | 'formal') {
  const response = await fetch('/api/ai', { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ task, text, tone }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  const data = await response.json();
  return data.result;
}

// Export a specific function for each AI task
export async function getSummary(text: string): Promise<string> {
  if (!text) return '';
  return callMyBackend('summarize', text);
}

export async function getTags(text: string): Promise<string[]> {
  if (!text) return [];
  const tagsString = await callMyBackend('getTags', text);
  return tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];
}

export async function grammarCheck(text: string): Promise<string> {
  if (!text) return text;
  return callMyBackend('grammarCheck', text);
}

export async function glossaryHighlight(text: string): Promise<string[]> {
  if (!text) return [];
  const termsString = await callMyBackend('glossaryHighlight', text);
  return termsString ? termsString.split(',').map(term => term.trim()) : [];
}

export async function rewriteNote(text: string, tone: 'concise' | 'formal'): Promise<string> {
  if (!text) return text;
  return callMyBackend('rewrite', text, tone);
}
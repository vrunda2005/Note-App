// src/hooks/useAI.ts

import { useState } from 'react';

// This defines the structure for API requests
interface AIRequest {
  task: 'summarize' | 'getTags' | 'grammarCheck' | 'glossaryHighlight' | 'readabilityCheck' | 'rewrite';
  text: string;
}

// Reusable function to call the backend API
const callMyBackend = async (body: AIRequest): Promise<any> => {
  try {
    const response = await fetch('/api/ai', { // Use the correct relative URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // If the server responds with an error status, throw an error
    if (!response.ok) {
      // Try to get a more specific error message from the response body
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    // If the response is OK, parse and return the JSON
    const json = await response.json();
    // If the server indicates it used a local fallback, surface a small notification so users
    // understand that AI output was generated locally (development fallback).
    if (json && json.fallbackUsed) {
      try {
        // Dispatch a non-blocking CustomEvent so the UI can show a banner or toast.
        // Event detail includes optional modelUsed and attemptedModels for richer debugging.
        window.dispatchEvent(new CustomEvent('ai:fallback', { detail: { modelUsed: json.modelUsed ?? null, attemptedModels: json.attemptedModels ?? null, task: body.task } }));
      } catch (e) {
        /* ignore */
      }
    }
    return json;

  } catch (error) {
    // Log the error and re-throw it to be handled by the calling function
    console.error('API call failed:', error);
    throw error;
  }
};

export const useAI = () => {
  const [aiLoading, setAiLoading] = useState(false);

  const generateSummary = async (text: string): Promise<string | null> => {
    setAiLoading(true);
    try {
      const data = await callMyBackend({ task: 'summarize', text });
      return data.result;
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  const suggestTags = async (text: string): Promise<string[] | null> => {
    setAiLoading(true);
    try {
      const data = await callMyBackend({ task: 'getTags', text });
      // The API returns a comma-separated string, so we split it
      const raw: string = typeof data.result === 'string' ? data.result : String(data.result);
      return raw.split(',').map((tag: string) => tag.trim());
    } catch (error) {
      console.error('Failed to suggest tags:', error);
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  const checkGrammar = async (text: string): Promise<string | null> => {
    setAiLoading(true);
    try {
      const data = await callMyBackend({ task: 'grammarCheck', text });
      return data.result;
    } catch (error) {
      console.error('Failed to check grammar:', error);
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  const highlightGlossary = async (text: string): Promise<string[] | null> => {
    setAiLoading(true);
    try {
      const data = await callMyBackend({ task: 'glossaryHighlight', text });
      const raw: string = typeof data.result === 'string' ? data.result : String(data.result);
      return raw.split(',').map((term: string) => term.trim());
    } catch (error) {
      console.error('Failed to highlight glossary:', error);
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  const checkReadability = async (text: string): Promise<string | null> => {
    setAiLoading(true);
    try {
      const data = await callMyBackend({ task: 'readabilityCheck', text });
      return data.result;
    } catch (error) {
      console.error('Failed to check readability:', error);
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  return { 
    aiLoading, 
    generateSummary, 
    suggestTags, 
    checkGrammar, 
    highlightGlossary,
    checkReadability 
  };
};
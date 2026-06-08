// src/hooks/useAIFeatures.ts
import { useCallback } from 'react';
import { useAI } from './useAI';
import { Note } from '@/types';

interface UseAIFeaturesProps {
  selectedNote: Note | null;
  unlockedContent?: string | null;
  updateNote: (note: Partial<Note> & { id: string }) => Promise<void>;
  onGlossaryTermsUpdate?: (terms: string[]) => void;
  onGrammarResultsUpdate?: (results: string | null) => void;
  onReadabilityResultsUpdate?: (results: string | null) => void;
}

interface AIFeatureHandlers {
  handleSuggestTags: () => Promise<void>;
  handleGenerateSummary: () => Promise<void>;
  handleGrammarCheck: () => Promise<void>;
  handleGlossaryHighlight: () => Promise<void>;
  handleReadabilityCheck: () => Promise<void>;
  aiLoading: boolean;
}

/**
 * Custom hook to handle all AI-related features in a centralized way.
 * Eliminates code duplication across components.
 */
export const useAIFeatures = ({
  selectedNote,
  unlockedContent,
  updateNote,
  onGlossaryTermsUpdate,
  onGrammarResultsUpdate,
  onReadabilityResultsUpdate,
}: UseAIFeaturesProps): AIFeatureHandlers => {
  const { aiLoading, generateSummary, suggestTags, checkGrammar, highlightGlossary, checkReadability } = useAI();

  /**
   * Get the current note content (unlocked or regular)
   */
  const getNoteContent = useCallback((): string => {
    if (!selectedNote) return '';
    return unlockedContent ?? selectedNote.content ?? '';
  }, [selectedNote, unlockedContent]);

  /**
   * Validate if content exists before processing
   */
  const validateContent = useCallback((): boolean => {
    const content = getNoteContent();
    if (!content.trim()) {
      console.warn('No content available for AI processing');
      return false;
    }
    return true;
  }, [getNoteContent]);

  /**
   * Generic error handler for AI operations
   */
  const handleAIError = useCallback((operation: string, error: unknown) => {
    console.error(`Error in ${operation}:`, error);
    alert(`Failed to ${operation}. Please try again.`);
  }, []);

  /**
   * Suggest tags for the current note
   */
  const handleSuggestTags = useCallback(async () => {
    if (!selectedNote || !validateContent()) return;

    try {
      const content = getNoteContent();
      const newTags = await suggestTags(content);
      
      if (newTags && newTags.length > 0) {
        const mergedTags = Array.from(new Set([...(selectedNote.tags || []), ...newTags]));
        await updateNote({ id: selectedNote.id, tags: mergedTags });
        alert(`Added ${newTags.length} new tag(s) to your note!`);
      } else {
        alert('No suitable tags could be generated for this note.');
      }
    } catch (error) {
      handleAIError('suggest tags', error);
    }
  }, [selectedNote, validateContent, getNoteContent, suggestTags, updateNote, handleAIError]);

  /**
   * Generate summary for the current note
   */
  const handleGenerateSummary = useCallback(async () => {
    if (!selectedNote || !validateContent()) return;

    try {
      const content = getNoteContent();
      const summary = await generateSummary(content);
      
      if (summary) {
        await updateNote({ id: selectedNote.id, summary });
        alert('Summary generated successfully!');
      } else {
        alert('Could not generate a summary. Please try again.');
      }
    } catch (error) {
      handleAIError('generate summary', error);
    }
  }, [selectedNote, validateContent, getNoteContent, generateSummary, updateNote, handleAIError]);

  /**
   * Check grammar in the current note
   */
  const handleGrammarCheck = useCallback(async () => {
    if (!validateContent()) return;

    try {
      const content = getNoteContent();
      const results = await checkGrammar(content);
      
      if (results) {
        console.log('Grammar check results:', results);
        if (onGrammarResultsUpdate) {
          onGrammarResultsUpdate(results);
        } else {
          alert(`Grammar check completed!\n\n${results}`);
        }
      } else {
        if (onGrammarResultsUpdate) {
          onGrammarResultsUpdate('No issues found!');
        } else {
          alert('No grammar issues found!');
        }
      }
    } catch (error) {
      if (onGrammarResultsUpdate) {
        onGrammarResultsUpdate(null);
      }
      handleAIError('check grammar', error);
    }
  }, [validateContent, getNoteContent, checkGrammar, onGrammarResultsUpdate, handleAIError]);

  /**
   * Highlight glossary terms in the current note
   */
  const handleGlossaryHighlight = useCallback(async () => {
    if (!validateContent()) return;

    try {
      const content = getNoteContent();
      const terms = await highlightGlossary(content);
      
      if (terms && terms.length > 0) {
        if (onGlossaryTermsUpdate) {
          onGlossaryTermsUpdate(terms);
        }
        alert(`Found ${terms.length} glossary term(s)! They are now highlighted in your note.`);
      } else {
        if (onGlossaryTermsUpdate) {
          onGlossaryTermsUpdate([]);
        }
        alert('No glossary terms found in this note.');
      }
    } catch (error) {
      if (onGlossaryTermsUpdate) {
        onGlossaryTermsUpdate([]);
      }
      handleAIError('highlight glossary terms', error);
    }
  }, [validateContent, getNoteContent, highlightGlossary, onGlossaryTermsUpdate, handleAIError]);

  /**
   * Check readability of the current note
   */
  const handleReadabilityCheck = useCallback(async () => {
    if (!validateContent()) return;

    try {
      const content = getNoteContent();
      const results = await checkReadability(content);
      
      if (results) {
        console.log('Readability check results:', results);
        if (onReadabilityResultsUpdate) {
          onReadabilityResultsUpdate(results);
        } else {
          alert(`Readability Analysis:\n\n${results}`);
        }
      } else {
        if (onReadabilityResultsUpdate) {
          onReadabilityResultsUpdate('Could not analyze readability. Please try again.');
        } else {
          alert('Could not analyze readability. Please try again.');
        }
      }
    } catch (error) {
      if (onReadabilityResultsUpdate) {
        onReadabilityResultsUpdate(null);
      }
      handleAIError('check readability', error);
    }
  }, [validateContent, getNoteContent, checkReadability, onReadabilityResultsUpdate, handleAIError]);

  return {
    handleSuggestTags,
    handleGenerateSummary,
    handleGrammarCheck,
    handleGlossaryHighlight,
    handleReadabilityCheck,
    aiLoading,
  };
};

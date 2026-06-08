import { useEffect, useState, useRef } from 'react';
import type { Note } from '../types';
import { encryptContent, decryptContent } from '../utils/encryption';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [unlockedContents, setUnlockedContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
        if (data.length > 0 && !selectedNoteId) {
          // Only set if not already set, or if current selection is invalid? 
          // Actually, let's just keep selection if valid.
        }
      }
    } catch (error) {
      console.error('Failed to fetch notes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const createNewNote = async () => {
    const tempNote = {
      title: '',
      content: '',
      tags: [],
      pinned: false,
      passwordProtected: false,
      summary: ''
    };

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempNote)
      });
      if (res.ok) {
        const newNote = await res.json();
        setNotes(prev => [newNote, ...prev]);
        setSelectedNoteId(newNote.id);
      }
    } catch (error) {
      console.error('Failed to create note', error);
    }
  };

  // Ref to track pending updates for debouncing
  const pendingUpdates = useRef<Record<string, NodeJS.Timeout>>({});

  const updateNote = async (partial: Partial<Note> & { id: string }) => {
    // Optimistic update (immediate UI feedback)
    setNotes(prev => prev.map(n => n.id === partial.id ? { ...n, ...partial, lastModified: Date.now() } : n));

    // Clear existing timeout for this note
    if (pendingUpdates.current[partial.id]) {
      clearTimeout(pendingUpdates.current[partial.id]);
    }

    // Set new timeout (debounce 1000ms)
    pendingUpdates.current[partial.id] = setTimeout(async () => {
      try {
        await fetch(`/api/notes/${partial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partial)
        });
        delete pendingUpdates.current[partial.id];
      } catch (error) {
        console.error('Failed to update note', error);
      }
    }, 1000);
  };

  const deleteSelected = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);

    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  const togglePin = async (id: string) => {
    const n = notes.find(x => x.id === id);
    if (!n) return;
    updateNote({ id, pinned: !n.pinned });
  };

  const encryptNote = async (note: Note, password: string) => {
    const enc = await encryptContent(note.content, password);
    updateNote({ id: note.id, passwordProtected: true, encryptedContent: enc, content: '' });
  };

  const decryptNote = async (note: Note, password: string) => {
    if (!note.encryptedContent) return null;
    try {
      return await decryptContent(note.encryptedContent, password);
    } catch (e) {
      console.error('decryptNote failed:', e);
      return null;
    }
  };

  const setUnlockedContent = (noteId: string, content: string | null) => {
    setUnlockedContents(prev => {
      const next = { ...prev };
      if (content === null) {
        delete next[noteId];
      } else {
        next[noteId] = content;
      }
      return next;
    });
  };

  const migrateLocalNotes = async () => {
    try {
      const { getAllNotes } = await import('../utils/storage');
      const localNotes = await getAllNotes();
      let count = 0;
      for (const note of localNotes) {
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: note.title,
            content: note.content,
            tags: note.tags,
            pinned: note.pinned,
            passwordProtected: note.passwordProtected,
            summary: note.summary
          })
        });
        count++;
      }
      fetchNotes();
      return count;
    } catch (error) {
      console.error('Migration failed', error);
      return 0;
    }
  };

  const shareNote = async (id: string, email: string) => {
    try {
      const res = await fetch(`/api/notes/${id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('Failed to share');
      const data = await res.json();
      setNotes(prev => prev.map(n => n.id === id ? { ...n, sharedWith: data.sharedWith } : n));
      return true;
    } catch (error) {
      console.error('Share error', error);
      return false;
    }
  };

  return {
    notes,
    selectedNote: notes.find(n => n.id === selectedNoteId) ?? null,
    unlockedContents,
    setUnlockedContent,
    selectedNoteId,
    setSelectedNoteId,
    createNewNote,
    updateNote,
    deleteSelected,
    togglePin,
    encryptNote,
    decryptNote,
    shareNote,
    migrateLocalNotes,
    loading
  };
}

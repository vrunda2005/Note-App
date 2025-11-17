import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Note } from '../types';
import { getAllNotes, saveNote, deleteNote } from '../utils/storage';
import { encryptContent, decryptContent } from '../utils/encryption';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  // Transient in-memory store for decrypted (unlocked) content. This is not persisted
  // to IndexedDB. When a user unlocks a note, we keep the decrypted content here so
  // the UI can display it without changing persistence (the note stays passwordProtected)
  // until the user explicitly removes the password.
  const [unlockedContents, setUnlockedContents] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const all = await getAllNotes();
      setNotes(all);
      if (all.length > 0) setSelectedNoteId(all[0].id);
        })();
  }, []);

  const createNewNote = async () => {
    const note: Note = {
        id: uuidv4(),
        title: '',
        content: '',
        tags: [],
        pinned: false,
        passwordProtected: false,
        lastModified: Date.now(),
        summary: ''
    };
    setNotes(prev => [note, ...prev]);
    await saveNote(note);
    setSelectedNoteId(note.id);
  };



  const updateNote = async (partial: Partial<Note> & { id: string }) => {
    // Use functional state update and persist the updated note based on that
    setNotes(prev => {
      const next = prev.map(n => n.id === partial.id ? { ...n, ...partial, lastModified: Date.now() } : n);
      // Persist asynchronously based on the computed next state to avoid using stale `notes`
      (async () => {
        const toSave = next.find(n => n.id === partial.id);
        if (toSave) await saveNote(toSave);
      })();
      return next;
    });
  };

  const deleteSelected = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    await deleteNote(id);
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  
  const togglePin = async (id: string) => {
    const n = notes.find(x => x.id === id);
    if (!n) return;
    const updated = { ...n, pinned: !n.pinned, lastModified: Date.now() };
    await saveNote(updated);
    setNotes(prev => prev.map(x => x.id === id ? updated : x));
  };

  const encryptNote = async (note: Note, password: string) => {
    const enc = await encryptContent(note.content, password);
    const updated = { ...note, passwordProtected: true, encryptedContent: enc, content: '' };
    await saveNote(updated);
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
  };

  const decryptNote = async (note: Note, password: string) => {
    if (!note.encryptedContent) return null;
    try {
      const decrypted = await decryptContent(note.encryptedContent, password);
      return decrypted;
    } catch (e) {
      // Decryption failed (bad password or corrupted data) — return null so callers
      // can show an appropriate error message instead of a thrown exception.
      console.error('decryptNote failed:', e);
      return null;
    }
  };

  // Set transient decrypted content for a note (in-memory only). Use this when the
  // user successfully unlocks a note so the UI can show the plaintext without
  // modifying the stored encrypted data.
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

  return {
    notes,
    selectedNote: notes.find(n=>n.id===selectedNoteId) ?? null,
    unlockedContents,
    setUnlockedContent,
    selectedNoteId,
    setSelectedNoteId,
    createNewNote,
    updateNote,
    deleteSelected,
    togglePin,
    encryptNote,
    decryptNote
  };
}

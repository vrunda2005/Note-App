import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Note } from '../types';
import { getAllNotes, saveNote, deleteNote } from '../utils/storage';
import { encryptContent, decryptContent } from '../utils/encryption';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

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
    setNotes(prev => {
      const next = prev.map(n => n.id === partial.id ? { ...n, ...partial, lastModified: Date.now() } : n);
      return next;
    });
    // save to DB
    const all = notes.map(n => n.id === partial.id ? { ...n, ...partial, lastModified: Date.now() } : n);
    const toSave = all.find(n => n.id === partial.id);
    if (toSave) await saveNote(toSave);
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
    const decrypted = await decryptContent(note.encryptedContent, password);
    return decrypted;
  };

  return {
    notes,
    selectedNote: notes.find(n=>n.id===selectedNoteId) ?? null,
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

"use client"
import React, { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { useAI } from '@/hooks/useAI';
import NotesSidebar from '@/components/NotesSidebar';
import NoteEditor from '@/components/NoteEditor';
import PasswordModal from '@/components/PasswordModal';
import SummaryBox from '@/components/SummaryBox';
import AppHeader from '@/components/AppHeader';
import { Plus, Lock, LockOpen, Search } from 'lucide-react';

const Home: React.FC = () => {
  const {
    notes,
    selectedNote,
    selectedNoteId,
    setSelectedNoteId,
    createNewNote,
    updateNote,
    deleteSelected,
    togglePin,
    encryptNote,
    decryptNote,


  } = useNotes();

  const { aiLoading, generateSummary, suggestTags, checkGrammar, highlightGlossary } = useAI();

  const [searchTerm, setSearchTerm] = useState('');
  const [passwordModal, setPasswordModal] = useState<{ show: boolean; noteId: string | null }>({ show: false, noteId: null });
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState('');
  const [glossaryTerms, setGlossaryTerms] = useState<string[]>([]); // To hold terms for highlighting

  // Selecting note: prompt password if needed and clear old highlights
  const handleSelectNote = (id: string) => {
    setGlossaryTerms([]); // Clear highlights from previous note
    const note = notes.find((n) => n.id === id);
    if (note?.passwordProtected && note.encryptedContent) {
      setPasswordModal({ show: true, noteId: id });
      setDecryptionError('');
    } else {
      setSelectedNoteId(id);
    }
  };

  // Decrypt note on password submit
  const handlePasswordSubmit = async (password: string) => {
    if (!passwordModal.noteId) return;
    const note = notes.find((n) => n.id === passwordModal.noteId);
    if (!note) return;

    setIsDecrypting(true);
    try {
      const decrypted = await decryptNote(note, password);
      if (decrypted !== null) {
        await updateNote({
          id: note.id,
          content: decrypted,
          passwordProtected: false,
          encryptedContent: undefined,
        });
        setPasswordModal({ show: false, noteId: null });
        setSelectedNoteId(note.id);
      } else {
        setDecryptionError('Incorrect password');
      }
    } finally {
      setIsDecrypting(false);
    }
  };

  // Encrypt note
  const handleEncryptNote = async () => {
    if (!selectedNote) return;
    const password = prompt('Enter a password to protect this note:');
    if (password) {
      await encryptNote(selectedNote, password);
    }
  };

  // --- AI handlers with corrected logic ---

  const handleGenerateSummary = async () => {
    if (!selectedNote?.content?.trim()) return;
    try {
      const summary = await generateSummary(selectedNote.content);
      if (summary) {
        await updateNote({ id: selectedNote.id, summary });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const handleSuggestTags = async () => {
    if (!selectedNote?.content?.trim()) return;
    try {
      const newTags = await suggestTags(selectedNote.content);
      if (newTags && newTags.length > 0) {
        const mergedTags = Array.from(new Set([...(selectedNote.tags || []), ...newTags]));
        await updateNote({ id: selectedNote.id, tags: mergedTags });
      }
    } catch (error) {
      console.error('Error suggesting tags:', error);
    }
  };

  const handleGrammarCheck = async () => {
    if (!selectedNote?.content?.trim()) return;
    try {
      const corrected = await checkGrammar(selectedNote.content);
      if (corrected) {
        await updateNote({ id: selectedNote.id, content: corrected });
      }
    } catch (error) {
      console.error('Error checking grammar:', error);
    }
  };

  // CORRECTED: This now gets terms and stores them in state instead of replacing content.
  const handleGlossaryHighlight = async () => {
    if (!selectedNote?.content?.trim()) return;
    try {
      const terms = await highlightGlossary(selectedNote.content);
      if (terms && terms.length > 0) {
        setGlossaryTerms(terms);
      }
    } catch (error) {
      console.error('Error highlighting glossary:', error);
      setGlossaryTerms([]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 text-white flex flex-col border-r border-gray-800">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h1 className="text-lg font-semibold">My Notes</h1>
          <button
            onClick={createNewNote}
            className="p-2 bg-blue-500 rounded hover:bg-blue-600 transition"
            title="New Note"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-800">
          <div className="flex items-center bg-gray-800 rounded px-2 py-1">
            <Search size={16} className="text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="bg-transparent outline-none text-sm text-gray-200 ml-2 flex-1"
            />
          </div>
        </div>

        {/* Notes list */}
        <NotesSidebar
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelect={handleSelectNote}
          onDelete={(id) => {
            if (window.confirm('Are you sure you want to delete this note?')) {
              deleteSelected(id);
            }
          }}
          onPinToggle={togglePin}
          onCreateNew={createNewNote}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 flex flex-col overflow-y-auto">
        {selectedNote ? (
          <>
            <AppHeader
              selectedNote={selectedNote}
              onProtectNote={handleEncryptNote}
              onCreateNewNote={createNewNote}
              lockIcon={selectedNote.passwordProtected ? <Lock size={16} /> : <LockOpen size={16} />}
            />
            <NoteEditor
              title={selectedNote.title}
              content={selectedNote.content}
              tags={selectedNote.tags || []}
              aiLoading={aiLoading}
              passwordProtected={!!selectedNote.passwordProtected}
              onTitleChange={(title) => updateNote({ id: selectedNote.id, title })}
              onContentChange={(content) => updateNote({ id: selectedNote.id, content })}
              onTagsChange={(tags) => updateNote({ id: selectedNote.id, tags })}
              onSuggestTags={handleSuggestTags}
              onGrammarCheck={handleGrammarCheck}
              onGenerateSummary={handleGenerateSummary}
              onGlossaryHighlight={handleGlossaryHighlight}
              glossaryTerms={glossaryTerms} // Pass the terms down as a prop
            />
            {selectedNote.summary && <SummaryBox summary={selectedNote.summary} />}
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500">
            <p>Select or create a note to get started.</p>
          </div>
        )}
      </main>

      {passwordModal.show && (
        <PasswordModal
          passwordError={decryptionError}
          isLoading={isDecrypting}
          onSubmit={handlePasswordSubmit}
          onCancel={() => setPasswordModal({ show: false, noteId: null })}
        />
      )}
    </div>
  );
};

export default Home;
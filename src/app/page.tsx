"use client";

import React, { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import { useAI } from "@/hooks/useAI";
import NotesSidebar from "@/components/NotesSidebar";
import NoteEditor from "@/components/NoteEditor";
import SummaryBox from "@/components/SummaryBox";
import AppHeader from "@/components/AppHeader";
import DrawCanvas from "@/components/DrawCanvas";
import { BookOpen, Plus, Menu, X } from "lucide-react";

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
    unlockedContents,
    setUnlockedContent,
  } = useNotes();

  const { aiLoading, generateSummary, suggestTags, checkGrammar, highlightGlossary, checkReadability } = useAI();

  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  const [glossaryTerms, setGlossaryTerms] = useState<string[]>([]);
  const [showLockedPlaceholder, setShowLockedPlaceholder] = useState(false);
  const [forceShowPassword, setForceShowPassword] = useState(false);

  const handleSelectNote = (id: string, passwordProtected?: boolean) => {
    setSelectedNoteId(id);
    setSidebarOpen(false);
    setIsDrawMode(false); // reset when switching notes
    setGlossaryTerms([]); // clear glossary terms when switching notes
    // If the selected note is password protected and not already unlocked,
    // show the locked placeholder instead of immediately prompting.
    const note = notes.find(n => n.id === id);
    const isUnlocked = note ? !!unlockedContents[note.id] : false;
    if (passwordProtected && !isUnlocked) {
      setShowLockedPlaceholder(true);
    } else {
      setShowLockedPlaceholder(false);
    }
  };

  const handleUnlockFromSidebar = (id: string) => {
    setSelectedNoteId(id);
    setForceShowPassword(true);
    setShowLockedPlaceholder(false);
  };

  // Clear the force flag after the selected note changes so AppHeader can react to it
  React.useEffect(() => {
    if (forceShowPassword) setForceShowPassword(false);
  }, [selectedNoteId]);

  const handleToggleDrawMode = () => {
    setIsDrawMode((prev) => !prev);
  };

  // AI feature handlers
  const handleSuggestTags = async () => {
    const merged = selectedNote ? (unlockedContents[selectedNote.id] ?? selectedNote.content) : '';
    if (!merged?.trim()) return;
    try {
      if (!selectedNote) return;
      const tags = await suggestTags(merged);
      if (tags && tags.length > 0) {
        const mergedTags = Array.from(new Set([...(selectedNote.tags || []), ...tags]));
        await updateNote({ id: selectedNote.id, tags: mergedTags });
      }
    } catch (error) {
      console.error('Error suggesting tags:', error);
    }
  };

  const handleGenerateSummary = async () => {
    const merged = selectedNote ? (unlockedContents[selectedNote.id] ?? selectedNote.content) : '';
    if (!merged?.trim()) return;
    try {
      if (!selectedNote) return;
      const summary = await generateSummary(merged);
      if (summary) {
        await updateNote({ id: selectedNote.id, summary });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const handleGrammarCheck = async () => {
    const merged = selectedNote ? (unlockedContents[selectedNote.id] ?? selectedNote.content) : '';
    if (!merged?.trim()) return;
    try {
      const corrected = await checkGrammar(merged);
      if (corrected) {
        console.log("Grammar check results:", corrected);
      }
    } catch (error) {
      console.error('Error checking grammar:', error);
    }
  };

  const handleGlossaryHighlight = async () => {
    const merged = selectedNote ? (unlockedContents[selectedNote.id] ?? selectedNote.content) : '';
    if (!merged?.trim()) return;
    try {
      const terms = await highlightGlossary(merged);
      if (terms && terms.length > 0) {
        setGlossaryTerms(terms);
        // Show success message to user
        alert(`Found ${terms.length} glossary terms! They are now highlighted in your note.`);
      } else {
        setGlossaryTerms([]);
        alert('No glossary terms found in this note.');
      }
    } catch (error) {
      console.error('Error highlighting glossary:', error);
      setGlossaryTerms([]);
      alert('Error analyzing glossary terms. Please try again.');
    }
  };

  const handleReadabilityCheck = async () => {
    const merged = selectedNote ? (unlockedContents[selectedNote.id] ?? selectedNote.content) : '';
    if (!merged?.trim()) return;
    try {
      const results = await checkReadability(merged);
      if (results) {
        console.log("Readability check results:", results);
      }
    } catch (error) {
      console.error('Error checking readability:', error);
    }
  };

  const clearGlossaryTerms = () => {
    setGlossaryTerms([]);
  };

  // Derived values for the currently selected note (used in JSX)
  const isSelectedUnlocked = selectedNote ? !!unlockedContents[selectedNote.id] : false;
  const selectedCurrentContent = selectedNote ? (unlockedContents[selectedNote.id] ?? selectedNote.content) : '';

  return (
    <div className="flex bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 flex-col bg-white/80 backdrop-blur-sm border-r border-slate-200/60 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-white/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              TakeNote
            </h1>
          </div>
          <button
            onClick={createNewNote}
            className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg hover:scale-105 transition"
            title="New Note"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200/60 bg-white/40">
          <div className="relative">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your notes..."
              className="w-full pl-3 pr-4 py-3 bg-white/80 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-hidden">
          <NotesSidebar
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelect={handleSelectNote}
            onUnlock={handleUnlockFromSidebar}
            unlockedContents={unlockedContents}
            onDelete={(id) =>
              window.confirm("Delete this note?") && deleteSelected(id)
            }
            onPinToggle={togglePin}
            onCreateNew={createNewNote}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
          />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 bg-white shadow-lg flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-bold text-lg">Notes</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes..."
                className="w-full p-2 border rounded"
              />
            </div>
            <NotesSidebar
              notes={notes}
              selectedNoteId={selectedNoteId}
              onSelect={handleSelectNote}
              onDelete={(id) =>
                window.confirm("Delete this note?") && deleteSelected(id)
              }
              onPinToggle={togglePin}
              onCreateNew={createNewNote}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-white shadow-sm">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold">TakeNote</h1>
          <button onClick={createNewNote}>
            <Plus size={20} />
          </button>
        </div>

        {selectedNote ? (
          <div className="p-4 md:p-8 flex flex-col gap-6">
            {/* If the selected note is password protected and we flagged showLockedPlaceholder,
                render a placeholder with an Unlock action instead of the editor. */}
            {selectedNote.passwordProtected && showLockedPlaceholder && !unlockedContents[selectedNote.id] ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200/60">
                {notes[0]?.id === selectedNote.id ? (
                  <>
                    <h3 className="text-lg font-semibold mb-2">This is your first note — it's locked</h3>
                    <p className="text-sm text-slate-500 mb-4">Since this is the first note, others will still see the note list. Click Unlock to view and edit this note.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-2">This note is locked</h3>
                    <p className="text-sm text-slate-500 mb-4">Click Unlock to enter the password and view this note's contents.</p>
                  </>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLockedPlaceholder(false)}
                    className="px-4 py-2 bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // open password modal via AppHeader by toggling unlocked content flow.
                      // We'll programmatically set showLockedPlaceholder false and rely on AppHeader
                      // to show the password modal when needed.
                      setShowLockedPlaceholder(false);
                      // Open the header modal by setting selectedNoteId again (AppHeader checks unlockedContent)
                      setSelectedNoteId(selectedNote.id);
                      // AppHeader will show its own password modal when appropriate
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Unlock
                  </button>
                </div>
              </div>
            ) : (
              <>
                <AppHeader
                  selectedNote={selectedNote}
                  updateNote={updateNote}
                  onToggleDrawMode={handleToggleDrawMode}
                  isDrawMode={isDrawMode}
                  glossaryTerms={glossaryTerms}
                  unlockedContent={selectedNote ? unlockedContents[selectedNote.id] ?? null : null}
                  setUnlockedContent={setUnlockedContent}
                  forceShowPasswordModal={forceShowPassword}
                />

                {isDrawMode ? (
                  <DrawCanvas
                    onSave={(dataUrl: string) => {
                      console.log('Canvas saved:', dataUrl);
                      // Here you could insert the drawing into the editor
                      // or save it as an attachment
                    }}
                    onCancel={() => setShowDrawingCanvas(false)}
                  />
                ) : (
                  <NoteEditor
                    title={selectedNote.title}
                    content={selectedCurrentContent}
                    tags={selectedNote.tags || []}
                    passwordProtected={!!selectedNote.passwordProtected}
                    isUnlocked={isSelectedUnlocked}
                    onTitleChange={(title) => updateNote({ id: selectedNote.id, title })}
                    onContentChange={(content) => {
                      // If the note is password-protected and unlocked, keep changes in-memory
                      // so plaintext isn't written to IndexedDB. Otherwise persist.
                      if (selectedNote.passwordProtected && isSelectedUnlocked) {
                        setUnlockedContent(selectedNote.id, content);
                      } else {
                        updateNote({ id: selectedNote.id, content });
                      }
                    }}
                    onTagsChange={(tags) => updateNote({ id: selectedNote.id, tags })}
                    aiLoading={aiLoading}
                    onSuggestTags={handleSuggestTags}
                    onGrammarCheck={handleGrammarCheck}
                    onGenerateSummary={handleGenerateSummary}
                    onGlossaryHighlight={handleGlossaryHighlight}
                    glossaryTerms={glossaryTerms}
                    onClearGlossaryTerms={clearGlossaryTerms}
                  />
                )}

                {selectedNote.summary && <SummaryBox summary={selectedNote.summary} />}
              </>
            )}
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <BookOpen size={48} className="mb-4 text-slate-400" />
            <h2 className="text-xl font-semibold mb-2">Welcome to TakeNote</h2>
            <p className="text-sm mb-4">
              Create your first note to get started.
            </p>
            <button
              onClick={createNewNote}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm"
            >
              Create Your First Note
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;

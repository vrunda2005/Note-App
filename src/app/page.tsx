"use client";

import React, { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
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
  } = useNotes();

  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);


  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    setSidebarOpen(false);
    setIsDrawMode(false); // reset when switching notes
  };

  const handleToggleDrawMode = () => {
    setIsDrawMode((prev) => !prev);
  };

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
            <AppHeader
              selectedNote={selectedNote}
              updateNote={updateNote}
              onToggleDrawMode={handleToggleDrawMode}
              isDrawMode={isDrawMode}
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
                content={selectedNote.content}
                tags={selectedNote.tags || []}
                passwordProtected={!!selectedNote.passwordProtected}
                onTitleChange={(title) =>
                  updateNote({ id: selectedNote.id, title })
                }
                onContentChange={(content) =>
                  updateNote({ id: selectedNote.id, content })
                }
                onTagsChange={(tags) =>
                  updateNote({ id: selectedNote.id, tags })
                }
                aiLoading={false}
                onSuggestTags={() => { }}
                onGrammarCheck={() => { }}
                onGenerateSummary={() => { }}
                onGlossaryHighlight={() => { }}
                glossaryTerms={[]}
              />
            )}

            {selectedNote.summary && <SummaryBox summary={selectedNote.summary} />}
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

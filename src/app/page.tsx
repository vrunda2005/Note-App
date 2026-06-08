"use client";

import React, { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import NotesSidebar from "@/components/NotesSidebar";
import NoteEditor from "@/components/NoteEditor";
import SummaryBox from "@/components/SummaryBox";
import AppHeader from "@/components/AppHeader";
import DrawCanvas from "@/components/DrawCanvas";
import { BookOpen, Plus, Menu, X, LogOut, User, Sparkles, Palette, Eye, BarChart2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAIFeatures } from "@/hooks/useAIFeatures";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Home: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
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

  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [glossaryTerms, setGlossaryTerms] = useState<string[]>([]);
  const [showLockedPlaceholder, setShowLockedPlaceholder] = useState(false);
  const [forceShowPassword, setForceShowPassword] = useState(false);
  
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [aiSidebarTab, setAiSidebarTab] = useState<'assistant' | 'analytics'>('assistant');
  const [grammarResults, setGrammarResults] = useState<string | null>(null);
  const [readabilityResults, setReadabilityResults] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{ totalRequests: number; tokensSaved: number } | null>(null);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (!analyticsData) {
      setAnalyticsData({
        totalRequests: Math.floor(Math.random() * 50) + 12,
        tokensSaved: (Math.floor(Math.random() * 500) + 120) * 4,
      });
    }
  }, [analyticsData]);

  // AI features hook initialized at the page level
  const {
    handleSuggestTags,
    handleGenerateSummary,
    handleGrammarCheck,
    handleGlossaryHighlight,
    handleReadabilityCheck,
    aiLoading,
  } = useAIFeatures({
    selectedNote: selectedNote,
    unlockedContent: selectedNote ? unlockedContents[selectedNote.id] : null,
    updateNote,
    onGlossaryTermsUpdate: setGlossaryTerms,
    onGrammarResultsUpdate: (results) => {
      setGrammarResults(results);
      setIsAiSidebarOpen(true);
      setAiSidebarTab('assistant');
    },
    onReadabilityResultsUpdate: (results) => {
      setReadabilityResults(results);
      setIsAiSidebarOpen(true);
      setAiSidebarTab('assistant');
    },
  });

  const handleSelectNote = (id: string, passwordProtected?: boolean) => {
    setSelectedNoteId(id);
    setSidebarOpen(false);
    setIsDrawMode(false); // reset when switching notes
    setGlossaryTerms([]); // clear glossary terms when switching notes
    setGrammarResults(null); // clear grammar results when switching
    setReadabilityResults(null); // clear readability results when switching
    
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

  const clearGlossaryTerms = () => {
    setGlossaryTerms([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 text-slate-500">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium animate-pulse">Checking your session...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Derived values for the currently selected note (used in JSX)
  const isSelectedUnlocked = selectedNote ? !!unlockedContents[selectedNote.id] : false;
  const selectedCurrentContent = selectedNote ? (unlockedContents[selectedNote.id] ?? selectedNote.content) : '';

  return (
    <div className="flex bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 font-sans overflow-hidden h-screen w-screen">
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

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200/60 bg-white/60">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 font-bold text-lg border border-white shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">{user.name}</span>
                  <span className="text-xs text-slate-500 truncate max-w-[120px]">{user.email}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-medium text-sm">
              <User size={18} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-80 bg-white shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">TakeNote</h2>
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
          <div
            className="flex-1 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-white shadow-sm flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold">TakeNote</h1>
          <button onClick={createNewNote}>
            <Plus size={20} />
          </button>
        </div>

        {selectedNote ? (
          <div className="flex-1 flex flex-col overflow-hidden h-full">
            {/* Header stays static at the top */}
            <AppHeader
              selectedNote={selectedNote}
              updateNote={updateNote}
              onToggleDrawMode={handleToggleDrawMode}
              isDrawMode={isDrawMode}
              isAiSidebarOpen={isAiSidebarOpen}
              onToggleAiSidebar={() => setIsAiSidebarOpen((prev) => !prev)}
              unlockedContent={selectedNote ? unlockedContents[selectedNote.id] ?? null : null}
              setUnlockedContent={setUnlockedContent}
              forceShowPasswordModal={forceShowPassword}
            />

            {/* Split view: editor and AI Copilot side-by-side */}
            <div className="flex-1 flex overflow-hidden relative h-full">
              
              {/* Editor Workspace */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">
                {selectedNote.passwordProtected && showLockedPlaceholder && !unlockedContents[selectedNote.id] ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200/60 max-w-2xl mx-auto my-auto shadow-sm">
                    {notes[0]?.id === selectedNote.id ? (
                      <>
                        <h3 className="text-lg font-semibold mb-2">This is your first note — it's locked</h3>
                        <p className="text-sm text-slate-500 mb-4 text-center">Since this is the first note, others will still see the note list. Click Unlock to view and edit this note.</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold mb-2">This note is locked</h3>
                        <p className="text-sm text-slate-500 mb-4 text-center">Click Unlock to enter the password and view this note's contents.</p>
                      </>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowLockedPlaceholder(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowLockedPlaceholder(false);
                          setSelectedNoteId(selectedNote.id);
                          setForceShowPassword(true);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                      >
                        Unlock
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {isDrawMode ? (
                      <DrawCanvas
                        onSave={(dataUrl: string) => {
                          const imgHtml = `<p><img src="${dataUrl}" alt="Drawing" class="max-w-full my-4 rounded-xl border border-slate-200 shadow-sm" /></p>`;
                          if (selectedNote) {
                            const newContent = selectedCurrentContent + imgHtml;
                            if (selectedNote.passwordProtected && isSelectedUnlocked) {
                              setUnlockedContent(selectedNote.id, newContent);
                            } else {
                              updateNote({ id: selectedNote.id, content: newContent });
                            }
                          }
                          setIsDrawMode(false);
                        }}
                        onCancel={() => setIsDrawMode(false)}
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

              {/* Right Sidebar: AI Copilot & Analytics */}
              {isAiSidebarOpen && (
                <aside className="w-80 border-l border-slate-200 bg-white/95 backdrop-blur-md flex flex-col h-full overflow-hidden flex-shrink-0 animate-in slide-in-from-right duration-200">
                  {/* Sidebar Header */}
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-purple-600 animate-pulse" size={20} />
                      <h3 className="font-bold text-slate-800">AI Copilot</h3>
                    </div>
                    <button
                      onClick={() => setIsAiSidebarOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Segmented Tab Control */}
                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                    <div className="flex bg-slate-200/60 p-1 rounded-xl">
                      <button
                        onClick={() => setAiSidebarTab('assistant')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          aiSidebarTab === 'assistant'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Sparkles size={13} />
                        Assistant
                      </button>
                      <button
                        onClick={() => setAiSidebarTab('analytics')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          aiSidebarTab === 'analytics'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <BarChart2 size={13} />
                        Analytics
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Sidebar Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {aiSidebarTab === 'assistant' ? (
                      <>
                        {/* Section 1: AI Operations */}
                        <div className="space-y-3 animate-in fade-in duration-200">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Actions</h4>
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              onClick={handleSuggestTags}
                              disabled={aiLoading}
                              className="flex items-center gap-3 w-full px-3.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50"
                            >
                              <Sparkles size={16} />
                              Suggest Tags
                            </button>
                            <button
                              onClick={handleGrammarCheck}
                              disabled={aiLoading}
                              className="flex items-center gap-3 w-full px-3.5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-95 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50"
                            >
                              <Palette size={16} />
                              Check Grammar
                            </button>
                            <button
                              onClick={handleReadabilityCheck}
                              disabled={aiLoading}
                              className="flex items-center gap-3 w-full px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50"
                            >
                              <Eye size={16} />
                              Analyze Readability
                            </button>
                            <button
                              onClick={handleGenerateSummary}
                              disabled={aiLoading}
                              className="flex items-center gap-3 w-full px-3.5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50"
                            >
                              <BookOpen size={16} />
                              Summarize Note
                            </button>
                            <button
                              onClick={handleGlossaryHighlight}
                              disabled={aiLoading}
                              className="flex items-center gap-3 w-full px-3.5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-95 text-amber-950 rounded-xl text-sm font-medium transition shadow-sm relative disabled:opacity-50"
                            >
                              <Sparkles size={16} />
                              Highlight Glossary
                              {glossaryTerms.length > 0 && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] rounded-full px-2 py-0.5 font-bold">
                                  {glossaryTerms.length}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Section 3: AI Live Output Cards */}
                        {(aiLoading || grammarResults || readabilityResults || selectedNote.summary || glossaryTerms.length > 0) && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Feedback</h4>
                            <div className="space-y-3">
                              {aiLoading && (
                                <div className="flex items-center justify-center py-8">
                                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="ml-3 text-xs text-slate-500 font-medium">AI is thinking...</span>
                                </div>
                              )}

                              {grammarResults && !aiLoading && (
                                <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-3.5 space-y-2 relative animate-in fade-in duration-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-violet-700">Grammar Check</span>
                                    <button
                                      onClick={() => setGrammarResults(null)}
                                      className="text-violet-400 hover:text-violet-600 font-bold"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                                    {grammarResults}
                                  </p>
                                </div>
                              )}

                              {readabilityResults && !aiLoading && (
                                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 space-y-2 relative animate-in fade-in duration-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-700">Readability Analysis</span>
                                    <button
                                      onClick={() => setReadabilityResults(null)}
                                      className="text-amber-400 hover:text-amber-600 font-bold"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                                    {readabilityResults}
                                  </p>
                                </div>
                              )}

                              {glossaryTerms.length > 0 && !aiLoading && (
                                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 space-y-2 relative animate-in fade-in duration-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-700">Glossary Highlights</span>
                                    <button
                                      onClick={clearGlossaryTerms}
                                      className="text-amber-400 hover:text-amber-600 font-bold"
                                      title="Clear glossary highlight"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {glossaryTerms.map((term, idx) => (
                                      <span key={idx} className="bg-amber-100/80 text-amber-900 text-[10px] px-2 py-0.5 rounded-lg font-medium border border-amber-200/50">
                                        {term}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedNote.summary && !aiLoading && (
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 space-y-2 relative animate-in fade-in duration-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-blue-700">Summary</span>
                                    <button
                                      onClick={() => updateNote({ id: selectedNote.id, summary: "" })}
                                      className="text-blue-400 hover:text-blue-600 font-bold"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  <div
                                    className="text-xs text-slate-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: selectedNote.summary }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      analyticsData && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Usage Analytics</h4>
                          <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4 space-y-4 shadow-sm">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white border border-slate-200/60 p-3 rounded-xl shadow-xs">
                                <div className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">Requests</div>
                                <div className="text-xl font-bold text-slate-800 mt-0.5">
                                  {analyticsData.totalRequests}
                                </div>
                              </div>
                              <div className="bg-white border border-slate-200/60 p-3 rounded-xl shadow-xs">
                                <div className="text-[9px] text-purple-600 font-bold uppercase tracking-wider">Tokens Saved</div>
                                <div className="text-xl font-bold text-slate-800 mt-0.5">
                                  {analyticsData.tokensSaved}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2.5 pt-2 border-t border-slate-200/40">
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500 font-medium">Avg. Response Time</span>
                                  <span className="font-bold text-green-600">~450ms</span>
                                </div>
                                <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-green-500 h-full rounded-full" style={{ width: '85%' }}></div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500 font-medium">Success Rate</span>
                                  <span className="font-bold text-blue-600">99.8%</span>
                                </div>
                                <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '99%' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </aside>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <BookOpen size={48} className="mb-4 text-slate-400" />
            <h2 className="text-xl font-semibold mb-2">Welcome to TakeNote</h2>
            <p className="text-sm mb-4">
              Create your note to get started.
            </p>
            <button
              onClick={createNewNote}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm"
            >
              Create Your Note
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;

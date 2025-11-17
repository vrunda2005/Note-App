import React from 'react';
import { type Note } from '@/types';
import { Plus, Search, Pin, PinOff, Trash2, Clock, FileText, Lock } from 'lucide-react';

interface Props {
    notes: Note[];
    selectedNoteId: string | null;
    onSelect: (id: string, passwordProtected?: boolean) => void;
    onUnlock?: (id: string) => void;
    unlockedContents?: Record<string, string>;
    onDelete: (id: string) => void;
    onPinToggle: (id: string) => void;
    onCreateNew: () => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
}

const NotesSidebar: React.FC<Props> = ({
    notes,
    selectedNoteId,
    onSelect,
    onDelete,
    onPinToggle,
    onCreateNew,
    searchTerm,
    onSearchTermChange,
    onUnlock,
    unlockedContents,
}) => {
    const filteredNotes = notes.filter((note) => {
        const lcTerm = searchTerm.toLowerCase();
        const titleMatch = note.title.toLowerCase().includes(lcTerm);
        const contentMatch = note.content.toLowerCase().includes(lcTerm);
        return titleMatch || contentMatch;
    });


    filteredNotes.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.lastModified - a.lastModified;
    });

    const stripHTMLAndDecode = (html: string) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    };


    const formatDate = (timestamp: number) => {
        const now = new Date();
        const noteDate = new Date(timestamp);
        const diffInHours = (now.getTime() - noteDate.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return noteDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: noteDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    return (
        <div className="flex-1 overflow-y-auto">
            {/* Notes List */}
            <div className="p-4 space-y-2">
                {filteredNotes.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100/60 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={24} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">No notes found</p>
                        <p className="text-slate-400 text-xs mt-1">Create your note </p>
                    </div>
                )}

                {filteredNotes.map((note) => (
                    <div
                        key={note.id}
                        onClick={() => onSelect(note.id, note.passwordProtected)}
                        className={`group p-4 cursor-pointer rounded-xl border transition-all duration-200 hover:shadow-md ${selectedNoteId === note.id
                            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-300/40 shadow-lg'
                            : 'bg-white/60 hover:bg-white/80 border-slate-200/40 hover:border-slate-300/60'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {note.pinned && (
                                        <Pin size={14} className="text-amber-500 flex-shrink-0" />
                                    )}
                                    {note.passwordProtected && (
                                        <Lock size={14} className="text-slate-500 flex-shrink-0" />
                                    )}
                                    <h3 className={`font-semibold truncate text-sm ${selectedNoteId === note.id
                                        ? 'text-slate-800'
                                        : 'text-slate-700'
                                        }`}>
                                        {note.title || 'Untitled Note'}
                                    </h3>
                                    {unlockedContents && unlockedContents[note.id] && (
                                        <span className="ml-2 inline-flex items-center text-emerald-700 text-xs font-semibold">Unlocked</span>
                                    )}
                                </div>

                                {/* Content Preview */}
                                {note.passwordProtected ? (
                                    <p className="text-xs text-amber-700 truncate max-w-full mb-2">Locked — enter password to view</p>
                                ) : (
                                    <p className="text-xs text-slate-500 truncate max-w-full mb-2">
                                        {stripHTMLAndDecode(note.content).substring(0, 60)}
                                        {stripHTMLAndDecode(note.content).length > 60 && '...'}
                                    </p>
                                )}
                                {/* <p className="text-xs text-slate-500 truncate max-w-full mb-2">
                                    {note.content.replace(/<[^>]*>/g, '').substring(0, 60)}
                                    {note.content.replace(/<[^>]*>/g, '').length > 60 && '...'}
                                </p> */}

                                {/* Tags */}
                                {note.tags && note.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {note.tags.slice(0, 2).map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-block bg-blue-100/60 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium border border-blue-200/40"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {note.tags.length > 2 && (
                                            <span className="inline-block bg-slate-100/60 text-slate-600 px-2 py-0.5 rounded-md text-xs font-medium border border-slate-200/40">
                                                +{note.tags.length - 2}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Time */}
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Clock size={12} />
                                    <span>{formatDate(note.lastModified)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPinToggle(note.id);
                                }}
                                title={note.pinned ? 'Unpin note' : 'Pin note'}
                                className={`p-2 rounded-lg transition-all duration-200 ${note.pinned
                                    ? 'text-amber-600 hover:bg-amber-100/60'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/60'
                                    }`}
                            >
                                {note.pinned ? <Pin size={16} /> : <PinOff size={16} />}
                            </button>
                            {note.passwordProtected && onUnlock && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUnlock(note.id);
                                    }}
                                    title="Unlock note"
                                    aria-label="Unlock note"
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    <Lock size={16} />
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(note.id);
                                }}
                                title="Delete note"
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100/60 rounded-lg transition-all duration-200"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotesSidebar;

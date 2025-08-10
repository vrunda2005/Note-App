import React from 'react';
import { type Note } from '@/types';
import { Plus, Search, Pin, PinOff, Trash2 } from 'lucide-react';

interface Props {
    notes: Note[];
    selectedNoteId: string | null;
    onSelect: (id: string) => void;
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

    return (
        <div className="w-72 bg-gray-900 text-white flex flex-col border-r border-gray-800">
            {/* Create Note Button */}
            {/* <div className="p-3 border-b border-gray-800">
                <button
                    onClick={onCreateNew}
                    className="flex items-center gap-2 w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    <Plus size={16} />
                    New Note
                </button>
            </div> */}

            {/* Search Bar */}
            {/* <div className="p-3 border-b border-gray-800">
                <div className="flex items-center bg-gray-800 rounded px-2 py-1">
                    <Search size={16} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        className="bg-transparent outline-none text-sm text-gray-200 ml-2 flex-1"
                    />
                </div>
            </div> */}

            {/* Notes List */}
            <div className="overflow-y-auto flex-grow">
                {filteredNotes.length === 0 && (
                    <p className="p-4 text-gray-400 text-sm">No notes found.</p>
                )}
                {filteredNotes.map((note) => (
                    <div
                        key={note.id}
                        onClick={() => onSelect(note.id)}
                        className={`p-3 cursor-pointer flex justify-between items-center border-b border-gray-800 transition
              ${selectedNoteId === note.id
                                ? 'bg-blue-600'
                                : 'hover:bg-gray-800'
                            }`}
                    >
                        <div>
                            <div className="font-semibold truncate max-w-[150px]">
                                {note.title || 'Untitled'}
                            </div>
                            <div className="text-xs text-gray-400 truncate max-w-[150px]">
                                {new Date(note.lastModified).toLocaleString()}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPinToggle(note.id);
                                }}
                                title={note.pinned ? 'Unpin note' : 'Pin note'}
                                className="text-gray-400 hover:text-white transition"
                            >
                                {note.pinned ? <Pin size={16} /> : <PinOff size={16} />}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(note.id);
                                }}
                                title="Delete note"
                                className="text-red-400 hover:text-red-600 transition"
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

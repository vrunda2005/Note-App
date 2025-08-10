import React from 'react';
import { type Note } from '@/types';


interface Props {
    notes: Note[];
    selectedNoteId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onPinToggle: (id: string) => void;
    searchTerm: string;
    onSearchTermChange: (t: string) => void;
}

export default function NotesList({ notes, selectedNoteId, onSelect, onDelete, onPinToggle, searchTerm, onSearchTermChange }: Props) {
    return (
        <aside className="w-72 bg-white border-r flex flex-col">
            <div className="p-3 border-b">
                <input value={searchTerm} onChange={e => onSearchTermChange(e.target.value)} placeholder="Search notes..." className="w-full p-2 border rounded" />
            </div>
            <div className="overflow-y-auto flex-1">
                {notes.length === 0 && <div className="p-4 text-gray-500">No notes yet. Click + New Note to create.</div>}
                {notes.map(n => (
                    <div key={n.id} onClick={() => onSelect(n.id)} className={`p-3 cursor-pointer border-b ${selectedNoteId === n.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                            <div className="w-44 truncate font-semibold">{n.title || 'Untitled'}</div>
                            <div className="flex items-center gap-2">
                                {n.pinned && <span title="Pinned">📌</span>}
                                <button onClick={(e) => { e.stopPropagation(); onPinToggle(n.id); }} className="text-xs">Pin</button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(n.id); }} className="text-red-600 text-xs">Delete</button>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(n.lastModified).toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </aside>
    );
}

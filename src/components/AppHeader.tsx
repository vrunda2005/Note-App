import { Plus, Lock } from 'lucide-react';
import { type Note } from '@/types';
interface Props {
    selectedNote: Note | null;
    onCreateNewNote: () => void;
    onProtectNote: () => void;
    lockIcon: React.ReactNode; // <-- ADD THIS LINE

}

export default function AppHeader({ selectedNote, onCreateNewNote, onProtectNote }: Props) {
    return (
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
            <div className="flex items-center gap-3">
                {/* New Note */}
                <button
                    onClick={onCreateNewNote}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    <Plus size={16} />
                    New Note
                </button>

                {/* Protect Note */}
                {selectedNote && !selectedNote.passwordProtected && (
                    <button
                        onClick={onProtectNote}
                        className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                    >
                        <Lock size={16} />
                        Protect Note
                    </button>
                )}
            </div>

            <div className="text-sm text-gray-500">Notes App</div>
        </div>
    );
}

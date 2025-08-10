import React, { useState } from "react";
import {
    Lock,
    LockOpen,
    Sparkles,
    Palette,
    BookOpen,
    PenTool,
    ArrowLeft,
} from "lucide-react";
import PasswordModal from "@/components/PasswordModal";
import { useNotes } from "@/hooks/useNotes";
import { Note } from "@/types";
import { useAI } from "@/hooks/useAI";

interface AppHeaderProps {
    selectedNote: Note;
    updateNote: (note: Partial<Note> & { id: string }) => Promise<void>;
    onToggleDrawMode: () => void;
    isDrawMode: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
    selectedNote,
    updateNote,
    onToggleDrawMode,
    isDrawMode,
}) => {
    const { encryptNote, decryptNote } = useNotes();
    const [passwordModal, setPasswordModal] = useState(false);
    const [decryptionError, setDecryptionError] = useState("");
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [aiToolsOpen, setAiToolsOpen] = useState(false);
    const { aiLoading, generateSummary, suggestTags, checkGrammar, highlightGlossary } = useAI();

    /** -------------------------
     * Password Protect / Unlock
     * -------------------------- */
    const handleEncryptNote = async () => {
        const password = prompt("Enter a password to protect this note:");
        if (password) await encryptNote(selectedNote, password);
    };

    const handlePasswordSubmit = async (password: string) => {
        setIsDecrypting(true);
        try {
            const decrypted = await decryptNote(selectedNote, password);
            if (decrypted !== null) {
                updateNote({
                    id: selectedNote.id,
                    content: decrypted,
                    passwordProtected: false,
                    encryptedContent: undefined,
                });
                setPasswordModal(false);
            } else {
                setDecryptionError("Incorrect password");
            }
        } finally {
            setIsDecrypting(false);
        }
    };

    /** -------------------------
     * AI Tool Handlers
     * -------------------------- */
    const handleSuggestTags = async () => {
        const tags = await suggestTags(selectedNote.content || "");
        if (tags) {
            await updateNote({ id: selectedNote.id, tags });
        }
    };


    const handleGenerateSummary = async () => {
        const summary = await generateSummary(selectedNote.content || "");
        if (summary) {
            await updateNote({ id: selectedNote.id, summary });
        }
    };

    const handleGrammarCheck = async () => {
        const corrected = await checkGrammar(selectedNote.content || "");
        if (corrected) {
            console.log("Corrected", corrected);

        }
    };


    const handleGlossaryHighlight = async () => {
        const terms = await highlightGlossary(selectedNote.content || "");
        if (terms) {
            console.log("Glossary terms found:", terms);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Header Row */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold truncate">
                    {selectedNote.title || "Untitled"}
                </h2>

                <div className="flex items-center gap-2">
                    {/* Draw Mode Toggle */}
                    <button
                        onClick={onToggleDrawMode}
                        className={`p-2 rounded-lg transition ${isDrawMode
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-slate-200 hover:bg-slate-300"
                            }`}
                        title={isDrawMode ? "Back to text mode" : "Switch to draw mode"}
                    >
                        {isDrawMode ? <ArrowLeft size={18} /> : <PenTool size={18} />}
                    </button>

                    {/* AI Tools Toggle */}
                    <button
                        onClick={() => setAiToolsOpen((prev) => !prev)}
                        className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90"
                        title="AI Tools"
                    >
                        <Sparkles size={18} />
                    </button>

                    {/* Lock/Unlock Button */}
                    <button
                        onClick={() =>
                            selectedNote.passwordProtected
                                ? setPasswordModal(true)
                                : handleEncryptNote()
                        }
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        title={selectedNote.passwordProtected ? "Unlock Note" : "Protect Note"}
                    >
                        {selectedNote.passwordProtected ? (
                            <LockOpen size={18} />
                        ) : (
                            <Lock size={18} />
                        )}
                    </button>
                </div>
            </div>

            {/* AI Tools Panel */}
            {aiToolsOpen && (
                <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/40 rounded-2xl p-4 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Sparkles size={22} className="text-blue-600" />
                        AI-Powered Tools
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                            onClick={handleSuggestTags}
                            disabled={aiLoading}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs md:text-sm"
                        >
                            <Sparkles size={16} />
                            Suggest Tags
                        </button>
                        <button
                            onClick={handleGrammarCheck}
                            disabled={aiLoading}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg text-xs md:text-sm"
                        >
                            <Palette size={16} />
                            Check Grammar
                        </button>
                        <button
                            onClick={handleGenerateSummary}
                            disabled={aiLoading}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-xs md:text-sm"
                        >
                            <BookOpen size={16} />
                            Summarize
                        </button>
                        <button
                            onClick={handleGlossaryHighlight}
                            disabled={aiLoading}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-amber-900 rounded-lg text-xs md:text-sm"
                        >
                            <Sparkles size={16} />
                            Glossary
                        </button>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {passwordModal && (
                <PasswordModal
                    passwordError={decryptionError}
                    isLoading={isDecrypting}
                    onSubmit={handlePasswordSubmit}
                    onCancel={() => setPasswordModal(false)}
                />
            )}
        </div>
    );
};

export default AppHeader;

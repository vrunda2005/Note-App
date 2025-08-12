import React, { useState, useEffect } from "react";
import {
    Lock,
    LockOpen,
    Sparkles,
    Palette,
    BookOpen,
    PenTool,
    ArrowLeft,
    Download,
    Share2,
    FileText,
    Eye,
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
    glossaryTerms: string[];
}

const AppHeader: React.FC<AppHeaderProps> = ({
    selectedNote,
    updateNote,
    onToggleDrawMode,
    isDrawMode,
    glossaryTerms,
}) => {
    const { encryptNote, decryptNote } = useNotes();
    const [passwordModal, setPasswordModal] = useState(false);
    const [decryptionError, setDecryptionError] = useState("");
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [aiToolsOpen, setAiToolsOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [grammarResults, setGrammarResults] = useState<string | null>(null);
    const [readabilityResults, setReadabilityResults] = useState<string | null>(null);
    const { aiLoading, generateSummary, suggestTags, checkGrammar, highlightGlossary, checkReadability } = useAI();

    // Clear AI results when switching notes
    useEffect(() => {
        setGrammarResults(null);
        setReadabilityResults(null);
        setAiToolsOpen(false);
    }, [selectedNote.id]);

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
        const results = await checkGrammar(selectedNote.content || "");
        if (results) {
            setGrammarResults(results);
        }
    };

    const handleGlossaryHighlight = async () => {
        const terms = await highlightGlossary(selectedNote.content || "");
        if (terms) {
            // Show success message to user
            alert(`Found ${terms.length} glossary terms! They are now highlighted in your note.`);
        }
    };

    const handleReadabilityCheck = async () => {
        const results = await checkReadability(selectedNote.content || "");
        if (results) {
            setReadabilityResults(results);
        }
    };

    /** -------------------------
     * PDF Export & Share
     * -------------------------- */
    const exportToPDF = async () => {
        try {
            // Dynamic import to avoid SSR issues
            const jsPDF = (await import('jspdf')).default;

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const maxWidth = pageWidth - (margin * 2);

            // Add title
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(selectedNote.title || 'Untitled Note', margin, 30);

            // Add content (strip HTML tags)
            const plainText = selectedNote.content?.replace(/<[^>]*>/g, '') || '';
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');

            // Split text into lines that fit the page width
            const lines = doc.splitTextToSize(plainText, maxWidth);
            let yPosition = 50;

            lines.forEach((line: string) => {
                if (yPosition > doc.internal.pageSize.getHeight() - 20) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, margin, yPosition);
                yPosition += 7;
            });

            // Add metadata
            doc.setFontSize(10);
            doc.text(`Created: ${new Date(selectedNote.lastModified).toLocaleDateString()}`, margin, yPosition + 10);
            if (selectedNote.tags && selectedNote.tags.length > 0) {
                doc.text(`Tags: ${selectedNote.tags.join(', ')}`, margin, yPosition + 20);
            }

            // Save the PDF
            doc.save(`${selectedNote.title || 'note'}.pdf`);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            alert('Failed to export PDF. Please try again.');
        }
    };

    const shareNote = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: selectedNote.title || 'Note',
                    text: selectedNote.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            setShareModalOpen(true);
        }
    };

    const copyToClipboard = async () => {
        try {
            const noteText = `${selectedNote.title || 'Untitled'}\n\n${selectedNote.content?.replace(/<[^>]*>/g, '') || ''}`;
            await navigator.clipboard.writeText(noteText);
            alert('Note copied to clipboard!');
            setShareModalOpen(false);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            alert('Failed to copy to clipboard');
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
                    {/* PDF Export */}
                    <button
                        onClick={exportToPDF}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="Export to PDF"
                    >
                        <Download size={18} />
                    </button>

                    {/* Share Note */}
                    <button
                        onClick={shareNote}
                        className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        title="Share Note"
                    >
                        <Share2 size={18} />
                    </button>

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

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                            onClick={handleReadabilityCheck}
                            disabled={aiLoading}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-xs md:text-sm"
                        >
                            <Eye size={16} />
                            Readability
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
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-amber-900 rounded-lg text-xs md:text-sm relative"
                        >
                            <Sparkles size={16} />
                            Glossary
                            {glossaryTerms && glossaryTerms.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {glossaryTerms.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Grammar Check Results */}
            {grammarResults && (
                <div className="bg-gradient-to-r from-violet-50/80 to-purple-50/80 border border-violet-200/40 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-semibold text-slate-800 flex items-center gap-2">
                            <Palette size={20} className="text-violet-600" />
                            Grammar & Spelling Check
                        </h4>
                        <button
                            onClick={() => setGrammarResults(null)}
                            className="text-violet-600 hover:text-violet-800 p-1 rounded"
                        >
                            ×
                        </button>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-line">
                        {grammarResults}
                    </div>
                </div>
            )}

            {/* Readability Check Results */}
            {readabilityResults && (
                <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/40 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-semibold text-slate-800 flex items-center gap-2">
                            <Eye size={20} className="text-amber-600" />
                            Readability Analysis
                        </h4>
                        <button
                            onClick={() => setReadabilityResults(null)}
                            className="text-amber-600 hover:text-amber-800 p-1 rounded"
                        >
                            ×
                        </button>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-line">
                        {readabilityResults}
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {shareModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Share2 size={22} className="text-purple-600" />
                            Share Note
                        </h3>
                        <p className="text-slate-600 mb-4">
                            Copy this note to your clipboard to share it with others.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={copyToClipboard}
                                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                Copy to Clipboard
                            </button>
                            <button
                                onClick={() => setShareModalOpen(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
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
